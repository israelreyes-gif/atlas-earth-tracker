import { requireNumber, requireOneOf } from '../validate.js';

// Tipos: money (saldo en €), parcels (nº de parcelas), income (ganancia diaria en €).
export async function addGoal(payload, env) {
  const type = requireOneOf(payload.type, 'type', ['money', 'parcels', 'income']);
  const target = requireNumber(payload.target, 'target', { min: 0.01 });

  const result = await env.DB.prepare('INSERT INTO goals (type, target) VALUES (?, ?)')
    .bind(type, target)
    .run();

  return { id: result.meta.last_row_id };
}
