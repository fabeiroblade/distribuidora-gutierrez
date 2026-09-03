/**
 * Datos de contacto. Todo sale de variables de entorno NEXT_PUBLIC_* para poder
 * cambiarlos desde el panel de Vercel sin tocar codigo. Next.js reemplaza estas
 * lecturas en build, por eso deben escribirse literales (no process.env[clave]).
 */

const limpiar = (valor: string | undefined, respaldo: string) =>
  valor && valor.trim().length > 0 ? valor.trim() : respaldo;

/** Solo digitos: es el formato que exige wa.me (codigo de pais + numero). */
const soloDigitos = (valor: string) => valor.replace(/\D/g, '');

/** Lista separada por comas -> arreglo, descartando entradas vacias. */
const aLista = (valor: string) =>
  valor
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

const telefonos = aLista(
  limpiar(process.env.NEXT_PUBLIC_TELEFONOS, '2262-5041, 7527-8155, 7483-1791')
);

export const contacto = {
  empresa: 'Distribuidora Gutiérrez',
  eslogan: 'Desechables y productos de limpieza al por mayor',

  whatsapp: soloDigitos(limpiar(process.env.NEXT_PUBLIC_WHATSAPP, '50375278155')),

  /** Todos los numeros publicados; el primero es el principal. */
  telefonos,

  email: limpiar(process.env.NEXT_PUBLIC_EMAIL, 'distribuidoragutierrez140724@gmail.com'),

  /* Redes: la que se deje vacia simplemente no se muestra en ningun lado. */
  instagram: limpiar(
    process.env.NEXT_PUBLIC_INSTAGRAM,
    'https://www.instagram.com/distribuidoragutierrez140724'
  ),
  facebook: limpiar(process.env.NEXT_PUBLIC_FACEBOOK, ''),
  tiktok: limpiar(process.env.NEXT_PUBLIC_TIKTOK, ''),

  direccion: limpiar(process.env.NEXT_PUBLIC_DIRECCION, 'San Salvador, El Salvador'),
  horario: limpiar(
    process.env.NEXT_PUBLIC_HORARIO,
    'Lunes a viernes 8:00 a.m. – 5:00 p.m. · Sábados 8:00 a.m. – 12:00 m.'
  ),
  mapa: limpiar(process.env.NEXT_PUBLIC_MAPA, ''),
} as const;

/** Codigo de pais para armar los enlaces tel: de numeros locales. */
const LADA = '503';

/** "2262-5041" -> "+503 2262-5041". Si ya trae +, se deja tal cual. */
export function mostrarTelefono(numero: string): string {
  return numero.startsWith('+') ? numero : `+${LADA} ${numero}`;
}

/** "2262-5041" -> "tel:+50322625041" */
export function telefonoHref(numero: string): string {
  const digitos = soloDigitos(numero);
  return `tel:+${digitos.length > 8 ? digitos : LADA + digitos}`;
}

export type RedSocial = {
  id: 'instagram' | 'facebook' | 'tiktok';
  nombre: string;
  href: string;
};

/**
 * Redes con perfil configurado, en el orden en que se muestran. Los componentes
 * recorren esta lista en vez de escribir cada red a mano, para que basta con
 * vaciar la variable de entorno para que la red desaparezca de todo el sitio.
 */
export const redes: RedSocial[] = (
  [
    { id: 'instagram', nombre: 'Instagram', href: contacto.instagram },
    { id: 'facebook', nombre: 'Facebook', href: contacto.facebook },
    { id: 'tiktok', nombre: 'TikTok', href: contacto.tiktok },
  ] satisfies RedSocial[]
).filter((r) => r.href.length > 0);

export const siteUrl = limpiar(
  process.env.NEXT_PUBLIC_SITE_URL,
  'https://distribuidora-gutierrez.vercel.app'
).replace(/\/$/, '');

/** Enlace de WhatsApp con mensaje prellenado. */
export function whatsappUrl(mensaje: string): string {
  return `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export const mensajes = {
  general: `Hola ${contacto.empresa}, me interesa recibir información sobre sus productos y precios de mayoreo.`,
  catalogo: `Hola ${contacto.empresa}, quisiera solicitar el catálogo completo con precios.`,
  producto: (nombre: string) =>
    `Hola ${contacto.empresa}, me interesa cotizar: ${nombre}. ¿Me pueden compartir precio y disponibilidad?`,
};
