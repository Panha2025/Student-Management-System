export async function requestJson(url, { method = 'GET', data, timeout = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: data === undefined ? { Accept: 'application/json' } : {
        Accept: 'application/json', 'Content-Type': 'application/json',
      },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Server returned HTTP ${response.status}.`);
    if (response.status === 204) return null;
    const body = await response.text();
    if (!body.trim()) return null;
    try {
      return JSON.parse(body);
    } catch {
      throw new Error('The server response is not valid JSON.');
    }
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Request timed out. Check your connection and try again.');
    if (error instanceof TypeError) throw new Error('Could not reach the API. Check your connection or try again later.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
