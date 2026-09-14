'use client';

import { useState, useTransition } from 'react';
import { alternarActivo } from '@/app/admin/acciones';

/**
 * Publica u oculta un producto sin salir de la lista. Cambia el aspecto de
 * inmediato y lo revierte si el guardado falla, para que el estado que se ve
 * siempre corresponda a lo que hay en la base.
 */
export function InterruptorActivo({ id, activo }: { id: string; activo: boolean }) {
  const [puesto, setPuesto] = useState(activo);
  const [pendiente, empezar] = useTransition();

  function alternar() {
    const siguiente = !puesto;
    setPuesto(siguiente);

    empezar(async () => {
      const r = await alternarActivo(id, siguiente);
      if (!r.ok) {
        setPuesto(!siguiente);
        alert(r.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={pendiente}
      aria-pressed={puesto}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
        puesto
          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
          : 'superficie-2 texto-suave hover:bg-ink-200 dark:hover:bg-ink-700'
      }`}
      title={puesto ? 'Se ve en el sitio. Clic para ocultar.' : 'Oculto. Clic para publicar.'}
    >
      {puesto ? 'Publicado' : 'Oculto'}
    </button>
  );
}
