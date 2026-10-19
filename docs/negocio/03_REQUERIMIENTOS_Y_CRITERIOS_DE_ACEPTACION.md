# 03 · Requerimientos y criterios de aceptación

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.  
**Estado de los requisitos:** especificados. **Estado de implementación y pruebas:** pendiente.

## 1 Uso y prioridades

Este documento define **24 requisitos funcionales y 8 no funcionales**. Cada criterio describe un comportamiento observable que deberá probarse. Escribir la especificación, una pantalla o una prueba no equivale a haberla ejecutado satisfactoriamente.

La prioridad **P0** identifica la base necesaria para el primer recorrido histórico y sus controles. **P1** identifica funciones comprometidas en las fases posteriores del alcance completo; no significa que sean ideas opcionales. Las ampliaciones fuera de este alcance permanecen en [01 Visión](01_VISION_Y_ALCANCE.md).

Los identificadores `RF`, `RNF`, `RCF` y `CU` son estables. Las reglas se definen en [04 Reglas contables y financieras](04_REGLAS_CONTABLES_Y_FINANCIERAS.md); los contratos, en [10 Casos de uso](../tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md). El plan de prueba y la matriz de cobertura se mantienen en [18 Pruebas](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md) y [19 Trazabilidad](../validacion_y_entrega/19_TRAZABILIDAD_Y_ENTREGABLES.md).

## 2 Requisitos funcionales

### RF-01 · Acceso y membresía activa de empresa

**Módulo:** 1. **Prioridad:** P0. **Fase:** 01. **Contrato:** CU-01. **Regla:** RCF-01.

Como usuario habilitado, quiero iniciar sesión y trabajar dentro de la empresa autorizada. La entrada es una identidad validada y su membresía; la salida es un contexto con empresa, usuario y permisos.

- Con identidad válida y membresía activa, el usuario accede a los datos de su empresa.
- Sin sesión válida, la pantalla privada pide acceso y una mutación no produce cambios.
- Con membresía inactiva o inexistente, se deniega el acceso aunque el usuario conozca una URL o identificador válido.
- La selección de empresa de la interfaz no sustituye la comprobación de membresía en el servidor.

### RF-02 · Usuarios, roles y permisos administrados

**Módulo:** 1. **Prioridad:** P0. **Fase:** 01. **Contrato:** CU-02. **Regla:** RCF-01.

Como administrador, quiero gestionar usuarios y membresías sin compartir contraseñas ni conceder permisos accidentalmente. La entrada es una operación autorizada sobre el perfil/membresía; la salida es el acceso actualizado y su auditoría.

- Solo `usuarios.gestionar` permite altas o cambios de acceso; un analista no puede otorgarse permisos.
- Se aplican por separado `asientos.aprobar`, `asientos.revertir` y `presupuestos.aprobar` conforme a la matriz del documento 02.
- Desactivar una membresía impide la siguiente operación protegida que compruebe su estado actualizado.
- El registro conserva actor, entidad afectada y cambio, sin almacenar contraseñas, tokens ni claves administrativas.

### RF-03 · Catálogo de cuentas publicado y clasificación

**Módulo:** 2. **Prioridad:** P0. **Fase:** 01. **Contrato:** CU-03. **Reglas:** RCF-02, RCF-08.

Como administrador, quiero publicar cuentas con clasificación suficiente para registrar y presentar estados. La entrada incluye código, nombre, jerarquía, clase, naturaleza, rubro, vigencia y condición de movimiento.

- Los códigos se conservan como texto y no se repiten dentro de una empresa.
- Se rechazan ciclos de jerarquía, cuentas padre ajenas y clasificaciones incompletas para cuentas de movimiento.
- Una cuenta de agrupación, inactiva o fuera de vigencia no permite aprobar registros.
- El catálogo inicial requiere resolver las veinte filas de gastos con naturaleza acreedora, conservando la fuente y el criterio aplicado; no se cambia automáticamente toda cuenta acreedora de gasto que pudiera ser correctora legítima. [F3]
- Cambiar una clasificación usada genera nueva revisión y mantiene reproducibles los resultados emitidos.

### RF-04 · Períodos y contexto de consulta

**Módulo:** 2. **Prioridad:** P0. **Fase:** 01. **Contrato:** CU-04. **Reglas:** RCF-04, RCF-06.

Como usuario, quiero identificar claramente el período de registro y la base temporal de una consulta. La entrada es empresa, fechas y modalidad temporal; la salida es un contexto válido.

- Existe un único período por empresa, año y mes, con límites de fecha coherentes.
- La fecha contable pertenece al período del asiento y no cambia por la zona horaria de visualización.
- La interfaz distingue movimiento del mes, acumulado del ejercicio y saldo al corte.
- Todo intento de escritura sobre período cerrado se rechaza en persistencia, incluso por solicitud directa.

### RF-05 · Carga de XLSX/CSV con procedencia

**Módulo:** 3. **Prioridad:** P0. **Fase:** 02. **Contrato:** CU-05. **Reglas:** RCF-01, RCF-04, RCF-07.

Como analista, quiero cargar un formato admitido y conservar su origen. La entrada es archivo, empresa autorizada y versión de formato; la salida es un lote identificado.

- El original se conserva de forma privada e inmutable con hash, nombre informativo, actor y fecha.
- El sistema verifica formato y límites antes de procesar; no acepta archivos solo por la extensión declarada.
- Se conservan hoja, fila y contenido original de cada registro extraído.
- El adaptador Carlitos toma catálogo y diario; no convierte hojas de resultados, presupuesto o pronóstico en movimientos adicionales.

### RF-06 · Validación y vista previa por fila/asiento

**Módulo:** 3. **Prioridad:** P0. **Fase:** 02. **Contrato:** CU-06. **Reglas:** RCF-02 a RCF-04, RCF-07, RCF-17.

Como analista, quiero localizar y corregir problemas antes de confirmar. La salida incluye cantidad de filas/asientos, totales, errores y versión validada.

- Cada error identifica hoja/fila, campo, código y mensaje comprensible.
- Se detectan cuentas desconocidas o no publicadas, fechas inválidas, importes no admitidos, líneas de ambos lados positivos y asientos desbalanceados.
- Un lote con errores bloqueantes conserva todas sus filas y no permite confirmación parcial.
- Revalidar mantiene procedencia y crea una versión; sustituir el archivo crea un lote vinculado, sin sobrescribir el anterior.

### RF-07 · Confirmación atómica e idempotente a borradores

**Módulo:** 3. **Prioridad:** P0. **Fase:** 02. **Contrato:** CU-07. **Reglas:** RCF-01, RCF-03 a RCF-08.

Como analista autorizado, quiero confirmar una versión lista sin duplicar ni perder registros. La entrada es lote, versión esperada y clave de idempotencia; la salida es la operación y sus borradores.

- El sistema vuelve a validar permisos, cuentas, períodos y sumas en la transacción de confirmación.
- Un fallo deja cero asientos nuevos del lote; el estado no informa éxito si hubo rollback.
- Misma clave y mismo contenido devuelven la misma operación; misma clave con contenido distinto produce conflicto 409.
- Se detectan identificadores normalizados repetidos aunque cambien nombre o empaquetado del archivo.
- Confirmar deja los asientos como borradores; los estados financieros permanecen sin cambios hasta aprobación.

### RF-08 · Preparación y edición de borrador manual

**Módulo:** 3. **Prioridad:** P0. **Fase:** 02. **Contrato:** CU-08. **Reglas:** RCF-02 a RCF-07.

Como analista, quiero preparar un asiento con fecha, concepto y líneas, mostrando su diferencia antes de aprobarlo.

- Cabecera y líneas se guardan conjuntamente y se vinculan a la misma empresa y período.
- Guardar admite un borrador desbalanceado con fecha, cuentas y al menos dos líneas válidas; devuelve la diferencia y no le da efecto contable.
- Se muestran debe, haber y diferencia; el estado `validado` exige todos los controles contables aplicables.
- Editar un asiento validado lo devuelve a borrador y obliga a una nueva validación.
- Una versión obsoleta produce conflicto y no pisa cambios de otro usuario.
- Un asiento contabilizado no puede editarse con este caso de uso.
- Descartar un borrador o validado exige permiso, versión y motivo; conserva líneas/origen/identificadores y actor/fecha, deja de admitir edición o aprobación y deja de bloquear cierre por estar pendiente. Un contabilizado exige reversión, no descarte.

### RF-09 · Aprobación y reversión autorizadas de asientos

**Módulo:** 3. **Prioridad:** P0. **Fase:** 02. **Contratos:** CU-09, CU-10. **Reglas:** RCF-03, RCF-05, RCF-06.

Como administrador autorizado, quiero dar efecto contable a registros válidos y corregirlos mediante una reversión trazable.

- Aprobar exige permiso, período abierto, cuentas válidas y cuadratura; se registra aprobador y versión.
- El conjunto solicitado se aprueba completamente o se rechaza completamente.
- Revertir exige permiso específico y motivo, genera líneas opuestas y vincula original/reversión.
- Original y reversión permanecen incluidos en el diario; no se elimina el original de las sumas.
- Una reversión repetida de la misma operación recupera el resultado existente y no crea una segunda contrapartida accidental.

### RF-10 · Consulta del diario y detalle con origen

**Módulo:** 3. **Prioridad:** P0. **Fase:** 02. **Contrato:** CU-11. **Reglas:** RCF-01, RCF-04, RCF-05, RCF-08.

Como usuario autorizado, quiero filtrar y abrir registros para explicar una cifra.

- El diario filtra por período, estado, cuenta y origen sin acceder a datos de otra empresa.
- El detalle muestra líneas, debe/haber, autor, aprobación y vínculos de reversión.
- Un registro importado permite identificar lote, hoja, fila y archivo de origen autorizado.
- Borradores y contabilizados se distinguen; un total financiero deja explícito que solo incluye los contabilizados.
- La paginación mantiene orden determinista y no modifica el total del conjunto consultado.

### RF-11 · Balance de comprobación

**Módulo:** 4. **Prioridad:** P0. **Fase:** 03. **Contrato:** CU-12. **Reglas:** RCF-02 a RCF-08.

Como analista, quiero revisar saldos y movimientos antes de interpretar estados.

- Por cuenta se muestran saldo inicial, débitos, créditos y saldo final del intervalo.
- La suma de débitos coincide exactamente con la de créditos del universo contabilizado.
- La ecuación de cada cuenta concilia saldo inicial y movimientos con su saldo final.
- El cambio de corte modifica el universo de movimientos y conserva su origen y revisión.

### RF-12 · Tres estados históricos conciliados

**Módulo:** 4. **Prioridad:** P0. **Fase:** 03. **Contrato:** CU-12. **Reglas:** RCF-08 a RCF-11.

Como usuario, quiero consultar resultados, situación financiera y cambios en patrimonio desde una misma base.

- Resultados aplica ingresos menos costos/gastos del intervalo, sin sumar acumulados mensuales repetidos.
- Situación financiera cumple activo igual a pasivo más patrimonio, sin cuenta artificial de ajuste.
- Patrimonio concilia saldo inicial, aportes, resultado, retiros y ajustes explícitos.
- Con el diario Carlitos completo, el corte 2025 obtiene resultado 85,518.83, activos 225,705.73, pasivos 33,672.28 y patrimonio 192,033.45. [F3]
- El fixture pequeño identifica 1,800.00 como resultado antes de impuestos; no lo rotula como utilidad neta. [F2]

### RF-13 · Indicadores explicables y no calculables

**Módulo:** 8. **Prioridad:** P0. **Fase:** 03. **Contrato:** CU-13. **Reglas:** RCF-12 a RCF-15, RCF-17.

Como usuario, quiero entender cada indicador y su calidad.

- Cada resultado contiene valor o ausencia, unidad, fórmula versionada, operandos, período y procedencia.
- Un denominador cero produce `no_calculable`; un dato faltante produce `datos_insuficientes`, sin sustituirlos por cero.
- El uso de cierre como aproximación de promedio aparece en advertencias y política.
- Alfa obtiene razón corriente 1.85, margen neto 7.00% y ROE con patrimonio de cierre 24.00% bajo sus supuestos. [F4]
- El cambio de base 365 a 360 solo afecta razones que dependen de días.

### RF-14 · Análisis horizontal y vertical comparable

**Módulo:** 8. **Prioridad:** P0. **Fase:** 03. **Contrato:** CU-13. **Reglas:** RCF-04, RCF-16, RCF-17.

Como analista, quiero comparar cifras con bases compatibles y conocer las diferencias de cobertura.

- Horizontal muestra variación absoluta y porcentaje con su base anterior.
- Si la base anterior es cero, conserva la variación absoluta y explica la ausencia del porcentaje.
- Enero–octubre no se presenta como equivalente a un ejercicio completo sin una advertencia y decisión explícita de comparación.
- Vertical identifica denominador y rubros: ventas para resultados, activos para presentación de balance.
- Alfa, que no aporta un período anterior, muestra análisis horizontal insuficiente en vez de inventar datos. [F4]

### RF-15 · Dashboard con corte, origen y calidad

**Módulo:** 8. **Prioridad:** P0. **Fase:** 03. **Contratos:** CU-12, CU-13. **Reglas:** RCF-04, RCF-08, RCF-17.

Como gerencia, quiero un resumen que conserve el contexto de sus cifras.

- Cada tarjeta y gráfico deriva de la misma revisión y selección temporal del dashboard.
- Corte, moneda y origen simulado son visibles y se conservan al abrir un detalle.
- Se diferencian ausencia de movimientos, cálculo no disponible y error técnico.
- Una alerta de conciliación o calidad no desaparece al resumir el indicador.
- Las cifras de un gráfico se redondean para dibujar; sus valores visuales no se reutilizan como entrada financiera.

### RF-16 · Presupuestos mensuales por rubro y efectivo

**Módulo:** 5. **Prioridad:** P1. **Fase:** 04. **Contrato:** CU-14. **Reglas:** RCF-07, RCF-18.

Como analista, quiero preparar un plan mensual comparable con la ejecución.

- Cada línea identifica ejercicio, mes, rubro/cuenta, concepto, moneda e importe.
- Se diferencian ingresos/gastos devengados y entradas/salidas de efectivo.
- Los totales anuales se obtienen de meses individuales sin duplicar acumulados.
- El presupuesto de efectivo explica saldo inicial, cobros, pagos y saldo final.
- Una cuenta o rubro ajeno al contexto autorizado se rechaza.

### RF-17 · Versiones y aprobación de presupuesto

**Módulo:** 5. **Prioridad:** P1. **Fase:** 04. **Contratos:** CU-14, CU-15. **Reglas:** RCF-08, RCF-18.

Como gerencia, quiero aprobar una versión concreta y conservarla para comparación.

- Se aplican estados `borrador`, `en_revision`, `aprobado` y `rechazado`.
- Solo el permiso de aprobación de presupuestos autoriza la decisión; aprobar asientos no lo sustituye.
- La versión aprobada conserva líneas, supuestos, actor y fecha sin edición posterior.
- Cambiar un presupuesto aprobado o preparar una corrección al rechazado crea otra versión vinculada.
- Una decisión sobre una versión obsoleta produce conflicto.

### RF-18 · Comparativo real frente a presupuesto

**Módulo:** 5. **Prioridad:** P1. **Fase:** 04. **Contrato:** CU-16. **Reglas:** RCF-04, RCF-17, RCF-18.

Como gerencia, quiero identificar desviaciones sobre un plan específico.

- El comparativo identifica versión del presupuesto, revisión histórica, período y rubros comparables.
- Calcula real menos presupuesto y explica el signo favorable según el rubro.
- Presupuesto cero permite diferencia absoluta y devuelve porcentaje no calculable.
- No compara un saldo bancario al corte con un flujo mensual sin transformación explícita.
- Los meses estimados y los contabilizados mantienen etiquetas distintas.

### RF-19 · Métodos de pronóstico y escenarios versionados

**Módulo:** 6. **Prioridad:** P1. **Fase:** 04. **Contrato:** CU-17. **Reglas:** RCF-04, RCF-17, RCF-19.

Como analista, quiero ensayar un método determinista y comparar supuestos.

- Promedio móvil de tres meses y crecimiento explícito identifican serie, ventana, horizonte y parámetros.
- La serie mensual de enero de 2026 usa 20,441.40 de ventas, no 474,901.20 acumulados. [F3]
- Cada cambio de supuestos crea una versión y las ejecuciones conservan sus entradas.
- La evaluación separa meses de entrenamiento y comprobación temporal, con MAE y cobertura de datos.
- Una sensibilidad parcial se rotula como tal; los escenarios no reciben probabilidades inventadas.

### RF-20 · Movimientos y tres estados proyectados conciliados

**Módulo:** 7. **Prioridad:** P1. **Fase:** 05. **Contrato:** CU-18. **Reglas:** RCF-07 a RCF-11, RCF-20.

Como gerencia, quiero conocer resultados, situación y patrimonio futuros bajo supuestos trazables.

- La ejecución parte de un cierre conciliado y guarda calendario de cobros, pagos, inventario, inversión, deuda, aportes y retiros aplicable.
- Proyectar 2027 desde octubre de 2026 exige puente explícito de noviembre y diciembre, con condición estimada visible.
- Los movimientos futuros se guardan separados del diario histórico.
- Cada mes cumple partida doble, ecuación patrimonial y conciliación de efectivo y patrimonio.
- Un faltante o desbalance impide publicar los tres estados como proyección completa; no se crea una cuenta para absorber diferencias.

### RF-21 · Reportes PDF/XLSX autorizados y reproducibles

**Módulo:** 8. **Prioridad:** P1. **Fase:** 05. **Contratos:** CU-19, CU-20. **Reglas:** RCF-01, RCF-07, RCF-08.

Como usuario autorizado, quiero descargar exactamente la versión consultada.

- El reporte identifica empresa, origen, período/corte, moneda, revisión, política y advertencias.
- Pantalla, PDF y XLSX utilizan la misma ejecución y coinciden en totales y escala presentada.
- Solo un reporte `listo` es descargable, tras comprobar acceso actualizado.
- Un usuario de otra empresa no puede descargarlo conociendo su identificador o ruta de almacenamiento.
- Una nueva ejecución crea otra versión y conserva archivos emitidos previamente.

### RF-22 · Cierre y reapertura con motivo y snapshot

**Módulo:** 2, transversal. **Prioridad:** P1 para el flujo completo; bloqueo P0. **Fase:** 05, con rechazo a cerrado desde 01/02. **Contratos:** CU-21, CU-22. **Reglas:** RCF-05, RCF-06, RCF-08.

Como administrador autorizado, quiero conservar un corte y controlar su modificación posterior.

- Cerrar verifica conciliación e incidencias bloqueantes, guarda snapshot, motivo, actor y revisión.
- Cierre y escrituras compiten por el mismo bloqueo de período; ninguna operación puede aprobar después de un cierre ya confirmado.
- Reabrir exige permiso distinto y motivo, conserva la evidencia del cierre anterior y crea revisión.
- Los reportes de la revisión previa siguen disponibles y no se sobrescriben.
- El cierre inicial no genera asientos anuales automáticos ni duplica la utilidad en patrimonio.

### RF-23 · Auditoría de operaciones relevantes

**Módulo:** transversal. **Prioridad:** P0. **Fase:** todas desde 01. **Contrato:** CU-23 y mutaciones asociadas. **Reglas:** RCF-01, RCF-05, RCF-06, RCF-08.

Como administrador, quiero reconstruir quién realizó cada cambio relevante.

- Accesos administrados, publicación de catálogo, confirmaciones, aprobaciones, reversiones, cierres y decisiones presupuestarias registran actor, empresa, entidad y fecha.
- Una mutación financiera exitosa y su evento de auditoría se confirman en la misma transacción.
- Un fallo de escritura no produce un evento que afirme éxito financiero.
- Usuarios ordinarios no pueden editar o borrar auditoría ni consultar datos de otra empresa.
- Los motivos requeridos son no vacíos y no se almacenan secretos de sesión en el evento.

### RF-24 · Reproducción de cálculo, revisión y procedencia

**Módulos:** 4–8. **Prioridad:** P0 para histórico; P1 para extensión. **Fase:** 03–05, origen desde 02. **Contratos:** CU-12, CU-13, CU-18, CU-19. **Reglas:** RCF-01, RCF-04, RCF-07, RCF-08.

Como analista, quiero reproducir una cifra aun después de cambiar datos o políticas.

- Cada ejecución conserva entradas normalizadas, hash, revisión de datos y catálogo, política y versión de fórmulas.
- La captura de operandos es coherente; no mezcla consultas hechas antes y después de una aprobación concurrente.
- Si cambia la revisión antes de publicar, se recalcula o conserva explícitamente la ejecución anterior como tal.
- Una corrección no modifica retroactivamente resultados ya emitidos.
- La cadena de origen permite pasar de reporte a ejecución, cuentas y movimientos o fixture resumido del caso.

## 3 Requisitos no funcionales

| ID | Requisito | Criterios de aceptación | Fase |
| --- | --- | --- | --- |
| **RNF-01** | Aislamiento y autorización | Dos empresas de prueba no comparten filas, archivos ni caché de sesión; solicitudes directas con empresa ajena se deniegan; DML crítico directo no está concedido a usuarios ordinarios; cada RPC comprueba identidad y permiso | Desde 01 |
| **RNF-02** | Integridad transaccional y concurrencia | Fallo intermedio revierte cabecera, líneas y evento de éxito; reintentos no duplican; edición obsoleta produce conflicto; aprobación y cierre concurrentes quedan serializados | Desde 02 |
| **RNF-03** | Precisión monetaria y fechas | Importes viajan como strings decimales; se rechazan entradas de dinero con escala mayor a dos; operaciones monetarias concilian exactamente a centavos; la fecha contable no se desplaza por zona horaria | Desde 01/02 |
| **RNF-04** | Modularidad y mantenibilidad | Páginas y adaptadores delegan en controladores; servicios de cálculo no importan React, Next.js ni Supabase; acceso a datos queda en repositorios; rutas se definen centralmente y el tipo de base se genera desde migraciones | Todas |
| **RNF-05** | Interfaz accesible y errores útiles | Recorridos de acceso, importación y aprobación se operan con teclado; controles tienen nombre y foco visible; errores se asocian a campo/fila; color no es el único indicador; tablas incluyen encabezados y los gráficos tienen resumen numérico | Todas |
| **RNF-06** | Límites y rendimiento medido | El perfil de límites define bytes, filas/celdas, expansión de XLSX, duración y concurrencia; sobrepasarlo devuelve error controlado sin escritura parcial; se mide el archivo de 1,613 líneas y se registran equipo, límites y tiempos antes de aceptar la fase; no hay límites implícitamente infinitos | 02 y revisión en 05 |
| **RNF-07** | Entorno reproducible y recuperación | Un entorno local vacío se reconstruye con versiones fijadas, migraciones y semillas documentadas; respaldo y restauración recuperan datos, objetos y referencias con conciliación; las operaciones destructivas locales se identifican en la guía | Desde 01; recuperación 05 |
| **RNF-08** | Trazabilidad, privacidad y observabilidad | Errores técnicos incluyen correlación sin tokens ni importes innecesarios en logs; originales y reportes son privados; cada ejecución conserva revisión/origen; la limpieza de objetos mantiene trazabilidad y utiliza la API de almacenamiento | Todas |

Los límites numéricos operativos de RNF-06 deben quedar fijados en el perfil de entorno de la fase 02 después de medir el formato seleccionado. No se presenta aquí un tiempo de respuesta sin implementación, equipo ni medición. La aceptación exige que ese perfil exista y que se pruebe tanto dentro como fuera del límite antes de dar la fase por terminada.

## 4 Condiciones transversales de aceptación

Un requisito se considerará verificado cuando exista implementación identificada, un caso ejecutado con entradas conocidas, resultado observado y evidencia referenciada en el documento 20. Una aprobación documental no cambia automáticamente su estado funcional.

Para declarar completo el MVP de fase 03 deben estar verificados RF-01 a RF-15, el alcance histórico de RF-23/RF-24 y los RNF aplicables. Para la entrega completa se añaden RF-16 a RF-22 y las ampliaciones de reproducción, operación y recuperación. Cualquier excepción conservará requisito afectado, causa, impacto y decisión de aceptación; no se elimina el requisito para ocultar un defecto.

## 5 Fuentes de requisitos y cifras

- **F1:** `Carlitos_ARQUITECTURA_TECNICA_DETALLADA.docx`, módulos, roles y funciones.
- **F2:** `Carlitos_Reporte_Mejorado.docx`, secciones 3, 5–10 y ejemplo de sección 9.
- **F3:** `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`: `CATALOGO!D7,D62:D80`; `DIARIO!A1:K1614`; `ESTADO_RESULTADOS!C25:F25,C26`; `BALANCE_GENERAL!C25:F25`; `RESUMEN_MENSUAL!D26`.
- **F4:** `Caso Analisis Financiero Manufacturas Alfa_2025(2).docx`, estados y supuestos de 2025.
- Las restricciones de operación, estados e idempotencia precisan la propuesta técnica acordada y se explican en los documentos 05–12. Su estado actual es especificado, no ejecutado.

**Volver:** [Índice documental](../00_INDICE_Y_PLAN_DOCUMENTAL.md).
