# Reconstrucción: siete módulos ANF

Fecha: 25 de octubre de 2026. Decisión solicitada por el usuario.

Este alcance sustituye la planificación contable de cinco fases para la entrega
actual. Se conservan Next.js App Router, React, TypeScript, Tailwind y Supabase
local; las menciones a Vite de los documentos recibidos no cambian el stack.
No se utiliza el conector remoto, que corresponde a otro proyecto.

## Alcance vigente

RF01–RF10 de `../nueva documentacion/01_CONTEXTO_PROYECTO_ANF_CARLITOS (2).md`:
usuarios, ingresos, gastos, categorías, panel financiero, reportes y seguridad/
bitácora. Roles: administrador y empleado. El empleado opera solo sobre sus
movimientos. Los datos de la entrega son simulados, en USD.

La administración del catálogo contable, períodos contables, partida doble,
importaciones, presupuestos y proyecciones no forma parte de esta entrega.
Los archivos anteriores se conservan como antecedentes, no como obligaciones.
Exportar PDF/XLSX es complementario, no criterio del núcleo.

## Contratos y seguridad

- `perfiles`, `categorias`, `ingresos`, `gastos`, `bitacora`: cinco tablas operativas.
- Importes positivos con hasta dos decimales, transporte exclusivamente texto.
- Anulación definitiva con motivo; no hay borrado de movimientos.
- La interfaz no ofrece corrección de movimientos: después del alta solo permite
  anular con motivo. El contrato de actualización se conserva en servidor por
  compatibilidad, pero no se expone como acción de la entrega.
- El detalle admite filtro URL por estado (`vigente` o `anulado`). Este filtro
  afecta únicamente el listado paginado; los indicadores continúan calculándose
  con movimientos vigentes sobre las fechas, categoría y tipo seleccionados.
- Toda modificación de movimiento incluye revisión esperada; creación incluye
  solicitud UUID estable y comprueba que el contenido del reintento coincida.
- Servidor por solicitud, autorización en controlador y PostgreSQL/RLS.
- RPC estrechas para movimientos. No DML financiero directo del navegador.
- Supabase Auth administra contraseñas; credencial administrativa solo para Auth.
- Ingresos y gastos se agregan sobre todo el filtro, nunca sobre una página.
- Resultado = ingresos − gastos. Porcentaje = gastos / ingresos × 100,
  redondeado HALF_UP; si ingresos = 0, `null` / «No aplica».
- Fechas inclusivas; diferencia máxima de 3660 días; categorías compatibles.

## Migración y reversibilidad

La nueva migración conserva las tablas anteriores en un esquema privado de
archivo, sin acceso API. No elimina usuarios Auth ni movimientos anteriores.
Los perfiles existentes se copian inicialmente como empleados inactivos; no se
convierten roles antiguos ni se concede administración automáticamente.
La preparación demo es exclusivamente local y explícita.

Antes de aplicar: respaldo verificable de la base local. No ejecutar el SQL del
ZIP: corresponde a otro estado inicial. No ejecutar `db reset` para actualizar.
La configuración remota de los adjuntos es evidencia histórica, no una
verificación de la instancia local actual.

## Verificación y límites

La ejecución real de migraciones, RLS por ambos roles, concurrencia, recuperación
de respaldo y recorridos del navegador se documenta en el registro 20. Compilar
no demuestra por sí solo que la integración esté probada. Los contextos MD
recibidos incluyen la decisión de conservar Next.js. El informe Word original
requiere actualización académica de Vite a Next.js y revisión de su evidencia;
no se ha sobrescrito el documento entregado por el usuario.

Se agregó Playwright 1.64.1 como dependencia de desarrollo para reproducir E2E
(requiere Node >=20; compatible con Node 22), y se fijó la CLI Supabase 2.122.0
que ejecutó las migraciones. No se actualizaron Next, React ni las dependencias
de ejecución de la aplicación. Las fórmulas se centralizan en `anf_reporte`;
los servicios TypeScript preparan únicamente proporciones de presentación.
