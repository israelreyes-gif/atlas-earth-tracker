// Estado de la app: lo último que devolvió la API (con copia local para ir sin conexión).
import { api } from './api.js';

const CACHE_KEY = 'atlas-tracker-cache-v1';

export const state = {
  settings: { withdraw_threshold: 5, parcel_types: [] },
  snapshots: [],
  goals: [],
  offline: false,
};

function apply(data) {
  state.settings = { withdraw_threshold: 5, parcel_types: [], ...data.settings };
  state.snapshots = data.snapshots;
  state.goals = data.goals;
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Sin almacenamiento: no hay copia local.
  }
}

function readCache() {
  try {
    const text = localStorage.getItem(CACHE_KEY);
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function loadAll() {
  try {
    const data = await api.getAll();
    apply(data);
    saveCache(data);
    state.offline = false;
  } catch (error) {
    if (error.status === 401) throw error;
    const cached = readCache();
    if (!cached) throw error;
    apply(cached);
    state.offline = true;
  }
}

async function changeAndReload(change) {
  await change();
  await loadAll();
}

export const addSnapshot = (snapshot) => changeAndReload(() => api.addSnapshot(snapshot));
export const removeSnapshot = (id) => changeAndReload(() => api.deleteSnapshot(id));
export const addGoal = (goal) => changeAndReload(() => api.addGoal(goal));
export const removeGoal = (id) => changeAndReload(() => api.deleteGoal(id));
export const saveSettings = (settings) => changeAndReload(() => api.saveSettings(settings));
