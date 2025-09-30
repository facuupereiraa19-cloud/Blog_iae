import { defineRouter } from '#q-app/wrappers';
import { createRouter, createWebHistory, createMemoryHistory, createWebHashHistory } from 'vue-router';
import routes from './routes';

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, _from, next) => {
    const needsAuth = to.meta?.requiresAuth || to.path === '/dashboard';
    if (needsAuth) {
      const token = localStorage.getItem('auth_token');
      if (!token) return next({ path: '/login', query: { redirect: to.fullPath } });
    }
    next();
  });

  return Router;
});
