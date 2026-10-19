# 11 · Motor financiero e importaciones

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.  
**Estado:** diseño de algoritmos y adaptadores; implementación pendiente.

## 1 Responsabilidad del motor

El motor transforma datos normalizados y una política versionada en resultados deterministas. No conoce sesión, cookies, componentes React ni cliente Supabase. Los controladores obtienen contexto autorizado y coordinan repositorios; las reglas puras se ejecutan en `src/servicios`. La ubicación de archivos se define en [06 Directorios](06_DIRECTORIOS_Y_CONVENCIONES.md); el significado contable, en [04 Reglas](../negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md).

| Componente | Responsabilidad |
| --- | --- |
| `src/lib/excel/importar-diario.ts` | Leer estructura XLSX admitida y conservar tipos/literales de origen |
| `src/servicios/importaciones/normalizar-filas.ts` | Convertir filas a datos canónicos y emitir errores de formato |
| `validar-lote.ts`, `detectar-duplicados.ts` | Comprobar estructura, cuentas, partidas y repetición semántica |
| `src/servicios/contabilidad/` | Validar asiento, clasificar saldos y conciliar patrimonio |
| `src/servicios/estados/` | Producir comprobación, resultados, balance y patrimonio |
| `src/servicios/finanzas/` | Evaluar catálogo de indicadores y comparaciones |
| `src/servicios/presupuestos/` | Validar planes y comparar real frente a versión |
| `src/servicios/proyecciones/` | Pronosticar flujos, evaluar métodos e integrar movimientos futuros |
| `src/servicios/reportes/preparar-reporte.ts` | Preparar un modelo de reporte desde una ejecución congelada |

Una fórmula vive en un servicio, no en componentes, exportadores y SQL independientes. SQL puede agregar movimientos y aplicar restricciones; el servicio interpreta los saldos con la política del caso. Los mecanismos de grants, RLS, transacción y bloqueos pertenecen a [07 Datos](07_MODELO_DE_DATOS_Y_MIGRACIONES.md) y [08 Seguridad](08_AUTENTICACION_PERMISOS_Y_AUDITORIA.md).

## 2 Perfil de importación inicial

Se definirán dos formatos versionados: `carlitos-xlsx-v1` para el libro aportado y `diario-csv-v1` para una plantilla normalizada. La primera versión de CSV será UTF-8, encabezados obligatorios, separador documentado y comillas conforme al lector elegido; el usuario verá el formato antes de cargar. No habrá autodetección ambigua de separadores monetarios.

El libro Carlitos contiene 12 hojas. `CATALOGO!A1:I80` aporta 79 cuentas y `DIARIO!A1:K1614` aporta 477 asientos y 1,613 líneas. Las otras hojas permiten contrastar, documentar o planificar; no se incorporan como asientos adicionales. [F3]

| Columna de `DIARIO` | Campo normalizado | Tratamiento |
| --- | --- | --- |
| A · Asiento | Identificador externo del asiento | Texto obligatorio y estable dentro de la fuente |
| B · Fecha | Fecha contable | ISO `YYYY-MM-DD`; validar día real |
| C · Año; D · Mes | Comprobación redundante | Deben coincidir con la fecha; no sobrescribirla |
| E · Concepto | Concepto de cabecera/línea | Texto con longitud acotada; conservar original |
| F · Código cuenta | Código de cuenta | Texto; conservar puntos y ceros |
| G · Cuenta | Nombre informativo original | Contrastar con catálogo; el código resuelve la cuenta |
| H · Debe USD; I · Haber USD | Importes decimales | Dos decimales efectivos; sin coma flotante intermedia |
| J · Origen | Procedencia declarada | Verificar compatibilidad con el espacio simulado |
| K · Libro | Referencia de libro/fuente | Metadato de procedencia, sin conceder identidad empresarial |

En catálogo se mapean código, cuenta, clase, naturaleza, padre, nivel, uso, estado financiero y explicación. La propuesta de catálogo pasa revisión y publicación por su caso de uso; importar un diario no publica automáticamente nuevas cuentas ni corrige las veinte naturalezas de gastos. `empresa_id`, actor y permisos provienen del contexto del servidor, nunca de la confianza en una celda.

## 3 Canal de transformación y errores

La importación se compone de etapas con resultados conservados. Los estados funcionales del lote son los del documento 02: `recibido`, `validando`, `con_errores`, `listo`, `confirmado` y `fallido`.

1. **Recepción.** Comprobar permiso y perfil de límites, formato y tamaño; calcular hash del archivo y guardar objeto privado inmutable.
2. **Extracción.** Leer solo estructuras admitidas dentro de los límites de expansión, hojas, celdas, filas y tiempo; generar registros con hoja/fila y contenido original.
3. **Normalización.** Interpretar campos con reglas del formato y producir valores canónicos o errores; no inferir silenciosamente importes o fechas ambiguos.
4. **Agrupación.** Reunir líneas por identificador externo y fuente; exigir cabecera coherente entre todas las líneas del mismo asiento.
5. **Validación.** Comprobar catálogo, períodos, líneas, balance, duplicados y origen; guardar resumen y versión.
6. **Vista previa.** Exponer cantidades, totales y errores sin ocultar filas rechazadas.
7. **Confirmación.** CU-07 vuelve a comprobar el estado actual y llama a `confirmar_lote` para crear todos los borradores o ninguno.
8. **Aprobación.** CU-09 revalida el conjunto y contabiliza de forma atómica; hasta entonces el histórico financiero no cambia.

Los límites se centralizan en `src/config/limites.ts` y se fijan antes de aceptar la fase 02. Deben cubrir bytes de entrada, bytes/celdas expandidos, número de filas/asientos, tiempo y concurrencia. La medida de referencia es el libro de 1,613 líneas; un volumen superior al perfil produce rechazo controlado y no una carga parcial. El diseño de lectura no ejecuta macros, fórmulas, vínculos externos ni contenido del archivo. ExcelJS es el adaptador propuesto para estructura XLSX, sujeto a estas restricciones. [T1]

### 3.1 Normalización monetaria exacta

La representación canónica de dinero es un string decimal sin separador de miles, con punto y dos decimales, por ejemplo `"7008.57"`. Cero válido se representa `"0.00"`. Se rechazan negativos en debe/haber, infinitos, valores no numéricos y escala efectiva mayor que dos. Un literal `12.3400` puede canonizarse a `12.34` porque sus decimales adicionales son ceros; `12.345` exige corrección explícita.

El adaptador XLSX debe preservar el literal monetario de la celda antes de convertirlo a `number`. Si la biblioteca entrega un número JavaScript y no se puede garantizar que conserva exactamente el importe original, el adaptador recuperará el literal XML con un lector acotado o rechazará la celda pidiendo formato textual/CSV. Construir un Decimal desde un `number` que ya perdió precisión no recupera lo perdido. La revisión del XML de las 3,226 celdas numéricas de debe/haber de la fuente no encontró valores con más de dos decimales efectivos. Esta es evidencia del archivo revisado, no una prueba del futuro adaptador. [F3; T1, T2]

Las fechas del formato inicial son texto ISO. El soporte de fechas seriales Excel requiere otra regla explícita que considere el sistema de fechas del libro; no se adivinan `01/02/2026` ni conversiones horarias. Una celda vacía no equivale a cero salvo que la especificación del campo lo admita expresamente.

### 3.2 Datos normalizados y error de fila

El modelo interno de una línea contiene identificador externo de asiento, fecha contable, código de cuenta, debe/haber decimal, concepto y referencia de hoja/fila. La cabecera normalizada agrupa líneas y conserva fuente, moneda y origen. Los contratos públicos y sus nombres definitivos están en [10 Contratos](10_CONTRATOS_Y_CASOS_DE_USO.md); esta estructura describe el contenido, no un segundo endpoint.

Un error de importación incluye lote, versión, hoja, fila, columna, código, mensaje, valor original acotado y severidad. Códigos internos sugeridos: `FECHA_INVALIDA`, `CUENTA_NO_PUBLICADA`, `ESCALA_MONETARIA`, `DOBLE_LADO`, `ASIENTO_DESBALANCEADO`, `CABECERA_INCONSISTENTE`, `PERIODO_CERRADO`, `DUPLICADO_ORIGEN` y `FORMULA_NO_ADMITIDA`. El catálogo de errores se traduce al contrato común del documento 10.

Normalizar espacios o un alias de encabezado permitido se registra como transformación. Cambiar importe, cuenta o fecha de negocio requiere decisión explícita y versión; no se presenta como una limpieza tipográfica. Un nuevo archivo genera un lote nuevo vinculado.

## 4 Duplicados, persistencia y reintentos

Hay tres controles complementarios:

| Control | Qué detecta | Límite |
| --- | --- | --- |
| Hash del original | Archivo idéntico | Cambiar empaquetado o contenido accesorio puede cambiar el hash |
| Identificador normalizado de fuente/asiento | Mismo registro de origen aunque cambie nombre de archivo | La fuente y su ámbito deben permanecer estables |
| Clave de idempotencia + hash canónico de operación | Repetición de la misma solicitud | Misma clave con contenido distinto se rechaza |

El hash canónico se calcula con orden estable de campos/líneas, fechas normalizadas e importes como strings. El nombre del archivo no define por sí solo la fuente: usarlo permitiría que renombrar una copia evitara el control de duplicados. Dos asientos económicamente parecidos con identificadores genuinamente distintos se muestran para revisión, no se eliminan automáticamente.

`confirmar_lote` toma el conjunto completo, versión esperada y clave. Bajo los bloqueos definidos en 08 —empresa, períodos en orden estable y recurso— vuelve a comprobar permisos, estado y referencias. La transacción crea cabeceras, líneas, relación de idempotencia y auditoría; una excepción revierte todo. Los asientos quedan en borrador y pueden aprobarse en conjunto mediante `aprobar_asientos`, que realiza la validación final y contabilización en la misma transacción.

Los borradores abandonados pueden descartarse mediante CU-08 y una RPC autorizada, con versión y motivo. Se conservan registros, líneas, identificadores de origen y marca de actor/fecha; no se borran para permitir una reimportación inadvertida. Un descartado no es editable, aprobable ni pendiente bloqueante de cierre; un contabilizado requiere reversión.

Storage y PostgreSQL no comparten una transacción global. El objeto se guarda primero y se registra en el lote; si la confirmación falla, el archivo permanece asociado al estado fallido o a una tarea de limpieza. La recuperación inspecciona referencias antes de eliminar huérfanos y usa la API de Storage, sin borrar directamente sus metadatos SQL. [T3]

## 5 Núcleo decimal y contratos de cálculo

`src/lib/decimal.ts` define un constructor decimal de configuración fija para P-CARLITOS-1: 40 dígitos y `ROUND_HALF_UP`. Ningún servicio cambia una configuración global según el usuario. Otra política obtiene un constructor compatible explícito; compartir configuración inmutable no comparte sesión ni empresa.

Los repositorios solicitan a SQL importes convertidos a texto **antes de serializar JSON**. Es demasiado tarde convertir un JSON number ya parseado a string. El servicio recibe valores canónicos y devuelve strings; solo el adaptador del gráfico convierte una copia al número visual necesario. [T2, T4]

Cada cálculo recibe un conjunto de entradas y un contexto que incluye empresa/origen, moneda, intervalo/corte, revisión, catálogo, política y fórmula. Devuelve resultados con estado, unidad, valor o ausencia, operandos y advertencias. Por ejemplo, la razón corriente de Alfa conserva `740000.00`, `400000.00`, resultado `1.85`, unidad veces, corte 2025 y fuente del caso. La fórmula no consulta Supabase ni decide acceso.

## 6 Agregación histórica y estados

El repositorio captura saldos y revisión en una lectura coherente. Para operaciones de publicación puede usar una consulta/RPC que materialice el conjunto con su versión. El motor no encadena consultas independientes que puedan mezclar cuentas antes y después de una aprobación concurrente.

El procesamiento sigue esta secuencia:

1. Seleccionar solo asientos contabilizados de la empresa, incluyendo originales y reversiones.
2. Obtener por cuenta saldo anterior al inicio, débitos/créditos del intervalo y movimientos hasta el corte.
3. Verificar partida doble del universo y aplicar clasificación de cuentas y correctoras de la versión publicada.
4. Generar comprobación y tres estados con las RCF-09 a RCF-11.
5. Conciliar resultado entre resultados/patrimonio y ecuación activo-pasivo-patrimonio.
6. Construir operandos de indicadores y ejecutar solo las fórmulas con datos suficientes.
7. Preparar snapshot y verificar revisión antes de publicar; si cambió, recalcular o etiquetar la revisión anterior.

Las series mensuales se forman sumando movimientos dentro de cada mes. Restar acumulados se admite únicamente si están disponibles bases homogéneas y el reinicio de ejercicio se trata correctamente; el diario es preferible porque evita esa ambigüedad. Un mes sin registros solo equivale a flujo cero cuando existe cobertura declarada para él. Si la fuente no cubre ese mes, se conserva dato faltante en los metadatos de cobertura de la ejecución.

La clasificación debe separar magnitud de saldo y signo de presentación. Los activos correctores reducen activos; los retiros reducen patrimonio; la utilidad acumulada no se añade dos veces por ausencia de cierre anual. Las discrepancias de capital de la hoja de patrimonio se mantienen como hallazgo de origen y se resuelven desde movimientos conciliados.

## 7 Indicadores y comparaciones

`catalogo-indicadores.ts` define ID, versión, operandos requeridos, fórmula, unidad, política de denominador y explicación. `razones.ts` evalúa la definición con los datos normalizados. El catálogo no contiene cifras de una empresa ni una interpretación favorable universal.

Antes de dividir, se comprueba presencia de operandos y política del denominador. Faltantes producen `datos_insuficientes`; cero produce `no_calculable`; aproximaciones producen valor con advertencia. La interfaz puede mostrar algunos indicadores aunque otros no se calculen. Una exportación conserva las mismas advertencias.

Horizontal y vertical reutilizan las reglas del documento 04. El motor valida duración, moneda, rubros y base temporal antes de comparar. El caso Alfa, que no aporta período anterior, permite razones de 2025 pero no una comparación horizontal inventada. La referencia de industria se guarda con fuente, fecha y condición ficticia. Los casos de prueba verifican resultados monetarios exactos y razones bajo redondeo explícito; no utilizan tolerancias para ocultar diferencias contables.

## 8 Presupuesto y pronóstico preliminar

El servicio de presupuesto valida versión, meses, rubros y separación devengado/efectivo. La comparación recibe explícitamente una versión de plan y una revisión histórica, no «el último presupuesto» de manera implícita. La aprobación e inmutabilidad pertenecen a los casos CU-14 y CU-15; el servicio puro no decide quién aprueba.

El pronóstico inicial admite:

| Método | Entrada y operación | Faltantes y trazabilidad |
| --- | --- | --- |
| Promedio móvil 3 | Media de tres flujos mensuales anteriores | Rechaza ventana incompleta; si se aplica recursivamente, identifica meses estimados usados |
| Crecimiento explícito | Base comparable × `(1 + tasa)` | Declara base mensual o mismo mes de año anterior y periodicidad de la tasa |

Como ejemplo de una **decisión de escenario**, si se selecciona enero de 2026 y crecimiento de 7.5% para enero de 2027, el cálculo es `20,441.40 × 1.075 = 21,974.505`, presentado **21,974.51** con HALF_UP. Esto ilustra una base correcta y un supuesto elegido; no afirma que 7.5% haya sido una política configurada en el archivo original. El valor original 510,518.79 se conserva únicamente como evidencia del patrón incorrecto identificado. [F3]

`evaluar-pronostico.ts` separa entrenamiento y meses posteriores reservados. No utiliza datos del futuro de cada predicción para ajustar sus parámetros. MAE se calcula sobre pares observados/pronosticados válidos; se devuelve cantidad de pares, intervalo y faltantes. Escenarios favorable/adverso cambian supuestos versionados sin probabilidades inventadas. Las vistas parciales de fase 04 se etiquetan como sensibilidad o pronóstico preliminar.

## 9 Proyección integrada por movimientos

CU-18 captura cierre base, revisión, escenario, presupuesto relacionado, horizonte, calendarios y supuestos. Si el corte es octubre de 2026 y el horizonte inicia enero de 2027, primero construye y conserva el puente noviembre–diciembre. Cada mes consume el saldo final del anterior y produce movimientos en `movimientos_proyectados`, separados de `asientos` históricos.

| Evento estimado | Efecto mínimo que debe representar |
| --- | --- |
| Venta y cobro | Ingreso con efectivo o cuenta por cobrar; el cobro posterior cancela cartera y no vuelve a generar ingreso |
| Compra y pago | Inventario/activo/gasto según clasificación y efectivo o cuenta por pagar; el pago posterior cancela obligación |
| Consumo de inventario | Costo de ventas contra inventario |
| Gasto y depreciación | Gasto devengado y su contrapartida; depreciación no genera pago de caja |
| Inversión | Activo y efectivo/obligación, según calendario |
| Deuda | Desembolso, principal e intereses separados |
| Aportes y retiros | Patrimonio y efectivo, separados del gasto operativo |
| Impuestos del escenario | Solo con tratamiento y supuesto explícitos; nunca aplicar la tasa académica de Alfa por defecto |

Se calculan partidas con precisión decimal y se redondean a centavos al formar movimientos. Las distribuciones conservan el total mediante la regla de residuo de RCF-07. Después se verifican débitos/créditos y puentes de efectivo, inventario, deuda y patrimonio, así como activo igual a pasivo más patrimonio.

Un faltante de cobros, pagos o puente impide etiquetar los tres estados como completos. Un déficit de efectivo se informa para revisar financiación; no genera un préstamo automáticamente. Los balances no se fuerzan mediante una cuenta de ajuste. Las entradas y resultados congelados permiten repetir la ejecución aun si luego cambia el escenario.

## 10 Modelo de reporte y verificación prevista

`preparar-reporte.ts` recibe la ejecución, nunca vuelve a consultar «datos actuales» durante la exportación. Produce secciones, tablas, unidades, cifras y advertencias que reutilizan pantalla, PDF y XLSX. Los adaptadores de archivo solo aplican formato.

La captura de entradas se obtiene desde la base mediante referencias y parámetros autorizados. No se publican totales remitidos por el navegador como si fueran resultados del motor. El controlador recompone los resultados con la versión de fórmula/política capturada antes de mostrarlos o emitirlos; un `resultados_json` persistido es, como máximo, una caché verificable. La implementación inicial puede omitir esa caché. La descarga se genera desde esa misma captura y versión, y no entrega bytes de Storage solo porque una llamada de usuario haya registrado un estado o hash. El contrato 10 define esta frontera de autoridad.

Los campos textuales de origen se escriben como texto, no como fórmulas. La exportación XLSX conserva valores monetarios exactos: solo usa una celda numérica si la conversión de ida y vuelta mantiene el importe y la precisión admitida; en valores que excedan esa garantía usa texto decimal identificado. El PDF muestra corte, origen y notas de política, con saltos de página comprobables. [T1]

La validación futura cubrirá importación válida/errónea, idempotencia, concurrencia, dinero grande y escala, borrador desbalanceado, conciliación histórica, razones no calculables y proyección sin puente. Los casos y cifras están centralizados en el documento 18; las ejecuciones reales se registrarán en [20 Registro de validación](../validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md). La revisión de archivos fuente efectuada hasta ahora no acredita ejecución de este diseño.

## 11 Fuentes

- **F3:** `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`: `CATALOGO!A1:I80`, `DIARIO!A1:K1614`, `ESTADO_RESULTADOS!C26`, `RESUMEN_MENSUAL!D26`, `PRONOSTICO_2027!D2`; XML de importes H/I de la hoja DIARIO.
- **F4:** `Caso Analisis Financiero Manufacturas Alfa_2025(2).docx`, estados y supuestos de 2025.
- **T1:** [ExcelJS — proyecto y documentación oficial](https://github.com/exceljs/exceljs).
- **T2:** [decimal.js — API y precisión](https://mikemcl.github.io/decimal.js/).
- **T3:** [Supabase — esquema de Storage y operaciones sobre objetos](https://supabase.com/docs/guides/storage/schema/design).
- **T4:** [PostgreSQL — tipos numéricos exactos](https://www.postgresql.org/docs/current/datatype-numeric.html).

**Volver:** [Índice documental](../00_INDICE_Y_PLAN_DOCUMENTAL.md).
