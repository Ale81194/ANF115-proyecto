-- Keep separate INSERT/UPDATE policies; do not authorize DELETE even implicitly.
drop policy categorias_escribir on public.categorias;
create policy categorias_insertar on public.categorias for insert to anf_writer
with check((select private.anf_rol())='administrador');
create policy categorias_actualizar on public.categorias for update to anf_writer
using((select private.anf_rol())='administrador') with check((select private.anf_rol())='administrador');
notify pgrst,'reload schema';
