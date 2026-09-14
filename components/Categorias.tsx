'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { contarPorCategoria } from '@/lib/productos';
import type { Catalogo as DatosCatalogo, Producto } from '@/lib/types';
import { Reveal } from './Reveal';

/**
 * Imagen de fondo de cada categoría: el primer producto destacado que tenga, o
 * el primero a secas. Antes eran rutas escritas a mano, que quedaban rotas al
 * dar de baja ese producto o al mover las fotos al almacén.
 */
function portadasDe(productos: Producto[]): Record<string, string> {
  const portadas: Record<string, string> = {};

  for (const p of productos) {
    const actual = portadas[p.categoria];
    if (!actual) portadas[p.categoria] = p.imagen;
  }
  for (const p of productos) {
    if (p.destacado) portadas[p.categoria] = p.imagen;
  }

  return portadas;
}

export function Categorias({ categorias, productos }: DatosCatalogo) {
  const conteos = contarPorCategoria(productos);
  const portadas = portadasDe(productos);
  const reducido = useReducedMotion();

  return (
    <section id="categorias" className="scroll-mt-24 superficie-2 py-20 sm:py-28">
      <div className="contenedor">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
            Líneas de producto
          </span>
          <h2 className="titulo-seccion mt-3">Dos rubros, siete categorías</h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed texto-suave">
            Abastecemos restaurantes, cafeterías, panaderías, oficinas y empresas de limpieza con
            un solo pedido.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.06}>
              <motion.a
                href="#catalogo"
                whileHover={reducido ? undefined : { y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex h-full flex-col justify-end overflow-hidden rounded-2xl border borde-sutil bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover dark:bg-ink-900"
              >
                {/* Una categoría recién creada puede no tener productos todavía */}
                {portadas[c.id] && (
                  <div className="absolute inset-0 -z-10">
                    <Image
                      src={portadas[c.id]}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                      className="object-cover opacity-[0.16] transition-transform duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110 dark:opacity-[0.13]"
                    />
                  </div>
                )}

                <span className="text-3xl" aria-hidden="true">
                  {c.emoji}
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold leading-tight tracking-tight">
                  {c.nombre}
                </h3>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-wider texto-suave">
                  {c.grupo} · {conteos[c.id] ?? 0} productos
                </p>
              </motion.a>
            </Reveal>
          ))}

          <Reveal delay={categorias.length * 0.06}>
            <a
              href="#catalogo"
              className="flex h-full flex-col justify-end rounded-2xl bg-brand-700 p-5 text-white shadow-card transition-all hover:-translate-y-1.5 hover:bg-brand-600 hover:shadow-card-hover"
            >
              <span className="font-display text-4xl font-extrabold">{productos.length}</span>
              <h3 className="mt-3 font-display text-lg font-extrabold leading-tight tracking-tight">
                Ver el catálogo completo
              </h3>
              <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-white/70">
                Con filtros y buscador
              </p>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
