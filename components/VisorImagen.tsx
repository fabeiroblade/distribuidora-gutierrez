'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { mensajes, whatsappUrl } from '@/lib/contacto';
import { IconoCerrar, IconoWhatsApp } from './Iconos';

type Props = {
  imagenes: string[];
  /** Foto por la que se abre. */
  inicial: number;
  nombre: string;
  onCerrar: () => void;
};

function Flecha({ hacia }: { hacia: 'izquierda' | 'derecha' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      {hacia === 'izquierda' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

/**
 * Ve la foto en grande sin salir del catálogo.
 *
 * Se monta en el <body> con un portal: dentro de la tarjeta quedaría recortado
 * por el overflow-hidden que necesita el zoom al pasar el ratón.
 */
export function VisorImagen({ imagenes, inicial, nombre, onCerrar }: Props) {
  const [indice, setIndice] = useState(inicial);
  const [montado, setMontado] = useState(false);
  const inicioTactil = useRef<number | null>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  const varias = imagenes.length > 1;
  const ir = (salto: number) =>
    setIndice((i) => (i + salto + imagenes.length) % imagenes.length);

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    // El teclado debe bastar: Escape cierra, flechas pasan las fotos.
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
      if (e.key === 'ArrowRight' && imagenes.length > 1) ir(1);
      if (e.key === 'ArrowLeft' && imagenes.length > 1) ir(-1);
    };

    window.addEventListener('keydown', alPulsar);

    // Sin esto, el catálogo se desplaza por detrás del visor.
    const desbordeAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    cerrarRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = desbordeAnterior;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagenes.length]);

  if (!montado) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${nombre}`}
      className="fixed inset-0 z-[100] flex flex-col bg-ink-950/95 backdrop-blur-sm animate-fade-in"
      onClick={onCerrar}
      onTouchStart={(e) => {
        inicioTactil.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (inicioTactil.current === null || !varias) return;
        const recorrido = e.changedTouches[0].clientX - inicioTactil.current;
        if (Math.abs(recorrido) > 50) ir(recorrido < 0 ? 1 : -1);
        inicioTactil.current = null;
      }}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 text-white">
        <p className="min-w-0 flex-1 truncate text-sm font-bold">{nombre}</p>

        {varias && (
          <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tabular-nums">
            {indice + 1} / {imagenes.length}
          </span>
        )}

        <button
          ref={cerrarRef}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/30"
        >
          <IconoCerrar className="h-5 w-5" />
        </button>
      </div>

      {/* La foto. El clic en ella no cierra: solo el del fondo. */}
      <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
        <div
          className="relative h-full w-full max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            key={imagenes[indice]}
            src={imagenes[indice]}
            alt={`${nombre} — foto ${indice + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="animate-fade-in object-contain"
            priority
          />
        </div>

        {varias && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                ir(-1);
              }}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition-all hover:scale-105 hover:bg-white/30 active:scale-95"
            >
              <Flecha hacia="izquierda" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                ir(1);
              }}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition-all hover:scale-105 hover:bg-white/30 active:scale-95"
            >
              <Flecha hacia="derecha" />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas y cotización */}
      <div
        className="flex flex-col items-center gap-4 px-5 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {varias && (
          <div className="flex max-w-full gap-2 overflow-x-auto sin-scrollbar">
            {imagenes.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setIndice(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === indice}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg transition-all ${
                  i === indice ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-90'
                }`}
              >
                <Image src={url} alt="" fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <a
          href={whatsappUrl(mensajes.producto(nombre))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-bold text-ink-950 transition-transform hover:-translate-y-0.5"
        >
          <IconoWhatsApp className="h-5 w-5" />
          Cotizar por WhatsApp
        </a>
      </div>
    </div>,
    document.body
  );
}
