'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { categorias, grupos, productos } from '@/lib/productos';
import { mensajes, whatsappUrl } from '@/lib/contacto';
import { TarjetaProducto } from './TarjetaProducto';
import { Reveal } from './Reveal';
import { IconoBuscar, IconoCerrar, IconoWhatsApp } from './Iconos';

const TODOS = 'todos';

/** Quita acentos y pasa a minusculas para que "jabon" encuentre "jabón". */
const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function Catalogo() {
  const [filtro, setFiltro] = useState<string>(TODOS);
  const [grupo, setGrupo] = useState<string>(TODOS);
  const [busqueda, setBusqueda] = useState('');

  /**
   * Las animaciones de entrada de las tarjetas solo se encienden ya en el
   * navegador. En el HTML del servidor deben salir visibles: si framer escribe
   * opacity:0 y la hidratacion falla, el catalogo entero queda en blanco.
   */
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const nombreCategoria = useMemo(
    () => Object.fromEntries(categorias.map((c) => [c.id, c.nombre])),
    []
  );

  // Al elegir una familia (Desechables / Limpieza) solo se ofrecen sus categorías.
  const categoriasVisibles = useMemo(
    () => (grupo === TODOS ? categorias : categorias.filter((c) => c.grupo === grupo)),
    [grupo]
  );

  /** Productos que pasan familia y busqueda, sin aplicar aun la categoria. */
  const candidatos = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    const palabras = termino ? termino.split(/\s+/) : [];

    return productos.filter((p) => {
      const cat = categorias.find((c) => c.id === p.categoria);

      if (grupo !== TODOS && cat?.grupo !== grupo) return false;
      if (palabras.length === 0) return true;

      const heno = normalizar(
        `${p.nombre} ${p.descripcion} ${p.presentaciones.join(' ')} ${cat?.nombre ?? ''}`
      );
      return palabras.every((palabra) => heno.includes(palabra));
    });
  }, [grupo, busqueda]);

  const resultados = useMemo(
    () => (filtro === TODOS ? candidatos : candidatos.filter((p) => p.categoria === filtro)),
    [candidatos, filtro]
  );

  /**
   * Cuantos productos daria cada categoria con la familia y la busqueda
   * actuales. Asi el numero de la pastilla anticipa el resultado del clic en
   * vez de repetir el total del catalogo.
   */
  const conteosVisibles = useMemo(
    () =>
      candidatos.reduce<Record<string, number>>((acc, p) => {
        acc[p.categoria] = (acc[p.categoria] ?? 0) + 1;
        return acc;
      }, {}),
    [candidatos]
  );

  const cambiarGrupo = (nuevo: string) => {
    setGrupo(nuevo);
    setFiltro(TODOS); // la categoría anterior puede no existir en la nueva familia
  };

  const limpiar = () => {
    setGrupo(TODOS);
    setFiltro(TODOS);
    setBusqueda('');
  };

  const hayFiltros = grupo !== TODOS || filtro !== TODOS || busqueda.trim() !== '';

  return (
    <section id="catalogo" className="scroll-mt-24 py-20 sm:py-28">
      <div className="contenedor">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
            Catálogo
          </span>
          <h2 className="titulo-seccion mt-3">Todo nuestro inventario</h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed texto-suave">
            {productos.length} productos entre desechables y artículos de limpieza. Filtra por línea o
            busca directamente lo que necesitas; el precio se cotiza según el volumen de tu pedido.
          </p>
        </Reveal>

        {/* ---- Controles ---- */}
        <Reveal delay={0.08} className="mt-12">
          <div className="mx-auto max-w-xl">
            <label htmlFor="buscar" className="sr-only">
              Buscar producto
            </label>
            <div className="relative">
              <IconoBuscar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 texto-suave" />
              <input
                id="buscar"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar: depósito, escoba, detergente…"
                className="w-full rounded-2xl border borde-sutil superficie-2 py-3.5 pl-12 pr-11 text-[0.95rem] outline-none transition-colors placeholder:texto-suave focus:border-brand-500"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full transition-colors hover:bg-ink-200 dark:hover:bg-ink-700"
                  aria-label="Limpiar búsqueda"
                >
                  <IconoCerrar className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Familias */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[TODOS, ...grupos].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => cambiarGrupo(g)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                  grupo === g
                    ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900'
                    : 'border borde-sutil hover:border-ink-400'
                }`}
              >
                {g === TODOS ? 'Todo' : g}
              </button>
            ))}
          </div>

          {/* Categorías */}
          <LayoutGroup id="filtros-categoria">
            <div className="sin-scrollbar mt-4 flex snap-x gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
              <BotonCategoria
                activo={filtro === TODOS}
                onClick={() => setFiltro(TODOS)}
                etiqueta="Todas las categorías"
                conteo={candidatos.length}
              />
              {categoriasVisibles.map((c) => (
                <BotonCategoria
                  key={c.id}
                  activo={filtro === c.id}
                  onClick={() => setFiltro(c.id)}
                  etiqueta={`${c.emoji} ${c.nombre}`}
                  conteo={conteosVisibles[c.id] ?? 0}
                />
              ))}
            </div>
          </LayoutGroup>
        </Reveal>

        {/* ---- Resultados ---- */}
        <p className="mt-10 text-center text-sm texto-suave" aria-live="polite">
          {resultados.length === 0
            ? 'Sin resultados'
            : `Mostrando ${resultados.length} de ${productos.length} productos`}
        </p>

        {resultados.length === 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-dashed borde-sutil px-6 py-14 text-center">
            <p className="font-display text-lg font-bold">No encontramos ese producto</p>
            <p className="mt-2 text-sm texto-suave">
              Manejamos más artículos de los que están publicados. Escríbenos y te confirmamos
              disponibilidad.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={limpiar}
                className="rounded-xl border borde-sutil px-4 py-2.5 text-sm font-bold transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                Quitar filtros
              </button>
              <a
                href={whatsappUrl(mensajes.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-ink-950"
              >
                <IconoWhatsApp className="h-4 w-4" />
                Preguntar por WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <motion.div
            layout
            className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {resultados.map((p, i) => (
                <TarjetaProducto
                  key={p.id}
                  producto={p}
                  categoria={nombreCategoria[p.categoria]}
                  prioritaria={i < 4}
                  animar={montado}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {hayFiltros && resultados.length > 0 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={limpiar}
              className="text-sm font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300"
            >
              Ver los {productos.length} productos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function BotonCategoria({
  activo,
  onClick,
  etiqueta,
  conteo,
}: {
  activo: boolean;
  onClick: () => void;
  etiqueta: string;
  conteo: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`relative shrink-0 snap-start rounded-full px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
        activo ? 'text-white' : 'border borde-sutil texto-suave hover:text-brand-700 dark:hover:text-brand-300'
      }`}
    >
      {activo && (
        <motion.span
          layoutId="pastilla-categoria"
          className="absolute inset-0 -z-10 rounded-full bg-brand-700"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      {etiqueta}
      <span className={activo ? 'ml-1.5 text-white/70' : 'ml-1.5 opacity-60'}>{conteo}</span>
    </button>
  );
}
