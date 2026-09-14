/**
 * Genera los banners de publicidad para Instagram y WhatsApp.
 *
 *   node generar-banners.js
 *
 * Arma cada pieza como HTML y la fotografia con el navegador, asi la tipografia
 * y el logo salen nitidos y con los colores exactos de la marca. Los archivos
 * quedan en ../publicidad con los nombres ig1, ig2... y wsp1, wsp2...
 */
const { webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const SALIDA = path.join(RAIZ, 'publicidad');
const SITIO = 'distribuidora-gutierrez.vercel.app';
const WHATSAPP = '7483-1791';
const INSTAGRAM = '@distribuidoragutierrez140724';

/**
 * Incrusta un archivo de public/ como data URI. Las rutas file:// no llegan a
 * cargar y dejaban la tarjeta del logo y el mosaico en blanco.
 */
function activo(rel) {
  const ruta = path.join(RAIZ, 'public', rel);
  const tipo = ruta.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return 'data:' + tipo + ';base64,' + fs.readFileSync(ruta).toString('base64');
}

const LOGO = activo('logo-dg.png');
const MONOGRAMA = activo('monograma-dg.png');
const prod = (n) => activo('productos/' + n + '.jpg');

/**
 * La fuente va incrustada en lugar de pedirla a Google. Traida por la red no
 * llegaba a tiempo y los titulares salian con una fuente cualquiera y sin el
 * grosor 800. Es la variable de Plus Jakarta Sans, la misma del sitio.
 */
const FUENTE =
  'data:font/woff2;base64,' +
  fs.readFileSync(path.join(__dirname, 'fuentes', 'jakarta.woff2')).toString('base64');

const CSS = `
@font-face {
  font-family: 'Jakarta';
  src: url(${FUENTE}) format('woff2');
  font-weight: 200 800;
  font-style: normal;
  font-display: block;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Jakarta', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.lienzo {
  position: relative;
  overflow: hidden;
  background: #180610;
  color: #fff;
  display: flex;
  flex-direction: column;
}

/* Mismo degradado de marca que la portada del sitio */
.mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 72% 58% at 14% 2%, rgba(238,34,96,.62), transparent 62%),
    radial-gradient(ellipse 62% 55% at 90% 14%, rgba(255,159,28,.42), transparent 62%),
    radial-gradient(ellipse 88% 68% at 52% 104%, rgba(176,38,71,.70), transparent 66%);
}

/* Franjas diagonales del banner del catalogo impreso */
.franjas {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(115deg,
    rgba(255,255,255,.07) 0, rgba(255,255,255,.07) 34px,
    transparent 34px, transparent 78px);
}

.capa { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; }

.etiqueta {
  display: inline-flex; align-items: center; gap: 14px;
  align-self: center;
  border: 2px solid rgba(255,255,255,.3);
  background: rgba(255,255,255,.1);
  border-radius: 999px;
  font-weight: 800; text-transform: uppercase;
}
.punto { background: #FF9F1C; border-radius: 50%; }

.tarjeta-logo {
  align-self: center; background: #fff; border-radius: 34px;
  box-shadow: 0 30px 70px -20px rgba(0,0,0,.6);
}

/**
 * WebKit no deduce el grosor del rango variable con font-weight solo: los
 * titulares salian en peso medio. Se fija el eje wght a mano.
 */
h1, .etiqueta, .url, .pie, .grueso { font-variation-settings: 'wght' 800; }
.bajada, .medio { font-variation-settings: 'wght' 500; }

h1 { font-weight: 800; line-height: 1.02; letter-spacing: -.02em; text-align: center; }
.resalte { color: #FFB020; }
.bajada { text-align: center; color: rgba(255,255,255,.82); font-weight: 500; line-height: 1.42; }

.url {
  align-self: center; text-align: center;
  background: #fff; color: #180610;
  border-radius: 24px; font-weight: 800;
  letter-spacing: -.005em;
  box-shadow: 0 24px 60px -18px rgba(0,0,0,.55);
}
.url .arriba { display: block; color: #B02647; text-transform: uppercase; letter-spacing: .14em; }

.pie {
  margin-top: auto; display: flex; align-items: center; justify-content: center;
  gap: 30px; color: rgba(255,255,255,.85); font-weight: 700;
  border-top: 2px solid rgba(255,255,255,.16);
}
.pie .sep { color: rgba(255,255,255,.4); }

.verde { background: #25D366; color: #0d1b12; }

.mosaico { display: grid; gap: 10px; }
.mosaico img { width: 100%; height: 100%; object-fit: cover; display: block; }
.celda { overflow: hidden; border-radius: 20px; background: #241016; }
`;

/** Envuelve el contenido de un banner en un documento completo. */
function documento(ancho, alto, cuerpo) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
  .lienzo { width: ${ancho}px; height: ${alto}px; }</style></head>
  <body><div class="lienzo"><div class="mesh"></div><div class="franjas"></div>
  <div class="capa">${cuerpo}</div></div></body></html>`;
}

const pieContacto = (tam) => `
  <div class="pie" style="padding-top:${tam}px; font-size:${tam}px; flex-direction:column; gap:${Math.round(tam * 0.4)}px">
    <span>WhatsApp ${WHATSAPP}</span>
    <span style="font-size:${Math.round(tam * 0.86)}px; color:rgba(255,255,255,.62)">${INSTAGRAM}</span>
  </div>`;

const cajaUrl = (padY, padX, tamArriba, tamUrl, radio) => `
  <div class="url" style="padding:${padY}px ${padX}px; border-radius:${radio}px">
    <span class="arriba" style="font-size:${tamArriba}px; margin-bottom:${Math.round(tamArriba * 0.5)}px">Visítanos en</span>
    <span style="font-size:${tamUrl}px">${SITIO}</span>
  </div>`;

const mosaico = (nombres, cols, alturaCelda, gap) => `
  <div class="mosaico" style="grid-template-columns:repeat(${cols},1fr); gap:${gap}px">
    ${nombres.map((n) => `<div class="celda" style="height:${alturaCelda}px"><img src="${prod(n)}"></div>`).join('')}
  </div>`;

// ---------------------------------------------------------------------------
// Las piezas
// ---------------------------------------------------------------------------

const BANNERS = [
  {
    id: 'ig1',
    nota: 'Instagram — publicación cuadrada. El anuncio principal.',
    ancho: 1080,
    alto: 1080,
    cuerpo: `
      <div style="padding:62px 80px 54px; display:flex; flex-direction:column; height:100%">
        <div class="etiqueta" style="padding:15px 32px; font-size:23px; letter-spacing:.2em">
          <span class="punto" style="width:14px; height:14px"></span>Ya estamos en línea
        </div>
        <div class="tarjeta-logo" style="margin-top:44px; padding:34px 50px">
          <img src="${LOGO}" style="height:124px; display:block">
        </div>
        <h1 style="margin-top:44px; font-size:88px">
          Ya tenemos<br><span class="resalte">página web</span>
        </h1>
        <p class="bajada" style="margin-top:28px; font-size:30px; padding:0 24px">
          Mira nuestro catálogo completo de desechables
          y productos de limpieza al por mayor
        </p>
        <div style="margin-top:42px">${cajaUrl(30, 50, 21, 38, 24)}</div>
        ${pieContacto(25)}
      </div>`,
  },

  {
    id: 'ig2',
    nota: 'Instagram — historia vertical. Lleva “enlace en la bio”.',
    ancho: 1080,
    alto: 1920,
    cuerpo: `
      <div style="padding:150px 80px 130px; display:flex; flex-direction:column; height:100%">
        ${mosaico(['escobas-altas', 'galon-desinfectante', 'papel-encerado'], 3, 300, 14)}
        <div class="tarjeta-logo" style="margin-top:90px; padding:44px 62px">
          <img src="${LOGO}" style="height:160px; display:block">
        </div>
        <h1 style="margin-top:70px; font-size:104px">
          Nuestro<br>catálogo<br><span class="resalte">ya está<br>en línea</span>
        </h1>
        <p class="bajada" style="margin-top:44px; font-size:36px">
          55 productos con precio de mayoreo
        </p>
        <div style="margin-top:70px">${cajaUrl(40, 56, 24, 40, 28)}</div>
        <div style="margin-top:auto; text-align:center; font-size:34px; font-weight:800; color:#FFB020">
          ↑ Enlace en la biografía
        </div>
      </div>`,
  },

  {
    id: 'ig3',
    nota: 'Instagram — cuadrada con mosaico de productos.',
    ancho: 1080,
    alto: 1080,
    cuerpo: `
      <div style="position:absolute; inset:0; z-index:0">
        ${mosaico(
          [
            'escobas-altas', 'galon-desinfectante', 'papel-encerado',
            'ambientador-glade', 'lavaplatos-tarro', 'atomizadores-spray',
            'deposito-4oz', 'panos-wypall', 'jabon-bola-xtra',
          ],
          3,
          360,
          0
        )}
      </div>
      <div style="position:absolute; inset:0; z-index:1; background:linear-gradient(180deg, rgba(24,6,16,.82), rgba(176,38,71,.88))"></div>
      <div style="position:relative; z-index:2; padding:80px; display:flex; flex-direction:column; height:100%; align-items:center; justify-content:center">
        <img src="${MONOGRAMA}" style="height:104px; background:#fff; border-radius:26px; padding:16px 22px">
        <div style="margin-top:44px; font-size:190px; font-weight:800; line-height:.9; letter-spacing:-.04em">55</div>
        <div style="font-size:44px; font-weight:800; letter-spacing:.02em">productos en línea</div>
        <p class="bajada" style="margin-top:30px; font-size:30px">
          Desechables para tu negocio y todo lo de limpieza,
          en un solo proveedor
        </p>
        <div style="margin-top:52px">${cajaUrl(32, 52, 21, 38, 24)}</div>
      </div>`,
  },

  {
    id: 'wsp1',
    nota: 'WhatsApp — cuadrada para enviar en chats y grupos.',
    ancho: 1080,
    alto: 1080,
    cuerpo: `
      <div style="padding:58px 80px 52px; display:flex; flex-direction:column; height:100%">
        <div class="tarjeta-logo" style="padding:30px 46px">
          <img src="${LOGO}" style="height:112px; display:block">
        </div>
        <h1 style="margin-top:38px; font-size:76px">
          Nuestro catálogo<br><span class="resalte">ahora en línea</span>
        </h1>
        <p class="bajada" style="margin-top:24px; font-size:28px; padding:0 20px">
          Mira los 55 productos, elige lo que necesitas
          y escríbenos para cotizar
        </p>
        <div style="margin-top:36px">${cajaUrl(26, 46, 19, 34, 22)}</div>
        <div class="url verde" style="margin-top:18px; padding:24px 46px; border-radius:22px; text-align:center">
          <span class="arriba" style="font-size:19px; color:#0d1b12; opacity:.7; margin-bottom:8px">Pedidos por WhatsApp</span>
          <span style="font-size:40px">${WHATSAPP}</span>
        </div>
        ${pieContacto(23)}
      </div>`,
  },

  {
    id: 'wsp2',
    nota: 'WhatsApp — estado vertical, letra grande para leer de un vistazo.',
    ancho: 1080,
    alto: 1920,
    cuerpo: `
      <div style="padding:190px 90px 150px; display:flex; flex-direction:column; height:100%; align-items:center">
        <div class="tarjeta-logo" style="padding:50px 70px">
          <img src="${LOGO}" style="height:180px; display:block">
        </div>
        <div class="etiqueta" style="margin-top:80px; padding:18px 40px; font-size:28px; letter-spacing:.2em">
          <span class="punto" style="width:16px; height:16px"></span>Novedad
        </div>
        <h1 style="margin-top:66px; font-size:116px">
          Ya tenemos<br><span class="resalte">página web</span>
        </h1>
        <p class="bajada" style="margin-top:52px; font-size:40px">
          Todo nuestro catálogo de desechables
          y limpieza, a un clic
        </p>
        <div style="margin-top:86px; width:100%">${cajaUrl(44, 40, 26, 42, 30)}</div>
        <div class="url verde" style="margin-top:26px; width:100%; padding:38px 40px; border-radius:30px">
          <span class="arriba" style="font-size:24px; color:#0d1b12; opacity:.7; margin-bottom:12px">Pedidos y cotizaciones</span>
          <span style="font-size:56px">${WHATSAPP}</span>
        </div>
      </div>`,
  },

  {
    id: 'wsp3',
    nota: 'WhatsApp — cuadrada que muestra las dos líneas de producto.',
    ancho: 1080,
    alto: 1080,
    cuerpo: `
      <div style="padding:70px 74px; display:flex; flex-direction:column; height:100%">
        <div style="display:flex; align-items:center; justify-content:center; gap:26px">
          <img src="${MONOGRAMA}" style="height:82px; background:#fff; border-radius:20px; padding:12px 16px">
          <div style="font-size:34px; font-weight:800; line-height:1.15">
            Distribuidora<br>Gutiérrez
          </div>
        </div>

        <h1 style="margin-top:46px; font-size:62px">Dos líneas, un solo pedido</h1>

        <div style="margin-top:44px; display:grid; grid-template-columns:1fr 1fr; gap:20px">
          <div style="background:rgba(255,255,255,.12); border:2px solid rgba(255,255,255,.22); border-radius:28px; padding:34px 30px">
            <div style="font-size:56px">🥡</div>
            <div style="margin-top:16px; font-size:34px; font-weight:800">Desechables</div>
            <div style="margin-top:12px; font-size:24px; font-weight:500; color:rgba(255,255,255,.78); line-height:1.4">
              Depósitos, bandejas,<br>porcioneros, papel film
            </div>
            <div style="margin-top:18px; font-size:22px; font-weight:800; color:#FFB020">20 productos</div>
          </div>
          <div style="background:rgba(255,255,255,.12); border:2px solid rgba(255,255,255,.22); border-radius:28px; padding:34px 30px">
            <div style="font-size:56px">🧹</div>
            <div style="margin-top:16px; font-size:34px; font-weight:800">Limpieza</div>
            <div style="margin-top:12px; font-size:24px; font-weight:500; color:rgba(255,255,255,.78); line-height:1.4">
              Escobas, detergentes,<br>desinfectantes, fibras
            </div>
            <div style="margin-top:18px; font-size:22px; font-weight:800; color:#FFB020">35 productos</div>
          </div>
        </div>

        <div style="margin-top:38px">${cajaUrl(26, 44, 19, 34, 22)}</div>
        ${pieContacto(23)}
      </div>`,
  },
];

// ---------------------------------------------------------------------------

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const navegador = await webkit.launch();

  for (const b of BANNERS) {
    const ctx = await navegador.newContext({
      viewport: { width: b.ancho, height: b.alto },
      deviceScaleFactor: 1,
    });
    const pag = await ctx.newPage();
    // Se guarda a disco y se abre con goto: asi el documento tiene origen y
    // la hoja de Google Fonts se descarga (con setContent queda bloqueada).
    const tmp = path.join(SALIDA, '.' + b.id + '.html');
    fs.writeFileSync(tmp, documento(b.ancho, b.alto, b.cuerpo), 'utf8');
    await pag.goto('file:///' + tmp.split(path.sep).join('/'), { waitUntil: 'load' });
    await pag.evaluate(() => document.fonts.ready);
    await pag.waitForTimeout(1200);

    const archivo = path.join(SALIDA, b.id + '.png');
    await pag.screenshot({ path: archivo });
    const kb = Math.round(fs.statSync(archivo).size / 1024);
    console.log(`${b.id.padEnd(5)} ${String(b.ancho).padStart(4)}x${String(b.alto).padEnd(4)}  ${String(kb).padStart(4)} KB  ${b.nota}`);

    await ctx.close();
    fs.unlinkSync(tmp);
  }

  await navegador.close();
  console.log('\nBanners en: ' + SALIDA);
})();
