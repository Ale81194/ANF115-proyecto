import { OperationForm } from "./operation-form";
import type { AccionOperacion, Categoria, Perfil, EventoBitacora, CampoOperacion } from "@/types/finanzas";

function camposCategoria(c?: Categoria): CampoOperacion[] {
  return [
    { nombre: "codigo", etiqueta: "Código (I01 / G01)", valor: c?.codigo, requerido: true },
    { nombre: "nombre", etiqueta: "Nombre", valor: c?.nombre, requerido: true, maxLength: 100 },
    { nombre: "tipo", etiqueta: "Tipo", tipo: "select", valor: c?.tipo ?? "ingreso", opciones: [{ valor: "ingreso", etiqueta: "Ingreso" }, { valor: "gasto", etiqueta: "Gasto" }] },
    { nombre: "activo", etiqueta: "Estado", tipo: "select", valor: c?.activo === false ? "false" : "true", opciones: [{ valor: "true", etiqueta: "Activa" }, { valor: "false", etiqueta: "Inactiva" }] },
    { nombre: "descripcion", etiqueta: "Descripción", tipo: "textarea", valor: c?.descripcion, maxLength: 500 },
  ];
}

function camposUsuario(p?: Perfil): CampoOperacion[] {
  return [
    { nombre: "nombre", etiqueta: "Nombre", valor: p?.nombre, requerido: true, maxLength: 120 },
    ...(!p ? [
      { nombre: "correo", etiqueta: "Correo", tipo: "email" as const, requerido: true },
      { nombre: "contrasena", etiqueta: "Contraseña (mínimo 12 caracteres)", tipo: "password" as const, requerido: true },
    ] : []),
    { nombre: "rol", etiqueta: "Rol", tipo: "select", valor: p?.rol ?? "empleado", opciones: [{ valor: "empleado", etiqueta: "Empleado" }, { valor: "administrador", etiqueta: "Administrador" }] },
    { nombre: "activo", etiqueta: "Estado", tipo: "select", valor: p?.activo ? "true" : "false", opciones: [{ valor: "false", etiqueta: "Inactivo" }, { valor: "true", etiqueta: "Activo" }] },
  ];
}

export function AdministrationWorkspace({ modulo, perfil, categorias, perfiles, eventos, accion }: {
  modulo: "usuarios" | "categorias" | "bitacora"; perfil: Perfil; categorias: Categoria[];
  perfiles: Perfil[]; eventos: EventoBitacora[]; accion: AccionOperacion;
}) {
  const admin = perfil.rol === "administrador";
  return <div className="space-y-6">
    <header><p className="text-xs font-semibold uppercase tracking-widest text-primario">Panadería Carlitos · Datos simulados</p>
      <h1 className="mt-2 font-serif text-4xl">{modulo === "usuarios" ? "Usuarios" : modulo === "categorias" ? "Categorías" : "Seguridad y bitácora"}</h1>
      <p className="mt-3 text-sm text-texto-suave">{modulo === "usuarios" ? "Identidades administradas en Supabase Auth. La desactivación bloquea el acceso operativo." : modulo === "categorias" ? "Clasificación de cobros y pagos. Desactivar conserva el historial." : "Registro de cambios confirmados. Solo administradores activos pueden consultar este historial."}</p>
    </header>
    {modulo === "bitacora" ? <>
      <section className="rounded-card border border-borde bg-superficie p-5"><h2 className="font-serif text-xl">Controles de acceso</h2>
        <p className="mt-2 text-sm">Las cuentas inactivas no operan. El empleado accede solo a sus movimientos; el administrador gestiona usuarios y categorías. Las contraseñas y los eventos de sesión se administran en Auth, no en esta bitácora.</p></section>
      <div className="overflow-x-auto rounded-card border border-borde bg-superficie p-5"><table className="w-full text-sm"><thead><tr className="border-b border-borde text-left">{["Fecha y hora", "Acción", "Entidad", "Actor", "Detalle"].map((t) => <th key={t} className="p-3">{t}</th>)}</tr></thead>
        <tbody>{eventos.map((e) => <tr key={e.id} className="border-b border-borde align-top"><td className="p-3 whitespace-nowrap">{e.fecha_hora}</td><td className="p-3">{e.accion}</td><td className="p-3">{e.entidad}</td><td className="p-3 font-mono text-xs">{e.actor_id ?? "Sistema"}</td><td className="p-3"><details><summary className="cursor-pointer text-primario">Ver cambio</summary><p>{e.motivo}</p><h3 className="mt-2 font-semibold">Antes</h3><pre className="max-w-lg overflow-auto text-xs">{JSON.stringify(e.antes, null, 2)}</pre><h3 className="mt-2 font-semibold">Después</h3><pre className="max-w-lg overflow-auto text-xs">{JSON.stringify(e.despues, null, 2)}</pre></details></td></tr>)}</tbody>
      </table>{eventos.length === 0 && <p className="p-5 text-sm">No hay eventos en esta página.</p>}</div>
    </> : <>
      {admin && <details className="rounded-card border border-borde bg-superficie p-5"><summary className="cursor-pointer font-serif text-xl">{modulo === "usuarios" ? "Registrar usuario" : "Crear categoría"}</summary>
        <div className="mt-5"><OperationForm accion={accion} operacion={modulo === "usuarios" ? "usuario" : "categoria"}
          campos={modulo === "usuarios" ? camposUsuario() : camposCategoria()} texto={modulo === "usuarios" ? "Crear cuenta" : "Crear categoría"} /></div>
      </details>}
      <section className="space-y-3">
        {modulo === "categorias" ? categorias.map((c) => <article key={c.id} className="rounded-card border border-borde bg-superficie p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><span className="mr-2 font-mono text-xs text-primario">{c.codigo}</span><strong>{c.nombre}</strong><p className="mt-1 text-xs text-texto-suave">{c.tipo} · {c.activo ? "Activa" : "Inactiva"}</p></div></div>
          {admin && <details className="mt-3"><summary className="cursor-pointer text-sm text-primario">Editar o desactivar</summary><p className="my-3 text-xs">Después de usar una categoría, su código y tipo no se pueden cambiar.</p><OperationForm accion={accion} operacion="categoria" ocultos={{ id: c.id, versionEsperada: c.actualizado_en }} campos={camposCategoria(c)} /></details>}
        </article>) : perfiles.map((p) => <article key={p.usuario_id} className="rounded-card border border-borde bg-superficie p-5"><strong>{p.nombre}</strong>
          <p className="mt-1 text-xs text-texto-suave">{p.rol} · {p.activo ? "Activo" : "Inactivo"}</p><p className="mt-1 break-all font-mono text-xs">{p.usuario_id}</p>
          <details className="mt-3"><summary className="cursor-pointer text-sm text-primario">Editar rol, nombre y acceso</summary><div className="mt-4"><OperationForm accion={accion} operacion="usuario" ocultos={{ id: p.usuario_id, versionEsperada: p.actualizado_en }} campos={camposUsuario(p)} /></div></details>
        </article>)}
        {(modulo === "usuarios" ? perfiles : categorias).length === 0 && <p className="rounded-card border border-borde bg-superficie p-8">No hay registros disponibles.</p>}
      </section>
    </>}
  </div>;
}
