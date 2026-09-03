'use client';

import Image from 'next/image';
import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { mensajes, whatsappUrl } from '@/lib/contacto';
import { formatearPrecio } from '@/lib/productos';
import type { Producto } from '@/lib/types';
import { IconoWhatsApp } from './Iconos';

type Props = {
  producto: Producto;
  categoria?: string;
  /** Las primeras filas del grid se cargan con prioridad; el resto va diferido. */
  prioritaria?: boolean;
  /**
   * Solo tras montar en el navegador. En el render del servidor debe quedar en
   * false: con `initial` activo, framer escribe opacity:0 en el HTML y la
   * tarjeta se queda invisible si el JavaScript no llega a hidratar.
   */
  animar?: boolean;
};

/**
 * Va con forwardRef porque AnimatePresence en modo popLayout mide el nodo real
 * al salir; sin el ref, React advierte y la animacion de salida no se aplica.
 */
export const TarjetaProducto = forwardRef<HTMLDivElement, Props>(function TarjetaProducto(
  { producto, categoria, prioritaria = false, animar = false },
  ref
) {
  const reducido = useReducedMotion();

  return (
    <motion.article
      ref={ref}
      layout
      initial={animar ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reducido ? undefined : { y: -8 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border borde-sutil bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover dark:bg-ink-900"
    >
      {/* Imagen — el zoom vive en el <Image>, el contenedor recorta el desborde */}
      <div className="relative aspect-square overflow-hidden bg-ink-50 dark:bg-ink-800">
        <Image
          src={producto.imagen}
          alt={producto.nombre}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading={prioritaria ? 'eager' : 'lazy'}
          priority={prioritaria}
          className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] will-change-transform group-hover:scale-[1.12]"
        />

        {/* Velo que aparece al hacer hover, para que el boton se lea sobre la foto */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {producto.destacado && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-wider text-ink-950 shadow-sm">
            Más pedido
          </span>
        )}

        {/* En movil la tarjeta mide ~160px: el nombre de la categoria taparia
            la foto entera, y ya se sabe cual es por el filtro activo. */}
        {categoria && (
          <span className="absolute right-3 top-3 hidden rounded-full bg-white/90 px-2.5 py-1 text-[0.62rem] font-bold text-ink-700 backdrop-blur-sm dark:bg-ink-950/85 dark:text-ink-200 sm:block">
            {categoria}
          </span>
        )}

        <a
          href={whatsappUrl(mensajes.producto(producto.nombre))}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-ink-950 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
          aria-label={`Cotizar ${producto.nombre} por WhatsApp`}
        >
          <IconoWhatsApp className="h-4 w-4" />
          Cotizar
        </a>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="font-display text-[0.85rem] font-bold leading-snug tracking-tight sm:text-[0.95rem]">
          {producto.nombre}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-[0.78rem] leading-relaxed texto-suave sm:mt-2 sm:line-clamp-3 sm:text-[0.82rem]">
          {producto.descripcion}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5 sm:mt-3.5">
          {producto.presentaciones.map((p) => (
            <li
              key={p}
              className="rounded-md superficie-2 px-2 py-1 text-[0.66rem] font-semibold texto-suave sm:text-[0.68rem]"
            >
              {p}
            </li>
          ))}
        </ul>

        {/* En pantallas anchas el CTA aparece sobre la foto al hacer hover; en
            movil no hay hover, asi que va aqui a lo ancho, bajo el precio. */}
        <div className="mt-auto pt-3.5 sm:pt-4">
          <span
            className={
              producto.precio === null
                ? 'block text-[0.72rem] font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300 sm:text-[0.78rem]'
                : 'block font-display text-base font-extrabold text-brand-700 dark:text-brand-300 sm:text-lg'
            }
          >
            {formatearPrecio(producto.precio)}
          </span>

          <a
            href={whatsappUrl(mensajes.producto(producto.nombre))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg border borde-sutil py-2 text-xs font-bold transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300 sm:hidden"
            aria-label={`Cotizar ${producto.nombre} por WhatsApp`}
          >
            <IconoWhatsApp className="h-3.5 w-3.5" />
            Cotizar
          </a>
        </div>
      </div>
    </motion.article>
  );
});
