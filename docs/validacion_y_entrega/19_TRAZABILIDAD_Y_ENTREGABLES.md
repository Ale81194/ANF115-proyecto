# 19. Trazabilidad y entregables

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.

**Estado:** matriz de cobertura y contrato de entrega. El paquete contiene especificaciones; los productos de software y las pruebas de aplicación permanecen pendientes. La revisión efectuada de los materiales fuente se identifica en el [registro 20](20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md).

## 1. Cómo demostrar que el sistema cumple

Cada requisito se conecta con su regla de negocio, su caso de uso, la fase que lo incorpora y una prueba observable. La trazabilidad termina en una evidencia real de ejecución, con versión, fecha y resultado. La presencia de un archivo de código o de un MD no sustituye esa evidencia.

La cadena de referencia es **requisito → regla → contrato → fase → prueba → evidencia**. Los identificadores RF y RNF se mantienen en el [documento 03](../negocio/03_REQUERIMIENTOS_Y_CRITERIOS_DE_ACEPTACION.md); RCF en el [04](../negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md); CU en el [10](../tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md); PR en el [18](18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md). Este documento relaciona esos catálogos sin reemplazarlos.

## 2. Matriz funcional

**Estado de implementación de todas las filas: pendiente.** Las pruebas listadas son necesarias para demostrar el comportamiento; varias son transversales y se ejecutan en más de una fase cuando cambia el área protegida.

| Requisito | Reglas principales | Contrato | Fase principal | Producto observable | Pruebas |
| --- | --- | --- | --- | --- | --- |
| RF-01 Acceso y membresía | RCF-01 | CU-01 | 01 | Login y acceso a datos de la empresa autorizada | PR-02, PR-04 |
| RF-02 Usuarios y permisos | RCF-01 | CU-02 | 01 | Gestión de perfiles y asignaciones controladas | PR-03, PR-35 |
| RF-03 Catálogo | RCF-02 | CU-03 | 01 | Catálogo jerárquico revisado y cuentas de movimiento | PR-05, PR-06 |
| RF-04 Períodos y contexto | RCF-01, RCF-04, RCF-06 | CU-04 | 01 | Selección de período, corte y disponibilidad | PR-07, PR-20 |
| RF-05 Carga con procedencia | RCF-01, RCF-07, RCF-08 | CU-05 | 02 | Archivo privado y lote trazable | PR-08, PR-12, PR-33, PR-37 |
| RF-06 Validación por fila | RCF-02–RCF-04, RCF-07 | CU-06 | 02 | Vista previa con errores accionables | PR-06, PR-09, PR-10 |
| RF-07 Confirmación de lote | RCF-03, RCF-05, RCF-08 | CU-07 | 02 | Borradores completos sin duplicación ni escritura parcial | PR-08, PR-10–PR-12 |
| RF-08 Borrador manual | RCF-02–RCF-05, RCF-07 | CU-08 | 02 | Asiento editable con versión y validación | PR-05, PR-13, PR-16 |
| RF-09 Aprobar y revertir | RCF-03, RCF-05, RCF-06 | CU-09, CU-10 | 02 | Diario contabilizado e historia de reversión íntegra | PR-14–PR-16 |
| RF-10 Consultar diario | RCF-01, RCF-04, RCF-08 | CU-11 | 02 | Filtros, detalle y origen de cada línea | PR-04, PR-17 |
| RF-11 Comprobación | RCF-03, RCF-04, RCF-08 | CU-12 | 03 | Débitos, créditos y saldos conciliados | PR-17, PR-18 |
| RF-12 Estados históricos | RCF-04, RCF-09–RCF-11 | CU-12 | 03 | Resultados, situación financiera y patrimonio | PR-18–PR-21 |
| RF-13 Indicadores | RCF-07, RCF-12–RCF-15, RCF-17 | CU-13 | 03 | Valor, unidad, fórmula, operandos y calidad | PR-21–PR-23, PR-36 |
| RF-14 Comparaciones | RCF-04, RCF-16, RCF-17 | CU-13 | 03 | Análisis horizontal/vertical con períodos comparables | PR-20, PR-24 |
| RF-15 Dashboard | RCF-01, RCF-04, RCF-08, RCF-17 | CU-12, CU-13 | 03 | Resumen con contexto, cobertura y detalle | PR-20, PR-23, PR-38 |
| RF-16 Presupuesto mensual | RCF-04, RCF-07, RCF-18 | CU-14 | 04 | Líneas por mes/rubro y programación de efectivo | PR-26, PR-27 |
| RF-17 Aprobar presupuesto | RCF-08, RCF-18 | CU-15 | 04 | Versión aprobada inmutable y responsable | PR-03, PR-26 |
| RF-18 Real frente a plan | RCF-04, RCF-16–RCF-18 | CU-16 | 04 | Desviación e interpretación por rubro | PR-27 |
| RF-19 Métodos y escenarios | RCF-07, RCF-17, RCF-19 | CU-17 | 04 | Supuestos versionados, pronóstico preliminar y evaluación | PR-28, PR-29, PR-30 |
| RF-20 Estados proyectados | RCF-09–RCF-11, RCF-20 | CU-18 | 05 | Movimientos futuros y tres estados conciliados | PR-29–PR-31 |
| RF-21 Reportes | RCF-01, RCF-04, RCF-08 | CU-19, CU-20 | 05 | PDF/XLSX de la misma ejecución autorizada | PR-04, PR-32, PR-33 |
| RF-22 Cierre y reapertura | RCF-05, RCF-06, RCF-08 | CU-21, CU-22 | 05 | Cierre conservado, bloqueo y nueva revisión al reabrir | PR-16, PR-34 |
| RF-23 Auditoría | RCF-01, RCF-05, RCF-06, RCF-08 | CU-23 y mutaciones | 01–05 | Eventos consultables e inmutables para usuarios | PR-03, PR-14, PR-35 |
| RF-24 Reproducibilidad | RCF-04, RCF-07, RCF-08, RCF-19 | CU-12–CU-20 | 03–05 | Inputs, política, catálogo y resultados versionados | PR-25, PR-28, PR-32 |

El control de período cerrado pertenece a todas las escrituras desde fase 02. Que la pantalla completa de cierre se entregue en fase 05 no permite omitir ese control en importación, edición o aprobación.

## 3. Matriz de requisitos no funcionales

| Requisito | Decisión técnica que lo materializa | Evidencia mínima futura |
| --- | --- | --- |
| RNF-01 Aislamiento y autorización | Membresías, comprobación por operación, RLS y RPC con permisos acotados | PR-02–PR-05 y PR-14 con sesiones ordinarias; intentos directos y por URL |
| RNF-02 Integridad y concurrencia | Transacción para cabecera/líneas/estado, idempotencia, versión esperada y orden de bloqueos | PR-10, PR-11, PR-15, PR-16; conteos y revisión antes/después |
| RNF-03 Precisión y fechas | Dinero decimal, transporte textual, fecha contable DATE y política de redondeo | PR-07, PR-09, PR-21–PR-23, PR-36 |
| RNF-04 Modularidad | Páginas delgadas, controladores, servicios puros, repositorios, clientes por solicitud | Revisión de dependencias y cambios de una función sin duplicación en páginas; pruebas de servicio aisladas |
| RNF-05 Interfaz accesible | Etiquetas, foco, errores vinculados, estados vacíos, tablas alternativas y contexto visible | PR-38 y revisión de las pantallas del documento 09 |
| RNF-06 Límites y rendimiento | Tamaño/filas/expansión/tiempo configurados, paginación y medición del conjunto de referencia | PR-37; informe con configuración, equipo y tiempos observados |
| RNF-07 Reproducción y recuperación | Migraciones, semillas, variables documentadas y procedimiento de restauración | PR-01, PR-39; resultados de una instancia nueva |
| RNF-08 Trazabilidad y privacidad | Archivos privados, snapshots, auditoría, errores sin secretos y logs operativos mínimos | PR-25, PR-32, PR-33, PR-35, PR-40 |

## 4. Qué debe entregarse por fase

Los responsables se identifican como **A: interfaz e integración**, **B: datos y seguridad**, **C: motor financiero y calidad**. Es una distribución propuesta para tres personas, con revisión cruzada; no sustituye asignaciones nominales ni garantiza el calendario de cuatro semanas mencionado en los materiales.

| Entrega | Resultado al que se compromete la fase | Artefactos y evidencia necesarios |
| --- | --- | --- |
| E-01 Base y acceso | Un usuario autorizado entra y consulta catálogo y períodos | Código de estructura, rutas, AppShell y sesión; migraciones y permisos iniciales; semillas; guía local ejecutada; PR de acceso/configuración |
| E-02 Importación y diario | Un archivo válido produce borradores y, tras aprobación, movimientos trazables | Adaptador y plantilla; staging; errores; controlador y RPC; diario; idempotencia; auditoría; archivos válidos/invalidos y resultados de integridad |
| E-03 Estados y análisis | El diario se convierte en estados conciliados y razones explicables | Servicios y consultas; pantallas de estados/dashboard; catálogo de fórmulas; fixtures; resultados comparados con valores esperados |
| E-04 Presupuestos y escenarios | El analista prepara un plan versionado y gerencia lo aprueba | Presupuesto mensual, versiones, aprobaciones, comparativo, métodos, supuestos y evaluación temporal; pruebas de rol y reproducibilidad |
| E-05 Proyecciones y entrega | Se publican estados futuros conciliados y reportes reproducibles | Movimientos proyectados, puente temporal, exportación, cierre/reapertura, recuperación comprobada y demostración integrada |

El detalle de tareas y definición de terminado está en las [fases 13](../implementacion/13_FASE_01_BASE_Y_ACCESO.md), [14](../implementacion/14_FASE_02_IMPORTACION_Y_DIARIO.md), [15](../implementacion/15_FASE_03_ESTADOS_Y_ANALISIS.md), [16](../implementacion/16_FASE_04_PRESUPUESTOS_Y_ESCENARIOS.md) y [17](../implementacion/17_FASE_05_PROYECCIONES_Y_REPORTES.md). E-03 constituye el primer recorrido histórico completo del MVP; E-05 completa el alcance planificado.

## 5. Composición de una entrega del sistema

Una versión candidata futura incluirá un identificador de versión y commit, instrucciones reproducibles, migraciones aplicadas, catálogo y política utilizados, datos de prueba permitidos, alcance verificado, evidencias PR, manual actualizado y pendientes aceptados. Los resultados financieros de demostración se adjuntarán con origen simulado y con sus filtros/corte.

| Tipo | Ejemplos | Criterio de aceptación |
| --- | --- | --- |
| Código | Páginas, componentes, controladores, servicios, repositorios | Compila, conserva límites de capas y cumple casos asignados |
| Base de datos | SQL, grants, RLS, funciones, semillas | Se construye en limpio y rechaza escrituras no autorizadas o inválidas |
| Datos | Catálogo revisado, mapeo, fixture y plantilla | Procedencia conocida, cifras conciliadas y cambios registrados |
| Salidas del sistema | PDF, XLSX y ejecución de proyección | Coinciden con una versión verificable de la pantalla y sus inputs |
| Documentación | Los 22 MD de este paquete, actualizados a la versión real | Enlaces válidos, decisiones consistentes y estado factual |
| Evidencia | Resultado de prueba, exportación inspeccionada, restauración | Identifica versión, entrada, esperado, obtenido y responsable |

No se necesita un archivo de entregables por pantalla. El contrato de la fase especifica el producto; esta matriz permite comprobar cobertura. Si la rúbrica académica exige informe formal, presentación u otro formato, se añadirá como entrega específica: los 22 MD no se presentan como exigencia confirmada de una institución.

## 6. Estado de la entrega documental actual

**D-01: documentación inicial en 22 MD.** Contiene un índice, cuatro documentos de negocio, ocho técnicos, cinco fases y cuatro documentos de validación/entrega. Desarrolla el contenido acordado a partir de los adjuntos y de la arquitectura consolidada. Los 22 documentos son archivos separados y se distribuyen en un único ZIP.

Las revisiones de los datos fuente EV-F01–EV-F08 son antecedentes documentados. EV-D01 identifica la comprobación del paquete de MD. La existencia de esos registros no convierte en aprobadas las PR de la aplicación. El [manual 21](21_MANUAL_DE_USUARIO_Y_DEMOSTRACION.md) describe el recorrido previsto y debe contrastarse con la interfaz cuando exista.

La entrega actual comprende los MD; los adjuntos originales, una aplicación ejecutable, migraciones SQL reales, secretos, base desplegada y reportes generados por el sistema no forman parte del ZIP solicitado. Las cifras de referencia y los localizadores de fuentes sí están descritos en los documentos.

## 7. Cambios y aceptación de pendientes

Un requisito nuevo recibe ID, razón, prioridad, fase y criterio de aceptación. Un cambio de regla financiera identifica la política afectada y las salidas que deben regenerarse. Un cambio de esquema requiere migración; un cambio de interfaz actualiza el documento 09 y, al implementarse, el manual 21. Las versiones emitidas de análisis y reportes conservan su identidad histórica.

Antes de cerrar una fase, el equipo revisa la fila de cada requisito afectado, ejecuta sus pruebas y registra el resultado. Si hay un pendiente aceptado, se documentan el impacto observable, el alcance excluido, el responsable de resolverlo y la aceptación de quien corresponda. No se marca verificado un requisito con prueba pendiente.

En una entrega académica final, la demostración debe identificar qué versión se muestra, qué datos son simulados y qué capacidades están completas. El [registro 20](20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md) será la referencia factual para redactar ese cierre.
