'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { contacto, mensajes, whatsappUrl } from '@/lib/contacto';
import { useTema } from './ProveedorTema';
import { IconoCerrar, IconoLuna, IconoMenu, IconoSol, IconoWhatsApp } from './Iconos';

const enlaces = [
  { href: '#catalogo', texto: 'Catálogo' },
  { href: '#categorias', texto: 'Categorías' },
  { href: '#nosotros', texto: 'Nosotros' },
  { href: '#contacto', texto: 'Contacto' },
];

export function Header() {
  const [desplazado, setDesplazado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { tema, alternar } = useTema();

  useEffect(() => {
    const alScroll = () => setDesplazado(window.scrollY > 16);
    alScroll();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  // Evita que el fondo se desplace mientras el menu movil esta abierto
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuAbierto]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        desplazado
          ? 'border-b borde-sutil bg-white/85 backdrop-blur-xl dark:bg-ink-950/85'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="contenedor flex h-[4.5rem] items-center justify-between gap-4">
        <a href="#inicio" className="flex shrink-0 items-center gap-3" aria-label={`${contacto.empresa} — inicio`}>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-card ring-1 ring-black/5">
            <Image src="/monograma-dg.png" alt="" width={352} height={320} className="h-7 w-auto" priority />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-[0.95rem] font-extrabold tracking-tight">
              Distribuidora Gutiérrez
            </span>
            <span className="block text-[0.7rem] font-medium uppercase tracking-[0.16em] texto-suave">
              Mayoreo
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {enlaces.map((e) => (
            <a
              key={e.href}
              href={e.href}
              className="rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-ink-100 hover:text-brand-700 dark:hover:bg-ink-800 dark:hover:text-brand-300"
            >
              {e.texto}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={alternar}
            className="grid h-10 w-10 place-items-center rounded-xl border borde-sutil transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
            aria-label={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {tema === 'dark' ? <IconoSol className="h-5 w-5" /> : <IconoLuna className="h-5 w-5" />}
          </button>

          <a
            href={whatsappUrl(mensajes.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-card-hover sm:inline-flex"
          >
            <IconoWhatsApp className="h-[1.15rem] w-[1.15rem]" />
            Cotizar
          </a>

          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border borde-sutil lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
          >
            <IconoMenu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-ink-950/55 backdrop-blur-sm"
              onClick={() => setMenuAbierto(false)}
            />
            <motion.nav
              className="absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col gap-1 bg-white p-6 shadow-2xl dark:bg-ink-900"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              aria-label="Menú móvil"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display text-lg font-extrabold">Menú</span>
                <button
                  type="button"
                  onClick={() => setMenuAbierto(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl border borde-sutil"
                  aria-label="Cerrar menú"
                >
                  <IconoCerrar className="h-5 w-5" />
                </button>
              </div>

              {enlaces.map((e) => (
                <a
                  key={e.href}
                  href={e.href}
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-xl px-4 py-3 text-base font-semibold transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  {e.texto}
                </a>
              ))}

              <a
                href={whatsappUrl(mensajes.general)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuAbierto(false)}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3.5 text-sm font-bold text-white"
              >
                <IconoWhatsApp className="h-5 w-5" />
                Cotizar por WhatsApp
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
