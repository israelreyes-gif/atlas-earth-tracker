// Devuelve todo lo que necesita la app: tipos de parcela (con su cantidad) y las cifras de dinero.
export async function getAll(_payload, env) {
  const types = await env.DB.prepare(
    'SELECT id, name, rate, count FROM parcel_types ORDER BY position ASC',
  ).all();
  const account = await env.DB.prepare(
    'SELECT total_earned, balance, updated_at FROM account WHERE id = 1',
  ).first();

  return { types: types.results, account };
}
