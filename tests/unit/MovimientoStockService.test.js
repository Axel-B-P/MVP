'use strict';

const MovimientoStockService = require('../../src/services/MovimientoStockService');

const mockMovModel = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockMpModel = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('MovimientoStockService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MovimientoStockService(mockMovModel, mockMpModel);
  });

  const materiaBase = {
    id: 'mp-1',
    nombre: 'Harina',
    unidad: 'kg',
    stock_actual: 100,
    stock_minimo: 20,
  };

  // ── registrar - ingreso ───────────────────────────────────────────────────
  describe('registrar() - ingreso', () => {
    test('registra ingreso y actualiza stock correctamente', async () => {
      mockMpModel.findById.mockResolvedValue(materiaBase);
      mockMovModel.create.mockResolvedValue({ id: 'mov-1', tipo: 'ingreso', cantidad: 50 });
      mockMpModel.update.mockResolvedValue({});

      const { movimiento, alerta } = await service.registrar({
        materia_prima_id: 'mp-1',
        tipo: 'ingreso',
        cantidad: 50,
      });

      expect(movimiento.tipo).toBe('ingreso');
      expect(alerta).toBeNull();
      expect(mockMpModel.update).toHaveBeenCalledWith('mp-1', { stock_actual: 150 });
    });

    test('genera alerta si stock queda bajo el mínimo tras ingreso', async () => {
      const materiaBajaStock = { ...materiaBase, stock_actual: 5, stock_minimo: 30 };
      mockMpModel.findById.mockResolvedValue(materiaBajaStock);
      mockMovModel.create.mockResolvedValue({ id: 'mov-2', tipo: 'ingreso', cantidad: 10 });
      mockMpModel.update.mockResolvedValue({});

      const { alerta } = await service.registrar({
        materia_prima_id: 'mp-1',
        tipo: 'ingreso',
        cantidad: 10,
      });

      expect(alerta).not.toBeNull();
      expect(alerta.tipo).toBe('stock_minimo');
    });
  });

  // ── registrar - egreso ────────────────────────────────────────────────────
  describe('registrar() - egreso', () => {
    test('registra egreso y actualiza stock', async () => {
      mockMpModel.findById.mockResolvedValue(materiaBase);
      mockMovModel.create.mockResolvedValue({ id: 'mov-3', tipo: 'egreso', cantidad: 30 });
      mockMpModel.update.mockResolvedValue({});

      const { movimiento } = await service.registrar({
        materia_prima_id: 'mp-1',
        tipo: 'egreso',
        cantidad: 30,
      });

      expect(movimiento.tipo).toBe('egreso');
      expect(mockMpModel.update).toHaveBeenCalledWith('mp-1', { stock_actual: 70 });
    });

    test('lanza error si egreso genera stock negativo', async () => {
      mockMpModel.findById.mockResolvedValue(materiaBase);

      await expect(
        service.registrar({ materia_prima_id: 'mp-1', tipo: 'egreso', cantidad: 200 })
      ).rejects.toThrow(/Stock insuficiente/);
    });

    test('genera alerta si stock queda bajo mínimo tras egreso', async () => {
      mockMpModel.findById.mockResolvedValue(materiaBase);
      mockMovModel.create.mockResolvedValue({ id: 'mov-4', tipo: 'egreso', cantidad: 90 });
      mockMpModel.update.mockResolvedValue({});

      const { alerta } = await service.registrar({
        materia_prima_id: 'mp-1',
        tipo: 'egreso',
        cantidad: 90,
      });

      // stock queda en 10, mínimo es 20 → debe alertar
      expect(alerta).not.toBeNull();
    });
  });

  // ── registrar - ajuste ────────────────────────────────────────────────────
  describe('registrar() - ajuste', () => {
    test('registra ajuste con motivo obligatorio', async () => {
      mockMpModel.findById.mockResolvedValue(materiaBase);
      mockMovModel.create.mockResolvedValue({ id: 'mov-5', tipo: 'ajuste', cantidad: 80 });
      mockMpModel.update.mockResolvedValue({});

      const { movimiento } = await service.registrar({
        materia_prima_id: 'mp-1',
        tipo: 'ajuste',
        cantidad: 80,
        motivo: 'Corrección por recuento físico',
      });

      expect(movimiento.tipo).toBe('ajuste');
      expect(mockMpModel.update).toHaveBeenCalledWith('mp-1', { stock_actual: 80 });
    });

    test('lanza error si ajuste no tiene motivo', async () => {
      mockMpModel.findById.mockResolvedValue(materiaBase);

      await expect(
        service.registrar({ materia_prima_id: 'mp-1', tipo: 'ajuste', cantidad: 50 })
      ).rejects.toThrow(/motivo es obligatorio/);
    });
  });

  // ── validaciones de entrada ───────────────────────────────────────────────
  describe('registrar() - validaciones de entrada', () => {
    test('lanza 400 si falta materia_prima_id', async () => {
      await expect(
        service.registrar({ tipo: 'ingreso', cantidad: 10 })
      ).rejects.toMatchObject({ status: 400 });
    });

    test('lanza 400 si falta tipo', async () => {
      await expect(
        service.registrar({ materia_prima_id: 'mp-1', cantidad: 10 })
      ).rejects.toMatchObject({ status: 400 });
    });

    test('lanza 400 si falta cantidad', async () => {
      await expect(
        service.registrar({ materia_prima_id: 'mp-1', tipo: 'ingreso' })
      ).rejects.toMatchObject({ status: 400 });
    });

    test('lanza 404 si materia prima no existe', async () => {
      mockMpModel.findById.mockResolvedValue(null);

      await expect(
        service.registrar({ materia_prima_id: 'inexistente', tipo: 'ingreso', cantidad: 10 })
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  // ── getAll / getById ──────────────────────────────────────────────────────
  describe('getAll() y getById()', () => {
    test('getAll retorna lista de movimientos', async () => {
      mockMovModel.findAll.mockResolvedValue([{ id: 'mov-1' }]);
      const result = await service.getAll({});
      expect(result).toHaveLength(1);
    });

    test('getById retorna movimiento existente', async () => {
      mockMovModel.findById.mockResolvedValue({ id: 'mov-1' });
      const result = await service.getById('mov-1');
      expect(result.id).toBe('mov-1');
    });

    test('getById lanza 404 si no existe', async () => {
      mockMovModel.findById.mockResolvedValue(null);
      await expect(service.getById('xxx')).rejects.toMatchObject({ status: 404 });
    });
  });
});
