# Probar el sitio como si fuera un iPhone

`probar-ios.js` abre el sitio en **WebKit**, el mismo motor que usa Safari, y
comprueba lo que suele romperse solo en iOS: contenido que queda invisible,
desbordes horizontales, imágenes que no cargan y errores de JavaScript.

Corre en Windows. No hace falta un iPhone ni una Mac.

Esta carpeta tiene su propio `package.json` a propósito: así Playwright queda
fuera del sitio y Vercel no lo descarga en cada despliegue.

---

## Instalación (una sola vez)

```bash
cd C:/xampp/htdocs/e_commerce/herramientas && npm install && npm run preparar
```

`npm install` trae Playwright y `npm run preparar` descarga el motor WebKit
(unos 100 MB). No hay que repetirlo.

---

## Usarlo

Siempre desde la carpeta `herramientas`.

Contra el sitio publicado — es lo que ve tu cliente:

```bash
cd C:/xampp/htdocs/e_commerce/herramientas && npm run ios -- https://distribuidora-gutierrez.vercel.app
```

Contra tu computadora, para revisar un cambio antes de subirlo. Necesita que el
sitio esté levantado en otra terminal con `npm start`:

```bash
cd C:/xampp/htdocs/e_commerce/herramientas && npm run ios -- http://localhost:3000
```

Las capturas quedan en `herramientas/capturas/`. Son cuatro: portada y catálogo,
con JavaScript y sin él.

---

## Cómo leer el resultado

La prueba corre dos veces. La segunda, **sin JavaScript**, es la importante: si
el sitio se ve bien ahí, un error de carga en el teléfono de un cliente no puede
dejarlo en blanco.

| Línea | Qué esperar |
| --- | --- |
| tarjetas de producto | 55, en ambas pasadas |
| imágenes rotas | 0 |
| contenido invisible | **0 en la pasada sin JavaScript** |
| desborde horizontal | `no` |
| errores de JS | `ninguno` |

En la pasada **con** JavaScript es normal que «contenido invisible» dé un número
mayor que cero: son las secciones de más abajo, que aparecen al bajar por la
página. Solo preocupa si sale distinto de cero **sin** JavaScript.

---

## Ojo con esto

WebKit de Playwright no es Safari exacto: le faltan funciones propias de Apple y
suele ir por delante en versión. Sirve para detectar la mayoría de los
problemas, pero para confirmar en un iPhone de verdad conviene una sesión en
[BrowserStack Live](https://www.browserstack.com/live) o
[LambdaTest](https://www.lambdatest.com), que dan acceso a teléfonos reales.

Lo que **no** sirve para esto es el modo dispositivo de Chrome o Edge: cambia el
tamaño de la ventana pero por dentro sigue siendo Chrome, así que un fallo
exclusivo de Safari no aparece ahí.
