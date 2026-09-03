import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { contacto, siteUrl } from '@/lib/contacto';
import { ProveedorTema } from '@/components/ProveedorTema';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const descripcion =
  'Distribuidora Gutiérrez: venta al por mayor de productos desechables y artículos de limpieza en El Salvador. Depósitos, bandejas, papel film, escobas, detergentes, desinfectantes y más. Cotiza por WhatsApp.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Distribuidora Gutiérrez | Desechables y limpieza al por mayor',
    template: '%s | Distribuidora Gutiérrez',
  },
  description: descripcion,
  keywords: [
    'distribuidora gutierrez',
    'desechables al por mayor',
    'productos de limpieza El Salvador',
    'depósitos plásticos',
    'bandejas desechables',
    'papel film',
    'detergente industrial',
    'insumos para restaurantes',
    'mayoreo San Salvador',
  ],
  authors: [{ name: contacto.empresa }],
  creator: contacto.empresa,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_SV',
    url: siteUrl,
    siteName: contacto.empresa,
    title: 'Distribuidora Gutiérrez | Desechables y limpieza al por mayor',
    description: descripcion,
    images: [{ url: '/logo-dg.png', width: 728, height: 464, alt: contacto.empresa }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Distribuidora Gutiérrez',
    description: descripcion,
    images: ['/logo-dg.png'],
  },
  icons: {
    icon: '/monograma-dg.png',
    apple: '/monograma-dg.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  category: 'business',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0d11' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * Corre sincrono en el <head>, antes del primer pintado:
 *
 * 1. Marca <html> con "js". Las animaciones de aparicion solo ocultan contenido
 *    bajo esa clase, de modo que si el JavaScript falla la pagina se ve entera.
 *    Va primero y fuera del try para que ni un error de localStorage lo impida.
 * 2. Aplica el tema guardado, para que no haya un destello claro en modo oscuro.
 */
const scriptInicio = `
(function(){
  var h = document.documentElement;
  h.classList.add('js');

  // Red de seguridad: si React no llego a hidratar (chunk que no carga, error
  // en un navegador viejo, conexion cortada), se retira la clase y el contenido
  // que esperaba la animacion se muestra tal cual. Vale mas una pagina sin
  // animaciones que una pagina en blanco.
  setTimeout(function(){
    if (!h.hasAttribute('data-hidratado')) h.classList.remove('js');
  }, 4000);

  try {
    var t = localStorage.getItem('dg-tema');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      h.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-SV" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptInicio }} />
      </head>
      <body className="font-sans antialiased">
        <ProveedorTema>{children}</ProveedorTema>
      </body>
    </html>
  );
}
