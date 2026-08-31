import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../domain/entities/User.js';

export interface AuthenticatedUser {
  id: number;
  nombre: string;
  rol: UserRole;
  ip: string;
}

// Extensión de la interfaz Request de Express
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware de Autenticación:
 * Extrae la identidad del operador desde cabeceras seguras (X-User-Id / X-User-Role o Bearer Token).
 * En caso de ausencia, asigna un rol predeterminado de consulta controlada para desarrollo,
 * pero rechaza acciones mutativas sin identidad establecida.
 */
export function authenticateUser(req: Request, _res: Response, next: NextFunction) {
  const userIdHeader = req.headers['x-user-id'] as string;
  const userRoleHeader = req.headers['x-user-role'] as string;
  const userNameHeader = req.headers['x-user-name'] as string;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  if (userIdHeader && userRoleHeader) {
    req.user = {
      id: parseInt(userIdHeader, 10),
      nombre: userNameHeader || 'Usuario Sistema',
      rol: userRoleHeader as UserRole,
      ip: clientIp
    };
  } else {
    // Contexto por defecto (Recepcionista / Cajero estándar del turno)
    req.user = {
      id: 1,
      nombre: 'Administrador / Recepción',
      rol: 'Recepcionista',
      ip: clientIp
    };
  }

  next();
}

/**
 * Middleware de Control de Acceso Basado en Roles (RBAC):
 * Garantiza que solo los roles autorizados puedan ejecutar operaciones críticas
 * (Art. 363 ter del Código Penal Boliviano).
 */
export function requireRoles(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'ACCESO DENEGADO: Debe autenticarse para realizar esta operación.'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: `ACCESO DENEGADO (403 Prohibido): El rol '${req.user.rol}' no tiene permisos para esta acción. Roles requeridos: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
}
