<template>
  <div class="auto-video-wrapper" :class="$attrs.class">
    <video
      ref="videoRef"
      class="auto-video-el"
      :src="src"
      controls
      muted
      autoplay
      loop
      playsinline
      @error="onError"
    ></video>
    <q-btn
      class="auto-video-mute-btn"
      round
      dense
      unelevated
      :icon="isMuted ? 'volume_off' : 'volume_up'"
      :aria-label="isMuted ? 'Activar sonido' : 'Silenciar'"
      @click.stop="toggleMute"
    />
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

defineOptions({ inheritAttrs: true });

const props = defineProps<{ src: string }>();
const emit = defineEmits<{ (e: 'error', ev: Event): void }>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isMuted = ref(true);

function ensurePlayback() {
  const el = videoRef.value;
  if (!el) return;
  el.muted = isMuted.value;
  // intentar reproducir, ignorando errores de autoplay
  void el.play().catch(() => { /* ignore autoplay restrictions */ });
}

function toggleMute() {
  isMuted.value = !isMuted.value;
  const el = videoRef.value;
  if (el) {
    el.muted = isMuted.value;
    if (!el.paused) return;
    ensurePlayback();
  }
}

function onError(ev: Event) {
  emit('error', ev);
}

onMounted(() => {
  // Ajustes iniciales para autoplay silencioso y loop
  const el = videoRef.value;
  if (!el) return;
  el.muted = true;
  el.loop = true;
  el.autoplay = true;
  // iOS requiere playsinline para no ir fullscreen
  el.setAttribute('playsinline', '');
  ensurePlayback();
});

watch(() => props.src, () => {
  // Si la fuente cambia, volvemos a intentar la reproducción
  ensurePlayback();
});
</script>

<style scoped>
.auto-video-wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.auto-video-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.auto-video-mute-btn {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
}
</style>
