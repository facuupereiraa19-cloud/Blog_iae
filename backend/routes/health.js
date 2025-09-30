import { Router } from 'express';
import mongoose from 'mongoose';
import { IS_DEMO } from '../config.js';

const router = Router();

router.get('/', (_req, res) => {
  const jwtSet = Boolean(process.env.JWT_SECRET);
  const mongoState = mongoose?.connection?.readyState;
  const dbStatus = IS_DEMO
    ? 'skipped'
    : mongoState === 1
      ? 'connected'
      : mongoState === 2
        ? 'connecting'
        : mongoState === 3
          ? 'disconnecting'
          : 'disconnected';

  res.json({
    ok: jwtSet && (IS_DEMO || dbStatus === 'connected'),
    env: {
      demoMode: IS_DEMO,
      jwtSecretPresent: jwtSet,
      dbStatus,
      nodeEnv: process.env.NODE_ENV || 'development',
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;

