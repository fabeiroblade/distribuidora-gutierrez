'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { guardarCategoria, type Resultado } from '@/app/admin/acciones';
import type { Categoria } from '@/lib/types';

const campo =
  'mt-2 w-full rounded-xl border borde-sutil superficie-2 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500';
const etiqueta = 'block text-xs font-extrabold uppercase tracking-wider texto-suave';

function Boton({ nueva, repetida }: { nueva: boolean; repetida: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || repetida}
      className="mt-5 w-full rounded-xl bg-brand-700 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
    >
      {pending ? 'Guardando…' : nueva ? 'Crear categoría' : 'Guardar cambios'}
    </button>
  );
}

/** Mismo criterio que usa el servidor para generar el identificador. */
const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function FormularioCategoria({
  categoria,
  grupos,
  existentes,
}: {
  categoria?: Categoria;
  grupos: string[];
  existentes: Categoria[];
}) {
  const [estado, accion] = useFormState<Resultado | null, FormData>(guardarCategoria, null);
  const [nombre, setNombre] = useState(categoria?.nombre ?? '');
  const nueva = !categoria;

  // Avisa mientras se escribe, sin esperar a que el servidor lo rechace.
  const repetida = existentes.find(
    (c) => c.id !== categoria?.id && c.id === normalizar(nombre.trim())
  );

  return (
    <form action={accion} className="mt-5" key={categoria?.id ?? 'nueva'}>
      {categoria && <input type="hidden" name="id" value={categoria.id} />}

      <label htmlFor="nombre-cat" className={etiqueta}>
        Nombre
      </label>
      <input
        id="nombre-cat"
        name="nombre"
        required
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Vasos"
        className={`${campo} ${repetida ? 'border-brand-500' : ''}`}
      />
      {repetida && (
        <p className="mt-1.5 text-xs font-bold text-brand-600">
          Ya existe «{repetida.nombre}». Ese nombre daría la misma categoría.
        </p>
      )}

      <label htmlFor="grupo-cat" className={`${etiqueta} mt-4`}>
        Línea
      </label>
      <input
        id="grupo-cat"
        name="grupo"
        required
        list="grupos-existentes"
        defaultValue={categoria?.grupo}
        placeholder="Desechables"
        className={campo}
      />
      {/* Sugiere las líneas que ya existen, pero deja escribir una nueva. */}
      <datalist id="grupos-existentes">
        {grupos.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>
      <p className="mt-1.5 text-xs texto-suave">
        Agrupa los filtros de arriba del catálogo. Hoy son Desechables y Limpieza.
      </p>

      <label htmlFor="emoji-cat" className={`${etiqueta} mt-4`}>
        Icono
      </label>
      <input
        id="emoji-cat"
        name="emoji"
        maxLength={4}
        defaultValue={categoria?.emoji}
        placeholder="🥤"
        className={`${campo} text-center text-xl`}
      />
      <p className="mt-1.5 text-xs texto-suave">
        Un emoji. Se ve en el filtro y en la tarjeta de la categoría.
      </p>

      {estado && !estado.ok && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {estado.error}
        </p>
      )}

      <Boton nueva={nueva} repetida={!!repetida} />

      {categoria && (
        <Link
          href="/admin/categorias"
          className="mt-3 block text-center text-xs font-bold texto-suave hover:underline"
        >
          Cancelar edición
        </Link>
      )}
    </form>
  );
}
