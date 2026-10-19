-- Fase 01 - identidad, empresa, membresias, permisos y auditoria base.
-- Cada tabla expuesta habilita RLS y recibe sus grants en esta misma migracion.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'finanzas_rpc') then
    create role finanzas_rpc nologin noinherit nobypassrls;
  end if;
end
$$;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated, finanzas_rpc;
grant usage on schema public to finanzas_rpc;

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(btrim(nombre)) between 1 and 120),
  moneda text not null default 'USD' check (moneda ~ '^[A-Z]{3}$'),
  origen_datos text not null default 'simulado' check (origen_datos in ('simulado', 'real')),
  zona_horaria text not null default 'America/El_Salvador',
  revision_datos integer not null default 1 check (revision_datos >= 1),
  revision_catalogo integer not null default 1 check (revision_catalogo >= 1),
  version integer not null default 1 check (version >= 1),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_visible text not null check (length(btrim(nombre_visible)) between 1 and 120),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique check (codigo ~ '^[a-z_]+$'),
  nombre text not null check (length(btrim(nombre)) between 1 and 80),
  creado_en timestamptz not null default now()
);

create table public.permisos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique check (codigo ~ '^[a-z_]+\.[a-z_]+$'),
  descripcion text not null check (length(btrim(descripcion)) between 1 and 180),
  creado_en timestamptz not null default now()
);

create table public.rol_permisos (
  rol_id uuid not null references public.roles (id) on delete cascade,
  permiso_id uuid not null references public.permisos (id) on delete cascade,
  primary key (rol_id, permiso_id)
);

create table public.membresias_empresa (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  rol_id uuid not null references public.roles (id) on delete restrict,
  activa boolean not null default true,
  version integer not null default 1 check (version >= 1),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (empresa_id, usuario_id),
  unique (empresa_id, id)
);

create table public.auditoria (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  accion text not null check (length(btrim(accion)) between 1 and 120),
  entidad_tipo text not null check (length(btrim(entidad_tipo)) between 1 and 80),
  entidad_id uuid,
  instante timestamptz not null default now(),
  motivo text,
  request_id text not null check (length(btrim(request_id)) between 1 and 120),
  version_anterior integer,
  version_nueva integer,
  cambio_resumido jsonb not null default '{}'::jsonb
);

create index membresias_empresa_usuario_idx
  on public.membresias_empresa (usuario_id, activa);
create index membresias_empresa_empresa_idx
  on public.membresias_empresa (empresa_id, activa);
create index auditoria_empresa_instante_idx
  on public.auditoria (empresa_id, instante desc);
create index auditoria_entidad_idx
  on public.auditoria (empresa_id, entidad_tipo, entidad_id, instante desc);

create table private.operaciones_idempotentes (
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  operacion text not null check (length(btrim(operacion)) between 1 and 80),
  clave text not null check (length(btrim(clave)) between 1 and 160),
  hash_payload text not null,
  resultado_json jsonb not null,
  creado_por uuid references auth.users (id) on delete set null,
  creado_en timestamptz not null default now(),
  primary key (empresa_id, operacion, clave)
);

alter table private.operaciones_idempotentes enable row level security;

create policy operaciones_idempotentes_rpc
  on private.operaciones_idempotentes
  for all
  to finanzas_rpc
  using (true)
  with check (true);

grant select, insert, update
  on private.operaciones_idempotentes
  to finanzas_rpc;

-- Helpers de autorizacion. Devuelven solo booleanos y se ejecutan como owner
-- para evitar recursion sobre las politicas de membresias.
create or replace function private.tiene_membresia(p_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.membresias_empresa m
    where m.empresa_id = p_empresa_id
      and m.usuario_id = auth.uid()
      and m.activa
  );
$$;

create or replace function private.tiene_permiso(p_empresa_id uuid, p_permiso text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.membresias_empresa m
    join public.rol_permisos rp on rp.rol_id = m.rol_id
    join public.permisos p on p.id = rp.permiso_id
    where m.empresa_id = p_empresa_id
      and m.usuario_id = auth.uid()
      and m.activa
      and p.codigo = p_permiso
  );
$$;

create or replace function private.registrar_auditoria(
  p_empresa_id uuid,
  p_accion text,
  p_entidad_tipo text,
  p_entidad_id uuid,
  p_request_id text,
  p_motivo text,
  p_version_anterior integer,
  p_version_nueva integer,
  p_cambio_resumido jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'NO_AUTENTICADO';
  end if;

  insert into public.auditoria (
    empresa_id,
    actor_id,
    accion,
    entidad_tipo,
    entidad_id,
    request_id,
    motivo,
    version_anterior,
    version_nueva,
    cambio_resumido
  )
  values (
    p_empresa_id,
    auth.uid(),
    p_accion,
    p_entidad_tipo,
    p_entidad_id,
    coalesce(nullif(btrim(p_request_id), ''), gen_random_uuid()::text),
    p_motivo,
    p_version_anterior,
    p_version_nueva,
    coalesce(p_cambio_resumido, '{}'::jsonb)
  );
end;
$$;

revoke all on function private.tiene_membresia(uuid) from public, anon;
revoke all on function private.tiene_permiso(uuid, text) from public, anon;
revoke all on function private.registrar_auditoria(
  uuid, text, text, uuid, text, text, integer, integer, jsonb
) from public, anon;

grant execute on function private.tiene_membresia(uuid) to authenticated, finanzas_rpc;
grant execute on function private.tiene_permiso(uuid, text) to authenticated, finanzas_rpc;
grant execute on function private.registrar_auditoria(
  uuid, text, text, uuid, text, text, integer, integer, jsonb
) to finanzas_rpc;

-- Permisos efectivos del usuario para una empresa. La identidad sale de
-- auth.uid(); nunca se acepta un usuario arbitrario.
create or replace function public.mis_permisos(p_empresa_id uuid)
returns table (codigo text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.codigo
  from public.membresias_empresa m
  join public.rol_permisos rp on rp.rol_id = m.rol_id
  join public.permisos p on p.id = rp.permiso_id
  where m.empresa_id = p_empresa_id
    and m.usuario_id = auth.uid()
    and m.activa
  order by p.codigo;
$$;

revoke all on function public.mis_permisos(uuid) from public, anon;
grant execute on function public.mis_permisos(uuid) to authenticated;

-- Perfil minimo al crear una identidad en Auth. El nombre es solo visible;
-- no concede acceso financiero.
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre_visible)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'nombre_visible'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Usuario'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.crear_perfil_nuevo_usuario() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.crear_perfil_nuevo_usuario();

alter table public.empresas enable row level security;
alter table public.perfiles enable row level security;
alter table public.roles enable row level security;
alter table public.permisos enable row level security;
alter table public.rol_permisos enable row level security;
alter table public.membresias_empresa enable row level security;
alter table public.auditoria enable row level security;

revoke all on table public.empresas from anon, authenticated;
revoke all on table public.perfiles from anon, authenticated;
revoke all on table public.roles from anon, authenticated;
revoke all on table public.permisos from anon, authenticated;
revoke all on table public.rol_permisos from anon, authenticated;
revoke all on table public.membresias_empresa from anon, authenticated;
revoke all on table public.auditoria from anon, authenticated;

grant select on table public.empresas to authenticated;
grant select on table public.perfiles to authenticated;
grant select on table public.roles to authenticated;
grant select on table public.permisos to authenticated;
grant select on table public.rol_permisos to authenticated;
grant select on table public.membresias_empresa to authenticated;
grant select on table public.auditoria to authenticated;

create policy empresas_select
  on public.empresas
  for select
  to authenticated
  using (private.tiene_membresia(id));

create policy perfiles_select
  on public.perfiles
  for select
  to authenticated
  using (id = auth.uid());

create policy roles_select
  on public.roles
  for select
  to authenticated
  using (true);

create policy permisos_select
  on public.permisos
  for select
  to authenticated
  using (true);

create policy rol_permisos_select
  on public.rol_permisos
  for select
  to authenticated
  using (true);

create policy membresias_select
  on public.membresias_empresa
  for select
  to authenticated
  using (
    usuario_id = auth.uid()
    or private.tiene_permiso(empresa_id, 'usuarios.gestionar')
  );

create policy auditoria_select
  on public.auditoria
  for select
  to authenticated
  using (private.tiene_permiso(empresa_id, 'auditoria.leer'));

-- El rol interno necesita actualizar la empresa al publicar catalogo o crear
-- periodos. Los grants concretos se completan en la migracion de catalogo.
create policy empresas_rpc_update
  on public.empresas
  for update
  to finanzas_rpc
  using (true)
  with check (true);
