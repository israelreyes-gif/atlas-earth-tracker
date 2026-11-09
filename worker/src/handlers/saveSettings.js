import { badRequest, requireNumber } from '../validate.js';
import { requireTypes } from '../validateParcels.js';

function upsert(env, key, value) {
  return env.DB.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  ).bind(key, value);
}

// Ajustes: withdraw_threshold (mínimo para retirar) y parcel_types (tipos de parcela).
// Se puede enviar uno, otro o los dos.
export async function saveSettings(payload, env) {
  const statements = [];

  if (payload.withdraw_threshold !== undefined) {
    const threshold = requireNumber(payload.withdraw_threshold, 'withdraw_threshold', { min: 0.01 });
    statements.push(upsert(env, 'withdraw_threshold', String(threshold)));
  }

  if (payload.parcel_types !== undefined) {
    const types = requireTypes(payload.parcel_types);
    statements.push(upsert(env, 'parcel_types', JSON.stringify(types)));
  }

  if (statements.length === 0) throw badRequest('No hay ajustes que guardar');
  await env.DB.batch(statements);
  return { ok: true };
}
