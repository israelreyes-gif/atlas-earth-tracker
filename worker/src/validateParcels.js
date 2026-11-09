import { badRequest, requireNumber } from './validate.js';

const ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;
const MAX_TYPES = 30;

// Lista de tipos de parcela: [{ id, name, rate }] (rate = $ por segundo de cada parcela, como lo muestra el juego).
export function requireTypes(value) {
  if (!Array.isArray(value) || value.length > MAX_TYPES) {
    throw badRequest(`parcel_types debe ser una lista de máximo ${MAX_TYPES}`);
  }
  const seen = new Set();
  return value.map((item) => {
    const id = typeof item?.id === 'string' ? item.id.trim() : '';
    const name = typeof item?.name === 'string' ? item.name.trim() : '';
    if (!ID_PATTERN.test(id)) throw badRequest('El id de un tipo no es válido');
    if (seen.has(id)) throw badRequest('Hay un tipo repetido');
    seen.add(id);
    if (name === '' || name.length > 40) {
      throw badRequest('El nombre de cada tipo debe tener entre 1 y 40 letras');
    }
    return { id, name, rate: requireNumber(item.rate, 'rate', { min: 0 }) };
  });
}

// Cantidad de parcelas por tipo: { idTipo: entero }. Es opcional.
export function requireCounts(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw badRequest('counts debe ser un objeto');
  }
  const entries = Object.entries(value);
  if (entries.length > MAX_TYPES) throw badRequest('counts tiene demasiados tipos');
  const clean = {};
  for (const [id, amount] of entries) {
    if (!ID_PATTERN.test(id)) throw badRequest('El id de un tipo no es válido');
    clean[id] = requireNumber(amount, `counts.${id}`, { integer: true });
  }
  return clean;
}
