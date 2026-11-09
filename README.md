# Atlas Tracker

PWA personal para llevar la cuenta de mi dinero en el juego móvil **Atlas Earth**: cuánto llevo ganado, cuánto tengo para gastar y cuánto gano al día y al mes según las parcelas que tengo.

> **Este README es la fuente de verdad del proyecto.** Se actualiza en cada cambio (ver [Reglas del proyecto](#reglas-del-proyecto)). Última actualización: 2026-11-09 · primera versión con pantalla de inicio.

App: `https://israelreyes-gif.github.io/atlas-earth-tracker/`

## Para qué sirve

Para tener **mis números claros y realistas**. No sustituye a la app del juego: no sirve para canjear dinero ni para jugar.

- **Renta total acumulada** ($): todo lo ganado desde el inicio (en el juego: *Información del jugador → Renta total acumulada*). Nunca baja.
- **Saldo disponible** ($): lo que tengo para gastar (en el juego: la cifra de arriba del mapa). Sube con lo que gano y baja cuando gasto.
- **Gastado** ($) = renta total acumulada − saldo disponible. Ejemplo real del 2026-11-09: 16,2263… − 0,2263… = 16 $.
- **Ganancia al día y al mes**, calculada con mis parcelas por tipo.

### Pantallas

| Pantalla | Qué hace |
|---|---|
| **Inicio** (`#home`) | Tarjeta verde con renta total acumulada, saldo disponible y gastado, que **suben cada segundo**. Debajo, ganancia al día y al mes. Abajo, cuadrícula de colores con las cuatro parcelas (Común verde, Raro azul, Épico dorado, Legendario morado), cada una con **− y +**. No hay pantalla de ajustes: lo que da cada tipo por segundo **no cambia** y se fija en la base de datos (tabla `parcel_types`). |
| **Corregir el dinero** (`#money`) | Para volver a apuntar las dos cifras de dinero con las que muestra el juego. |

### Instalar como app (PWA)

En Safari (iPhone): abrir la URL → botón *Compartir* → *Añadir a pantalla de inicio*. Se instala con el nombre **Atlas Tracker** y el icono elegido (monograma A con flecha dorada, creado para esta app; el icono es propio, no copia el del juego). Si se cambia el icono, hay que borrar la app de la pantalla de inicio y volver a añadirla.

### Comportamiento táctil

Sin pellizco/zoom (viewport `user-scalable=no`, `touch-action: pan-x pan-y` y bloqueo de los gestos de Safari) y sin rebote al llegar al principio o final (`overscroll-behavior: none`). Los campos de texto usan 18 px para que Safari no haga zoom al escribir. Quitar el zoom resta accesibilidad: si hiciera falta, revertir estos tres puntos.

### Cómo funciona el contador

- Es un **cálculo local**: dinero guardado + (lo que ganan las parcelas por segundo × segundos desde que se guardó). No usa la red ni escribe en D1 cada segundo.
- D1 solo se escribe cuando **cambio algo**: pulso + o − (se guarda 0,8 s después del último toque) o corrijo el dinero.
- Al pulsar + o −, la app **fija primero el dinero que llevaba hasta ese instante** y desde ahí cuenta con el nuevo ritmo, para no perder lo ganado con las parcelas anteriores.
- Es una **estimación con las tarifas base**: sin boosts ni pasaporte, así que sale por debajo de lo real. Si difiere del juego, se corrige en *Corregir el dinero*.

### Fuera de alcance (por ahora)

- **Canjear dinero** (mínimo de 5 $): no se tiene en cuenta; para eso está la app real.
- **Boosts (x20 y x50) y pasaporte**: se incluirán más adelante.
- Evolución, objetivos y compras: no forman parte de este alcance; solo se añaden si se piden.

## Datos del juego confirmados

- Moneda: **dólares ($)**.
- Tipos de parcela: **Común, Raro, Épico y Legendario**. Cuenta del 2026-11-09: 28, 15, 9 y 4 (56 en total).
- El juego muestra lo que da cada parcela **por segundo**; la app lo pasa a día (× 86.400) y a mes (× 30,44).
- Tarifas base por segundo (de la captura de rarezas; fijas, solo se cambian en la base de datos): Común 0,0000000011 · Raro 0,0000000016 · Épico 0,0000000022 · Legendario 0,0000000044.
- **Boost x20 confirmado** (2026-11-09): con él activo, el saldo subió unos 0,17 $/día frente a los 0,008 $/día del cálculo base (≈ x21, es decir x20 más el +5 % de insignias, a falta de confirmar cómo se combinan). Está pendiente de incluir.
- 1 $ de renta = 25 Atlas Bucks; una parcela = 100 AB = 4 $. *(Confirmado, hoy sin uso.)*

## Arquitectura

PWA (GitHub Pages) → proxy de Netlify (ruta `atlas-earth`) → Worker de Cloudflare → D1. El Worker no añade CORS (lo hace el proxy).

- App: `https://israelreyes-gif.github.io/atlas-earth-tracker/`
- API desde la PWA: `https://israelreyes-proxy.netlify.app/atlas-earth`
- Worker (raíz `worker`, desplegado desde GitHub): `https://atlas-earth-tracker.israel-reyes.workers.dev`, con D1 `atlas-earth-tracker` (binding `DB`) y secreto `API_KEY`.
- Proxy: repo privado `israelreyes-gif/api-proxy`, fichero `netlify/edge-functions/proxy.ts`, mapa `RUTAS`.

### Estructura

```
index.html · manifest.webmanifest · sw.js · css/style.css
icons/  icon.svg (original del icono) · icon-192/512.png · icon-maskable-512.png · apple-touch-icon.png
js/  main.js (rutas) · config.js (URL de la API) · api.js · session.js · store.js
     calc.js (cálculos) · format.js · html.js · type-style.js (colores)
     screens/ home.js · money.js · login.js
     ui/      hero.js (tarjeta verde) · tiles.js (cuadrícula con − y +)
worker/  wrangler.jsonc · src/ index.js · auth.js · json.js · validate.js
         src/handlers/ index.js · getAll.js · saveState.js
```

## Datos (D1)

Ejecutar en la consola de la base de datos (ya ejecutado el 2026-11-09, con las cifras de la captura de ese día):

```sql
DROP TABLE IF EXISTS snapshots;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS parcel_types;
DROP TABLE IF EXISTS account;

CREATE TABLE parcel_types (id TEXT PRIMARY KEY, name TEXT NOT NULL, rate REAL NOT NULL, count INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL);
CREATE TABLE account (id INTEGER PRIMARY KEY CHECK (id = 1), total_earned REAL NOT NULL, balance REAL NOT NULL, updated_at TEXT NOT NULL);

INSERT INTO parcel_types (id, name, rate, count, position) VALUES
  ('comun', 'Común', 0.0000000011, 28, 1),
  ('raro', 'Raro', 0.0000000016, 15, 2),
  ('epico', 'Épico', 0.0000000022, 9, 3),
  ('legendario', 'Legendario', 0.0000000044, 4, 4);

INSERT INTO account (id, total_earned, balance, updated_at) VALUES (1, 16.2263008904824, 0.2263008903948, '2026-11-09T20:53:00Z');
```

- **parcel_types**: `id`, `name`, `rate` ($ por segundo de una parcela), `count` (cuántas tengo), `position` (orden).
- **account**: una sola fila (`id = 1`): `total_earned` ($), `balance` ($) y `updated_at` (instante ISO UTC al que corresponden esas cifras y los `count` actuales).

## API del Worker

Siempre `POST` con cuerpo `text/plain`: `{ "key": "<API_KEY>", "action": "<acción>", "payload": { } }`.

| Acción | Payload | Respuesta |
|---|---|---|
| `getAll` | — | `{ types: [{ id, name, rate, count }], account: { total_earned, balance, updated_at } }` |
| `saveState` | `{ total_earned, balance, updated_at, counts?: { idTipo: entero } }` | `{ ok }` |

Errores: `401` clave incorrecta, `400` datos o acción no válidos, `405` si no es POST.

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
10. **Caché**: el service worker (`sw.js`) va primero a la red con `cache: 'no-cache'` (revalida siempre, sin usar la caché HTTP de GitHub Pages) y solo usa lo guardado sin conexión. Al desplegar un cambio relevante, subir el número de `CACHE` en `sw.js`; la app busca versión nueva en cada visita y se recarga sola una vez.
11. Rutas de archivos en el HTML/JS siempre **relativas** (la app vive en `/atlas-earth-tracker/`, no en la raíz del dominio).
12. **Cambios que dependan de la base de datos** (columnas o tablas nuevas, o borrar datos): dar primero el SQL, esperar a que el usuario diga "listo" y solo entonces subir el código.
13. **Antes de decir que algo está implantado, comprobar en el repo que está desplegado** (build de GitHub Pages terminado y contenido publicado; despliegue del Worker si cambió). Mientras no lo esté, esperar y no avisar. Solo entonces decirle al usuario que pruebe.
14. Commits a `main` (despliegan solos). Mensajes claros en español.
