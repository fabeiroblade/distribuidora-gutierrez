/**
 * Lleva a Supabase el catálogo que hoy vive en data/ y public/productos/.
 *
 *   node --env-file=.env.local supabase/migrar.mjs
 *
 * Se puede correr varias veces sin duplicar nada: las filas se insertan con
 * upsert y las imágenes se suben con upsert también. Requiere que el esquema
 * ya esté creado (supabase/esquema.sql) y la clave de servicio en .env.local.
 */
import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !CLAVE) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

// La clave de servicio se salta las políticas por fila, que es lo que hace
// falta para sembrar la base sin estar conectado como usuario del panel.
const sb = createClient(URL, CLAVE, { auth: { persistSession: false } });

const leerJson = async (rel) => JSON.parse(await readFile(path.join(RAIZ, rel), 'utf8'));

async function subirImagenes() {
  const carpeta = path.join(RAIZ, 'public', 'productos');
  const archivos = (await readdir(carpeta)).filter((f) => f.endsWith('.jpg'));
  const urls = {};

  let subidas = 0;
  for (const archivo of archivos) {
    const contenido = await readFile(path.join(carpeta, archivo));

    const { error } = await sb.storage.from('productos').upload(archivo, contenido, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
      upsert: true,
    });

    if (error) {
      console.error(`  ✗ ${archivo}: ${error.message}`);
      continue;
    }

    urls['/productos/' + archivo] = sb.storage.from('productos').getPublicUrl(archivo).data.publicUrl;
    subidas++;
    if (subidas % 10 === 0) console.log(`  ${subidas}/${archivos.length}…`);
  }

  console.log(`  ${subidas} de ${archivos.length} imágenes en el almacén`);
  return urls;
}

async function main() {
  console.log('Imágenes');
  const urls = await subirImagenes();

  console.log('\nCategorías');
  const categorias = await leerJson('data/categorias.json');
  const { error: errorCat } = await sb.from('categorias').upsert(
    categorias.map((c, i) => ({ ...c, orden: i })),
    { onConflict: 'id' }
  );
  if (errorCat) throw new Error('categorías: ' + errorCat.message);
  console.log(`  ${categorias.length} categorías`);

  console.log('\nProductos');
  const productos = await leerJson('data/productos.json');
  const filas = productos.map((p, i) => ({
    ...p,
    // Si la imagen ya se subió, queda apuntando al almacén; si no, se respeta
    // la ruta local para no dejar el producto sin foto.
    imagen: urls[p.imagen] ?? p.imagen,
    activo: true,
    orden: i,
  }));

  const { error: errorProd } = await sb.from('productos').upsert(filas, { onConflict: 'id' });
  if (errorProd) throw new Error('productos: ' + errorProd.message);
  console.log(`  ${filas.length} productos`);

  const sinSubir = filas.filter((f) => f.imagen.startsWith('/productos/'));
  if (sinSubir.length) {
    console.log(`\n  Atención: ${sinSubir.length} productos quedaron con la imagen local.`);
  }

  console.log('\nListo. Revisa el catálogo en /admin/productos');
}

main().catch((e) => {
  console.error('\nFalló la migración:', e.message);
  process.exit(1);
});
