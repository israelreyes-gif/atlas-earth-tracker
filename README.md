# Atlas Tracker

PWA personal para llevar la cuenta de mi dinero en el juego móvil **Atlas Earth**: cuánto tengo acumulado y cuánto gano al día y al mes según las parcelas que tengo.

> **Este README es la fuente de verdad del proyecto.** Se actualiza en cada cambio (ver [Reglas del proyecto](#reglas-del-proyecto)). Última actualización: 2026-11-09 · el repo está vacío de código; este README define el alcance para empezar de nuevo.

## Para qué sirve esta app

Para tener **mis números claros y realistas**. No sustituye a la app del juego: no sirve para canjear dinero ni para jugar. Sus tres cosas son:

1. **Mi dinero acumulado**: lo que llevo acumulado en el juego, que va subiendo solo con lo que gano.
2. **Mi dinero real**: pendiente de definir (ver [Punto abierto](#punto-abierto)).
3. **Lo que gano al día**, calculado a partir de mis parcelas.

### Mis parcelas (el corazón de la app)

- Configuro **cuántas parcelas tengo y de qué tipo**, de forma cómoda (botones **+ y −** por cada tipo).
- Cada **tipo** tiene un nombre y lo que da una parcela de ese tipo. Lo apunto **tal como lo muestra el juego (por segundo)** y la app lo pasa a día (× 86.400).
- Con esa configuración, la app calcula la ganancia diaria **sin que yo escriba la cifra**: suma de (parcelas de cada tipo × lo que da cada una).

### Estadísticas que da

- Lo que gano **al día** y **al mes** con mis parcelas actuales.
- Desglose por tipo: cuánto aporta cada tipo al día y al mes.
- Ganancia media por parcela.
- El dinero acumulado **estimado en este momento**: último valor apuntado + lo ganado desde entonces.

### Fuera de alcance (por ahora)

- **Canjear dinero** (mínimo de 5 $): no se tiene en cuenta; para eso está la app real.
- **Boosts (x20 y x50) y pasaporte**: se incluirán más adelante. Hasta entonces los cálculos usan solo el valor base de cada tipo de parcela.
- Evolución, objetivos y compras: no forman parte de este alcance; solo se añaden si se piden.

## Datos del juego confirmados

- Moneda: **dólares ($)**.
- Hay parcelas de **distintos tipos** que dan distinta ganancia; el juego la muestra por segundo.
- 1 $ de renta = 25 Atlas Bucks; una parcela = 100 AB = 4 $. *(Dato confirmado, hoy sin uso.)*

## Supuestos de los cálculos

- Ganancia al día = Σ (parcelas del tipo × $ por segundo × 86.400).
- Ganancia al mes = ganancia al día × 30,44.
- El dinero acumulado mostrado es una **estimación** entre dos apuntes.
- No se inventan datos del juego: todo lo que no se sabe se configura o se pregunta.

## Punto abierto

Falta definir qué es **"dinero real"** en la app (por ejemplo: dinero ya cobrado en la vida real, o el equivalente en euros del acumulado). Hasta que se aclare no se diseña esa parte.

## Infraestructura que ya existe

- GitHub Pages: `https://israelreyes-gif.github.io/atlas-earth-tracker/`
- Worker de Cloudflare conectado a este repo (raíz `worker`): `https://atlas-earth-tracker.israel-reyes.workers.dev`, con D1 `atlas-earth-tracker` y secreto `API_KEY`.
- Proxy de Netlify (repo `israelreyes-gif/api-proxy`), ruta `atlas-earth`. La URL desde la PWA es `https://israelreyes-proxy.netlify.app/atlas-earth`.
- Arquitectura: PWA → proxy Netlify → Worker → D1. El Worker no añade CORS.

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
13. Commits a `main` (despliegan solos). Mensajes claros en español.
