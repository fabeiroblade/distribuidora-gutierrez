'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { clienteNavegador } from '@/lib/supabase-navegador';

const LADO = 700; // el mismo tamaño que tienen las fotos del catálogo actual
const PESO_MAXIMO = 8 * 1024 * 1024;

type Props = {
  /** URL ya guardada, si se está editando un producto. */
  valor: string;
  onCambio: (url: string) => void;
};

/**
 * Deja la foto cuadrada de LADO×LADO sin deformarla: la centra y rellena los
 * lados con el color de sus propias esquinas, que es como se prepararon las
 * imágenes del catálogo original. Devuelve un JPEG listo para subir.
 */
function cuadrar(archivo: File): Promise<Blob> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();

    lector.onerror = () => rechazar(new Error('No se pudo leer el archivo.'));
    lector.onload = () => {
      const img = new window.Image();

      img.onerror = () => rechazar(new Error('El archivo no es una imagen válida.'));
      img.onload = () => {
        const lienzo = document.createElement('canvas');
        lienzo.width = LADO;
        lienzo.height = LADO;

        const ctx = lienzo.getContext('2d');
        if (!ctx) return rechazar(new Error('Tu navegador no permite procesar la imagen.'));

        // Color de relleno: promedio de las cuatro esquinas del original.
        const medidor = document.createElement('canvas');
        medidor.width = img.width;
        medidor.height = img.height;
        const mctx = medidor.getContext('2d', { willReadFrequently: true });

        let relleno = '#ffffff';
        if (mctx) {
          mctx.drawImage(img, 0, 0);
          const esquinas = [
            [1, 1],
            [img.width - 2, 1],
            [1, img.height - 2],
            [img.width - 2, img.height - 2],
          ];
          let r = 0;
          let g = 0;
          let b = 0;
          for (const [x, y] of esquinas) {
            const d = mctx.getImageData(Math.max(0, x), Math.max(0, y), 1, 1).data;
            r += d[0];
            g += d[1];
            b += d[2];
          }
          relleno = `rgb(${Math.round(r / 4)}, ${Math.round(g / 4)}, ${Math.round(b / 4)})`;
        }

        ctx.fillStyle = relleno;
        ctx.fillRect(0, 0, LADO, LADO);

        const escala = Math.min(LADO / img.width, LADO / img.height);
        const ancho = Math.round(img.width * escala);
        const alto = Math.round(img.height * escala);

        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, (LADO - ancho) / 2, (LADO - alto) / 2, ancho, alto);

        lienzo.toBlob(
          (blob) => (blob ? resolver(blob) : rechazar(new Error('No se pudo convertir la imagen.'))),
          'image/jpeg',
          0.88
        );
      };

      img.src = String(lector.result);
    };

    lector.readAsDataURL(archivo);
  });
}

export function SubirImagen({ valor, onCambio }: Props) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [encima, setEncima] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  async function procesar(archivo: File | undefined) {
    if (!archivo) return;

    setError('');

    if (!archivo.type.startsWith('image/')) {
      return setError('Ese archivo no es una imagen.');
    }
    if (archivo.size > PESO_MAXIMO) {
      return setError('La imagen pesa más de 8 MB. Usa una más liviana.');
    }

    setSubiendo(true);

    try {
      const cuadrada = await cuadrar(archivo);

      const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const sb = clienteNavegador();

      const { error: fallo } = await sb.storage.from('productos').upload(nombre, cuadrada, {
        contentType: 'image/jpeg',
        cacheControl: '31536000',
      });

      if (fallo) throw new Error(fallo.message);

      const { data } = sb.storage.from('productos').getPublicUrl(nombre);
      onCambio(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => {
          e.preventDefault();
          setEncima(false);
          procesar(e.dataTransfer.files[0]);
        }}
        onClick={() => entrada.current?.click()}
        className={`relative grid aspect-square w-full cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
          encima ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'borde-sutil superficie-2'
        }`}
      >
        {valor && !subiendo && (
          <Image src={valor} alt="" fill sizes="320px" className="object-cover" unoptimized />
        )}

        <div
          className={`relative z-10 px-6 text-center ${
            valor && !subiendo ? 'bg-ink-950/65 rounded-xl p-4 text-white' : ''
          }`}
        >
          {subiendo ? (
            <p className="text-sm font-bold">Subiendo…</p>
          ) : (
            <>
              <p className="text-sm font-bold">{valor ? 'Cambiar imagen' : 'Subir imagen'}</p>
              <p className="mt-1 text-xs opacity-80">
                Arrastra la foto aquí o haz clic para elegirla
              </p>
            </>
          )}
        </div>
      </div>

      <input
        ref={entrada}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => procesar(e.target.files?.[0])}
      />

      <p className="mt-2 text-xs texto-suave">
        Se recorta sola a {LADO}×{LADO} px para que la cuadrícula quede pareja.
      </p>

      {error && <p className="mt-2 text-xs font-bold text-brand-600">{error}</p>}
    </div>
  );
}
