import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Frambuesa DG — tomada del banner del catalogo (#B02647), abierta a una
           escala mas viva para web. El 700 es el color institucional exacto. */
        brand: {
          50:  '#FFF1F5',
          100: '#FFE0EA',
          200: '#FFC2D6',
          300: '#FF93B4',
          400: '#FA5688',
          500: '#EE2260',
          600: '#D2124C',
          700: '#B02647',
          800: '#8E1739',
          900: '#701330',
          950: '#42061A',
        },
        /* Rojo ladrillo del monograma DG */
        clay: {
          400: '#E15A48',
          500: '#D0402F',
          600: '#B93A2F',
          700: '#962E26',
        },
        /* Acento calido para CTAs secundarios y badges */
        amber: {
          400: '#FFB020',
          500: '#FF9F1C',
          600: '#E5860A',
        },
        /* Neutros carbon */
        ink: {
          50:  '#F7F7F8',
          100: '#EEEEF1',
          200: '#DCDCE2',
          300: '#B9B9C4',
          400: '#8B8B99',
          500: '#63636F',
          600: '#4A4A54',
          700: '#33333B',
          800: '#212128',
          900: '#16161C',
          950: '#0D0D11',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(13,13,17,.04), 0 8px 24px -12px rgba(13,13,17,.18)',
        'card-hover': '0 2px 4px rgba(13,13,17,.06), 0 24px 48px -16px rgba(176,38,71,.28)',
        fab: '0 8px 30px -6px rgba(37,211,102,.55)',
      },
      backgroundImage: {
        'brand-mesh':
          'radial-gradient(ellipse 72% 58% at 14% 2%, rgba(238,34,96,.62), transparent 62%), radial-gradient(ellipse 62% 55% at 90% 14%, rgba(255,159,28,.40), transparent 62%), radial-gradient(ellipse 88% 68% at 52% 104%, rgba(176,38,71,.68), transparent 66%)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(.9)', opacity: '.7' },
          '70%':  { transform: 'scale(1.5)', opacity: '0' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.16,1,.3,1) both',
        marquee: 'marquee 32s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(.24,0,.38,1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
