'use strict';

const {
  getStrategy,
  IngresoStrategy,
  EgresoStrategy,
  AjusteStrategy,
} = require('../../src/strategies/movimientoStrategies');

describe('Strategy Pattern - Movimientos de Stock', () => {
  // ── getStrategy factory ───────────────────────────────────────────────────
  describe('getStrategy()', () => {
    test('retorna IngresoStrategy para tipo "ingreso"', () => {
      expect(getStrategy('ingreso')).toBeInstanceOf(IngresoStrategy);
    });

    test('retorna EgresoStrategy para tipo "egreso"', () => {
      expect(getStrategy('egreso')).toBeInstanceOf(EgresoStrategy);
    });

    test('retorna AjusteStrategy para tipo "ajuste"', () => {
      expect(getStrategy('ajuste')).toBeInstanceOf(AjusteStrategy);
    });

    test('lanza error para tipo inválido', () => {
      expect(() => getStrategy('desconocido')).toThrow(
        /Tipo de movimiento inválido/
      );
    });
  });

  // ── IngresoStrategy ───────────────────────────────────────────────────────
  describe('IngresoStrategy', () => {
    const strategy = new IngresoStrategy();

    test('suma correctamente la cantidad al stock actual', () => {
      const { nuevoStock } = strategy.ejecutar(100, 50);
      expect(nuevoStock).toBe(150);
    });

    test('permite ingreso cuando stock actual es 0', () => {
      const { nuevoStock } = strategy.ejecutar(0, 25);
      expect(nuevoStock).toBe(25);
    });

    test('lanza error si cantidad es 0', () => {
      expect(() => strategy.ejecutar(100, 0)).toThrow(/mayor a 0/);
    });

    test('lanza error si cantidad es negativa', () => {
      expect(() => strategy.ejecutar(100, -10)).toThrow(/mayor a 0/);
    });

    test('lanza error si cantidad no es número', () => {
      expect(() => strategy.ejecutar(100, 'abc')).toThrow(/mayor a 0/);
    });
  });

  // ── EgresoStrategy ────────────────────────────────────────────────────────
  describe('EgresoStrategy', () => {
    const strategy = new EgresoStrategy();

    test('resta correctamente la cantidad al stock actual', () => {
      const { nuevoStock } = strategy.ejecutar(100, 30);
      expect(nuevoStock).toBe(70);
    });

    test('permite egreso que deja stock en 0', () => {
      const { nuevoStock } = strategy.ejecutar(50, 50);
      expect(nuevoStock).toBe(0);
    });

    test('lanza error si el egreso deja stock negativo', () => {
      expect(() => strategy.ejecutar(10, 20)).toThrow(/Stock insuficiente/);
    });

    test('lanza error si cantidad es 0', () => {
      expect(() => strategy.ejecutar(100, 0)).toThrow(/mayor a 0/);
    });

    test('lanza error si cantidad es negativa', () => {
      expect(() => strategy.ejecutar(100, -5)).toThrow(/mayor a 0/);
    });
  });

  // ── AjusteStrategy ────────────────────────────────────────────────────────
  describe('AjusteStrategy', () => {
    const strategy = new AjusteStrategy();

    test('reemplaza el stock actual con la nueva cantidad', () => {
      const { nuevoStock } = strategy.ejecutar(100, 80, { motivo: 'Corrección inventario' });
      expect(nuevoStock).toBe(80);
    });

    test('lanza error si motivo está vacío', () => {
      expect(() => strategy.ejecutar(100, 80, { motivo: '' })).toThrow(/motivo es obligatorio/);
    });

    test('lanza error si motivo no está definido', () => {
      expect(() => strategy.ejecutar(100, 80, {})).toThrow(/motivo es obligatorio/);
    });

    test('lanza error si cantidad es 0', () => {
      expect(() => strategy.ejecutar(100, 0, { motivo: 'test' })).toThrow(/mayor a 0/);
    });

    test('lanza error si cantidad es negativa', () => {
      expect(() => strategy.ejecutar(100, -1, { motivo: 'test' })).toThrow(/mayor a 0/);
    });
  });
});
