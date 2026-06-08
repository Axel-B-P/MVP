'use strict';

const MovimientoStockController = require('../../src/controllers/MovimientoStockController');

const mockService = {
  getAll: jest.fn(),
  getById: jest.fn(),
  registrar: jest.fn(),
};

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('MovimientoStockController', () => {
  let ctrl, req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    ctrl = new MovimientoStockController(mockService);
    req = { params: {}, body: {}, query: {} };
    res = buildRes();
    next = jest.fn();
  });

  describe('getAll()', () => {
    test('responde con lista de movimientos', async () => {
      mockService.getAll.mockResolvedValue([{ id: 'mov-1' }]);
      await ctrl.getAll(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'mov-1' }] });
    });

    test('pasa filtros de query al servicio', async () => {
      req.query = { tipo: 'ingreso', limit: '10', offset: '0' };
      mockService.getAll.mockResolvedValue([]);
      await ctrl.getAll(req, res, next);
      expect(mockService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'ingreso', limit: 10, offset: 0 })
      );
    });

    test('llama next con error si el servicio falla', async () => {
      mockService.getAll.mockRejectedValue(new Error('fail'));
      await ctrl.getAll(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getById()', () => {
    test('responde 200 con el movimiento', async () => {
      req.params.id = 'mov-1';
      mockService.getById.mockResolvedValue({ id: 'mov-1' });
      await ctrl.getById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('llama next con 404 si no existe', async () => {
      req.params.id = 'x';
      mockService.getById.mockRejectedValue(Object.assign(new Error('No encontrado'), { status: 404 }));
      await ctrl.getById(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('registrar()', () => {
    test('responde 201 al registrar movimiento sin alerta', async () => {
      req.body = { materia_prima_id: 'mp-1', tipo: 'ingreso', cantidad: 50 };
      mockService.registrar.mockResolvedValue({
        movimiento: { id: 'mov-1', tipo: 'ingreso' },
        alerta: null,
      });
      await ctrl.registrar(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('responde 201 y devuelve alerta cuando hay stock bajo mínimo', async () => {
      req.body = { materia_prima_id: 'mp-1', tipo: 'egreso', cantidad: 90 };
      mockService.registrar.mockResolvedValue({
        movimiento: { id: 'mov-2' },
        alerta: { tipo: 'stock_minimo', mensaje: 'Stock bajo' },
      });
      await ctrl.registrar(req, res, next);
      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg.alerta).toBeDefined();
    });

    test('llama next con error de validación', async () => {
      const err = Object.assign(new Error('cantidad requerida'), { status: 400 });
      mockService.registrar.mockRejectedValue(err);
      await ctrl.registrar(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
