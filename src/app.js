'use strict';

require('dotenv').config();

const express = require('express');
const materiaPrimaRoutes = require('./routes/materiaPrimaRoutes');
const movimientoStockRoutes = require('./routes/movimientoStockRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rutas API ─────────────────────────────────────────────────────────────────
app.use('/api/materias-primas', materiaPrimaRoutes);
app.use('/api/movimientos', movimientoStockRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada.' });
});

// ── Error handler (debe ir último) ───────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
