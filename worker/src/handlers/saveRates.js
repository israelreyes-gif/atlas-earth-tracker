import { badRequest, requireNumber } from '../validate.js';

// Cambia lo que da por segundo cada tipo de parcela: { rates: { idTipo: $ por segundo } }.
export async function saveRates(payload, env) {
  const rates = payload.rates;
  if (typeof rates !== 'object' || rates === null || Array.isArray(rates) || Object.keys(rates).length === 0) {
    throw badRequest('rates debe ser un objeto con al menos un tipo');
  }
  const statements = Object.entries(rates).map(([id, value]) => (
    env.DB.prepare('UPDATE parcel_types SET rate = ? WHERE id = ?').bind(requireNumber(value, `rates.${id}`), id)
  ));
  await env.DB.batch(statements);
  return { ok: true };
}
