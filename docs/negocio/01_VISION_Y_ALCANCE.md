# 01 · Visión y alcance

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.  
**Estado:** especificación inicial desarrollada; implementación pendiente.

## 1 Propósito del producto

Carlitos Finanzas será una aplicación para convertir registros contables estructurados en estados financieros, indicadores, presupuestos y proyecciones explicables. Su primera configuración representará a Panadería Carlitos como **empresa académica con datos simulados y moneda USD**. El producto permitirá que un analista prepare información, que un responsable autorice los movimientos y que gerencia consulte resultados y apruebe planes.

El valor esperado consiste en poder responder una pregunta financiera desde su cifra hasta su origen: qué período se midió, cuáles cuentas y movimientos se incluyeron, qué fórmula se aplicó y cuáles supuestos modificaron una proyección. Los documentos de origen describen ocho módulos y tres perfiles; esta propuesta conserva esa base funcional y adopta Next.js y Supabase por elección del proyecto. [F1, F2]

## 2 Problema que debe resolver

Los materiales actuales combinan diario, estados, presupuestos y escenarios en archivos separados. El Excel contiene un diario que cuadra, pero algunas hojas derivadas usan bases temporales ambiguas, presentan componentes patrimoniales inconsistentes o proyectan desde acumulados en lugar de ventas mensuales. La revisión de esos archivos ya fue realizada; el sistema que aplicará los controles todavía debe construirse. [F3]

La aplicación debe resolver cuatro necesidades concretas:

1. **Registrar con control.** Conservar el archivo original, localizar errores y evitar que una carga incompleta o repetida cambie la contabilidad.
2. **Consultar cifras conciliadas.** Derivar resultados, situación financiera y cambios en patrimonio de movimientos autorizados y cuentas clasificadas.
3. **Interpretar con contexto.** Mostrar fórmulas, períodos comparables, aproximaciones y datos faltantes junto a los indicadores.
4. **Planificar con versiones.** Diferenciar lo contabilizado de lo presupuestado y lo estimado, manteniendo supuestos y aprobaciones reproducibles.

Una pantalla visualmente terminada no demuestra por sí sola que estas necesidades estén cubiertas. La aceptación se basará en recorridos completos y cifras verificables, definidos en [03 Requerimientos](03_REQUERIMIENTOS_Y_CRITERIOS_DE_ACEPTACION.md) y [18 Plan de pruebas](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md).

## 3 Personas y beneficio esperado

| Persona | Necesidad principal | Resultado observable |
| --- | --- | --- |
| Analista | Preparar registros, detectar errores y explicar cifras | Puede seguir una cifra del estado hasta las líneas del diario y su archivo de origen |
| Administrador | Mantener acceso, catálogo y períodos, y autorizar registros | Puede aprobar o rechazar una operación válida según sus permisos y consultar su auditoría |
| Gerencia | Comparar resultados y decidir sobre planes | Puede consultar períodos comparables, revisar supuestos y aprobar una versión de presupuesto |
| Equipo de desarrollo y evaluación | Construir y demostrar una solución reproducible | Puede levantar el entorno local, repetir los datos de referencia y asociar requisitos con evidencia |

La matriz detallada de operaciones está en [02 Módulos, usuarios y flujos](02_MODULOS_USUARIOS_Y_FLUJOS.md). Los cargos son perfiles funcionales propuestos; el sistema aplicará permisos específicos y membresías activas.

## 4 Alcance comprometido en esta especificación

El alcance completo se construirá en cinco fases. Abarca acceso, catálogo y períodos; importación y diario; estados históricos y análisis; presupuestos y escenarios; y estados proyectados con reportes.

| Capacidad | Alcance inicial concreto |
| --- | --- |
| Acceso | Inicio de sesión, usuarios, membresías y tres perfiles funcionales |
| Estructura contable | Cuentas jerárquicas, cuentas de movimiento, rubros, naturaleza, vigencia y períodos |
| Ingreso de datos | Archivo XLSX/CSV admitido, vista previa, errores, origen y confirmación a borradores |
| Registro contable | Asientos manuales, validación, aprobación, consulta e inmutabilidad mediante reversión |
| Estados históricos | Comprobación, resultados, situación financiera y cambios en patrimonio |
| Análisis | Liquidez, actividad, endeudamiento, rentabilidad, comparación horizontal y vertical |
| Planificación | Presupuesto mensual de ingresos, costos, gastos y efectivo; versiones y aprobación |
| Pronóstico | Métodos deterministas de promedio móvil y crecimiento explícito, con escenarios y evaluación |
| Proyección integrada | Movimientos futuros separados del diario y tres estados proyectados conciliados |
| Entrega de resultados | Reportes PDF/XLSX, corte y versión visibles, descarga autorizada y conservación de procedencia |
| Control transversal | Auditoría, bloqueo de períodos, cierre/reapertura y reproducción de cálculos |

El **primer MVP demostrable termina con la fase 03**: un analista entra, carga un lote conciliado, lo revisa, un administrador lo aprueba y los tres perfiles autorizados consultan sus efectos en estados e indicadores. Ese hito ya requiere autenticación, integridad y trazabilidad. Las fases 04 y 05 completan la planificación y las proyecciones del alcance descrito. [F1, F2; decisión de esta especificación]

## 5 Límites e ideas futuras

Las ideas siguientes permanecen en el backlog. Incorporarlas exige entradas, criterios de aceptación y una fase aprobada; su mención no añade un compromiso al MVP.

| Idea | Condición para incorporarla |
| --- | --- |
| Flujo de efectivo histórico completo y notas | Definir clasificación de flujos, presentación y datos adicionales |
| Punto de venta y facturación fiscal | Especificar operaciones, inventarios, documentos y obligaciones aplicables |
| Nómina y producción | Disponer de procesos, costos y movimientos operativos detallados |
| Conciliación bancaria | Definir formatos bancarios, reglas de emparejamiento y resolución de diferencias |
| Antigüedad de cartera | Contar con documentos, fechas de vencimiento y cobros identificados |
| Punto de equilibrio | Disponer de volúmenes, precios unitarios y separación de costos fijos/variables |
| Razones de mercado | Incorporar acciones y precios de mercado con fuentes y fechas |
| Gestión comercial de varias empresas | Diseñar contratación, administración y aislamiento de cada organización |
| Integraciones o agentes de IA | Identificar un caso adicional que no cubran los procesos deterministas actuales |

La base incorporará `empresa_id` y membresías desde el inicio. La interfaz inicial puede operar sobre una sola empresa sin construir administración comercial de un SaaS. La delimitación de tres estados y del presupuesto de efectivo responde a este proyecto académico; no constituye una declaración de cumplimiento contable integral. [F2]

## 6 Tratamiento de los materiales recibidos

| Material | Uso previsto | Límite de uso |
| --- | --- | --- |
| Arquitectura y reporte Carlitos | Necesidades, ocho módulos, recorridos y ejemplo financiero | Las decisiones de stack anteriores se sustituyen por la propuesta actual |
| Base contable ampliada | Diario simulado, catálogo por revisar y referencias de conciliación | Las hojas derivadas con errores no se copian como verdad del sistema |
| Caso Manufacturas Alfa | Caso aislado para comprobar el motor de indicadores | Sus estados resumidos no se convierten en un diario inventado de Carlitos |
| Compendio y autoevaluaciones | Definiciones y casos conceptuales | Una respuesta impresa se revisa antes de usarla como resultado esperado |
| Branding | Referencia de identidad visual, navegación y componentes | La demo HTML no acredita funciones implementadas |

Se revisaron nueve adjuntos correspondientes a siete contenidos únicos: las dos copias de Alfa son idénticas entre sí, y ocurre lo mismo con las dos del compendio. La fuente principal del registro seguirá siendo el diario aprobado; los resúmenes se usarán para contrastar. [F3–F7]

## 7 Supuestos y decisiones por ratificar

La propuesta puede comenzar a implementarse con estos supuestos documentados:

- Carlitos utiliza USD, ejercicio calendario y origen simulado en su primera configuración.
- El administrador aprueba asientos y gerencia aprueba presupuestos. Los originales discrepan sobre la segunda responsabilidad; se separan los permisos y se conserva pendiente su ratificación funcional.
- El catálogo se publicará después de revisar naturaleza, rubro y cuentas correctoras. La naturaleza acreedora que aparece en veinte filas de gastos requiere tratamiento documentado.
- Los movimientos de octubre de 2026 fechados el día 28 se rotularán como cierre simulado respecto del 19 de octubre de 2026, fecha documental.
- El cierre inicial congela un período y guarda sus saldos; no genera automáticamente un asiento anual de traslado de resultados.
- Las fechas de entrega se fijarán después de estimar capacidad. La referencia original de tres integrantes y cuatro semanas es una orientación del material, no una garantía de terminación. [F1–F3]

Estos puntos tienen seguimiento en [20 Registro de validación y pendientes](../validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md). Una decisión pendiente no se presentará como acuerdo del docente ni como política empresarial ya aprobada.

## 8 Cómo se medirá el éxito

El proyecto será útil si las cifras se concilian exactamente a centavos, los errores se explican sin perder procedencia y cada operación queda limitada al usuario y empresa autorizados. El diario completo de referencia deberá recuperar 477 asientos y 1,613 líneas, con debe y haber de USD 2,161,744.81 cada uno, una vez aplicado un catálogo revisado y ejecutado el flujo autorizado. Esa cifra es una expectativa de prueba basada en auditoría de la fuente, no un resultado de importación en una aplicación existente. [F3]

La demostración final debe añadir presupuesto aprobado, escenario con supuestos visibles, proyección mensual balanceada y archivos que coincidan con la versión mostrada. El alcance documental se entrega en este paquete; el estado funcional seguirá siendo pendiente hasta construir y comprobar cada recorrido. La relación entre requisitos, fases, productos y evidencia se mantiene en [19 Trazabilidad y entregables](../validacion_y_entrega/19_TRAZABILIDAD_Y_ENTREGABLES.md).

## 9 Fuentes y continuidad

- **F1:** `Carlitos_ARQUITECTURA_TECNICA_DETALLADA.docx`, inventario de módulos, roles y plan de trabajo.
- **F2:** `Carlitos_Reporte_Mejorado.docx`, secciones 3, 5–10; alcance, presupuestos y ejemplo reconciliado.
- **F3:** `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`, `LEEME`, `CATALOGO`, `DIARIO` y hojas derivadas; referencias precisas en [04 Reglas](04_REGLAS_CONTABLES_Y_FINANCIERAS.md).
- **F4:** `Caso Analisis Financiero Manufacturas Alfa_2025(2).docx`, estados y supuestos; copia `(3)` idéntica.
- **F5:** `compendio_razones_financieras_u2(1).pdf`, páginas 1–5; copia `(2)` idéntica.
- **F6:** `Branding_Panaderia_Carlitos_COMPLETO.zip`, mapa de pantallas, paleta y demo.
- **F7:** `autoevaluaciones_anf115(1).docx`, conceptos y ejercicios.

**Siguiente lectura:** [02 Módulos, usuarios y flujos](02_MODULOS_USUARIOS_Y_FLUJOS.md). **Volver:** [Índice documental](../00_INDICE_Y_PLAN_DOCUMENTAL.md).
