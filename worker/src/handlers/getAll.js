// Devuelve todo lo que necesita la app: tipos de parcela (con su cantidad), niveles del pasaporte y las cifras de dinero.
export async function getAll(_payload, env) {
  const types = await env.DB.prepare(
    'SELECT id, name, rate, count FROM parcel_types ORDER BY position ASC',
  ).all();
  const levels = await env.DB.prepare(
    'SELECT level, min_badges, max_badges, bonus FROM passport_levels ORDER BY level ASC',
  ).all();
  const account = await env.DB.prepare(
    'SELECT total_earned, spent, badges, boost_type, boost_seconds, updated_at FROM account WHERE id = 1',
  ).first();

  return { types: types.results, passport_levels: levels.results, account };
}
