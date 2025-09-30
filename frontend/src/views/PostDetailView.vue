<template>
  <q-page class="q-pa-md">
    <q-card bordered class="shadow-2 rounded-borders">
      <q-card-section>
        <div class="text-h5">{{ post?.title }}</div>
        <div class="text-body2 q-mt-sm">{{ post?.content }}</div>
        <div class="q-mt-md" v-if="post?.filePath || post?.image || post?.video">
          <template v-if="post?.filePath">
            <q-img v-if="isImagePath(post!.filePath!)" :src="mediaUrl(post!.filePath!)" class="rounded-borders thumb-300" fit="cover" />
            <AutoVideo v-else :src="mediaUrl(post!.filePath!)" class="rounded-borders thumb-300 q-mt-md" />
          </template>
          <template v-else>
            <q-img v-if="post?.image" :src="mediaUrl(post!.image!)" class="rounded-borders thumb-300" fit="cover" />
            <AutoVideo v-else-if="post?.video" :src="mediaUrl(post!.video!)" class="rounded-borders thumb-300 q-mt-md" />
          </template>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';
import { useMeta } from 'quasar';
import { computeMediaUrl as computeUrl, isImagePath as isImg } from '../utils/media';
import AutoVideo from '../components/AutoVideo.vue';

interface PostDto { _id?: string; id?: string|number; title: string; content: string; filePath?: string; image?: string; video?: string; createdAt?: string }

const route = useRoute();
const post = ref<PostDto | null>(null);
function mediaUrl(path: string) { return computeUrl(path); }
function isImagePath(path: string) { return isImg(path); }

onMounted(async () => {
  const id = String(route.params.id || '');
  if (!id) return;
  const { data } = await api.get<PostDto>(`/posts/${id}`);
  post.value = data;
  useMeta({
    title: data.title,
    meta: {
      description: { name: 'description', content: data.content?.slice(0, 140) || '' },
    },
  });
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
// avoid duplicate symbol names across script blocks
import { api as apiClient } from 'boot/axios';

export default defineComponent({
  async preFetch({ currentRoute }: { currentRoute: { params: Record<string, unknown> } }) {
    const raw = currentRoute.params.id;
    const id = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : '';
    if (!id) return;
    await apiClient.get(`/posts/${id}`);
  },
});
</script>

<style scoped>
.thumb-300 { width: 300px; height: 300px; }
</style>
