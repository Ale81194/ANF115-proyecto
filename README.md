# Carlitos Finanzas

Sistema academico de analisis financiero, presupuestos y proyecciones para la
Panaderia Carlitos. Trabaja con datos simulados, moneda USD y reglas
deterministas que deben poder explicarse y reproducirse.

> **Estado:** cascaron (Fase 0). La estructura, las reglas y la navegacion estan
> listas. La autenticacion, la base de datos, los casos de uso y el motor
> financiero se implementan por fases. Las pantallas actuales son placeholders y
> no muestran cifras calculadas.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript estricto
- Tailwind CSS 4 con tokens de marca
- Supabase (PostgreSQL, Auth, Storage) y Supabase CLI
- Zod para validacion y decimal.js para aritmetica de 40 digitos
- Atomic Design: atoms, molecules, organisms y templates

## Requisitos

- Node.js 22 (`.nvmrc`)
- npm 10+
- Docker, solo para levantar Supabase local en la Fase 01

## Inicio rapido

```bash
npm ci
cp .env.example .env.local   # completar con los valores de Supabase local
npm run dev
```

Abrir <http://localhost:3000>. La raiz redirige a `/login`.

> Sin `.env.local`, el cascaron funciona igual: las pantallas no consultan
> Supabase todavia. El proxy de sesion se omite hasta que exista configuracion.

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
| `npx supabase start` | Levantar Supabase local (Fase 01) |
| `npx supabase db reset --local` | Reconstruir la base local descartable |

## Estructura

```text
src/app/           rutas y pantallas
src/components/    Atomic Design (atoms, molecules, organisms, templates)
src/config/        rutas, navegacion, pantallas, permisos, entorno
src/lib/           decimal, dinero, errores, utilidades
src/types/         contratos compartidos
src/supabase/      clientes SSR, proxy y admin
supabase/          configuracion, migraciones y semilla
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
muestra las advertencias de conciliacion correspondientes.
