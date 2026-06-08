'use strict';

const MateriaPrimaService = require('../../src/services/MateriaPrimaService');

// Mock del modelo
const mockModel = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAllWithAlerts: jest.fn(),
};

describe('MateriaPrimaService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MateriaPrimaService(mockModel);
  });

  // ── getAll ────────────────────────────────────────────────────────────────
  describe('getAll()', () => {
    test('retorna todas las materias primas', async () => {
      const mockData = [{ id: '1', nombre: 'Harina' }];
      mockModel.findAll.mockResolvedValue(mockData);

      const result = await service.getAll();
      expect(result).toEqual(mockData);
      expect(mockModel.findAll).toHaveBeenCalledTimes(1);
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────
  describe('getById()', () => {
    test('retorna materia prima por ID', async () => {
      const mockData = { id: '1', nombre: 'Harina' };
      mockModel.findById.mockResolvedValue(mockData);

      const result = await service.getById('1');
      expect(result).toEqual(mockData);
    });

    test('lanza error 404 si no existe', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.getById('999')).rejects.toMatchObject({
        message: 'Materia prima no encontrada.',
        status: 404,
      });
    });
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    test('crea materia prima con datos válidos', async () => {
      const input = { nombre: 'Harina 000', unidad: 'kg', stock_actual: 50, stock_minimo: 10 };
      mockModel.create.mockResolvedValue({ id: '1', ...input });

      const result = await service.create(input);
      expect(result.nombre).toBe('Harina 000');
      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Harina 000', unidad: 'kg' })
      );
    });

    test('lanza error si nombre está vacío', async () => {
      await expect(service.create({ nombre: '', unidad: 'kg' })).rejects.toMatchObject({
        status: 400,
      });
    });

    test('lanza error si unidad está vacía', async () => {
      await expect(service.create({ nombre: 'Harina', unidad: '' })).rejects.toMatchObject({
        status: 400,
      });
    });

    test('lanza error si stock inicial es negativo', async () => {
      await expect(
        service.create({ nombre: 'Harina', unidad: 'kg', stock_actual: -1 })
      ).rejects.toMatchObject({ status: 400 });
    });

    test('lanza error si stock mínimo es negativo', async () => {
      await expect(
        service.create({ nombre: 'Harina', unidad: 'kg', stock_minimo: -5 })
      ).rejects.toMatchObject({ status: 400 });
    });

    test('usa stock_actual=0 y stock_minimo=0 por defecto', async () => {
      mockModel.create.mockResolvedValue({ id: '1', nombre: 'Sal', unidad: 'kg', stock_actual: 0, stock_minimo: 0 });
      await service.create({ nombre: 'Sal', unidad: 'kg' });
      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ stock_actual: 0, stock_minimo: 0 })
      );
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update()', () => {
    test('actualiza campos válidos', async () => {
      mockModel.findById.mockResolvedValue({ id: '1', nombre: 'Harina' });
      mockModel.update.mockResolvedValue({ id: '1', nombre: 'Harina 000' });

      const result = await service.update('1', { nombre: 'Harina 000' });
      expect(result.nombre).toBe('Harina 000');
    });

    test('lanza error si no hay campos válidos', async () => {
      mockModel.findById.mockResolvedValue({ id: '1' });
      await expect(service.update('1', { stock_actual: 999 })).rejects.toMatchObject({
        status: 400,
      });
    });

    test('lanza error si stock_minimo es negativo', async () => {
      mockModel.findById.mockResolvedValue({ id: '1' });
      await expect(service.update('1', { stock_minimo: -1 })).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────
  describe('delete()', () => {
    test('elimina materia prima existente', async () => {
      mockModel.findById.mockResolvedValue({ id: '1' });
      mockModel.delete.mockResolvedValue(true);

      await expect(service.delete('1')).resolves.toBe(true);
    });

    test('lanza 404 al intentar eliminar inexistente', async () => {
      mockModel.findById.mockResolvedValue(null);
      await expect(service.delete('999')).rejects.toMatchObject({ status: 404 });
    });
  });

  // ── getAlerts ─────────────────────────────────────────────────────────────
  describe('getAlerts()', () => {
    test('retorna materias con stock bajo el mínimo', async () => {
      const alertas = [{ id: '1', nombre: 'Azúcar', stock_actual: 2, stock_minimo: 10 }];
      mockModel.findAllWithAlerts.mockResolvedValue(alertas);

      const result = await service.getAlerts();
      expect(result).toEqual(alertas);
    });
  });
});
