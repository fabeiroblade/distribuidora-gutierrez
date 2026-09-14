import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente para componentes que corren en el navegador.
 *
 * Vive aparte del de servidor a propósito: aquel importa next/headers, y si
 * ambos compartieran archivo, cualquier componente de navegador arrastraría
 * código de servidor y el build fallaría.
 */
export function clienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );
}
