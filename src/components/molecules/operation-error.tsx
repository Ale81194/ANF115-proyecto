export function OperationError({ mensaje }: { mensaje: string }) {
  return <section className="rounded-card border border-peligro bg-superficie p-6" role="alert">
    <h1 className="font-serif text-2xl">No se pudo completar la consulta</h1>
    <p className="mt-3 text-sm">{mensaje}</p>
    <p className="mt-2 text-sm text-texto-suave">Revise su sesión, los filtros y el estado de Supabase local antes de reintentar.</p>
  </section>;
}
