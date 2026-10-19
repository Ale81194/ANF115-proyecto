# Fase 01 · Base del proyecto y acceso

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.  
**Estado:** especificación de ejecución desarrollada; implementación y pruebas de aplicación pendientes.

## 1. Objetivo y resultado observable

Construir una base local reproducible en la que un usuario identificado pueda entrar, resolver su membresía de empresa y consultar únicamente las pantallas y datos que le corresponden. Al finalizar, el administrador podrá administrar el catálogo y los períodos iniciales; el analista y gerencia accederán a sus consultas autorizadas.

El resultado de esta fase es una aplicación conectada con identidad y datos persistidos. El dashboard inicial mostrará el contexto seleccionado y un estado sin información financiera cuando aún no existan asientos contabilizados. No presentará cifras de ejemplo como resultados calculados por la aplicación.

La distribución A, B y C es una propuesta de responsabilidades del equipo: **A, interfaz e integración; B, datos y seguridad; C, motor y calidad**. Son áreas de trabajo, sin asignación a personas concretas. La referencia de tres integrantes y cuatro semanas proviene del material original; el calendario se ajustará después de medir capacidad y completar el recorrido contable de las fases 02 y 03.

## 2. Requisitos y contratos cubiertos

| Referencia | Compromiso en esta fase |
| --- | --- |
| RF-01, RF-02 | Acceso, membresía activa, usuarios, roles y permisos |
| RF-03 | Catálogo publicado con cuentas de movimiento, naturaleza y rubro |
| RF-04 | Períodos por empresa y contexto de consulta |
| RF-23 | Auditoría desde las primeras operaciones administrativas |
| RNF-01, RNF-04, RNF-05 | Aislamiento, organización de capas e interfaz utilizable |
| RNF-07, RNF-08 | Entorno reproducible, manejo de secretos y trazabilidad |
| RCF-01, RCF-02, RCF-04 | Empresa, clasificación de cuentas y fecha contable |
| CU-01–CU-04, CU-23 | Resolver acceso, gestionar usuario, guardar cuenta, gestionar período y consultar auditoría |

RF-22 se prepara mediante el estado abierto/cerrado y las restricciones de períodos. El proceso completo de cierre y reapertura se entrega en la fase 05; la prohibición de escribir en períodos cerrados será exigible desde la primera mutación contable de la fase 02.

Las definiciones completas están en [requisitos](../negocio/03_REQUERIMIENTOS_Y_CRITERIOS_DE_ACEPTACION.md), [contratos](../tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md) y [seguridad](../tecnico/08_AUTENTICACION_PERMISOS_Y_AUDITORIA.md).

## 3. Dependencias y preparación

Se necesita un entorno con Docker disponible y versiones compatibles y fijadas de Node, Next.js, Supabase CLI y sus bibliotecas. Se seguirá [entorno local y operación](../tecnico/12_ENTORNO_LOCAL_Y_OPERACION.md), con lockfile versionado y valores reales del entorno local en las variables correspondientes.

El esquema inicial incluirá empresa, perfiles, membresías, roles, permisos, cuentas, rubros, períodos y auditoría. Cada migración que exponga una tabla incorporará sus restricciones, grants y políticas de acceso en el mismo cambio. El catálogo de la hoja `CATALOGO` servirá de insumo, pero su publicación exigirá revisar las naturalezas de gastos observadas en la auditoría. Una copia corregida conservará referencia al dato original y al motivo de cambio.

La empresa inicial es Carlitos, de procedencia académica simulada y moneda USD. La infraestructura admitirá `empresa_id` y membresías; no se requiere construir gestión comercial de múltiples empresas para esta entrega.

## 4. Tareas y responsables

| Orden | Trabajo concreto | Responsable | Revisión |
| --- | --- | --- | --- |
| 1 | Crear proyecto Next.js con TypeScript estricto, scripts, lockfile y alias de imports | A | B |
| 2 | Inicializar Supabase local; escribir migraciones de identidad, membresías, catálogo, períodos y auditoría | B | C |
| 3 | Implementar clientes SSR por solicitud, contexto de acceso y comprobación de permisos | B | A |
| 4 | Crear login, AppShell, navegación, selección de período y estados vacío/error/carga | A | C |
| 5 | Definir tokens de marca, átomos y moléculas compartidas, con etiquetas y navegación por teclado | A | C |
| 6 | Preparar catálogo revisado, rubros y períodos de demostración con procedencia visible | C | B |
| 7 | Implementar gestión de usuarios, membresías, catálogo y períodos mediante contratos autorizados | B y A | C |
| 8 | Preparar usuarios demo locales y ejecutar pruebas de aislamiento y reconstrucción | B | A y C |

El trabajo puede solaparse después de acordar los DTO del documento 10. Un cambio de contrato se registra allí antes de ajustar formulario y controlador; no se mantienen firmas alternativas en cada pantalla.

## 5. Archivos, rutas y decisiones técnicas

| Ubicación prevista | Responsabilidad |
| --- | --- |
| `src/app/(publico)/login/page.tsx` y `actions.ts` | Pantalla y adaptación del inicio de sesión |
| `src/app/(privado)/layout.tsx` | Composición visual del área privada |
| `src/app/(privado)/dashboard/page.tsx` | Contexto y estado inicial sin datos contabilizados |
| `src/app/(privado)/usuarios/`, `catalogo/`, `periodos/` | Carpeta por pantalla y `page.tsx` por ruta |
| `src/components/{atoms,molecules,organisms,templates}/` | Atomic Design; sin otra colección de páginas |
| `src/config/rutas.ts`, `navegacion.ts`, `permisos.ts` | URLs, menú y permisos por responsabilidades separadas |
| `src/auth/obtener-contexto.ts`, `verificar-permiso.ts` | Identidad validada y autorización reutilizable |
| `src/supabase/` y `src/proxy.ts` | Integración SSR y punto de entrada de actualización de sesión |
| `supabase/migrations/`, `supabase/seed.sql` | Esquema y datos iniciales reproducibles |
| `scripts/crear-usuarios-demo.ts` | Preparación idempotente de cuentas de prueba en destino local |

Cada `page.tsx` leerá a través del controlador. Las acciones de formulario delegarán la mutación y revalidarán la vista afectada. Ninguna pantalla resolverá permisos exclusivamente por la visibilidad del menú o por el layout.

Los clientes del servidor y el contexto de usuario se crearán por solicitud. Un singleton con sesión, empresa o permisos no forma parte del diseño. La integración administrativa de Supabase, si se necesita para Auth, permanecerá en el servidor y no se reutilizará para eludir RLS en datos financieros. La gestión de identidad en Auth y de membresías en PostgreSQL requerirá manejo explícito de fallos parciales: una creación incompleta no debe dejar una membresía activa sin identidad válida ni comunicar un alta exitosa que no terminó.

## 6. Entregables obligatorios

| Entregable | Contenido mínimo y evidencia esperada |
| --- | --- |
| Base de código ejecutable | Proyecto, dependencias fijadas y comandos documentados |
| Esquema inicial | Migraciones revisadas, restricciones, RLS, permisos mínimos y tipos generados |
| Acceso por perfil | Login y tres perfiles de prueba con membresías explícitas |
| Catálogo y períodos | Consulta y administración autorizada, estados y versiones visibles |
| Interfaz base | AppShell, componentes compartidos y rutas centralizadas |
| Registro de auditoría | Actor, empresa, operación, fecha y recurso en cambios relevantes |
| Evidencia de fase | Registro de instalación y pruebas ejecutadas, sin secretos ni contraseñas |

## 7. Aceptación y definición de terminado

1. Partiendo de una base local descartable vacía, las migraciones y la preparación documentada permiten levantar el entorno y entrar con un usuario demo.
2. Una sesión válida con membresía activa llega a su contexto autorizado. Una sesión ausente, inválida o sin membresía no obtiene información de empresa.
3. Cambiar un identificador de empresa o llamar directamente a una operación no permite consultar ni modificar datos ajenos.
4. Gerencia no administra el catálogo; el analista no se concede permisos; únicamente la operación administrativa autorizada cambia membresías y deja auditoría.
5. El catálogo conserva códigos como texto, distingue agrupadoras de cuentas de movimiento y rechaza relaciones de otra empresa.
6. Se rechaza un período duplicado de la misma empresa, año y mes. La fecha contable no cambia por convertirla a la zona horaria de presentación.
7. Navegación, formularios y mensajes son utilizables con teclado y explican cómo resolver una entrada inválida.
8. El navegador no recibe claves administrativas ni DTO con datos innecesarios.

La fase queda terminada cuando estos comportamientos se comprueban contra la versión de código identificada, la base se reconstruye con los pasos documentados y los defectos que impiden acceso o aislamiento están resueltos. Escribir las migraciones o crear pantallas por separado no basta para aceptar la fase.

## 8. Pruebas y evidencia requerida

Se aplicarán los casos de acceso, autorización, aislamiento, catálogo, fechas y entorno del [plan de pruebas](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md). La preparación incluirá dos empresas de prueba y usuarios con permisos distintos, aunque la demostración funcional utilice solo Carlitos.

La cobertura inicial comprende **PR-01, PR-02** y los subcasos de **PR-03, PR-04, PR-06 y PR-07** aplicables a usuarios, consultas, catálogo y períodos. **PR-35 y PR-38** comienzan con auditoría e interfaz de esta fase. Los subcasos que requieren líneas contables, aprobación presupuestaria o descarga se completarán en las fases que los implementen; no se marcará aprobada una prueba compuesta por haber ejecutado solo una parte.

La evidencia identificará revisión de código, migraciones aplicadas, usuario de prueba por alias, operación, resultado esperado y observado. Las llamadas directas a operaciones y a la capa de datos complementarán las pruebas de interfaz. La reconstrucción local se hará sobre datos descartables y se registrará como tal; `db reset` no demuestra todavía recuperación desde un respaldo.

## 9. Límites, pendientes y cierre del trabajo

La aprobación definitiva de la matriz de responsabilidades y la publicación contable del catálogo siguen siendo decisiones funcionales por registrar. Se puede implementar con la propuesta documentada, conservando su condición.

El acta de cierre de fase deberá indicar entregables implementados, pruebas realmente ejecutadas, defectos abiertos y decisiones que afecten la [fase 02](14_FASE_02_IMPORTACION_Y_DIARIO.md). Actualmente esa acta no existe: el [registro de validación](../validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md) separa la documentación elaborada de la implementación pendiente.

## 10. Referencias

- `Carlitos_ARQUITECTURA_TECNICA_DETALLADA.docx`: roles, módulos y plan de cuatro semanas.
- `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`: hojas `LEEME`, `CATALOGO` y `DIARIO`; tratamiento de incidencias en el documento 04.
- [Arquitectura y stack](../tecnico/05_ARQUITECTURA_Y_STACK.md), [directorios](../tecnico/06_DIRECTORIOS_Y_CONVENCIONES.md) y [modelo de datos](../tecnico/07_MODELO_DE_DATOS_Y_MIGRACIONES.md).
- [Supabase: clientes SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) y [migraciones locales](https://supabase.com/docs/guides/local-development/database-migrations).
