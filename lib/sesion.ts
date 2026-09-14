import 'server-only';

import { redirect } from 'next/navigation';
import { clienteServidor } from './supabase';
import type { Perfil, Rol } from './types';

/** Perfil de quien está conectado, o null si no hay sesión. */
export async function perfilActual(): Promise<Perfil | null> {
  const sb = clienteServidor();

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) return null;

  const { data } = await sb.from('perfiles').select('id, nombre, rol').eq('id', user.id).single();

  if (!data) return null;

  return { ...(data as Omit<Perfil, 'correo'>), correo: user.email ?? '' };
}

/**
 * Exige sesión para ver la página. Si además se pasa un rol, exige ese rol.
 * Devuelve el perfil para no tener que volver a consultarlo.
 */
export async function exigirSesion(rol?: Rol): Promise<Perfil> {
  const perfil = await perfilActual();

  if (!perfil) redirect('/admin/login');
  if (rol && perfil.rol !== rol) redirect('/admin');

  return perfil;
}
