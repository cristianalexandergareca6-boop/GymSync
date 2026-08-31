import { Attendance } from '../entities/Attendance.js';

export interface IAttendanceRepository {
  save(attendance: Attendance): Promise<Attendance>;
  findByClientId(clientId: number, limit?: number): Promise<Attendance[]>;
  getTodayAttendances(): Promise<Attendance[]>;
  countTodayAttendances(): Promise<number>;
}
