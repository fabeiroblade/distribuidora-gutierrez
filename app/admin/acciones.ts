'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { clienteAdministrador, clienteServidor } from '@/lib/supabase';
import { perfilActual } from '@/lib/sesion';
import type { Rol } from '@/lib/types';

export type Resultado = { ok: true; mensaje?: string } | { ok: false; error: string };

/** Refresca el sitio público para que el cambio se vea al instante. */
function refrescarSitio() {
  revalidatePath('/');
  revalidatePath('/admin/productos');
}

/** Convierte un texto libre en un identificador apto para URL y para la base. */
export async function aIdentificador(texto: string): Promise<string> {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------

export async function entrar(_previo: Resultado | null, datos: FormData): Promise<Resultado> {
  const correo = String(datos.get('correo') ?? '').trim();
  const clave = String(datos.get('clave') ?? '');

  if (!correo || !clave) return { ok: false, error: 'Escribe tu correo y tu contraseña.' };

  const sb = clienteServidor();
  const { error } = await sb.auth.signInWithPassword({ email: correo, password: clave });

  if (error) {
    // El mensaje de Supabase viene en inglés y es muy técnico.
    return {
      ok: false,
      error:
        error.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : 'No se pudo entrar: ' + error.message,
    };
  }

  redirect(String(datos.get('volver') || '/admin'));
}

export async function salir() {
  const sb = clienteServidor();
  await sb.auth.signOut();
  redirect('/admin/login');
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

/** Lee del formulario los campos comunes de alta y edición. */
function leerProducto(datos: FormData) {
  const precioTexto = String(datos.get('precio') ?? '').trim();

  // La galería llega como una URL por línea; la primera es la portada.
  const imagenes = String(datos.get('imagenes') ?? '')
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    nombre: String(datos.get('nombre') ?? '').trim(),
    descripcion: String(datos.get('descripcion') ?? '').trim(),
    categoria: String(datos.get('categoria') ?? '').trim(),
    imagenes,
    // Se mantiene por separado para que el resto del sitio (portadas de
    // categoría, datos para Google) siga teniendo una imagen principal directa.
    imagen: imagenes[0] ?? '',
    // Vacío significa "Precios según presentación", no cero.
    precio: precioTexto === '' ? null : Number(precioTexto),
    presentaciones: String(datos.get('presentaciones') ?? '')
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean),
    destacado: datos.get('destacado') === 'on',
    activo: datos.get('activo') === 'on',
  };
}

export async function guardarProducto(
  _previo: Resultado | null,
  datos: FormData
): Promise<Resultado> {
  if (!(await perfilActual())) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' };

  const campos = leerProducto(datos);
  const idExistente = String(datos.get('id') ?? '').trim();

  if (!campos.nombre) return { ok: false, error: 'El producto necesita un nombre.' };
  if (!campos.categoria) return { ok: false, error: 'Elige una categoría.' };
  if (campos.imagenes.length === 0) {
    return { ok: false, error: 'Sube al menos una foto del producto.' };
  }
  if (campos.precio !== null && Number.isNaN(campos.precio)) {
    return { ok: false, error: 'El precio debe ser un número, o quedar vacío para cotizar.' };
  }

  const sb = clienteServidor();

  if (idExistente) {
    const { error } = await sb.from('productos').update(campos).eq('id', idExistente);
    if (error) return { ok: false, error: 'No se pudo guardar: ' + error.message };
  } else {
    const id = await aIdentificador(campos.nombre);
    if (!id) return { ok: false, error: 'Ese nombre no sirve para generar un identificador.' };

    const { error } = await sb.from('productos').insert({ ...campos, id });

    if (error) {
      return {
        ok: false,
        error:
          error.code === '23505'
            ? 'Ya existe un producto con ese nombre. Cámbialo un poco.'
            : 'No se pudo crear: ' + error.message,
      };
    }
  }

  refrescarSitio();
  redirect('/admin/productos?guardado=1');
}

export async function borrarProducto(
  _previo: Resultado | null,
  datos: FormData
): Promise<Resultado> {
  if (!(await perfilActual())) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' };

  const id = String(datos.get('id') ?? '');
  const sb = clienteServidor();

  const { error } = await sb.from('productos').delete().eq('id', id);
  if (error) return { ok: false, error: 'No se pudo eliminar: ' + error.message };

  refrescarSitio();
  redirect('/admin/productos?eliminado=1');
}

/** Publica o esconde un producto sin salir de la lista. */
export async function alternarActivo(id: string, activo: boolean): Promise<Resultado> {
  if (!(await perfilActual())) return { ok: false, error: 'Tu sesión expiró. Vuelve a entrar.' };

  const sb = clienteServidor();
  const { error } = await sb.from('productos').update({ activo }).eq('id', id);

  if (error) return { ok: false, error: error.message };

  refrescarSitio();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Usuarios — solo el administrador
// ---------------------------------------------------------------------------

export async function crearUsuario(
  _previo: Resultado | null,
  datos: FormData
): Promise<Resultado> {
  const yo = await perfilActual();
  if (yo?.rol !== 'admin') return { ok: false, error: 'Solo el administrador puede crear usuarios.' };

  const correo = String(datos.get('correo') ?? '').trim().toLowerCase();
  const clave = String(datos.get('clave') ?? '');
  const nombre = String(datos.get('nombre') ?? '').trim();
  const rol = String(datos.get('rol') ?? 'editor') as Rol;

  if (!correo.includes('@')) return { ok: false, error: 'Ese correo no parece válido.' };
  if (clave.length < 8) return { ok: false, error: 'La contraseña necesita al menos 8 caracteres.' };
  if (!nombre) return { ok: false, error: 'Escribe el nombre de la persona.' };
  if (rol !== 'admin' && rol !== 'editor') return { ok: false, error: 'Rol no válido.' };

  // Crear usuarios exige privilegios de administración, que la sesión normal
  // no tiene: por eso este es el único lugar que usa la clave de servicio.
  const admin = clienteAdministrador();

  const { error } = await admin.auth.admin.createUser({
    email: correo,
    password: clave,
    email_confirm: true, // sin correo de confirmación: lo da de alta el jefe
    user_metadata: { nombre, rol },
  });

  if (error) {
    return {
      ok: false,
      error: error.message.includes('already been registered')
        ? 'Ya existe un usuario con ese correo.'
        : 'No se pudo crear: ' + error.message,
    };
  }

  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios?creado=1');
}

export async function cambiarRol(_previo: Resultado | null, datos: FormData): Promise<Resultado> {
  const yo = await perfilActual();
  if (yo?.rol !== 'admin') return { ok: false, error: 'Solo el administrador puede cambiar roles.' };

  const id = String(datos.get('id') ?? '');
  const rol = String(datos.get('rol') ?? '') as Rol;

  if (id === yo.id) {
    return { ok: false, error: 'No puedes quitarte a ti mismo el rol de administrador.' };
  }

  const sb = clienteServidor();
  const { error } = await sb.from('perfiles').update({ rol }).eq('id', id);

  if (error) return { ok: false, error: 'No se pudo cambiar el rol: ' + error.message };

  revalidatePath('/admin/usuarios');
  return { ok: true, mensaje: 'Rol actualizado.' };
}

export async function eliminarUsuario(
  _previo: Resultado | null,
  datos: FormData
): Promise<Resultado> {
  const yo = await perfilActual();
  if (yo?.rol !== 'admin') return { ok: false, error: 'Solo el administrador puede eliminar usuarios.' };

  const id = String(datos.get('id') ?? '');
  if (id === yo.id) return { ok: false, error: 'No puedes eliminar tu propia cuenta.' };

  const admin = clienteAdministrador();
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) return { ok: false, error: 'No se pudo eliminar: ' + error.message };

  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios?eliminado=1');
}
