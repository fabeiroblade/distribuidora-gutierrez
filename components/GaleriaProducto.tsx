'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

type Props = {
  imagenes: string[];
  alt: string;
  /** Las primeras tarjetas del grid se cargan con prioridad. */
  prioritaria?: boolean;
};

function Flecha({ hacia }: { hacia: 'izquierda' | 'derecha' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      {hacia === 'izquierda' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

/**
 * Fotos del producto con flechas para pasar de una a otra.
 *
 * Con una sola foto se comporta igual que antes: ni flechas, ni puntos, ni
 * estado que mantener. Los controles solo aparecen cuando hay algo que pasar.
 */
export function GaleriaProducto({ imagenes, alt, prioritaria = false }: Props) {
  const [indice, setIndice] = useState(0);
  const inicioTactil = useRef<number | null>(null);

  const varias = imagenes.length > 1;
  const actual = imagenes[indice] ?? imagenes[0];

  /** Avanza en círculo, para que la última vuelva a la primera. */
  const ir = (salto: number) =>
    setIndice((i) => (i + salto + imagenes.length) % imagenes.length);

  // Las flechas van dentro del enlace de la tarjeta: sin esto, pasar de foto
  // abriría WhatsApp.
  const sinPropagar = (accion: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    accion();
  };

  return (
    <div
      className="relative h-full w-full"
      onTouchStart={(e) => {
        inicioTactil.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (inicioTactil.current === null || !varias) return;
        const recorrido = e.changedTouches[0].clientX - inicioTactil.current;
        // Umbral para no confundir un desliz con un toque torcido.
        if (Math.abs(recorrido) > 40) ir(recorrido < 0 ? 1 : -1);
        inicioTactil.current = null;
      }}
    >
      <Image
        key={actual}
        src={actual}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        loading={prioritaria ? 'eager' : 'lazy'}
        priority={prioritaria}
        className="animate-fade-in object-cover transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] will-change-transform group-hover:scale-[1.12]"
      />

      {varias && (
        <>
          <button
            type="button"
            onClick={sinPropagar(() => ir(-1))}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink-900 shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-white active:scale-95"
          >
            <Flecha hacia="izquierda" />
          </button>

          <button
            type="button"
            onClick={sinPropagar(() => ir(1))}
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink-900 shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-white active:scale-95"
          >
            <Flecha hacia="derecha" />
          </button>

          {/* Puntos: dicen cuántas fotos hay y en cuál vas */}
          <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center gap-1.5">
            {imagenes.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={sinPropagar(() => setIndice(i))}
                aria-label={`Ver foto ${i + 1} de ${imagenes.length}`}
                aria-current={i === indice}
                className={`h-1.5 rounded-full shadow-sm transition-all ${
                  i === indice ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
