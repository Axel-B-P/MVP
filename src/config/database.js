'use strict';

const { createClient } = require('@supabase/supabase-js');

/**
 * Singleton pattern para la conexión a Supabase.
 * Garantiza una única instancia del cliente durante toda la vida de la app.
 */
class SupabaseClient {
  constructor() {
    if (SupabaseClient._instance) {
      return SupabaseClient._instance;
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
      throw new Error('SUPABASE_URL y SUPABASE_KEY son requeridas en las variables de entorno.');
    }

    this.client = createClient(url, key);
    SupabaseClient._instance = this;
  }

  getClient() {
    return this.client;
  }

  /** Solo para tests: resetear la instancia */
  static resetInstance() {
    SupabaseClient._instance = null;
  }
}

SupabaseClient._instance = null;

module.exports = SupabaseClient;
