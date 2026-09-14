'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { crearUsuario, type Resultado } from '@/app/admin/acciones';

const campo =
  'mt-2 w-full rounded-xl border borde-sutil superficie-2 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500';
const etiqueta = 'block text-xs font-extrabold uppercase tracking-wider texto-suave';

function Boton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-5 w-full rounded-xl bg-brand-700 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
    >
      {pending ? 'Creando…' : 'Crear usuario'}
    </button>
  );
}

export function FormularioUsuario() {
  const [estado, accion] = useFormState<Resultado | null, FormData>(crearUsuario, null);

  return (
    <form action={accion} className="mt-5">
      <label htmlFor="nombre-usuario" className={etiqueta}>
        Nombre
      </label>
      <input id="nombre-usuario" name="nombre" required placeholder="Ana Gutiérrez" className={campo} />

      <label htmlFor="correo-usuario" className={`${etiqueta} mt-4`}>
        Correo
      </label>
      <input
        id="correo-usuario"
        name="correo"
        type="email"
        required
        placeholder="encargado@ejemplo.com"
        className={campo}
      />

      <label htmlFor="clave-usuario" className={`${etiqueta} mt-4`}>
        Contraseña
      </label>
      <input
        id="clave-usuario"
        name="clave"
        type="text"
        required
        minLength={8}
        placeholder="Mínimo 8 caracteres"
        className={campo}
      />
      <p className="mt-1.5 text-xs texto-suave">
        Se muestra mientras la escribes para que puedas copiarla y entregarla.
      </p>

      <label htmlFor="rol-usuario" className={`${etiqueta} mt-4`}>
        Rol
      </label>
      <select id="rol-usuario" name="rol" defaultValue="editor" className={campo}>
        <option value="editor">Encargado — administra el catálogo</option>
        <option value="admin">Administrador — además maneja usuarios</option>
      </select>

      {estado && !estado.ok && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {estado.error}
        </p>
      )}

      <Boton />
    </form>
  );
}
