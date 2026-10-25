import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
if (!["127.0.0.1", "localhost"].includes(new URL(url).hostname)) throw new Error("Local test only");
const client = () => createClient(url, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const admin = client();
const employee = client();
for (const [c, email] of [[admin, "admin@carlitos.local"], [employee, "empleado@carlitos.local"]]) {
  const { error } = await c.auth.signInWithPassword({ email, password: env.DEMO_USER_PASSWORD });
  assert.equal(error, null);
}
const { data: categories, error } = await employee.from("categorias").select("id").eq("codigo", "I01").single();
assert.equal(error, null);
const request = { p_tipo: "ingreso", p_id: null, p_revision: null, p_solicitud: crypto.randomUUID(),
  p_fecha: new Date().toISOString().slice(0, 10), p_concepto: `E2E SIMULADO concurrencia ${Date.now()}`,
  p_monto: "15.00", p_categoria: categories.id, p_referencia: "Prueba API local" };
const { data: id, error: creationError } = await employee.rpc("anf_guardar_movimiento", request);
assert.equal(creationError, null);
try {
  const outcomes = await Promise.all(["20.00", "30.00"].map((p_monto) => employee.rpc("anf_guardar_movimiento", {
    ...request, p_id: id, p_revision: 1, p_monto,
  })));
  assert.equal(outcomes.filter((r) => r.error === null).length, 1);
  assert.equal(outcomes.filter((r) => r.error?.code === "40001").length, 1);
  const { data: visible } = await admin.from("v_movimientos").select("id,revision,monto").eq("id", id).single();
  assert.equal(visible.revision, 2);
  assert.equal(typeof visible.monto, "string");
  const { data: adminId, error: adminError } = await admin.rpc("anf_guardar_movimiento", {
    ...request, p_solicitud: crypto.randomUUID(), p_concepto: "E2E SIMULADO propiedad administrativa",
  });
  assert.equal(adminError, null);
  try {
    const { data: hidden } = await employee.from("v_movimientos").select("id").eq("id", adminId);
    assert.deepEqual(hidden, []);
    const denied = await employee.rpc("anf_anular_movimiento", { p_tipo: "ingreso", p_id: adminId, p_revision: 1, p_motivo: "Prueba de propiedad" });
    assert.ok(denied.error);
  } finally {
    const r = await admin.rpc("anf_anular_movimiento", { p_tipo: "ingreso", p_id: adminId, p_revision: 1, p_motivo: "Cierre E2E SIMULADO de aislamiento" });
    assert.equal(r.error, null);
  }
  console.log("PASS: real Auth sessions, concurrent edits, exact decimal transport and cross-owner isolation");
} finally {
  const { data } = await employee.from("v_movimientos").select("revision").eq("id", id).single();
  const r = await employee.rpc("anf_anular_movimiento", { p_tipo: "ingreso", p_id: id, p_revision: data.revision, p_motivo: "Cierre E2E SIMULADO de concurrencia" });
  assert.equal(r.error, null);
}
