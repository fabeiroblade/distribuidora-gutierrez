'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { contacto, mensajes, whatsappUrl } from '@/lib/contacto';
import { IconoFlecha, IconoWhatsApp } from './Iconos';

const cifras = [
  { valor: '55+', etiqueta: 'Productos en catálogo' },
  { valor: '2', etiqueta: 'Líneas: desechables y limpieza' },
  { valor: '100%', etiqueta: 'Precio de mayoreo' },
];

/** Miniaturas del collage flotante. Cada una se mueve a distinta velocidad. */
const collage = [
  { src: '/productos/deposito-4oz.jpg', alt: 'Depósitos con tapadera', clase: 'left-[2%] top-[8%] h-24 w-24 sm:h-32 sm:w-32', factor: -70 },
  { src: '/productos/escobas-altas.jpg', alt: 'Escobas', clase: 'right-[4%] top-[4%] h-20 w-20 sm:h-28 sm:w-28', factor: -120 },
  { src: '/productos/galon-desinfectante.jpg', alt: 'Galones de desinfectante', clase: 'right-[8%] bottom-[12%] h-24 w-24 sm:h-32 sm:w-32', factor: -45 },
  { src: '/productos/bandeja-hamburguesa.jpg', alt: 'Bandeja para hamburguesa', clase: 'left-[6%] bottom-[10%] h-20 w-20 sm:h-28 sm:w-28', factor: -95 },
];

/**
 * Una miniatura del collage. Vive en su propio componente porque cada una
 * necesita su useTransform y los hooks no pueden llamarse dentro de un map.
 */
function ItemCollage({
  item,
  progreso,
}: {
  item: (typeof collage)[number];
  progreso: MotionValue<number>;
}) {
  const y = useTransform(progreso, [0, 1], [0, item.factor]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ y }}
      className={`pointer-events-none absolute hidden overflow-hidden rounded-3xl border border-white/15 shadow-2xl md:block ${item.clase}`}
    >
      <Image
        src={item.src}
        alt=""
        width={700}
        height={700}
        className="h-full w-full object-cover opacity-90"
      />
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reducido = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Parallax: el contenido sube mas lento que el scroll y se desvanece.
  const yContenido = useTransform(scrollYProgress, [0, 1], ['0%', '32%']);
  const opacidad = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const yFondo = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  return (
    <section
      ref={ref}
      id="inicio"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#180610] pt-[4.5rem] text-white"
    >
      {/* Capa de fondo: degradado de marca + franjas diagonales del catálogo */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-brand-mesh"
        style={reducido ? undefined : { y: yFondo }}
      />
      <div aria-hidden="true" className="franja-marca absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-[#180610]"
      />

      {/* Collage de producto con parallax por capas */}
      {!reducido &&
        collage.map((item) => (
          <ItemCollage key={item.src} item={item} progreso={scrollYProgress} />
        ))}

      <motion.div
        className="contenedor relative py-14"
        style={reducido ? undefined : { y: yContenido, opacity: opacidad }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Venta al por mayor · El Salvador
          </motion.span>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mb-7 w-fit rounded-3xl bg-white px-7 py-5 shadow-2xl"
          >
            <Image
              src="/logo-dg.png"
              alt={contacto.empresa}
              width={728}
              height={464}
              priority
              className="h-16 w-auto sm:h-24"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[2rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Desechables y limpieza
            <span className="mt-2 block bg-gradient-to-r from-amber-400 via-white to-brand-200 bg-clip-text text-transparent">
              al precio de mayoreo
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/80 sm:text-base"
          >
            Todo lo que tu negocio necesita en un solo proveedor: depósitos, bandejas, papel film,
            escobas, detergentes y desinfectantes. Cajas, fardos y paquetes con entrega en todo el país.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a
              href={whatsappUrl(mensajes.catalogo)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] px-6 py-3.5 text-[0.95rem] font-bold text-ink-950 shadow-fab transition-transform hover:-translate-y-1 sm:w-auto"
            >
              <IconoWhatsApp className="h-5 w-5" />
              Pedir cotización
            </a>
            <a
              href="#catalogo"
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-[0.95rem] font-bold backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/20 sm:w-auto"
            >
              Ver catálogo
              <IconoFlecha className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mt-9 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/15 pt-6"
          >
            {cifras.map((c) => (
              <div key={c.etiqueta}>
                <dt className="font-display text-xl font-extrabold sm:text-3xl">{c.valor}</dt>
                <dd className="mt-1.5 text-[0.7rem] leading-snug text-white/65 sm:text-xs">{c.etiqueta}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>
    </section>
  );
}
