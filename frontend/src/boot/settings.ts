import { boot } from 'quasar/wrappers';
import { useSettingsStore } from 'src/stores/settingsStore';

export default boot(async () => {
  const store = useSettingsStore();
  try {
    await store.load();
  } catch {
    // No bloquear la app si falla; usar defaults
    store.applyColors();
  }
});
