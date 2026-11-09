// Formato de números y fechas en español.
const formats = {};

function numberFormat(decimals) {
  if (!formats[decimals]) {
    formats[decimals] = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return formats[decimals];
}

export function formatEuro(value, decimals = 2) {
  return `${numberFormat(decimals).format(value)} €`;
}

export function formatNumber(value, decimals = 0) {
  return numberFormat(decimals).format(value);
}

export function formatDay(date) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
    .format(date)
    .replace('.', '');
}

export function formatShortMonth(date) {
  return new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date).replace('.', '');
}

export function formatMonthYear(date) {
  return new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' })
    .format(date)
    .replace('.', '')
    .replace(' de ', ' ');
}

export function formatToday(date) {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    .format(date)
    .replace(/\./g, '');
}

export function formatDays(days) {
  const rounded = Math.round(days);
  return rounded === 1 ? '1 día' : `${rounded} días`;
}

// Acepta "3,12" o "3.12". Devuelve NaN si está vacío o no es un número.
export function parseNumber(text) {
  const clean = String(text).trim().replace(',', '.');
  return clean === '' ? NaN : Number(clean);
}

// Para rellenar un campo de formulario: 3.1 -> "3,10"
export function toInputValue(value, decimals = 2) {
  return numberFormat(decimals).format(value).replace(/\./g, '');
}
