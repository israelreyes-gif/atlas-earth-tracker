import { requireNumber } from '../validate.js';
import { requireTypes } from '../validateParcels.js';

// Ajustes numéricos permitidos y su valor mínimo. Se puede enviar uno o varios.
// withdraw_threshold: mínimo en $ para canjear por dinero real.
// ab_per_dollar: Atlas Bucks que se obtienen por cada 1 $ de renta.
// parcel_ab: Atlas Bucks que cuesta una parcela.
// income_multiplier: multiplicador por boosts y pasaporte (1 = sin multiplicador).
const ALLOWED = {
  withdraw_threshold: 0.01,
  ab_per_dollar: 0.01,
  parcel_ab: 0.01,
  income_multiplier: 0.0001,
};

const UPSERT =
  'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value';

// También se puede enviar parcel_types: [{ id, name, rate }].
export async function saveSettings(payload, env) {
  const names = Object.keys(ALLOWED).filter((name) => payload[name] !== undefined);
  const statements = names.map((name) => {
    const value = requireNumber(payload[name], name, { min: ALLOWED[name] });
    return env.DB.prepare(UPSERT).bind(name, String(value));
  });

  if (payload.parcel_types !== undefined) {
    const types = requireTypes(payload.parcel_types);
    statements.push(env.DB.prepare(UPSERT).bind('parcel_types', JSON.stringify(types)));
  }

  if (statements.length === 0) {
    const error = new Error('No hay ningún ajuste que guardar');
    error.status = 400;
    throw error;
  }
  await env.DB.batch(statements);
  return { ok: true };
}
