# 06 — Directorios y convenciones

**Proyecto:** Carlitos Finanzas  
**Versión documental:** 0.1 · **Fecha:** 19 de octubre de 2026  
**Estado:** estructura implementada para la Fase 01 (acceso, catálogo, períodos, auditoría). Las carpetas de fases posteriores se completan al implementar sus casos de uso.

## 1. Objetivo

Que una persona pueda ubicar una pantalla, su caso de uso y su persistencia sin investigar carpetas ambiguas. Cada pantalla vive bajo `src/app` con su propio `page.tsx`. La lógica reutilizable se distribuye por responsabilidad, siguiendo [05](05_ARQUITECTURA_Y_STACK.md).

Este árbol es la estructura objetivo. Los archivos se incorporarán cuando se construya su fase; no se necesitan módulos vacíos para aparentar avance. Las convenciones de rutas, grupos y archivos especiales corresponden al App Router de Next.js. [T1]

## 2. Pantallas y adaptadores de entrada

```text
carlitos-finanzas/
  src/
    app/
      layout.tsx
      page.tsx
      globals.css
      not-found.tsx
      (publico)/
        login/
          page.tsx
          actions.ts
      (privado)/
        layout.tsx
        loading.tsx
        error.tsx
        dashboard/
          page.tsx
        usuarios/
          page.tsx
          actions.ts
          nuevo/page.tsx
          [id]/page.tsx
          permisos/page.tsx
        catalogo/
          page.tsx
          actions.ts
          nueva/page.tsx
          [id]/page.tsx
        periodos/
          page.tsx
          actions.ts
          [id]/cierre/page.tsx
        importaciones/
          page.tsx
          actions.ts
          [id]/page.tsx
        diario/
          page.tsx
          actions.ts
          nuevo/page.tsx
          [id]/page.tsx
        estados/
          page.tsx
          comprobacion/page.tsx
          resultados/page.tsx
          balance/page.tsx
          patrimonio/page.tsx
        presupuestos/
          page.tsx
          actions.ts
          [id]/
            page.tsx
            comparativo/page.tsx
        escenarios/
          page.tsx
          actions.ts
          [id]/page.tsx
          comparar/page.tsx
        proyecciones/
          page.tsx
          [id]/
            resultados/page.tsx
            balance/page.tsx
            patrimonio/page.tsx
        analisis/
          indicadores/page.tsx
          comparativo/page.tsx
        reportes/
          page.tsx
          actions.ts
          [id]/page.tsx
        auditoria/
          page.tsx
        configuracion/
          page.tsx
          actions.ts
      api/
        importaciones/route.ts
        reportes/[id]/archivo/route.ts
        health/route.ts
    proxy.ts
```

Las carpetas `(publico)` y `(privado)` agrupan layouts y no forman parte de las URLs. `usuarios/nuevo/page.tsx` representa una carpeta `nuevo` con su archivo, no un nombre de archivo que incluya barras. `/` resuelve el acceso y redirige a login o dashboard. El significado y los permisos de todas las pantallas están en [09](09_PANTALLAS_Y_ATOMIC_DESIGN.md).

`actions.ts` reúne adaptadores del módulo; no importa componentes ni define cálculos. Una Action llama al controlador, devuelve el contrato de resultado y actualiza la vista correspondiente. Los archivos `loading.tsx`, `error.tsx` y `not-found.tsx` se añaden también a un módulo cuando requiera un estado específico; no se copian sin necesidad a cada carpeta.

El archivo de entrada `src/proxy.ts` delega en `src/supabase/proxy.ts` para el trabajo de sesión. Se utiliza la convención actual de Next.js, que renombró Middleware a Proxy. La autorización de los casos de uso se ejecuta aunque una solicitud no haya pasado por ese matcher. [T2]

## 3. Componentes reutilizables

```text
src/components/
  atoms/
    button.tsx
    input.tsx
    select.tsx
    badge.tsx
    table.tsx
    dialog.tsx
    money-text.tsx
  molecules/
    form-field.tsx
    period-selector.tsx
    metric-card.tsx
    source-badge.tsx
    validation-summary.tsx
    empty-state.tsx
  organisms/
    navegacion/sidebar.tsx
    dashboard/dashboard-panel.tsx
    usuarios/user-form.tsx
    catalogo/accounts-tree.tsx
    catalogo/account-form.tsx
    diario/journal-form.tsx
    diario/journal-detail.tsx
    importaciones/import-upload.tsx
    importaciones/import-preview.tsx
    estados/financial-statement.tsx
    estados/equity-reconciliation.tsx
    presupuestos/budget-grid.tsx
    escenarios/scenario-form.tsx
    analisis/ratio-detail.tsx
    reportes/report-history.tsx
    auditoria/audit-table.tsx
  templates/
    app-shell.tsx
    auth-template.tsx
    report-template.tsx
```

No se crea `components/pages`: `app` ya cumple esa función. Un átomo no conoce cuentas, permisos ni fechas de corte. Una molécula compone controles o un dato presentado; un organismo reúne una interacción de negocio. Una plantilla distribuye zonas visuales y recibe contenido.

Los componentes base incorporados desde shadcn/ui se ubicarán o adaptarán a `atoms` mediante su configuración; se evitará mantener dos implementaciones distintas del mismo botón en `atoms` y `ui`. Las primitivas accesibles se conservan al aplicar tokens visuales. [T3]

Los nombres de carpetas de módulos y casos de uso se mantienen en español. Los archivos de componentes siguen nombres descriptivos en kebab-case; los símbolos React se exportan en PascalCase, por ejemplo `journal-form.tsx` exporta `JournalForm`. Se conserva así la nomenclatura de componentes ya propuesta, sin mezclar dos nombres para el mismo archivo.

## 4. Aplicación, dominio e integración

```text
src/
  controladores/
    acceso.controller.ts
    usuarios.controller.ts
    catalogo.controller.ts
    periodos.controller.ts
    importaciones.controller.ts
    diario.controller.ts
    estados.controller.ts
    analisis.controller.ts
    dashboard.controller.ts
    presupuestos.controller.ts
    escenarios.controller.ts
    proyecciones.controller.ts
    reportes.controller.ts
    auditoria.controller.ts
  servicios/
    contabilidad/
      validar-asiento.ts
      clasificar-saldos.ts
      conciliar-patrimonio.ts
    estados/
      comprobacion.ts
      resultados.ts
      balance.ts
      patrimonio.ts
    finanzas/
      catalogo-indicadores.ts
      razones.ts
      analisis-horizontal.ts
      analisis-vertical.ts
    presupuestos/
      comparar-presupuesto.ts
      validar-presupuesto.ts
    proyecciones/
      pronosticar-ventas.ts
      proyectar-movimientos.ts
      evaluar-pronostico.ts
    importaciones/
      normalizar-filas.ts
      validar-lote.ts
      detectar-duplicados.ts
    reportes/
      preparar-reporte.ts
  repositorios/
    usuarios.repository.ts
    catalogo.repository.ts
    periodos.repository.ts
    importaciones.repository.ts
    diario.repository.ts
    estados.repository.ts
    analisis.repository.ts
    presupuestos.repository.ts
    escenarios.repository.ts
    proyecciones.repository.ts
    reportes.repository.ts
    auditoria.repository.ts
  supabase/
    client.ts
    server.ts
    proxy.ts
    admin.ts
    database.types.ts
  auth/
    obtener-contexto.ts
    verificar-permiso.ts
  config/
    rutas.ts
    navegacion.ts
    permisos.ts
    env.server.ts
    limites.ts
  schemas/
    consulta.schema.ts
    asiento.schema.ts
    importacion.schema.ts
    presupuesto.schema.ts
    escenario.schema.ts
    reporte.schema.ts
  types/
    contexto.ts
    contabilidad.ts
    finanzas.ts
    importaciones.ts
    respuestas.ts
  hooks/
    use-period-query.ts
  lib/
    decimal.ts
    fechas.ts
    errores.ts
    hash.ts
    excel/importar-diario.ts
    excel/exportar-reporte.ts
    pdf/exportar-reporte.ts
  styles/
    tokens.css
```

`src/supabase/server.ts` crea un cliente por solicitud. `client.ts` aporta integración del navegador. `admin.ts` queda reservado a gestión autorizada de Auth y preparación local; no se importa desde repositorios financieros. `database.types.ts` se genera desde el esquema migrado.

`lib` contiene adaptadores o utilidades pequeñas, no una segunda carpeta de reglas financieras. Interpretar un XLSX pertenece al adaptador Excel; comprobar partida doble pertenece a servicios y también a las restricciones de la base. La misma fórmula no se reimplementa en un componente, un controlador y un exportador.

## 5. Infraestructura, documentación y comprobaciones

```text
supabase/
  config.toml
  migrations/
    <timestamp>_identidad_empresa_y_acceso.sql
    <timestamp>_catalogo_periodos_y_politicas.sql
    <timestamp>_importaciones_diario_y_operaciones.sql
    <timestamp>_consultas_y_analisis.sql
    <timestamp>_presupuestos_y_escenarios.sql
    <timestamp>_proyecciones_reportes_y_cierres.sql
  seed.sql
  tests/
    permisos.sql
    contabilizacion.sql
    cierre.sql
public/
  branding/
    logo-principal.svg
    isotipo.svg
scripts/
  crear-usuarios-demo.ts
  verificar-entorno-local.ts
tests/
  unit/
  integration/
  e2e/
  fixtures/
    alfa-2025.json
    carlitos-mes-conciliado.json
    importaciones-invalidas/
docs/
  00_INDICE_Y_PLAN_DOCUMENTAL.md
  negocio/
  tecnico/
  implementacion/
  validacion_y_entrega/
.env.example
.gitignore
package.json
package-lock.json
tsconfig.json
next.config.ts
README.md
```

El README futuro del repositorio será una entrada breve con enlace a este paquete y comandos contrastados. No es un archivo adicional de esta entrega de 22 MD. Los timestamps del árbol son marcadores del nombre generado por la CLI, no migraciones ejecutadas. Cada migración incorpora RLS, grants y funciones necesarias junto con sus tablas; no deja la seguridad abierta hasta una fase posterior.

Se mantiene una sola carpeta de migraciones: `supabase/migrations`. `src/supabase` contiene integración TypeScript, no SQL de infraestructura. La CLI aplica migraciones desde esa estructura. [T4]

## 6. Rutas, navegación y permisos

`rutas.ts` es la fuente de URLs usadas por links y redirecciones. `navegacion.ts` asocia títulos, iconos y permisos. `permisos.ts` define identificadores tipados; las asignaciones efectivas se consultan en PostgreSQL.

Ejemplo de forma esperada, que deberá implementarse y validarse en la fase 01:

```ts
export const rutas = {
  login: '/login',
  dashboard: '/dashboard',
  diario: {
    lista: '/diario',
    nuevo: '/diario/nuevo',
    detalle: (id: string) => '/diario/' + encodeURIComponent(id),
  },
  estados: {
    resultados: '/estados/resultados',
    balance: '/estados/balance',
    patrimonio: '/estados/patrimonio',
  },
} as const;
```

Las URLs con filtros se construyen con `URLSearchParams`. El servidor valida identificadores y fechas después de recibirlos. Escapar un segmento no demuestra que exista ni que pertenezca a la empresa autorizada.

## 7. Convenciones de mantenimiento

| Regla | Aplicación concreta |
| --- | --- |
| Alias | `@/` apunta a `src/`; imports relativos cortos dentro de un mismo módulo |
| Dependencias | Componentes no importan repositorios; servicios no importan Next.js ni Supabase |
| DTO | Dinero en strings; respuestas explícitas, sin devolver tablas completas |
| Nombres | Funciones de casos de uso en camelCase y verbos: `confirmarLote`, `cerrarPeriodo` |
| Errores | Códigos del documento 10; mensajes de interfaz en español |
| Tipos | Generados para persistencia, tipos de dominio propios para negocio |
| Fechas | Fecha contable ISO sin hora; instante de auditoría con zona |
| Constantes | Fórmulas, rutas y políticas versionadas; ninguna sesión global |
| Cambios SQL | Migración nueva para cambiar un esquema compartido ya aplicado |
| Archivos | UTF-8, nombres estables; ningún secreto o archivo importado en `public` |

No se crearán archivos barril que mezclen exportaciones de servidor y cliente, porque ocultan las fronteras de dependencias. Un módulo grande puede subdividir sus controladores por caso de uso cuando exista una razón concreta; no requiere un directorio `utils` adicional por pantalla.

## 8. Cómo añadir una pantalla

Primero se identifica el requisito y CU existente, se añade la ruta al mapa y al catálogo central, y se define el DTO mínimo. Después se crea la carpeta de `app`, se compone con organismos reutilizables y se conecta al controlador. Si la operación escribe datos, se actualizan contrato, RPC, permisos y migración antes de habilitar el botón. Finalmente se actualizan documentación y comprobaciones relacionadas.

La revisión verificará que dos pantallas que usan el mismo cálculo llamen al mismo servicio. El criterio es una ubicación comprensible y una única regla mantenida, no alcanzar una cantidad de archivos.

## Fuentes y documentos relacionados

- **T1:** [Next.js: Project structure and organization](https://nextjs.org/docs/app/getting-started/project-structure).
- **T2:** [Next.js: Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).
- **T3:** [shadcn/ui: instalación en Next.js](https://ui.shadcn.com/docs/installation/next).
- **T4:** [Supabase: Database migrations](https://supabase.com/docs/guides/local-development/database-migrations).
- [05 Arquitectura](05_ARQUITECTURA_Y_STACK.md), [09 Pantallas](09_PANTALLAS_Y_ATOMIC_DESIGN.md), [12 Entorno local](12_ENTORNO_LOCAL_Y_OPERACION.md).

