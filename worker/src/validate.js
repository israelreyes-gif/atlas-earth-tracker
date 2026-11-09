// Validaciones sencillas. Lanzan un error con status 400.
function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export function requireNumber(value, name, { min = 0, integer = false } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw badRequest(`${name} debe ser un número`);
  }
  if (value < min) throw badRequest(`${name} no puede ser menor que ${min}`);
  if (integer && !Number.isInteger(value)) {
    throw badRequest(`${name} debe ser un número entero`);
  }
  return value;
}

export function requireDate(value, name) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw badRequest(`${name} debe ser una fecha válida`);
  }
  return new Date(value).toISOString();
}

export function requireOneOf(value, name, allowed) {
  if (!allowed.includes(value)) {
    throw badRequest(`${name} debe ser uno de: ${allowed.join(', ')}`);
  }
  return value;
}
