import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Evita que Supabase pause el proyecto en el plan gratuito.
 *
 * Supabase pausa los proyectos que pasan una semana sin actividad en la base.
 * Vercel llama a esta ruta una vez al día (ver vercel.json) y hace una consulta
 * mínima de solo lectura, suficiente para que el proyecto cuente como activo.
 *
 * Si existe la variable CRON_SECRET en Vercel, solo responde a las llamadas
 * del propio cron (Vercel envía ese secreto en la cabecera Authorization).
 */
export const dynamic = 'force-dynamic';

export async function GET(peticion: NextRequest) {
  const secreto = process.env.CRON_SECRET;
  if (secreto && peticion.headers.get('authorization') !== `Bearer ${secreto}`) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) {
    return NextResponse.json({ ok: false, error: 'Supabase no configurado' }, { status: 500 });
  }

  const sb = createClient(url, clave, { auth: { persistSession: false } });
  const { count, error } = await sb.from('categorias').select('id', { count: 'exact', head: true });

  if (error) {
    console.error('Mantener activo:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, categorias: count, fecha: new Date().toISOString() });
}
