// Import the existing API URL creation logic
import { createApiUrl } from './api';

// Make API helper available globally
function api(p: string, o: any = {}) {
  const t = localStorage.getItem('token');

  // Use the existing API URL logic to construct the proper URL
  const url = createApiUrl(p);

  return fetch(url, {
    method: o.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {})
    },
    body: o.body ? JSON.stringify(o.body) : undefined
  }).then(async r => {
    let jsonData;
    try {
      jsonData = await r.json();
    } catch (e) {
      // If JSON parsing fails, return a structured error
      const text = await r.text();
      console.error('Failed to parse JSON response:', text);
      jsonData = { error: 'Invalid JSON response', rawResponse: text };
    }

    return {
      ok: r.ok,
      status: r.status,
      json: jsonData
    };
  });
}

// Make it globally available
(window as any).api = api;

export { api };
