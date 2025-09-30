import Settings from '../models/Settings.js';
import { IS_DEMO } from '../config.js';

// Defaults aligned with quasar.variables.scss
const DEFAULTS = Object.freeze({
  featuredLayout: 2,
  colors: {
    primary: '#1976d2',
    secondary: '#26a69a',
    accent: '#9c27b0',
    positive: '#21ba45',
    negative: '#c10015',
    info: '#31ccec',
    warning: '#f2c037',
  },
});

let demoSettings = { ...DEFAULTS };

function sanitize(input = {}) {
  const out = { };
  if (input.featuredLayout != null) {
    const n = Number(input.featuredLayout);
    if ([1, 2, 4].includes(n)) out.featuredLayout = n;
  }
  if (input.colors && typeof input.colors === 'object') {
    const c = input.colors;
    out.colors = {};
    for (const k of ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning']) {
      if (typeof c[k] === 'string' && c[k].trim()) {
        out.colors[k] = c[k].trim();
      }
    }
    if (Object.keys(out.colors).length === 0) delete out.colors;
  }
  return out;
}

export async function getSettings(_req, res) {
  try {
    if (IS_DEMO) {
      return res.json(demoSettings);
    }
    let doc = await Settings.findOne({}).lean();
    if (!doc) {
      // Create defaults when missing
      doc = (await Settings.create({ ...DEFAULTS })).toObject();
    }
    return res.json({
      featuredLayout: doc.featuredLayout ?? DEFAULTS.featuredLayout,
      colors: { ...DEFAULTS.colors, ...(doc.colors || {}) },
    });
  } catch (err) {
    console.error('getSettings error:', err);
    return res.status(500).json({ message: 'Error al obtener configuración' });
  }
}

export async function updateSettings(req, res) {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }
    const patch = sanitize(req.body || {});
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: 'Sin cambios' });
    }

    if (IS_DEMO) {
      demoSettings = { ...demoSettings, ...patch, ...(patch.colors ? { colors: { ...demoSettings.colors, ...patch.colors } } : {}) };
      return res.json(demoSettings);
    }

    const existing = await Settings.findOne({});
    if (!existing) {
      const created = await Settings.create({ ...DEFAULTS, ...patch, ...(patch.colors ? { colors: { ...DEFAULTS.colors, ...patch.colors } } : {}) });
      return res.json(created);
    }

    if (patch.colors) {
      existing.colors = { ...(existing.colors || {}), ...patch.colors };
      delete patch.colors;
    }
    Object.assign(existing, patch);
    const saved = await existing.save();
    return res.json(saved);
  } catch (err) {
    console.error('updateSettings error:', err);
    return res.status(500).json({ message: 'Error al actualizar configuración' });
  }
}

