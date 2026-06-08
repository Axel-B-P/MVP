'use strict';

const MateriaPrimaModel = require('../models/MateriaPrimaModel');

class MateriaPrimaService {
  constructor(model = new MateriaPrimaModel()) {
    this.model = model;
  }

  async getAll() {
    return this.model.findAll();
  }

  async getById(id) {
    const materia = await this.model.findById(id);
    if (!materia) throw Object.assign(new Error('Materia prima no encontrada.'), { status: 404 });
    return materia;
  }

  async create({ nombre, unidad, stock_actual = 0, stock_minimo = 0 }) {
    if (!nombre || nombre.trim() === '') {
      throw Object.assign(new Error('El nombre es requerido.'), { status: 400 });
    }
    if (!unidad || unidad.trim() === '') {
      throw Object.assign(new Error('La unidad es requerida.'), { status: 400 });
    }
    if (stock_actual < 0) {
      throw Object.assign(new Error('El stock inicial no puede ser negativo.'), { status: 400 });
    }
    if (stock_minimo < 0) {
      throw Object.assign(new Error('El stock mínimo no puede ser negativo.'), { status: 400 });
    }

    return this.model.create({
      nombre: nombre.trim(),
      unidad: unidad.trim(),
      stock_actual,
      stock_minimo,
    });
  }

  async update(id, fields) {
    await this.getById(id); // valida existencia
    const allowed = ['nombre', 'unidad', 'stock_minimo'];
    const sanitized = {};
    for (const key of allowed) {
      if (fields[key] !== undefined) sanitized[key] = fields[key];
    }
    if (Object.keys(sanitized).length === 0) {
      throw Object.assign(new Error('No se enviaron campos válidos para actualizar.'), { status: 400 });
    }
    if (sanitized.stock_minimo !== undefined && sanitized.stock_minimo < 0) {
      throw Object.assign(new Error('El stock mínimo no puede ser negativo.'), { status: 400 });
    }
    return this.model.update(id, sanitized);
  }

  async delete(id) {
    await this.getById(id);
    return this.model.delete(id);
  }

  async getAlerts() {
    return this.model.findAllWithAlerts();
  }
}

module.exports = MateriaPrimaService;
