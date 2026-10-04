/**
 * fetch + JSON with one automatic retry. A request that fails (network
 * error, timeout or a 5xx) is tried once more after a short pause before the
 * caller sees the error, so a single slow or failed call no longer leaves a
 * section empty until the reader refreshes. 4xx answers are not retried.
 */
export async function fetchJSON(url, { retries = 1, timeoutMs = 20000, ...init } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (res.ok) return await res.json();
      const error = new Error(`HTTP ${res.status} for ${url}`);
      if (res.status < 500 || attempt >= retries) throw error;
      console.warn(`${error.message}; retrying`);
    } catch (err) {
      if (attempt >= retries || /HTTP 4\d\d/.test(err.message)) throw err;
      console.warn(`Request failed (${err.message}); retrying ${url}`);
    } finally {
      clearTimeout(timer);
    }
    await new Promise(r => setTimeout(r, 800));
  }
}
