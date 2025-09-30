import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  if (to.meta?.requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }
  }
  next();
});

export default router;

