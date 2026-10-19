# 08 — Autenticación, permisos y auditoría

**Proyecto:** Carlitos Finanzas  
**Versión documental:** 0.1 · **Fecha:** 19 de octubre de 2026  
**Estado:** especificación de seguridad; controles y pruebas de aplicación pendientes.

## 1. Objetivo y fronteras de confianza

Cada operación financiera debe identificar a su actor, comprobar su membresía y permiso, limitarse a la empresa autorizada y conservar la integridad de los registros. La interfaz orienta al usuario; el controlador y PostgreSQL hacen cumplir la autorización.

Se distinguen cuatro entradas: pantallas de servidor, Server Actions, Route Handlers y la API de datos de Supabase. Un control que exista solamente en el menú, layout o proxy no protege las demás entradas. El requisito RNF-01 se considera satisfecho cuando las llamadas directas también quedan limitadas.

## 2. Sesión SSR y contexto por solicitud

El servidor utilizará `@supabase/ssr` con el cliente de `src/supabase/server.ts` y las cookies de la solicitud. `src/proxy.ts` delegará en `src/supabase/proxy.ts` para mantener la sesión conforme a la integración oficial. Los componentes que necesiten Auth en el navegador usarán `src/supabase/client.ts`. [T1]

La identidad se verifica mediante `getClaims()` según la integración SSR. Para operaciones críticas se comprobará también el estado actualizado de usuario mediante `getUser()` cuando sea necesario, además de consultar membresía y permiso vigentes. Un objeto devuelto por `getSession()`, sin verificación adicional, no es prueba de autorización. [T1]

El contexto de un CU contiene `usuarioId`, `empresaId`, permisos resueltos, origen de datos y `requestId`. Se crea en el servidor y no se acepta como estructura confiable enviada por un formulario. El período es un filtro o recurso solicitado, no una credencial.

Los clientes de servidor no se almacenan en un singleton con cookies o sesión. Tampoco se comparten entre solicitudes objetos de empresa seleccionada o permisos. [T2] Los datos financieros y las respuestas con sesión no se guardarán en una caché pública. Una futura caché de consultas deberá separar empresa, permisos, revisión y política; esa optimización requiere una revisión específica.

## 3. Catálogo de permisos inicial

La matriz resuelve una discrepancia entre los documentos originales: uno asigna aprobar presupuestos a administración y otro a gerencia. Se propone separar la aprobación de registros y la aprobación del plan. Esta distribución sigue pendiente de ratificación funcional; se puede construir usando identificadores separados. [F1, F2]

| Permiso | Administrador | Analista | Gerencia |
| --- | --- | --- | --- |
| `finanzas.leer` | Sí | Sí | Sí |
| `usuarios.gestionar` | Sí | No | No |
| `catalogo.publicar` | Sí | No | No |
| `periodos.gestionar` | Sí | No | No |
| `importaciones.preparar` | Solo asignación explícita | Sí | No |
| `asientos.preparar` | Solo asignación explícita | Sí | No |
| `asientos.aprobar` | Sí | No | No |
| `asientos.revertir` | Sí | No | No |
| `periodos.cerrar` | Sí | No | No |
| `periodos.reabrir` | Sí | No | No |
| `presupuestos.preparar` | Solo asignación explícita | Sí | No |
| `presupuestos.aprobar` | Solo asignación explícita | No | Sí |
| `escenarios.ejecutar` | Solo asignación explícita | Sí | No |
| `reportes.exportar` | Sí | Sí | Sí |
| `auditoria.leer` | Sí | Solo asignación explícita | No |

`finanzas.leer` permite consultar datos del ámbito de empresa al que pertenece el usuario. La gestión de usuarios y la auditoría completa requieren sus permisos propios. La preparación administrativa excepcional deberá quedar asignada en la base y auditada; no se deduce de una comparación de texto `rol === 'administrador'`.

Los identificadores tipados viven en `src/config/permisos.ts`. Las asignaciones autorizadas viven en `roles`, `permisos` y `rol_permisos`. Un control de coherencia comprobará que la aplicación no usa permisos desconocidos y que las semillas asignan los previstos.

## 4. Autorización en cada capa

| Capa | Verificación | Resultado ante incumplimiento |
| --- | --- | --- |
| Navegación | Mostrar opciones disponibles | La opción no se ofrece |
| Página | Sesión y permiso de lectura | Login o estado de acceso denegado |
| Action/HTTP | Entrada válida, identidad, origen de solicitud cuando aplique | Contrato de error sin mutación |
| Controlador | Membresía, permiso y recurso solicitado | Error de dominio |
| Repositorio | Consultas acotadas a empresa y DTO mínimo | Sin datos ajenos |
| PostgreSQL | RLS, grants, restricciones y verificación dentro de RPC | Rechazo y rollback |
| Descarga | Permiso actual sobre reporte listo y su empresa | Sin entrega de archivo |

Una URL manipulada no puede cambiar la empresa efectiva del contexto. Para recursos de otra empresa se responde como recurso no encontrado en las entradas públicas del módulo, evitando confirmar su existencia. Un usuario autenticado que carece del permiso para una operación de su propio ámbito recibe acceso denegado.

Los formularios gestionados por Server Actions mantienen las protecciones de origen del framework. El `POST /api/importaciones`, que usa cookies, validará además el origen admitido de la solicitud y el contenido multipart. Las comprobaciones de identidad y permiso seguirán siendo obligatorias. [T3]

## 5. RLS y acceso de lectura

Se habilita RLS al crear cada tabla expuesta. `anon` no obtiene acceso a información financiera. `authenticated` recibe las lecturas expresamente permitidas. Las políticas comprueban membresía activa para la empresa de la fila, y permiso cuando el conjunto sea más sensible.

Las vistas de saldos expuestas deberán respetar las políticas de sus tablas. Se utilizará `security_invoker = true` cuando corresponda a la versión de PostgreSQL implantada. No se dará por hecho que una vista hereda automáticamente el aislamiento deseado. [T4]

Para evitar políticas recursivas sobre membresías, se distingue el directorio de acceso del resto del modelo:

- El usuario autenticado puede leer su propia membresía y el catálogo de permisos permitido.
- Un helper de autorización del esquema `private` devuelve únicamente si el usuario actual tiene membresía o permiso en una empresa. Su identidad se obtiene con `auth.uid()`.
- El rol interno del helper puede leer el directorio de autorización mediante una política específica no recursiva. El usuario no obtiene lectura arbitraria de ese directorio.
- Si una política necesita ejecutar el helper, se concede solo su firma segura. El helper no acepta un usuario arbitrario para consultar los permisos de terceros ni devuelve filas.

Las políticas financieras usan ese resultado y mantienen las comprobaciones de empresa. El helper es una pieza que debe probarse; no constituye una excepción para abrir las tablas al usuario.

## 6. Escrituras mediante RPC estrechas

Se revocan `INSERT`, `UPDATE` y `DELETE` directos de tablas financieras críticas para `anon` y `authenticated`. El hecho de tener la clave pública y una sesión no concede escritura arbitraria.

Como el llamador carece de DML, las funciones de escritura no pueden depender de `SECURITY INVOKER` para modificar las tablas. La propuesta usa `SECURITY DEFINER` con un rol interno llamado `finanzas_rpc` y privilegios limitados:

| Condición | Aplicación requerida |
| --- | --- |
| Rol interno | `NOLOGIN`, `NOBYPASSRLS`; no propietario de tablas |
| Suplantación | `authenticated` no puede asumir ese rol ni crear funciones como él |
| Grants | Solo tablas y operaciones necesarias; sin DDL ni SQL arbitrario |
| RLS | Políticas incluyen explícitamente `finanzas_rpc`; una política solo `TO authenticated` no basta |
| Identidad | `auth.uid()` no nulo y comprobación actual de membresía y permiso |
| Resolución de nombres | `search_path = ''` y objetos calificados por esquema |
| Exposición | Revocar `EXECUTE` de `PUBLIC` y `anon`; conceder firmas concretas a `authenticated` |
| Resultado | DTO mínimo; sin devolver secretos, tokens ni filas de otras empresas |

En el directorio de autorización, el rol interno necesita lecturas suficientes para evaluar permisos sin recursión. En tablas financieras, RLS continúa limitándolo a la empresa del actor. Las funciones de gestión de membresía comprobarán `usuarios.gestionar` antes de cambiar cualquier fila; el usuario no puede editar por sí mismo su rol mediante DML.

PostgreSQL ejecuta una función definer con privilegios de su propietario; RLS puede ser omitida por propietarios de tabla y roles con `BYPASSRLS`. Por eso la separación de propietarios es una parte necesaria de esta propuesta. [T5, T6] Los grants y las revocaciones de cada función deben quedar aplicados en la misma migración de creación.

Las operaciones concretas y sus argumentos están en [10](10_CONTRATOS_Y_CASOS_DE_USO.md). No se expone una función genérica para actualizar cualquier tabla, ejecutar SQL recibido o asignar estados arbitrarios.

## 7. Concurrencia, revisiones e idempotencia

Toda mutación que cambie datos financieros o catálogo seguirá el mismo orden de bloqueo:

1. Empresa, para serializar cambios de las revisiones compartidas.
2. Períodos afectados, ordenados por fecha e identificador, mediante `FOR UPDATE`.
3. Lote, asiento, presupuesto u otro recurso, con versión esperada.

Después de adquirir los bloqueos se vuelven a comprobar permisos relevantes, estado del período, estado del recurso y versión. Las operaciones de cierre usan esa misma fila de período. Una aprobación no puede atravesar un cierre concurrente basándose en un estado leído antes de esperar el bloqueo.

Esta decisión serializa inicialmente escrituras dentro de una empresa. Facilita la integridad con el volumen académico; cualquier cambio para aumentar paralelismo deberá conservar el orden compatible y la coherencia de snapshots.

La idempotencia se registra en `private.operaciones_idempotentes`. Misma empresa, operación, clave y hash de entrada devuelven el resultado anterior; misma clave con otro hash devuelve `IDEMPOTENCIA_CONFLICTO`. La reserva y el resultado transaccional de una operación contable se confirman junto a sus datos. Un fallo inesperado debe propagarse para revertir la transacción, sin dejar un éxito registrado.

En un reintento se comprueban primero identidad y permiso actuales y se reconoce una operación previa con la misma clave y entrada canónica. Ese reconocimiento ocurre antes de rechazar por una versión nueva o por el período cerrado a causa de la operación ya realizada. Solo una operación nueva debe superar de nuevo las precondiciones de mutación; una respuesta repetida no realiza otro cambio.

## 8. Inmutabilidad y auditoría

Un asiento contabilizado no se modifica ni elimina desde operaciones normales. CU-10 genera una contrapartida y conserva el original. Cerrar un período registra snapshot y revisión; reabrir exige motivo y conserva el cierre anterior. Aprobar un presupuesto congela esa versión.

CU-08 puede descartar un no contabilizado mediante marca administrativa con motivo y versión. Se conservan cabecera, líneas, origen e IDs. Los descartados no pueden editarse ni aprobarse y no bloquean un cierre; la operación conserva su auditoría y referencias de importación.

Cada mutación relevante registra actor, empresa, acción, entidad, instante, `requestId`, motivo cuando aplique y versiones anterior/nueva. La auditoría financiera de una operación se confirma en su misma transacción: si la operación falla, no se registra como realizada.

Los intentos fallidos se registran como observabilidad del servidor o como evento separado explícito de intento, sin simular un cambio confirmado. Los logs contienen códigos, identificadores técnicos y tiempos; no copian contraseñas, tokens, archivos completos ni datos personales innecesarios. La auditoría de aplicación no sustituye los registros de autenticación que mantenga Auth.

## 9. Archivos, claves y administración

Los archivos originales y reportes se almacenan en buckets privados. La ruta interna contiene empresa y UUID, sin usar el nombre original como permiso. Las políticas de Storage se definen específicamente sobre objetos del bucket; no se supone que las RLS del diario protegen por sí mismas los archivos.

Una descarga vuelve a verificar permiso y estado `listo`. El Route Handler inicial recompone el documento desde la captura protegida, el motor y la plantilla versionados; no entrega bytes solamente porque un cliente haya registrado estado, ruta o hash. La copia de Storage sirve de materialización, sin convertirse en autoridad financiera. Los objetos se administran mediante Storage API. [T7]

La credencial administrativa permanece en el servidor, fuera de `NEXT_PUBLIC_*`. `src/supabase/admin.ts` se reserva a operaciones autorizadas de Auth o preparación local. Los repositorios financieros utilizan la sesión del actor y las RPC; nunca una clave administrativa para resolver un error de permisos.

## 10. Validación requerida

Las comprobaciones incluirán acceso anónimo, usuario de otra empresa, membresía revocada, manipulación de identificadores, invocación directa de RPC, DML directo, cambio propio de rol, duplicados, aprobación concurrente con cierre y descarga de archivo ajeno. También comprobarán el caso autorizado, porque una política que bloquee a todos no satisface el sistema.

No se ha ejecutado ninguna de estas pruebas de aplicación. Su especificación está en [18](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md) y su resultado futuro deberá incorporarse a [20](../validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md).

## Fuentes

- **F1:** `Carlitos_ARQUITECTURA_TECNICA_DETALLADA.docx`, roles y aprobación.
- **F2:** `Carlitos_Reporte_Mejorado.docx`, roles y flujo presupuestario.
- **T1:** [Supabase: Creating a client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
- **T2:** [Supabase: Advanced SSR guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide).
- **T3:** [Next.js: Data security](https://nextjs.org/docs/app/guides/data-security).
- **T4:** [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- **T5:** [PostgreSQL: Row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
- **T6:** [PostgreSQL: CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html).
- **T7:** [Supabase: Storage schema](https://supabase.com/docs/guides/storage/schema/design).

