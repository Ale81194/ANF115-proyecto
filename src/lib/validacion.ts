import type { ZodError } from "zod";
import type { CampoInvalido } from "@/types/respuestas";

/** Traduce issues de Zod al contrato de campos del documento 10. */
export function camposDesdeZod(error: ZodError): CampoInvalido[] {
  return error.issues.map((issue) => ({
    ruta:
      issue.path.length > 0
        ? issue.path.map((parte) => String(parte)).join(".")
        : "formulario",
    codigo: issue.code,
    mensaje: issue.message,
  }));
}
