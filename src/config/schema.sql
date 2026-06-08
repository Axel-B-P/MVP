-- ============================================================
-- Schema: Sistema de Inventario - Panadería Argentina
-- Base de datos: Supabase (PostgreSQL)
-- ============================================================

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Materias Primas ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materias_primas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  unidad       TEXT NOT NULL,                  -- kg, gr, litros, unidades, etc.
  stock_actual NUMERIC(10, 2) NOT NULL DEFAULT 0,
  stock_minimo NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT stock_actual_no_negativo CHECK (stock_actual >= 0),
  CONSTRAINT stock_minimo_no_negativo CHECK (stock_minimo >= 0)
);

-- ── Movimientos de Stock ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS movimientos_stock (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  materia_prima_id UUID NOT NULL REFERENCES materias_primas(id) ON DELETE RESTRICT,
  tipo             TEXT NOT NULL CHECK (tipo IN ('ingreso', 'egreso', 'ajuste')),
  cantidad         NUMERIC(10, 2) NOT NULL CHECK (cantidad > 0),
  stock_anterior   NUMERIC(10, 2) NOT NULL,
  stock_posterior  NUMERIC(10, 2) NOT NULL,
  motivo           TEXT,                        -- obligatorio en ajuste (validado en app)
  usuario          TEXT,                        -- quién realizó el movimiento
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Índices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_movimientos_materia_prima ON movimientos_stock(materia_prima_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo          ON movimientos_stock(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_created_at    ON movimientos_stock(created_at DESC);

-- ── Datos de ejemplo ─────────────────────────────────────────
INSERT INTO materias_primas (nombre, unidad, stock_actual, stock_minimo) VALUES
  ('Harina 000',       'kg',       150, 50),
  ('Harina 0000',      'kg',       80,  30),
  ('Azúcar',           'kg',       60,  20),
  ('Sal fina',         'kg',       25,  10),
  ('Levadura seca',    'gr',       500, 200),
  ('Manteca',          'kg',       30,  15),
  ('Leche en polvo',   'kg',       20,  10),
  ('Agua',             'litros',   200, 50),
  ('Huevos',           'unidades', 120, 30),
  ('Esencia de vainilla', 'ml',    250, 100);
