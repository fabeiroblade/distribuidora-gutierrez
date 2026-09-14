import Link from 'next/link';
import { exigirSesion } from '@/lib/sesion';
import { clienteServidor } from '@/lib/supabase';
import type { Categoria } from '@/lib/types';
import { FormularioProducto } from '@/components/admin/FormularioProducto';

export const metadata = { title: 'Nuevo producto' };

export default async function NuevoProducto() {
  await exigirSesion();

  const sb = clienteServidor();
  const { data } = await sb.from('categorias').select('*').order('orden').order('nombre');

  return (
    <>
      <Link href="/admin/productos" className="text-sm font-bold texto-suave hover:underline">
        ← Productos
      </Link>
      <h1 className="mt-3 font-display text-2xl font-extrabold">Nuevo producto</h1>

      <FormularioProducto categorias={(data ?? []) as Categoria[]} />
    </>
  );
}
