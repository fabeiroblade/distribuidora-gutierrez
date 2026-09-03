import categoriasJson from '@/data/categorias.json';
import productosJson from '@/data/productos.json';
import type { Categoria, Producto } from './types';

export const categorias = categoriasJson as Categoria[];
export const productos = productosJson as Producto[];

/** Familias de alto nivel, en el orden en que aparecen en data/categorias.json. */
export const grupos = Array.from(new Set(categorias.map((c) => c.grupo)));

export function contarPorCategoria(): Record<string, number> {
  return productos.reduce<Record<string, number>>((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] ?? 0) + 1;
    return acc;
  }, {});
}

export function formatearPrecio(precio: number | null): string {
  if (precio === null) return 'Precio de mayoreo';
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(precio);
}
