import { z } from "zod";
import { esFechaContable } from "@/lib/fechas";
import {
  CLASES_CUENTA,
  NATURALEZAS_CUENTA,
} from "@/types/contabilidad";

const fechaContable = z
  .string()
  .trim()
  .refine(esFechaContable, "Usa una fecha real en formato AAAA-MM-DD.");

export const guardarCuentaSchema = z
  .object({
    cuentaId: z.string().uuid("El identificador de cuenta no es valido.").nullable(),
    codigo: z
      .string()
      .trim()
      .min(1, "Ingresa un codigo.")
      .max(40, "El codigo admite hasta 40 caracteres.")
      .regex(
        /^[0-9A-Za-z._-]+$/,
        "Usa solo letras, numeros, puntos, guiones o guion bajo.",
      ),
    nombre: z
      .string()
      .trim()
      .min(1, "Ingresa un nombre.")
      .max(160, "El nombre admite hasta 160 caracteres."),
    padreId: z.string().uuid("La cuenta padre no es valida.").nullable(),
    clase: z.enum(CLASES_CUENTA, {
      message: "Selecciona una clase de cuenta valida.",
    }),
    naturaleza: z.enum(NATURALEZAS_CUENTA, {
      message: "Selecciona una naturaleza valida.",
    }),
    rubroId: z.string().uuid("Selecciona un rubro valido."),
    esCorrectora: z.boolean(),
    permiteMovimiento: z.boolean(),
    activa: z.boolean(),
    vigenciaDesde: fechaContable,
    vigenciaHasta: fechaContable.nullable(),
    versionEsperada: z
      .number()
      .int("La version debe ser un entero.")
      .positive("La version debe ser positiva.")
      .nullable(),
    motivo: z
      .string()
      .trim()
      .max(240, "El motivo admite hasta 240 caracteres.")
      .nullable(),
    claveIdempotencia: z
      .string()
      .uuid("La clave de reintento no es valida.")
      .nullable(),
  })
  .superRefine((valor, contexto) => {
    if (
      valor.vigenciaHasta !== null &&
      valor.vigenciaHasta < valor.vigenciaDesde
    ) {
      contexto.addIssue({
        code: "custom",
        path: ["vigenciaHasta"],
        message: "La vigencia hasta no puede ser anterior a la vigencia desde.",
      });
    }
  });

export type EntradaGuardarCuenta = z.infer<typeof guardarCuentaSchema>;

export const crearPeriodoSchema = z.object({
  anio: z
    .number()
    .int("El año debe ser un entero.")
    .min(2000, "El año minimo es 2000.")
    .max(2100, "El año maximo es 2100."),
  mes: z
    .number()
    .int("El mes debe ser un entero.")
    .min(1, "El mes minimo es 1.")
    .max(12, "El mes maximo es 12."),
  claveIdempotencia: z
    .string()
    .uuid("La clave de reintento no es valida.")
    .nullable(),
});

export type EntradaCrearPeriodo = z.infer<typeof crearPeriodoSchema>;

export const iniciarSesionSchema = z.object({
  correo: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo.")
    .email("Ingresa un correo valido."),
  contrasena: z
    .string()
    .min(1, "Ingresa tu contrasena.")
    .max(200, "La contrasena es demasiado larga."),
});

export type EntradaIniciarSesion = z.infer<typeof iniciarSesionSchema>;

export const busquedaCatalogoSchema = z
  .string()
  .trim()
  .max(60, "La busqueda admite hasta 60 caracteres.")
  .regex(
    /^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ ._-]*$/,
    "La busqueda contiene caracteres no admitidos.",
  );
