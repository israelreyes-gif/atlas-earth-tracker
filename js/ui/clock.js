// Reloj con segundos (hora del móvil) para que las capturas lleven la hora exacta.
export function clockHtml() {
  return '<span class="clock num" id="clock" aria-label="Hora actual"></span>';
}

export function tickClock(root) {
  root.querySelector('#clock').textContent = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
