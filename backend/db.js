import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { IS_DEMO } from './config.js';

// Cargar variables de entorno desde backend/.env (independiente del cwd)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// En modo demo, no conectamos a MongoDB
if (IS_DEMO) {
  console.log('[DEMO_MODE] Usando almacenamiento en memoria, sin MongoDB.');
}

const { DB_URL } = process.env;

let connectPromise;
let connection;

if (IS_DEMO) {
  connectPromise = Promise.resolve(null);
  // Exportamos un objeto "connection" mínimo para compatibilidad
  connection = /** @type {any} */ ({ readyState: 1 });
} else {
  if (!DB_URL) {
    throw new Error('DB_URL no está definida. Asegúrate de tener backend/.env con DB_URL=...');
  }
  // Conectar a MongoDB y exportar conexión y promesa de conexión
  connectPromise = mongoose.connect(DB_URL).then(() => {
    console.log('MongoDB conectado');
    return mongoose.connection;
  });
  connection = mongoose.connection;
}

export { connectPromise };
export default connection;
