'use strict';

const MateriaPrimaService = require('../services/MateriaPrimaService');

class MateriaPrimaController {
  constructor(service = new MateriaPrimaService()) {
    this.service = service;
    // Bind para mantener contexto en Express
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getAlerts = this.getAlerts.bind(this);
  }

  async getAll(req, res, next) {
    try {
      const data = await this.service.getAll();
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

  async create(req, res, next) {
    try {
      const data = await this.service.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const data = await this.service.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async getAlerts(req, res, next) {
    try {
      const data = await this.service.getAlerts();
      res.json({
        success: true,
        total: data.length,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MateriaPrimaController;
