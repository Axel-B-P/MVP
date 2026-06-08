'use strict';

/**
 * Middleware de manejo centralizado de errores.
 * Debe ser el último middleware registrado en la app.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor.';

  // No exponer stack en producción
  const body = {
    success: false,
    error: message,
  };

  if (process.env.NODE_ENV === 'development') {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}

module.exports = errorHandler;
