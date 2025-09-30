import { boot } from 'quasar/wrappers';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
export const api = axios.create({ baseURL });

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: typeof axios;
    $api: typeof api;
  }
}
