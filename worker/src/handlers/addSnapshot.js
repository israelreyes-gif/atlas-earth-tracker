import { requireDate, requireNumber } from '../validate.js';
import { requireCounts } from '../validateParcels.js';

// Guarda un registro: parcelas, ganancia diaria, saldo y (opcional) parcelas por tipo.
export async function addSnapshot(payload, env) {
  const takenAt = requireDate(payload.taken_at, 'taken_at');
  const parcels = requireNumber(payload.parcels, 'parcels', { integer: true });
  const dailyIncome = requireNumber(payload.daily_income, 'daily_income');
  const balance = requireNumber(payload.balance, 'balance');
  const counts = requireCounts(payload.counts);

  const result = await env.DB.prepare(
    'INSERT INTO snapshots (taken_at, parcels, daily_income, balance, counts) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(takenAt, parcels, dailyIncome, balance, counts ? JSON.stringify(counts) : null)
    .run();

  return { id: result.meta.last_row_id };
}
