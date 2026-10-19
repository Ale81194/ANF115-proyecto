# Fase 02 · Importación y diario

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.  
**Estado:** especificación de ejecución desarrollada; implementación y pruebas de aplicación pendientes.

## 1. Objetivo y resultado observable

Permitir que el analista cargue un archivo contable, revise sus datos y errores, confirme un lote íntegro como borradores y prepare asientos para aprobación. El administrador con permiso de aprobación podrá contabilizarlos; después, el diario mostrará sus líneas, estado y procedencia. Una reversión conservará el asiento original y añadirá una contrapartida trazable.

La fase verifica el primer recorrido con escrituras financieras reales dentro de la aplicación local. Confirmar una importación y contabilizar asientos son pasos distintos: los borradores no afectarán los estados de la fase 03.

## 2. Requisitos, reglas y contratos

| Referencia | Cobertura |
| --- | --- |
| RF-05–RF-10 | Archivo, procedencia, validación, confirmación, borrador, aprobación, reversión y diario |
| RF-23, RF-24 | Auditoría y conservación de origen; la reproducción de resultados se amplía en fase 03 |
| RNF-01, RNF-02, RNF-03 | Autorización, atomicidad, concurrencia y precisión |
| RNF-05, RNF-06, RNF-08 | Errores utilizables, límites del importador y trazabilidad |
| RCF-01–RCF-05, RCF-07, RCF-08 | Empresa, cuentas, partida doble, fechas, estados, precisión y fuente de verdad |
| CU-05–CU-11, CU-23 | Cargar, validar, confirmar, guardar, aprobar, revertir, consultar diario y auditoría |

Los contratos de entrada, versiones y errores se mantienen en [documento 10](../tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md). Las reglas de origen y contabilidad están en [documento 04](../negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md); el algoritmo de extracción se especifica en [documento 11](../tecnico/11_MOTOR_FINANCIERO_E_IMPORTACIONES.md).

## 3. Dependencias y datos de trabajo

La [fase 01](13_FASE_01_BASE_Y_ACCESO.md) debe proporcionar identidad, membresías, permisos, catálogo publicado, períodos, auditoría y un entorno que se pueda reconstruir. Se utilizará primero un lote pequeño conciliado y después la base ampliada.

El libro `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx` contiene 477 asientos y 1,613 líneas en `DIARIO`, con debe y haber de US$2,161,744.81 por lado según la revisión del archivo fuente. Esas cifras serán expectativas de una importación completa sin duplicados, bajo el catálogo revisado y el mismo alcance. No representan pruebas ya ejecutadas de esta aplicación.

El adaptador del libro leerá `CATALOGO` y `DIARIO` con responsabilidades separadas. Las hojas de estados, presupuestos, escenarios y pronósticos no se transformarán en nuevos asientos. Los códigos permanecerán como texto y las fechas ISO como fechas contables.

## 4. Secuencia funcional que debe implementarse

1. **Recibir:** autorizar al usuario, revisar tipo, tamaño y límites del archivo; guardar su objeto privado inmutable y registrar el lote con hash y procedencia.
2. **Extraer y normalizar:** identificar hoja, fila y asiento de origen; convertir fechas, códigos e importes sin ejecutar contenido del archivo.
3. **Validar:** comprobar esquema, cuentas, empresa, período, duplicados, líneas y partida doble. Presentar todos los errores que se puedan localizar sin ocultar fallos globales del archivo.
4. **Preparar:** mostrar resumen por asiento, conteos, totales y datos originales. La selección de un error lleva a la fila que lo explica.
5. **Confirmar:** enviar lote, versión y clave de idempotencia; crear todos sus asientos y líneas como borradores dentro de una única transacción.
6. **Validar y aprobar:** aplicar el flujo de preparación del contrato CU-08 y la aprobación CU-09. La aprobación vuelve a comprobar el conjunto y su autorización antes de contabilizar.
7. **Consultar o revertir:** conservar origen y versiones; la reversión crea un asiento opuesto con motivo y vínculo al original.

El lote seguirá `recibido → validando → con_errores/listo → confirmado`; un fallo técnico tendrá estado `fallido`. Corregir el archivo genera otro lote vinculado al anterior. Una revalidación conserva el original y cambia la versión de validación. Un lote confirmado será inmutable.

El asiento seguirá `borrador → validado → contabilizado`; una modificación de un validado obliga a volver a borrador y validar otra vez. La base comprobará las condiciones necesarias del contrato en cada paso, aunque la interfaz ya las haya evaluado.

## 5. Tareas y responsables

| Trabajo | Responsable principal | Revisión o colaboración |
| --- | --- | --- |
| Preparar plantilla admitida, mapeo del libro y fixtures válidos/incorrectos | C | B |
| Implementar parser, normalización y errores por fila, columna y asiento | C | A |
| Crear tablas de staging, diario, restricciones, índices y almacenamiento privado | B | C |
| Implementar RPC transaccionales, versiones e idempotencia | B | C |
| Construir carga, vista previa, formulario y detalle de diario | A | C |
| Integrar controladores, acciones y mensajes de conflicto | A y B | C |
| Ejecutar casos de integridad, permisos, repetición y concurrencia | C | B |
| Revisar consulta y procedencia desde un asiento hasta el archivo original | A | B |

## 6. Archivos, entradas y operaciones

| Ubicación prevista | Resultado |
| --- | --- |
| `src/app/api/importaciones/route.ts` | `POST /api/importaciones`; entrada de archivo y respuesta de lote |
| `src/app/(privado)/importaciones/page.tsx` y `[id]/page.tsx` | Historial, carga, vista previa y errores |
| `src/app/(privado)/diario/` | Listado, `nuevo/page.tsx`, `[id]/page.tsx` y acciones |
| `src/controladores/importaciones.controller.ts`, `diario.controller.ts` | Coordinación de CU-05–CU-11 |
| `src/repositorios/importaciones.repository.ts`, `diario.repository.ts` | Acceso a staging, diario y RPC |
| `src/lib/excel/importar-diario.ts` | Adaptador de archivo, separado del cálculo contable |
| `src/servicios/contabilidad/validar-asiento.ts` | Validación determinista reutilizable |
| `src/schemas/importacion.schema.ts`, `asiento.schema.ts` | Contratos de entradas normalizadas |
| `supabase/migrations/` | Tablas, grants, RLS y RPC de esta fase |
| `tests/fixtures/importaciones-invalidas/` | Casos reproducibles de rechazo |

Las RPC obligatorias son `confirmar_lote`, `guardar_borrador`, `descartar_borrador`, `aprobar_asientos` y `revertir_asiento`. Descartar forma parte de CU-08: exige permiso, versión y motivo, conserva cabecera/líneas/origen y marca administrativamente el borrador; no elimina registros ni se aplica a contabilizados. Se revoca el DML directo crítico a `authenticated` y `anon`; las funciones de escritura usarán el diseño `SECURITY DEFINER` acotado del [documento 08](../tecnico/08_AUTENTICACION_PERMISOS_Y_AUDITORIA.md), con rol interno mínimo, RLS aplicable y verificación de identidad, empresa y permiso. Una función `SECURITY INVOKER` no sustituye ese diseño cuando el llamador carece de DML.

Toda mutación seguirá el orden de bloqueos acordado: empresa, períodos ordenados y recurso. Volverá a comprobar el estado abierto después de adquirir el bloqueo del período. La versión esperada protege contra formularios desactualizados; los errores inesperados abortarán la transacción, sin capturarlos para devolver un éxito ficticio. La tabla de soporte `private.operaciones_idempotentes` conservará clave, hash del contenido normalizado y resultado de la operación. El contador `siguiente_numero_asiento` del período se asignará dentro de la transacción; no se calculará mediante `MAX(numero) + 1` fuera de ella.

Storage y PostgreSQL tienen operaciones separadas. Un archivo guardado antes de una transacción fallida quedará asociado al lote o pendiente de limpieza controlada. La eliminación de objetos se hará mediante la API de Storage y no modificando directamente sus tablas internas.

## 7. Entregables obligatorios

| Entregable | Condición de aceptación |
| --- | --- |
| Plantilla y adaptador | Columnas, formatos, restricciones y procedencia documentados |
| Importador | Archivo válido, errores detallados, límites medidos y originales privados |
| Flujo de lote | Estados, versión y confirmación completa a borradores |
| Diario | Consulta filtrable y detalle con origen y estado |
| Operaciones contables | Guardado, descarte trazable de borrador, aprobación y reversión transaccionales |
| Registro de auditoría | Actor, instante, operación, recursos, motivo y revisión pertinente |
| Evidencia | Pruebas de casos válidos, rechazo, reintento y acceso directo |

## 8. Aceptación y definición de terminado

1. Una importación válida conserva cada línea y su procedencia. La confirmación crea todos los borradores previstos o ninguno.
2. Cuentas no admitidas, relaciones de otra empresa, períodos cerrados y líneas monetarias inválidas se rechazan también en la base. Un borrador manual puede guardarse desbalanceado con al menos dos líneas válidas y diferencia visible; el descuadre impide validar, confirmar un lote o contabilizar.
3. El mismo identificador de idempotencia y contenido devuelve la operación existente. Reutilizarlo con otro contenido produce conflicto; cambiar el nombre del archivo no habilita duplicar asientos normalizados.
4. Confirmar el lote no altera estados financieros. Aprobar un conjunto válido cambia su estado una sola vez; repetir la aprobación no duplica movimientos ni efectos.
5. Gerencia no contabiliza asientos. El analista prepara; la aprobación corresponde al permiso específico `asientos.aprobar`.
6. Un asiento contabilizado no se edita. La suma de original y reversión produce el efecto neto esperado, y ambos siguen visibles y participan en las sumas.
7. Dos solicitudes con la misma versión no sobrescriben cambios silenciosamente. Una operación contra un período cerrado falla aunque el formulario se abrió cuando aún estaba abierto.
8. El parser informa qué ocurrió con cada fila y no convierte datos ausentes en ceros financieros.
9. Los importes conservan precisión: PostgreSQL utiliza `numeric`, los DTO transportan strings decimales y el cálculo evita una conversión intermedia a número JavaScript.
10. Un borrador descartado conserva sus identificadores y contenido, no puede editarse ni aprobarse y no bloquea el cierre; el filtro permite consultar su historia. Los reintentos de confirmación conservan referencias válidas a esos registros.

La fase termina cuando este recorrido puede repetirse en una base de pruebas, los conteos y sumas concilian, y los casos de escritura parcial, duplicación y acceso indebido están resueltos. Los límites de archivo, filas, descompresión y tiempo deberán quedar fijados y medidos con el conjunto de referencia antes de declarar el importador listo.

## 9. Pruebas, evidencia y pendientes

El [plan de pruebas](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md) cubre lotes correctos e incorrectos, precisión, duplicados, pérdida de sesión, DML directo, versiones y reversión. Se ejecutarán **PR-05, PR-08–PR-15**, la edición concurrente de **PR-16** y los casos de Storage, auditoría, precisión, límites e interfaz **PR-33, PR-35–PR-38** aplicables al recorrido. En esta fase se prueba el bloqueo usando períodos cerrados preparados como fixture; la carrera entre cierre funcional y aprobación de PR-16 se completa cuando exista CU-21 en fase 05.

Cada evidencia registrará versión, archivo/hash, lote, conteos antes y después, respuesta obtenida y consulta de verificación. Las capturas de pantalla pueden complementar los resultados, pero no sustituyen verificar ausencia de registros parciales en PostgreSQL.

Permanecen para la [fase 03](15_FASE_03_ESTADOS_Y_ANALISIS.md) los estados e indicadores derivados. El cierre de esta fase entregará al equipo de cálculo un diario consultable, clasificado y con origen; cualquier incidencia del catálogo pendiente debe quedar explícita antes de usar sus saldos.

## 10. Referencias

- `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`: `DIARIO!A1:K1614`, `CATALOGO!A1:I80` y hojas de control; resultados de revisión registrados en el documento 20.
- [Modelo de datos y migraciones](../tecnico/07_MODELO_DE_DATOS_Y_MIGRACIONES.md), [motor e importaciones](../tecnico/11_MOTOR_FINANCIERO_E_IMPORTACIONES.md) y [registro de validación](../validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md).
- [Supabase: funciones de base de datos](https://supabase.com/docs/guides/database/functions), [esquema de Storage](https://supabase.com/docs/guides/storage/schema/design) y [PostgreSQL: tipos numéricos](https://www.postgresql.org/docs/current/datatype-numeric.html).
