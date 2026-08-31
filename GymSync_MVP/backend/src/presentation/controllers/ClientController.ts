import { Request, Response, NextFunction } from 'express';
import { RegisterClientUseCase } from '../../application/use-cases/RegisterClientUseCase.js';
import { UpdateClientUseCase } from '../../application/use-cases/UpdateClientUseCase.js';
import { IClientRepository } from '../../domain/repositories/IClientRepository.js';

export class ClientController {
  constructor(
    private readonly registerClientUseCase: RegisterClientUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly clientRepository: IClientRepository
  ) {}

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;
      let clients;
      if (search && typeof search === 'string') {
        clients = await this.clientRepository.searchByQuery(search);
      } else {
        clients = await this.clientRepository.findAll();
      }

      const response = clients.map((c) => ({
        id: c.id,
        codigoSocio: c.codigoSocio,
        nombre: c.nombre,
        apellido: c.apellido,
        nombreCompleto: c.getFullName(),
        ci: c.ci.getValue(),
        correo: c.correo,
        telefono: c.telefono,
        contactoEmergencia: c.contactoEmergencia,
        telefonoEmergencia: c.telefonoEmergencia,
        estadoMedico: c.estadoMedico,
        activo: c.activo,
        fechaRegistro: c.fechaRegistro.toISOString()
      }));

      res.json({ success: true, data: response });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID de cliente inválido.' });
      }

      const client = await this.clientRepository.findById(id);
      if (!client) {
        return res.status(404).json({ success: false, error: 'Socio no encontrado.' });
      }

      res.json({
        success: true,
        data: {
          id: client.id,
          codigoSocio: client.codigoSocio,
          nombre: client.nombre,
          apellido: client.apellido,
          nombreCompleto: client.getFullName(),
          ci: client.ci.getValue(),
          correo: client.correo,
          telefono: client.telefono,
          contactoEmergencia: client.contactoEmergencia,
          telefonoEmergencia: client.telefonoEmergencia,
          estadoMedico: client.estadoMedico,
          activo: client.activo,
          fechaRegistro: client.fechaRegistro.toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, apellido, ci, correo, telefono, contactoEmergencia, telefonoEmergencia, estadoMedico } = req.body;

      if (!nombre || !apellido || !ci) {
        return res.status(400).json({
          success: false,
          error: 'Los campos nombre, apellido y C.I. son obligatorios.'
        });
      }

      const context = {
        idUsuarioOperador: req.user?.id,
        rolUsuario: req.user?.rol,
        ipOrigen: req.user?.ip || req.ip
      };

      const result = await this.registerClientUseCase.execute(
        {
          nombre,
          apellido,
          ci,
          correo,
          telefono,
          contactoEmergencia,
          telefonoEmergencia,
          estadoMedico
        },
        context
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID de cliente inválido.' });
      }

      const { nombre, apellido, correo, telefono, contactoEmergencia, telefonoEmergencia, estadoMedico } = req.body;

      const context = {
        idUsuarioOperador: req.user?.id,
        rolUsuario: req.user?.rol,
        ipOrigen: req.user?.ip || req.ip
      };

      const result = await this.updateClientUseCase.execute(
        {
          id,
          nombre,
          apellido,
          correo,
          telefono,
          contactoEmergencia,
          telefonoEmergencia,
          estadoMedico
        },
        context
      );

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
