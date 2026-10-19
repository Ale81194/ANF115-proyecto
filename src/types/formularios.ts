export type ErrorCampoFormulario = {
  ruta: string;
  mensaje: string;
};

export type EstadoFormulario = {
  estado: "inicial" | "error";
  mensaje?: string;
  campos?: ErrorCampoFormulario[];
};

export const ESTADO_FORMULARIO_INICIAL: EstadoFormulario = {
  estado: "inicial",
};
