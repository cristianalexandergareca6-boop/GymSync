import { Request, Response, NextFunction } from 'express';
import { CreateMembershipUseCase } from '../../application/use-cases/CreateMembershipUseCase.js';
import { RegisterPaymentUseCase } from '../../application/use-cases/RegisterPaymentUseCase.js';
import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository.js';

export class MembershipController {
  constructor(
    private readonly createMembershipUseCase: CreateMembershipUseCase,
    private readonly registerPaymentUseCase: RegisterPaymentUseCase,
    private readonly membershipRepository: IMembershipRepository,
    private readonly paymentRepository: IPaymentRepository
  ) {}

  public getPlans = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await this.membershipRepository.findAllPlans();
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  };

  public getMembershipsByClientId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = parseInt(req.params.clientId, 10);
      if (isNaN(clientId)) {
        return res.status(400).json({ success: false, error: 'ID de cliente inválido.' });
      }

      const memberships = await this.membershipRepository.findAllMembershipsByClientId(clientId);
      const data = memberships.map((m) => ({
        id: m.id,
        idCliente: m.idCliente,
        idPlan: m.idPlan,
        planNombre: m.planNombre,
        fechaInicio: m.fechaInicio.toISOString().split('T')[0],
        fechaVencimiento: m.fechaVencimiento.toISOString().split('T')[0],
        precioCongelado: m.precioCongelado,
        saldoPendiente: m.saldoPendiente,
        estado: m.estado,
        diasRestantes: m.getDaysRemaining(),
        estaVencida: m.isExpired()
      }));

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public createMembership = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idCliente, idPlan, fechaInicio, montoPagoInicial, metodoPagoInicial, numeroComprobante } = req.body;

      if (!idCliente || !idPlan) {
        return res.status(400).json({
          success: false,
          error: 'idCliente e idPlan son obligatorios.'
        });
      }

      const result = await this.createMembershipUseCase.execute({
        idCliente: Number(idCliente),
        idPlan: Number(idPlan),
        fechaInicio,
        montoPagoInicial: montoPagoInicial ? Number(montoPagoInicial) : 0,
        metodoPagoInicial,
        numeroComprobante
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public registerPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idMembresia, monto, metodoPago, numeroComprobante, observaciones } = req.body;

      if (!idMembresia || !monto || !metodoPago) {
        return res.status(400).json({
          success: false,
          error: 'idMembresia, monto y metodoPago son obligatorios.'
        });
      }

      const context = {
        idUsuarioOperador: req.user?.id,
        rolUsuario: req.user?.rol,
        ipOrigen: req.user?.ip || req.ip
      };

      const result = await this.registerPaymentUseCase.execute(
        {
          idMembresia: Number(idMembresia),
          monto: Number(monto),
          metodoPago,
          numeroComprobante,
          observaciones
        },
        context
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getPaymentsByMembershipId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const membershipId = parseInt(req.params.membershipId, 10);
      if (isNaN(membershipId)) {
        return res.status(400).json({ success: false, error: 'ID de membresía inválido.' });
      }

      const payments = await this.paymentRepository.findByMembershipId(membershipId);
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  };
}
