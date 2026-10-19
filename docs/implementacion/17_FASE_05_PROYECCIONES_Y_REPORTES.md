# Fase 05 · Proyecciones integradas, reportes y cierre de entrega

**Proyecto:** Carlitos Finanzas. **Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026.  
**Estado:** especificación de ejecución desarrollada; implementación y pruebas de aplicación pendientes.

## 1. Objetivo y resultado observable

Completar el alcance financiero previsto mediante movimientos futuros que produzcan resultados, situación financiera y cambios en patrimonio conciliados; emitir reportes PDF/XLSX reproducibles; y demostrar cierre, reapertura y recuperación del entorno de prueba.

El usuario podrá elegir una ejecución, entender sus supuestos y descargar la misma versión de datos que está consultando. La ejecución proyectada conservará la distinción entre cierre histórico simulado, meses estimados para completar un puente y horizonte futuro. Si faltan entradas necesarias, presentará el faltante y no publicará un balance completo como si estuviera conciliado.

La seguridad, precisión y auditoría vienen de las fases anteriores. Esta fase integra sus pruebas en recorridos de cierre, exportación y restauración; no inicia esos controles desde cero.

## 2. Requisitos, reglas y contratos

| Referencia | Compromiso |
| --- | --- |
| RF-20 | Movimientos futuros y tres estados proyectados conciliados |
| RF-21 | Emisión y descarga autorizada de PDF/XLSX |
| RF-22 | Cierre y reapertura con motivo, revisión y snapshot |
| RF-23, RF-24 | Auditoría y reproducción integral de cálculos y archivos |
| RNF-01–RNF-08 | Integración de los requisitos no funcionales en la entrega |
| RCF-03–RCF-11, RCF-17–RCF-20 | Partida doble, tiempo, cierre, precisión, estados y planificación integrada |
| CU-18–CU-23 | Proyección, emisión, descarga, cierre, reapertura y auditoría |

Los contratos del [documento 10](../tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md) y las reglas del [documento 04](../negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md) gobiernan la entrega. La [matriz 19](../validacion_y_entrega/19_TRAZABILIDAD_Y_ENTREGABLES.md) consolidará el alcance realmente implementado.

## 3. Dependencias y datos indispensables

Se requieren estados históricos conciliados de [fase 03](15_FASE_03_ESTADOS_Y_ANALISIS.md), versiones de escenarios de [fase 04](16_FASE_04_PRESUPUESTOS_Y_ESCENARIOS.md) y operaciones contables seguras de fase 02. La ejecución integrada recibirá un cierre inicial identificado y los siguientes grupos de datos:

| Grupo | Qué permite calcular |
| --- | --- |
| Ventas y reconocimiento de costos/gastos | Resultado devengado de cada mes |
| Cobros y saldos de clientes | Efectivo y cuentas por cobrar |
| Compras, consumo de inventario y pagos | Existencias, proveedores y efectivo |
| Activo fijo, inversión y depreciación | Saldo neto del activo y gasto sin salida de caja |
| Deuda, amortización e intereses | Saldos de préstamos y efectos de caja/resultados separados |
| Aportes y retiros | Cambios patrimoniales y caja sin confundirlos con ingresos/gastos |
| Calendario y cierre de apertura | Continuidad entre meses y corte final |

Para 2027 desde el corte disponible de octubre de 2026, se exige un **puente explícito de noviembre y diciembre de 2026**. Puede estar formado por estimaciones documentadas y conservará esa condición. No basta con repetir octubre como noviembre y diciembre sin explicar el método ni los demás movimientos.

## 4. Construcción de movimientos futuros

El motor transformará las entradas en movimientos proyectados balanceados por período, persistidos en tablas separadas del diario histórico. A partir de ellos se obtendrán saldos iniciales y finales de efectivo, clientes, inventarios, equipo, proveedores, deuda y patrimonio, además del resultado mensual.

Cada mes validará igualdad de debe y haber de los movimientos previstos, continuidad de los saldos entre períodos y `activo = pasivo + patrimonio`. El patrimonio conciliará apertura, aportes, resultado y retiros. Una diferencia debe poder localizarse en sus entradas y movimientos; no se creará una cuenta artificial para absorberla ni se ajustará efectivo sin una operación económica definida.

La ejecución conservará versión del escenario, cierre inicial, puente, política, revisiones, parámetros y resultados. Cambiar un supuesto genera una nueva versión del escenario y, al calcularla, una nueva ejecución. Una ejecución anterior permanece consultable y no altera el histórico ni una emisión anterior.

El fixture integrado FT-05 utilizará los saldos iniciales y nueve movimientos del mes de FT-02 como movimientos futuros, separados del diario histórico. Se esperan resultado antes de impuestos **1,800.00**, efectivo **7,800.00** y balance **20,300.00 = 9,000.00 + 11,300.00**, según el [plan de pruebas](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md). Esta expectativa demuestra integración en un caso controlado; no atribuye esas cifras a la proyección anual de Carlitos.

## 5. Emisión y descarga de reportes

CU-19 preparará el reporte desde una ejecución o snapshot identificado. El archivo incluirá empresa, moneda, período, corte, origen, versión, política, supuestos y condiciones de datos incompletos relevantes. PDF y XLSX compartirán los mismos totales, filtros y revisiones que la pantalla.

El estado del reporte será `pendiente → generando → listo/fallido`. Solo el estado listo podrá descargarse por CU-20. La descarga volverá a comprobar identidad, membresía y permiso sobre ese reporte; conocer su identificador o una ruta de Storage no constituye autorización.

La generación se implementará en el runtime Node de Next.js mediante los adaptadores de XLSX y PDF definidos en la arquitectura. Los archivos se almacenarán de forma privada e inmutable. La transición a listo deberá ocurrir después de verificar que existe el objeto esperado; un fallo posterior tendrá tratamiento recuperable y trazable. Se reutilizará la estrategia de compensación del documento 12, porque guardar objetos y modificar PostgreSQL no es una transacción conjunta.

La revisión visual cubrirá reportes con varias páginas, cifras negativas, nombres extensos, encabezados repetidos y tablas legibles. Los importes exportados conservarán el valor del snapshot; cualquier conversión de formato que pudiera perder precisión deberá corregirse antes de aceptar la emisión.

## 6. Cierre y reapertura

`cerrar_periodo` verificará permiso, estado, revisión esperada, conciliación e incidencias pendientes según política. En una sola transacción capturará el cierre y bloqueará nuevas mutaciones. `reabrir_periodo` exigirá permiso y motivo, conservará el cierre anterior y creará una revisión nueva.

Todas las operaciones que afecten el período respetarán el mismo orden de bloqueos: empresa, períodos ordenados y recurso. La carrera entre aprobación de asientos y cierre se resolverá serializando las operaciones y volviendo a comprobar el estado después de adquirir los bloqueos. El resultado no dependerá de que el botón de la interfaz estuviera habilitado al abrir la pantalla.

El cierre del MVP congela la revisión del período y conserva su snapshot. **No genera automáticamente asientos de cierre anual.** Un futuro proceso de cierre contable anual necesitará otra política para evitar duplicar utilidades ya transferidas.

Una reapertura no reemplaza reportes ya emitidos. La aplicación permitirá reconocer que se emitieron sobre una revisión anterior y generar nuevos resultados cuando corresponda.

## 7. Tareas y responsables

| Trabajo | Responsable principal | Revisión |
| --- | --- | --- |
| Completar entradas, puente y reglas de movimientos futuros | C | B |
| Crear persistencia de proyección y snapshots con revisiones | B | C |
| Implementar motor integrado y conciliaciones mensuales | C | B |
| Construir historial de ejecuciones y tres estados proyectados | A | C |
| Implementar preparación, generación y descarga de reportes | A y C | B |
| Implementar cierre/reapertura y sus RPC | B | C |
| Ejecutar concurrencia, permisos y fallos de Storage/DB | B | C |
| Ensayar respaldo y restauración en otra instancia local | B | A y C |
| Actualizar manual, guion, trazabilidad y acta de entrega | A y C | B |

## 8. Archivos, rutas y operaciones

| Ubicación prevista | Responsabilidad |
| --- | --- |
| `src/app/(privado)/proyecciones/page.tsx` | Historial de ejecuciones |
| `src/app/(privado)/proyecciones/[id]/{resultados,balance,patrimonio}/page.tsx` | Una carpeta y pantalla por estado proyectado |
| `src/app/(privado)/reportes/page.tsx` y `[id]/page.tsx` | Solicitud, estado y consulta de emisiones |
| `src/app/api/reportes/[id]/archivo/route.ts` | Descarga autorizada del archivo listo |
| `src/app/(privado)/periodos/[id]/cierre/page.tsx` | Conciliación, cierre y reapertura con motivo |
| `src/controladores/escenarios.controller.ts`, `reportes.controller.ts`, `periodos.controller.ts` | CU-18–CU-22 según contratos vigentes |
| `src/servicios/proyecciones/proyectar-movimientos.ts` | Generación y conciliación de movimientos futuros |
| `src/servicios/reportes/preparar-reporte.ts` | Modelo único de salida desde snapshot |
| `src/lib/excel/exportar-reporte.ts`, `src/lib/pdf/exportar-reporte.ts` | Adaptadores de archivo |
| `supabase/migrations/`, `supabase/tests/` | Persistencia, RPC, acceso y verificación SQL |

Las referencias de archivos indican responsabilidades previstas y se completan con el [árbol del documento 06](../tecnico/06_DIRECTORIOS_Y_CONVENCIONES.md). Las firmas nuevas conservarán los contratos públicos del documento 10; no se implementará otro motor de cálculo dentro del generador de reportes.

## 9. Entregables y aceptación

| Entregable | Criterio observable |
| --- | --- |
| Proyección integrada | Cada mes concilia, conserva movimientos y no modifica el diario histórico |
| Puente temporal | Noviembre y diciembre de 2026 identificados cuando sean necesarios para 2027 |
| Tres estados futuros | Resultados, situación y patrimonio comparten revisión y política |
| Emisiones PDF/XLSX | Archivos legibles, autorizados y coincidentes con el snapshot |
| Cierre y reapertura | Bloqueo efectivo, motivo, auditoría y conservación de revisiones |
| Recuperación | Entorno restaurado con datos, identidades y objetos necesarios comprobados |
| Entrega integral | Manual actualizado, matriz de cobertura, evidencia y pendientes explícitos |

La entrega debe demostrar que entradas insuficientes impiden publicar una proyección completa, que los archivos de otra empresa son inaccesibles y que un fallo en generación no expone un reporte inexistente como listo. Una revisión antigua se conserva con su identidad, sin cambiar sus cifras para hacerla coincidir con el presente.

## 10. Pruebas y evidencia exigida

Se ejecutarán **PR-29–PR-34**, el tramo de cierre concurrente de **PR-16**, la reproducción de emisión de **PR-25** y los casos transversales **PR-35–PR-40** que corresponden a la versión completa. Los casos de acceso y cálculos afectados se repetirán solo para comprobar que la integración mantiene esas invariantes. Todos figuran actualmente como pendientes en el [plan 18](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md).

El ensayo de recuperación partirá de una instancia de pruebas con datos y objetos conocidos. Se documentará qué contiene cada respaldo, se restaurará en otra instancia local y se comprobarán identidades/membresías, políticas, conteos, totales y acceso a archivos. Reconstruir migraciones sin recuperar datos no sustituye esta prueba. La estrategia y los comandos concretos se mantienen en [operación](../tecnico/12_ENTORNO_LOCAL_Y_OPERACION.md).

La evidencia incluirá identificadores de ejecución y cierre, versión de código y migraciones, parámetros, saldos mensuales, archivos generados, resultados de pruebas y registro de restauración. Las capturas se obtendrán de la versión implementada cuando exista.

## 11. Definición de terminado y acta de entrega

La fase termina cuando el alcance contratado puede recorrerse por los tres perfiles sin pasos privilegiados ocultos, los controles de integridad y permiso están resueltos y la restauración reproduce los datos declarados. Un balance que no concilia, un acceso cruzado o una emisión con versión incorrecta bloquea la entrega afectada.

El acta final deberá identificar versión candidata, requisitos cubiertos, entregables funcionales/técnicos/documentales, pruebas aprobadas/fallidas/bloqueadas y pendientes aceptados con su impacto. Se actualizarán [trazabilidad](../validacion_y_entrega/19_TRAZABILIDAD_Y_ENTREGABLES.md), [registro real](../validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md) y [manual](../validacion_y_entrega/21_MANUAL_DE_USUARIO_Y_DEMOSTRACION.md).

Las fechas de entrega se ajustarán al avance comprobado. Completar esta documentación no representa haber construido ni probado las funciones descritas.

## 12. Referencias

- `Carlitos_Reporte_Mejorado.docx`: estados proyectados, escenarios, ejemplo de sección 9 y entregables.
- `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx`: cobertura histórica hasta octubre de 2026 y limitaciones de `PRONOSTICO_2027`.
- [Modelo de datos](../tecnico/07_MODELO_DE_DATOS_Y_MIGRACIONES.md), [seguridad](../tecnico/08_AUTENTICACION_PERMISOS_Y_AUDITORIA.md), [motor](../tecnico/11_MOTOR_FINANCIERO_E_IMPORTACIONES.md) y [pruebas](../validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md).
- [ExcelJS](https://github.com/exceljs/exceljs), [pdf-lib](https://pdf-lib.js.org/) y [Supabase: diseño de Storage](https://supabase.com/docs/guides/storage/schema/design).
