function parseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

// Devuelve todo lo que necesita la app: ajustes, registros y objetivos.
export async function getAll(_payload, env) {
  const snapshotRows = await env.DB.prepare(
    'SELECT id, taken_at, parcels, daily_income, balance, counts FROM snapshots ORDER BY taken_at ASC',
  ).all();
  const goals = await env.DB.prepare('SELECT id, type, target FROM goals ORDER BY id ASC').all();
  const settingRows = await env.DB.prepare('SELECT key, value FROM settings').all();

  const settings = { withdraw_threshold: 5, parcel_types: [] };
  for (const row of settingRows.results) {
    settings[row.key] = row.key === 'parcel_types' ? parseJson(row.value, []) : Number(row.value);
  }

  const snapshots = snapshotRows.results.map((row) => ({
    ...row,
    counts: row.counts ? parseJson(row.counts, null) : null,
  }));

  return { settings, snapshots, goals: goals.results };
}
