import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error Handler]:', err.message || err);

  const status = err.status || 400;
  return res.status(status).json({
    success: false,
    error: err.message || 'Ocurrió un error inesperado en el servidor.'
  });
}
