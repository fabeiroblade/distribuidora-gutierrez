/**
 * Prueba el sitio en el motor real de Safari (WebKit) sobre Windows.
 *
 *   node probar.js [url]
 *
 * Abre la pagina como un iPhone, revisa que nada quede invisible o desbordado,
 * y guarda capturas en ./capturas. Repite la prueba con JavaScript desactivado,
 * que es el escenario en el que la version anterior quedaba en blanco.
 */
const { webkit, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL_SITIO = process.argv[2] || 'http://localhost:3000';
const SALIDA = path.join(__dirname, 'capturas');

/** Corre dentro de la pagina: busca contenido invisible y desbordes. */
function auditar() {
  const candidatos = [...document.querySelectorAll('h1,h2,h3,article,p,dl,section,[data-revelar]')];
  const invisibles = candidatos.filter((e) => {
    const s = getComputedStyle(e);
    return (s.opacity === '0' || s.visibility === 'hidden') && e.getBoundingClientRect().height > 0;
  });

  const soporta = (prop, valor) => window.CSS && CSS.supports && CSS.supports(prop, valor);

  return {
    tarjetas: document.querySelectorAll('article').length,
    imagenesRotas: [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).length,
    invisibles: invisibles.length,
    ejemploInvisible: invisibles[0]
      ? invisibles[0].tagName + ': ' + (invisibles[0].textContent || '').trim().slice(0, 50)
      : null,
    desbordeHorizontal:
      document.documentElement.scrollWidth > window.innerWidth
        ? document.documentElement.scrollWidth + ' > ' + window.innerWidth
        : 'no',
    altoPortada: Math.round(document.querySelector('#inicio')?.getBoundingClientRect().height || 0),
    altoVentana: window.innerHeight,
    soporte: {
      svh: soporta('height', '100svh'),
      backdropWebkit: soporta('-webkit-backdrop-filter', 'blur(4px)'),
      backdrop: soporta('backdrop-filter', 'blur(4px)'),
    },
  };
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const navegador = await webkit.launch();
  console.log('WebKit ' + navegador.version() + '  ->  ' + URL_SITIO + '\n');

  for (const conJs of [true, false]) {
    const etiqueta = conJs ? 'con JavaScript' : 'SIN JavaScript';
    const ctx = await navegador.newContext({
      ...devices['iPhone 13'],
      javaScriptEnabled: conJs,
    });
    const pag = await ctx.newPage();

    const errores = [];
    pag.on('pageerror', (e) => errores.push(String(e).slice(0, 120)));
    pag.on('console', (m) => m.type() === 'error' && errores.push(m.text().slice(0, 120)));

    await pag.goto(URL_SITIO, { waitUntil: 'load', timeout: 60000 });
    await pag.waitForTimeout(conJs ? 4000 : 1500);

    const r = await pag.evaluate(auditar);
    console.log('--- ' + etiqueta + ' ---');
    console.log('  tarjetas de producto : ' + r.tarjetas);
    console.log('  imagenes rotas       : ' + r.imagenesRotas);
    console.log('  contenido invisible  : ' + r.invisibles + (r.ejemploInvisible ? '  (' + r.ejemploInvisible + ')' : ''));
    console.log('  desborde horizontal  : ' + r.desbordeHorizontal);
    console.log('  portada / ventana    : ' + r.altoPortada + 'px / ' + r.altoVentana + 'px');
    console.log('  errores de JS        : ' + (errores.length ? errores.length + ' -> ' + errores[0] : 'ninguno'));
    if (conJs) {
      console.log('  soporta 100svh       : ' + r.soporte.svh);
      console.log('  -webkit-backdrop     : ' + r.soporte.backdropWebkit + '   sin prefijo: ' + r.soporte.backdrop);
    }
    console.log();

    const base = conJs ? 'ios-con-js' : 'ios-sin-js';
    await pag.screenshot({ path: path.join(SALIDA, base + '-portada.png') });
    await pag.evaluate(() => document.querySelector('#catalogo')?.scrollIntoView());
    await pag.waitForTimeout(2000);
    await pag.screenshot({ path: path.join(SALIDA, base + '-catalogo.png') });

    await ctx.close();
  }

  await navegador.close();
  console.log('Capturas en: ' + SALIDA);
})();
