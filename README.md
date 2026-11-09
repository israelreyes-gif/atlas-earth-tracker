# Atlas Tracker

PWA personal para seguir mi cuenta del juego móvil **Atlas Earth**: cuánto gano al día con mis parcelas, cómo he evolucionado en el último año, cuándo llegaré a un objetivo y si compensa comprar parcelas o esperar a canjear.

> **Este README es la fuente de verdad del proyecto.** Se actualiza en cada cambio (ver [Reglas del proyecto](#reglas-del-proyecto)). Última actualización: 2026-11-09 · importes en dólares y pantalla *Cobrar*.

## Qué hace

| Pantalla | Para qué sirve |
|---|---|
| **Inicio** | Contador de lo que ganas al día con las parcelas actuales, lo que llevas hoy (se mueve en directo), lo que ganas al mes y al año, y el próximo canjeo (tocándolo se abre *Cobrar*). |
| **Evolución** | Gráfica de la ganancia diaria (3 meses, 6 meses o 1 año), estadísticas y lista de registros (se pueden borrar). |
| **Objetivos** | Fecha estimada para cada meta: canjear el mínimo, juntar dinero, llegar a N parcelas o a X $/día. Ritmo de compra ajustable con un deslizador. |
| **Cobrar** | Réplica adaptada de la pantalla *Ingresos acumulados* del juego: ingresos acumulados en directo con barra hacia el mínimo, cuándo se puede canjear por dinero real y, para pasarlos a Atlas Bucks, un selector de parcelas con botones grandes + y − (y "todas las que me llegan") que compara comprar ahora con esperar a canjear. |
| **Ajustes** | Valores del juego editables (mínimo para canjear: 5 $; Atlas Bucks por 1 $: 25; Atlas Bucks por parcela: 100) y cerrar sesión en el dispositivo. |

### Reglas del juego usadas (confirmadas por el usuario)

- **Moneda: dólares ($)**, tal como los muestra el juego. Toda la app muestra $.
- Los ingresos acumulados se pueden **canjear por dinero real a partir de 5 $** (pantalla *Ingresos acumulados* del juego).
- **1 $ de renta = 25 Atlas Bucks (AB)**; **una parcela = 100 AB = 4 $** de renta.
- Estos tres valores viven en Ajustes (tabla `settings`), no en el código.
- Aún **sin confirmar** y por eso no usados: tipos de parcela con sus ganancias, boosts x20/x50 y pasaporte, insignias.

### No hay conexión con la cuenta de Atlas Earth

Atlas Earth **no tiene API pública** (se buscó y no se encontró). La app no lee la cuenta: **los datos se apuntan a mano** con el botón *Actualizar mis parcelas* (parcelas, ganancia diaria y saldo, copiados de la app del juego). Cuantas más veces se apunte, mejor sale la evolución.

### Supuestos de los cálculos

- Ganancia por parcela = ganancia diaria ÷ parcelas del último registro.
- El saldo mostrado es una **estimación**: saldo del último registro + ganancia diaria × tiempo transcurrido.
- "Hoy llevas" = ganancia diaria × fracción del día transcurrida desde las 00:00 (estimación, no el dato real del juego).
- En *Cobrar* el coste (parcelas × 4 $) sale de los ingresos acumulados, y se asume que cada parcela nueva rinde lo mismo que la media actual.
- Ritmo de compra por defecto = parcelas ganadas al mes en el último año (si hay menos de 2 registros o menos de ~1 semana entre ellos, 5 parcelas/mes).
- Un mes = 30,44 días.

## Arquitectura

```
Móvil (PWA en GitHub Pages)
        │  POST (texto plano) con {key, action, payload}
        ▼
Proxy en Netlify  ── https://israelreyes-proxy.netlify.app/atlas-earth
        │  evita los bloqueos de LaLiga y añade el CORS
        ▼
Worker de Cloudflare  ── código en GitHub (carpeta worker/), desplegado desde GitHub
        │
        ▼
Base de datos D1 (Cloudflare)
```

- Todas las cuentas son gratuitas (GitHub, Cloudflare, Netlify).
- **El proxy va siempre entre la PWA y el Worker.** La PWA nunca llama directamente a `workers.dev`.
- La API es un único endpoint que recibe siempre `POST` con cuerpo `text/plain` (JSON como texto). Así el navegador no hace *preflight* de CORS y el proxy no necesita permitir cabeceras especiales. **El Worker no añade cabeceras CORS** (las pone el proxy; duplicarlas rompe las peticiones).
- Acceso protegido con una clave (`API_KEY`, secreto del Worker). La app la pide la primera vez y la guarda en el dispositivo.

## Estructura del repositorio

```
index.html                  Página única
manifest.webmanifest        Datos de la PWA (nombre, iconos, colores)
sw.js                       Service worker (red primero, copia local si no hay conexión)
css/style.css               Estilos
icons/                      Iconos PNG 192, 512 y 180 (iOS)
js/
  main.js                   Arranque, clave, carga de datos y rutas por #hash
  config.js                 API_URL (ruta en el proxy de Netlify)
  api.js                    Llamadas a la API
  store.js                  Estado de la app + copia local para ir sin conexión
  session.js                Clave de acceso guardada en el dispositivo
  calc.js                   Cálculos puros (días hasta un objetivo, compras, ritmo…)
  goal-info.js              Convierte un objetivo en título, fecha, progreso y detalle
  chart.js                  Gráfica de línea en SVG
  format.js                 Formato de números y fechas en español
  html.js                   escapeHtml
  ui/nav.js                 Menú inferior
  screens/
    home.js evolution.js goals.js purchases.js update.js settings.js login.js empty.js
worker/
  wrangler.jsonc            Configuración del Worker y enlace con D1 (binding DB)
  src/
    index.js                Entrada: valida clave y reparte la acción
    auth.js json.js validate.js
    handlers/               Una acción por fichero: getAll, addSnapshot, deleteSnapshot,
                            addGoal, deleteGoal, saveSettings (+ index.js con el mapa)
```

## Datos (D1)

Las tablas se crean a mano en la consola de D1 (no hay fichero de esquema en el repo). **Si cambia una tabla, se actualiza aquí y se avisa para ejecutar el cambio en la consola.** SQL con el que se crearon:

```sql
CREATE TABLE IF NOT EXISTS snapshots (id INTEGER PRIMARY KEY AUTOINCREMENT, taken_at TEXT NOT NULL, parcels INTEGER NOT NULL, daily_income REAL NOT NULL, balance REAL NOT NULL);
CREATE TABLE IF NOT EXISTS goals (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, target REAL NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
```

- **snapshots**: `id`, `taken_at` (ISO UTC), `parcels` (entero), `daily_income` ($), `balance` ($, ingresos acumulados). Un registro por cada vez que se pulsa *Actualizar mis parcelas*.
- **goals**: `id`, `type` (`money` | `parcels` | `income`), `target`. El objetivo "Canjear X $" no se guarda: sale de los ajustes.
- **settings**: `key`, `value`. `withdraw_threshold` (5), `ab_per_dollar` (25) y `parcel_ab` (100). Si falta alguno, la app usa esos valores por defecto.

## API del Worker

Siempre `POST` a la URL del Worker (a través del proxy) con cuerpo `text/plain`:

```json
{ "key": "<API_KEY>", "action": "<acción>", "payload": { } }
```

| Acción | Payload | Respuesta |
|---|---|---|
| `getAll` | — | `{ settings, snapshots, goals }` |
| `addSnapshot` | `{ taken_at, parcels, daily_income, balance }` | `{ id }` |
| `deleteSnapshot` | `{ id }` | `{ ok }` |
| `addGoal` | `{ type, target }` | `{ id }` |
| `deleteGoal` | `{ id }` | `{ ok }` |
| `saveSettings` | uno o varios de `{ withdraw_threshold, ab_per_dollar, parcel_ab }` | `{ ok }` |

Errores: `401` clave incorrecta, `400` datos o acción no válidos, `405` si no es POST.

## Despliegue (primera vez)

Sin instalar nada en el ordenador: todo desde los paneles web y GitHub.

1. **Repositorio** `israelreyes-gif/atlas-earth-tracker` (público) — ✅ hecho.
2. **GitHub Pages**: *Settings → Pages → Deploy from a branch → `main` / `(root)`*. La app queda en `https://israelreyes-gif.github.io/atlas-earth-tracker/`.
3. **D1**: en Cloudflare, *Storage & databases → D1 → Create database* con el nombre `atlas-earth-tracker`. Copiar su *Database ID*, pegarlo en `worker/wrangler.jsonc` (campo `database_id`) y, en la pestaña *Console* de la base de datos, ejecutar el SQL de la sección [Datos (D1)](#datos-d1).
4. **Worker desde GitHub**: *Workers & Pages → Create → Import a repository* → elegir este repo. *Root directory*: `worker`. Cada commit en `main` despliega solo.
   - URL del Worker: `https://atlas-earth-tracker.israel-reyes.workers.dev`. La dirección `workers.dev` debe estar activada (en `wrangler.jsonc`: `workers_dev: true`; en el panel, *Settings → Domains & Routes*, interruptor *Production*).
5. **Secreto**: en el Worker, *Settings → Variables and Secrets → Add* → tipo *Secret*, nombre `API_KEY`, valor = la clave que se vaya a escribir en la app.
6. **Proxy de Netlify**: en el repo del proxy (`israelreyes-gif/api-proxy`, privado), fichero `netlify/edge-functions/proxy.ts`, añadir al mapa `RUTAS` la línea `'atlas-earth': '<URL del Worker>'` y hacer commit en `main`.
7. **Probar**: abrir la app, escribir la clave, pulsar *Actualizar mis parcelas* y guardar el primer registro.

### Estado del despliegue

- [x] Repositorio creado
- [x] GitHub Pages activado
- [x] D1 creada y `database_id` puesto en `worker/wrangler.jsonc`
- [x] Tablas creadas en la consola de D1
- [x] Worker conectado a GitHub y desplegado
- [x] Secreto `API_KEY` creado
- [x] Ruta `atlas-earth` añadida al proxy (repo `israelreyes-gif/api-proxy`)
- [ ] Primer registro guardado desde la app

## Reglas del proyecto

Instrucciones permanentes para quien trabaje en este repo (incluido Claude):

1. **Mantener este README completamente actualizado** en el mismo cambio que modifique el código: estructura, datos, API, despliegue y estado.
2. **Responder en español.**
3. **Guías paso a paso, un paso cada vez**; se avanza cuando el usuario dice "listo". Preguntas de una en una.
4. **Código en ficheros muy pequeños**, cada uno con una función concreta, sin mezclar responsabilidades.
5. **Antes de tocar varios ficheros, explicar en qué consiste el cambio.** Si se da código al usuario: ruta del fichero, si es nuevo o modificado, y el fichero **completo** (nunca fragmentos), para copiar y pegar.
6. **El usuario no puede instalar Node.js**: nada de Wrangler/CLI en su equipo. Todo se despliega con los paneles web y la conexión GitHub ↔ Cloudflare.
7. **Proxy siempre entre la PWA y el Worker** (Netlify, ruta `atlas-earth`). El Worker no añade CORS.
8. **No inventar datos del juego.** Atlas Earth no tiene API pública: los datos los apunta el usuario. Lo que no se sepa (costes, reglas del juego…) se pregunta o se deja configurable.
9. **Cuentas gratuitas**: no usar nada que requiera pago.
10. Rutas de archivos en el HTML/JS siempre **relativas** (la app vive en `/atlas-earth-tracker/`, no en la raíz del dominio).
11. **Cambios que dependan de la base de datos** (columnas o tablas nuevas): dar primero el SQL, esperar a que el usuario diga "listo" y solo entonces subir el código.
12. Commits a `main` (despliegan solos). Mensajes claros en español.

## Pendiente / ideas

- Si Atlas Earth cambia o se descubre un dato fiable, revisar los supuestos de cálculo de arriba.
- Posibles mejoras: exportar/importar registros, avisos cuando se llegue al mínimo para canjear, varios ritmos de compra por escenario.
