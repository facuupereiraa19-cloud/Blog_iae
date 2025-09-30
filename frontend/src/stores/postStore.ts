import { defineStore } from 'pinia';
import { getPosts, createPost as apiCreate, updatePost as apiUpdate, deletePost as apiDelete, type PostSize } from '../services/api';
import { useAuthStore } from './authStore';

export interface Post {
  _id?: string;
  id?: string | number;
  title: string;
  content: string;
  createdAt?: string;
  views?: number;
  likes?: number;
  image?: string;
  video?: string;
  filePath?: string;
  size?: PostSize;
}

interface PostState {
  posts: Post[];
  loading: boolean;
  error: string;
}

export const usePostStore = defineStore('posts', {
  state: (): PostState => ({ posts: [], loading: false, error: '' }),
  actions: {
    async fetchPosts() {
      this.loading = true;
      this.error = '';
      try {
        const data = await getPosts();
        this.posts = Array.isArray(data) ? (data as Post[]) : [];
      } catch (e: unknown) {
        let message = 'No se pudieron cargar las publicaciones';
        if (typeof e === 'object' && e && 'response' in e) {
          const r = (e as { response?: { data?: { message?: unknown } } }).response;
          const m = r?.data?.message;
          message = typeof m === 'string' ? m : message;
        } else if (e instanceof Error) {
          message = e.message;
        }
        this.error = message;
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async createPost(payload: { title: string; content: string; size?: PostSize; file?: File | null }) {
      const token = useAuthStore().token;
      const res = await apiCreate(
        {
          title: payload.title,
          content: payload.content,
          ...(payload.size ? { size: payload.size } : {}),
          ...(payload.file ? { file: payload.file } : {}),
        },
        token
      );
      await this.fetchPosts();
      return res;
    },
    async updatePost(id: string | number, payload: { title?: string; content?: string; size?: PostSize; file?: File | null }) {
      const token = useAuthStore().token;
      const res = await apiUpdate(
        String(id),
        {
          ...(payload.title != null ? { title: payload.title } : {}),
          ...(payload.content != null ? { content: payload.content } : {}),
          ...(payload.size ? { size: payload.size } : {}),
          ...(payload.file ? { file: payload.file } : {}),
        },
        token
      );
      await this.fetchPosts();
      return res;
    },
    async deletePost(id: string | number) {
      const token = useAuthStore().token;
      const res = await apiDelete(String(id), token);
      await this.fetchPosts();
      return res;
    },
  },
});

export type { PostSize } from '../services/api';
