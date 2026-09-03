'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Tema = 'light' | 'dark';

const ContextoTema = createContext<{ tema: Tema; alternar: () => void }>({
  tema: 'light',
  alternar: () => {},
});

export const useTema = () => useContext(ContextoTema);

export function ProveedorTema({ children }: { children: React.ReactNode }) {
  // Arranca en 'light' y se sincroniza en el efecto: el script inline del <head>
  // ya puso la clase correcta en <html>, asi que no hay destello visible.
  const [tema, setTema] = useState<Tema>('light');

  useEffect(() => {
    // Avisa al script del <head> que React si hidrato, para que no retire la
    // clase "js" y las animaciones de aparicion sigan su curso normal.
    document.documentElement.setAttribute('data-hidratado', '1');
    setTema(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const alternar = useCallback(() => {
    setTema((actual) => {
      const siguiente: Tema = actual === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', siguiente === 'dark');
      try {
        localStorage.setItem('dg-tema', siguiente);
      } catch {
        // modo privado o almacenamiento bloqueado: el tema dura solo la sesion
      }
      return siguiente;
    });
  }, []);

  return <ContextoTema.Provider value={{ tema, alternar }}>{children}</ContextoTema.Provider>;
}
