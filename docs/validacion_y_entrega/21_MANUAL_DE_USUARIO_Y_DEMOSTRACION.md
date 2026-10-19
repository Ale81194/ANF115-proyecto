# Manual de usuario y demostración de Carlitos Finanzas

**Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.

**Estado del manual:** recorrido previsto para la implementación. La aplicación todavía no está construida; las rutas, acciones y resultados de esta guía describen el comportamiento que debe entregarse. No se incluyen capturas de una aplicación operativa ni pruebas de software supuestamente aprobadas. Al implementar cada fase se verificarán los nombres de acciones y pantallas y se actualizará esta guía con evidencia real.

## 1. Qué permite hacer el sistema

Carlitos Finanzas organiza información contable, calcula estados e indicadores y permite elaborar presupuestos, escenarios y proyecciones. El recorrido empieza con un catálogo revisado y movimientos contables; continúa con su aprobación; y termina en resultados que conservan período, origen y versión.

La empresa inicial y la base ampliada de Carlitos son académicas y simuladas. Consultar un período de 2024, 2025 o 2026 no convierte esos datos en operaciones reales del negocio. El caso Manufacturas Alfa es un conjunto independiente para comprobar indicadores; sus estados no se mezclarán con el diario de Carlitos.

| Disponibilidad prevista | Funciones que se podrán recorrer al terminar esa fase |
| --- | --- |
| Fase 01 | Acceso, usuarios, catálogo y períodos |
| Fase 02 | Importación, revisión, diario y aprobación/reversión |
| Fase 03 | Estados históricos, indicadores, comparaciones y dashboard |
| Fase 04 | Presupuestos, aprobación del plan y escenarios preliminares |
| Fase 05 | Estados proyectados, exportación, cierre y reapertura |

El primer MVP completo llega al terminar la fase 03. Mientras una fase siga pendiente, sus pasos de este manual son instrucciones previstas, sin disponibilidad funcional confirmada.

## 2. Perfiles y responsabilidades

| Perfil | Trabajo previsto |
| --- | --- |
| Administrador | Gestiona usuarios, catálogo y períodos; aprueba asientos; cierra/reabre con motivo y consulta auditoría |
| Analista | Carga y revisa datos; prepara asientos; consulta estados; elabora presupuestos y escenarios |
| Gerencia | Consulta y exporta información autorizada; revisa y aprueba presupuestos |

La matriz es la propuesta funcional vigente. **Aprobar asientos y aprobar presupuestos son permisos diferentes.** Un administrador no recibe automáticamente aprobación presupuestaria y gerencia no contabiliza asientos. Las excepciones se asignarán de forma explícita y quedarán registradas.

Las responsabilidades detalladas se encuentran en [módulos, usuarios y flujos](../negocio/02_MODULOS_USUARIOS_Y_FLUJOS.md). La preparación técnica del entorno corresponde al [documento 12](../tecnico/12_ENTORNO_LOCAL_Y_OPERACION.md), no a los pasos de uso cotidiano de esta guía.

## 3. Entrar y elegir el contexto

1. Abrir `/login` en el entorno entregado e introducir las credenciales asignadas por el administrador.
2. Iniciar sesión. Si la identidad y membresía están activas, el sistema abrirá `/dashboard` con la empresa autorizada.
3. Revisar empresa, moneda y período. La selección de contexto organiza la consulta; no concede acceso a otra empresa.
4. Elegir si se necesita un mes, un acumulado del ejercicio o un saldo a una fecha de corte, según la pantalla.
5. Antes de interpretar una cifra, comprobar su origen: histórico simulado, estimación, presupuesto o proyección.

Si la sesión vence, volver a entrar y consultar el estado de la operación que se estaba realizando. Ante una respuesta interrumpida durante confirmación o aprobación, revisar el lote o asiento antes de enviar una operación nueva: el sistema debe recuperar el resultado de un reintento sin duplicar efectos.

Una pantalla sin movimientos contabilizados mostrará un estado vacío. Esto significa que todavía no hay datos aplicables al filtro; no se debe interpretar como ventas, deuda o utilidad iguales a cero.

## 4. Preparar catálogo y períodos · Administrador

En `/catalogo`, revisar código, nombre, jerarquía, naturaleza, rubro y vigencia. Las cuentas agrupadoras organizan el catálogo; los asientos utilizan cuentas activas de movimiento. Una cuenta correctora legítima se trata según su función; no se cambia su naturaleza solo porque difiera de otra cuenta del mismo grupo.

Antes de publicar el catálogo inicial se debe atender la incidencia de las 20 filas de gastos con naturaleza acreedora detectada en el archivo fuente. El sistema conservará el dato original y la versión corregida con su motivo. La corrección del catálogo no equivale a cambiar arbitrariamente los importes del diario. Véase [reglas contables](../negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md).

En `/periodos`, crear o seleccionar el año y mes correspondiente. Un período pertenece a una empresa y tiene estado abierto o cerrado. No se utiliza otro mes para evitar el bloqueo de un período; el administrador resolverá el cierre o la reapertura conforme al procedimiento autorizado.

## 5. Cargar y revisar un archivo · Analista

1. Abrir `/importaciones` y seleccionar el archivo XLSX o CSV admitido por la plantilla entregada.
2. Confirmar la empresa, procedencia y mapeo solicitado. Los formatos, columnas y límites se mostrarán junto a la carga.
3. Iniciar la carga. El lote conservará el original y su identificación, y pasará por recepción y validación.
4. Abrir `/importaciones/[id]` y revisar número de asientos, líneas, debe, haber, períodos y errores.
5. Abrir el detalle de cada incidencia. El mensaje debe indicar hoja, fila, columna o asiento cuando pueda localizarse.
6. Corregir la causa. Si cambia el archivo, cargar una nueva versión vinculada al lote anterior; el original conserva su historia.
7. Cuando el lote esté listo, revisar nuevamente el resumen y confirmar.

**Confirmar crea borradores.** La aprobación contable posterior es la que permite que sus movimientos afecten los estados.

No se deben borrar filas con errores para hacer que una carga termine sin revisar qué información se está excluyendo. Si el sistema rechaza el lote completo, no debe quedar una parte de sus asientos confirmada. Si informa duplicado, abrir la operación existente y comparar su origen antes de intentar otra importación.

En el libro ampliado, una carga completa de `DIARIO` bajo el catálogo revisado debe producir **477 asientos y 1,613 líneas**, con **US$2,161,744.81** por lado. Las hojas de estados y pronósticos sirven de referencia y no se cargan como nuevos asientos. Estas son expectativas derivadas de la revisión del archivo, aún pendientes de comprobar dentro de la aplicación.

## 6. Preparar, aprobar y corregir asientos

El analista abrirá `/diario` para filtrar por período y estado. En `/diario/nuevo` podrá preparar un asiento manual con fecha, descripción y líneas; seleccionará cuentas de movimiento y colocará cada importe en debe o haber según corresponda. Los campos incompletos o las diferencias se señalarán antes de continuar el flujo requerido por el contrato.

El estado de trabajo será `borrador → validado → contabilizado`. **Guardar borrador** permite conservar una diferencia entre debe y haber si hay fecha, cuentas y al menos dos líneas válidas; la diferencia queda visible y todavía no tiene efecto financiero. **Validar** exige que el asiento cuadre. Modificar uno validado exige validarlo nuevamente. En `/diario/[id]`, el usuario podrá revisar totales, estado, origen y modificaciones permitidas.

Para aprobar, el administrador con permiso revisará los asientos y ejecutará la aprobación. La operación vuelve a validar el conjunto dentro de la transacción; puede completar esa validación al aprobar borradores, sin omitir sus reglas. Si el período se cerró, cambió la versión o apareció una incidencia, el sistema debe rechazar la operación y explicar la causa. La aprobación no permite ignorar un descuadre.

Si un borrador se abandona, el usuario con permiso de preparación podrá elegir **Descartar**, escribir un motivo y confirmar la versión revisada. La marca conserva contenido e historial y lo excluye de pendientes para cierre; el filtro de descartados permite consultarlo. No podrá volver a editarse ni aprobarse. Un asiento contabilizado se corrige mediante reversión, no mediante descarte.

Un asiento contabilizado conserva su contenido. Para corregirlo se empleará la reversión autorizada: se indicará motivo y período permitido, se revisará la contrapartida y se confirmará la operación. El diario mostrará el original y el asiento opuesto vinculados. No debe desaparecer el original ni modificarse su fecha para ocultar el cambio.

## 7. Consultar estados e interpretar indicadores

En `/estados` se seleccionará el período y la vista. Las consultas disponibles serán:

| Pantalla | Qué revisar |
| --- | --- |
| `/estados/comprobacion` | Débitos, créditos y saldos por cuenta; igualdad y origen |
| `/estados/resultados` | Ingresos, costos, gastos y resultado del intervalo |
| `/estados/balance` | Activos, pasivos y patrimonio a la fecha de corte |
| `/estados/patrimonio` | Patrimonio inicial, aportes, resultado, retiros y patrimonio final |

Un subtotal debe permitir abrir sus cuentas y movimientos de origen. Para explicar una diferencia, revisar primero intervalo, corte, estado de los asientos y revisión de datos antes de comparar pantallas.

En el libro ampliado, las ventas de **enero de 2026** son **US$20,441.40** para ese mes. El valor **US$474,901.20** corresponde al acumulado desde 2024 y no se debe interpretar como venta mensual. El corte de octubre de 2026 incluye movimientos simulados del día 28 y, respecto del 19 de octubre de esta documentación, debe mostrarse como cierre simulado. Referencia: `ESTADO_RESULTADOS!C26`, `RESUMEN_MENSUAL!D26` y fechas de `DIARIO`.

En `/analisis/indicadores`, abrir el detalle para revisar valor, unidad, fórmula, operandos, período y supuestos. En el fixture mensual pequeño, una razón corriente de **2.90 veces** relaciona activos corrientes con pasivos corrientes; la prueba ácida es **2.20 veces** y el capital de trabajo **US$7,600.00**. Son cifras de ese caso didáctico, no metas universales para cualquier empresa.

Un indicador no calculable debe explicar si falta una entrada, el denominador es cero o la base no es compatible. No reemplazar mentalmente ese resultado por cero. En Alfa, algunos indicadores utilizan saldos finales como aproximación de promedios; sus referencias sectoriales y el impuesto del 40% pertenecen al ejercicio académico. Para comparaciones temporales en `/analisis/comparativo`, elegir períodos de duración compatible y revisar si se presenta variación absoluta, porcentual o estructura vertical.

## 8. Elaborar y aprobar presupuestos

El analista abrirá `/presupuestos`, creará un plan para un ejercicio e introducirá líneas mensuales por rubro. Se distinguirán ventas de cobros y costos/gastos de pagos. El presupuesto de efectivo utilizará entradas y salidas de caja, no únicamente el resultado contable.

Después de revisar totales y faltantes en `/presupuestos/[id]`, enviará la versión a revisión. Gerencia podrá aprobar o rechazar con motivo. Una versión aprobada conservará sus valores; un cambio posterior generará otra versión relacionada.

En `/presupuestos/[id]/comparativo`, seleccionar el plan y los meses observados. Una diferencia positiva puede ser favorable en ingresos y desfavorable en gastos, según la regla del rubro. Si el plan es cero, revisar la diferencia absoluta y la explicación del porcentaje no calculable.

## 9. Preparar escenarios y consultar proyecciones

En `/escenarios`, el analista elegirá serie mensual, método, parámetros y horizonte. En `/escenarios/[id]` revisará el promedio móvil de tres meses o crecimiento explícito, la cobertura disponible y los meses reservados para evaluación cuando existan. La comparación en `/escenarios/comparar` conservará esos supuestos a la vista.

Una sensibilidad de ventas y costos puede mostrar un resultado preliminar sin constituir todavía un balance proyectado. Para proyectar 2027 desde octubre de 2026, el sistema solicitará o identificará estimaciones de noviembre y diciembre y los demás datos necesarios de cobros, pagos, inventario, inversión, deuda y patrimonio.

Después de una ejecución integrada válida, `/proyecciones` mostrará su registro y permitirá abrir resultados, balance y patrimonio. Revisar fecha de apertura, puente, horizonte, versión del escenario y conciliación de cada mes. Si faltan movimientos, completar la entrada indicada; no introducir una cifra de ajuste sin causa económica para forzar el balance.

## 10. Emitir reportes y administrar cierres

En `/reportes`, elegir una ejecución y solicitar PDF o XLSX. Cuando el reporte esté listo, abrir `/reportes/[id]` y descargarlo. Comprobar empresa, período, moneda, origen y versión en el archivo; sus cifras deben coincidir con la ejecución seleccionada. Un reporte fallido requiere revisar el motivo o reintentar la generación de esa operación, sin sustituir sus datos por otra revisión sin avisar.

El administrador realizará el cierre desde `/periodos/[id]/cierre` después de revisar conciliaciones e incidencias. Al cerrar, el período bloqueará nuevas mutaciones y conservará su revisión. Este cierre no genera automáticamente asientos de cierre anual.

Para reabrir, se requerirán permiso y motivo. La reapertura creará una revisión nueva y conservará el cierre y las emisiones anteriores. Los reportes ya emitidos seguirán describiendo su revisión original; si se necesitan resultados actualizados, se calculará y emitirá otra versión.

## 11. Mensajes y acciones esperadas

| Situación | Qué significa | Qué hacer |
| --- | --- | --- |
| Sesión vencida | Se necesita comprobar de nuevo la identidad | Volver a entrar y consultar el estado de la operación |
| Permiso insuficiente | El perfil no autoriza esa acción | Revisar la responsabilidad y solicitar al administrador la asignación que corresponda |
| Período cerrado | La fecha seleccionada no admite cambios | Consultar el cierre; usar el proceso autorizado de reapertura cuando proceda |
| Asiento desbalanceado | Debe y haber no coinciden | Abrir líneas y corregir el origen de la diferencia |
| Cuenta no admitida | La cuenta es inexistente, agrupadora, inactiva o ajena | Revisar código y catálogo publicado |
| Duplicado | Existe una operación o asiento con el mismo origen | Abrir el registro existente antes de crear otro |
| Versión desactualizada | Otro cambio ocurrió desde que se abrió el formulario | Actualizar, revisar la diferencia y volver a aplicar el cambio necesario |
| Datos insuficientes | Falta una entrada para el resultado solicitado | Completar el dato indicado o conservar la salida parcial identificada |
| Archivo o reporte fallido | La recepción o generación no terminó | Consultar el detalle y conservar el identificador para seguimiento |

Al reportar una incidencia, indicar pantalla, empresa, período, identificador del recurso, acción y mensaje. No incluir contraseñas ni tokens. El equipo de soporte registrará resultado y corrección en el [documento 20](20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md).

## 12. Guion previsto de demostración

La demostración utilizará una versión de código identificada y datos de prueba separados. FT-02 es un fixture didáctico derivado del ejemplo mensual; no se suma al libro ampliado FT-01. La preparación técnica se hará antes de presentar el recorrido y se documentará, sin depender de ajustes manuales ocultos.

| Paso | Perfil | Acción y resultado esperado |
| --- | --- | --- |
| 1 | Administrador | Mostrar catálogo, período abierto y matriz de perfiles |
| 2 | Analista | Cargar FT-02 preparado; revisar 10 asientos, 26 líneas y US$52,700.00 por lado |
| 3 | Analista | Mostrar una variante incorrecta en otro lote y explicar su error sin contabilizarla |
| 4 | Analista | Confirmar el lote válido, mostrar los borradores y ejecutar su validación como parte de la demostración |
| 5 | Administrador | Aprobar los asientos válidos y revisar la auditoría |
| 6 | Analista | Abrir resultados: ventas 12,000.00, costo 7,200.00, gastos pagados 2,700.00 y depreciación 300.00; resultado antes de impuestos 1,800.00 |
| 7 | Gerencia | Abrir balance: activos 20,300.00 = pasivos 9,000.00 + patrimonio 11,300.00; efectivo 7,800.00 |
| 8 | Gerencia | Mostrar razones 2.90 y 2.20, capital de trabajo 7,600.00 y detalle de fórmula |
| 9 | Analista y gerencia | Preparar y aprobar presupuesto en sus respectivos perfiles; comparar una versión identificada |
| 10 | Analista | Mostrar sensibilidad base/favorable/adversa con resultados antes de impuestos 1,800.00 / 2,280.00 / 780.00 |
| 11 | Gerencia | Abrir una proyección integrada conciliada y descargar reporte de esa ejecución |
| 12 | Administrador | Cerrar, comprobar rechazo de edición y mostrar reapertura con motivo y revisión nueva |

El recorrido termina en el paso 8 cuando se presenta el primer MVP de fase 03. Los pasos 9–12 se muestran cuando estén implementadas y verificadas las fases 04 y 05. El caso Alfa puede añadirse como demostración del motor con sus supuestos; no requiere fabricar movimientos contables.

Los conteos y cifras del guion son expectativas definidas en [FT-02 y FT-05 del plan de pruebas](18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md). La validación del recorrido corresponde a **PR-40**, apoyada por las pruebas financieras, de permisos y de exportación que procedan. Actualmente no hay una ejecución de la aplicación que permita marcarlas como aprobadas.

## 13. Actualización del manual al entregar software

Al preparar una versión candidata, el equipo verificará nombres de acciones, campos obligatorios, mensajes y rutas; incorporará capturas obtenidas de esa versión; y anotará qué pasos están disponibles. Cada limitación funcional deberá coincidir con la [matriz de trazabilidad](19_TRAZABILIDAD_Y_ENTREGABLES.md) y el [registro de validación](20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md).

La entrega del presente manual completa la especificación documental del recorrido. La disponibilidad y verificación de cada función se determinarán mediante su implementación y la evidencia asociada.

## 14. Fuentes

- `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`: hojas `LEEME`, `CATALOGO`, `DIARIO`, `ESTADO_RESULTADOS` y `RESUMEN_MENSUAL`.
- `Carlitos_Reporte_Mejorado.docx`: ejemplo mensual de sección 9 y escenarios; los asientos FT-02 son una construcción de prueba derivada y documentada en 18.
- `Caso Analisis Financiero Manufacturas Alfa_2025(2).docx`: estados, política y referencias ficticias del ejercicio.
- [Reglas contables y financieras](../negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md), [pantallas previstas](../tecnico/09_PANTALLAS_Y_ATOMIC_DESIGN.md) y [plan de pruebas](18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md).
