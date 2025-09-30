import Post from '../models/Post.js';
import { IS_DEMO } from '../config.js';
import { getIO } from '../socket.js';

const VALID_SIZES = new Set(['large', 'medium', 'small']);

function normalizeSize(value, fallback = 'medium') {
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (VALID_SIZES.has(lower)) return lower;
  }
  return fallback;
}

// Almacenamiento en memoria para modo demo
let demoPosts = [
  {
    _id: 'p1',
    title: 'Bienvenido al blog (Demo)',
    content: 'Estás corriendo el modo demo sin base de datos.',
    filePath: undefined,
    image: undefined,
    video: undefined,
    createdAt: new Date().toISOString(),
    views: 3,
    likes: 1,
    size: 'medium',
    userId: 'demo-admin',
  },
];

export async function getPosts(_req, res) {
  try {
    if (IS_DEMO) {
      const sorted = [...demoPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(sorted);
    }
    const posts = await Post.find({}).sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    console.error('getPosts error:', err);
    return res.status(500).json({ message: 'Error al obtener publicaciones' });
  }
}

export async function getPostById(req, res) {
  try {
    const { id } = req.params;
    if (IS_DEMO) {
      const post = demoPosts.find((p) => String(p._id) === String(id));
      if (!post) return res.status(404).json({ message: 'Publicación no encontrada' });
      return res.json(post);
    }
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Publicación no encontrada' });
    return res.json(post);
  } catch (err) {
    console.error('getPostById error:', err);
    return res.status(500).json({ message: 'Error al obtener publicación' });
  }
}

export async function createPost(req, res) {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { title, content } = req.body ?? {};
    const size = normalizeSize(req.body?.size);
    if (!title || !content) {
      return res.status(400).json({ message: 'title y content son requeridos' });
    }

    let image;
    let video;
    let filePath;
    const file = req.file;
    if (file) {
      const isImage = file.mimetype?.startsWith('image');
      const isVideo = file.mimetype?.startsWith('video');
      const relPath = `/uploads/${file.filename}`;
      if (isImage) image = relPath;
      else if (isVideo) video = relPath;
      // Guardar ruta relativa accesible desde el navegador
      filePath = relPath;
    }

    if (IS_DEMO) {
      const newPost = {
        _id: `p${Date.now()}`,
        title,
        content,
        image,
        video,
        filePath,
        size,
        userId: 'demo-admin',
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0,
      };
      demoPosts.unshift(newPost);
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Usuario demo-admin publico ${title}`);
      try { getIO().emit('posts:created', newPost); } catch {}
      return res.status(201).json(newPost);
    }

    const post = await Post.create({
      title,
      content,
      image,
      video,
      filePath,
      size,
      userId: currentUser._id,
      createdAt: new Date(),
    });
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Usuario ${currentUser._id} publico ${post.title}`);

    try { getIO().emit('posts:created', post); } catch {}
    return res.status(201).json(post);
  } catch (err) {
    console.error('createPost error:', err);
    return res.status(500).json({ message: 'Error al crear la publicación' });
  }
}

export async function updatePost(req, res) {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { id } = req.params;
    const { title, content } = req.body ?? {};
    const normalizedSize = normalizeSize(req.body?.size, null);

    const update = {};
    if (typeof title === 'string') update.title = title;
    if (typeof content === 'string') update.content = content;
    if (normalizedSize) update.size = normalizedSize;

    const file = req.file;
    if (file) {
      const isImage = file.mimetype?.startsWith('image');
      const isVideo = file.mimetype?.startsWith('video');
      const relPath = `/uploads/${file.filename}`;
      if (isImage) {
        update.image = relPath;
        update.video = undefined;
      } else if (isVideo) {
        update.video = relPath;
        update.image = undefined;
      }
      // Actualizar filePath con ruta relativa accesible
      update.filePath = relPath;
    }

    if (IS_DEMO) {
      const idx = demoPosts.findIndex((p) => String(p._id) === String(id));
      if (idx === -1) return res.status(404).json({ message: 'Publicación no encontrada' });
      demoPosts[idx] = { ...demoPosts[idx], ...update };
      try { getIO().emit('posts:updated', demoPosts[idx]); } catch {}
      return res.json(demoPosts[idx]);
    }

    const updated = await Post.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Publicación no encontrada' });
    try { getIO().emit('posts:updated', updated); } catch {}
    return res.json(updated);
  } catch (err) {
    console.error('updatePost error:', err);
    return res.status(500).json({ message: 'Error al actualizar la publicación' });
  }
}

export async function deletePost(req, res) {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { id } = req.params;
    if (IS_DEMO) {
      const before = demoPosts.length;
      demoPosts = demoPosts.filter((p) => String(p._id) !== String(id));
      if (demoPosts.length === before) return res.status(404).json({ message: 'Publicación no encontrada' });
      try { getIO().emit('posts:deleted', { id }); } catch {}
      return res.json({ message: 'Publicación eliminada' });
    }

    const deleted = await Post.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Publicación no encontrada' });
    try { getIO().emit('posts:deleted', { id }); } catch {}
    return res.json({ message: 'Publicación eliminada' });
  } catch (err) {
    console.error('deletePost error:', err);
    return res.status(500).json({ message: 'Error al eliminar la publicación' });
  }
}

export async function incrementViews(req, res) {
  try {
    const { id } = req.params;
    if (IS_DEMO) {
      const p = demoPosts.find((x) => String(x._id) === String(id));
      if (!p) return res.status(404).json({ message: 'Publicación no encontrada' });
      p.views = (p.views || 0) + 1;
      try { getIO().emit('posts:views', { id: p._id, views: p.views }); } catch {}
      return res.json({ id: p._id, views: p.views });
    }
    const updated = await Post.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Publicación no encontrada' });
    try { getIO().emit('posts:views', { id: updated._id, views: updated.views }); } catch {}
    return res.json({ id: updated._id, views: updated.views });
  } catch (err) {
    console.error('incrementViews error:', err);
    return res.status(500).json({ message: 'Error al incrementar vistas' });
  }
}

export async function incrementLikes(req, res) {
  try {
    const { id } = req.params;
    if (IS_DEMO) {
      const p = demoPosts.find((x) => String(x._id) === String(id));
      if (!p) return res.status(404).json({ message: 'Publicación no encontrada' });
      p.likes = (p.likes || 0) + 1;
      try { getIO().emit('posts:likes', { id: p._id, likes: p.likes }); } catch {}
      return res.json({ id: p._id, likes: p.likes });
    }
    const updated = await Post.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Publicación no encontrada' });
    try { getIO().emit('posts:likes', { id: updated._id, likes: updated.likes }); } catch {}
    return res.json({ id: updated._id, likes: updated.likes });
  } catch (err) {
    console.error('incrementLikes error:', err);
    return res.status(500).json({ message: 'Error al incrementar likes' });
  }
}
