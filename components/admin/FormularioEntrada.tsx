'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { entrar, type Resultado } from '@/app/admin/acciones';

function Boton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-5 w-full rounded-xl bg-brand-700 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
    >
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  );
}

export function FormularioEntrada({ volver }: { volver: string }) {
  const [estado, accion] = useFormState<Resultado | null, FormData>(entrar, null);

  return (
    <form action={accion} className="mt-8 rounded-2xl bg-white p-6 shadow-2xl dark:bg-ink-900">
      <input type="hidden" name="volver" value={volver} />

      <label htmlFor="correo" className="block text-xs font-extrabold uppercase tracking-wider texto-suave">
        Correo
      </label>
      <input
        id="correo"
        name="correo"
        type="email"
        autoComplete="username"
        required
        className="mt-2 w-full rounded-xl border borde-sutil superficie-2 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500"
      />

      <label
        htmlFor="clave"
        className="mt-4 block text-xs font-extrabold uppercase tracking-wider texto-suave"
      >
        Contraseña
      </label>
      <input
        id="clave"
        name="clave"
        type="password"
        autoComplete="current-password"
        required
        className="mt-2 w-full rounded-xl border borde-sutil superficie-2 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500"
      />

      {estado && !estado.ok && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {estado.error}
        </p>
      )}

      <Boton />
    </form>
  );
}
