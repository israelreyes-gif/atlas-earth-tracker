import { requireNumber } from '../validate.js';

export async function deleteSnapshot(payload, env) {
  const id = requireNumber(payload.id, 'id', { integer: true, min: 1 });
  await env.DB.prepare('DELETE FROM snapshots WHERE id = ?').bind(id).run();
  return { ok: true };
}
