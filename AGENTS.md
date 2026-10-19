# AGENTS.md — Reglas del proyecto Carlitos Finanzas

Este archivo es el contrato de trabajo para cualquier persona o agente que
modifique el repositorio. Antes de escribir código, leer la documentación de la
fase correspondiente en `docs/`.

## 1. Proyecto y estado actual

**Carlitos Finanzas** es un sistema academico de analisis financiero para la
Panaderia Carlitos. Trabaja con datos simulados, moneda USD y resultados que
deben poder explicarse y reproducirse.

Estado: **Fase 01 parcial (19/10/2026)**. Existen la estructura, las reglas, la
navegacion, los tokens de marca, el acceso con Supabase, las membresias, el
catalogo de cuentas, los periodos y la auditoria. **No existe todavia**:

- administracion de usuarios y membresias desde la interfaz (CU-02);
- diario, importacion, aprobacion y reversion de asientos;
- estados financieros, indicadores, presupuestos, escenarios, proyecciones y reportes;
- carga de Excel, graficos, exportacion PDF/XLSX y pruebas E2E de todo el recorrido.

No presentar una pantalla placeholder como funcionalidad terminada.

## 2. Fuente de verdad y precedencia

Ante una duda, consultar en este orden:

| Prioridad | Documento | Decide sobre |
| --- | --- | --- |
| 1 | `docs/negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md` | Formulas, redondeo, periodos, faltantes |
| 2 | `docs/tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md` | CU, DTO, errores, RPC |
| 3 | `docs/tecnico/07_MODELO_DE_DATOS_Y_MIGRACIONES.md` | Tablas, restricciones, indices |
| 4 | `docs/tecnico/05_ARQUITECTURA_Y_STACK.md` y `06_DIRECTORIOS_Y_CONVENCIONES.md` | Capas y ubicacion del codigo |
| 5 | `docs/tecnico/09_PANTALLAS_Y_ATOMIC_DESIGN.md` | Rutas, pantallas, componentes |
| 6 | `docs/implementacion/13..17` | Alcance y aceptacion por fase |
| 7 | `docs/validacion_y_entrega/18` y `20` | Pruebas y evidencia real |

Si la implementacion cambia una decision, actualizar el MD afectado en el mismo
cambio. No crear una segunda fuente de verdad en comentarios o README.

## 3. Stack fijado

| Pieza | Version / decision |
| --- | --- |
| Node | 22 (`.nvmrc`) |
| Next.js | 16.4.2, App Router, Turbopack |
| React | 19.3.0 |
| TypeScript | estricto |
| Estilos | Tailwind CSS 4.3.3, tokens CSS |
| Componentes | Atomic Design + shadcn/ui adaptado |
| Supabase | `@supabase/supabase-js` 2.118.0, `@supabase/ssr` 0.12.7 |
| Validacion | Zod 4.6.7 |
| Aritmetica | decimal.js 10.6.0 |
| Paquetes | npm con `package-lock.json` versionado |

No actualizar versiones ni agregar dependencias sin una razon concreta y sin
verificar compatibilidad con Next 16 y React 19.

## 4. Reglas no negociables

1. **Dinero como string decimal.** Nunca `number` ni `parseFloat` para importes.
   El transporte usa `Importe = string` canonico (`"20441.40"`). PostgreSQL usa
   `numeric(18,2)`.
2. **Precision 40 y `ROUND_HALF_UP`.** Usar `src/lib/decimal.ts`; no crear otra
   configuracion de Decimal.
3. **Una sola formula.** Si dos pantallas usan el mismo calculo, llaman al mismo
   servicio. No duplicar formulas en componentes, controladores ni exportadores.
4. **Fechas contables ISO.** `YYYY-MM-DD` sin hora. La zona horaria de
   presentacion no cambia la fecha contable.
5. **Servidor manda.** Permisos, empresa y periodo se resuelven en el servidor.
   Nunca confiar en rol, empresa o importes enviados por el navegador.
6. **Sin DML financiero directo.** Las escrituras usan RPC estrechas con RLS,
   grants y verificacion de permiso. `anon` no accede a datos financieros.
7. **Clientes Supabase por solicitud.** No guardar clientes de servidor,
   usuario, empresa o permisos en singletons.
8. **Secretos solo en servidor.** `SUPABASE_ADMIN_KEY` nunca usa
   `NEXT_PUBLIC_*`, nunca llega al navegador y no se usa para eludir RLS.
9. **Sin cifras inventadas.** Un placeholder no muestra resultados de ejemplo.
   Los datos academicos se identifican como simulados.
10. **Sin logica de negocio en React.** Los componentes presentan DTOs y
    disparan acciones; no calculan estados, ratios ni saldos.

## 5. Arquitectura por capas

```text
src/app            -> rutas, layouts y composicion de pantalla
src/components     -> presentacion (atoms, molecules, organisms, templates)
src/controladores  -> ejecucion de CU-01..CU-23; autorizacion y DTO
src/servicios      -> reglas RCF-01..RCF-20; funciones puras
src/repositorios   -> lecturas y llamadas RPC; clientes Supabase
src/supabase       -> integracion SSR/Auth/Storage
src/config         -> rutas, navegacion, pantallas, permisos, entorno, limites
src/schemas        -> validacion Zod de entradas
src/types          -> tipos de dominio y contratos
src/lib            -> utilidades pequenas, no reglas financieras
supabase/          -> config.toml, migraciones, seed, pruebas SQL
```

| Capa | Puede importar | No puede importar |
| --- | --- | --- |
| `app` | controladores, componentes, schemas, config | repositorios directos, SQL |
| `components` | tipos de presentacion, atomos/moleculas, `lib/utils` | repositorios, Supabase, servicios de calculo |
| `controladores` | auth, servicios, repositorios, schemas, tipos | React, JSX, componentes |
| `servicios` | tipos de dominio, `lib/decimal` | Next.js, Supabase, React, cookies |
| `repositorios` | clientes Supabase, tipos generados | componentes, React |
| `supabase` | paquetes Supabase | reglas financieras |

Modulos del servidor que accedan a identidad, datos o secretos declaran
`import "server-only"`. No crear archivos barril que mezclen exportaciones de
servidor y cliente.

Las fronteras de esta tabla se verifican con `npm run lint`
(`no-restricted-imports` por carpeta). Si una importacion valida es realmente
necesaria, se justifica y se actualiza la regla; no se desactiva el chequeo.

## 6. Contratos y datos

- Usar `Resultado<T>` de `src/types/respuestas.ts` en controladores y Actions.
- Usar los codigos de `src/lib/errores.ts`; no inventar codigos nuevos sin
  actualizar el documento 10.
- Toda mutacion sobre recurso existente exige `versionEsperada`; toda mutacion
  reintentable exige `claveIdempotencia` (se implementa en su fase).
- Los DTO devuelven solo los campos necesarios. No devolver tablas completas.
- Orden estable por fecha e ID; paginacion por cursor opaco.
- Los totales se calculan sobre todo el filtro autorizado, no sobre la pagina.
- Los importes se convierten a texto **antes** de construir JSON.
- No aceptar separadores ambiguos ni adivinar el formato de una entrada humana.

## 7. Seguridad y permisos

- `src/proxy.ts` solo mantiene la sesion; no es la unica autorizacion.
- La autorizacion se repite en pagina, Action/HTTP, controlador y PostgreSQL.
- Los permisos tipados viven en `src/config/permisos.ts`; la asignacion efectiva
  vive en la base (`roles`, `permisos`, `rol_permisos`).
- No comparar `rol === "administrador"` para decidir una operacion.
- Un recurso de otra empresa responde como no encontrado; no confirma existencia.
- RLS se habilita al crear cada tabla, en la misma migracion que sus grants.
- Las vistas expuestas usan `security_invoker` cuando corresponda.
- Las funciones de escritura usan `SECURITY DEFINER` con rol interno limitado,
  `search_path = ''` y `EXECUTE` revocado de `PUBLIC` y `anon`.
- La auditoria registra actor, empresa, operacion, fecha, recurso y motivo en
  cambios confirmados.

## 8. UI y Atomic Design

- `src/app` no contiene componentes reutilizables; solo composicion de pantalla.
- `atoms`: controles y elementos basicos sin conocimiento del negocio.
- `molecules`: composicion de controles o un dato presentado.
- `organisms`: interaccion de negocio reutilizable.
- `templates`: distribucion de zonas visuales; reciben contenido.
- No crear `components/pages`.
- Componentes con estado o eventos usan `"use client"` de forma puntual. No
  aplicar `"use client"` a layouts completos por comodidad.
- Toda pantalla declara: titulo, contexto, accion principal, estados vacio,
  carga, error y sin permiso, y etiqueta de datos simulados.
- Accesibilidad obligatoria: navegacion por teclado, foco visible, etiquetas
  asociadas, contraste y mensajes que expliquen como corregir.
- Importes alineados a la derecha, USD con dos decimales, negativos visibles.
- Un balance descuadrado muestra advertencia, nunca un visto bueno.
- No usar color como unico indicador de estado.
- Tokens de marca en `src/styles/tokens.css`. No introducir colores sueltos.

## 9. Rutas, navegacion y filtros

- `src/config/rutas.ts` es la fuente unica de URLs.
- `src/config/navegacion.ts` define el menu por areas y permisos.
- `src/config/pantallas.ts` describe cada pantalla, su acceso y su fase.
- Los filtros que cambian un resultado (fechas, base temporal, periodo,
  escenario) viven en la URL y se validan en el servidor.
- Una pagina de servidor no hace HTTP contra su propio `/api` para leer datos.
- Cambiar una ruta exige actualizar `rutas.ts`, la carpeta de `app`, la
  navegacion y la documentacion.
- `src/app/page.tsx`, el layout privado y las rutas con `params` declaran
  `instant = false`: el destino de `/` depende de la sesion y las rutas privadas
  son por solicitud. Revisar esa decision al implementar la autenticacion.

## 10. Convenciones de codigo

- TypeScript estricto. Prohibido `any`; si un tipo externo es desconocido,
  validarlo con Zod o declarar una interfaz explicita.
- Carpetas y archivos de dominio en espanol (`controladores`, `servicios`,
  `estados.controller.ts`).
- Componentes en kebab-case (`journal-form.tsx`) y export en PascalCase
  (`JournalForm`).
- Funciones de caso de uso en camelCase y verbo (`confirmarLote`,
  `cerrarPeriodo`).
- Alias `@/` apunta a `src/`. Imports relativos solo dentro del mismo modulo.
- UTF-8, LF, dos espacios, newline final.
- Mensajes de interfaz en espanol; identificadores tecnicos en ingles.
- No dejar `console.log`, `debugger`, TODOs sin contexto ni codigo comentado.

## 11. Flujo de trabajo por fases

1. Leer la fase en `docs/implementacion/` y los documentos que enlaza.
2. Identificar RF, RCF, CU y pruebas afectadas antes de escribir codigo.
3. Actualizar contrato y permisos antes de habilitar un boton de escritura.
4. Implementar respetando capas y sin duplicar reglas.
5. Ejecutar `lint`, `typecheck`, `build` y las pruebas de la fase.
6. Registrar evidencia real en `docs/validacion_y_entrega/20...`.
7. Actualizar la documentacion si cambio una decision.

No avanzar a la fase siguiente si la anterior no cumple su criterio de
aceptacion. Las fases y dependencias estan en `docs/00_INDICE...`.

## 12. Comandos

```bash
npm ci                 # instalar desde lockfile
npm run dev            # Next.js en desarrollo
npm run build          # build de produccion
npm run start          # ejecutar build
npm run lint           # ESLint + fronteras entre capas
npm run typecheck      # TypeScript sin emitir
npm run test:unit      # Vitest: logica pura
npm run test:watch     # Vitest en modo interactivo
npm run verificar:entorno  # Node, Docker, Supabase CLI y variables
npm run preparar:demo  # usuarios demo locales idempotentes
npx supabase init      # ya ejecutado; no repetir
npx supabase start     # requiere Docker (Fase 01)
npx supabase migration up --local
npx supabase db reset --local
npx supabase gen types typescript --local > src/supabase/database.types.ts
```

`db reset --local` destruye datos locales y usuarios de Auth: usarlo solo sobre
una base descartable y volver a ejecutar `npm run preparar:demo`.

## 13. Estructura actual

```text
src/app/                 rutas y pantallas; catalogo, periodos y auditoria reales
src/components/          atoms, molecules, organisms, templates
src/config/              rutas, navegacion, pantallas, permisos, entorno
src/auth/                identidad, contexto y verificacion de permisos
src/controladores/       CU-01, CU-03, CU-04 y CU-23 implementados
src/repositorios/        acceso a Supabase y RPC
src/servicios/           reglas puras de catalogo y calendario
src/schemas/             validacion Zod
src/lib/                 decimal, dinero, errores, utilidades
src/styles/              tokens.css (paleta y radios de marca)
src/types/               contratos compartidos
src/supabase/            clientes SSR, proxy, admin y tipos generados
src/proxy.ts             entrada de sesion Next 16
supabase/migrations/     esquema, RLS, RPC y grants de Fase 01
supabase/seed.sql        empresa, roles, permisos, catalogo y periodos
scripts/                 verificacion de entorno y usuarios demo
tests/                   unit, integration, e2e, fixtures
docs/                    fuente de verdad funcional y tecnica
.github/workflows/       CI: lint, typecheck, unit tests y build
```

Las carpetas de capa conservan marcadores (`.gitkeep`) solo donde aun no existe
implementacion. No se crean archivos vacios ni pantallas que aparenten
funcionalidad: cada archivo real se agrega al implementar su primer caso de uso.

## 14. Prohibiciones explicitas

- Inventar formulas, tasas, periodos o resultados.
- Presentar datos simulados como reales.
- Usar `float`, `number` o `parseFloat` para dinero.
- Escribir tablas financieras con `INSERT/UPDATE/DELETE` directos desde el cliente.
- Usar claves administrativas en componentes o variables `NEXT_PUBLIC_*`.
- Duplicar una regla en dos capas.
- Ocultar un error de calculo con un valor por defecto silencioso.
- Cambiar el esquema en Studio sin migracion versionada.
- Eliminar o reescribir documentacion para "hacer que coincida" sin registrar
  la decision y su motivo.
- Agregar atribucion de IA a commits o PRs.

## 15. Definicion de terminado

Una tarea esta terminada cuando:

1. Cumple el criterio de aceptacion de su fase y su CU.
2. `lint`, `typecheck` y `build` pasan.
3. Las pruebas de la fase se ejecutaron y su evidencia esta registrada.
4. Los permisos se aplican tambien en llamadas directas.
5. No hay secretos, datos personales ni archivos importados en `public`.
6. La documentacion afectada esta actualizada.
7. El cambio se puede revisar sin explicaciones fuera del repositorio.

## 16. Commits

Usar conventional commits en ingles y sin atribucion de IA:

```text
feat: add app shell and route skeleton
fix: correct decimal rounding in statement totals
docs: update phase 01 acceptance criteria
chore: pin supabase cli version
```

Un commit debe representar una unidad de trabajo revisable. No mezclar
refactors masivos con cambios funcionales.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
