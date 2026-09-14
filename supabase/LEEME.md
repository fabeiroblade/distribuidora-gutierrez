# Panel de administración — puesta en marcha

El sitio ya no depende de editar archivos y hacer `git push`: el catálogo vive
en Supabase y se administra desde `/admin`, con imágenes que se suben desde el
navegador.

Esto se hace **una sola vez**. Después, agregar un producto es entrar al panel,
subir la foto y guardar.

---

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta.
2. **New project**. Ponle un nombre (`distribuidora-gutierrez`), elige una
   contraseña para la base y la región más cercana (`East US` sirve bien para
   El Salvador).
3. Tarda un par de minutos en quedar listo.

## 2. Crear las tablas

En el menú lateral: **SQL Editor → New query**. Pega todo el contenido de
[`esquema.sql`](esquema.sql) y dale **Run**.

Crea las tablas de categorías, productos y perfiles, los permisos, y el almacén
de imágenes. Se puede volver a ejecutar sin romper nada.

## 3. Copiar las credenciales

En **Project Settings → API** hay tres datos:

| En Supabase | En el proyecto |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

Pégalas en `.env.local`, que ya tiene las tres líneas esperando.

> La tercera es **secreta**: da acceso total a la base saltándose todos los
> permisos. No se comparte, no se sube a Git y no se pone en ningún archivo que
> llegue al navegador. Aquí solo se usa en el servidor, para crear usuarios.

## 4. Traer los 55 productos que ya existen

Con las credenciales puestas:

```bash
cd C:/xampp/htdocs/e_commerce && node --env-file=.env.local supabase/migrar.mjs
```

Sube las 55 imágenes al almacén y crea las filas de categorías y productos.
Se puede correr de nuevo sin duplicar nada.

## 5. Crear tu usuario administrador

En Supabase: **Authentication → Users → Add user → Create new user**. Pon tu
correo y una contraseña, y marca **Auto Confirm User**.

Eso te crea como *encargado*. Para volverte administrador, en **SQL Editor**:

```sql
update public.perfiles set rol = 'admin'
where id = (select id from auth.users where email = 'tucorreo@ejemplo.com');
```

Es la única vez que hace falta esto. De aquí en adelante los usuarios se crean
desde el panel.

## 6. Entrar

```bash
cd C:/xampp/htdocs/e_commerce && npm run build && npm start
```

Y abre **http://localhost:3000/admin**.

## 7. Publicar en Vercel

En **Settings → Environment Variables** carga las mismas tres variables y vuelve
a desplegar. El panel queda en
`https://distribuidora-gutierrez.vercel.app/admin`.

---

## Los dos roles

| | Administrador | Encargado |
| --- | --- | --- |
| Ver el catálogo | Sí | Sí |
| Crear, editar y borrar productos | Sí | Sí |
| Subir imágenes | Sí | Sí |
| Publicar y ocultar productos | Sí | Sí |
| Crear y editar categorías | Sí | Sí |
| Crear y eliminar usuarios | Sí | No |
| Cambiar roles | Sí | No |

Para dar de alta al encargado: **Usuarios → Agregar usuario**, con rol
*Encargado*. Entra de inmediato con el correo y la contraseña que le pongas; no
recibe ningún correo de confirmación.

---

## Cómo funciona por dentro

**Las imágenes** se recortan en el navegador antes de subirse: quedan en
700×700 px, centradas y con los lados rellenos del color de sus propias
esquinas. Es el mismo tratamiento que recibieron las 55 fotos originales, así
que la cuadrícula del catálogo se mantiene pareja sin trabajo manual.

**Cada producto admite hasta 8 fotos.** En el panel se suben varias de una vez,
se reordenan con las flechas y se quita la que sobre. La primera de la fila es
la portada: es la que se ve en la parrilla y la que usan las tarjetas de
categoría y los datos para Google. En el sitio, un producto con más de una foto
muestra flechas para pasarlas y unos puntos que indican cuántas hay; en el
teléfono además se deslizan con el dedo. Con una sola foto no aparece ningún
control.

**Nada se duplica.** El identificador de cada categoría sale de su nombre sin
acentos ni mayúsculas, así que «Vasos», «vasos» y «VASOS» son la misma: el
formulario avisa mientras escribes y desactiva el botón. Las fotos se nombran
por su contenido, de modo que subir dos veces la misma imagen no crea dos
archivos en el almacén, y repetirla dentro de un producto se rechaza.

**Al tocar una foto se abre en grande** sobre el catálogo, sin salir de la
página: con flechas, miniaturas y el botón de cotizar. Se cierra con la X, con
Escape o tocando fuera.

**El sitio público** sigue sirviéndose desde caché y se regenera cada hora. Al
guardar algo en el panel se refresca de inmediato, así que el cambio se ve al
instante sin perder velocidad.

**Si la base no responde** o las credenciales faltan, el sitio público muestra
el catálogo guardado en `data/*.json`. Nunca sale vacío. Por eso conviene
conservar esos archivos aunque ya no sean la fuente principal.

**Los permisos** están en la base, no solo en la interfaz: aunque alguien
llamara a la API por fuera, las políticas por fila impiden que un encargado
toque cuentas o que un visitante escriba en el catálogo.

---

## Si algo falla

**«permission denied for table …»** — falta el `grant` sobre la tabla. Las
políticas por fila y los permisos de tabla son dos capas distintas y hacen
falta las dos. Vuelve a correr `esquema.sql`, que incluye ambos.

**El panel dice «Falta conectar la base de datos»** — alguna de las tres
variables está vacía. En local se arregla en `.env.local` y reiniciando; en
Vercel, en las variables de entorno y volviendo a desplegar.

**«No se pudo crear usuario»** — falta `SUPABASE_SERVICE_ROLE_KEY`. Crear
cuentas exige privilegios de administración que la sesión normal no tiene.

**El proyecto de Supabase se pausó** — el plan gratuito pausa los proyectos sin
actividad por una semana. El sitio público consulta la base al regenerarse cada
hora, así que no debería ocurrir; si pasa, se reactiva desde el panel de
Supabase con un botón.
