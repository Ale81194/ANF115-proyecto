import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { rutas } from "@/config/rutas";
import type { FilaCuentaDTO } from "@/types/contabilidad";

const ETIQUETAS_CLASE: Record<string, string> = {
  activo: "Activo",
  pasivo: "Pasivo",
  patrimonio: "Patrimonio",
  ingreso: "Ingreso",
  gasto: "Gasto",
};

type AccountsTreeProps = {
  filas: readonly FilaCuentaDTO[];
};

export function AccountsTree({ filas }: AccountsTreeProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-28">Codigo</TableHead>
          <TableHead>Cuenta</TableHead>
          <TableHead className="hidden md:table-cell">Clase</TableHead>
          <TableHead className="hidden lg:table-cell">Naturaleza</TableHead>
          <TableHead className="hidden xl:table-cell">Rubro</TableHead>
          <TableHead className="w-32">Movimiento</TableHead>
          <TableHead className="w-24">Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filas.map((fila) => (
          <TableRow key={fila.id}>
            <TableCell className="font-mono text-xs text-texto-suave">
              {fila.codigo}
            </TableCell>
            <TableCell>
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: `${fila.profundidad * 14}px` }}
              >
                <Link
                  href={rutas.catalogo.detalle(fila.id)}
                  className="group inline-flex items-center gap-1 font-medium text-texto hover:text-primario"
                >
                  <span>{fila.nombre}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3.5 text-texto-suave opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </Link>
                {fila.esCorrectora ? (
                  <Badge variant="outline">Correctora</Badge>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="hidden text-xs text-texto-suave md:table-cell">
              {ETIQUETAS_CLASE[fila.clase] ?? fila.clase}
            </TableCell>
            <TableCell className="hidden text-xs text-texto-suave lg:table-cell">
              {fila.naturaleza === "deudora" ? "Deudora" : "Acreedora"}
            </TableCell>
            <TableCell className="hidden text-xs text-texto-suave xl:table-cell">
              {fila.rubroNombre}
            </TableCell>
            <TableCell>
              <Badge variant={fila.permiteMovimiento ? "primary" : "neutral"}>
                {fila.permiteMovimiento ? "Movimiento" : "Agrupadora"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={fila.activa ? "success" : "warning"}>
                {fila.activa ? "Activa" : "Inactiva"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
