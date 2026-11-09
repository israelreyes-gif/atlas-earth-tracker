// Colores de cada tipo de parcela (por su id). Épico dorado y Legendario morado, como se pidió.
const STYLES = {
  comun: { color: '#2E9E5B', soft: '#E3F4EA' },
  raro: { color: '#2F6FD6', soft: '#E1ECFB' },
  epico: { color: '#B07A06', soft: '#FBF0D4' },
  legendario: { color: '#8A3FC9', soft: '#F0E5FA' },
};

export function styleOf(typeId) {
  return STYLES[typeId] ?? { color: '#12201A', soft: '#E3EAE5' };
}
