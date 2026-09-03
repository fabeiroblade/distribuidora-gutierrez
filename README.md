# Distribuidora Gutiérrez — sitio de catálogo

Catálogo web de desechables y productos de limpieza al por mayor, con cotización
directa por WhatsApp. Next.js 14 (App Router) + TypeScript + Tailwind CSS +
Framer Motion, listo para desplegar en Vercel.

> **Importante:** aunque la carpeta vive dentro de `htdocs`, **XAMPP/Apache no
> puede servir este sitio**. No es PHP: es una aplicación Node. Abrir
> `http://localhost/e_commerce` no funciona. Hay que levantarla con los comandos
> de abajo y entrar por `http://localhost:3000`.

---

## Arrancar en local

```bash
cd C:/xampp/htdocs/e_commerce && npm install
```

Modo desarrollo (recarga al guardar cambios):

```bash
cd C:/xampp/htdocs/e_commerce && npm run dev
```

Modo producción (lo que verá el visitante):

```bash
cd C:/xampp/htdocs/e_commerce && npm run build && npm start
```

En ambos casos el sitio queda en **http://localhost:3000**.

---

## Datos del catálogo

Todo el contenido del catálogo vive en la carpeta **`data/`**. Para agregar,
quitar o corregir productos no hace falta tocar el código.

| Archivo | Qué contiene |
| --- | --- |
| `data/productos.json` | Los 55 productos |
| `data/categorias.json` | Las 7 categorías y su familia (Desechables / Limpieza) |

### Estructura de un producto

```json
{
  "id": "deposito-1oz",
  "nombre": "Depósito transparente 1 oz con tapadera",
  "descripcion": "Depósito plástico transparente de 1 onza con tapadera incluida...",
  "categoria": "contenedores",
  "imagen": "/productos/deposito-1oz.jpg",
  "precio": null,
  "presentaciones": ["Caja de 1,800 unidades", "Paquete de 100 unidades"],
  "destacado": true
}
```

- **`id`** — único, en minúsculas y con guiones.
- **`categoria`** — tiene que coincidir con un `id` de `data/categorias.json`.
- **`imagen`** — ruta dentro de `public/`. Las fotos van en `public/productos/`,
  cuadradas (700×700 px) para que la parrilla quede pareja.
- **`precio`** — `null` muestra la etiqueta **«Precio de mayoreo»** e invita a
  cotizar. Si algún día se publican precios, se pone el número (ej. `12.5`) y la
  tarjeta lo formatea en dólares automáticamente.
- **`destacado`** — `true` pinta el distintivo «Más pedido».

Las imágenes actuales se recortaron de las 11 láminas del catálogo impreso; los
originales quedaron en `_source_sheets/` junto con los scripts de recorte, fuera
del despliegue.

---

## Contacto y redes

Los números y perfiles **no están escritos en el código**: salen de variables de
entorno. Se editan en `.env.local` para local, y en Vercel desde
*Project Settings → Environment Variables*.

| Variable | Para qué sirve |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP` | Número de WhatsApp con código de país, **solo dígitos** (ej. `50370001234`) |
| `NEXT_PUBLIC_TELEFONOS` | Teléfonos separados por coma. El primero es el que usa el botón «Llamar». Se les antepone `+503` solo |
| `NEXT_PUBLIC_EMAIL` | Correo de ventas |
| `NEXT_PUBLIC_INSTAGRAM` | URL completa del perfil |
| `NEXT_PUBLIC_FACEBOOK` | URL completa del perfil. **Vacía por ahora** |
| `NEXT_PUBLIC_TIKTOK` | URL completa del perfil. Vacía por ahora |
| `NEXT_PUBLIC_DIRECCION` | Dirección que aparece en contacto y pie de página |
| `NEXT_PUBLIC_HORARIO` | Horario de atención |
| `NEXT_PUBLIC_MAPA` | Opcional; enlace a Google Maps |
| `NEXT_PUBLIC_SITE_URL` | Dominio final, usado por el sitemap y las etiquetas para redes |

`.env.example` tiene la plantilla completa con ejemplos.

> Ya están cargados los datos reales: correo, los tres teléfonos, el WhatsApp
> (7483-1791) e Instagram (`@distribuidoragutierrez140724`).
>
> **Las redes sin perfil no se muestran.** Facebook y TikTok están vacías, así
> que sus botones no aparecen en ninguna parte del sitio. Para activar Facebook
> basta poner su URL en `NEXT_PUBLIC_FACEBOOK` y volver a desplegar; el botón
> reaparece solo, sin tocar código.
>
> **Después de cambiar una variable hay que volver a desplegar**: Next las
> incrusta durante el build.

---

## Publicar en Vercel

1. Subir la carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → *Add New → Project* → importar el repo.
   Vercel detecta Next.js solo; no hay que configurar nada del build.
3. En *Environment Variables*, cargar las variables de la tabla de arriba.
4. *Deploy*.

Para actualizar el catálogo después: se edita `data/productos.json`, se sube el
cambio a GitHub y Vercel vuelve a desplegar automáticamente.

---

## Cómo está organizado

```
app/          layout con el SEO, página principal, sitemap.xml y robots.txt
components/   secciones y piezas de interfaz
lib/          tipos, lectura del catálogo y configuración de contacto
data/         catálogo en JSON  ← lo que se edita a diario
public/       logos e imágenes de producto
```

Secciones de la página: portada, categorías, catálogo con filtros y buscador,
nosotros, contacto y pie de página. Además hay un botón flotante de WhatsApp
siempre visible y una barra lateral con las redes.

---

## Detalles que conviene saber

- **Modo oscuro**: el botón del encabezado lo alterna y la preferencia queda
  guardada en el navegador. La primera visita respeta la configuración del
  sistema.
- **Buscador**: ignora acentos, así que «jabon» encuentra «jabón». Busca en
  nombre, descripción, presentaciones y categoría.
- **Imágenes**: se sirven en AVIF/WebP y se cargan a medida que se baja por la
  página. Solo las primeras cuatro se cargan de inmediato.
- **Animaciones**: si el sistema del visitante pide reducir el movimiento, se
  desactivan el parallax y las apariciones.
- **SEO**: etiquetas para Google y redes sociales, datos estructurados
  `schema.org` con la tienda y los 55 productos, `sitemap.xml` y `robots.txt`.
