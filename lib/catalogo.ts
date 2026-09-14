import 'server-only';

import categoriasSemilla from '@/data/categorias.json';
import productosSemilla from '@/data/productos.json';
import { clienteServidor, supabaseConfigurado } from './supabase';
import type { Catalogo, Categoria, Producto } from './types';

/**
 * Lectura del catálogo para el sitio público.
 *
 * Si Supabase no está configurado o la consulta falla, se devuelven los JSON de
 * data/ como respaldo. Así el sitio nunca sale vacío: ni durante la migración,
 * ni si algún día la base no responde.
 */
export async function obtenerCatalogo(): Promise<Catalogo> {
  const respaldo: Catalogo = {
    categorias: categoriasSemilla as Categoria[],
    productos: productosSemilla as Producto[],
  };

  if (!supabaseConfigurado) return respaldo;

  try {
    const sb = clienteServidor();

    const [cat, prod] = await Promise.all([
      sb.from('categorias').select('*').order('orden').order('nombre'),
      sb.from('productos').select('*').eq('activo', true).order('orden').order('nombre'),
    ]);

    if (cat.error || prod.error) {
      console.error('Catálogo desde Supabase:', cat.error ?? prod.error);
      return respaldo;
    }

    // Una base recién creada devuelve listas vacías; ahí conviene el respaldo.
    if (!cat.data?.length || !prod.data?.length) return respaldo;

    return {
      categorias: cat.data as Categoria[],
      productos: (prod.data as Producto[]).map((p) => ({
        ...p,
        // Postgres entrega numeric como cadena; el formateador espera número.
        precio: p.precio === null ? null : Number(p.precio),
      })),
    };
  } catch (error) {
    console.error('Catálogo desde Supabase:', error);
    return respaldo;
  }
}
