export async function login(req, res) {
  const { email } = req.body ?? {};
  // Demo response; replace with real auth
  return res.json({
    token: 'demo-token',
    user: { id: 1, name: 'Demo User', email: email || 'demo@example.com' },
  });
}

export async function register(req, res) {
  const { name, email } = req.body ?? {};
  // Demo response; replace with real register
  return res.status(201).json({ id: Date.now(), name: name || 'Nuevo', email: email || 'new@example.com' });
}

export async function me(_req, res) {
  // Demo response; replace with real profile
  return res.json({ id: 1, name: 'Demo User', email: 'demo@example.com' });
}

