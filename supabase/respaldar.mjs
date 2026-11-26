/**
 * Descarga una copia local de todo lo que vive en Supabase:
 * tablas del catálogo, perfiles, lista de usuarios y todas las imágenes.
 *
 *   node --env-file=.env.local supabase/respaldar.mjs [carpeta-destino]
 *
 * Por defecto guarda en ../respaldos/supabase-AAAA-MM-DD/ (fuera del repo,
 * para que nunca se suba a Git). Solo lee: no modifica nada en Supabase.
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.
 */
import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !CLAVE) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const hoy = new Date().toISOString().slice(0, 10);
const DESTINO = path.resolve(process.argv[2] ?? path.join(RAIZ, '..', 'respaldos', `supabase-${hoy}`));
const BUCKET = 'productos';
const TABLAS = ['categorias', 'productos', 'perfiles'];

const sb = createClient(URL, CLAVE, { auth: { persistSession: false } });

async function guardarJson(rel, datos) {
  const ruta = path.join(DESTINO, rel);
  await mkdir(path.dirname(ruta), { recursive: true });
  await writeFile(ruta, JSON.stringify(datos, null, 2), 'utf8');
}

/** Lee una tabla completa, de 1000 en 1000 filas. */
async function leerTabla(tabla) {
  const filas = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await sb.from(tabla).select('*').range(desde, desde + 999);
    if (error) throw new Error(`${tabla}: ${error.message}`);
    filas.push(...data);
    if (data.length < 1000) return filas;
  }
}

/** Lista todos los archivos del bucket, entrando en subcarpetas. */
async function listarArchivos(prefijo = '') {
  const archivos = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await sb.storage
      .from(BUCKET)
      .list(prefijo, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw new Error(`storage ${prefijo || '/'}: ${error.message}`);
    for (const item of data) {
      const ruta = prefijo ? `${prefijo}/${item.name}` : item.name;
      if (item.id === null) archivos.push(...(await listarArchivos(ruta)));
      else archivos.push({ ruta, bytes: item.metadata?.size ?? null, actualizado: item.updated_at });
    }
    if (data.length < 1000) return archivos;
  }
}

async function main() {
  console.log(`Respaldando ${URL}\n→ ${DESTINO}\n`);
  await mkdir(DESTINO, { recursive: true });
  const resumen = { fecha: new Date().toISOString(), proyecto: URL, tablas: {}, usuarios: 0, imagenes: 0, fallidas: [] };

  for (const tabla of TABLAS) {
    const filas = await leerTabla(tabla);
    await guardarJson(`base/${tabla}.json`, filas);
    resumen.tablas[tabla] = filas.length;
    console.log(`  tabla ${tabla}: ${filas.length} filas`);
  }

  // Usuarios del panel: solo datos de cuenta. Supabase nunca entrega contraseñas.
  const usuarios = [];
  for (let page = 1; ; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`usuarios: ${error.message}`);
    usuarios.push(
      ...data.users.map((u) => ({
        id: u.id,
        email: u.email,
        creado: u.created_at,
        ultimo_ingreso: u.last_sign_in_at,
      }))
    );
    if (data.users.length < 1000) break;
  }
  await guardarJson('base/usuarios.json', usuarios);
  resumen.usuarios = usuarios.length;
  console.log(`  usuarios: ${usuarios.length}`);

  const archivos = await listarArchivos();
  await guardarJson('imagenes/_indice.json', archivos);
  for (const [i, { ruta }] of archivos.entries()) {
    const { data, error } = await sb.storage.from(BUCKET).download(ruta);
    if (error) {
      resumen.fallidas.push({ ruta, error: error.message });
      continue;
    }
    const destino = path.join(DESTINO, 'imagenes', BUCKET, ruta);
    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, Buffer.from(await data.arrayBuffer()));
    resumen.imagenes++;
    process.stdout.write(`\r  imágenes: ${i + 1}/${archivos.length}`);
  }
  console.log();

  await guardarJson('resumen.json', resumen);
  console.log(`\nListo. ${resumen.imagenes} imágenes, ${resumen.fallidas.length} fallidas.`);
  if (resumen.fallidas.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error('\nError:', e.message);
  process.exit(1);
});
