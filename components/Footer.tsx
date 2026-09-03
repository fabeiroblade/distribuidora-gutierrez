import Image from 'next/image';
import { categorias } from '@/lib/productos';
import {
  contacto,
  mensajes,
  mostrarTelefono,
  redes as redesConfiguradas,
  telefonoHref,
  whatsappUrl,
  type RedSocial,
} from '@/lib/contacto';
import {
  IconoCorreo,
  IconoFacebook,
  IconoInstagram,
  IconoTelefono,
  IconoTikTok,
  IconoUbicacion,
  IconoWhatsApp,
} from './Iconos';

const enlaces = [
  { href: '#catalogo', texto: 'Catálogo' },
  { href: '#categorias', texto: 'Categorías' },
  { href: '#nosotros', texto: 'Nosotros' },
  { href: '#contacto', texto: 'Contacto' },
];

const iconoRed: Record<RedSocial['id'], typeof IconoInstagram> = {
  instagram: IconoInstagram,
  facebook: IconoFacebook,
  tiktok: IconoTikTok,
};

export function Footer() {
  const redes = [
    { id: 'whatsapp', nombre: 'WhatsApp', href: whatsappUrl(mensajes.general), Icono: IconoWhatsApp },
    ...redesConfiguradas.map((r) => ({ ...r, Icono: iconoRed[r.id] })),
  ];

  return (
    <footer className="border-t borde-sutil superficie-2">
      <div className="contenedor py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <span className="inline-block rounded-2xl bg-white px-5 py-3.5 shadow-card ring-1 ring-black/5">
              <Image
                src="/logo-dg.png"
                alt={contacto.empresa}
                width={728}
                height={464}
                loading="lazy"
                className="h-14 w-auto"
              />
            </span>
            <p className="mt-5 max-w-xs text-[0.85rem] leading-relaxed texto-suave">
              {contacto.eslogan}. Abastecemos negocios en todo El Salvador con precio de mayoreo y
              atención directa.
            </p>

            <div className="mt-6 flex gap-2.5">
              {redes.map((r) => (
                <a
                  key={r.id}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={r.nombre}
                  className="grid h-10 w-10 place-items-center rounded-xl border borde-sutil transition-colors hover:border-brand-500 hover:bg-brand-700 hover:text-white"
                >
                  <r.Icono className="h-[1.05rem] w-[1.05rem]" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-labelledby="pie-navegacion">
            <h2 id="pie-navegacion" className="font-display text-sm font-extrabold uppercase tracking-wider">
              Navegación
            </h2>
            <ul className="mt-5 space-y-3">
              {enlaces.map((e) => (
                <li key={e.href}>
                  <a
                    href={e.href}
                    className="text-[0.85rem] font-medium texto-suave transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                  >
                    {e.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="pie-categorias">
            <h2 id="pie-categorias" className="font-display text-sm font-extrabold uppercase tracking-wider">
              Categorías
            </h2>
            <ul className="mt-5 space-y-3">
              {categorias.map((c) => (
                <li key={c.id}>
                  <a
                    href="#catalogo"
                    className="text-[0.85rem] font-medium texto-suave transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                  >
                    {c.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-sm font-extrabold uppercase tracking-wider">Contacto</h2>
            <ul className="mt-5 space-y-4 text-[0.85rem]">
              <li>
                <a
                  href={whatsappUrl(mensajes.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 font-medium texto-suave transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                >
                  <IconoWhatsApp className="mt-0.5 h-4 w-4 shrink-0" />
                  WhatsApp
                </a>
              </li>
              {contacto.telefonos.map((numero, i) => (
                <li key={numero}>
                  <a
                    href={telefonoHref(numero)}
                    className="flex items-start gap-2.5 font-medium texto-suave transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                  >
                    {/* El icono solo en el primero: los demas se leen como continuacion */}
                    <IconoTelefono
                      className={`mt-0.5 h-4 w-4 shrink-0 ${i === 0 ? '' : 'invisible'}`}
                    />
                    {mostrarTelefono(numero)}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${contacto.email}`}
                  className="flex items-start gap-2.5 break-all font-medium texto-suave transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                >
                  <IconoCorreo className="mt-0.5 h-4 w-4 shrink-0" />
                  {contacto.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 font-medium texto-suave">
                <IconoUbicacion className="mt-0.5 h-4 w-4 shrink-0" />
                {contacto.direccion}
              </li>
            </ul>
            <p className="mt-5 text-[0.8rem] leading-relaxed texto-suave">{contacto.horario}</p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t borde-sutil pt-8 text-xs texto-suave sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {contacto.empresa}. Todos los derechos reservados.
          </p>
          <p>
            Precios sujetos a disponibilidad. Las marcas mencionadas pertenecen a sus respectivos
            titulares.
          </p>
        </div>
      </div>
    </footer>
  );
}
