'use strict';

const MateriaPrimaController = require('../../src/controllers/MateriaPrimaController');

const mockService = {
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getAlerts: jest.fn(),
};

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe('MateriaPrimaController', () => {
  let ctrl, req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    ctrl = new MateriaPrimaController(mockService);
    req = { params: {}, body: {}, query: {} };
    res = buildRes();
    next = jest.fn();
  });

  describe('getAll()', () => {
    test('responde 200 con lista de materias primas', async () => {
      mockService.getAll.mockResolvedValue([{ id: '1' }]);
      await ctrl.getAll(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: '1' }] });
    });

    test('llama next con error si el servicio falla', async () => {
      const err = new Error('DB error');
      mockService.getAll.mockRejectedValue(err);
      await ctrl.getAll(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('getById()', () => {
    test('responde 200 con materia prima encontrada', async () => {
      req.params.id = '1';
      mockService.getById.mockResolvedValue({ id: '1', nombre: 'Harina' });
      await ctrl.getById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test('llama next con error 404 si no existe', async () => {
      req.params.id = '999';
      const err = Object.assign(new Error('No encontrado'), { status: 404 });
      mockService.getById.mockRejectedValue(err);
      await ctrl.getById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('create()', () => {
    test('responde 201 al crear exitosamente', async () => {
      req.body = { nombre: 'Harina', unidad: 'kg' };
      mockService.create.mockResolvedValue({ id: '1', ...req.body });
      await ctrl.create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('llama next con error de validación', async () => {
      const err = Object.assign(new Error('Nombre requerido'), { status: 400 });
      mockService.create.mockRejectedValue(err);
      await ctrl.create(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('update()', () => {
    test('responde 200 al actualizar', async () => {
      req.params.id = '1';
      req.body = { nombre: 'Harina 000' };
      mockService.update.mockResolvedValue({ id: '1', nombre: 'Harina 000' });
      await ctrl.update(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('delete()', () => {
    test('responde 204 al eliminar', async () => {
      req.params.id = '1';
      mockService.delete.mockResolvedValue(true);
      await ctrl.delete(req, res, next);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('getAlerts()', () => {
    test('responde con materias en alerta', async () => {
      const alertas = [{ id: '1', stock_actual: 2, stock_minimo: 10 }];
      mockService.getAlerts.mockResolvedValue(alertas);
      await ctrl.getAlerts(req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, total: 1 })
      );
    });
  });
});
