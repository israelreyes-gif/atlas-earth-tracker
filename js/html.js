// Escapa texto escrito por el usuario antes de meterlo en una plantilla HTML.
export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));
}
