import { Attendance } from '../../domain/entities/Attendance.js';
import { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository.js';

export class InMemoryAttendanceRepository implements IAttendanceRepository {
  private attendances: Attendance[] = [];
  private currentId = 1;

  constructor(initialAttendances: Attendance[] = []) {
    this.attendances = [...initialAttendances];
    if (this.attendances.length > 0) {
      this.currentId = Math.max(...this.attendances.map((a) => a.id || 0)) + 1;
    }
  }

  public async save(attendance: Attendance): Promise<Attendance> {
    const newAttendance = new Attendance({
      id: attendance.id || this.currentId++,
      idCliente: attendance.idCliente,
      fechaHoraIngreso: attendance.fechaHoraIngreso,
      estadoAcceso: attendance.estadoAcceso,
      colorSemaforo: attendance.colorSemaforo,
      motivo: attendance.motivo
    });

    this.attendances.push(newAttendance);
    return this.clone(newAttendance);
  }

  public async findByClientId(clientId: number, limit: number = 20): Promise<Attendance[]> {
    return this.attendances
      .filter((a) => a.idCliente === clientId)
      .sort((a, b) => b.fechaHoraIngreso.getTime() - a.fechaHoraIngreso.getTime())
      .slice(0, limit)
      .map((a) => this.clone(a));
  }

  public async getTodayAttendances(): Promise<Attendance[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.attendances
      .filter((a) => new Date(a.fechaHoraIngreso).getTime() >= today.getTime())
      .sort((a, b) => b.fechaHoraIngreso.getTime() - a.fechaHoraIngreso.getTime())
      .map((a) => this.clone(a));
  }

  public async countTodayAttendances(): Promise<number> {
    const list = await this.getTodayAttendances();
    return list.length;
  }

  private clone(a: Attendance): Attendance {
    return new Attendance({
      id: a.id,
      idCliente: a.idCliente,
      fechaHoraIngreso: a.fechaHoraIngreso,
      estadoAcceso: a.estadoAcceso,
      colorSemaforo: a.colorSemaforo,
      motivo: a.motivo
    });
  }
}
