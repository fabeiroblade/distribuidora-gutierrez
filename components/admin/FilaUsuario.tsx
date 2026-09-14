'use client';

import { useFormState } from 'react-dom';
import { cambiarRol, eliminarUsuario, type Resultado } from '@/app/admin/acciones';
import type { Perfil } from '@/lib/types';

export function FilaUsuario({ perfil, soyYo }: { perfil: Perfil; soyYo: boolean }) {
  const [rol, accionRol] = useFormState<Resultado | null, FormData>(cambiarRol, null);
  const [borrado, accionBorrar] = useFormState<Resultado | null, FormData>(eliminarUsuario, null);

  const fallo = (rol && !rol.ok && rol.error) || (borrado && !borrado.ok && borrado.error);

  return (
    <li className="rounded-2xl border borde-sutil bg-white p-4 dark:bg-ink-900">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="min-w-[10rem] flex-1">
          <p className="text-sm font-bold">
            {perfil.nombre}
            {soyYo && <span className="ml-2 text-xs font-bold texto-suave">(tú)</span>}
          </p>
          {perfil.correo && <p className="mt-0.5 text-xs texto-suave">{perfil.correo}</p>}
        </div>

        {soyYo ? (
          <span className="rounded-lg superficie-2 px-3 py-2 text-xs font-bold">
            {perfil.rol === 'admin' ? 'Administrador' : 'Encargado'}
          </span>
        ) : (
          <>
            <form action={accionRol}>
              <input type="hidden" name="id" value={perfil.id} />
              <select
                name="rol"
                defaultValue={perfil.rol}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                className="rounded-lg border borde-sutil superficie-2 px-3 py-2 text-xs font-bold outline-none focus:border-brand-500"
              >
                <option value="editor">Encargado</option>
                <option value="admin">Administrador</option>
              </select>
            </form>

            <form action={accionBorrar}>
              <input type="hidden" name="id" value={perfil.id} />
              <button
                type="submit"
                onClick={(e) => {
                  if (!confirm(`¿Eliminar la cuenta de ${perfil.nombre}?`)) e.preventDefault();
                }}
                className="rounded-lg border borde-sutil px-3 py-2 text-xs font-bold text-brand-600 transition-colors hover:border-brand-500"
              >
                Eliminar
              </button>
            </form>
          </>
        )}
      </div>

      {fallo && <p className="mt-3 text-xs font-bold text-brand-600">{fallo}</p>}
      {rol?.ok && rol.mensaje && (
        <p className="mt-3 text-xs font-bold text-emerald-700">{rol.mensaje}</p>
      )}
    </li>
  );
}
