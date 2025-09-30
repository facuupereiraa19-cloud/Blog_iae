<template>
  <div class="dashboard">
    <h1>Dashboard</h1>

    <section class="create">
      <h2>Crear post</h2>
      <form @submit.prevent="onCreate">
        <label>
          Título
          <input v-model="form.title" type="text" required />
        </label>
        <label>
          Contenido
          <textarea v-model="form.content" rows="4" required></textarea>
        </label>
        <label>
          Archivo (imagen o video)
          <input type="file" @change="onFileChange($event, 'create')" />
        </label>
        <button type="submit" :disabled="loadingCreate">{{ loadingCreate ? 'Guardando...' : 'Crear' }}</button>
        <p v-if="errorCreate" class="error">{{ errorCreate }}</p>
      </form>
    </section>

    <section class="list">
      <h2>Publicaciones</h2>
      <button @click="loadPosts" :disabled="loadingList">Recargar</button>
      <p v-if="errorList" class="error">{{ errorList }}</p>
      <p v-if="loadingList">Cargando...</p>

      <div v-if="!loadingList && posts.length === 0">Sin publicaciones</div>

      <div v-for="p in posts" :key="p._id || p.id" class="post-item">
        <template v-if="editingId === (p._id || p.id)">
          <form @submit.prevent="onUpdate(p)">
            <label>
              Título
              <input v-model="editForm.title" type="text" required />
            </label>
            <label>
              Contenido
              <textarea v-model="editForm.content" rows="3" required></textarea>
            </label>
            <label>
              Nuevo archivo (opcional)
              <input type="file" @change="onFileChange($event, 'edit')" />
            </label>
            <div class="actions">
              <button type="submit" :disabled="loadingUpdate">{{ loadingUpdate ? 'Actualizando...' : 'Guardar' }}</button>
              <button type="button" @click="cancelEdit">Cancelar</button>
            </div>
            <p v-if="errorUpdate" class="error">{{ errorUpdate }}</p>
          </form>
        </template>
        <template v-else>
          <h3>{{ p.title }}</h3>
          <p class="content">{{ p.content }}</p>
          <p v-if="p.filePath">Archivo: <code>{{ p.filePath }}</code></p>
          <div class="actions">
            <button @click="startEdit(p)">Editar</button>
            <button @click="onDelete(p)" :disabled="loadingDeleteId === (p._id || p.id)">
              {{ loadingDeleteId === (p._id || p.id) ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getPosts, createPost, updatePost, deletePost } from '../services/api.js';

const token = localStorage.getItem('auth_token') || '';

// List
const posts = ref([]);
const loadingList = ref(false);
const errorList = ref('');

async function loadPosts() {
  loadingList.value = true;
  errorList.value = '';
  try {
    posts.value = await getPosts(token);
  } catch (e) {
    errorList.value = extractError(e, 'No se pudieron cargar los posts');
  } finally {
    loadingList.value = false;
  }
}

onMounted(loadPosts);

// Create
const form = reactive({ title: '', content: '' });
const createFile = ref(null);
const loadingCreate = ref(false);
const errorCreate = ref('');

function onFileChange(ev, kind) {
  const file = ev.target?.files?.[0] || null;
  if (kind === 'create') createFile.value = file;
  else if (kind === 'edit') editFile.value = file;
}

async function onCreate() {
  loadingCreate.value = true;
  errorCreate.value = '';
  try {
    await createPost(token, { title: form.title, content: form.content, file: createFile.value });
    form.title = '';
    form.content = '';
    createFile.value = null;
    await loadPosts();
  } catch (e) {
    errorCreate.value = extractError(e, 'No se pudo crear el post');
  } finally {
    loadingCreate.value = false;
  }
}

// Edit
const editingId = ref(null);
const editForm = reactive({ title: '', content: '' });
const editFile = ref(null);
const loadingUpdate = ref(false);
const errorUpdate = ref('');

function startEdit(p) {
  editingId.value = p._id || p.id;
  editForm.title = p.title || '';
  editForm.content = p.content || '';
  editFile.value = null;
}

function cancelEdit() {
  editingId.value = null;
  editForm.title = '';
  editForm.content = '';
  editFile.value = null;
  errorUpdate.value = '';
}

async function onUpdate(p) {
  if (!editingId.value) return;
  loadingUpdate.value = true;
  errorUpdate.value = '';
  try {
    await updatePost(token, editingId.value, {
      title: editForm.title,
      content: editForm.content,
      file: editFile.value || undefined,
    });
    cancelEdit();
    await loadPosts();
  } catch (e) {
    errorUpdate.value = extractError(e, 'No se pudo actualizar el post');
  } finally {
    loadingUpdate.value = false;
  }
}

// Delete
const loadingDeleteId = ref(null);

async function onDelete(p) {
  const id = p._id || p.id;
  if (!id) return;
  loadingDeleteId.value = id;
  try {
    await deletePost(token, id);
    await loadPosts();
  } catch (e) {
    // Podemos mostrar un error genérico
    alert(extractError(e, 'No se pudo eliminar el post'));
  } finally {
    loadingDeleteId.value = null;
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
.dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
}
section + section {
  margin-top: 24px;
}
form label {
  display: block;
  margin: 8px 0;
}
input[type="text"], textarea, input[type="file"] {
  display: block;
  width: 100%;
  padding: 8px;
  margin-top: 4px;
}
.post-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}
.post-item .actions button {
  margin-right: 8px;
}
.error { color: #b00020; }
</style>

