# 18. Plan de pruebas y datos de referencia

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.

**Estado:** plan de verificación desarrollado. Las pruebas de la aplicación PR-01–PR-40 están pendientes de ejecución porque el sistema todavía no está implementado. Las comprobaciones ya realizadas sobre los adjuntos se registran por separado en el [documento 20](20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md).

## 1. Objetivo y criterio de éxito

Demostrar que una entrada autorizada y trazable produce movimientos íntegros, estados conciliados e indicadores reproducibles. La evaluación cubre la corrección financiera, la integridad de las transacciones, los permisos, la experiencia de usuario y la recuperación del entorno.

Los [requisitos 03](../negocio/03_REQUERIMIENTOS_Y_CRITERIOS_DE_ACEPTACION.md) fijan el comportamiento; las [reglas 04](../negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md) fijan la interpretación contable; los [contratos 10](../tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md) fijan las entradas y salidas. Este documento aporta datos independientes y procedimientos para comprobarlos. Un resultado esperado no se obtiene llamando otra vez a la misma función que se está probando.

Para importes registrados se exige igualdad exacta a centavos. Un balance debe producir diferencia `"0.00"`; una tolerancia no puede ocultar descuadres. Para razones y tasas se comparan el valor decimal bajo la política declarada y su representación redondeada. Las pruebas distinguen valor, unidad, calidad, fórmula y base temporal: acertar el número con una etiqueta equivocada también es un defecto.

## 2. Preparación de las verificaciones

Se utilizará una instancia local reconstruida mediante migraciones y semillas, con identidades ficticias para administrador, analista y gerencia. Se añadirá una segunda empresa de prueba exclusivamente para comprobar aislamiento. Una prueba no puede aprobarse por haber usado una clave administrativa que evade las restricciones del usuario ordinario.

Los fixtures financieros se mantendrán en espacios de datos separados. FT-02 no se suma al diario de FT-01; Alfa no se importa como si fueran asientos de Carlitos. Los archivos originales se conservan inmutables y las correcciones tienen versión y motivo.

| Nivel | Qué verifica | Instrumento previsto |
| --- | --- | --- |
| Servicio financiero | Fórmulas, signos, fechas, precisión, faltantes | Pruebas unitarias con entradas decimales y expectativas independientes |
| Base de datos | Constraints, RLS, permisos, RPC, rollback, bloqueos | Pruebas SQL/pgTAP y pruebas de integración con usuarios ordinarios |
| Adaptador | XLSX/CSV, procedencia, validación y límites | Archivos de referencia y variantes controladas |
| Caso de uso | Coordinación, idempotencia, versiones, resultados | Integración del controlador con Supabase local |
| Interfaz | Recorrido, filtros, foco, errores, lectura de cifras | Pruebas de navegación y revisión manual por teclado |
| Operación | Arranque reproducible, respaldo y restauración | Ejecución documentada en un entorno local limpio |

Las herramientas concretas de automatización se fijan al iniciar cada fase. El plan exige conductas verificables, sin considerar aprobada una herramienta por aparecer nombrada en un MD. Los límites de archivo y metas de tiempo deben registrarse antes de las pruebas de carga y medirse en un equipo identificado.

## 3. Fixtures financieros

### FT-01. Libro ampliado de Carlitos

**Fuente:** `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`, hojas `LEEME`, `CATALOGO`, `DIARIO`, `ESTADO_RESULTADOS` y `BALANCE_GENERAL`. La revisión del adjunto encontró 12 hojas, 79 cuentas, 477 asientos y 1,613 líneas. El diario usa 39 cuentas y todos sus registros declaran origen simulado. No contiene fórmulas Excel. [Fuente F3 del índice]

El catálogo original tiene incidencias. Para probar una importación exitosa se usará una versión revisada del catálogo, con mapeo aprobado y registro de la corrección; las filas originales con naturaleza de gasto incoherente también se usarán en una prueba de rechazo o advertencia bloqueante. No se cambiarán importes del diario para forzar una expectativa.

| Base | Ventas | Costos | Gastos | Resultado |
| --- | ---: | ---: | ---: | ---: |
| Ejercicio 2024 | 207,498.30 | 100,885.68 | 39,498.00 | 67,114.62 |
| Ejercicio 2025 | 246,961.50 | 120,072.67 | 41,370.00 | 85,518.83 |
| Enero–octubre 2026, cierre simulado | 228,853.90 | 111,268.75 | 35,905.00 | 81,680.15 |

| Corte | Activos | Pasivos | Patrimonio | Diferencia |
| --- | ---: | ---: | ---: | ---: |
| Diciembre 2024 | 133,711.54 | 22,996.92 | 110,714.62 | 0.00 |
| Diciembre 2025 | 225,705.73 | 33,672.28 | 192,033.45 | 0.00 |
| Octubre 2026 simulado | 313,879.32 | 43,665.72 | 270,213.60 | 0.00 |

El debe y el haber del diario completo deben sumar **2,161,744.81 cada uno**. Los tres resultados anteriores corresponden a flujos del ejercicio; los tres balances corresponden a saldos al corte. Las coordenadas de comparación son `ESTADO_RESULTADOS!C13:F13`, `C25:F25`, `C35:F35` y `BALANCE_GENERAL!C13:F13`, `C25:F25`, `C35:F35`. La revisión previa contrastó los 34 cortes, no solo los tres mostrados.

La regresión temporal clave es enero de 2026: ventas del mes **20,441.40**, frente a **474,901.20** acumulado desde 2024. La segunda cifra no es una venta mensual. Octubre de 2026 contiene registros del día 28 y, respecto de la fecha de esta documentación, debe identificarse como cierre simulado.

El patrimonio se reconstruye desde el diario, sin copiar los componentes inconsistentes de `CAMBIOS_PATRIMONIO`. La apertura acredita capital de **40,800.00** en `DIARIO!I15`; la hoja de patrimonio muestra **46,800.00**. El registro 20 documenta las diferencias y su tratamiento.

### FT-02. Mes pequeño conciliado

**Fuente:** `Carlitos_Reporte_Mejorado.docx`, sección 9 y tablas de resultados, balance y conciliación. Es un caso didáctico separado del libro ampliado. Para convertirlo en fixture se utilizan nombres de cuentas simbólicos y un mes ficticio explícito; el código definitivo del catálogo se asignará al implementar.

La apertura supone efectivo 8,000; inventarios 3,000; equipo neto 9,000; proveedores 4,000; préstamo 6,000; patrimonio 10,000. Para este fixture se representa el equipo inicial con costo 9,000 y depreciación acumulada inicial cero; esta descomposición es una convención de prueba, no un dato adicional del negocio.

| Movimiento de prueba | Debe | Haber |
| --- | --- | --- |
| Apertura | Efectivo 8,000; inventario 3,000; equipo 9,000 | Proveedores 4,000; préstamo 6,000; capital 10,000 |
| Venta del mes | Efectivo 10,000; clientes 2,000 | Ventas 12,000 |
| Cobro de clientes | Efectivo 1,000 | Clientes 1,000 |
| Incorporación de inventario | Inventario 7,000 | Efectivo 6,000; proveedores 1,000 |
| Reconocimiento de costo vendido | Costo de ventas 7,200 | Inventario 7,200 |
| Gastos pagados | Gastos operativos 2,700 | Efectivo 2,700 |
| Depreciación administrativa | Gasto depreciación 300 | Depreciación acumulada 300 |
| Pago a proveedores | Proveedores 1,000 | Efectivo 1,000 |
| Amortización de préstamo | Préstamo 1,000 | Efectivo 1,000 |
| Retiro del propietario | Retiros patrimoniales 500 | Efectivo 500 |

El fixture así definido contiene 10 asientos, 26 líneas y totales de debe y haber de **52,700.00**. Es una construcción de prueba derivada del ejemplo, todavía no una semilla SQL ejecutada. El préstamo restante se clasifica a largo plazo para reproducir los indicadores del ejercicio; en datos operativos se utilizarían sus vencimientos.

| Resultado esperado | Valor |
| --- | ---: |
| Ventas / costo de ventas / utilidad bruta | 12,000.00 / 7,200.00 / 4,800.00 |
| Gastos pagados / depreciación | 2,700.00 / 300.00 |
| Resultado antes de impuestos | 1,800.00 |
| Efectivo / clientes / inventarios finales | 7,800.00 / 1,000.00 / 2,800.00 |
| Activos corrientes / equipo neto | 11,600.00 / 8,700.00 |
| Activos / pasivos / patrimonio | 20,300.00 / 9,000.00 / 11,300.00 |
| Pasivos corrientes | 4,000.00 |
| Razón corriente / prueba ácida | 2.90 / 2.20 veces |
| Capital de trabajo | 7,600.00 |
| Endeudamiento / margen bruto | 44.33% / 40.00% |
| Margen antes de impuestos | 15.00% |

Se comprobarán dos puentes de manera independiente: patrimonio `10,000 + 1,800 − 500 = 11,300`; efectivo `8,000 + 1,300 − 1,000 − 500 = 7,800`. El flujo operativo de 1,300 es una conciliación auxiliar del fixture, sin ampliar por ello el alcance del producto a un estado histórico completo de flujos. El retiro no es gasto y la depreciación no es pago de efectivo. El resultado de 1,800 y el margen de 15% se etiquetan **antes de impuestos**, porque estos no se calcularon.

### FT-03. Manufacturas Alfa

**Fuente:** `Caso Analisis Financiero Manufacturas Alfa_2025(2).docx`, páginas 1–2, idéntico a la copia `(3)`. Se prueba el servicio de indicadores con estados resumidos, sin fabricar un diario.

Entradas: ventas 2,400,000; costo de ventas 1,560,000; utilidad bruta 840,000; resultado operativo 340,000; intereses 60,000; resultado antes de impuestos 280,000; impuestos del ejercicio 112,000; utilidad neta 168,000. Efectivo 180,000; clientes 260,000; inventarios 300,000; activo corriente 740,000; activo fijo neto 760,000; activos 1,500,000. Proveedores 210,000; otros pasivos corrientes 190,000; pasivo corriente 400,000; deuda a largo plazo 400,000; pasivos totales 800,000; patrimonio 700,000.

La política del caso usa 365 días, saldos finales como aproximación de promedios y compras estimadas como 70% del costo de ventas. Se utilizan ventas totales como aproximación para días de cobro por falta de ventas a crédito separadas. Los resultados dependientes de esas aproximaciones deben llevar advertencia. El impuesto de 40% y los benchmarks ficticios pertenecen al ejercicio; no son reglas fiscales o sectoriales generales.

| Indicador | Esperado con política del caso |
| --- | ---: |
| Razón corriente / prueba ácida | 1.85 / 1.10 veces |
| Rotación de inventario / días de inventario | 5.20 veces / 70.19 días |
| Días de cobro | 39.54 días |
| Compras estimadas / días de pago | 1,092,000.00 / 70.19 días |
| Rotación de activos | 1.60 veces |
| Endeudamiento / cobertura de intereses | 53.33% / 5.67 veces |
| Margen bruto / operativo / neto | 35.00% / 14.17% / 7.00% |
| ROA / ROE con saldos finales | 11.20% / 24.00% |
| Capital de trabajo | 340,000.00 |

Los datos no permiten análisis horizontal, un balance inicial ni todas las razones de mercado. Cambiar la base a 360 días solo modifica razones dependientes de días. En una prueba adicional de fórmulas, la expresión de cobertura de pago fijo del compendio, página 4, `(418000 + 35000) / (93000 + 35000 + 81000 / (1 - 0.29))`, debe redondearse a **1.87**, no al 1.19 impreso. Este caso es una comprobación del catálogo de fórmulas, sin prometer cobertura de pago fijo para Carlitos cuando falten entradas.

### FT-04. Variantes inválidas y de concurrencia

Se derivan de una copia del fixture pequeño cambiando una condición por caso: importe negativo, ambos lados positivos, línea de cero, tercer decimal monetario, código inexistente, cuenta agrupadora, cuenta de otra empresa, fecha fuera de período, asiento desbalanceado, fila duplicada y fórmula no admitida. Se conserva en cada variante el nombre del cambio y el resultado esperado; nunca se altera el archivo original.

Las pruebas concurrentes usan dos clientes con sesiones independientes y una barrera de inicio. Se registran las respuestas de ambos, los conteos antes y después, la revisión y la auditoría. Esperar un resultado de conflicto exige comprobar que no quedó una segunda escritura parcial.

### FT-05. Presupuesto, sensibilidad y proyección

Para sensibilidad se utilizan ventas base 12,000, costo variable 60% y gastos 3,000: resultado 1,800. Favorable: ventas 13,200, costo 60%, gastos 3,000, resultado 2,280. Adverso: ventas 10,800, costo 65%, gastos 3,000, resultado 780. Estos supuestos proceden del reporte, sección de escenarios, y demuestran sensibilidad de resultados; por sí solos no definen un balance futuro.

La prueba de proyección integrada parte de los saldos iniciales de FT-02 y aplica sus nueve movimientos del mes como movimientos futuros, separados del diario histórico. Debe reproducir sus saldos finales y su patrimonio. Para un horizonte 2027 que parte de octubre de 2026, otra prueba exige entradas o estimaciones identificadas para noviembre y diciembre de 2026. La continuidad de los saldos iniciales es parte del resultado, aunque la pantalla se concentre en 2027.

## 4. Catálogo de pruebas

Todos los casos siguientes tienen estado inicial **pendiente**. Cada fila define una preparación y una expectativa mínima. Las evidencias y resultados reales se agregan al documento 20 al ejecutar la prueba en una versión identificada.

### Acceso, configuración e importación

| ID | Preparación y acción | Resultado verificable | Referencias |
| --- | --- | --- | --- |
| PR-01 | Levantar entorno vacío y aplicar migraciones/semillas; repetir la preparación local prevista | Esquema, permisos y catálogo de prueba reproducibles; sin pasos manuales ocultos; tipos compatibles | RNF-07; fase 01 |
| PR-02 | Iniciar sesión, expirar sesión y desactivar membresía; volver a consultar y mutar | Acceso concedido solo con identidad y membresía válidas; la cookie leída por sí sola no autoriza | RF-01; RNF-01; CU-01 |
| PR-03 | Analista intenta gestionar roles; administrador realiza alta autorizada; gerencia aprueba presupuesto | Analista rechazado; acciones permitidas según matriz; aprobación contable y presupuestaria separadas | RF-02, RF-17; CU-02, CU-15 |
| PR-04 | Usuario de empresa A solicita por URL, consulta y descarga un recurso de B | No recibe datos, conteos ni archivos de B; una URL manipulada no evita autorización | RNF-01; CU-11, CU-20 |
| PR-05 | Crear línea con cuenta de B en asiento de A o período ajeno; invocar API de datos ordinaria | FK compuesta/RPC y RLS impiden la relación; no quedan filas | RF-03, RF-08; RNF-02 |
| PR-06 | Revisar catálogo original y crear cuenta agrupadora, correctora y de movimiento | Se identifican las 20 naturalezas de gasto incoherentes; no se cambian correctoras legítimas; agrupadoras no admiten líneas | RF-03; RCF-02 |
| PR-07 | Registrar fecha límite, año/mes incoherentes y corte simulado futuro | El período se determina sin desplazamiento horario; incoherencias rechazadas; origen y cobertura visibles | RF-04; RCF-01, RCF-04 |
| PR-08 | Importar FT-01 con catálogo revisado y mapeo admitido | 477 asientos y 1,613 líneas; totales 2,161,744.81 por lado; procedencia conservada; aún sin efecto antes de aprobar | RF-05–RF-07; CU-05–CU-07 |
| PR-09 | Cargar variantes FT-04 con importes, fechas, códigos y fórmulas inválidos | Error por hoja/fila/columna/código; no descarte silencioso ni conversión arbitraria | RF-06; RNF-03 |
| PR-10 | Introducir un asiento desbalanceado y simular fallo de RPC después de iniciar escritura | Rechazo del lote completo y rollback de cabeceras, líneas y efectos de confirmación; error real | RF-07; RNF-02 |
| PR-11 | Dos confirmaciones simultáneas con la misma clave y payload; después reutilizar clave con otro payload | Un solo efecto y mismo resultado para reintento; conflicto para contenido distinto | RF-07; CU-07 |
| PR-12 | Renombrar o reempaquetar archivo con los mismos IDs normalizados de asientos | Se detecta duplicación aunque cambie el hash binario; no se duplican movimientos | RF-05–RF-07; RCF-08 |

### Contabilización y análisis

| ID | Preparación y acción | Resultado verificable | Referencias |
| --- | --- | --- | --- |
| PR-13 | Guardar borrador desbalanceado, intentar validarlo, corregirlo y validarlo; editarlo y descartar otro borrador con motivo | Descuadre visible sin efecto financiero; validar exige cuadre; edición vuelve a borrador; descarte conserva contenido/IDs, impide editar/aprobar y no bloquea cierre | RF-08; RCF-05; CU-08 |
| PR-14 | Analista intenta aprobar por Action y RPC; authenticated intenta DML directo; admin aprueba | Rechazos en entradas no autorizadas; conjunto válido contabilizado atómicamente por permiso correcto | RF-09; RNF-01, RNF-02; CU-09 |
| PR-15 | Contabilizar, revertir y repetir solicitud de reversión | Original inmutable y opuesto trazable; ambos se incluyen en sumas; reintento sin segunda reversión | RF-09; RCF-05; CU-10 |
| PR-16 | Dos ediciones con versión igual y una carrera entre aprobación y cierre | Una edición obsoleta recibe conflicto; cierre/aprobación serializados con invariantes conservados | RNF-02; RF-22; CU-08, CU-21 |
| PR-17 | Obtener comprobación de FT-02 y abrir detalle de cuentas | Débitos/créditos y saldos explicables; comprobación concilia y cada importe enlaza a sus movimientos | RF-10, RF-11; CU-11, CU-12 |
| PR-18 | Generar resultados y situación de los 34 cortes FT-01 | Valores concilian con diario y bases temporales de FT-01; tres cortes resumen coinciden con tablas de este MD | RF-12; RCF-09, RCF-10 |
| PR-19 | Generar patrimonio FT-01 y FT-02 desde movimientos | Puente inicial + aportes + resultado − retiros concilia; no se copian componentes erróneos del Excel | RF-12; RCF-11 |
| PR-20 | Pedir enero 2026 mensual, acumulado de ejercicio y acumulado histórico; abrir dashboard octubre | Enero mensual 20,441.40; 474,901.20 no rotulado mensual; cierre octubre identificado simulado | RF-14, RF-15; RCF-04 |
| PR-21 | Ejecutar FT-02 completo en motor y pantallas | Resultado antes de impuestos 1,800; caja 7,800; balance 20,300 = 9,000 + 11,300; razones 2.90 y 2.20 | RF-12, RF-13; RCF-09–RCF-15 |
| PR-22 | Calcular Alfa y cambiar base de días a 360; comprobar fórmula del compendio | Tabla FT-03 con 365; aproximaciones visibles; solo razones de días cambian; cobertura adicional 1.87 | RF-13; RCF-12–RCF-15 |
| PR-23 | Usar cero, faltante y saldo negativo como denominador; probar redondeo sin truncar operandos | `no_calculable` o `datos_insuficientes` y motivo según regla; no Infinity/NaN ni faltante sustituido por cero | RF-13; RCF-07, RCF-17 |
| PR-24 | Comparar año completo con diez meses, base anterior cero y análisis vertical sobre ventas cero | Duración advertida/bloqueada según consulta; variación absoluta disponible; porcentajes indefinidos explicados | RF-14; RCF-16, RCF-17 |
| PR-25 | Capturar análisis y modificar diario/catálogo durante publicación; enviar resultados falsos por API directa; abrir ejecución anterior | Snapshot coherente y revisión identificada; recalcular o marcar versión anterior; totales del cliente no son autoridad; motor recompone desde inputs capturados sin sobrescribir emisión | RF-24; RNF-08; CU-12, CU-13 |

### Planeación, entrega y operación

| ID | Preparación y acción | Resultado verificable | Referencias |
| --- | --- | --- | --- |
| PR-26 | Preparar presupuesto, enviarlo a revisión, aprobar y tratar de editarlo | Aprobación por permiso; versión aprobada inmutable; cambio genera otra versión; conflicto obsoleto | RF-16, RF-17; CU-14, CU-15 |
| PR-27 | Comparar real 120 con presupuesto 100 para ingreso y gasto; incluir presupuesto cero | Desviación +20 y +20%; interpretación favorable difiere por rubro; porcentaje no calculable con base cero | RF-18; RCF-18; CU-16 |
| PR-28 | Pronosticar una serie mensual conocida con promedio móvil 3 y crecimiento explícito; reservar últimos meses | Mismos parámetros producen misma salida; entrenamiento no usa meses de evaluación; MAE calculada y cobertura visible | RF-19; RCF-19; CU-17 |
| PR-29 | Pedir horizonte 2027 desde octubre 2026 sin y con puente noviembre–diciembre | Sin puente solo salida parcial identificada; con puente se conservan supuestos/origen; no copiar acumulado como mes | RF-19, RF-20; RCF-20 |
| PR-30 | Ejecutar sensibilidad FT-05 y movimientos futuros FT-02 | Sensibilidades 1,800/2,280/780; ejecución integrada reproduce los tres estados y caja de FT-02 sin afectar histórico | RF-19, RF-20; CU-17, CU-18 |
| PR-31 | Omitir un pago, contrapartida o movimiento necesario para proyección integrada | Se señala qué falta; no se publica balance conciliado con cuenta artificial ni ajuste silencioso | RF-20; RCF-20 |
| PR-32 | Exportar un mismo snapshot a PDF y XLSX, con varias páginas/importes negativos; intentar sustituir bytes o metadatos de salida mediante acceso ordinario | Totales y contexto coinciden; tablas legibles; descarga se genera desde captura y motor/plantilla versionados; no entrega un archivo manipulado por confiar solo en estado o hash del cliente | RF-21, RF-24; CU-19, CU-20 |
| PR-33 | Subir archivo, forzar fallo DB, intentar acceso sin permiso y ejecutar limpieza autorizada | Objeto privado; lote fallido/origen retenido; huérfano tratado por API Storage; no promesa falsa de transacción conjunta | RF-05, RF-21; RNF-08 |
| PR-34 | Cerrar período conciliado, intentar editar y reabrir con motivo | Edición rechazada; reapertura genera revisión y conserva cierre anterior; no asiento anual automático | RF-22; RCF-06; CU-21, CU-22 |
| PR-35 | Ejecutar alta, aprobación, reversión y reapertura; intentar editar auditoría | Actor, fecha, empresa, acción y motivo trazables; usuario no modifica registro; sin tokens/contraseñas en logs | RF-23; RNF-08; CU-23 |
| PR-36 | Transportar `"0.10"`, `"0.20"`, valores grandes admitidos y tasas de precisión mayor entre SQL, DTO y servicio | Sumas decimales exactas; SQL devuelve texto antes del JSON; gráficos no reingresan números aproximados al motor | RNF-03; RCF-07 |
| PR-37 | Probar tamaño/filas máximos configurados, archivo excedido y expansión XLSX excesiva | Límite aceptado o rechazado de forma controlada; recursos acotados; tiempos/consumo medidos con FT-01 y equipo identificado | RNF-06; CU-05 |
| PR-38 | Recorrer login, carga, corrección y estados solo por teclado; revisar vacío, carga y error | Foco y etiquetas útiles; error junto al dato; tablas/gráficos con alternativas; color no es único indicador | RNF-05; RF-15 |
| PR-39 | Respaldar instancia de prueba, recrear otra y restaurar DB, identidad y objetos privados requeridos | Conteos, permisos, archivos y totales coinciden; se documenta qué cubre cada respaldo y tiempo de restauración | RNF-07; documento 12 |
| PR-40 | Ejecutar guion por tres roles en versión candidata y consultar health | Recorrido aprobado sin pasos privilegiados ocultos; health sin datos financieros; evidencias ligadas a versión/fixture | RF-01–RF-24; documento 21 |

## 5. Política de cobertura y defectos

Una fase se acepta cuando cumple sus requisitos y se ejecutaron satisfactoriamente los casos que materialmente le corresponden. Las pruebas transversales se ejecutan desde la primera fase que introduce el riesgo: PR-04 no se aplaza hasta la exportación si ya existen consultas de otra empresa.

Bloquean una entrega los accesos cruzados, la pérdida o duplicación de movimientos, los descuadres, los signos o períodos equivocados, una emisión con revisión falsa y la imposibilidad de reproducir el entorno declarado. Un error de presentación que cambie la interpretación de una cifra también bloquea el reporte afectado. Los defectos menores pueden aceptarse con impacto, responsable y fecha de seguimiento explícitos; no se cambian expectativas financieras para obtener una marca de éxito.

La medición de rendimiento registra equipo, versiones, volumen, repeticiones y tiempos observados. Mientras no haya ejecución no se afirmará un umbral de segundos cumplido. La prueba de recuperación debe restaurar y comprobar datos; disponer de un archivo de respaldo no demuestra recuperación.

## 6. Registro de una ejecución

Cada ejecución futura registrará: ID de evidencia; PR aplicada; fecha; commit y migración; política y fixture; rol; preparación; resultado esperado; resultado obtenido; estado; archivo o registro de evidencia; defecto; responsable y siguiente acción. Se conservará también el resultado fallido si una segunda ejecución lo corrige.

Los estados son `pendiente`, `aprobada`, `fallida` o `bloqueada`. Una prueba bloqueada explica la dependencia que impide ejecutarla; una prueba no realizada permanece pendiente. El paquete documental utiliza estas categorías sin simular ejecuciones del sistema.

## 7. Fuentes y documentos relacionados

- `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`: coordenadas y datos de FT-01; procedencia simulada en `LEEME` y `DIARIO`.
- `Carlitos_Reporte_Mejorado.docx`: sección 9 para FT-02 y sección de escenarios para FT-05.
- `Caso Analisis Financiero Manufacturas Alfa_2025(2).docx`: estados y supuestos de FT-03.
- `compendio_razones_financieras_u2(1).pdf`: fórmulas, páginas 1–5; discrepancia de cobertura en página 4.
- [Motor e importaciones](../tecnico/11_MOTOR_FINANCIERO_E_IMPORTACIONES.md), [seguridad](../tecnico/08_AUTENTICACION_PERMISOS_Y_AUDITORIA.md), [operación](../tecnico/12_ENTORNO_LOCAL_Y_OPERACION.md), [trazabilidad](19_TRAZABILIDAD_Y_ENTREGABLES.md) y [registro de validación](20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md).
