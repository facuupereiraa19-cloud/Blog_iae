import { defineStore } from 'pinia';
import { login as apiLogin, register as apiRegister } from '../services/api';

interface User {
  [key: string]: unknown;
}

interface AuthState {
  token: string;
  user: User | null;
  loading: boolean;
  error: string;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('auth_token') || '',
    user: null,
    loading: false,
    error: '',
  }),
  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = '';
      try {
        const { token } = await apiLogin(email, password);
        if (token) {
          this.token = token;
          localStorage.setItem('auth_token', token);
        } else {
          this.error = 'Respuesta inválida de login';
        }
      } catch (e: unknown) {
        let message = 'Error al iniciar sesión';
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
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('auth_token');
    },
    async register(email: string, password: string) {
      this.loading = true;
      this.error = '';
      try {
        const { token } = await apiRegister(email, password);
        if (token) {
          this.token = token;
          localStorage.setItem('auth_token', token);
        } else {
          this.error = 'Registro completado pero no se recibió token';
        }
      } catch (e: unknown) {
        let message = 'No se pudo registrar';
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
  },
});
