import { badRequest, requireDate, requireNumber } from '../validate.js';

// Guarda las cifras de dinero en un instante (updated_at) y, si se envían, las insignias y las parcelas por tipo.
// Las dos cosas van juntas porque la app calcula el dinero con el ritmo que dan esas parcelas.
export async function saveState(payload, env) {
  const totalEarned = requireNumber(payload.total_earned, 'total_earned');
  const balance = requireNumber(payload.balance, 'balance');
  const updatedAt = requireDate(payload.updated_at, 'updated_at');

  const statements = [
    env.DB.prepare('UPDATE account SET total_earned = ?, balance = ?, updated_at = ? WHERE id = 1')
      .bind(totalEarned, balance, updatedAt),
  ];

  if (payload.badges !== undefined) {
    const badges = requireNumber(payload.badges, 'badges', { integer: true });
    if (badges > 9999) throw badRequest('badges no puede ser mayor que 9999');
    statements.push(env.DB.prepare('UPDATE account SET badges = ? WHERE id = 1').bind(badges));
  }

  if (payload.counts !== undefined) {
    if (typeof payload.counts !== 'object' || payload.counts === null || Array.isArray(payload.counts)) {
      throw badRequest('counts debe ser un objeto');
    }
    const known = await env.DB.prepare('SELECT id FROM parcel_types').all();
    const ids = new Set(known.results.map((row) => row.id));
    for (const [id, amount] of Object.entries(payload.counts)) {
      if (!ids.has(id)) throw badRequest(`Tipo de parcela desconocido: ${id}`);
      const count = requireNumber(amount, `counts.${id}`, { integer: true });
      statements.push(env.DB.prepare('UPDATE parcel_types SET count = ? WHERE id = ?').bind(count, id));
    }
  }

  await env.DB.batch(statements);
  return { ok: true };
}
