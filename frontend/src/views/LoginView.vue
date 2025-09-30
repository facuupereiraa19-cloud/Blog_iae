<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card style="width: 420px; max-width: 95vw">
      <q-card-section class="q-pb-none">
        <div class="text-h6">Acceso</div>
      </q-card-section>
      <q-tabs v-model="mode" class="text-primary" dense inline-label align="justify">
        <q-tab name="login" label="Ingresar" icon="login" />
        <q-tab name="register" label="Registrar" icon="person_add" />
      </q-tabs>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input v-model="email" type="email" label="Email" required autocomplete="email" />
          <q-input v-model="password" type="password" :label="mode === 'login' ? 'Password' : 'Password (mínimo 6 caracteres)'" required :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" />
          <q-input
            v-if="mode === 'register'"
            v-model="confirmPassword"
            type="password"
            label="Confirmar password"
            required
            autocomplete="new-password"
          />
          <q-btn
            type="submit"
            color="primary"
            :loading="loading"
            :label="mode === 'login' ? 'Login' : 'Registrar'"
            unelevated
            class="full-width"
          />
          <q-banner v-if="success" class="bg-green-2 text-green-10" dense>{{ success }}</q-banner>
          <q-banner v-if="error" class="bg-red-2 text-red-10" dense>{{ error }}</q-banner>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const auth = useAuthStore();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');
const confirmPassword = ref('');
const mode = ref<'login' | 'register'>('login');

watch(mode, () => {
  error.value = '';
  success.value = '';
  password.value = '';
  confirmPassword.value = '';
});

async function onSubmit() {
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    if (mode.value === 'login') {
      await auth.login(email.value, password.value);
      if (auth.token) {
        await router.push('/dashboard');
      } else {
        error.value = auth.error || 'No se pudo iniciar sesión';
      }
    } else {
      if (password.value.length < 6) {
        error.value = 'El password debe tener al menos 6 caracteres';
        return;
      }
      if (password.value !== confirmPassword.value) {
        error.value = 'Las contraseñas no coinciden';
        return;
      }
      await auth.register(email.value, password.value);
      if (auth.token) {
        success.value = 'Cuenta creada correctamente';
        await router.push('/dashboard');
      } else {
        error.value = auth.error || 'No se pudo registrar la cuenta';
      }
    }
  } catch (e: unknown) {
    const fallback = mode.value === 'login' ? 'Error al iniciar sesión' : 'Error al registrar la cuenta';
    error.value = auth.error || (e instanceof Error ? e.message : fallback);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
