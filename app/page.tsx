import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Categorias } from '@/components/Categorias';
import { Catalogo } from '@/components/Catalogo';
import { Nosotros } from '@/components/Nosotros';
import { Contacto } from '@/components/Contacto';
import { Footer } from '@/components/Footer';
import { AccionesFlotantes } from '@/components/AccionesFlotantes';
import { contacto, mostrarTelefono, siteUrl } from '@/lib/contacto';
import { obtenerCatalogo } from '@/lib/catalogo';
import type { Categoria, Producto } from '@/lib/types';

/**
 * El catálogo se relee cada hora, y al instante cuando el panel guarda algo
 * (revalidatePath). Así el sitio sigue sirviéndose desde caché —rápido y
 * barato— sin quedar desactualizado.
 */
export const revalidate = 3600;

/** Datos estructurados para que Google entienda el negocio y el catálogo. */
function datosEstructurados(categorias: Categoria[], productos: Producto[]) {
  const negocio = {
    '@type': 'Store',
    '@id': `${siteUrl}/#negocio`,
    name: contacto.empresa,
    description: contacto.eslogan,
    url: siteUrl,
    image: `${siteUrl}/logo-dg.png`,
    logo: `${siteUrl}/logo-dg.png`,
    telephone: contacto.telefonos.map(mostrarTelefono),
    email: contacto.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: contacto.direccion,
      addressCountry: 'SV',
    },
    sameAs: [contacto.instagram, contacto.facebook, contacto.tiktok].filter(Boolean),
    priceRange: '$$',
  };

  const catalogo = {
    '@type': 'ItemList',
    '@id': `${siteUrl}/#catalogo`,
    name: 'Catálogo Distribuidora Gutiérrez',
    numberOfItems: productos.length,
    itemListElement: productos.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.nombre,
        description: p.descripcion,
        image: `${siteUrl}${p.imagen}`,
        category: categorias.find((c) => c.id === p.categoria)?.nombre,
        brand: { '@type': 'Brand', name: contacto.empresa },
      },
    })),
  };

  return { '@context': 'https://schema.org', '@graph': [negocio, catalogo] };
}

export default async function Pagina() {
  const { categorias, productos } = await obtenerCatalogo();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados(categorias, productos)) }}
      />

      <Header />
      <main>
        <Hero />
        <Categorias categorias={categorias} productos={productos} />
        <Catalogo categorias={categorias} productos={productos} />
        <Nosotros />
        <Contacto />
      </main>
      <Footer categorias={categorias} />
      <AccionesFlotantes />
    </>
  );
}
