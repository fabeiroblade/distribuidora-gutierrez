import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { perfilActual } from '@/lib/sesion';
import { supabaseConfigurado } from '@/lib/supabase';
import { salir } from './acciones';

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s | Panel Distribuidora Gutiérrez' },
  robots: { index: false, follow: false },
};

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  // Sin credenciales el panel no puede funcionar. Conviene decirlo con todas
  // sus letras: si no, Supabase lanza un error y sale un 500 sin explicación.
  if (!supabaseConfigurado) return <FaltaConfigurar />;

  const perfil = await perfilActual();

  // La página de ingreso usa este layout pero todavía no hay sesión.
  if (!perfil) return <>{children}</>;

  const enlaces = [
    { href: '/admin', texto: 'Inicio' },
    { href: '/admin/productos', texto: 'Productos' },
    { href: '/admin/categorias', texto: 'Categorías' },
    ...(perfil.rol === 'admin' ? [{ href: '/admin/usuarios', texto: 'Usuarios' }] : []),
  ];

  return (
    <div className="min-h-[100svh] superficie-2">
      <header className="border-b borde-sutil bg-white dark:bg-ink-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white ring-1 ring-black/5">
              <Image src="/monograma-dg.png" alt="" width={352} height={320} className="h-6 w-auto" />
            </span>
            <span className="font-display text-sm font-extrabold leading-tight">
              Panel
              <span className="block text-[0.65rem] font-bold uppercase tracking-wider texto-suave">
                {perfil.rol === 'admin' ? 'Administrador' : 'Encargado'}
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {enlaces.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="rounded-lg px-3 py-2 text-sm font-bold transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                {e.texto}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden text-xs font-bold texto-suave hover:text-brand-700 sm:block"
            >
              Ver el sitio ↗
            </Link>
            <span className="hidden text-xs texto-suave md:block">{perfil.correo}</span>
            <form action={salir}>
              <button
                type="submit"
                className="rounded-lg border borde-sutil px-3 py-2 text-xs font-bold transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}

function FaltaConfigurar() {
  return (
    <main className="grid min-h-[100svh] place-items-center px-5 py-16">
      <div className="max-w-lg rounded-2xl border borde-sutil bg-white p-8 dark:bg-ink-900">
        <h1 className="font-display text-xl font-extrabold">Falta conectar la base de datos</h1>
        <p className="mt-3 text-sm leading-relaxed texto-suave">
          El panel necesita las credenciales de Supabase. El sitio público sigue funcionando
          mientras tanto, mostrando el catálogo guardado en el proyecto.
        </p>

        <p className="mt-5 text-xs font-extrabold uppercase tracking-wider texto-suave">
          Variables que faltan
        </p>
        <ul className="mt-3 space-y-1.5 font-mono text-xs">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          <li>SUPABASE_SERVICE_ROLE_KEY</li>
        </ul>

        <p className="mt-5 text-sm leading-relaxed texto-suave">
          Se copian de Supabase, en <strong>Project Settings → API</strong>. En tu computadora van
          en <code className="font-mono text-xs">.env.local</code>; en producción, en las variables
          de entorno de Vercel. Después hay que reiniciar o volver a desplegar.
        </p>
      </div>
    </main>
  );
}
