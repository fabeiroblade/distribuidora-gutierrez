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
 * Aplica el tema antes del primer pintado para que no haya un destello claro
 * al cargar en modo oscuro. Corre sincrono en el <head>.
 */
const scriptTema = `
(function(){
  try {
    var t = localStorage.getItem('dg-tema');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-SV" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="font-sans antialiased">
        <ProveedorTema>{children}</ProveedorTema>
      </body>
    </html>
  );
}
