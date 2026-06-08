'use strict';

describe('SupabaseClient Singleton', () => {
  let SupabaseClient;

  beforeEach(() => {
    // Limpiar módulos para tener instancia fresca
    jest.resetModules();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_KEY = 'test-key';
    SupabaseClient = require('../../src/config/database');
    SupabaseClient.resetInstance();
  });

  test('retorna la misma instancia en múltiples llamados (Singleton)', () => {
    const instance1 = new SupabaseClient();
    const instance2 = new SupabaseClient();
    expect(instance1).toBe(instance2);
  });

  test('getClient() retorna el cliente de Supabase', () => {
    const instance = new SupabaseClient();
    expect(instance.getClient()).toBeDefined();
  });

  test('lanza error si SUPABASE_URL no está definida', () => {
    SupabaseClient.resetInstance();
    delete process.env.SUPABASE_URL;
    expect(() => new SupabaseClient()).toThrow(/SUPABASE_URL/);
  });

  test('lanza error si SUPABASE_KEY no está definida', () => {
    SupabaseClient.resetInstance();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_KEY;
    expect(() => new SupabaseClient()).toThrow(/SUPABASE_KEY/);
  });
});
