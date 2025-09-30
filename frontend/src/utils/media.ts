export function computeMediaUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:5000/api';
  let origin = 'http://localhost:5000';
  try { origin = new URL(API_BASE).origin; } catch { /* ignore */ }
  const normalized = path.includes('/uploads/') ? path.slice(path.indexOf('/uploads/')) : path;
  return `${origin}${normalized.startsWith('/') ? normalized : '/' + normalized}`;
}

export function isImagePath(path: string): boolean {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(path || '');
}

