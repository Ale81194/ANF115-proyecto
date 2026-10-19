import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { pantallas } from "@/config/pantallas";
import { rutas } from "@/config/rutas";
import { listarAuditoria } from "@/controladores/auditoria.controller";

export const metadata: Metadata = {
  title: "Auditoria",
};

export const instant = false;

const formatoInstante = new Intl.DateTimeFormat("es-SV", {
  dateStyle: "medium",
  timeStyle: "short",
});

function abreviar(valor: string | null, largo = 8): string {
  if (!valor) {
    return "\u2014";
  }

  return valor.length > largo ? `${valor.slice(0, largo)}...` : valor;
}

export default async function AuditoriaPage() {
  await connection();
  const resultado = await listarAuditoria();

  if (!resultado.ok) {
    if (resultado.error.codigo === "NO_AUTENTICADO") {
      redirect(rutas.login);
    }

    return (
      <div className="rounded-card border border-peligro/30 bg-superficie p-6 shadow-card">
        <h1 className="text-lg text-texto">No se pudo consultar la auditoria</h1>
        <p className="mt-2 text-sm text-texto-suave" role="alert">
          {resultado.error.mensaje}
        </p>
      </div>
    );
  }

  const { eventos } = resultado.datos;
  const pantalla = pantallas.auditoria;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={pantalla.titulo}
        descripcion={pantalla.descripcion}
        contexto={
          <>
            <Badge variant="primary">CU-23</Badge>
            <Badge variant="outline">auditoria.leer</Badge>
            <Badge variant="neutral">Solo consulta</Badge>
          </>
        }
      />

      {eventos.length === 0 ? (
        <EmptyState
          titulo="Todavia no hay eventos"
          descripcion="Los cambios de catalogo y periodos registran actor, empresa, accion, versiones y motivo en la misma transaccion."
          icono={ShieldCheck}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instante</TableHead>
              <TableHead>Accion</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead className="hidden md:table-cell">Versiones</TableHead>
              <TableHead className="hidden lg:table-cell">Motivo</TableHead>
              <TableHead className="hidden xl:table-cell">Solicitud</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventos.map((evento) => (
              <TableRow key={evento.id}>
                <TableCell className="whitespace-nowrap text-xs text-texto-suave">
                  {formatoInstante.format(new Date(evento.instante))}
                </TableCell>
                <TableCell className="font-medium">{evento.accion}</TableCell>
                <TableCell className="text-xs text-texto-suave">
                  <span className="font-mono">{evento.entidadTipo}</span>
                  <span className="ml-2 font-mono">
                    {abreviar(evento.entidadId)}
                  </span>
                </TableCell>
                <TableCell className="hidden text-xs tabular-nums text-texto-suave md:table-cell">
                  {evento.versionAnterior ?? "\u2014"} &rarr;{" "}
                  {evento.versionNueva ?? "\u2014"}
                </TableCell>
                <TableCell className="hidden max-w-64 truncate text-xs text-texto-suave lg:table-cell">
                  {evento.motivo ?? "\u2014"}
                </TableCell>
                <TableCell className="hidden font-mono text-xs text-texto-suave xl:table-cell">
                  {abreviar(evento.requestId, 12)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
