// Devuelve todo lo que necesita la app: ajustes, tipos de parcela, registros y objetivos.
function parseJson(text, fallback) {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

export async function getAll(_payload, env) {
  const snapshots = await env.DB.prepare(
    'SELECT id, taken_at, parcels, daily_income, balance, counts FROM snapshots ORDER BY taken_at ASC',
  ).all();
  const goals = await env.DB.prepare('SELECT id, type, target FROM goals ORDER BY id ASC').all();
  const settingRows = await env.DB.prepare('SELECT key, value FROM settings').all();

  const settings = { withdraw_threshold: 5, ab_per_dollar: 25, parcel_ab: 100, income_multiplier: 1 };
  let parcelTypes = [];
  for (const row of settingRows.results) {
    if (row.key === 'parcel_types') parcelTypes = parseJson(row.value, []);
    else settings[row.key] = Number(row.value);
  }

  return {
    settings,
    parcel_types: parcelTypes,
    snapshots: snapshots.results.map((row) => ({ ...row, counts: parseJson(row.counts, null) })),
    goals: goals.results,
  };
}
