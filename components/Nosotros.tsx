import { Reveal } from './Reveal';

const ventajas = [
  {
    titulo: 'Precio real de mayoreo',
    texto:
      'Trabajamos por caja, fardo y paquete. Entre más volumen, mejor el precio por unidad. Cotizamos cada pedido según lo que necesites.',
    icono: '📦',
  },
  {
    titulo: 'Dos líneas, un solo proveedor',
    texto:
      'Desechables para servicio de alimentos y artículos de limpieza institucional. Un pedido, una factura, una entrega.',
    icono: '🤝',
  },
  {
    titulo: 'Marcas que ya conoces',
    texto:
      'Scotch Brite, Wypall, Axion, Ajax, Glade, Lysol, Baygon, Orix y más, junto a nuestra línea propia DG.',
    icono: '🏷️',
  },
  {
    titulo: 'Atención directa por WhatsApp',
    texto:
      'Sin formularios ni esperas. Escribes, te cotizamos y coordinamos la entrega el mismo día hábil.',
    icono: '💬',
  },
];

const sectores = [
  'Restaurantes',
  'Cafeterías',
  'Panaderías',
  'Food trucks',
  'Supermercados',
  'Hoteles',
  'Oficinas',
  'Empresas de limpieza',
  'Clínicas',
  'Colegios',
];

export function Nosotros() {
  return (
    <section id="nosotros" className="scroll-mt-24 py-20 sm:py-28">
      <div className="contenedor">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
          <Reveal>
            <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
              Quiénes somos
            </span>
            <h2 className="titulo-seccion mt-3">
              Tu proveedor de confianza para el día a día del negocio
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed texto-suave">
              En Distribuidora Gutiérrez abastecemos a negocios de todo tamaño con productos
              desechables y artículos de limpieza. Manejamos inventario constante para que nunca te
              quedes sin lo básico, y ajustamos las presentaciones al ritmo de consumo de cada
              cliente.
            </p>

            <div className="mt-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] texto-suave">
                Atendemos a
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {sectores.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border borde-sutil px-3.5 py-1.5 text-[0.8rem] font-semibold"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {ventajas.map((v, i) => (
              <Reveal key={v.titulo} delay={i * 0.08}>
                <div className="h-full rounded-2xl border borde-sutil superficie-2 p-6">
                  <span className="text-2xl" aria-hidden="true">
                    {v.icono}
                  </span>
                  <h3 className="mt-4 font-display text-base font-extrabold tracking-tight">
                    {v.titulo}
                  </h3>
                  <p className="mt-2 text-[0.85rem] leading-relaxed texto-suave">{v.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
