import { requireDate, requireNumber } from '../validate.js';

// Guarda un registro: parcelas, ganancia diaria y saldo en un momento dado.
export async function addSnapshot(payload, env) {
  const takenAt = requireDate(payload.taken_at, 'taken_at');
  const parcels = requireNumber(payload.parcels, 'parcels', { integer: true });
  const dailyIncome = requireNumber(payload.daily_income, 'daily_income');
  const balance = requireNumber(payload.balance, 'balance');

  const result = await env.DB.prepare(
    'INSERT INTO snapshots (taken_at, parcels, daily_income, balance) VALUES (?, ?, ?, ?)',
  )
    .bind(takenAt, parcels, dailyIncome, balance)
    .run();

  return { id: result.meta.last_row_id };
}
