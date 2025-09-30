import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import dbConnection, { connectPromise } from './db.js';
import User from './models/User.js';
import Post from './models/Post.js';

async function run() {
  // Esperar a que la conexión de db.js esté lista
  await connectPromise;

  try {
    const email = 'admin@iae.com';
    const plainPassword = 'admin123';

    let admin = await User.findOne({ email });
    if (!admin) {
      const passwordHash = await bcrypt.hash(plainPassword, 10);
      admin = await User.create({ email, passwordHash, role: 'admin' });
      console.log('Usuario admin creado:', admin.email);
    } else {
      console.log('Usuario admin ya existe:', admin.email);
    }

    const postsCount = await Post.countDocuments({ userId: admin._id });
    if (postsCount === 0) {
      await Post.insertMany([
        {
          title: 'Bienvenido al blog',
          content: 'Este es el primer post de ejemplo.',
          userId: admin._id,
          views: 10,
          likes: 2,
        },
        {
          title: 'Segundo post',
          content: 'Otro contenido de ejemplo para iniciar el proyecto.',
          userId: admin._id,
          views: 5,
          likes: 1,
        },
        {
          title: 'Tercer post',
          content: 'Más contenido para probar la lista de publicaciones.',
          userId: admin._id,
          views: 0,
          likes: 0,
        },
      ]);
      console.log('Publicaciones de ejemplo insertadas');
    } else {
      console.log('Ya existen publicaciones para el admin, no se insertan duplicados');
    }
  } finally {
    // Cerrar la conexión
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

run().catch((err) => {
  console.error('Error durante el seed:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
