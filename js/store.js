// Estado de la app: lo último que devolvió la API (con copia local para ir sin conexión).
import { api } from './api.js';

const CACHE_KEY = 'atlas-tracker-cache-v2';

export const state = {
  types: [],
  account: null,
  offline: false,
};

function apply(data) {
  state.types = data.types;
  state.account = data.account;
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

// Guarda el estado local actual en el servidor y en la copia local.
export async function persist(extra = {}) {
  const { account, types } = state;
  const counts = Object.fromEntries(types.map((type) => [type.id, type.count]));
  await api.saveState({
    counts,
    total_earned: account.total_earned,
    balance: account.balance,
    updated_at: account.updated_at,
    ...extra,
  });
  saveCache({ types, account });
}

export const saveRates = async (rates) => {
  await api.saveRates(rates);
  await loadAll();
};
