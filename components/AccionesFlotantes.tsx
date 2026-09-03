'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  contacto,
  mensajes,
  redes as redesConfiguradas,
  telefonoHref,
  whatsappUrl,
  type RedSocial,
} from '@/lib/contacto';
import {
  IconoCerrar,
  IconoFacebook,
  IconoInstagram,
  IconoTelefono,
  IconoTikTok,
  IconoWhatsApp,
} from './Iconos';

/** Icono y color de fondo de cada red en los botones flotantes. */
const estiloRed: Record<RedSocial['id'], { Icono: typeof IconoInstagram; color: string }> = {
  instagram: {
    Icono: IconoInstagram,
    color: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
  },
  facebook: { Icono: IconoFacebook, color: 'bg-[#1877F2]' },
  tiktok: { Icono: IconoTikTok, color: 'bg-ink-950' },
};

/**
 * Contacto siempre a mano:
 * - Riel vertical fijo (a partir de lg) con redes y teléfono.
 * - Botón flotante de WhatsApp, visible en todos los tamaños, que en móvil
 *   despliega el resto de canales.
 */
export function AccionesFlotantes() {
  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState(false);

  // El botón entra tras salir del hero, para no competir con el CTA principal.
  useEffect(() => {
    const alScroll = () => setVisible(window.scrollY > 420);
    alScroll();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  const redes = [
    ...redesConfiguradas.map((r) => ({ ...r, ...estiloRed[r.id] })),
    {
      id: 'telefono',
      nombre: 'Llamar',
      href: telefonoHref(contacto.telefonos[0]),
      Icono: IconoTelefono,
      color: 'bg-brand-700',
    },
  ];

  return (
    <>
      {/* Riel lateral — escritorio */}
      <div className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2.5 lg:flex">
        {redes.map((r) => (
          <a
            key={r.id}
            href={r.href}
            target={r.href.startsWith('http') ? '_blank' : undefined}
            rel={r.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            aria-label={r.nombre}
            title={r.nombre}
            className={`grid h-11 w-11 place-items-center rounded-xl text-white shadow-card transition-all hover:-translate-x-1 hover:scale-105 ${r.color}`}
          >
            <r.Icono className="h-[1.15rem] w-[1.15rem]" />
          </a>
        ))}
      </div>

      {/* Botón flotante de WhatsApp */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3"
          >
            {/* Canales adicionales en móvil */}
            <AnimatePresence>
              {abierto && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-col items-end gap-2.5 lg:hidden"
                >
                  {redes.map((r, i) => (
                    <motion.a
                      key={r.id}
                      href={r.href}
                      target={r.href.startsWith('http') ? '_blank' : undefined}
                      rel={r.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2.5"
                      onClick={() => setAbierto(false)}
                    >
                      <span className="rounded-lg bg-ink-950/90 px-2.5 py-1 text-xs font-bold text-white shadow-card">
                        {r.nombre}
                      </span>
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-full text-white shadow-card ${r.color}`}
                      >
                        <r.Icono className="h-[1.15rem] w-[1.15rem]" />
                      </span>
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setAbierto((v) => !v)}
                aria-label={abierto ? 'Cerrar canales de contacto' : 'Ver más canales de contacto'}
                aria-expanded={abierto}
                className="grid h-11 w-11 place-items-center rounded-full border borde-sutil bg-white shadow-card transition-transform hover:scale-105 dark:bg-ink-900 lg:hidden"
              >
                {abierto ? (
                  <IconoCerrar className="h-[1.1rem] w-[1.1rem]" />
                ) : (
                  <span className="text-lg leading-none" aria-hidden="true">
                    ⋯
                  </span>
                )}
              </button>

              <a
                href={whatsappUrl(mensajes.general)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escribir por WhatsApp"
                className="group relative grid h-16 w-16 place-items-center rounded-full bg-[#25D366] text-ink-950 shadow-fab transition-transform hover:scale-105"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-pulse-ring rounded-full bg-[#25D366]"
                />
                <IconoWhatsApp className="relative h-8 w-8" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
