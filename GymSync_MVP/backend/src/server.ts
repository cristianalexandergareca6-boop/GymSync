import { createApp } from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;
const { app } = createApp();

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🏋️  GymSync API Server en ejecución`);
  console.log(`🚀 Puerto: http://localhost:${PORT}`);
  console.log(`🚦 Semáforo y Control de Acceso: http://localhost:${PORT}/api/access`);
  console.log(`📋 Clientes / Socios: http://localhost:${PORT}/api/clients`);
  console.log(`💳 Membresías y Pagos: http://localhost:${PORT}/api/memberships`);
  console.log(`=========================================`);
});
