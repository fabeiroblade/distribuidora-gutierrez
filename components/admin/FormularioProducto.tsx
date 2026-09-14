'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { borrarProducto, guardarProducto, type Resultado } from '@/app/admin/acciones';
import type { Categoria, Producto } from '@/lib/types';
import { SubirImagenes } from './SubirImagenes';

const campo =
  'mt-2 w-full rounded-xl border borde-sutil superficie-2 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500';
const etiqueta = 'block text-xs font-extrabold uppercase tracking-wider texto-suave';

function Guardar({ nuevo }: { nuevo: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
    >
      {pending ? 'Guardando…' : nuevo ? 'Crear producto' : 'Guardar cambios'}
    </button>
  );
}

function Eliminar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm('¿Eliminar este producto? No se puede deshacer.')) e.preventDefault();
      }}
      className="text-xs font-bold text-brand-600 underline-offset-4 hover:underline disabled:opacity-60"
    >
      {pending ? 'Eliminando…' : 'Eliminar producto'}
    </button>
  );
}

export function FormularioProducto({
  producto,
  categorias,
}: {
  producto?: Producto;
  categorias: Categoria[];
}) {
  const [estado, accion] = useFormState<Resultado | null, FormData>(guardarProducto, null);
  const [borrado, accionBorrar] = useFormState<Resultado | null, FormData>(borrarProducto, null);
  // Los productos creados antes de la galería solo traen la portada suelta.
  const [imagenes, setImagenes] = useState<string[]>(
    producto?.imagenes?.length ? producto.imagenes : producto?.imagen ? [producto.imagen] : []
  );

  const nuevo = !producto;
  const fallo = (estado && !estado.ok && estado.error) || (borrado && !borrado.ok && borrado.error);

  return (
    <>
      <form action={accion} className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
        {producto && <input type="hidden" name="id" value={producto.id} />}
        <input type="hidden" name="imagenes" value={imagenes.join('\n')} />

        <div>
          <span className={etiqueta}>Fotos</span>
          <div className="mt-2">
            <SubirImagenes valor={imagenes} onCambio={setImagenes} />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="nombre" className={etiqueta}>
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              defaultValue={producto?.nombre}
              placeholder="Depósito transparente 1 oz con tapadera"
              className={campo}
            />
          </div>

          <div>
            <label htmlFor="descripcion" className={etiqueta}>
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              defaultValue={producto?.descripcion}
              placeholder="Para qué sirve y qué lo distingue"
              className={campo}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="categoria" className={etiqueta}>
                Categoría
              </label>
              <select
                id="categoria"
                name="categoria"
                required
                defaultValue={producto?.categoria ?? ''}
                className={campo}
              >
                <option value="" disabled>
                  Elegir…
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="precio" className={etiqueta}>
                Precio
              </label>
              <input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                min="0"
                defaultValue={producto?.precio ?? ''}
                placeholder="Vacío = cotizar"
                className={campo}
              />
              <p className="mt-1.5 text-xs texto-suave">
                Déjalo vacío y la tarjeta dirá «Precios según presentación».
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="presentaciones" className={etiqueta}>
              Presentaciones
            </label>
            <textarea
              id="presentaciones"
              name="presentaciones"
              rows={3}
              defaultValue={producto?.presentaciones.join('\n')}
              placeholder={'Caja de 1,800 unidades\nPaquete de 100 unidades'}
              className={campo}
            />
            <p className="mt-1.5 text-xs texto-suave">Una por línea.</p>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 text-sm font-semibold">
              <input
                type="checkbox"
                name="destacado"
                defaultChecked={producto?.destacado}
                className="h-4 w-4 accent-brand-700"
              />
              Marcar como «Más pedido»
            </label>

            <label className="flex items-center gap-2.5 text-sm font-semibold">
              <input
                type="checkbox"
                name="activo"
                defaultChecked={producto ? (producto.activo ?? true) : true}
                className="h-4 w-4 accent-brand-700"
              />
              Visible en el sitio
            </label>
          </div>

          {fallo && (
            <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {fallo}
            </p>
          )}

          <div className="flex items-center gap-4 pt-2">
            <Guardar nuevo={nuevo} />
            <Link href="/admin/productos" className="text-sm font-bold texto-suave hover:underline">
              Cancelar
            </Link>
          </div>
        </div>
      </form>

      {producto && (
        <form action={accionBorrar} className="mt-10 border-t borde-sutil pt-6">
          <input type="hidden" name="id" value={producto.id} />
          <Eliminar />
        </form>
      )}
    </>
  );
}
