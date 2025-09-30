<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar>
      <q-toolbar-title>IAE Blog</q-toolbar-title>

      <q-btn flat dense no-caps to="/" label="Home" color="white" />
      <q-btn flat dense no-caps to="/info" label="Info" color="white" />
      <q-btn
        v-if="!isAuth"
        flat
        dense
        no-caps
        to="/login"
        label="Login"
        color="white"
      />
      <q-btn
        v-else
        flat
        dense
        no-caps
        to="/dashboard"
        label="Dashboard"
        color="white"
      />

      <q-space />

      <q-btn
        v-if="isAuth"
        flat
        dense
        icon="logout"
        color="white"
        @click="onLogout"
        aria-label="Logout"
      />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const isAuth = computed(() => Boolean(auth.token));

async function onLogout() {
  auth.logout();
  await router.push('/login');
}
</script>

<style scoped></style>
