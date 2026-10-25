# Modelo de datos y seguridad de Panadería Carlitos

> Integración del 25/10/2026: la aplicación trabaja exclusivamente con Supabase
> local. La referencia y comprobaciones remotas del 21/10 son antecedentes.
> El contrato de tablas se conserva; las escrituras se canalizan por RPC
> estrechas `anf_guardar_*`/`anf_anular_movimiento`, no por DML del navegador.
> `anf_reporte` centraliza las fórmulas y soporta filtros compatibles; los tres
> nombres públicos de reportes de este documento son wrappers invoker.
> Los importes de salida son texto decimal, no números JSON. El esquema local
> anterior está archivado, no eliminado. Ver el documento 22 y la evidencia 20.

**Asignatura:** ANF — Análisis Financiero. **Revisión:** 21 de octubre de 2026. **Proyecto:** `ANF_PANADERIA_CARLITOS`, referencia `zroatijmzqbdxqirvyvu`. La referencia del proyecto no es una credencial.

## Estado verificado

El modelo está instalado en Supabase/PostgreSQL 17.11. La revisión confirmó cinco tablas operativas con RLS, 26 categorías, 12 políticas, una vista con `security_invoker` y tres funciones públicas `SECURITY INVOKER`. No existen cuentas reales ni movimientos financieros en el proyecto. La estructura de la planificación sustituida fue eliminada; no forma parte de los objetos activos ni del código de instalación entregado.

La revisión de seguridad no reportó hallazgos. Los avisos de rendimiento restantes son informativos: los índices todavía no registran uso porque no hay actividad operativa. No deben eliminarse índices de claves o filtros por esa sola observación. Referencia: [asesor de índices sin uso](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

## Tablas

### perfiles

| Campo | Tipo | Regla |
|---|---|---|
| usuario_id | uuid | PK y FK a auth.users; identidad inmutable. |
| nombre | text | 2–120 caracteres después de trim. |
| rol | text | administrador o empleado; predeterminado empleado. |
| activo | boolean | Predeterminado false; activación administrativa. |
| creado_en | timestamptz | Fecha de alta generada e inmutable. |
| actualizado_en | timestamptz | Fecha asignada al modificar. |

### categorias

| Campo | Tipo | Regla |
|---|---|---|
| id | uuid | PK generada. |
| codigo | text | Único; I/G seguido de 2–4 dígitos; compatible con tipo. |
| nombre | text | 2–100 caracteres; único por tipo sin distinguir mayúsculas o espacios externos. |
| tipo | text | ingreso o gasto. |
| descripcion | text | Hasta 500 caracteres. |
| activo | boolean | Predeterminado true. |
| creado_en | timestamptz | Fecha generada. |
| actualizado_en | timestamptz | Fecha asignada al modificar. |

El catálogo inicial tiene seis categorías de ingreso y veinte de gasto. Una categoría usada conserva código y tipo; puede desactivarse para impedir nuevas capturas. Las referencias históricas se mantienen.

### ingresos y gastos

Ambas tablas tienen la misma estructura. El tipo compatible de categoría depende de la tabla.

| Campo | Tipo | Regla |
|---|---|---|
| id | uuid | PK generada e inmutable. |
| fecha | date | Día válido y finito. |
| concepto | text | 2–250 caracteres después de trim. |
| monto | numeric | >0, ≤999999999999.99, escala ≤2; rechazo de fracciones de centavo. |
| categoria_id | uuid | FK restrict; categoría activa y compatible al crear/cambiar clasificación. |
| referencia | text nullable | Hasta 120 caracteres. |
| estado | text | vigente o anulado; inicial vigente. |
| creado_por | uuid | Perfil de auth.uid(); inmutable. |
| creado_en | timestamptz | Fecha generada e inmutable. |
| actualizado_por | uuid nullable | Actor asignado por el servidor. |
| actualizado_en | timestamptz | Fecha asignada por servidor. |
| revision | integer | Inicial 1; incremento por modificación. |
| solicitud_id | uuid | Único por creador; conservarlo en un reintento de alta. |
| motivo_anulacion | text nullable | 5–500 caracteres cuando el estado sea anulado. |
| anulado_por | uuid nullable | Perfil asignado al anular. |
| anulado_en | timestamptz nullable | Fecha asignada al anular. |

La tabla no usa numeric(14,2) para redondear la entrada: numeric y la restricción de escala permiten rechazar el dato con fracciones de centavo. Las referencias de perfiles y categorías usan `ON DELETE RESTRICT`. Los clientes no tienen permiso de DELETE. Una anulación es definitiva y el registro anulado no admite edición.

Los índices cubren creador+fecha, fecha de movimientos vigentes, categoría y actores de modificación/anulación. Una comparación de `revision` en el cliente permite detectar ediciones concurrentes: filtrar por id y revisión cargada y comprobar que cambió exactamente una fila. Esta comprobación debe implementarse al conectar React.

### bitacora

| Campo | Tipo | Regla |
|---|---|---|
| id | uuid | PK generada. |
| actor_id | uuid nullable | FK al perfil; null en acciones técnicas del sistema. |
| fecha_hora | timestamptz | Fecha del servidor. |
| accion | text | INSERT, UPDATE, ANULAR o MIGRACION. |
| entidad | text | Tabla o ámbito afectado. |
| registro_id | uuid nullable | Registro al que se refiere el evento. |
| motivo | text nullable | Motivo cuando corresponda. |
| antes | jsonb nullable | Valor anterior en modificación. |
| despues | jsonb nullable | Valor posterior. |

Los eventos de negocio se insertan mediante disparadores protegidos. La bitácora rechaza UPDATE/DELETE y solo el administrador activo la consulta. No guarda contraseñas, tokens o claves. Los eventos de inicio de sesión se revisan en Auth; no se afirma que estén incorporados a esta tabla.

## Relaciones y permisos

Auth conserva una identidad por cuenta; perfiles añade rol y estado. Un perfil crea muchos movimientos. Una categoría clasifica muchos movimientos compatibles. El actor de una acción puede relacionarse con múltiples eventos de bitácora.

| Recurso | Administrador activo | Empleado activo | Sin perfil activo / anónimo |
|---|---|---|---|
| Perfil | Consultar todos y modificar campos autorizados | Consultar el propio | Sin operación financiera; una identidad puede leer su propio perfil para identificar su estado |
| Crear identidad Auth | Servicio administrativo protegido, pendiente de integrar | No | No |
| Categorías | Consultar, crear, editar y desactivar | Consultar activas y las necesarias para sus registros históricos | No |
| Movimientos | Consultar y corregir vigentes autorizados del negocio; registrar a su nombre | Consultar, registrar, modificar y anular propios vigentes | No |
| Panel/reportes | Datos autorizados del negocio | Datos propios | No |
| Bitácora | Consultar | No | No |

Las doce políticas se distribuyen en perfiles (2), categorías (3), ingresos (3), gastos (3) y bitácora (1). Las concesiones por columna impiden escribir identidad, creador o fechas de auditoría desde el cliente. La autorización consulta el perfil activo asociado a `auth.uid()` y nunca `user_metadata`.

Los helpers privilegiados permanecen en `private`, con `search_path` vacío, referencias cualificadas y permisos de ejecución restringidos. Mantener ese esquema fuera de los esquemas expuestos de la API. El helper de rol solo devuelve el rol del usuario actual. Las funciones de disparador no son endpoints administrativos para el navegador.

## Consultas del panel y reportes

| Objeto | Contrato |
|---|---|
| v_movimientos | Unión de ingresos/gastos con tipo; vista con security_invoker que respeta las políticas de las tablas. |
| resumen_financiero | p_desde date, p_hasta date; devuelve JSON con fechas, USD, ingresos, gastos, resultado, porcentaje_gastos y cantidades. |
| reporte_movimientos | Fechas, p_categoria_id UUID nullable y p_tipo ingreso/gasto nullable; detalle vigente autorizado. |
| reporte_periodico | Fechas y p_granularidad dia/mes/anio; períodos con ingresos, gastos, resultado y porcentaje. |

El rango es inclusivo. Se rechazan fechas nulas/infinito, rango invertido y diferencia superior a 3660 días. Los períodos vacíos se completan con ceros. Si I=0, el porcentaje es null. Las tres funciones son SECURITY INVOKER y no amplían el alcance del empleado.

```ts
const { data, error } = await supabase.rpc('resumen_financiero', {
  p_desde: '2026-10-01',
  p_hasta: '2026-10-31'
});
if (error) throw error;
// Renderizar porcentaje_gastos === null como “No aplica”.
```

Para registrar enviar fecha, concepto, monto, categoria_id, referencia y solicitud_id. No enviar actores, fechas de auditoría ni rol. Para anular actualizar estado y motivo_anulacion con autorización; el servidor asigna actor y fecha. Mantener una misma solicitud_id para el reintento de la misma captura y una distinta para otra operación legítima.

## Primera cuenta y administración de usuarios

No hay usuarios reales creados. El disparador de Auth crea el perfil como empleado inactivo, independientemente del rol que alguien incluya en sus metadatos. Primero debe crearse una identidad real, verificar su correo/UUID y promoverla mediante SQL de mantenimiento confiable. El ejemplo `02_primer_administrador.sql.example` contiene un marcador que impide ejecutarlo sin sustituirlo por el UUID verificado, y aborta si ya existe un administrador activo. No inventar una cuenta ni distribuir una contraseña de prueba.

Las altas posteriores requieren un servicio de servidor que valide la sesión, compruebe el perfil de administrador activo y utilice la API administrativa de Auth. El navegador utiliza la clave pública autorizada y RLS; secret/service_role permanece en servidor. Ese servicio administrativo y los flujos de sesión reales deben completarse en la integración. La base protege al último administrador activo y bloquea operaciones financieras de perfiles desactivados.

## Archivos técnicos y reproducción

- `01_crear_modelo_actual.sql`: instalación completa de las cinco tablas, restricciones, permisos, disparadores, vista, RPC y 26 categorías en una instancia nueva/vacía de Supabase. No ejecutar en el proyecto configurado.
- `02_primer_administrador.sql.example`: promoción inicial controlada tras verificar la identidad.
- `database.types.ts`: tipos generados desde el esquema remoto vigente.
- `catalogo_categorias.json`: catálogo operativo completo.
- `catalogo_contable_referencia.json`: 47 cuentas del anexo académico, sin crear una tabla de cuentas.
- `verificacion_supabase_actual.json`: evidencia de revisión remota.
- `pruebas_locales`: script y dependencia fijada de PGlite para comprobar el modelo aislado.

En la carpeta de pruebas, usar Node 24, ejecutar `npm install` y `npm test`. El script simula Auth localmente; no necesita credenciales ni conexión al proyecto remoto. Sus 52 comprobaciones incluyen estructura, categorías, RLS, permisos, importes, filtros, reportes, anulaciones, solicitudes duplicadas, desactivación y último administrador. Las cuentas y movimientos ficticios se revierten al finalizar.

## Límites de validación y mantenimiento

La revisión remota confirmó el modelo y los permisos básicos; authenticated sin perfil activo no accede a movimientos ni ejecuta resumen y anon carece de permisos. Las pruebas de administrador/empleado de extremo a extremo, sesiones reales, concurrencia y restauración todavía deben realizarse con la aplicación conectada.

Antes de modificar estructura o incorporar datos reales, generar respaldo de esquema/datos y ensayar su restauración por separado. Registrar frecuencia, retención y responsables según el entorno efectivo. Auth requiere su procedimiento de recuperación; no asumir que exportar tablas públicas es respaldo total ni prometer funcionalidades del plan que no se hayan confirmado.

Fuentes técnicas: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [funciones PostgreSQL en Supabase](https://supabase.com/docs/guides/database/functions), [seguridad de contraseñas](https://supabase.com/docs/guides/auth/password-security) y [numeric](https://www.postgresql.org/docs/current/datatype-numeric.html). La evidencia del paquete describe comprobaciones realizadas; no sustituye una revisión del estado real antes de futuros cambios.
