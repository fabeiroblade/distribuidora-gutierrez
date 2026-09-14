import Link from 'next/link';
import { exigirSesion } from '@/lib/sesion';
import { clienteServidor } from '@/lib/supabase';

export default async function Inicio() {
  const perfil = await exigirSesion();
  const sb = clienteServidor();

  const [total, publicados, categorias] = await Promise.all([
    sb.from('productos').select('id', { count: 'exact', head: true }),
    sb.from('productos').select('id', { count: 'exact', head: true }).eq('activo', true),
    sb.from('categorias').select('id', { count: 'exact', head: true }),
  ]);

  const ocultos = (total.count ?? 0) - (publicados.count ?? 0);

  const cifras = [
    { valor: total.count ?? 0, etiqueta: 'Productos en total' },
    { valor: publicados.count ?? 0, etiqueta: 'Publicados en el sitio' },
    { valor: ocultos, etiqueta: 'Ocultos' },
    { valor: categorias.count ?? 0, etiqueta: 'Categorías' },
  ];

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold">Hola, {perfil.nombre}</h1>
      <p className="mt-2 text-sm texto-suave">
        Desde aquí administras el catálogo que ve el público.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cifras.map((c) => (
          <div
            key={c.etiqueta}
            className="rounded-2xl border borde-sutil bg-white p-5 dark:bg-ink-900"
          >
            <dt className="font-display text-3xl font-extrabold">{c.valor}</dt>
            <dd className="mt-1 text-xs font-bold uppercase tracking-wider texto-suave">
              {c.etiqueta}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/productos/nuevo"
          className="rounded-2xl bg-brand-700 p-6 text-white transition-colors hover:bg-brand-600"
        >
          <p className="font-display text-lg font-extrabold">Agregar un producto</p>
          <p className="mt-1.5 text-sm text-white/80">
            Sube la foto, escribe la descripción y queda publicado
          </p>
        </Link>

        <Link
          href="/admin/productos"
          className="rounded-2xl border borde-sutil bg-white p-6 transition-colors hover:border-brand-500 dark:bg-ink-900"
        >
          <p className="font-display text-lg font-extrabold">Ver el catálogo</p>
          <p className="mt-1.5 text-sm texto-suave">Editar, ocultar o eliminar lo que ya existe</p>
        </Link>
      </div>

      {perfil.rol === 'admin' && (
        <div className="mt-4 rounded-2xl border borde-sutil bg-white p-6 dark:bg-ink-900">
          <p className="font-display text-lg font-extrabold">Usuarios</p>
          <p className="mt-1.5 text-sm texto-suave">
            Como administrador puedes dar de alta a quien vaya a manejar el catálogo.{' '}
            <Link href="/admin/usuarios" className="font-bold text-brand-700 hover:underline">
              Administrar usuarios
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
