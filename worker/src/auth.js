// Comprueba la clave de acceso contra el secreto API_KEY del Worker.
export function authorize(key, env) {
  if (!env.API_KEY || typeof key !== 'string') return false;
  const received = new TextEncoder().encode(key);
  const expected = new TextEncoder().encode(env.API_KEY);
  if (received.length !== expected.length) return false;
  return crypto.subtle.timingSafeEqual(received, expected);
}
