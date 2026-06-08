'use strict';

const { Router } = require('express');
const MovimientoStockController = require('../controllers/MovimientoStockController');

const router = Router();
const ctrl = new MovimientoStockController();

/**
 * @route   GET /api/movimientos
 * @desc    Listar movimientos (filtros: materia_prima_id, tipo, limit, offset)
 */
router.get('/', ctrl.getAll);

/**
 * @route   GET /api/movimientos/:id
 * @desc    Obtener movimiento por ID
 */
router.get('/:id', ctrl.getById);

/**
 * @route   POST /api/movimientos
 * @desc    Registrar movimiento de stock
 * @body    { materia_prima_id, tipo, cantidad, motivo?, usuario? }
 */
router.post('/', ctrl.registrar);

module.exports = router;
