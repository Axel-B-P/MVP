'use strict';

const MovimientoStockService = require('../services/MovimientoStockService');

class MovimientoStockController {
  constructor(service = new MovimientoStockService()) {
    this.service = service;
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.registrar = this.registrar.bind(this);
  }

  async getAll(req, res, next) {
    try {
      const { materia_prima_id, tipo, limit, offset } = req.query;
      const data = await this.service.getAll({
        materia_prima_id,
        tipo,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await this.service.getById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async registrar(req, res, next) {
    try {
      const result = await this.service.registrar(req.body);
      const status = result.alerta ? 201 : 201;
      res.status(status).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MovimientoStockController;
