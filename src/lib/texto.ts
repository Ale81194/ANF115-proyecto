/**
 * Normaliza una busqueda humana para filtros SQL.
 *
 * Conserva letras, numeros, espacios, puntos y guiones. Elimina caracteres
 * que PostgREST interpreta como sintaxis de filtro.
 */
export function normalizarBusqueda(valor: string | null | undefined): string {
  return (valor ?? "")
    .trim()
    .replace(/[%_,()]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 60);
}
