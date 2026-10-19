# 04 · Reglas contables y financieras

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.  
**Estado:** reglas propuestas y referencias de cálculo revisadas; aplicación pendiente.

## 1 Autoridad de las reglas y política inicial

Este documento define qué debe significar y producir cada cálculo. [11 Motor financiero](../tecnico/11_MOTOR_FINANCIERO_E_IMPORTACIONES.md) define cómo ejecutarlo; [18 Plan de pruebas](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md) conserva casos y expectativas. Los datos académicos se utilizan con sus supuestos, sin convertir una tasa o referencia ficticia en una política empresarial general.

La política inicial propuesta **P-CARLITOS-1** fija USD, ejercicio calendario, entrada monetaria de dos decimales, precisión de trabajo decimal de 40 dígitos y redondeo `ROUND_HALF_UP` para resultados derivados al llevarlos a centavos o presentarlos. Tasas y razones conservarán mayor precisión internamente. La base de días será explícita por cálculo: 365 para el caso anual Alfa y la duración declarada del intervalo cuando se analice un período parcial. Los promedios se obtendrán de datos disponibles; una aproximación por saldo final requiere etiqueta y política explícitas.

Estas son decisiones de producto de la versión 0.1, no una certificación contable externa. Los veinte identificadores siguientes se usarán en requisitos, contratos, fases y pruebas.

## 2 Reglas de registro y consistencia

### RCF-01 · Origen, empresa y procedencia

Todo movimiento, archivo, plan y cálculo pertenece a una empresa y conserva origen `simulado` o la condición de datos que corresponda a su espacio. La configuración inicial de Carlitos es simulada. No se mezclan por omisión registros reales con esa base. Usuario y empresa se resuelven desde acceso autorizado, no desde un campo libre del archivo.

Cada registro importado mantiene archivo, hash, hoja, fila, lote y versión de normalización. Los casos resumidos del motor, como Alfa, mantienen su fuente y supuestos sin inventar líneas contables para incorporarlos al diario. [F3, F4]

### RCF-02 · Cuenta, naturaleza y rubro

Una cuenta define código textual, jerarquía, clase, naturaleza normal, rubro de presentación, vigencia y capacidad de recibir movimientos. Naturaleza deudora significa saldo normal débito; acreedora, saldo normal crédito. La naturaleza orienta presentación y controles, pero no cambia unilateralmente debe y haber recibidos.

Solo cuentas activas de movimiento admiten líneas. Las cuentas correctoras se identifican expresamente y reducen el rubro correspondiente; por ejemplo, depreciación acumulada disminuye propiedad y equipo. El signo de presentación no se deduce exclusivamente del primer dígito del código.

`CATALOGO!D7,D62:D80` contiene **20 filas** de gastos con naturaleza acreedora. Se revisarán en una versión de catálogo, preservando el valor original y la decisión. No se aplicará una sustitución indiscriminada que altere una correctora legítima. [F3]

### RCF-03 · Partida doble y validez de líneas

Cada línea contiene importes finitos, no negativos, con exactamente un lado positivo y el otro en cero. Un asiento persistido tiene al menos dos líneas, fecha y cuentas válidas. Un asiento **validado o contabilizado** cumple suma del debe igual a suma del haber, exactamente a centavos.

El borrador manual puede guardarse desbalanceado para continuar su preparación, pero conserva estado `borrador`, muestra diferencia y no afecta estados. Confirmar un lote exige que todos sus asientos cuadren, aunque se incorporen inicialmente como borradores. No se introduce una línea automática para ocultar un desbalance.

### RCF-04 · Base temporal y fecha

Los flujos se suman dentro de un intervalo; los saldos se calculan al corte. Se distinguen:

| Base | Definición | Ejemplos |
| --- | --- | --- |
| Movimiento del período | Movimientos entre fecha inicial y final, inclusivas | Ventas y gastos de enero |
| Acumulado del ejercicio | Flujos desde inicio del ejercicio hasta el corte | Ventas enero–octubre |
| Saldo al corte | Apertura más movimientos contabilizados hasta una fecha | Efectivo, cuentas por cobrar, deuda |

No se suman doce balances para obtener el balance anual ni doce resultados acumulados para obtener el resultado anual. En Carlitos, las ventas de enero de 2026 son **20,441.40**; **474,901.20** es el acumulado desde 2024 que aparece en la hoja de resumen. [F3: `ESTADO_RESULTADOS!C26`, `RESUMEN_MENSUAL!D26`]

La fecha contable es un día civil sin conversión horaria. La fecha/hora del evento de auditoría sí identifica un instante. Octubre de 2026, con registros simulados del día 28, se conserva como simulación de cierre respecto de la fecha documental del día 19.

### RCF-05 · Estado, inmutabilidad y reversión

Solo asientos `contabilizado` participan en estados. Editar uno `validado` lo devuelve a borrador. Los contabilizados son inmutables: una corrección crea otro asiento opuesto, autorizado, con motivo y vínculo al original.

Un borrador o validado puede descartarse administrativamente con permiso, versión y motivo. Se conservan cabecera, líneas, procedencia e identificadores, junto con fecha y actor del descarte. Esa marca no añade otro estado contable, no permite editar o aprobar el registro y resuelve su condición de pendiente para cierre. No puede aplicarse a un contabilizado.

Original y reversión se incluyen juntos en los cálculos. Marcar visualmente «revertido» no excluye al original de la agregación. La fecha de la reversión pertenece a un período permitido; si se registra en un mes posterior, no reescribe el resultado del mes original. Las correcciones adicionales se documentan con un nuevo asiento de reemplazo cuando corresponda.

### RCF-06 · Cierre y revisión

El estado de un período es abierto o cerrado. Cerrarlo verifica conciliación e incidencias bloqueantes, conserva snapshot y revisión y rechaza nuevas mutaciones. Reabrir requiere permiso y motivo, preserva el cierre anterior y genera revisión nueva.

El cierre inicial del producto **no genera asientos anuales automáticos de traslado de resultados**. Los servicios identifican resultados del ejercicio y de ejercicios anteriores sin duplicarlos. Incorporar más adelante un diario de cierre anual exigirá cambiar la política de consolidación y sus pruebas.

### RCF-07 · Precisión y redondeo

Los importes contables usan dos decimales y se transportan como strings, por ejemplo `"20441.40"`. Una entrada con más de dos decimales efectivos se rechaza; no se redondea silenciosamente al importarla. Los ceros finales de un literal como `12.3400` pueden normalizarse a `12.34` porque conservan exactamente su importe; `12.345` se rechaza. El motor realiza sumas y fórmulas con aritmética decimal, conservando una precisión de trabajo de 40 dígitos en P-CARLITOS-1.

Se redondea a dos decimales al presentar dinero o al convertir una fórmula derivada en un movimiento contable. Razones y porcentajes se muestran inicialmente con dos decimales, conservando el valor interno y la unidad. En porcentajes, se multiplica la razón por 100 al final. Una razón redondeada no se utiliza como denominador de otra operación.

Al distribuir un importe entre varias líneas o meses, se calcula con precisión, se redondean las partes y el residuo de centavos se asigna por una regla determinista registrada —mayor residuo fraccional y desempate por orden estable—. Esa distribución técnica conserva el total; no autoriza crear ajustes para un balance desconciliado. La elección de tipos exactos y del motor decimal se sustenta en [PostgreSQL numeric](https://www.postgresql.org/docs/current/datatype-numeric.html) y [decimal.js](https://mikemcl.github.io/decimal.js/).

### RCF-08 · Fuente de verdad y snapshot

El diario contabilizado, catálogo publicado y política versionada son la base del histórico. Comprobación, estados, indicadores y gráficos se derivan de ella y no permiten editar totales independientes.

Un snapshot conserva entradas, revisión de datos y catálogo, política, versión de fórmulas y resultados coherentes. Si los datos cambian antes de publicar, se recalcula o se identifica la ejecución como correspondiente a su revisión anterior. Un reporte emitido conserva esa versión. Las hojas precalculadas del Excel se usan para contraste; no compiten con el diario como otra contabilidad editable.

## 3 Reglas de estados históricos

### RCF-09 · Estado de resultados

La fórmula general del intervalo es ingresos netos menos costo de ventas, gastos operativos, costos financieros e impuestos efectivamente definidos. Se presentan subtotal bruto, operativo y antes de impuestos cuando la clasificación lo permite. El resultado neto solo se identifica como tal si el tratamiento de impuestos está disponible y declarado.

Un retiro de propietario reduce patrimonio y efectivo; no constituye gasto. La compra de un activo no es automáticamente gasto del período; su depreciación tiene efecto en resultados sin representar por sí misma pago de efectivo. La utilización de inventario como costo de ventas se distingue de la compra pagada.

En el ejemplo pequeño: `12,000 − 7,200 − 2,700 − 300 = 1,800` antes de impuestos. El margen `1,800 / 12,000 = 15%` se denomina **margen antes de impuestos**. No se inventa impuesto cero para convertirlo en margen neto. [F2, sección 9]

### RCF-10 · Situación financiera

Al corte debe cumplirse `activo = pasivo + patrimonio`. Las cuentas se clasifican en rubros corrientes/no corrientes conforme al catálogo y los datos del caso, manteniendo visibles las correctoras. El efectivo futuro negativo o una deuda mal clasificada no se ocultan con una reclasificación automática sin política.

Los resultados acumulados aún no traspasados a cuentas permanentes se integran una sola vez al patrimonio. El ejemplo pequeño obtiene activos **20,300**, pasivos **9,000** y patrimonio **11,300**. Para calcular su liquidez se considera corriente la cuenta por pagar de 4,000 y no corriente la deuda restante de 5,000, según la clasificación explícita del fixture. [F2, sección 9]

### RCF-11 · Cambios en patrimonio

El puente es `patrimonio final = patrimonio inicial + aportes + resultado del intervalo − retiros + otros ajustes explícitos`. Los ajustes requieren movimientos identificados; no absorben diferencias sin origen.

Si el diario no contiene cierre anual, el patrimonio al corte incorpora capital y resultados retenidos de apertura, movimientos patrimoniales posteriores y resultados nominales acumulados desde esa apertura, sin volver a añadir una utilidad ya incluida en el saldo inicial. Para un puente de un año se utiliza el patrimonio del cierre previo y solo el resultado/movimientos de ese año.

En el libro, capital **46,800** de `CAMBIOS_PATRIMONIO!C2:C35` no coincide con **40,800** del asiento de apertura en `DIARIO!I15`. Los componentes difieren de los totales almacenados en **6,000** para 2024, **10,200** para 2025 y **14,400** para 2026. El sistema reconstruirá el puente desde el diario, no corregirá el capital sumando una cifra sin movimiento. [F3]

## 4 Reglas de indicadores

Las razones conservan su fórmula, unidad, intervalo y operandos. No existe un semáforo universal: una comparación requiere contexto y una referencia identificada. Las referencias de industria de Alfa son ficticias y deben rotularse así. [F4]

### RCF-12 · Liquidez

| Indicador | Fórmula | Condición de presentación |
| --- | --- | --- |
| Razón corriente | Activo corriente / pasivo corriente | Veces; exige clasificación comparable |
| Prueba ácida | Activos rápidos / pasivo corriente | Variante inicial: efectivo + equivalentes + cuentas por cobrar realizables; declarar partidas incluidas |
| Capital de trabajo | Activo corriente − pasivo corriente | Importe monetario; no requiere división |

Cuando el caso solo aporta activo corriente e inventario y confirma que el resto corresponde a activos rápidos, se puede usar `(activo corriente − inventario) / pasivo corriente`, declarando esa variante. No se incluyen anticipos por omisión si no son realizables para la prueba.

Alfa: `740,000 / 400,000 = 1.85`; `(740,000 − 300,000) / 400,000 = 1.10`; capital de trabajo **340,000**. El fixture pequeño obtiene **2.90**, **2.20** y **7,600**. [F2, F4]

### RCF-13 · Actividad

| Indicador | Fórmula sobre el mismo intervalo |
| --- | --- |
| Rotación de inventario | Costo de ventas / inventario promedio |
| Días de inventario | Días del intervalo × inventario promedio / costo de ventas |
| Días de cobro | Días del intervalo × cuentas por cobrar promedio / ventas a crédito |
| Días de pago | Días del intervalo × cuentas por pagar comerciales promedio / compras a crédito |
| Rotación de activos | Ventas / activos promedio |

El promedio inicial es `(saldo inicial + saldo final) / 2` cuando ambos estén disponibles y representen la misma población. Una media de observaciones mensuales es otra política y se rotula como tal. Usar saldo final en lugar de promedio o ventas/compras totales en lugar de crédito es una aproximación explícita.

Alfa dispone esa aproximación de cierre, 365 días y compras estimadas `0.70 × 1,560,000 = 1,092,000`. Resultan rotación de inventario **5.20**, días de inventario **70.19**, días de cobro **39.54**, días de pago **70.19** y rotación de activos **1.60**. Los días se calculan desde operandos sin redondear previamente la rotación. [F4]

### RCF-14 · Endeudamiento y cobertura

Endeudamiento se define como `pasivo total / activo total × 100`; no representa únicamente préstamos con interés. Cobertura de intereses es `resultado operativo antes de intereses e impuestos / gasto de intereses`. Se conserva el nombre de cada numerador para evitar reemplazar EBIT por utilidad neta.

Alfa produce endeudamiento **53.33%** y cobertura **5.67 veces**. Una razón de cobertura de pagos fijos solo se habilita si están disponibles todos los pagos y la política fiscal del caso. La fórmula del compendio `(418000 + 35000) / (93000 + 35000 + 81000 / (1 − 0.29))` produce **1.871247…**, presentado **1.87**, aunque el material imprime 1.19. Se usará el cálculo revisado. [F4; F5, página 4]

### RCF-15 · Rentabilidad

| Indicador | Fórmula |
| --- | --- |
| Margen bruto | Utilidad bruta / ventas × 100 |
| Margen operativo | Resultado operativo / ventas × 100 |
| Margen antes de impuestos | Resultado antes de impuestos / ventas × 100 |
| Margen neto | Utilidad neta / ventas × 100 |
| ROA | Utilidad neta / activos promedio × 100 |
| ROE | Utilidad neta / patrimonio promedio × 100 |

La base de ROA/ROE se indica en el nombre o detalle si se usa saldo final. No se anualiza un período parcial sin una política explícita. Con utilidad neta 168,000 y saldos de cierre de Alfa, margen neto es **7.00%**, ROA **11.20%** y ROE **24.00%**. Su impuesto de 40% pertenece únicamente al ejercicio; no se adopta como tasa general del sistema. [F4]

### RCF-16 · Comparación horizontal y vertical

Horizontal calcula `actual − anterior` y, para una base anterior positiva, `(actual − anterior) / anterior × 100`. Si la base es cero no existe un porcentaje calculable; si es negativa se conserva la diferencia y se advierte que el porcentaje convencional puede tener una interpretación equívoca. No se cambia automáticamente el denominador a valor absoluto.

Vertical de resultados utiliza `rubro / ventas × 100`. La presentación vertical del balance usa `rubro / activos totales × 100`, identificando el denominador. Los períodos comparados deben compartir moneda, clasificación y duración o una advertencia que explique la diferencia. Una cifra de enero–octubre y otra de año completo no se presentan como equivalentes.

### RCF-17 · Datos insuficientes y calidad

| Situación | Estado de cálculo | Tratamiento |
| --- | --- | --- |
| Operandos presentes y fórmula definida | `calculado` | Devuelve valor decimal, unidad y procedencia |
| Operando requerido ausente | `datos_insuficientes` | Devuelve ausencia y lista de faltantes |
| Denominador cero | `no_calculable` | Devuelve ausencia y explicación; no infinito |
| Aproximación explícita disponible | `calculado` | Valor acompañado de advertencia y calidad estimada |
| Denominador negativo | Según política de la razón | Conserva advertencia; no calificación favorable automática; días que exijan base positiva quedan no calculables |
| Intervalos incompatibles | Comparación no publicable como equivalente | Solicita ajustar intervalo o muestra advertencia explícita |

Un cero contable observado es diferente de un dato ausente. La calidad simulada, estimada o aproximada puede coexistir con un cálculo aritméticamente válido. No se inventan vencimientos, unidades, tasas impositivas, comparativos previos ni datos de mercado para completar indicadores.

## 5 Reglas de planificación

### RCF-18 · Presupuesto y desviaciones

El presupuesto contiene líneas mensuales identificadas por rubro y una versión. Distingue devengado de efectivo, por lo que ventas no son automáticamente cobros y costo no es automáticamente pago.

Desviación absoluta es `real − presupuesto`. Para presupuesto positivo, la porcentual es esa diferencia dividida entre presupuesto y multiplicada por 100. En ingresos, una diferencia positiva suele representar mayor ingreso; en costos/gastos, mayor consumo. La etiqueta favorable depende del rubro y del contexto, no solo del signo. Presupuesto cero mantiene diferencia absoluta y porcentaje no calculable; importes negativos requieren advertencia de interpretación.

La versión aprobada es inmutable. Un cambio crea una nueva versión y cada comparativo identifica cuál utiliza. El presupuesto de efectivo cumple `efectivo final = inicial + cobros − pagos`, sin mezclar depreciación con pago ni retiros con gasto.

### RCF-19 · Métodos, escenarios y evaluación

El promedio móvil de tres meses usa los tres flujos mensuales inmediatamente anteriores disponibles. Si se repite recursivamente hacia el futuro, esa modalidad se registra y las estimaciones pasan a formar parte de la ventana; no se presenta como tres observaciones reales en cada paso.

El crecimiento explícito utiliza una base comparable: por ejemplo, mismo mes del año anterior por `(1 + g)`, o mes precedente por `(1 + g)` si se declara crecimiento mensual. La periodicidad de `g` es obligatoria. Una tasa anual no se aplica doce veces como si fuera mensual.

Los escenarios versionan supuestos base, favorable y adverso, conservando nombre, parámetros y fuente. La evaluación temporal reserva meses posteriores al entrenamiento y calcula `MAE = promedio de |observado − pronosticado|` sobre pares válidos. Se informa cuántos meses se evaluaron; las métricas porcentuales requieren política frente a ceros.

En el libro, enero de 2027 **510,518.79** coincide con **474,901.20 × 1.075**. Como el archivo contiene valores y no fórmulas, esta relación es una inferencia numérica, aunque revela la necesidad de revisar la base temporal. Se regenerará el pronóstico desde flujos mensuales. Costos 48%, gastos 30%, cobros 92%, retiros 35% y factores 0.90/1.12 observados en el libro son supuestos inferidos, no políticas configuradas verificadas. [F3]

### RCF-20 · Proyección integrada y datos faltantes

Una proyección completa necesita saldo inicial conciliado, calendario de ventas/cobros, compras/pagos, consumo de inventario, gastos, depreciación, inversión, deuda, aportes y retiros que correspondan al caso. Cada mes genera movimientos futuros balanceados y deriva los tres estados desde ellos.

Para llegar a enero de 2027 desde octubre de 2026 se requiere puente de noviembre y diciembre de 2026. Ese puente conserva método y condición estimada. Repetir octubre sin declarar un método no resuelve el faltante. Una vista parcial de ventas o sensibilidad puede existir en fase 04, pero no se etiqueta como balance proyectado completo.

La ejecución comprueba por mes partida doble, activo igual a pasivo más patrimonio y puentes de efectivo, inventario, deuda y patrimonio. Si falla, conserva diagnóstico y faltantes; no añade una cuenta artificial para cuadrar. Los movimientos proyectados no pasan al diario histórico mediante la ejecución del escenario.

## 6 Referencias monetarias conciliadas del libro

Las siguientes cifras fueron revisadas desde el diario y sirven como expectativas. La aplicación todavía no ha ejecutado estos cálculos.

| Intervalo/corte | Ventas | Costos | Gastos | Resultado | Activos | Pasivos | Patrimonio |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2024 completo | 207,498.30 | 100,885.68 | 39,498.00 | 67,114.62 | 133,711.54 | 22,996.92 | 110,714.62 |
| 2025 completo | 246,961.50 | 120,072.67 | 41,370.00 | 85,518.83 | 225,705.73 | 33,672.28 | 192,033.45 |
| Enero–octubre 2026 simulado | 228,853.90 | 111,268.75 | 35,905.00 | 81,680.15 | 313,879.32 | 43,665.72 | 270,213.60 |

Fuente: `ESTADO_RESULTADOS!C13:F13,C25:F25,C35:F35`, `BALANCE_GENERAL!C13:F13,C25:F25,C35:F35`, conciliados contra `DIARIO`. El libro contiene 477 asientos y 1,613 líneas; debe y haber totalizan **2,161,744.81** cada uno. Las discrepancias de patrimonio y pronóstico no invalidan esa cuadratura del diario, pero sí impiden adoptar todas las hojas derivadas sin revisión. [F3]

## 7 Fuentes y control de cambios

- **F1:** `Carlitos_ARQUITECTURA_TECNICA_DETALLADA.docx`, fórmulas, conciliaciones y reglas de módulos.
- **F2:** `Carlitos_Reporte_Mejorado.docx`, secciones 6–9, especialmente el caso conciliado de sección 9.
- **F3:** `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`, hojas y coordenadas identificadas en cada regla. El libro contiene valores fijos sin fórmulas Excel.
- **F4:** `Caso Analisis Financiero Manufacturas Alfa_2025(2).docx`, páginas 1–2, estados, supuestos y referencias ficticias; copia `(3)` idéntica.
- **F5:** `compendio_razones_financieras_u2(1).pdf`, páginas 1–5; aproximaciones de actividad en página 3 y error de cobertura fija en página 4; copia `(2)` idéntica.

Cambiar una fórmula o política requiere versión nueva, actualización del motor y revisión de pruebas afectadas. No se reescriben ejecuciones previas. Los hallazgos y decisiones reales se registran en [20 Validación y pendientes](../validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md).

**Volver:** [Índice documental](../00_INDICE_Y_PLAN_DOCUMENTAL.md).
