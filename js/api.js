// Llamadas a la API. Todas son POST con texto plano para evitar el "preflight" de CORS.
import { API_URL } from './config.js';
import { getKey } from './session.js';

async function call(action, payload = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ key: getKey(), action, payload }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  getAll: () => call('getAll'),
  saveState: (state) => call('saveState', state),
};
