// Menú inferior.
const ITEMS = [
  { route: 'home', label: 'Inicio', icon: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>' },
  { route: 'evolution', label: 'Evolución', icon: '<path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/>' },
  { route: 'goals', label: 'Objetivos', icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>' },
  { route: 'purchases', label: 'Compras', icon: '<circle cx="9" cy="9" r="6"/><path d="M15.5 8.5A6 6 0 1 1 8.5 15.5"/>' },
];

export function renderNav(nav, activeRoute) {
  nav.innerHTML = ITEMS.map((item) => `
    <a href="#${item.route}"${item.route === activeRoute ? ' aria-current="page"' : ''}>
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
      ${item.label}
    </a>`).join('');
}
