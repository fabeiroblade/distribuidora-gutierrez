import {
  contacto,
  mensajes,
  mostrarTelefono,
  redes,
  telefonoHref,
  whatsappUrl,
  type RedSocial,
} from '@/lib/contacto';
import { Reveal } from './Reveal';
import {
  IconoCorreo,
  IconoFacebook,
  IconoInstagram,
  IconoReloj,
  IconoTelefono,
  IconoTikTok,
  IconoUbicacion,
  IconoWhatsApp,
} from './Iconos';

/** Icono y color de realce de cada red. */
const estiloRed: Record<RedSocial['id'], { Icono: typeof IconoInstagram; clase: string }> = {
  instagram: {
    Icono: IconoInstagram,
    clase:
      'hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white hover:border-transparent',
  },
  facebook: {
    Icono: IconoFacebook,
    clase: 'hover:bg-[#1877F2] hover:text-white hover:border-transparent',
  },
  tiktok: {
    Icono: IconoTikTok,
    clase: 'hover:bg-ink-950 hover:text-white hover:border-transparent',
  },
};

export function Contacto() {
  const datos = [
    { Icono: IconoCorreo, titulo: 'Correo', valor: contacto.email, href: `mailto:${contacto.email}` },
    {
      Icono: IconoUbicacion,
      titulo: 'Ubicación',
      valor: contacto.direccion,
      href: contacto.mapa || undefined,
    },
    { Icono: IconoReloj, titulo: 'Horario', valor: contacto.horario, href: undefined },
  ];

  return (
    <section id="contacto" className="scroll-mt-24 py-20 sm:py-28">
      <div className="contenedor">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-[#180610] px-6 py-14 text-white sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute inset-0 bg-brand-mesh" />
            <div aria-hidden="true" className="franja-marca absolute inset-0 opacity-60" />

            <div className="relative grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
              <div>
                <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-amber-400">
                  Contacto
                </span>
                <h2 className="titulo-seccion mt-3">Cotiza tu pedido hoy mismo</h2>
                <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-white/75">
                  Escríbenos por WhatsApp con la lista de lo que necesitas y te enviamos precio,
                  disponibilidad y tiempo de entrega. Sin compromiso.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href={whatsappUrl(mensajes.general)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] px-6 py-3.5 text-[0.95rem] font-bold text-ink-950 shadow-fab transition-transform hover:-translate-y-1"
                  >
                    <IconoWhatsApp className="h-5 w-5" />
                    Escribir por WhatsApp
                  </a>
                  <a
                    href={telefonoHref(contacto.telefonos[0])}
                    className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-[0.95rem] font-bold backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/20"
                  >
                    <IconoTelefono className="h-5 w-5" />
                    Llamar
                  </a>
                </div>

                <div className="mt-9">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/50">
                    Síguenos
                  </p>
                  <div className="mt-4 flex gap-3">
                    {redes.map((r) => {
                      const { Icono, clase } = estiloRed[r.id];
                      return (
                        <a
                          key={r.id}
                          href={r.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={r.nombre}
                          className={`grid h-12 w-12 place-items-center rounded-2xl border border-white/25 bg-white/10 backdrop-blur-sm transition-all hover:-translate-y-1 ${clase}`}
                        >
                          <Icono className="h-5 w-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              <dl className="grid gap-3 sm:grid-cols-2 lg:content-start">
                {/* Los telefonos van aparte porque cada uno es su propio enlace */}
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm sm:col-span-2">
                  <dt className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white/50">
                    <IconoTelefono className="h-4 w-4" />
                    {contacto.telefonos.length > 1 ? 'Teléfonos' : 'Teléfono'}
                  </dt>
                  <dd className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
                    {contacto.telefonos.map((numero) => (
                      <a
                        key={numero}
                        href={telefonoHref(numero)}
                        className="text-[0.9rem] font-semibold underline-offset-4 transition-colors hover:text-amber-400 hover:underline"
                      >
                        {mostrarTelefono(numero)}
                      </a>
                    ))}
                  </dd>
                </div>

                {datos.map(({ Icono, titulo, valor, href }) => {
                  const contenido = (
                    <>
                      <dt className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white/50">
                        <Icono className="h-4 w-4" />
                        {titulo}
                      </dt>
                      {/* break-words evita que el correo se salga de la tarjeta */}
                      <dd className="mt-2.5 break-words text-[0.9rem] font-semibold leading-relaxed">
                        {valor}
                      </dd>
                    </>
                  );

                  return href ? (
                    <a
                      key={titulo}
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/10"
                    >
                      {contenido}
                    </a>
                  ) : (
                    <div
                      key={titulo}
                      className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm"
                    >
                      {contenido}
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
