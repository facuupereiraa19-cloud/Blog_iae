import { boot } from 'quasar/wrappers';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { usePostStore } from 'src/stores/postStore';

let socket: Socket | null = null;

export default boot(() => {
  try {
    // Conecta contra el mismo origen (Nginx) y confía en proxy de /socket.io
    socket = io('/', { path: '/socket.io', transports: ['websocket', 'polling'] });

    const posts = usePostStore();
    const refresh = async () => {
      try { await posts.fetchPosts(); } catch { void 0; }
    };

    // No-ops removed to satisfy no-empty rule
    socket.on('posts:created', refresh);
    socket.on('posts:updated', refresh);
    socket.on('posts:deleted', refresh);
    socket.on('posts:views', ({ id, views }) => {
      const p = posts.posts.find(x => String(x._id || x.id || '') === String(id));
      if (p) p.views = views;
    });
    socket.on('posts:likes', ({ id, likes }) => {
      const p = posts.posts.find(x => String(x._id || x.id || '') === String(id));
      if (p) p.likes = likes;
    });
  } catch {
    // Ignorar fallos de socket en entornos sin WS
  }
});

export { socket };
