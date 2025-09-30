import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Extensiones permitidas por si el mimetype llega vacío o como octet-stream
const allowedExt = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
  'mp4', 'm4v', 'webm', 'mov', 'avi', 'mkv', 'mpeg', 'mpg'
]);

function isAllowed(file) {
  const mime = (file.mimetype || '').toLowerCase();
  if (mime.startsWith('image') || mime.startsWith('video')) return true;

  // fallback por extensión
  const ext = path.extname(file.originalname || '').toLowerCase().replace(/^\./, '');
  if (allowedExt.has(ext)) return true;

  return false;
}

const maxMb = Math.max(1, Number(process.env.UPLOAD_MAX_MB || 100));
const uploader = multer({
  storage,
  // Límite configurable (por defecto 100MB)
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (isAllowed(file)) return cb(null, true);
    return cb(new Error('Solo se permiten archivos de imagen o video'));
  },
});

// Usamos .any() para aceptar distintos nombres de campo (file, image, video)
// y devolver errores JSON claros de Multer.
const anyHandler = uploader.any();

export default function uploadMiddleware(req, res, next) {
  anyHandler(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'El archivo supera el límite (25MB)' });
      }
      return res.status(400).json({ message: err.message || 'Archivo inválido' });
    }

    // Compatibilidad: exponer req.file como el primero si existe
    if (!req.file && Array.isArray(req.files) && req.files.length > 0) {
      req.file = req.files[0];
    }
    return next();
  });
}
