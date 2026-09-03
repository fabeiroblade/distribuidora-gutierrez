'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Retraso en segundos, para escalonar elementos de una misma fila. */
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article' | 'header';
};

/**
 * Aparicion con desplazamiento al entrar en viewport.
 *
 * Usa un IntersectionObserver propio en lugar de whileInView porque este ultimo
 * deja el bloque invisible cuando el scroll da un salto grande (enlaces ancla,
 * Fin, restauracion de posicion): el elemento pasa de estar debajo del viewport
 * a estar encima sin que el observador lo vea intersectando. Aqui se cubre ese
 * caso mirando tambien si el bloque ya quedo por arriba.
 */
export function Reveal({ children, delay = 0, className, as: Etiqueta = 'div' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    // Ya visible (o pasado de largo) en el primer render: no hay nada que animar.
    if (nodo.getBoundingClientRect().top < window.innerHeight) {
      setVisible(true);
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting || entrada.boundingClientRect.top < 0) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -80px 0px' }
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <Etiqueta
      /* El ref concreto depende de `as`; el union de elementos no lo estrecha. */
      ref={ref as React.RefObject<never>}
      data-revelar={visible ? 'visible' : 'oculto'}
      style={{ transitionDelay: visible && delay ? `${delay}s` : undefined }}
      className={`transition-[opacity,transform] duration-[550ms] ease-[cubic-bezier(.16,1,.3,1)] ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      } ${className ?? ''}`}
    >
      {children}
    </Etiqueta>
  );
}
