import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une clases de Tailwind resolviendo conflictos de utilidades. */
export function cn(...entradas: ClassValue[]): string {
  return twMerge(clsx(entradas));
}
