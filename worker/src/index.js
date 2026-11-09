import { authorize } from './auth.js';
import { handlers } from './handlers/index.js';
import { jsonResponse } from './json.js';

// Un único endpoint: la app envía POST con {key, action, payload} como texto plano.
// Así no hay "preflight" de CORS y el proxy de Netlify lo reenvía sin más.
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return jsonResponse({ error: 'Usa POST' }, 405);

    let body;
    try {
      body = JSON.parse(await request.text());
    } catch {
      return jsonResponse({ error: 'JSON no válido' }, 400);
    }

    if (!authorize(body.key, env)) return jsonResponse({ error: 'Clave incorrecta' }, 401);

    const handler = handlers[body.action];
    if (!handler) return jsonResponse({ error: 'Acción desconocida' }, 400);

    try {
      return jsonResponse(await handler(body.payload ?? {}, env));
    } catch (error) {
      return jsonResponse({ error: error.message }, error.status ?? 500);
    }
  },
};
