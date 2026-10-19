/** Contrato de resultado usado por controladores, Actions y Route Handlers. */
export type CampoInvalido = {
  ruta: string;
  codigo: string;
  mensaje: string;
};

export type ErrorResultado = {
  codigo: string;
  mensaje: string;
  campos?: CampoInvalido[];
  reintentable: boolean;
};

export type Resultado<T> =
  | { ok: true; datos: T; requestId: string }
  | { ok: false; error: ErrorResultado; requestId: string };
