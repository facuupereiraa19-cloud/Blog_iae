import { defineStore } from 'pinia';
import { getSettings as apiGetSettings, updateSettingsApi, type SettingsDto } from '../services/api';
import { setCssVar } from 'quasar';
import { useAuthStore } from './authStore';

export type SettingsState = SettingsDto;

const DEFAULTS: SettingsDto = {
  featuredLayout: 2,
  colors: {
    primary: '#1976d2',
    secondary: '#26a69a',
    accent: '#9c27b0',
    positive: '#21ba45',
    negative: '#c10015',
    info: '#31ccec',
    warning: '#f2c037',
  },
};

function applyColors(colors: SettingsDto['colors']) {
  for (const [k, v] of Object.entries(colors)) {
    if (typeof v === 'string' && v.trim()) setCssVar(k, v);
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({ ...DEFAULTS }),
  actions: {
    async load() {
      const data = await apiGetSettings();
      this.featuredLayout = data.featuredLayout;
      this.colors = { ...this.colors, ...data.colors };
      applyColors(this.colors);
    },
    async update(payload: Partial<SettingsDto>) {
      const token = useAuthStore().token;
      const data = await updateSettingsApi(payload, token);
      this.featuredLayout = data.featuredLayout ?? this.featuredLayout;
      this.colors = { ...this.colors, ...(data.colors || {}) };
      applyColors(this.colors);
    },
    applyColors() { applyColors(this.colors); },
  },
});
