import { Request, Response, NextFunction } from 'express';
import { GetClientAccessStatusUseCase } from '../../application/use-cases/GetClientAccessStatusUseCase.js';
import { RegisterAttendanceUseCase } from '../../application/use-cases/RegisterAttendanceUseCase.js';
import { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository.js';

export class AccessController {
  constructor(
    private readonly getClientAccessStatusUseCase: GetClientAccessStatusUseCase,
    private readonly registerAttendanceUseCase: RegisterAttendanceUseCase,
    private readonly attendanceRepository: IAttendanceRepository
  ) {}

  public getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.params.query || (req.query.q as string);
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Debe ingresar un C.I. o Código de Socio para consultar el estado.'
        });
      }

      const result = await this.getClientAccessStatusUseCase.execute(query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public checkIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idCliente, forzarIngreso } = req.body;
      if (!idCliente) {
        return res.status(400).json({
          success: false,
          error: 'idCliente es obligatorio para registrar asistencia.'
        });
      }

      const result = await this.registerAttendanceUseCase.execute({
        idCliente: Number(idCliente),
        forzarIngreso: Boolean(forzarIngreso)
      });

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      // Si el error es por bloqueo de semáforo rojo, respondemos 403 Forbidden
      if (error.message && error.message.includes('ACCESO DENEGADO')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  };

  public getRecentAttendances = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const attendances = await this.attendanceRepository.getTodayAttendances();
      const count = await this.attendanceRepository.countTodayAttendances();

      res.json({
        success: true,
        data: {
          totalHoy: count,
          asistencias: attendances
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
