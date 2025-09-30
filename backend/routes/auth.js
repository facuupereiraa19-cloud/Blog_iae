import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { IS_DEMO } from '../config.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son requeridos' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET no está definida en el entorno' });
    }

    if (IS_DEMO) {
      // En demo aceptamos admin@iae.com / admin123 y devolvemos un token simple
      if (email !== 'admin@iae.com' || password !== 'admin123') {
        return res.status(401).json({ message: 'Credenciales inválidas (demo: admin@iae.com / admin123)' });
      }
      const token = jwt.sign({ id: 'demo-admin', role: 'admin' }, secret, { expiresIn: '4h' });
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Usuario demo ${email} inicio sesion`);
      return res.json({ token });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Usuario ${user._id} (${email}) inicio sesion`);
    return res.json({ token });
  } catch (err) {
    console.error('Error en /login:', err);
    return res.status(500).json({ message: 'Error interno' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son requeridos' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET no está definida en el entorno' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    if (IS_DEMO) {
      // En demo no persistimos usuarios nuevos
      const token = jwt.sign({ id: 'demo-admin', role: 'admin' }, secret, { expiresIn: '4h' });
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Usuario demo ${email} se registro`);
      return res.status(200).json({ token, user: { id: 'demo-admin', email, role: 'admin' }, message: 'Registro simulado en modo demo' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await User.create({ email, passwordHash, role: 'admin' });
    const token = jwt.sign({ id: created._id }, secret, { expiresIn: '1h' });
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Usuario ${created._id} (${email}) se registro`);

    return res.status(201).json({
      token,
      user: { id: created._id, email: created.email, role: created.role },
    });
  } catch (err) {
    console.error('Error en /register:', err);
    return res.status(500).json({ message: 'Error interno' });
  }
});

export default router;
