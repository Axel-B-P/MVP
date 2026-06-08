'use strict';

const errorHandler = require('../../src/middlewares/errorHandler');

describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('responde con el status del error cuando está definido', () => {
    const err = Object.assign(new Error('No encontrado'), { status: 404 });
    process.env.NODE_ENV = 'test';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'No encontrado' })
    );
  });

  test('usa 500 si el error no tiene status', () => {
    const err = new Error('Error genérico');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('incluye stack en modo development', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Error dev');

    errorHandler(err, req, res, next);

    const call = res.json.mock.calls[0][0];
    expect(call.stack).toBeDefined();
  });

  test('no incluye stack fuera de development', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Error prod');

    errorHandler(err, req, res, next);

    const call = res.json.mock.calls[0][0];
    expect(call.stack).toBeUndefined();
  });
});
