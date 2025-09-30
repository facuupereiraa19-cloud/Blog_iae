import express from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/ping', authenticateJWT, (req, res) => {
  res.json({ message: 'Token válido', user: req.user });
});

export default router;

