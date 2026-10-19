import { describe, expect, it } from "vitest";
import { esImporteNegativo, formatearImporte, formatearUSD } from "@/lib/dinero";

describe("dinero", () => {
  it("formatea miles y centavos", () => {
    expect(formatearImporte("1234567.8")).toBe("$1,234,567.80");
    expect(formatearImporte("1234")).toBe("$1,234.00");
    expect(formatearImporte("0.00")).toBe("$0.00");
    expect(formatearUSD("20441.40")).toBe("$20,441.40");
  });

  it("mantiene el signo negativo visible", () => {
    expect(formatearImporte("-1234.56")).toBe("-$1,234.56");
    expect(esImporteNegativo("-0.01")).toBe(true);
    expect(esImporteNegativo("0.01")).toBe(false);
  });

  it("tolera espacios exteriores pero no separadores ambiguos", () => {
    expect(formatearImporte(" 10.5 ")).toBe("$10.50");
    expect(() => formatearImporte("1,234.56")).toThrow("Importe no canonico");
  });

  it("rechaza mas de dos decimales y texto", () => {
    expect(() => formatearImporte("10.555")).toThrow("Importe no canonico");
    expect(() => formatearImporte("abc")).toThrow("Importe no canonico");
    expect(() => formatearImporte("")).toThrow("Importe no canonico");
  });
});
