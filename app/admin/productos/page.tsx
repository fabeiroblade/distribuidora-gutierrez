import Image from 'next/image';
import Link from 'next/link';
import { exigirSesion } from '@/lib/sesion';
import { clienteServidor } from '@/lib/supabase';
import { formatearPrecio } from '@/lib/productos';
import type { Categoria, Producto } from '@/lib/types';
import { InterruptorActivo } from '@/components/admin/InterruptorActivo';
import { Aviso } from '@/components/admin/Aviso';

export const metadata = { title: 'Productos' };

export default async function ListaProductos({
  searchParams,
}: {
  searchParams: { guardado?: string; eliminado?: string };
}) {
  await exigirSesion();
  const sb = clienteServidor();

  const [prod, cat] = await Promise.all([
    sb.from('productos').select('*').order('categoria').order('nombre'),
    sb.from('categorias').select('*').order('orden').order('nombre'),
  ]);

  const productos = (prod.data ?? []) as Producto[];
  const categorias = (cat.data ?? []) as Categoria[];
  const nombreCategoria = Object.fromEntries(categorias.map((c) => [c.id, c.nombre]));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Productos</h1>
          <p className="mt-1.5 text-sm texto-suave">{productos.length} en el catálogo</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600"
        >
          Agregar producto
        </Link>
      </div>

      {searchParams.guardado && <Aviso>Producto guardado. Ya se ve en el sitio.</Aviso>}
      {searchParams.eliminado && <Aviso>Producto eliminado.</Aviso>}

      {prod.error && (
        <p className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          No se pudo leer el catálogo: {prod.error.message}
        </p>
      )}

      {productos.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed borde-sutil px-6 py-16 text-center">
          <p className="font-display text-lg font-bold">Todavía no hay productos</p>
          <p className="mx-auto mt-2 max-w-sm text-sm texto-suave">
            Si acabas de crear la base de datos, corre primero la migración para traer los 55
            productos que ya existían.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {productos.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border borde-sutil bg-white p-3.5 dark:bg-ink-900"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl superficie-2">
                <Image src={p.imagen} alt="" fill sizes="64px" className="object-cover" unoptimized />
              </div>

              <div className="min-w-[12rem] flex-1">
                <p className="text-sm font-bold leading-snug">{p.nombre}</p>
                <p className="mt-1 text-xs texto-suave">
                  {nombreCategoria[p.categoria] ?? p.categoria} · {formatearPrecio(p.precio)}
                  {p.destacado && ' · Más pedido'}
                </p>
              </div>

              <InterruptorActivo id={p.id} activo={p.activo ?? true} />

              <Link
                href={`/admin/productos/${p.id}`}
                className="rounded-lg border borde-sutil px-3.5 py-2 text-xs font-bold transition-colors hover:border-brand-500 hover:text-brand-700"
              >
                Editar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
