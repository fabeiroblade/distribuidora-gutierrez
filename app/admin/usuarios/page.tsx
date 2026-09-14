import { exigirSesion } from '@/lib/sesion';
import { clienteAdministrador, clienteServidor } from '@/lib/supabase';
import type { Perfil } from '@/lib/types';
import { FormularioUsuario } from '@/components/admin/FormularioUsuario';
import { FilaUsuario } from '@/components/admin/FilaUsuario';
import { Aviso } from '@/components/admin/Aviso';

export const metadata = { title: 'Usuarios' };

export default async function Usuarios({
  searchParams,
}: {
  searchParams: { creado?: string; eliminado?: string };
}) {
  const yo = await exigirSesion('admin');

  const sb = clienteServidor();
  const { data, error } = await sb
    .from('perfiles')
    .select('id, nombre, rol, creado_en')
    .order('creado_en');

  const perfiles = (data ?? []) as Perfil[];

  // El correo vive en auth.users, que solo la clave de servicio puede leer.
  let correos: Record<string, string> = {};
  try {
    const admin = clienteAdministrador();
    const { data: usuarios } = await admin.auth.admin.listUsers({ perPage: 200 });
    correos = Object.fromEntries((usuarios?.users ?? []).map((u) => [u.id, u.email ?? '']));
  } catch {
    // Sin la clave de servicio la lista sigue sirviendo, solo que sin correos.
  }

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold">Usuarios</h1>
      <p className="mt-2 max-w-2xl text-sm texto-suave">
        El <strong>administrador</strong> puede todo, incluido dar de alta y quitar usuarios. El{' '}
        <strong>encargado</strong> administra el catálogo pero no toca las cuentas.
      </p>

      {searchParams.creado && <Aviso>Usuario creado. Ya puede entrar con su correo.</Aviso>}
      {searchParams.eliminado && <Aviso>Usuario eliminado.</Aviso>}

      {error && (
        <p className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          No se pudo leer la lista: {error.message}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <ul className="space-y-3">
          {perfiles.map((p) => (
            <FilaUsuario
              key={p.id}
              perfil={{ ...p, correo: correos[p.id] ?? '' }}
              soyYo={p.id === yo.id}
            />
          ))}
        </ul>

        <div className="rounded-2xl border borde-sutil bg-white p-6 dark:bg-ink-900">
          <h2 className="font-display text-lg font-extrabold">Agregar usuario</h2>
          <p className="mt-1.5 text-sm texto-suave">
            La persona entra de inmediato con el correo y la contraseña que le pongas aquí.
          </p>
          <FormularioUsuario />
        </div>
      </div>
    </>
  );
}
