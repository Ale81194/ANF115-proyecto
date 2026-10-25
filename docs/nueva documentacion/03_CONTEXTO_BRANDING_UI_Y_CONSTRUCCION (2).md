# Identidad visual e interfaz de Panadería Carlitos

> Actualización 25/10/2026: se conserva la aplicación Next.js App Router existente,
> React/TypeScript y Supabase local. No se crea un proyecto Vite. Los pasos y
> pendientes del 21/10 son antecedentes; la evidencia vigente está en el registro
> 20. Los recursos del ZIP se usan como referencia, no como migración ejecutable.

**Asignatura:** ANF — Análisis Financiero. **Actualización:** 21 de octubre de 2026. **Nombre visible:** Panadería Carlitos | Finanzas.

Este archivo define la identidad y las decisiones de interfaz para construir el sistema de siete módulos. La identidad utiliza una paleta cálida y el símbolo de trigo para acompañar la lectura financiera. Los logos incluidos son una propuesta editable para el proyecto académico; no se presentan como una marca oficial entregada por la empresa.

## Dirección visual

Transmitir cercanía de panadería y claridad financiera mediante crema, café y terracota, superficies limpias, cifras grandes y filtros visibles. Utilizar el isotipo de trigo como firma; reservar patrones e ilustraciones para portadas y estados vacíos. Priorizar lectura y operación sobre adornos. Evitar fotografías ajenas, logotipos de terceros y tipografías descargadas sin licencia.

## Paleta y tokens

| Token | HEX | Uso |
|---|---|---|
| cafe-oscuro | #321B13 | Navegación, marca y títulos. |
| terracota | #A84D2B | Acción primaria y elemento seleccionado. |
| dorado | #D5A66C | Acento, series comparativas y detalles decorativos. |
| crema | #FAF3E9 | Fondo general y zonas de descanso visual. |
| blanco | #FFFFFF | Tarjetas, tablas y formularios. |
| verde | #28785A | Ingresos y estados positivos, acompañados de texto. |
| rojo | #B64232 | Gastos/errores y acciones de anulación, con etiqueta explícita. |
| texto | #2C211D | Cuerpo de lectura. |
| gris | #6F6965 | Información secundaria. |
| borde | #E5D9CD | Separadores y contornos decorativos. |

Los archivos `Paleta/tokens.css` y `tokens.json` contienen la fuente de colores. `paleta.gpl` permite importar la paleta en herramientas compatibles. No asumir que todos los pares tienen contraste suficiente: dorado y borde no sirven como texto pequeño sobre blanco. Conservar un foco visible oscuro y no depender del color para distinguir ingreso, gasto, error o anulación.

Titulares de producto: Georgia / Liberation Serif / serif. Texto de interfaz: Arial / Liberation Sans / sans-serif. Son listas de fallback; no se distribuyen archivos de fuente. Interfaz de escritorio: texto base 14–16 px, títulos 32–38 px, etiquetas 12–14 px, cifras 25–29 px o mayor según espacio. En la aplicación final mantener controles cómodos y ampliación de texto sin recortes. El informe académico conserva su formato propio; no aplicar automáticamente esta tipografía de producto al Word.

Escala de espacio: 4, 8, 12, 16, 24, 32 y 48 px. Controles con radio de 10 px; tarjetas entre 18 y 20 px. Alinear importes a la derecha con números tabulares; formatear USD a dos decimales. Mostrar “No aplica” para porcentaje sin ingresos.

## Logos y archivos de marca

| Recurso | Variantes incluidas | Aplicación |
|---|---|---|
| Isotipo de trigo | Café, terracota y blanco; SVG y PNG | Favicon, avatar de aplicación, encabezados compactos. |
| Logo horizontal | Café y blanco; SVG y PNG | Navegación, cabeceras, portada horizontal. |
| Logo apilado | Café; SVG y PNG | Portadas o composiciones centradas. |
| Favicon | SVG y PNG; ICO complementario | Pestaña del ejemplo y futura aplicación. |
| Patrón | Pan repetido, SVG y PNG | Fondos sutiles fuera de tablas y zonas de lectura. |
| Ilustración vacía | SVG y PNG | Períodos sin movimientos. |
| Iconos | Usuarios, ingresos, gastos, categorías, panel, reportes y seguridad | Navegación y apoyos visuales. |
| Artefactos | Brandboard y portada de proyecto, SVG/PNG; pantallas del ejemplo | Presentación y construcción de interfaz. |

Conservar proporciones y colores. Dejar alrededor del logo un margen mínimo aproximado a una cuarta parte de la altura del isotipo; no colocarlo pegado a bordes. Usar la variante blanca sobre café y la café sobre crema/blanco. Para tamaños menores de 160 px de ancho, preferir isotipo a logotipo completo; no hacer ilegible el subtítulo. Mantener SVG como original editable y PNG como exportación de apoyo. Los SVG con texto pueden variar ligeramente por disponibilidad tipográfica; comprobar en el equipo final antes de imprimir.

## Navegación y pantallas

La barra lateral presenta exactamente: Usuarios, Ingresos, Gastos, Categorías, Panel financiero, Reportes, Seguridad y bitácora. El panel puede ser la página inicial sin alterar ese orden. Los subflujos no crean módulos adicionales.

| Módulo | Pantallas o subflujos necesarios | Componentes |
|---|---|---|
| Usuarios | Inicio/cierre de sesión; listado administrativo; alta; edición/activación; perfil propio | AuthForm, UsersTable, UserForm, RoleBadge. |
| Ingresos | Listado; alta; edición; confirmación de anulación | DateRangeFilter, MovementTable, IncomeForm, VoidDialog. |
| Gastos | Listado; alta; edición; confirmación de anulación | Componentes comunes, ExpenseForm. |
| Categorías | Listado por tipo; alta; edición; desactivación | CategoryTable, CategoryForm, StateBadge. |
| Panel financiero | Resumen del período; comparación; distribución de gastos; recientes | KpiCard, PeriodChart, CategoryBreakdown, RecentMovements. |
| Reportes | Detalle filtrado; diario, mensual y anual; exportación complementaria | ReportFilters, PeriodReportTable, ExportButton. |
| Seguridad y bitácora | Acceso denegado; historial administrativo; detalle de cambio | AccessDenied, AuditTable, AuditDetail. |

La sesión real y la recuperación de contraseña pertenecen a Usuarios con controles transversales de Seguridad. El HTML incluye selección de rol explícitamente simulada, no un login real. No publicar esa selección como control de permisos de producción.

## Comportamiento de interfaz

El período siempre debe ser visible en el panel y en reportes. Las fechas se aplican al día del movimiento; conservar inclusividad y rechazar rango invertido. En el ejemplo se limita la diferencia a 3660 días como las RPC. El filtro de categoría del reporte afecta su propio resultado; no comparar ese subconjunto con totales globales como si fueran equivalentes.

Formulario de movimiento: concepto, monto USD, fecha, categoría compatible y referencia opcional. Mostrar mensajes junto al campo, conservar valores tras error y cerrar solamente después de confirmar el guardado. En producción deshabilitar reenvío durante la solicitud y conservar `solicitud_id` para reintentos; no anunciar éxito antes de respuesta. El ejemplo valida montos, pero la base aplica las reglas definitivas.

La anulación solicita motivo y confirmación; mantiene el registro y lo identifica como anulado. No emplear un botón “Eliminar” para esa operación. La captura y edición de importes positivos no impide que el resultado financiero sea negativo. Las categorías inactivas pueden aparecer como históricas, pero no como opción de nueva captura.

En los listados mostrar estados de carga, vacío, error, acceso restringido y datos disponibles. Diferenciar período sin movimientos de falta de permisos o error de conexión. Tablas de auditoría solo para administrador; no exponer antes/después de usuarios o datos ajenos en errores del cliente.

## Adaptación y accesibilidad

Escritorio: barra lateral fija, contenido flexible, cuatro indicadores y gráficos paralelos cuando exista espacio. En anchos intermedios, pasar a dos indicadores por fila y gráficos apilados. En móvil, menú desplegable, formularios de una columna y tablas dentro de un contenedor desplazable sin desbordar la página. El menú debe cerrarse al elegir una sección y admitir navegación por teclado.

Usar etiquetas asociadas a campos, botones con nombre accesible, enlace para saltar al contenido, foco visible, `aria-current` para sección activa y mensajes de estado legibles. Mantener texto y valores junto a gráficos; no comunicar resultados solo mediante barras o colores. Respetar reducción de movimiento. Probar a 390 px, escritorio, zoom 200 % y navegación por teclado. La verificación automatizada de esta entrega no equivale a una auditoría completa de accesibilidad.

## Ejemplo HTML incluido

Abrir `HTML/index.html` después de extraer todo el ZIP. Utiliza archivos relativos y no depende de CDNs, fuentes web ni servicios de autenticación. Puede conservar datos ficticios en `localStorage` del navegador. No introducir información real en esta demostración. Restablecer desde la consola con `CarlitosDemo.reset()` o eliminar sus datos locales cuando se desee recuperar el caso inicial.

Incluye los siete módulos visuales, formularios de movimientos/categorías/usuarios simulados, anulación, activación, bitácora local, indicadores, filtros, reportes detallados y diarios/mensuales/anuales y descarga CSV del detalle filtrado. No implementa todos los flujos definitivos, por ejemplo edición completa de perfiles/categorías, recuperación de contraseña y administración real de Auth. Las capturas de `Artefactos/Pantallas` son recursos del ejemplo con datos ficticios.

Importes demostrativos iniciales: $12,000 de ingresos, $9,600 de gastos, $2,400 de resultado y 80 %. La vista de empleado utiliza registros propios por $5,500 de ingresos y $4,800 de gastos. La simulación de rol cambia la interfaz, pero puede manipularse desde el navegador: no garantiza seguridad. El CSV protege celdas que comienzan con caracteres de fórmula; es una exportación complementaria y no constituye un archivo Excel nativo.

`Artefactos/resultado_pruebas_html.json` recoge la ejecución de pruebas con Chromium local. Se comprueban indicadores, captura y recálculo, separación simulada por propietario, acceso administrativo, período vacío, categoría de reporte, agregaciones y ausencia de desbordamiento móvil y errores JavaScript. La revisión visual complementa esos resultados.

## Construcción en React y conexión pendiente

1. Conservar Next.js App Router/React/TypeScript y adaptar tokens, logos y componentes; reutilizar recursos locales. No convertir el HTML en evidencia de que la aplicación final ya está implementada.
2. Conectar Supabase Auth y perfil activo; construir inicio/cierre de sesión y estados de carga/expiración. Validar permisos de servidor además de visibilidad de botones.
3. Con la migración aplicada y los tipos reales generados, conectar categorías, ingresos y gastos. Implementar solicitud idempotente y control de revisión.
4. Implementar administración de Auth desde servidor, sin claves privilegiadas en cliente. Conectar perfiles, restricciones y desactivación.
5. Conectar panel/reportes a las RPC invoker; verificar consistencia de filtros, redondeo y privacidad por rol.
6. Conectar bitácora administrativa, agregar estados vacíos/errores y completar subflujos. Verificar teclado, zoom, impresión/exportación y pantallas pequeñas.
7. Ejecutar casos de extremo a extremo con usuarios reales de prueba y datos marcados; documentar resultados y preparar defensa de veinte minutos. Distinguir siempre evidencia real, prototipo y funcionalidad pendiente.

## Skills reutilizables

`Skills/carlitos-brand-ui` conserva tokens, recursos y reglas de los siete módulos para futuras pantallas. `Skills/carlitos-supabase` conserva el contrato del modelo, permisos y precauciones de la migración. Son instrucciones para asistentes, no dependencias del navegador ni código de autorización. Ambos conservan la denominación ANF y el alcance de siete módulos.

Consultar el primer contexto para requisitos académicos y el segundo para el estado remoto y las reglas de base de datos. Ante diferencias, verificar la guía y las instrucciones de la usuaria; no inventar nuevas exigencias tecnológicas.


## Documentos y recursos vigentes

El paquete contiene únicamente el alcance de siete módulos y recursos visuales asociados con él. Los logos principales son isotipos de trigo y versiones horizontal/apilada; las pantallas de `Artefactos/Pantallas` corresponden al ejemplo actual. El Word final se denomina `ANF_Panaderia_Carlitos_Informe_Final.docx` e incorpora las categorías y el catálogo contable de referencia completos.

La base de datos cuenta con cinco tablas operativas, 26 categorías y 12 políticas. El esquema de la planificación sustituida ya no existe. La documentación técnica incluye exclusivamente la instalación del modelo vigente y su evidencia de verificación. Los siguientes pasos de construcción se refieren a la integración de la aplicación y no a crear nuevamente la base del proyecto.
