// Clave de acceso guardada en este dispositivo.
const KEY = 'atlas-tracker-key';

export function getKey() {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function hasKey() {
  return getKey() !== '';
}

export function setKey(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Sin almacenamiento: la clave se pedirá en cada visita.
  }
}

export function clearKey() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nada que borrar.
  }
}
