import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const CLAVE_PUBLICA = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Sin credenciales el sitio sigue en pie, solo que sin catálogo ni panel. */
export const supabaseConfigurado = URL.length > 0 && CLAVE_PUBLICA.length > 0;

/**
 * Cliente para componentes y acciones de servidor. Lee la sesión de las
 * cookies, así que respeta el rol de quien esté conectado.
 */
export function clienteServidor() {
  const almacen = cookies();

  return createServerClient(URL, CLAVE_PUBLICA, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (nuevas) => {
        try {
          nuevas.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          // Los Server Components no pueden escribir cookies; el refresco de
          // sesión lo hace el middleware. Aquí se ignora sin consecuencias.
        }
      },
    },
  });
}

/**
 * Cliente con la clave de servicio: se salta las políticas por fila.
 *
 * Solo para crear y eliminar usuarios, que exige privilegios de administración.
 * La clave da acceso total a la base de datos, por eso este módulo es
 * server-only y nunca debe alcanzarse desde el navegador.
 */
export function clienteAdministrador() {
  const claveServicio = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!claveServicio) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY. Sin ella no se pueden crear ni eliminar usuarios.'
    );
  }

  return createClient(URL, claveServicio, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
