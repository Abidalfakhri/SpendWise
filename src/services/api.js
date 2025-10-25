export async function apiFetch(url, options = {}) {
  const { method = 'GET', headers = {}, body } = options;
  const merged = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(url, merged);
  const type = res.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof data === 'string' ? data : data?.message || 'Request failed';
    throw new Error(`${res.status} ${res.statusText} - ${message}`);
  }
  return data;
}