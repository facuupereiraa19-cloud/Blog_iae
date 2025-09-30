import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Post from '../models/Post.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  const { DB_URL } = process.env;
  if (!DB_URL) throw new Error('DB_URL no está definida');
  await mongoose.connect(DB_URL);
  const post = await Post.findOne({ title: 'prueba' }).sort({ createdAt: -1 }).lean();
  console.log(JSON.stringify(post, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

