import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Mantiene viva la sesión y cierra el paso al panel.
 *
 * El refresco del token tiene que ocurrir aquí: los Server Components no
 * pueden escribir cookies, así que sin middleware la sesión caduca sola y el
 * encargado se ve expulsado a mitad de trabajo.
 */
export async function middleware(peticion: NextRequest) {
  let respuesta = NextResponse.next({ request: peticion });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin credenciales no hay panel que proteger; el sitio público sigue igual.
  if (!url || !clave) return respuesta;

  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll: () => peticion.cookies.getAll(),
      setAll: (nuevas) => {
        nuevas.forEach(({ name, value }) => peticion.cookies.set(name, value));
        respuesta = NextResponse.next({ request: peticion });
        nuevas.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ruta = peticion.nextUrl.pathname;
  const esLogin = ruta === '/admin/login';

  if (ruta.startsWith('/admin') && !esLogin && !user) {
    const destino = peticion.nextUrl.clone();
    destino.pathname = '/admin/login';
    // Para devolverlo a donde iba una vez que entre.
    destino.searchParams.set('volver', ruta);
    return NextResponse.redirect(destino);
  }

  if (esLogin && user) {
    const destino = peticion.nextUrl.clone();
    destino.pathname = '/admin';
    destino.search = '';
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

export const config = {
  matcher: ['/admin/:path*'],
};
