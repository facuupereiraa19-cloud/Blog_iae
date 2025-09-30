<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col">
        <div class="text-h5">Publicaciones</div>
      </div>
      <div class="col-auto">
        <q-select v-model="sortBy" :options="options" label="Ordenar por" dense outlined style="min-width: 180px" />
      </div>
      <div class="col-auto">
        <q-btn outline dense label="Recargar" @click="loadPosts" :loading="loading" />
      </div>
    </div>

    <q-banner v-if="error" class="bg-red-2 text-red-10 q-mb-sm" dense>{{ error }}</q-banner>
    <div v-if="loading">Cargando...</div>
    <div v-if="!loading && sortedPosts.length === 0">Sin publicaciones</div>

    <!-- Destacados (1/2/4) -->
    <div class="text-subtitle1 q-mt-md q-mb-sm">Destacados</div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div
        v-for="p in featuredPosts"
        :key="String(p._id || p.id || '')"
        :class="featuredClass"
      >
        <q-card bordered class="shadow-2 rounded-borders full-height">
          <q-card-section>
            <div class="text-subtitle2 ellipsis">{{ p.title }}</div>
            <div class="text-caption text-grey-7">Likes: {{ p.likes ?? 0 }} · Vistas: {{ p.views ?? 0 }}</div>
          </q-card-section>
          <q-img v-if="p.filePath && isImagePath(p.filePath)" :src="mediaUrl(p.filePath)" class="rounded-borders post-card-media" fit="cover" />
          <q-card-section v-else-if="p.filePath">
            <AutoVideo :src="mediaUrl(p.filePath)" class="rounded-borders post-card-media" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Todos -->
    <div class="text-subtitle1 q-mb-sm">Todos</div>
    <div class="posts-grid">
      <div
        v-for="p in sortedPosts"
        :key="String(p._id || p.id || '')"
        :class="['post-card', cardClass(p)]"
      >
        <q-card bordered class="shadow-2 rounded-borders post-card-card" @click="navigateTo(p)" clickable>
          <q-card-section>
            <div class="text-h6">{{ p.title }}</div>
            <div class="text-body2 q-mt-sm">{{ p.content }}</div>
          </q-card-section>

          <div v-if="p.filePath || p.image || p.video" class="post-card-media-wrapper">
            <template v-if="p.filePath">
              <q-img
                v-if="isImagePath(p.filePath)"
                :src="mediaUrl(p.filePath)"
                class="rounded-borders post-card-media"
                fit="cover"
                @error="onMediaError(p.filePath)"
              />
              <AutoVideo
                v-else
                :src="mediaUrl(p.filePath)"
                class="rounded-borders post-card-media"
                @error="onMediaError(p.filePath)"
              />
            </template>
            <template v-else>
              <q-img
                v-if="p.image"
                :src="mediaUrl(p.image)"
                class="rounded-borders post-card-media"
                fit="cover"
                @error="onMediaError(p.image)"
              />
              <AutoVideo
                v-else-if="p.video"
                :src="mediaUrl(p.video)"
                class="rounded-borders post-card-media"
                @error="onMediaError(p.video)"
              />
            </template>
          </div>

          <q-card-section class="post-card-meta">
            <div class="row items-center q-gutter-sm">
              <div class="col-auto text-caption text-grey-7">Fecha: {{ formatDate(p.createdAt) }}</div>
              <div class="col-auto text-caption text-grey-7">Vistas: {{ p.views ?? 0 }}</div>
              <div class="col-auto text-caption text-grey-7">Likes: {{ p.likes ?? 0 }}</div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <div class="row items-center q-gutter-sm">
              <q-btn class="like-btn" flat dense round icon="thumb_up" @click.stop="onLike(p)" />
              <div class="text-caption">{{ p.likes ?? 0 }}</div>
            </div>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AutoVideo from '../components/AutoVideo.vue';
import { useRouter } from 'vue-router';
import { usePostStore, type Post, type PostSize } from '../stores/postStore';
import { incrementView, likePost } from '../services/api';
import { useQuasar } from 'quasar';
import { computeMediaUrl as computeUrl, isImagePath as isImg } from '../utils/media';
import { useSettingsStore } from '../stores/settingsStore';

const store = usePostStore();
const router = useRouter();
const sortBy = ref<'fecha' | 'popularidad'>('fecha');
const options = [
  { label: 'Fecha', value: 'fecha' },
  { label: 'Popularidad', value: 'popularidad' },
];

const loading = computed(() => store.loading);
const error = computed(() => store.error);
const settings = useSettingsStore();
const validSizes: readonly PostSize[] = ['large', 'medium', 'small'] as const;

async function loadPosts() {
  await store.fetchPosts();
}

const viewed = new Set<string>();

onMounted(async () => {
  await loadPosts();
  // Incrementar vistas una vez por post cuando se muestran
  for (const p of store.posts) {
    const id = String(p._id || p.id || '');
    if (id && !viewed.has(id)) {
      viewed.add(id);
      try {
        const res = await incrementView(id);
        p.views = res.views;
      } catch {
        // silencioso
      }
    }
  }
});

const sortedPosts = computed<Post[]>(() => {
  const arr = Array.isArray(store.posts) ? [...store.posts] : [];
  if (sortBy.value === 'popularidad') return arr.sort((a, b) => score(b) - score(a));
  return arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
});

const popularPosts = computed<Post[]>(() => {
  const arr = Array.isArray(store.posts) ? [...store.posts] : [];
  return arr.sort((a, b) => score(b) - score(a));
});

const featuredCount = computed(() => settings.featuredLayout || 2);
const featuredPosts = computed<Post[]>(() => popularPosts.value.slice(0, featuredCount.value));
const featuredClass = computed(() => {
  const n = featuredCount.value;
  if (n === 1) return 'col-12 q-ma-sm';
  if (n === 2) return 'col-12 col-md-6 q-ma-sm';
  return 'col-12 col-sm-6 col-md-3 q-ma-sm';
});

function score(p: Post) {
  const v = Number(p.views || 0);
  const l = Number(p.likes || 0);
  return l * 3 + v;
}

function postSize(p: Post): PostSize {
  if (typeof p.size === 'string') {
    const lower = p.size.toLowerCase();
    if ((validSizes as readonly string[]).includes(lower)) {
      return lower as PostSize;
    }
  }
  return 'medium';
}

function cardClass(p: Post) {
  return `size-${postSize(p)}`;
}

function mediaUrl(path: string) { return computeUrl(path); }

function formatDate(d?: string) {
  if (!d) return '';
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
}

function isImagePath(path: string) { return isImg(path); }

function navigateTo(p: Post) {
  const id = String(p._id || p.id || '');
  if (!id) return;
  void router.push({ name: 'post', params: { id } });
}

async function onLike(p: Post) {
  const id = String(p._id || p.id || '');
  if (!id) return;
  try {
    const res = await likePost(id);
    p.likes = res.likes;
  } catch {
    const $q = useQuasar();
    $q.notify({ type: 'negative', message: 'No se pudo registrar el like' });
  }
}

function onMediaError(src?: string) {
  const $q = useQuasar();
  $q.notify({ type: 'negative', message: `No se pudo cargar media: ${src || ''}` });
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  // SSR data prefetch
  async preFetch() {
    const { usePostStore: usePostStoreSSR } = await import('../stores/postStore');
    const postStore = usePostStoreSSR();
    if (!postStore.posts.length) {
      await postStore.fetchPosts();
    }
  },
});
</script>

<style scoped>
.like-btn {
  transition: transform 0.15s ease, color 0.15s ease;
}
.like-btn:hover {
  color: var(--q-primary);
  transform: translateY(-1px);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: 1.5rem;
}

.post-card {
  min-width: 0;
}

.post-card-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.post-card-card .q-card-actions {
  margin-top: auto;
}

.post-card-media-wrapper {
  padding: 0 16px 16px;
}

.post-card-media {
  width: 100%;
  display: block;
  min-height: 180px;
  aspect-ratio: 16 / 9;
}

.post-card-media :deep(video),
.post-card-media :deep(iframe) {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

.post-card-meta {
  padding-top: 4px;
}

.post-card.size-large {
  grid-column: span 4;
}

.post-card.size-medium {
  grid-column: span 2;
}

.post-card.size-small {
  grid-column: span 1;
}

@media (min-width: 1440px) {
  .posts-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  .post-card.size-large {
    grid-column: span 6;
  }
  .post-card.size-medium {
    grid-column: span 3;
  }
  .post-card.size-small {
    grid-column: span 2;
  }
}

@media (max-width: 1023px) {
  .posts-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
  .post-card.size-large {
    grid-column: span 3;
  }
  .post-card.size-medium {
    grid-column: span 2;
  }
  .post-card.size-small {
    grid-column: span 1;
  }
}

@media (max-width: 599px) {
  .posts-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .post-card.size-large {
    grid-column: span 4;
  }
  .post-card.size-medium {
    grid-column: span 2;
  }
  .post-card.size-small {
    grid-column: span 1;
  }
  .post-card-media {
    min-height: 140px;
  }
}
</style>
