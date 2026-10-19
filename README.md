# Carlitos Finanzas

Sistema academico de analisis financiero, presupuestos y proyecciones para la
Panaderia Carlitos. Trabaja con datos simulados, moneda USD y reglas
deterministas que deben poder explicarse y reproducirse.

> **Estado:** Fase 01 parcial. Ya funcionan el acceso con Supabase, la
> resolucion de membresia y permisos, el catalogo de cuentas, los periodos
> contables y la auditoria. La administracion de usuarios, el diario, los
> estados y el motor financiero siguen en fases posteriores y sus pantallas
> conservan el estado "En construccion".

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript estricto
- Tailwind CSS 4 con tokens de marca
- Supabase (PostgreSQL, Auth, Storage) y Supabase CLI
- Zod para validacion y decimal.js para aritmetica de 40 digitos
- Atomic Design: atoms, molecules, organisms y templates

## Requisitos

- Node.js 22 (`.nvmrc`)
- npm 10+
- Docker para levantar Supabase local

## Inicio rapido

```bash
npm ci
cp .env.example .env.local
npx supabase start
npx supabase status -o env   # consulta PUBLISHABLE_KEY y SERVICE_ROLE_KEY
```

Completar `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con `PUBLISHABLE_KEY` del estado local
- `SUPABASE_ADMIN_KEY` con `SERVICE_ROLE_KEY` del estado local
- `DEMO_SEED_ENABLED=true`
- `DEMO_USER_PASSWORD` con una contrasena local

Despues:

```bash
npm run preparar:demo   # crea admin, analista, gerencia y una empresa B de prueba
npm run dev
```

Abrir <http://localhost:3000>. La raiz resuelve la sesion y redirige a `/login`
o `/dashboard`.

> `.env.local` no se versiona. Sin Supabase configurado la aplicacion no puede
> resolver identidad ni datos: el login muestra un error de configuracion.

## Usuarios demo

El script `preparar:demo` es idempotente y no imprime contrasenas. Crea:

| Correo | Rol | Empresa |
| --- | --- | --- |
| `admin@carlitos.local` | administrador | Panaderia Carlitos |
| `analista@carlitos.local` | analista | Panaderia Carlitos |
| `gerencia@carlitos.local` | gerencia | Panaderia Carlitos |
| `ajena@demo.local` | analista | Empresa Demo B |

La contrasena es la definida en `DEMO_USER_PASSWORD`. La cuenta `ajena` sirve
para comprobar el aislamiento entre empresas.

## Comandos

| Comando | Proposito |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run start` | Ejecutar el build |
| `npm run lint` | ESLint y fronteras entre capas |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run test:unit` | Tests unitarios de logica pura (Vitest) |
| `npm run test:watch` | Vitest en modo interactivo |
| `npm run verificar:entorno` | Node, Docker, Supabase CLI y variables |
| `npm run preparar:demo` | Crear usuarios demo locales idempotentes |
| `npx supabase start` | Levantar Supabase local |
| `npx supabase migration up --local` | Aplicar migraciones pendientes |
| `npx supabase db reset --local` | Reconstruir la base local descartable |

`db reset --local` destruye los datos locales y los usuarios de Auth. Despues
hay que volver a ejecutar `npm run preparar:demo`.

## Estructura

```text
src/app/           rutas y composicion de pantalla
src/components/    Atomic Design (atoms, molecules, organisms, templates)
src/config/        rutas, navegacion, pantallas, permisos, entorno
src/auth/          identidad, contexto y verificacion de permisos
src/controladores/ casos de uso CU-01..CU-23
src/repositorios/  lecturas y llamadas RPC con Supabase
src/servicios/     reglas puras de catalogo y calendario
src/schemas/       validacion Zod
src/lib/           decimal, dinero, errores, utilidades
src/types/         contratos compartidos
src/supabase/      clientes SSR, proxy y admin
supabase/          migraciones, politicas RLS, RPC y semilla
tests/             unit, integration, e2e, fixtures
.github/workflows/ CI (lint, typecheck, tests, build)
docs/              especificacion funcional y tecnica (22 documentos)
```

Las reglas de trabajo, capas, seguridad y convenciones estan en
[`AGENTS.md`](AGENTS.md). La especificacion completa comienza en
[`docs/00_INDICE_Y_PLAN_DOCUMENTAL.md`](docs/00_INDICE_Y_PLAN_DOCUMENTAL.md).

## Nota academica

Los datos de Carlitos son simulados. Un resultado solo se considera valido
cuando proviene del diario contabilizado, conserva su politica de calculo y
muestra las advertencias de conciliacion correspondientes. El catalogo inicial
es una version revisada para la simulacion; su ratificacion funcional definitiva
sigue registrada como PD-01.
