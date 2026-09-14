'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useFormState } from 'react-dom';
import { borrarCategoria, moverCategoria, type Resultado } from '@/app/admin/acciones';
import type { Categoria } from '@/lib/types';

export function FilaCategoria({
  categoria,
  productos,
  primera,
  ultima,
}: {
  categoria: Categoria;
  productos: number;
  primera: boolean;
  ultima: boolean;
}) {
  const [borrado, accionBorrar] = useFormState<Resultado | null, FormData>(borrarCategoria, null);
  const [moviendo, empezar] = useTransition();

  const mover = (salto: number) => empezar(() => void moverCategoria(categoria.id, salto));

  return (
    <li className="rounded-2xl border borde-sutil bg-white p-4 dark:bg-ink-900">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="text-2xl" aria-hidden="true">
          {categoria.emoji}
        </span>

        <div className="min-w-[10rem] flex-1">
          <p className="text-sm font-bold">{categoria.nombre}</p>
          <p className="mt-0.5 text-xs texto-suave">
            {categoria.grupo} · {productos} {productos === 1 ? 'producto' : 'productos'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => mover(-1)}
            disabled={primera || moviendo}
            aria-label="Subir"
            className="grid h-8 w-8 place-items-center rounded-lg border borde-sutil text-xs font-bold transition-colors hover:bg-ink-100 disabled:opacity-30 dark:hover:bg-ink-800"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            disabled={ultima || moviendo}
            aria-label="Bajar"
            className="grid h-8 w-8 place-items-center rounded-lg border borde-sutil text-xs font-bold transition-colors hover:bg-ink-100 disabled:opacity-30 dark:hover:bg-ink-800"
          >
            ↓
          </button>
        </div>

        <Link
          href={`/admin/categorias?editar=${categoria.id}`}
          className="rounded-lg border borde-sutil px-3.5 py-2 text-xs font-bold transition-colors hover:border-brand-500 hover:text-brand-700"
        >
          Editar
        </Link>

        <form action={accionBorrar}>
          <input type="hidden" name="id" value={categoria.id} />
          <button
            type="submit"
            onClick={(e) => {
              if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) e.preventDefault();
            }}
            className="rounded-lg border borde-sutil px-3 py-2 text-xs font-bold text-brand-600 transition-colors hover:border-brand-500"
          >
            Eliminar
          </button>
        </form>
      </div>

      {borrado && !borrado.ok && (
        <p className="mt-3 text-xs font-bold text-brand-600">{borrado.error}</p>
      )}
    </li>
  );
}
