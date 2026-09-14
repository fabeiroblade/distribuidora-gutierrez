import { exigirSesion } from '@/lib/sesion';
import { clienteServidor } from '@/lib/supabase';
import type { Categoria, Producto } from '@/lib/types';
import { FormularioCategoria } from '@/components/admin/FormularioCategoria';
import { FilaCategoria } from '@/components/admin/FilaCategoria';
import { Aviso } from '@/components/admin/Aviso';

export const metadata = { title: 'Categorías' };

export default async function Categorias({
  searchParams,
}: {
  searchParams: { guardado?: string; eliminado?: string; editar?: string };
}) {
  await exigirSesion();
  const sb = clienteServidor();

  const [cat, prod] = await Promise.all([
    sb.from('categorias').select('*').order('orden').order('nombre'),
    sb.from('productos').select('id,categoria'),
  ]);

  const categorias = (cat.data ?? []) as Categoria[];
  const productos = (prod.data ?? []) as Pick<Producto, 'id' | 'categoria'>[];

  const conteos = productos.reduce<Record<string, number>>((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] ?? 0) + 1;
    return acc;
  }, {});

  const grupos = Array.from(new Set(categorias.map((c) => c.grupo)));
  const enEdicion = categorias.find((c) => c.id === searchParams.editar);

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold">Categorías</h1>
      <p className="mt-2 max-w-2xl text-sm texto-suave">
        Son los filtros que ve el cliente en el catálogo. El orden de esta lista es el orden en que
        aparecen en el sitio.
      </p>

      {searchParams.guardado && <Aviso>Categoría guardada.</Aviso>}
      {searchParams.eliminado && <Aviso>Categoría eliminada.</Aviso>}

      {cat.error && (
        <p className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          No se pudo leer la lista: {cat.error.message}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <ul className="space-y-3">
          {categorias.map((c, i) => (
            <FilaCategoria
              key={c.id}
              categoria={c}
              productos={conteos[c.id] ?? 0}
              primera={i === 0}
              ultima={i === categorias.length - 1}
            />
          ))}
        </ul>

        <div className="rounded-2xl border borde-sutil bg-white p-6 dark:bg-ink-900">
          <h2 className="font-display text-lg font-extrabold">
            {enEdicion ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <p className="mt-1.5 text-sm texto-suave">
            {enEdicion
              ? 'Los productos que ya la usan mantienen su vínculo.'
              : 'Aparecerá como filtro en el catálogo en cuanto tenga productos.'}
          </p>
          <FormularioCategoria categoria={enEdicion} grupos={grupos} existentes={categorias} />
        </div>
      </div>
    </>
  );
}
