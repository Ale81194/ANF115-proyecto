# Carlitos Finanzas — Índice y plan documental

**Versión documental:** 0.1. **Fecha:** 19 de octubre de 2026. **Idioma:** español.

## 1. Qué contiene este paquete

Este paquete reúne **22 documentos Markdown desarrollados** para planificar y construir Carlitos Finanzas: un índice, cuatro documentos de negocio, ocho técnicos, cinco de implementación y cuatro de validación y entrega. Los documentos distribuyen y concretan la arquitectura acordada; contienen requisitos, reglas, rutas, capas, datos, contratos, tareas, criterios de aceptación y referencias financieras.

La solución prevista utiliza **Next.js App Router, TypeScript y Supabase**, con una carpeta por pantalla dentro de `src/app`, componentes mediante Atomic Design, controladores, servicios de cálculo, repositorios y Supabase local mediante Docker/CLI. El proyecto es un sistema académico de análisis financiero con datos simulados de Carlitos. El contenido funcional se basa en los materiales aportados, con sus incidencias identificadas.

**Estado del producto:** planificación y especificación. La aplicación, las migraciones ejecutables, el despliegue y sus pruebas se construirán por fases. La documentación completa no significa que las funcionalidades estén implementadas. El [registro 20](validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md) distingue la revisión de fuentes ya realizada de las pruebas de aplicación pendientes.

Para incorporar el paquete al repositorio, extraer el ZIP y colocar su carpeta `docs/` en la raíz del proyecto. Este archivo es el punto de entrada; el futuro README del repositorio podrá enlazarlo. El ZIP contiene los 22 MD, con enlaces relativos entre ellos. Los adjuntos originales y la aplicación no se incluyen en esta entrega documental.

## 2. Organización por área

| Área | MD | Pregunta que resuelve | Lectores principales |
| --- | ---: | --- | --- |
| Índice y coordinación | 1 | Qué existe, cómo se relaciona y en qué estado está | Todo el equipo |
| Negocio y finanzas | 4 | Qué se necesita, para quién y qué debe ser correcto | Analista, responsable del negocio, docente y equipo |
| Técnica | 8 | Cómo se organiza, protege, construye y opera | Desarrolladores y revisores técnicos |
| Implementación | 5 | Qué se construye en cada fase y cómo se acepta | Equipo y responsable de seguimiento |
| Validación y entrega | 4 | Cómo se verifica, demuestra y utiliza lo entregado | Equipo, evaluadores y usuarios |
| **Total** | **22** | | |

Las ideas del negocio se mantienen en el documento 01; los compromisos verificables en el 03. Las reglas financieras están en el 04 porque las necesitan tanto quien programa como quien valida las cifras. Los entregables específicos pertenecen a cada fase y se consolidan en el 19. Las evidencias reales se registran exclusivamente en el 20.

## 3. Catálogo completo y enlaces

### Índice

| Documento | Contenido y resultado |
| --- | --- |
| [00. Índice y plan documental](00_INDICE_Y_PLAN_DOCUMENTAL.md) | Mapa del paquete, orden de lectura, responsables, estados y fuentes |

### Negocio y finanzas

| Documento | Contenido y resultado |
| --- | --- |
| [01. Visión y alcance](negocio/01_VISION_Y_ALCANCE.md) | Problema, objetivos, MVP, alcance completo, supuestos, exclusiones e ideas futuras |
| [02. Módulos, usuarios y flujos](negocio/02_MODULOS_USUARIOS_Y_FLUJOS.md) | Ocho módulos, matriz de permisos propuesta, recorridos y estados de negocio |
| [03. Requerimientos y criterios de aceptación](negocio/03_REQUERIMIENTOS_Y_CRITERIOS_DE_ACEPTACION.md) | 24 requisitos funcionales y ocho no funcionales con comportamiento verificable |
| [04. Reglas contables y financieras](negocio/04_REGLAS_CONTABLES_Y_FINANCIERAS.md) | 20 reglas identificadas: contabilidad, períodos, fórmulas, faltantes, precisión, presupuesto y proyección |

### Técnica

| Documento | Contenido y resultado |
| --- | --- |
| [05. Arquitectura y stack](tecnico/05_ARQUITECTURA_Y_STACK.md) | Bloques, límites de capas, flujos, decisiones técnicas y justificación |
| [06. Directorios y convenciones](tecnico/06_DIRECTORIOS_Y_CONVENCIONES.md) | Árbol de repositorio, carpeta por pantalla, rutas centralizadas y ubicación del código |
| [07. Modelo de datos y migraciones](tecnico/07_MODELO_DE_DATOS_Y_MIGRACIONES.md) | Entidades, relaciones, restricciones, índices, versiones, migraciones y semillas |
| [08. Autenticación, permisos y auditoría](tecnico/08_AUTENTICACION_PERMISOS_Y_AUDITORIA.md) | Sesiones por solicitud, membresías, RLS, RPC, permisos, concurrencia y eventos |
| [09. Pantallas y Atomic Design](tecnico/09_PANTALLAS_Y_ATOMIC_DESIGN.md) | Mapa de URLs, experiencia por pantalla, componentes, estados visuales y accesibilidad |
| [10. Contratos y casos de uso](tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md) | 23 casos de uso; entradas, salidas, errores; Server Actions, HTTP y RPC |
| [11. Motor financiero e importaciones](tecnico/11_MOTOR_FINANCIERO_E_IMPORTACIONES.md) | Extracción, normalización, validación, cálculo, snapshots, proyección y trazabilidad |
| [12. Entorno local y operación](tecnico/12_ENTORNO_LOCAL_Y_OPERACION.md) | Preparación, Docker y Supabase CLI, configuración, ejecución, respaldo y recuperación |

### Implementación

| Documento | Resultado observable de la fase |
| --- | --- |
| [13. Fase 01 — Base y acceso](implementacion/13_FASE_01_BASE_Y_ACCESO.md) | Acceder con un rol y consultar catálogo y períodos autorizados |
| [14. Fase 02 — Importación y diario](implementacion/14_FASE_02_IMPORTACION_Y_DIARIO.md) | Cargar, validar, confirmar borradores y contabilizar con procedencia e integridad |
| [15. Fase 03 — Estados y análisis](implementacion/15_FASE_03_ESTADOS_Y_ANALISIS.md) | Generar estados conciliados, indicadores y dashboard; primer MVP histórico completo |
| [16. Fase 04 — Presupuestos y escenarios](implementacion/16_FASE_04_PRESUPUESTOS_Y_ESCENARIOS.md) | Preparar y aprobar planes versionados, comparar y evaluar métodos de pronóstico |
| [17. Fase 05 — Proyecciones y reportes](implementacion/17_FASE_05_PROYECCIONES_Y_REPORTES.md) | Obtener estados futuros conciliados, emitir archivos, cerrar/reabrir y demostrar recuperación |

### Validación y entrega

| Documento | Contenido y resultado |
| --- | --- |
| [18. Plan de pruebas y datos de referencia](validacion_y_entrega/18_PLAN_DE_PRUEBAS_Y_DATOS_DE_REFERENCIA.md) | 40 casos previstos y cinco familias de fixtures, con resultados financieros esperados |
| [19. Trazabilidad y entregables](validacion_y_entrega/19_TRAZABILIDAD_Y_ENTREGABLES.md) | Requisito → regla → contrato → fase → prueba → evidencia; composición de la entrega |
| [20. Registro de validación y pendientes](validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md) | Revisión real de fuentes, hallazgos, hashes, estado de pruebas y decisiones pendientes |
| [21. Manual de usuario y demostración](validacion_y_entrega/21_MANUAL_DE_USUARIO_Y_DEMOSTRACION.md) | Tareas por perfil, interpretación, errores y guion previsto; se contrastará con la interfaz implementada |

Los nombres mantienen numeración global 00–21 para identificar un MD sin ambigüedad. No se crean 22 carpetas de documentación: los archivos se agrupan por responsabilidad. Las pantallas de la aplicación sí conservan su carpeta propia bajo `src/app`, conforme a los documentos 06 y 09.

## 4. Orden de lectura y uso

**Para entender el negocio:** 01 → 02 → 03 → 04. Permite revisar qué se promete antes de discutir tablas o librerías. El registro 20 ayuda a distinguir datos confiables, errores de fuente y decisiones todavía propuestas.

**Para comenzar a programar:** 05 → 06 → 07 → 08 → 10 → 12, consultando 09 para interfaz y 11 para cálculos/importación. La primera ejecución de trabajo se toma de la fase 13. No es necesario construir de entrada todos los archivos del árbol técnico: se crean al implementar sus casos de uso.

**Para organizar y aceptar trabajo:** 19 → fase correspondiente → pruebas relevantes de 18 → registro 20. Los responsables pueden convertir las tareas de fase en tickets y conservar los IDs de requisito. Las evidencias se agregan cuando se ejecuta la prueba en una versión real.

**Para una demostración:** 21 y los fixtures de 18, contrastados con el estado de 20. La demostración final debe mostrar funciones construidas y resultados verificados; el manual de esta edición describe la experiencia planificada.

## 5. Plan de coordinación

| Área propuesta del equipo | Responsabilidad principal | Revisión cruzada |
| --- | --- | --- |
| A — Interfaz e integración | App Router, pantallas, Atomic Design, formularios, navegación y experiencia | B revisa exposición de datos; C revisa significado de cifras |
| B — Datos y seguridad | Supabase, modelo, migraciones, RLS, RPC, identidad, idempotencia y operación | C revisa integridad financiera; A comprueba contratos de interacción |
| C — Motor financiero y calidad | Reglas, decimal, importación normalizada, estados, indicadores, escenarios y fixtures | B revisa persistencia; A valida claridad de resultados y errores |

Las personas concretas se asignarán por el equipo. La responsabilidad de una fase es compartida: una pantalla y su contrato deben avanzar junto con los permisos, los datos y la comprobación correspondiente.

La fase 00 de definición queda cubierta por negocio y técnica. Las cinco fases de ejecución siguen dependencias: acceso/catálogo antes del diario; diario conciliado antes de estados; históricos confiables antes de presupuestos y escenarios; proyecciones integradas antes de emitir sus reportes definitivos. Las pruebas de seguridad, integridad y procedencia comienzan al introducir cada funcionalidad.

Los materiales originales plantean tres integrantes y cuatro semanas [F1, F2]. Se conserva como referencia de organización, no como fecha garantizada. El compromiso de calendario se ajustará a disponibilidad, experiencia, avance y rúbrica. El primer objetivo funcional es el recorrido de fase 03: entrar, importar, revisar, aprobar y ver efectos conciliados.

## 6. Convenciones de estado y mantenimiento

| Dimensión | Estados | Situación de esta versión |
| --- | --- | --- |
| Documento | Borrador, revisado, aprobado por responsable | Redactado y revisado por coherencia; ratificación funcional pendiente donde se indica |
| Funcionalidad | Pendiente, en desarrollo, implementada, verificada | Pendiente de implementación |
| Prueba | Pendiente, aprobada, fallida, bloqueada | PR-01–PR-40 pendientes |
| Evidencia de fuente | Revisión con resultado e incidencias | EV-F01–EV-F08 registradas en 20 |

Las referencias están identificadas: RF para requisito funcional, RNF para calidad, RCF para regla contable/financiera, CU para caso de uso, PR para prueba, EV para evidencia y PD para decisión pendiente. La matriz del documento 19 explica su relación. Los códigos no dependen del nombre de una persona o de la numeración de una pantalla.

Cada decisión tiene una ubicación principal. Las fórmulas se cambian en 04 y se reflejan en 11 y las expectativas de 18. Los contratos se cambian en 10 y se reflejan en controladores y fases. Los permisos funcionales se deciden en 02 y se hacen cumplir según 08. La operación pertenece a 12; el manual de tareas al 21. Así se evitan especificaciones duplicadas que evolucionen por separado.

Cuando la implementación cambie una decisión, se actualizarán los MD afectados en el mismo cambio del repositorio. El SQL ejecutable pertenecerá a `supabase/migrations`; el documento 07 explica intención y relaciones. Una ejecución fallida se conserva en 20 aun si después se corrige. Las versiones emitidas de reportes y análisis mantienen sus inputs y políticas.

La arquitectura consolidada previa se utilizó como fuente inicial y se distribuyó en este paquete. No se incorpora como un MD número 23 que compita con las especificaciones especializadas.

## 7. Fuentes de negocio y financieras

Los nombres F1–F7 se usan como referencias de los materiales entregados por el usuario. El [documento 20](validacion_y_entrega/20_REGISTRO_DE_VALIDACION_Y_PENDIENTES.md) registra los hashes y discrepancias. Las referencias técnicas oficiales se incluyen en los MD del área correspondiente.

| ID | Material aportado | Uso en la especificación |
| --- | --- | --- |
| F1 | `Carlitos_ARQUITECTURA_TECNICA_DETALLADA.docx` | Ocho módulos, roles, modelo previo y organización; el stack se adapta a Next.js y Supabase |
| F2 | `Carlitos_Reporte_Mejorado.docx` | Alcance financiero, operaciones, presupuestos, escenarios, ejemplo conciliado y demostración |
| F3 | `Carlitos_BASE_CONTABLE_AMPLIADA.xlsx` | Catálogo, diario simulado, resultados históricos y detección de defectos en resúmenes/proyección |
| F4 | `Caso Analisis Financiero Manufacturas Alfa_2025(2).docx`, copia `(3)` idéntica | Fixture independiente de indicadores y políticas didácticas explícitas |
| F5 | `compendio_razones_financieras_u2(1).pdf`, copia `(2)` idéntica | Fórmulas y criterios de comparación, revisados aritméticamente |
| F6 | `Branding_Panaderia_Carlitos_COMPLETO.zip` | Referencias de marca, componentes, mapa de pantallas y demo visual |
| F7 | `autoevaluaciones_anf115(1).docx` | Contexto conceptual; no añade una plataforma de exámenes al alcance |

## 8. Primer trabajo listo para ejecutar

El equipo puede tomar la [fase 01](implementacion/13_FASE_01_BASE_Y_ACCESO.md), fijar versiones compatibles, preparar Supabase local, crear las migraciones de acceso/catálogo/períodos y construir el AppShell con las rutas base. El catálogo revisado y los roles propuestos deben quedar explícitos desde esa primera entrega. Las siguientes fases tienen contratos y criterios definidos para continuar sin rehacer la organización documental.
