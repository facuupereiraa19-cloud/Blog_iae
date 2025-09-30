import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Post from '../models/Post.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Cargar .env del backend
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  const { DB_URL } = process.env;
  if (!DB_URL) {
    console.error('DB_URL no definida en backend/.env');
    process.exit(1);
  }

  // Conectar a MongoDB
  await mongoose.connect(DB_URL);

  try {
    // Verificar archivo fuente
    const src = path.resolve(__dirname, '../prueba.webp');
    if (!fs.existsSync(src)) {
      console.error('No existe backend/prueba.webp');
      process.exit(1);
    }

    // Asegurar carpeta uploads
    const uploadsDir = path.resolve(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Copiar con nombre único
    const filename = `${Date.now()}-prueba.webp`;
    const dest = path.join(uploadsDir, filename);
    fs.copyFileSync(src, dest);

    const relPath = `/uploads/${filename}`;

    // Buscar el post más reciente con título "prueba"
    const post = await Post.findOne({ title: 'prueba' }).sort({ createdAt: -1 });
    if (!post) {
      console.error('No encontré una publicación con título "prueba"');
      process.exit(1);
    }

    // Actualizar campos de media
    post.image = relPath;
    post.video = undefined;
    post.filePath = relPath;
    await post.save();

    console.log('OK: Post actualizado con', relPath, 'id=', String(post._id));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

