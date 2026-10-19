import { describe, expect, it } from "vitest";
import {
  aDecimal,
  aImporteCanonico,
  Decimal,
  POLITICA_DECIMAL,
} from "@/lib/decimal";

describe("decimal", () => {
  it("configura precision 40 y ROUND_HALF_UP", () => {
    expect(Decimal.precision).toBe(40);
    expect(Decimal.rounding).toBe(Decimal.ROUND_HALF_UP);
    expect(POLITICA_DECIMAL.codigo).toBe("P-CARLITOS-1");
  });

  it("redondea a dos decimales con half up", () => {
    expect(aImporteCanonico("1.005")).toBe("1.01");
    expect(aImporteCanonico("2.675")).toBe("2.68");
    expect(aImporteCanonico("10.004")).toBe("10.00");
  });

  it("conserva la aritmetica decimal sin float", () => {
    const total = aDecimal("0.10").plus("0.20");
    expect(total.toString()).toBe("0.3");
    expect(aImporteCanonico(total)).toBe("0.30");
  });

  it("suma importes grandes sin perder precision", () => {
    const total = aDecimal("9999999999999999.99").plus("0.01");
    expect(aImporteCanonico(total)).toBe("10000000000000000.00");
  });

  it("rechaza importes no canonicos", () => {
    expect(() => aDecimal("1,000.00")).toThrow("Importe no canonico");
    expect(() => aDecimal("1.234")).toThrow("Importe no canonico");
    expect(() => aDecimal("abc")).toThrow("Importe no canonico");
    expect(() => aDecimal("")).toThrow("Importe no canonico");
  });
});
