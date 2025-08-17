// Import the existing API URL creation logic
import { createApiUrl } from "./api";
import { safeReadResponse } from "./response-utils";

// Make API helper available globally
function api(p: string, o: any = {}) {
  const t = localStorage.getItem("token");

  // Use the existing API URL logic to construct the proper URL
  const url = createApiUrl(p);

  // Handle body - if it's already a string, use it as-is, otherwise stringify
  let bodyContent;
  if (o.body) {
    if (typeof o.body === 'string') {
      bodyContent = o.body;
    } else {
      bodyContent = JSON.stringify(o.body);
    }
  }

  return fetch(url, {
    method: o.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(o.headers || {}), // Use headers from options first
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    body: bodyContent,
  }).then(async (r) => {
    const { ok, status, data } = await safeReadResponse(r);

    return {
      ok,
      status,
      success: ok,
      data: data,
      json: data, // Keep for compatibility
    };
  });
}

// Make it globally available
(window as any).api = api;

export { api };
