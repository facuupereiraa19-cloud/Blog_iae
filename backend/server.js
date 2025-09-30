import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import initPassport from './passportConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { initSocket } from './socket.js';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import privateRoutes from './routes/private.js';
import healthRoutes from './routes/health.js';
import settingsRoutes from './routes/settings.js';
import './db.js';

// Cargar .env desde backend/.env sin depender del cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Validar JWT_SECRET antes de inicializar Passport
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET no está definida. Añádela en backend/.env');
  process.exit(1);
}

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
initPassport(passport);

// Middleware de logs para requests
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const timestamp = new Date().toISOString();
    const duration = Date.now() - startedAt;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Ping route
app.get('/api/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/private', privateRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/settings', settingsRoutes);

// Servir archivos subidos (imagenes/videos)
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

const PORT = 5000;
const httpServer = http.createServer(app);
initSocket(httpServer);

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log('Servidor corriendo en http://localhost:5000');
  });
}

export { app, httpServer };
