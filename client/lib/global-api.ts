// Make API helper available globally
function api(p: string, o: any = {}) {
  const t = localStorage.getItem('token');
  return fetch(import.meta.env.VITE_API_BASE_URL + p, {
    method: o.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {})
    },
    body: o.body ? JSON.stringify(o.body) : undefined
  }).then(async r => ({
    ok: r.ok,
    status: r.status,
    json: await r.json()
  }));
}

// Make it globally available
(window as any).api = api;

export { api };
