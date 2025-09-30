<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="onSubmit">
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>
      <button type="submit" :disabled="loading">{{ loading ? 'Entrando...' : 'Login' }}</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
  
</template>

<script setup>
import { ref } from 'vue';
import { login as apiLogin } from '../services/api.js';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function onSubmit() {
  loading.value = true;
  error.value = '';
  try {
    const { token } = await apiLogin({ email: email.value, password: password.value });
    if (token) {
      localStorage.setItem('auth_token', token);
      window.location.assign('/dashboard');
    } else {
      error.value = 'Respuesta de login inválida';
    }
  } catch (e) {
    let message = 'Error al iniciar sesión';
    if (e && e.response && e.response.data && typeof e.response.data.message === 'string') {
      message = e.response.data.message;
    } else if (e && e.message) {
      message = e.message;
    }
    error.value = message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  max-width: 360px;
  margin: 40px auto;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
label {
  display: block;
  margin: 8px 0;
}
input {
  display: block;
  width: 100%;
  padding: 8px;
  margin-top: 4px;
}
button {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
}
.error {
  color: #b00020;
  margin-top: 8px;
}
</style>

