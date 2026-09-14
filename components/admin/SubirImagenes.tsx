'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { clienteNavegador } from '@/lib/supabase-navegador';

const LADO = 700; // el mismo tamaño que tienen las fotos del catálogo
const PESO_MAXIMO = 8 * 1024 * 1024;
const MAXIMO_FOTOS = 8;

type Props = {
  /** Galería actual; la primera es la portada. */
  valor: string[];
  onCambio: (imagenes: string[]) => void;
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

/**
 * Huella del contenido del archivo. Dos imágenes idénticas dan la misma, así
 * que sirve de nombre para no guardar copias repetidas en el almacén.
 */
async function huella(blob: Blob): Promise<string> {
  const resumen = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return Array.from(new Uint8Array(resumen))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function SubirImagenes({ valor, onCambio }: Props) {
  const [subiendo, setSubiendo] = useState(0);
  const [error, setError] = useState('');
  const [encima, setEncima] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  const libres = MAXIMO_FOTOS - valor.length;

  async function procesar(archivos: FileList | null) {
    if (!archivos?.length) return;
    setError('');

    const lista = Array.from(archivos).slice(0, Math.max(0, libres));

    if (lista.length === 0) {
      return setError(`Ya tienes el máximo de ${MAXIMO_FOTOS} fotos. Quita alguna para subir otra.`);
    }
    if (lista.length < archivos.length) {
      setError(`Solo caben ${MAXIMO_FOTOS} fotos por producto; se subirán las primeras.`);
    }

    const sb = clienteNavegador();
    const subidas: string[] = [];

    for (const archivo of lista) {
      if (!archivo.type.startsWith('image/')) {
        setError(`"${archivo.name}" no es una imagen.`);
        continue;
      }
      if (archivo.size > PESO_MAXIMO) {
        setError(`"${archivo.name}" pesa más de 8 MB.`);
        continue;
      }

      setSubiendo((n) => n + 1);

      try {
        const cuadrada = await cuadrar(archivo);

        // El nombre sale del contenido, no del reloj: la misma foto siempre da
        // el mismo nombre, así que subirla dos veces no crea dos archivos.
        const nombre = (await huella(cuadrada)) + '.jpg';
        const url = sb.storage.from('productos').getPublicUrl(nombre).data.publicUrl;

        if (valor.includes(url) || subidas.includes(url)) {
          setError('Esa foto ya está en el producto.');
          continue;
        }

        const { error: fallo } = await sb.storage.from('productos').upload(nombre, cuadrada, {
          contentType: 'image/jpeg',
          cacheControl: '31536000',
        });

        // Si ya existía, se reutiliza el archivo en vez de duplicarlo.
        const yaEstaba = fallo?.message?.toLowerCase().includes('already exists');
        if (fallo && !yaEstaba) throw new Error(fallo.message);

        subidas.push(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo subir una de las imágenes.');
      } finally {
        setSubiendo((n) => n - 1);
      }
    }

    if (subidas.length) onCambio([...valor, ...subidas]);
  }

  const quitar = (i: number) => onCambio(valor.filter((_, n) => n !== i));

  /** Mover una foto una posición; la de la izquierda del todo es la portada. */
  const mover = (i: number, salto: number) => {
    const destino = i + salto;
    if (destino < 0 || destino >= valor.length) return;

    const copia = [...valor];
    [copia[i], copia[destino]] = [copia[destino], copia[i]];
    onCambio(copia);
  };

  return (
    <div>
      {valor.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-2">
          {valor.map((url, i) => (
            <li
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl border borde-sutil superficie-2"
            >
              <Image src={url} alt="" fill sizes="120px" className="object-cover" unoptimized />

              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-brand-700 px-1.5 py-0.5 text-[0.6rem] font-extrabold text-white">
                  Portada
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink-950/75 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  aria-label="Mover antes"
                  className="px-2 py-1 text-xs font-bold text-white disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => quitar(i)}
                  aria-label="Quitar foto"
                  className="px-2 py-1 text-xs font-bold text-white hover:text-brand-300"
                >
                  Quitar
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === valor.length - 1}
                  aria-label="Mover después"
                  className="px-2 py-1 text-xs font-bold text-white disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => {
          e.preventDefault();
          setEncima(false);
          procesar(e.dataTransfer.files);
        }}
        onClick={() => entrada.current?.click()}
        className={`grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
          encima ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'borde-sutil superficie-2'
        }`}
      >
        {subiendo > 0 ? (
          <p className="text-sm font-bold">Subiendo {subiendo} foto{subiendo > 1 ? 's' : ''}…</p>
        ) : (
          <>
            <p className="text-sm font-bold">
              {valor.length ? 'Agregar más fotos' : 'Subir fotos'}
            </p>
            <p className="mt-1 text-xs texto-suave">
              Arrastra aquí o haz clic. Puedes elegir varias a la vez.
            </p>
          </>
        )}
      </div>

      <input
        ref={entrada}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          procesar(e.target.files);
          e.target.value = ''; // permite volver a elegir el mismo archivo
        }}
      />

      <p className="mt-2 text-xs texto-suave">
        {valor.length}/{MAXIMO_FOTOS} fotos. Se recortan solas a {LADO}×{LADO} px. La primera es la
        portada: usa las flechas para reordenarlas.
      </p>

      {error && <p className="mt-2 text-xs font-bold text-brand-600">{error}</p>}
    </div>
  );
}
