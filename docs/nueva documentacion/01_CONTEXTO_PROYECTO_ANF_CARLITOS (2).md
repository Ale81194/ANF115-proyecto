# Contexto completo del proyecto de ANF

**Proyecto:** Control de ingresos y gastos de Panadería Carlitos. **Asignatura:** ANF — Análisis Financiero. **Institución:** Universidad de El Salvador, Facultad de Ingeniería y Arquitectura. **Revisión:** 21 de octubre de 2026.

Este documento define el alcance vigente y acompaña al informe de investigación `ANF_Panaderia_Carlitos_Informe_Final.docx`. Por decisión del usuario del 25/10/2026, el desarrollo conserva Next.js App Router, React, TypeScript y Supabase con PostgreSQL local, en lugar de Vite. La elección tecnológica se fundamenta en las indicaciones finales de la guía. El estado remoto del 21/10 descrito abajo es evidencia histórica; la implementación y evidencia local se registran en los documentos 22, 24 y 20 del repositorio.

## Identificación académica

El documento original identifica al docente Lic. Ronald Francisco Hernández Berrios y a Karla Gissell Girón Martínez, Sergio David Hernández García y Jennifer Alexandra Gálvez Rodas como integrantes del grupo Teórico 1. Se conservan esos nombres de la portada proporcionada. La guía establece entrega el 10 de noviembre de 2026 a las 23:59, informe de 30–40 páginas, aplicación y videoexposición de 20 minutos con tres integrantes.

## Problema y propósito

La solución organiza los cobros y pagos representativos de una pequeña panadería de Chalatenango. Una consulta debe poder explicar cuánto se recibió, cuánto se pagó y qué movimientos forman cada total. El problema de diseño consiste en evitar registros duplicados, categorías incompatibles y comparaciones de períodos diferentes.

Pregunta de investigación: ¿Cómo puede un sistema web organizar el registro y la consulta de los ingresos y gastos de Panadería Carlitos para obtener resultados financieros verificables por período?

Objetivo general: desarrollar un sistema web que organice y controle ingresos y gastos y permita verificar sus resultados por período. Los objetivos específicos comprenden analizar el registro, diseñar el modelo relacional, implementar los siete módulos, calcular indicadores, producir reportes y comprobar permisos e integridad.

La investigación es documental y aplicada. Utiliza datos económicos simulados; no se realizaron entrevistas ni se dispuso de comprobantes empresariales verificados en esta etapa. El proyecto no presenta mejoras medidas en la empresa. Sus resultados técnicos se distinguen de los beneficios esperados al utilizar el sistema.

## Módulos obligatorios

| Orden | Módulo | Funciones |
|---|---|---|
| 1 | Usuarios | Inicio/cierre de sesión; registro administrativo; consulta y modificación de perfiles; activación/desactivación; roles. |
| 2 | Ingresos | Captura de concepto, monto, fecha y categoría; consulta, corrección y anulación autorizada. |
| 3 | Gastos | Captura, consulta y corrección de pagos; anulación con motivo; categoría compatible. |
| 4 | Categorías | Alta, consulta, modificación y desactivación; código y tipo estables después de uso. |
| 5 | Panel financiero | Cuatro indicadores, comparación de ingresos/gastos y distribución por categorías. |
| 6 | Reportes | Detalle y agrupación diaria, mensual y anual; filtros por fecha y categoría. |
| 7 | Seguridad y bitácora | Autorización, validación y trazabilidad de altas, cambios y anulaciones. |

Los subflujos pertenecen a estos módulos; no agregan otros a la navegación. El alcance no incluye bancos, transferencias reales ni facturación electrónica. La exportación a PDF o Excel es complementaria. El catálogo contable es un anexo de referencia académica y no se utiliza para capturar movimientos o calcular indicadores.

## Roles

El administrador activo administra perfiles y categorías, consulta el conjunto de movimientos y sus reportes, modifica los registros vigentes autorizados y consulta la bitácora. El empleado activo trabaja con sus propios movimientos y reportes y consulta categorías activas o necesarias para interpretar su historial. No administra cuentas ni categorías ni ve el historial administrativo.

Las cuentas nuevas reciben perfil de empleado inactivo. La autorización se obtiene del perfil vinculado a `auth.uid()`; no de metadatos que el usuario pueda modificar. Una cuenta inactiva no obtiene acceso operativo. Los movimientos se anulan con motivo, conservan su origen y no se borran físicamente por el cliente. Un registro anulado no se reactiva ni se modifica.

## Indicadores y criterios financieros

| Indicador | Regla |
|---|---|
| Ingresos I | Suma de ingresos vigentes autorizados dentro del rango inclusivo. |
| Gastos G | Suma de gastos vigentes con el mismo rango y alcance. |
| Resultado | I − G; puede ser negativo. |
| Porcentaje de gastos | G / I × 100 si I > 0; en otro caso null en la respuesta y “No aplica” en pantalla. |

El registro utiliza cobros y pagos operativos, USD, importes positivos y máximo dos decimales. El resultado no equivale automáticamente a utilidad contable ni saldo bancario. La fecha del movimiento es un día de calendario; los eventos de auditoría incluyen fecha, hora y zona temporal.

Caso de referencia de octubre de 2026: cuatro ingresos de $3,000, $2,500, $3,500 y $3,000; seis gastos de $4,000, $800, $600, $200, $400 y $3,600. Totales: ingresos $12,000; gastos $9,600; resultado $2,400; porcentaje 80 %. Del 1 al 7 de octubre: $5,500, $4,800 y $700, respectivamente. Los importes son simulados y no se cargaron en el proyecto remoto.

## Catálogo operativo completo

| Código | Tipo | Categoría | Aplicación |
|---|---|---|---|
| I01 | ingreso | Ventas de pan dulce | Cobros por pan dulce vendido. |
| I02 | ingreso | Ventas de pan francés | Cobros por pan francés vendido. |
| I03 | ingreso | Ventas de repostería | Cobros por pasteles y otros productos de repostería. |
| I04 | ingreso | Ventas de pan integral | Cobros por productos de panadería integral. |
| I05 | ingreso | Ventas de galletas | Cobros por galletas elaboradas para la venta. |
| I06 | ingreso | Pedidos especiales | Cobros por pedidos identificados como especiales; no duplicar otra venta. |
| G01 | gasto | Ingredientes | Harina, levadura, azúcar, manteca y demás ingredientes pagados. |
| G02 | gasto | Empaques | Bolsas, cajas y otros materiales de empaque pagados. |
| G03 | gasto | Gas de producción | Pagos de gas utilizado por los hornos. |
| G04 | gasto | Energía eléctrica | Pagos del suministro de electricidad. |
| G05 | gasto | Agua | Pagos del servicio de agua. |
| G06 | gasto | Alquiler | Pagos por el uso del local. |
| G07 | gasto | Pagos de personal | Pagos operativos al personal; no constituye un módulo de nómina. |
| G08 | gasto | Transporte | Pagos de entregas y transporte relacionados con la operación. |
| G09 | gasto | Suministros | Artículos operativos y de oficina distintos de ingredientes y empaques. |
| G10 | gasto | Limpieza | Productos y servicios de limpieza. |
| G11 | gasto | Mantenimiento de equipos | Reparación y mantenimiento ordinario de hornos y equipos. |
| G12 | gasto | Mantenimiento del local | Conservación ordinaria de las instalaciones. |
| G13 | gasto | Publicidad | Pagos de publicidad y promoción. |
| G14 | gasto | Telefonía e internet | Pagos de comunicaciones del negocio. |
| G15 | gasto | Comisiones de cobro | Comisiones pagadas por medios de cobro. |
| G16 | gasto | Permisos y tasas | Pagos operativos identificados por permisos o tasas. |
| G17 | gasto | Seguros | Pagos de seguros relacionados con la operación. |
| G18 | gasto | Servicios profesionales | Pagos por servicios profesionales recibidos. |
| G19 | gasto | Uniformes y protección | Pagos por uniformes e implementos de protección. |
| G20 | gasto | Otros gastos operativos | Pagos no comprendidos en otra categoría; exigir concepto específico. |

El catálogo contable completo contiene 47 cuentas: 15 de activo, 8 de pasivo, 5 de patrimonio, 3 de ingresos, 9 de costos y 7 de gastos. Está íntegro en el anexo B del Word y en `Artefactos/Supabase/catalogo_contable_referencia.json`. Los agrupadores de un dígito no cuentan como cuentas de movimiento. No existe una tabla operativa de cuentas en el modelo actual.

## Requisitos funcionales

| Código | Requisito |
|---|---|
| RF01 | Iniciar y cerrar sesión y rechazar acceso no autorizado. |
| RF02 | Registrar, consultar, modificar y desactivar usuarios según rol. |
| RF03 | Administrar categorías y su estado. |
| RF04 | Registrar, consultar y corregir ingresos autorizados. |
| RF05 | Registrar, consultar y corregir gastos autorizados. |
| RF06 | Filtrar fechas y categoría y mostrar el detalle consultado. |
| RF07 | Calcular los cuatro indicadores sobre filtros compatibles. |
| RF08 | Presentar panel y gráficos con período y moneda identificados. |
| RF09 | Generar reportes diarios, mensuales y anuales. |
| RF10 | Aplicar permisos y registrar acciones relevantes. |

Las condiciones de calidad incluyen montos válidos, consultas parametrizadas, control de sesión y perfil, mensajes comprensibles, adaptación a escritorio/móvil, código organizado y respaldo con restauración verificada. Una meta de rendimiento no se presenta como medición ya obtenida.

## Arquitectura y estado técnico

La interfaz utiliza Next.js App Router y React/TypeScript. Supabase Auth gestiona identidades; cinco tablas PostgreSQL conservan perfiles, categorías, ingresos, gastos y bitácora. Panel y reportes consultan una vista con permisos del usuario y funciones de reporte. La gestión administrativa de cuentas utiliza un servicio de servidor que valida al administrador; las credenciales privilegiadas permanecen fuera del navegador.

La base de datos está aplicada y verificada. El esquema de la planificación sustituida fue eliminado por solicitud de la usuaria, sin afectar las cinco tablas vigentes. La última revisión confirmó 26 categorías, 12 políticas, cero usuarios y cero movimientos. El asesor de seguridad no reportó hallazgos. El resultado de la limpieza está documentado en la evidencia técnica.

La instalación inicial reproducible del modelo actual se incluye en `01_crear_modelo_actual.sql`, únicamente para una instancia nueva y vacía. No debe ejecutarse en el proyecto ya configurado. El prototipo HTML utiliza datos locales y no autentica ni conecta con Supabase.

## Evidencia y pendientes

Se conservan 52 comprobaciones locales de PostgreSQL/PGlite y 17 del ejemplo HTML. La revisión remota comprobó estructura, acceso anónimo bloqueado y ausencia de movimientos para sesiones sin perfil activo. Las pruebas locales simulan Auth y no sustituyen una sesión real del servicio.

Pendiente: crear la primera cuenta administradora real, conectar React con Auth y datos, completar la administración de identidades del servidor, ejecutar recorridos por ambos roles, probar concurrencia, medir rendimiento y verificar restauración. Estos pendientes se declaran en el informe para distinguir configuración de base de datos de aplicación integrada.

## Correspondencia con la rúbrica

| Criterio | Peso | Evidencia documental |
|---|---:|---|
| Planteamiento, justificación, objetivos y alcance | 10 % | Secciones 1–5. |
| Investigación y fundamentación | 20 % | Fundamentación 2.5, metodología y fuentes verificables. |
| Diseño, base de datos y arquitectura | 20 % | Siete módulos, cinco entidades, relaciones, diccionario y permisos. |
| Implementación | 10 % | Requisitos y recorridos; la demostración integrada debe completar la evidencia. |
| Cálculos, reportes y visualización | 10 % | Fórmulas, conjunto resuelto, filtros, casos límite y gráfico. |
| Seguridad, integridad y calidad | 10 % | Restricciones, RLS, perfiles y procedimiento de respaldo. |
| Informe y APA 7 en español | 10 % | Estructura, índices, citas, referencias, tablas y anexos. |
| Pruebas, documentación y defensa | 10 % | Manuales, registro de verificación y exposición de 20 minutos. |

Se utiliza la columna de ponderaciones que suma 100. La matriz no anticipa una calificación. La aplicación y la defensa deben demostrar los requisitos que dependen de ejecución y participación del equipo.
