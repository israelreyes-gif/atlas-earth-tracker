import { requireNumber } from '../validate.js';

// Ajustes numéricos permitidos y su valor mínimo. Se puede enviar uno o varios.
// withdraw_threshold: mínimo en $ para canjear por dinero real.
// ab_per_dollar: Atlas Bucks que se obtienen por cada 1 $ de renta.
// parcel_ab: Atlas Bucks que cuesta una parcela.
const ALLOWED = {
  withdraw_threshold: 0.01,
  ab_per_dollar: 0.01,
  parcel_ab: 0.01,
};

export async function saveSettings(payload, env) {
  const names = Object.keys(ALLOWED).filter((name) => payload[name] !== undefined);
  if (names.length === 0) {
    const error = new Error('No hay ningún ajuste que guardar');
    error.status = 400;
    throw error;
  }

  const statements = names.map((name) => {
    const value = requireNumber(payload[name], name, { min: ALLOWED[name] });
    return env.DB.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    ).bind(name, String(value));
  });
  await env.DB.batch(statements);

  return { ok: true };
}
