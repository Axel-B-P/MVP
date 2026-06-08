'use strict';

/**
 * Strategy Pattern para movimientos de stock.
 * Cada estrategia encapsula la lógica de validación y cálculo
 * para un tipo de movimiento: ingreso, egreso, ajuste.
 */

class MovimientoStrategy {
  /**
   * @param {number} stockActual
   * @param {number} cantidad
   * @param {object} opciones - datos adicionales según tipo
   * @returns {{ nuevoStock: number }}
   */
  // eslint-disable-next-line no-unused-vars
  ejecutar(stockActual, cantidad, opciones = {}) {
    throw new Error('ejecutar() debe ser implementado por la estrategia concreta.');
  }
}

// ── Ingreso ──────────────────────────────────────────────────────────────────
class IngresoStrategy extends MovimientoStrategy {
  ejecutar(stockActual, cantidad) {
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new Error('La cantidad de ingreso debe ser un número mayor a 0.');
    }
    return { nuevoStock: stockActual + cantidad };
  }
}

// ── Egreso ────────────────────────────────────────────────────────────────────
class EgresoStrategy extends MovimientoStrategy {
  ejecutar(stockActual, cantidad) {
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new Error('La cantidad de egreso debe ser un número mayor a 0.');
    }
    const nuevoStock = stockActual - cantidad;
    if (nuevoStock < 0) {
      throw new Error(
        `Stock insuficiente. Stock actual: ${stockActual}, cantidad solicitada: ${cantidad}.`
      );
    }
    return { nuevoStock };
  }
}

// ── Ajuste ────────────────────────────────────────────────────────────────────
class AjusteStrategy extends MovimientoStrategy {
  ejecutar(stockActual, cantidad, { motivo } = {}) {
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new Error('La cantidad de ajuste debe ser un número mayor a 0.');
    }
    if (!motivo || motivo.trim() === '') {
      throw new Error('El motivo es obligatorio para movimientos de tipo ajuste.');
    }
    // El ajuste reemplaza el stock actual con la nueva cantidad
    return { nuevoStock: cantidad };
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────
const STRATEGIES = {
  ingreso: new IngresoStrategy(),
  egreso: new EgresoStrategy(),
  ajuste: new AjusteStrategy(),
};

/**
 * @param {'ingreso'|'egreso'|'ajuste'} tipo
 * @returns {MovimientoStrategy}
 */
function getStrategy(tipo) {
  const strategy = STRATEGIES[tipo];
  if (!strategy) {
    throw new Error(`Tipo de movimiento inválido: "${tipo}". Valores válidos: ingreso, egreso, ajuste.`);
  }
  return strategy;
}

module.exports = { getStrategy, IngresoStrategy, EgresoStrategy, AjusteStrategy };
