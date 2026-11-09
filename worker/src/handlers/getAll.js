// Devuelve todo lo que necesita la app: ajustes, registros y objetivos.
export async function getAll(_payload, env) {
  const snapshots = await env.DB.prepare(
    'SELECT id, taken_at, parcels, daily_income, balance FROM snapshots ORDER BY taken_at ASC',
  ).all();
  const goals = await env.DB.prepare('SELECT id, type, target FROM goals ORDER BY id ASC').all();
  const settingRows = await env.DB.prepare('SELECT key, value FROM settings').all();

  const settings = { withdraw_threshold: 5 };
  for (const row of settingRows.results) settings[row.key] = Number(row.value);

  return { settings, snapshots: snapshots.results, goals: goals.results };
}
