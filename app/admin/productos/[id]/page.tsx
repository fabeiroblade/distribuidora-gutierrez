import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigirSesion } from '@/lib/sesion';
import { clienteServidor } from '@/lib/supabase';
import type { Categoria, Producto } from '@/lib/types';
import { FormularioProducto } from '@/components/admin/FormularioProducto';

export const metadata = { title: 'Editar producto' };

export default async function EditarProducto({ params }: { params: { id: string } }) {
  await exigirSesion();

  const sb = clienteServidor();
  const [prod, cat] = await Promise.all([
    sb.from('productos').select('*').eq('id', params.id).single(),
    sb.from('categorias').select('*').order('orden').order('nombre'),
  ]);

  if (!prod.data) notFound();

  const producto = {
    ...(prod.data as Producto),
    precio: prod.data.precio === null ? null : Number(prod.data.precio),
  };

  return (
    <>
      <Link href="/admin/productos" className="text-sm font-bold texto-suave hover:underline">
        ← Productos
      </Link>
      <h1 className="mt-3 font-display text-2xl font-extrabold">{producto.nombre}</h1>

      <FormularioProducto producto={producto} categorias={(cat.data ?? []) as Categoria[]} />
    </>
  );
}
