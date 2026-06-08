'use strict';

const MovimientoStockModel = require('../models/MovimientoStockModel');
const MateriaPrimaModel = require('../models/MateriaPrimaModel');
const { getStrategy } = require('../strategies/movimientoStrategies');

class MovimientoStockService {
  constructor(
    movModel = new MovimientoStockModel(),
    mpModel = new MateriaPrimaModel()
  ) {
    this.movModel = movModel;
    this.mpModel = mpModel;
  }

  async getAll(filters) {
    return this.movModel.findAll(filters);
  }

  async getById(id) {
    const mov = await this.movModel.findById(id);
    if (!mov) throw Object.assign(new Error('Movimiento no encontrado.'), { status: 404 });
    return mov;
  }

  async registrar({ materia_prima_id, tipo, cantidad, motivo, usuario }) {
    // Validaciones básicas
    if (!materia_prima_id) {
      throw Object.assign(new Error('materia_prima_id es requerido.'), { status: 400 });
    }
    if (!tipo) {
      throw Object.assign(new Error('tipo es requerido.'), { status: 400 });
    }
    if (cantidad === undefined || cantidad === null) {
      throw Object.assign(new Error('cantidad es requerida.'), { status: 400 });
    }

    // Obtener la materia prima (lanza 404 si no existe)
    const materia = await this.mpModel.findById(materia_prima_id);
    if (!materia) {
      throw Object.assign(new Error('Materia prima no encontrada.'), { status: 404 });
    }

    // Aplicar strategy
    const strategy = getStrategy(tipo); // lanza si tipo inválido
    const { nuevoStock } = strategy.ejecutar(materia.stock_actual, Number(cantidad), { motivo });

    // Persistir movimiento
    const movimiento = await this.movModel.create({
      materia_prima_id,
      tipo,
      cantidad: Number(cantidad),
      stock_anterior: materia.stock_actual,
      stock_posterior: nuevoStock,
      motivo: motivo || null,
      usuario: usuario || null,
    });

    // Actualizar stock en materia prima
    await this.mpModel.update(materia_prima_id, { stock_actual: nuevoStock });

    // Alerta si quedó por debajo del mínimo
    const alerta =
      nuevoStock < materia.stock_minimo
        ? {
            tipo: 'stock_minimo',
            mensaje: `Stock de "${materia.nombre}" (${nuevoStock} ${materia.unidad}) es menor al mínimo (${materia.stock_minimo} ${materia.unidad}).`,
          }
        : null;

    return { movimiento, alerta };
  }
}

module.exports = MovimientoStockService;
