import type { Categoria, Producto } from './types';

/**
 * Funciones puras sobre el catálogo. Sin acceso a datos, para que puedan
 * usarse igual desde el servidor y desde los componentes de navegador.
 */

export function gruposDe(categorias: Categoria[]): string[] {
  return Array.from(new Set(categorias.map((c) => c.grupo)));
}

export function contarPorCategoria(productos: Producto[]): Record<string, number> {
  return productos.reduce<Record<string, number>>((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] ?? 0) + 1;
    return acc;
  }, {});
}

export function formatearPrecio(precio: number | null): string {
  if (precio === null) return 'Precios según presentación';
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(precio);
}
