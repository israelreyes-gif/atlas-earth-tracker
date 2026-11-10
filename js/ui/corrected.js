// Aviso de cuánto hace que se corrigió el dinero con las cifras del juego.
export const STALE_DAYS = 7;

// Devuelve { text, stale } para mostrar en la tarjeta verde.
export function correctedNotice(account, now) {
  if (!account.corrected_at) return { text: 'Sin correcciones guardadas · conviene comparar con el juego', stale: true };
  const hours = Math.max(0, (now - new Date(account.corrected_at)) / 3600000);
  const days = Math.floor(hours / 24);
  const stale = days >= STALE_DAYS;
  let when;
  if (hours < 1) when = 'hace menos de 1 hora';
  else if (hours < 24) when = `hace ${Math.floor(hours)} h`;
  else when = days === 1 ? 'hace 1 día' : `hace ${days} días`;
  return { text: `Última corrección: ${when}${stale ? ' · conviene comparar con el juego' : ''}`, stale };
}
