# Probar el sitio como si fuera un iPhone

`probar-ios.js` abre el sitio en **WebKit**, el mismo motor que usa Safari, y
comprueba lo que suele romperse solo en iOS: contenido que queda invisible,
desbordes horizontales, imágenes que no cargan y errores de JavaScript.

Corre en Windows, no hace falta un iPhone ni una Mac.

## Uso

Una vez, para descargar el motor (unos 100 MB):

```
npm install playwright
npx playwright install webkit
```

Después, con el sitio levantado:

```
node herramientas/probar-ios.js http://localhost:3000
```

O contra el sitio publicado:

```
node herramientas/probar-ios.js https://distribuidora-gutierrez.vercel.app
```

Las capturas quedan en `herramientas/capturas/`.

## Qué revisa

Corre la prueba dos veces: con JavaScript y sin él. La segunda es la
importante — si el sitio se ve bien sin JavaScript, entonces un error de
carga en el teléfono de un cliente no puede dejarlo en blanco.

En un sitio sano, **contenido invisible** debe dar 0 en la pasada sin
JavaScript. En la pasada con JavaScript es normal que dé un número mayor que
cero: son las secciones de más abajo, que aparecen al bajar por la página.

## Ojo con esto

WebKit de Playwright no es Safari exacto: le faltan cosas propias de Apple y
suele ir por delante en versión. Sirve para detectar la mayoría de los
problemas, pero para confirmar en un iPhone de verdad conviene una sesión en
BrowserStack o LambdaTest, que dan acceso a dispositivos reales.
