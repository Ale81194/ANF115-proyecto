# 12 — Entorno local y operación

**Proyecto:** Carlitos Finanzas  
**Versión documental:** 0.1 · **Fecha:** 19 de octubre de 2026  
**Estado:** procedimiento previsto; todavía no se ha levantado esta aplicación ni se han ejecutado estas migraciones.

## 1. Entorno de desarrollo elegido

Next.js se ejecutará en el equipo de desarrollo con recarga rápida. Supabase local se ejecutará en Docker mediante su CLI. La carpeta `supabase/` contiene configuración y migraciones; `src/supabase/` contiene integración TypeScript. No se mantendrá otro conjunto de migraciones ni un Compose manual que compita con la configuración de la CLI.

Inicializar el proyecto local con la CLI no requiere vincularlo a un proyecto alojado. `supabase init` crea configuración local y `supabase start` inicia servicios. Cuando se instala la CLI con npm, se utiliza mediante `npx supabase`; la documentación indica Node.js 20 o posterior para esa forma de ejecución. La versión elegida debe cumplir también los requisitos de Next.js. [T1]

Si posteriormente se contiene también Next.js, se documentarán la red, URL interna entre servicios y URL accesible desde el navegador. La elección actual evita introducir esa segunda configuración antes de necesitarla.

## 2. Inventario que debe fijarse en la fase 01

| Elemento | Decisión y evidencia requerida |
| --- | --- |
| Node y npm | Versión compatible fijada en el repositorio y registrada en el informe de fase |
| Next.js, React y TypeScript | Versiones compatibles, modo App Router y TypeScript estricto |
| Supabase CLI | Dependencia de desarrollo con versión exacta |
| Imágenes de Supabase | Versiones asociadas a la CLI/configuración; registrar el entorno utilizado |
| Dependencias | `package-lock.json` versionado; instalación ordinaria con `npm ci` |
| Identificador local | `project_id` propio en `supabase/config.toml` |
| Puertos | Valores efectivos de la configuración y ausencia de conflicto |
| Motor y fórmulas | Política P-CARLITOS-1 y versión del motor registrada en ejecuciones |
| Plantillas | Versión de presentación/exportación conservada con el reporte |

Las versiones exactas se decidirán y registrarán al iniciar la implementación, cuando exista un repositorio que pueda instalarse y probarse. Este documento no inventa un lockfile ni afirma compatibilidad comprobada de versiones que no están instaladas.

## 3. Primera preparación

Los comandos siguientes son para la futura implementación, desde un repositorio Next.js ya creado con la estructura acordada. Docker debe estar iniciado. Se ejecutan en bloques separados para poder revisar el resultado de cada etapa.

### 3.1 Instalar e inicializar Supabase local

```bash
npm install --save-dev --save-exact supabase
npx supabase init
npx supabase start
```

Después se registra la versión instalada y se incorpora el lockfile. Las claves y URLs se obtienen del entorno local realmente iniciado; no se copian credenciales incluidas en una captura de documentación. La primera ejecución puede descargar imágenes del stack. [T1]

### 3.2 Crear la migración inicial

```bash
npx supabase migration new identidad_empresa_y_acceso
```

El archivo generado se completa con tablas, restricciones, roles internos, RLS, grants, funciones y auditoría de la fase. Se sigue el orden del [documento 07](07_MODELO_DE_DATOS_Y_MIGRACIONES.md). Se revisa el SQL antes de reconstruir la base.

### 3.3 Aplicar y regenerar tipos

```bash
npx supabase db reset --local
npx supabase gen types typescript --local > src/supabase/database.types.ts
npm run dev
```

`db reset --local` reconstruye la base local desde migraciones y semillas y descarta otros cambios o datos locales. Se usa en la base de pruebas; no es un procedimiento para conservar trabajo que no se haya respaldado. [T2] El archivo de tipos se genera desde el esquema y no se mantiene mediante edición manual. [T3]

En un clon posterior se usará `npm ci` con el lockfile, seguido del arranque del stack y los scripts documentados. `supabase init` no se repite si la configuración ya forma parte del repositorio.

## 4. Configuración de la aplicación

`.env.example` documentará nombres y ejemplos sin claves reales. `.env.local` permanecerá fuera de git. La aplicación valida al iniciar las variables necesarias para cada capacidad mediante `src/config/env.server.ts`.

| Variable propuesta | Visibilidad | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Navegador y servidor | URL del proyecto local obtenida de la CLI |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Navegador y servidor | Clave pública compatible con el entorno y RLS |
| `SUPABASE_ADMIN_KEY` | Solo servidor | Gestión autorizada de Auth y preparación local |
| `APP_ORIGIN` | Servidor | Origen permitido de la aplicación para operaciones con cookies |
| `APP_ENV` | Servidor | Identificador local/test/desarrollo; activa guardas de scripts |
| `DEMO_SEED_ENABLED` | Servidor/script | Permite creación idempotente de usuarios de demostración local |

`SUPABASE_ADMIN_KEY` es un nombre de aplicación para la credencial administrativa que ofrezca el entorno. No se envía a componentes de cliente ni a `NEXT_PUBLIC_*`. Los repositorios financieros no la utilizan: ejecutan sus operaciones con la identidad del actor y las RPC autorizadas.

En un entorno con claves públicas de tipo anterior se documentará el mapeo compatible, sin llamar secreta a una clave pública ni asumir que una clave pública permite acceso sin RLS. El esquema de configuración debe rechazar claves administrativas en variables públicas.

Los límites se centralizan en `src/config/limites.ts`: bytes por archivo, filas, hojas, tamaño descomprimido, duración de procesamiento y tamaño de página. Antes de habilitar una carga, todos deben tener valores explícitos. Se medirán con el conjunto de 1,613 líneas y con entradas al límite; este paquete no promete un tiempo de respuesta sin esa medición. [F3]

## 5. Semillas y datos de referencia

La semilla inicial contendrá empresa académica, roles, permisos, períodos, rubros, catálogo revisado y política P-CARLITOS-1. Su función es reproducir un punto inicial conocido.

Los fixtures financieros son conjuntos separados:

| Conjunto | Uso |
| --- | --- |
| Carlitos mensual conciliado | Primer recorrido de diario a estados y controles de equilibrio |
| Carlitos ampliado | Importación y contraste con los saldos auditados |
| Alfa 2025 | Prueba aislada de fórmulas y aproximaciones académicas |
| Entradas inválidas | Descuadre, cuenta ajena, período cerrado, duplicado y formato incorrecto |

Alfa no se convierte en un diario ficticio para hacerlo caber en las tablas contables. Los datos personales de autoevaluaciones no se incluyen en las semillas. Los errores identificados en las hojas de patrimonio y pronóstico de Carlitos no se adoptan como resultados esperados. [F3, F4]

`scripts/crear-usuarios-demo.ts` será idempotente, creará perfiles de prueba mediante Auth y asignará membresías controladas. Antes de ejecutarse comprobará `APP_ENV`, activación explícita y destino local. Si Auth ya creó una identidad pero falló la membresía, el reintento completará la segunda parte sin duplicar usuario. Las credenciales demo se gestionan como datos de prueba y no se distribuyen como contraseñas de un despliegue real.

## 6. Rutina de trabajo y scripts previstos

| Script de proyecto | Responsabilidad |
| --- | --- |
| `dev` | Ejecutar Next.js en desarrollo |
| `build` | Crear build de la aplicación |
| `start` | Ejecutar el build local |
| `lint` | Comprobar convenciones y dependencias de código |
| `typecheck` | Comprobar TypeScript sin emitir archivos |
| `test:unit` | Verificar servicios deterministas y reglas de entrada |
| `test:db` | Ejecutar comprobaciones de SQL, RPC, RLS y transacciones |
| `test:e2e` | Recorrido de usuario contra el stack local |
| `seed:usuarios` | Crear o completar usuarios demo locales |
| `db:types` | Regenerar tipos desde Supabase local |

Los nombres describen los scripts que debe implementar la fase 01 y ampliar cada fase. No se presentan como comandos existentes dentro de este ZIP documental.

Para una modificación de esquema: crear migración nueva, revisar SQL y permisos, aplicarla en entorno local reproducible, regenerar tipos, ejecutar comprobaciones afectadas y registrar evidencia. Una modificación hecha en Studio debe quedar representada en SQL antes de considerarse parte del proyecto.

Para terminar una sesión ordinaria se puede detener la aplicación y ejecutar:

```bash
npx supabase stop
```

Detener el stack de forma ordinaria conserva el estado local; borrar volúmenes o usar opciones de eliminación tiene otro efecto y requiere haber guardado lo que se pretende conservar. [T1]

## 7. Archivos y procesos interrumpidos

Los originales importados y los reportes se mantienen en buckets privados. Se conserva hash, nombre original, tamaño y referencia de lote o reporte. Los archivos se manipulan mediante Storage API, sin usar DELETE directo sobre la tabla de objetos como sustituto de borrar el archivo. [T4]

El proceso de importación guarda primero el original inmutable y después registra la operación de datos. Si falla una etapa, se conserva el lote fallido o una referencia recuperable. Una tarea de limpieza solo elimina objetos que se hayan comprobado huérfanos, respetando su período de conservación.

Los estados `validando` o `generando` necesitan tiempo de actualización y diagnóstico. Si un proceso se interrumpe, el operador debe poder identificarlo y reintentar el trabajo idempotente desde su fuente. No se marcará como éxito un trabajo simplemente porque fue iniciado. La incorporación de un ejecutor de trabajos duradero se decidirá con mediciones; la primera implementación no debe depender de tareas que desaparezcan al terminar una solicitud.

## 8. Respaldo y recuperación

Se distinguen reconstruir una demostración y recuperar trabajo realizado. La primera operación vuelve a migraciones y fixtures; la segunda debe conservar identidades, movimientos, versiones, auditoría y archivos.

| Pieza | Qué debe conservarse |
| --- | --- |
| Repositorio | Código, lockfile, configuración no secreta, migraciones, políticas, motor y plantillas versionados |
| Base de aplicación | Datos, idempotencia, snapshots, auditoría y referencias de empresa/usuario |
| Identidad | Identidades Auth y sus UUID cuando se recupera trabajo existente |
| Storage | Contenido de objetos y metadatos necesarios para sus referencias |
| Configuración privada | Credenciales y parámetros necesarios para restaurar, bajo acceso restringido |
| Evidencia del respaldo | Fecha, origen, versión del esquema, inventario y hash de archivos |

Como ejemplo de exportación **parcial de datos de aplicación local**, una vez creado un directorio de respaldo controlado:

```bash
npx supabase db dump --local --data-only --schema public,private --file backups/datos-aplicacion.sql
```

Ese archivo por sí solo no es un respaldo completo. La CLI excluye por defecto esquemas administrados como Auth y Storage; el dump normal tampoco incluye datos o roles salvo las opciones correspondientes. [T5] Las migraciones recrean el esquema de aplicación, pero no recrean automáticamente identidades originales o bytes de archivos privados.

La recuperación de trabajo requerirá un respaldo completo compatible del PostgreSQL local, incluidos los datos de identidad necesarios, y copia de objetos mediante Storage. El procedimiento de exportación y restauración elegido para la versión efectiva del stack deberá ensayarse en un destino local aislado. No se sustituye ese ensayo por asumir que `seed.sql` recupera todo.

### Ensayo de restauración obligatorio

1. Registrar versión de aplicación, CLI, esquema, motor y plantillas; guardar un inventario de filas y objetos.
2. Capturar base e identidades de forma coherente y conservar los archivos relacionados.
3. Preparar un destino local aislado compatible, sin sobrescribir la instancia de trabajo.
4. Restaurar esquema, datos e identidades preservando UUID y referencias; restaurar objetos y metadatos de acceso.
5. Verificar acceso por cada rol, aislamiento, un lote confirmado, auditoría y cierre.
6. Reproducir un estado histórico y un reporte con la misma captura y versiones.
7. Registrar discrepancias, duración observada y resultado; aceptar el respaldo solo si la restauración cumple las comprobaciones.

Si una versión antigua del motor o plantilla no está disponible, no se debe regenerar un reporte antiguo silenciosamente con una versión actual. La conservación de código/versiones forma parte de la reproducción.

No se fijan todavía objetivos de recuperación en minutos ni pérdida máxima de datos: deberán acordarse y medirse si el sistema pasa de demostración académica a operación sostenida.

## 9. Observabilidad y diagnóstico

Los logs de servidor usarán `requestId`, CU, empresa, identificador de recurso, código de resultado y duración. No copiarán tokens, contraseñas ni contenido completo de archivos. La auditoría de negocio registra cambios confirmados; los logs explican fallos y tiempos.

| Síntoma | Comprobación inicial |
| --- | --- |
| Next.js no inicia | Versiones, instalación con lockfile y variables requeridas |
| Supabase no inicia | Docker activo, recursos y puertos de la configuración |
| Login funciona pero no hay acceso | Perfil y membresía activos; permisos actuales |
| Escritura rechazada | Grants de RPC, rol definer, RLS, versión y período |
| Datos aparecen vacíos | Empresa, origen, estado contabilizado y base temporal |
| Importación falla | Código por fila o límite técnico; original y mapeo |
| Reporte no disponible | Estado del proceso, fuente capturada y generación verificable |
| Diferencia financiera | Política, revisiones, clasificación y procedencia de operandos |

No se resuelven problemas de permisos cambiando la aplicación a una clave administrativa. La corrección debe localizar el grant, política o condición de negocio que provoca el resultado.

## 10. Criterio de entrega operativa

Otra persona debe poder obtener el repositorio de implementación, instalar con el lockfile, iniciar Supabase local, aplicar las migraciones, crear usuarios demo y ejecutar el recorrido de referencia siguiendo documentación contrastada.

Además, debe existir evidencia de aislamiento, transacciones y restauración. El estado actual sigue siendo pendiente: los comandos de este documento son instrucciones propuestas para implementar, no un registro de ejecuciones. Las pruebas y evidencias se administran en [18](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md) y [20](../validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md).

## Fuentes

- **T1:** [Supabase: CLI y entorno local](https://supabase.com/docs/guides/local-development/cli/getting-started).
- **T2:** [Supabase: Database migrations](https://supabase.com/docs/guides/local-development/database-migrations).
- **T3:** [Supabase: Generating TypeScript types](https://supabase.com/docs/guides/api/rest/generating-types).
- **T4:** [Supabase: Storage schema](https://supabase.com/docs/guides/storage/schema/design).
- **T5:** [Supabase CLI: db dump](https://supabase.com/docs/reference/cli/supabase-db-dump).
- **F3:** `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`, estructura y diario auditados.
- **F4:** `Caso Analisis Financiero Manufacturas Alfa_2025(2).docx`, estados y supuestos del fixture.

