<template>
  <div class="home">
    <h1>Publicaciones</h1>

    <div class="toolbar">
      <label>
        Ordenar por:
        <select v-model="sortBy">
          <option value="fecha">Fecha</option>
          <option value="popularidad">Popularidad</option>
        </select>
      </label>
      <button @click="loadPosts" :disabled="loading">Recargar</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading">Cargando publicaciones...</p>
    <div v-if="!loading && sortedPosts.length === 0">Sin publicaciones por mostrar.</div>

    <div class="post" v-for="post in sortedPosts" :key="post._id || post.id">
      <h2>{{ post.title }}</h2>
      <p class="content">{{ post.content }}</p>

      <div class="media" v-if="post.image || post.video">
        <img v-if="post.image" :src="mediaUrl(post.image)" alt="imagen del post" />
        <video v-else-if="post.video" :src="mediaUrl(post.video)" controls></video>
      </div>

      <div class="meta">
        <span>Fecha: {{ formatDate(post.createdAt) }}</span>
        <span>Vistas: {{ post.views ?? 0 }}</span>
        <span>Likes: {{ post.likes ?? 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getPosts } from '../services/api.js';

const posts = ref([]);
const loading = ref(false);
const error = ref('');
const sortBy = ref('fecha'); // 'fecha' | 'popularidad'

async function loadPosts() {
  loading.value = true;
  error.value = '';
  try {
    // Home es público; no pasamos token
    posts.value = await getPosts();
  } catch (e) {
    error.value = extractError(e, 'No se pudieron cargar las publicaciones');
  } finally {
    loading.value = false;
  }
}

onMounted(loadPosts);

const sortedPosts = computed(() => {
  const arr = Array.isArray(posts.value) ? [...posts.value] : [];
  if (sortBy.value === 'popularidad') {
    return arr.sort((a, b) => score(b) - score(a));
  }
  // fecha por defecto (desc)
  return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
});

function score(p) {
  const v = Number(p.views || 0);
  const l = Number(p.likes || 0);
  return l * 3 + v; // peso simple: likes valen más que vistas
}

function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  // si viene como "/uploads/...", prefijar backend
  return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`;
}

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

function extractError(e, fallback) {
  let message = fallback;
  if (e && e.response && e.response.data && typeof e.response.data.message === 'string') {
    message = e.response.data.message;
  } else if (e && e.message) {
    message = e.message;
  }
  return message;
}
</script>

<style scoped>
.home { max-width: 900px; margin: 0 auto; padding: 16px; }
.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.error { color: #b00020; }
.post { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 12px 0; }
.post .content { white-space: pre-wrap; margin: 8px 0; }
.media img, .media video { max-width: 100%; border-radius: 6px; }
.meta { display: flex; gap: 16px; font-size: 0.9em; color: #555; margin-top: 8px; }
</style>

