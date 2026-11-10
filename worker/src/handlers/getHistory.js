// Puntos del historial (uno por cada cambio guardado), del más antiguo al más reciente.
// payload.since (fecha ISO, opcional): por defecto, los últimos 400 días.
import { requireDate } from '../validate.js';

const DEFAULT_DAYS = 400;

export async function getHistory(payload, env) {
  const since = payload.since !== undefined
    ? requireDate(payload.since, 'since')
    : new Date(Date.now() - DEFAULT_DAYS * 86400000).toISOString();
  const points = await env.DB.prepare(
    'SELECT at, total_earned, boost_type, boost_seconds, rate FROM history WHERE at >= ? ORDER BY at ASC',
  ).bind(since).all();
  return { points: points.results };
}
