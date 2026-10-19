# Fase 04 · Presupuestos y escenarios

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.  
**Estado:** especificación de ejecución desarrollada; implementación y pruebas de aplicación pendientes.

## 1. Objetivo y resultado observable

Permitir preparar un presupuesto mensual, revisar y aprobar una versión, compararla con datos históricos y evaluar escenarios de ventas, costos y gastos. Cada resultado deberá identificar la serie utilizada, método, parámetros, cobertura y versión.

El resultado de esta fase es un plan reproducible y un pronóstico preliminar. Cuando falten saldos de apertura, calendarios de cobro o pago u otros movimientos, la interfaz podrá mostrar sensibilidad y series parciales claramente identificadas. Los tres estados proyectados conciliados se completan en la fase 05.

## 2. Requisitos, reglas y contratos

| Referencia | Compromiso |
| --- | --- |
| RF-16 | Presupuesto mensual por rubros y entradas/salidas de efectivo |
| RF-17 | Versiones, revisión y aprobación del plan |
| RF-18 | Comparación real frente a presupuesto sobre bases compatibles |
| RF-19 | Métodos deterministas y escenarios versionados |
| RF-23, RF-24 | Auditoría, procedencia y reproducción de planes y cálculos |
| RNF-01–RNF-05, RNF-08 | Acceso, concurrencia, precisión, modularidad y explicación |
| RCF-04, RCF-07, RCF-08, RCF-16–RCF-20 | Tiempo, precisión, snapshots, comparación, faltantes y planificación |
| CU-14–CU-17, CU-23 | Guardar, aprobar, comparar presupuesto, guardar escenario y consultar auditoría |

CU-17 incluye calcular un pronóstico preliminar con un método definido. La ejecución integrada de movimientos futuros corresponde a CU-18 y a la [fase 05](17_FASE_05_PROYECCIONES_Y_REPORTES.md).

## 3. Dependencias y decisiones de entrada

Se requiere el MVP de la [fase 03](15_FASE_03_ESTADOS_Y_ANALISIS.md), especialmente rubros coherentes, series mensuales correctas y consultas reproducibles. Antes de crear un plan se fijarán empresa, moneda, ejercicio, base temporal y versión del catálogo/política.

El analista prepara el presupuesto y gerencia lo aprueba según la matriz propuesta. La administración de usuarios no concede por sí sola `presupuestos.aprobar`; cualquier excepción debe ser un permiso explícito. Esta separación resuelve operativamente las atribuciones diferentes presentes en los documentos originales y continúa sujeta a ratificación funcional.

Los datos de `PRESUPUESTO_2027` y `PRONOSTICO_2027` del libro no se aceptarán como plan correcto por el hecho de estar calculados en una hoja. La revisión identificó una base acumulada utilizada como si fuera una venta mensual; el sistema regenerará las series desde la base temporal adecuada y conservará esa procedencia.

## 4. Flujo de presupuesto

1. El analista crea un presupuesto para empresa y ejercicio, con moneda USD y líneas mensuales vinculadas a rubros publicados.
2. Introduce ventas, costos, gastos y un calendario de entradas y salidas de efectivo. Ventas devengadas y cobros son conceptos separados; lo mismo ocurre con costos/gastos y pagos.
3. Guarda el borrador con versión esperada. La vista muestra totales mensuales y del ejercicio, celdas sin completar e incidencias.
4. Envía una versión completa a revisión. El estado pasa de `borrador` a `en_revision` mediante la operación autorizada del contrato.
5. Gerencia revisa supuestos y detalle y aprueba o rechaza con motivo. Un rechazo devuelve una decisión trazable; su corrección sigue el flujo definido, sin alterar el historial.
6. Una versión aprobada conserva su contenido. Cambiar el plan requiere una nueva versión relacionada con la anterior.
7. La comparación selecciona una versión concreta del plan y una ejecución histórica con la misma empresa, rubros y meses comparables.

El comparativo mostrará plan, observado, diferencia absoluta y relativa cuando esta última esté definida. Un exceso de gasto y un exceso de ingreso no recibirán automáticamente la misma interpretación. Si el plan es cero, la diferencia absoluta sigue siendo útil; la variación porcentual tendrá explicación de no calculable según la regla financiera.

## 5. Pronóstico y escenarios

Los métodos iniciales son **promedio móvil de tres meses** y **crecimiento explícito**. Cada ejecución almacenará el método, ventana, meses de entrenamiento, serie mensual de origen, parámetros, horizonte y versión. El crecimiento no se aplicará por error a un acumulado desde el inicio de la empresa.

Los escenarios base, favorable y adverso consisten en conjuntos de supuestos comparables. Pueden variar crecimiento, proporción de costo, gasto u otros parámetros admitidos. No se asignarán probabilidades que no provengan de una definición justificada. Cambiar un supuesto genera una nueva versión del escenario y, al calcularla, una nueva ejecución; no modifica el diario histórico ni un presupuesto aprobado.

La evaluación reservará meses al final de la serie histórica y calculará las predicciones sin usar esos valores futuros como entradas de entrenamiento. Se reportará MAE y el número de observaciones evaluadas. Cualquier métrica porcentual adicional debe tratar expresamente los valores cero; una serie corta o sin meses suficientes mostrará la limitación, sin completar observaciones con cifras inventadas.

Para un horizonte 2027 y último cierre disponible en octubre de 2026, se mostrará el faltante de noviembre y diciembre de 2026. Un pronóstico de ventas parcial es admisible en esta fase si conserva esa etiqueta. La creación del puente y los movimientos que producirán un balance de apertura 2027 conciliado forman parte de la fase 05.

## 6. Tareas y responsables

| Trabajo | Responsable principal | Revisión |
| --- | --- | --- |
| Modelar presupuesto, líneas, estados, versiones y permisos de aprobación | B | C |
| Definir rubros presupuestarios y reglas de comparación con el histórico | C | B |
| Construir grilla mensual, totales, detalle y revisión | A | C |
| Implementar guardado, envío a revisión y aprobación mediante operaciones estrechas | B | A |
| Implementar promedio móvil, crecimiento y evaluación temporal | C | B |
| Construir edición y comparación de escenarios con cobertura visible | A | C |
| Integrar snapshots, conflictos de versión y auditoría | B | C |
| Ejecutar casos de inmutabilidad, permisos, diferencias y faltantes | C | A y B |

## 7. Archivos y contratos afectados

| Ubicación prevista | Resultado |
| --- | --- |
| `src/app/(privado)/presupuestos/page.tsx` | Listado y creación de planes |
| `src/app/(privado)/presupuestos/[id]/page.tsx` | Líneas, versión y flujo de revisión |
| `src/app/(privado)/presupuestos/[id]/comparativo/page.tsx` | Plan seleccionado frente a histórico |
| `src/app/(privado)/escenarios/` | Listado, `[id]/page.tsx` y `comparar/page.tsx` |
| `src/controladores/presupuestos.controller.ts`, `escenarios.controller.ts` | CU-14–CU-17 |
| `src/repositorios/presupuestos.repository.ts`, `escenarios.repository.ts` | Versiones, supuestos y ejecuciones |
| `src/servicios/presupuestos/comparar-presupuesto.ts` | Desviaciones y estados de comparabilidad |
| `src/servicios/proyecciones/pronosticar-ventas.ts`, `evaluar-pronostico.ts` | Métodos y evaluación deterministas |
| `src/schemas/presupuesto.schema.ts`, `escenario.schema.ts` | Validación de versiones y parámetros |
| `supabase/migrations/` | Tablas y operaciones específicas de planes y escenarios |

Las acciones delegarán en [CU-14–CU-17](../tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md), con comprobación de permiso, versión esperada e idempotencia en operaciones reintentables. La aprobación y otras transiciones sensibles tendrán RPC específicas; no se abrirá DML genérico para permitir actualizar estados arbitrarios. Se reutilizarán el diseño de grants/RLS y el orden de bloqueos establecido en los documentos 07 y 08.

## 8. Entregables obligatorios y aceptación

| Entregable | Resultado observable que debe demostrarse |
| --- | --- |
| Editor presupuestario | Meses, rubros, totales, celdas faltantes y efectivo separado del devengo |
| Versiones y aprobación | Una versión aprobada permanece inmutable y conserva actor y decisión |
| Comparativo | Misma base temporal y rubros; diferencias reproducibles |
| Métodos | Promedio móvil y crecimiento con serie, parámetros y cobertura visibles |
| Escenarios | Tres conjuntos comparables o los que el usuario prepare, sin probabilidades supuestas |
| Evaluación | Meses reservados, predicción, observado, error y MAE |
| Evidencia | Pruebas de cálculo, estados, permisos, conflictos y protección del histórico |

Como sensibilidad controlada del ejemplo mensual, con ventas **12,000.00**, costo **60%** y gastos **3,000.00**, el resultado antes de impuestos es **1,800.00**. Con ventas **13,200.00**, costo **60%** y el mismo gasto es **2,280.00**. Con ventas **10,800.00**, costo **65%** y gasto **3,000.00**, es **780.00**. Son escenarios académicos concretos; no constituyen tasas recomendadas para el negocio. Su referencia es `Carlitos_Reporte_Mejorado.docx`, sección 9.

La aceptación exige además que un usuario sin permiso no apruebe presupuesto mediante llamada directa, que un reintento no cree versiones duplicadas y que un formulario viejo reciba conflicto antes de sobrescribir un plan. Un cambio de catálogo o de política conservará identificadas las versiones previamente emitidas.

## 9. Definición de terminado y evidencia

La fase está terminada cuando se completa el recorrido borrador → revisión → aprobación → comparativo, los métodos reproducen sus resultados a partir de entradas guardadas y se comprueba que ningún escenario modifica asientos históricos. Los resultados de cálculo se contrastarán con expectativas independientes, incluyendo cero, ausencia de datos y series insuficientes.

Se ejecutarán los casos correspondientes del [plan de pruebas](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md). La evidencia incluirá versión del plan, parámetros, serie de entrada, política, observado y esperado. Capturar solo un gráfico no demuestra reproducción ni corrección del método.

Los casos principales son **PR-26–PR-28**, el tramo de sensibilidad de **PR-30** y la identificación de puente faltante de **PR-29**. La integración de los movimientos futuros de PR-29 y PR-30 se termina en fase 05. La aprobación presupuestaria completa el subcaso correspondiente de **PR-03**; auditoría, precisión e interfaz se revisan con **PR-35, PR-36 y PR-38**.

## 10. Pendientes y transición

La fase entregará una lista explícita de datos faltantes para la proyección integrada: cierre inicial, puente, cobros, pagos, inventario, depreciación, deuda, inversión, aportes y retiros. La [fase 05](17_FASE_05_PROYECCIONES_Y_REPORTES.md) consumirá ese inventario y bloqueará estados futuros completos mientras falten componentes necesarios.

La publicación de un plan real exige ratificar responsables y supuestos. Mientras tanto, los fixtures y presupuestos demo se identificarán como académicos. El [registro 20](../validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md) conserva los resultados efectivamente obtenidos cuando se implemente esta fase.

## 11. Referencias

- `Carlitos_Reporte_Mejorado.docx`: presupuestos, escenarios y ejemplo mensual de la sección 9.
- `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`: `PRONOSTICO_2027!D2`, `RESUMEN_MENSUAL!D26`, `ESTADO_RESULTADOS!C26`, `PRESUPUESTO_2027` y `ESCENARIOS`.
- [Reglas financieras](../negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md), [motor](../tecnico/11_MOTOR_FINANCIERO_E_IMPORTACIONES.md) y [módulos, usuarios y flujos](../negocio/02_MODULOS_USUARIOS_Y_FLUJOS.md).
