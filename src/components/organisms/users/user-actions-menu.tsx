"use client";

import { useState } from "react";
import { Activity, CalendarDays, Eye, Hash, Mail, MoreVertical, Pencil, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { OperationForm } from "@/components/organisms/operation-form";
import type { AccionOperacion, CampoOperacion, EventoBitacora, PerfilAdministrado } from "@/types/finanzas";

type Vista = "editar" | "detalles" | "actividad" | null;

function fecha(valor: string): string {
  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/El_Salvador",
  }).format(new Date(valor));
}

export function UserActionsMenu({ usuario, eventos, accion }: {
  usuario: PerfilAdministrado;
  eventos: EventoBitacora[];
  accion: AccionOperacion;
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [vista, setVista] = useState<Vista>(null);
  const campos: CampoOperacion[] = [
    { nombre: "nombre", etiqueta: "Nombre", valor: usuario.nombre, requerido: true, maxLength: 120 },
    { nombre: "rol", etiqueta: "Rol", tipo: "select", valor: usuario.rol,
      opciones: [{ valor: "empleado", etiqueta: "Empleado" }, { valor: "administrador", etiqueta: "Administrador" }] },
  ];
  const abrir = (destino: Exclude<Vista, null>) => {
    setMenuAbierto(false);
    setVista(destino);
  };

  return (
    <div className="relative flex justify-end">
      <button type="button" aria-label={`Acciones de ${usuario.nombre}`} aria-expanded={menuAbierto}
        onClick={() => setMenuAbierto((actual) => !actual)}
        className="flex size-9 items-center justify-center rounded-input text-texto-suave transition-colors hover:bg-superficie-tenue hover:text-texto">
        <MoreVertical aria-hidden="true" className="size-4" />
      </button>
      {menuAbierto && <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-input border border-borde bg-superficie p-1.5 text-left shadow-elevada">
        <button type="button" onClick={() => abrir("editar")} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-superficie-tenue"><Pencil aria-hidden="true" className="size-4 text-primario" />Editar información</button>
        <button type="button" onClick={() => abrir("detalles")} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-superficie-tenue"><Eye aria-hidden="true" className="size-4 text-texto-suave" />Ver detalles</button>
        <button type="button" onClick={() => abrir("actividad")} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-superficie-tenue"><Activity aria-hidden="true" className="size-4 text-texto-suave" />Ver actividad</button>
      </div>}

      <Dialog open={vista !== null} onOpenChange={(abierto) => !abierto && setVista(null)}>
        <DialogContent>
          {vista === "editar" && <>
            <DialogHeader><DialogTitle>Editar información</DialogTitle><DialogDescription>Cambia el nombre o rol asignado. El estado se administra únicamente desde el interruptor de la tabla.</DialogDescription></DialogHeader>
            <div className="mt-5"><OperationForm accion={accion} operacion="usuario"
              ocultos={{ id: usuario.usuario_id, versionEsperada: usuario.actualizado_en, activo: String(usuario.activo) }}
              campos={campos} requiereCambios /></div>
          </>}
          {vista === "detalles" && <>
            <DialogHeader><DialogTitle>Detalles de {usuario.nombre}</DialogTitle><DialogDescription>Identidad y acceso registrados en el sistema.</DialogDescription></DialogHeader>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="rounded-input bg-superficie-tenue p-3"><dt className="flex items-center gap-2 text-xs text-texto-suave"><Mail className="size-3.5" />Correo</dt><dd className="mt-1 break-all font-medium">{usuario.correo}</dd></div>
              <div className="rounded-input bg-superficie-tenue p-3"><dt className="flex items-center gap-2 text-xs text-texto-suave"><Hash className="size-3.5" />Identificador</dt><dd className="mt-1 break-all font-mono text-xs">{usuario.usuario_id}</dd></div>
              <div className="rounded-input bg-superficie-tenue p-3"><dt className="flex items-center gap-2 text-xs text-texto-suave"><CalendarDays className="size-3.5" />Fecha de creación</dt><dd className="mt-1 font-medium">{fecha(usuario.creado_en)}</dd></div>
              <div className="rounded-input bg-superficie-tenue p-3"><dt className="flex items-center gap-2 text-xs text-texto-suave"><ShieldCheck className="size-3.5" />Acceso</dt><dd className="mt-1 font-medium capitalize">{usuario.rol} · {usuario.activo ? "Activo" : "Inactivo"}</dd></div>
            </dl>
          </>}
          {vista === "actividad" && <>
            <DialogHeader><DialogTitle>Actividad de {usuario.nombre}</DialogTitle><DialogDescription>Acciones recientes disponibles en la bitácora para este usuario.</DialogDescription></DialogHeader>
            <div className="mt-5 max-h-96 space-y-2 overflow-y-auto">
              {eventos.length === 0 ? <p className="rounded-input bg-superficie-tenue p-4 text-sm text-texto-suave">No hay actividad registrada en la consulta disponible.</p>
                : eventos.map((evento) => <article key={evento.id} className="rounded-input border border-borde p-3 text-sm">
                  <div className="flex items-center justify-between gap-3"><strong>{evento.accion}</strong><time className="text-xs text-texto-suave">{fecha(evento.fecha_hora)}</time></div>
                  <p className="mt-1 text-xs text-texto-suave">{evento.entidad}{evento.motivo ? ` · ${evento.motivo}` : ""}</p>
                </article>)}
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
