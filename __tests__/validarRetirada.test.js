import { validarRetirada } from "../App";

describe("validarRetirada", () => {
  test("permite retirar uma quantidade menor que o estoque", () => {
    expect(validarRetirada(10, 5)).toBe(true);
  });

  test("permite retirar todo o estoque disponível", () => {
    expect(validarRetirada(10, 10)).toBe(true);
  });

  test("aceita números recebidos como texto", () => {
    expect(validarRetirada("10", "4")).toBe(true);
  });

  test("bloqueia retirada superior ao estoque", () => {
    expect(validarRetirada(5, 10)).toBe(false);
  });

  test("bloqueia quantidade negativa", () => {
    expect(validarRetirada(10, -2)).toBe(false);
  });

  test("bloqueia retirada igual a zero", () => {
    expect(validarRetirada(10, 0)).toBe(false);
  });

  test("bloqueia retirada decimal", () => {
    expect(validarRetirada(10, 2.5)).toBe(false);
  });

  test("bloqueia valor que não representa um número", () => {
    expect(validarRetirada(10, "abc")).toBe(false);
  });

  test("bloqueia retirada quando não há estoque", () => {
    expect(validarRetirada(0, 1)).toBe(false);
  });

  test("bloqueia estoque atual negativo", () => {
    expect(validarRetirada(-5, 1)).toBe(false);
  });
});