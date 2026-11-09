# Atlas Tracker

Repositorio vaciado el 2026-11-09 a petición del usuario: no queda código. Se conserva solo este README con lo que ya está decidido, para empezar de nuevo.

## Datos del juego confirmados por el usuario

- Moneda: dólares ($).
- Los ingresos acumulados se pueden canjear por dinero real a partir de **5 $**.
- **1 $ de renta = 25 Atlas Bucks (AB)**; **una parcela = 100 AB = 4 $**.
- Hay parcelas de distintos tipos que dan distinta ganancia (se muestra por segundo en el juego).
- Existen dos boosts (x20 y x50) y un pasaporte con niveles: cómo se aplican **no está confirmado**.

## Infraestructura que ya existe

- GitHub Pages: `https://israelreyes-gif.github.io/atlas-earth-tracker/`
- Worker de Cloudflare conectado a este repo (raíz `worker`): `https://atlas-earth-tracker.israel-reyes.workers.dev`, con D1 `atlas-earth-tracker` y secreto `API_KEY`.
- Proxy de Netlify (repo `israelreyes-gif/api-proxy`), ruta `atlas-earth`.

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
12. **Cambios que dependan de la base de datos** (columnas o tablas nuevas): dar primero el SQL, esperar a que el usuario diga "listo" y solo entonces subir el código.
13. Commits a `main` (despliegan solos). Mensajes claros en español.