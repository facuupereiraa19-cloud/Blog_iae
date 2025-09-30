import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('src/views/HomeView.vue') },
      { path: 'info', name: 'info', component: () => import('src/views/InfoView.vue') },
      { path: 'login', name: 'login', component: () => import('src/views/LoginView.vue') },
      { path: 'dashboard', name: 'dashboard', meta: { requiresAuth: true }, component: () => import('src/views/DashboardView.vue') },
      { path: 'posts/:id', name: 'post', component: () => import('src/views/PostDetailView.vue') },
    ],
  },

  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },
];

export default routes;
