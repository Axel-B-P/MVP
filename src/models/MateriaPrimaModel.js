'use strict';

const SupabaseClient = require('../config/database');

const TABLE = 'materias_primas';

class MateriaPrimaModel {
  constructor() {
    this.db = new SupabaseClient().getClient();
  }

  async findAll() {
    const { data, error } = await this.db.from(TABLE).select('*').order('nombre');
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await this.db.from(TABLE).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(materia) {
    const { data, error } = await this.db.from(TABLE).insert(materia).select().single();
    if (error) throw error;
    return data;
  }

  async update(id, fields) {
    const { data, error } = await this.db
      .from(TABLE)
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await this.db.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  /** Retorna todas las materias con stock por debajo del mínimo */
  async findBelowMinimum() {
    const { data, error } = await this.db
      .from(TABLE)
      .select('*')
      .filter('stock_actual', 'lt', this.db.raw('stock_minimo'));

    // Supabase no soporta comparaciones entre columnas vía REST directo,
    // así que filtramos en memoria tras obtener todo.
    if (error) throw error;
    return data;
  }

  async findAllWithAlerts() {
    const { data, error } = await this.db.from(TABLE).select('*');
    if (error) throw error;
    return data.filter((m) => m.stock_actual < m.stock_minimo);
  }
}

module.exports = MateriaPrimaModel;
