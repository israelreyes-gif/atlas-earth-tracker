import { requireNumber } from '../validate.js';

// Por ahora solo hay un ajuste: el importe mínimo para retirar (5 €).
export async function saveSettings(payload, env) {
  const threshold = requireNumber(payload.withdraw_threshold, 'withdraw_threshold', { min: 0.01 });

  await env.DB.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  )
    .bind('withdraw_threshold', String(threshold))
    .run();

  return { ok: true };
}
