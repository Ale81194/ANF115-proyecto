# Fase 03 · Estados históricos y análisis

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.  
**Estado:** especificación de ejecución desarrollada; implementación y pruebas de aplicación pendientes.

## 1. Objetivo y primer MVP

Convertir el diario contabilizado en balance de comprobación, estado de resultados, situación financiera, cambios en patrimonio e indicadores explicables. El usuario seleccionará empresa, período y corte; podrá comprobar de dónde sale cada subtotal y reconocer cuándo falta información para un cálculo.

Esta fase completa el **primer MVP demostrable de extremo a extremo**: acceso → importación → revisión → aprobación → estados → análisis. El alcance completo todavía requiere presupuestos, escenarios, proyecciones y reportes de las fases 04 y 05.

El dashboard se alimentará de la misma ejecución que las vistas detalladas. Sus tarjetas no recalcularán fórmulas con criterios distintos ni mostrarán un período implícito. Un corte con información simulada o incompleta tendrá esa condición visible.

## 2. Requisitos, reglas y contratos

| Referencia | Compromiso |
| --- | --- |
| RF-11, RF-12 | Comprobación y tres estados históricos conciliados |
| RF-13, RF-14 | Indicadores explicables y análisis horizontal/vertical |
| RF-15 | Dashboard con período, origen y calidad |
| RF-23, RF-24 | Procedencia y reproducción de ejecuciones de análisis |
| RNF-01–RNF-06, RNF-08 | Acceso, consistencia, precisión, separación de capas, interfaz y desempeño medido |
| RCF-04–RCF-17 | Base temporal, estados, precisión, patrimonio, razones y datos insuficientes |
| CU-11–CU-13, CU-23 | Consulta de origen, estados, análisis y auditoría |

Las fórmulas se definen en [reglas financieras](../negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md). Esta fase implementa esas reglas a través del [motor](../tecnico/11_MOTOR_FINANCIERO_E_IMPORTACIONES.md) y los [contratos](../tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md); no introduce otra versión de las fórmulas en componentes.

## 3. Dependencias y política de datos

Se requieren asientos contabilizados de la [fase 02](14_FASE_02_IMPORTACION_Y_DIARIO.md), catálogo revisado con rubros financieros y una política de cálculo identificada. Los resúmenes del Excel sirven para contraste; los resultados de la aplicación se obtendrán desde movimientos y clasificaciones versionadas.

Las consultas distinguirán tres bases: flujo de un mes, acumulado del ejercicio y saldo a una fecha de corte. Cambiar la base cambia la consulta y la etiqueta. Un dato mensual no se obtiene tomando indiscriminadamente un acumulado histórico; enero de 2026 es el caso de control central para este riesgo.

El cierre de período definido para el MVP no genera automáticamente asientos de cierre anual. Por ello, el patrimonio debe presentar aportes, retiros y resultados actuales/anteriores sin duplicar utilidades. La hoja de patrimonio del libro no se copiará como si sus componentes fueran conciliados.

## 4. Trabajo y responsables

| Trabajo | Responsable principal | Revisión |
| --- | --- | --- |
| Definir consultas de saldos y agrupación por cuenta, rubro y período | B | C |
| Implementar estados e indicadores con servicios decimales puros | C | B |
| Implementar ejecución coherente y metadatos de revisión/política | B | C |
| Construir tablas de estados, trazabilidad a cuentas y detalle del diario | A | C |
| Implementar selección temporal y comparaciones en URL | A | B |
| Integrar dashboard, detalle de fórmula y estados no calculables | A y C | B |
| Preparar casos Carlitos y Alfa y contrastar los resultados | C | B |
| Comprobar aislamiento de agregados y comportamiento ante cambios concurrentes | B | C |

La interfaz puede desarrollarse contra DTO pactados mientras se implementan las consultas. Antes de integrar, ambos lados deben usar strings decimales para los importes y el mismo identificador de ejecución. Los datos ficticios de desarrollo permanecerán identificados como fixtures.

## 5. Archivos y recorrido de cálculo

| Ubicación prevista | Responsabilidad |
| --- | --- |
| `src/app/(privado)/estados/` | Selector y carpetas `comprobacion`, `resultados`, `balance`, `patrimonio` con `page.tsx` |
| `src/app/(privado)/analisis/indicadores/page.tsx` | Valor, fórmula, operandos, unidad y límites |
| `src/app/(privado)/analisis/comparativo/page.tsx` | Comparación temporal y estructura vertical |
| `src/app/(privado)/dashboard/page.tsx` | Resumen del corte seleccionado |
| `src/controladores/estados.controller.ts`, `analisis.controller.ts`, `dashboard.controller.ts` | Autorización, consulta y composición de resultados |
| `src/repositorios/estados.repository.ts`, `analisis.repository.ts` | Lecturas autorizadas y ejecuciones persistidas |
| `src/servicios/estados/` y `src/servicios/finanzas/` | Algoritmos deterministas reutilizables |
| `src/servicios/contabilidad/conciliar-patrimonio.ts` | Verificación del movimiento patrimonial |
| `src/components/organisms/estados/`, `analisis/`, `dashboard/` | Presentación y detalle |
| `tests/fixtures/alfa-2025.json`, `carlitos-mes-conciliado.json` | Entradas con política y valores esperados |

El repositorio devolverá una lectura consistente de saldos y metadatos; las consultas SQL convertirán importes a texto antes de formar JSON. El motor utilizará la política `P-CARLITOS-1`: precisión interna de 40 dígitos y redondeo `ROUND_HALF_UP` en los puntos definidos por la regla. Los importes de entrada con más de dos decimales se rechazarán, sin corregirlos silenciosamente.

Una ejecución conservará empresa, intervalo, fecha de corte, origen, revisión de datos y catálogo, política y versión de fórmulas. Antes de publicar, se comprobará que la revisión esperada sigue vigente; si cambió, se recalculará o se conservará la ejecución explícitamente como revisión anterior. El diseño de bloqueos y snapshots se implementa según los documentos 07 y 10 para evitar combinar consultas hechas sobre revisiones distintas.

## 6. Entregables obligatorios

| Entregable | Contenido verificable |
| --- | --- |
| Consultas de saldos | Débitos, créditos, saldos y trazabilidad por cuenta |
| Estados históricos | Comprobación, resultados, situación y patrimonio |
| Catálogo de indicadores | Fórmula, entradas, unidad, política y tratamiento de faltantes |
| Comparaciones | Variación absoluta/relativa y estructura vertical con bases visibles |
| Dashboard | Resumen coherente con su ejecución y señales de calidad |
| Persistencia de análisis | Entradas, revisiones, resultados y procedencia reproducible |
| Evidencia financiera y técnica | Fixtures, resultados exactos, consultas y casos de aislamiento |

## 7. Aceptación cuantitativa

La siguiente tabla corresponde a revisión previa del diario fuente; será un objetivo de validación de la aplicación, todavía pendiente.

| Corte | Ventas | Costos | Gastos | Resultado | Activos | Pasivos | Patrimonio |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2024 completo | 207,498.30 | 100,885.68 | 39,498.00 | 67,114.62 | 133,711.54 | 22,996.92 | 110,714.62 |
| 2025 completo | 246,961.50 | 120,072.67 | 41,370.00 | 85,518.83 | 225,705.73 | 33,672.28 | 192,033.45 |
| Enero–octubre de 2026 simulado | 228,853.90 | 111,268.75 | 35,905.00 | 81,680.15 | 313,879.32 | 43,665.72 | 270,213.60 |

Los cortes provienen de `DIARIO` y se contrastaron con `ESTADO_RESULTADOS!C13:F13`, `C25:F25`, `C35:F35` y `BALANCE_GENERAL!C13:F13`, `C25:F25`, `C35:F35`. Enero de 2026 debe mostrar ventas mensuales de **20,441.40**, frente al acumulado histórico **474,901.20** de `RESUMEN_MENSUAL!D26`; ambos valores describen bases diferentes.

El fixture pequeño debe producir resultado antes de impuestos de **1,800.00**, efectivo **7,800.00**, activos **20,300.00**, pasivos **9,000.00** y patrimonio **11,300.00**. Su razón corriente será **2.90**, la prueba ácida **2.20** y el capital de trabajo **7,600.00**. El margen de 15% se denominará antes de impuestos.

Alfa se evaluará como fixture financiero aislado, con los supuestos del ejercicio. Razón corriente **1.85**, prueba ácida **1.10**, margen neto **7.00%**, ROA **11.20%** y ROE **24.00%** son controles previstos. No se fabricará un diario para completar información que el caso no proporciona.

## 8. Aceptación funcional y definición de terminado

1. Solo los asientos contabilizados participan en los estados. Original y reversión se conservan en sus sumas.
2. Activos iguala pasivos más patrimonio y el puente patrimonial concilia. Las igualdades monetarias se comprueban a centavos, sin tolerancias que oculten diferencias.
3. Un subtotal permite identificar cuentas y movimientos de origen dentro de la misma revisión consultada.
4. Los filtros de la URL permiten reproducir período, corte y base; el dashboard y el detalle coinciden.
5. Una división por cero o un dato inexistente produce estado no calculable, causa y dato requerido. El valor `0` se reserva para un cero observado válido.
6. Las comparaciones usan períodos compatibles. Con Alfa sin período previo, el análisis horizontal explica la ausencia del dato.
7. Los indicadores basados en saldos al cierre, compras estimadas o referencias sectoriales ficticias exponen esas condiciones.
8. Un cambio concurrente no mezcla dos revisiones en una misma ejecución; consultar otra empresa no revela agregados ajenos.

La fase termina cuando el recorrido MVP completo pasa los casos aplicables del [plan de pruebas](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md), los valores de referencia concilian y los errores de origen documentados son detectados o tratados según política. Los resultados de software se registrarán en [validación](../validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md), separados de la auditoría ya realizada a archivos.

La cobertura financiera principal es **PR-17–PR-24**, junto con el snapshot de análisis de **PR-25**. El subcaso de PR-25 que vuelve a abrir una emisión anterior se completa con los reportes de fase 05. Se aplican además aislamiento de **PR-04**, precisión de **PR-36** e interfaz de **PR-38** a las nuevas consultas y pantallas.

## 9. Límites y paso a la siguiente fase

El presupuesto de efectivo y las proyecciones comienzan después de este hito. El flujo de efectivo histórico completo, notas a estados y funciones operativas de caja o ventas permanecen fuera del MVP descrito.

Al cerrar la fase se revisará la capacidad restante antes de comprometer fechas de las fases posteriores. Si los estados no concilian, se resolverá la causa contable o técnica antes de utilizar esas series como base de [presupuestos y escenarios](16_FASE_04_PRESUPUESTOS_Y_ESCENARIOS.md).

## 10. Referencias

- `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`: `DIARIO`, `ESTADO_RESULTADOS`, `BALANCE_GENERAL`, `CAMBIOS_PATRIMONIO` y `RESUMEN_MENSUAL`.
- `Carlitos_Reporte_Mejorado.docx`, sección 9: fixture mensual conciliado.
- `Caso Analisis Financiero Manufacturas Alfa_2025(2).docx`, páginas 1–2: estados y supuestos del ejercicio; copia `(3)` de contenido idéntico.
- [Reglas contables y financieras](../negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md), [motor](../tecnico/11_MOTOR_FINANCIERO_E_IMPORTACIONES.md) y [datos de referencia](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md).
