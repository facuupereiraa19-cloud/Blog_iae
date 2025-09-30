export function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}

