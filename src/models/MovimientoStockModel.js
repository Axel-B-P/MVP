'use strict';

const SupabaseClient = require('../config/database');

const TABLE = 'movimientos_stock';

class MovimientoStockModel {
  constructor() {
    this.db = new SupabaseClient().getClient();
  }

  async findAll({ materia_prima_id, tipo, limit = 100, offset = 0 } = {}) {
    let query = this.db
      .from(TABLE)
      .select('*, materias_primas(nombre, unidad)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (materia_prima_id) query = query.eq('materia_prima_id', materia_prima_id);
    if (tipo) query = query.eq('tipo', tipo);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await this.db
      .from(TABLE)
      .select('*, materias_primas(nombre, unidad)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(movimiento) {
    const { data, error } = await this.db.from(TABLE).insert(movimiento).select().single();
    if (error) throw error;
    return data;
  }
}

module.exports = MovimientoStockModel;
