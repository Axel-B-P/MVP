'use strict';

const { Router } = require('express');
const MateriaPrimaController = require('../controllers/MateriaPrimaController');

const router = Router();
const ctrl = new MateriaPrimaController();

/**
 * @route   GET /api/materias-primas
 * @desc    Listar todas las materias primas
 */
router.get('/', ctrl.getAll);

/**
 * @route   GET /api/materias-primas/alertas
 * @desc    Materias primas con stock por debajo del mínimo
 * IMPORTANTE: esta ruta debe ir ANTES de /:id para no ser capturada
 */
router.get('/alertas', ctrl.getAlerts);

/**
 * @route   GET /api/materias-primas/:id
 * @desc    Obtener materia prima por ID
 */
router.get('/:id', ctrl.getById);

/**
 * @route   POST /api/materias-primas
 * @desc    Crear nueva materia prima
 * @body    { nombre, unidad, stock_actual?, stock_minimo? }
 */
router.post('/', ctrl.create);

/**
 * @route   PUT /api/materias-primas/:id
 * @desc    Actualizar materia prima (nombre, unidad, stock_minimo)
 */
router.put('/:id', ctrl.update);

/**
 * @route   DELETE /api/materias-primas/:id
 * @desc    Eliminar materia prima
 */
router.delete('/:id', ctrl.delete);

module.exports = router;
