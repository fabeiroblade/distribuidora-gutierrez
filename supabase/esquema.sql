-- ===========================================================================
-- Distribuidora Gutiérrez — esquema del catálogo y los usuarios del panel
--
-- Se ejecuta una sola vez, en Supabase → SQL Editor → New query → Run.
-- Es idempotente: se puede volver a correr sin romper nada.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Perfiles: extiende auth.users con el rol dentro del panel
-- ---------------------------------------------------------------------------

create table if not exists public.perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text not null default '',
  rol         text not null default 'editor' check (rol in ('admin', 'editor')),
  creado_en   timestamptz not null default now()
);

comment on table public.perfiles is
  'Un registro por usuario del panel. admin puede todo, incluido crear usuarios; editor solo administra el catálogo.';


-- Cada usuario que nace en auth.users recibe su perfil automáticamente.
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'rol', 'editor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();


-- ---------------------------------------------------------------------------
-- 2. Categorías
-- ---------------------------------------------------------------------------

create table if not exists public.categorias (
  id      text primary key,
  nombre  text not null,
  grupo   text not null,
  emoji   text not null default '📦',
  orden   int  not null default 0
);


-- ---------------------------------------------------------------------------
-- 3. Productos
-- ---------------------------------------------------------------------------

create table if not exists public.productos (
  id              text primary key,
  nombre          text not null,
  descripcion     text not null default '',
  categoria       text not null references public.categorias(id) on update cascade,
  imagen          text not null,            -- portada: siempre imagenes[1]
  imagenes        text[] not null default '{}',
  precio          numeric(10,2),          -- null = "Precio de mayoreo"
  presentaciones  text[] not null default '{}',
  destacado       boolean not null default false,
  activo          boolean not null default true,
  orden           int not null default 0,
  creado_en       timestamptz not null default now(),
  editado_en      timestamptz not null default now()
);

create index if not exists productos_categoria_idx on public.productos (categoria);
create index if not exists productos_activo_idx    on public.productos (activo);

comment on column public.productos.activo is
  'false esconde el producto del sitio público sin borrarlo del panel.';

comment on column public.productos.imagenes is
  'Galería del producto. La primera es la portada y se refleja en la columna imagen.';

-- Para bases creadas antes de que existiera la galería.
alter table public.productos
  add column if not exists imagenes text[] not null default '{}';

update public.productos
set imagenes = array[imagen]
where cardinality(imagenes) = 0 and imagen <> '';

-- Marca de tiempo de la última edición, para saber qué se tocó y cuándo.
create or replace function public.tocar_editado_en()
returns trigger language plpgsql as $$
begin
  new.editado_en = now();
  return new;
end;
$$;

drop trigger if exists al_editar_producto on public.productos;
create trigger al_editar_producto
  before update on public.productos
  for each row execute function public.tocar_editado_en();


-- ---------------------------------------------------------------------------
-- 4. Quién es quién  (funciones auxiliares para las políticas)
-- ---------------------------------------------------------------------------

-- security definer para poder leer perfiles sin caer en recursión de políticas.
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

create or replace function public.tiene_panel()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.perfiles where id = auth.uid());
$$;


-- ---------------------------------------------------------------------------
-- 5. Permisos
--
-- RLS decide POR FILA, pero antes hace falta el permiso sobre la tabla. Sin el
-- grant, Postgres responde "permission denied for table" aunque la política
-- sea correcta. Son dos capas distintas y hacen falta las dos.
-- ---------------------------------------------------------------------------

alter table public.perfiles   enable row level security;
alter table public.categorias enable row level security;
alter table public.productos  enable row level security;

grant usage on schema public to anon, authenticated;

-- El visitante del sitio solo lee el catálogo.
grant select on public.categorias, public.productos to anon, authenticated;

-- Quien entra al panel además escribe.
grant insert, update, delete on public.categorias, public.productos to authenticated;
grant select, insert, update, delete on public.perfiles to authenticated;

-- El rol de servicio se salta las políticas por fila, pero NO los permisos de
-- tabla. Suele recibirlos solos cuando el proyecto expone las tablas nuevas de
-- forma automática; con esa opción apagada —que es lo recomendable— hay que
-- dárselos aquí, o la migración responde "permission denied for table".
grant select, insert, update, delete on public.categorias, public.productos, public.perfiles to service_role;


-- --- Políticas: catálogo -----------------------------------------------------

drop policy if exists "catalogo visible para todos" on public.productos;
create policy "catalogo visible para todos"
  on public.productos for select
  using (activo or public.tiene_panel());

drop policy if exists "el panel administra productos" on public.productos;
create policy "el panel administra productos"
  on public.productos for all
  using (public.tiene_panel())
  with check (public.tiene_panel());

drop policy if exists "categorias visibles para todos" on public.categorias;
create policy "categorias visibles para todos"
  on public.categorias for select using (true);

drop policy if exists "el panel administra categorias" on public.categorias;
create policy "el panel administra categorias"
  on public.categorias for all
  using (public.tiene_panel())
  with check (public.tiene_panel());


-- --- Políticas: perfiles -----------------------------------------------------

drop policy if exists "cada quien ve su perfil" on public.perfiles;
create policy "cada quien ve su perfil"
  on public.perfiles for select
  using (id = auth.uid() or public.es_admin());

drop policy if exists "cada quien edita su nombre" on public.perfiles;
create policy "cada quien edita su nombre"
  on public.perfiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and rol = (select rol from public.perfiles where id = auth.uid()));

drop policy if exists "el admin administra perfiles" on public.perfiles;
create policy "el admin administra perfiles"
  on public.perfiles for all
  using (public.es_admin())
  with check (public.es_admin());


-- ---------------------------------------------------------------------------
-- 6. Almacén de imágenes
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos', 'productos', true, 3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "imagenes visibles para todos" on storage.objects;
create policy "imagenes visibles para todos"
  on storage.objects for select
  using (bucket_id = 'productos');

drop policy if exists "el panel sube imagenes" on storage.objects;
create policy "el panel sube imagenes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'productos' and public.tiene_panel());

drop policy if exists "el panel reemplaza imagenes" on storage.objects;
create policy "el panel reemplaza imagenes"
  on storage.objects for update to authenticated
  using (bucket_id = 'productos' and public.tiene_panel());

drop policy if exists "el panel borra imagenes" on storage.objects;
create policy "el panel borra imagenes"
  on storage.objects for delete to authenticated
  using (bucket_id = 'productos' and public.tiene_panel());


-- ---------------------------------------------------------------------------
-- 7. Convertir en administrador al primer usuario
--
-- Después de crear tu cuenta desde Authentication → Users, corré esto con tu
-- correo para darte el rol de admin. Los demás usuarios los creás ya desde el
-- panel, sin volver aquí.
-- ---------------------------------------------------------------------------

-- update public.perfiles set rol = 'admin'
-- where id = (select id from auth.users where email = 'tucorreo@ejemplo.com');
