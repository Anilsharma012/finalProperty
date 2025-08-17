// Import the existing API URL creation logic
import { createApiUrl } from "./api";
import { safeReadResponse } from "./response-utils";

// Make API helper available globally
function api(p: string, o: any = {}) {
  const t = localStorage.getItem("token");

  // Use the existing API URL logic to construct the proper URL
  const url = createApiUrl(p);

  return fetch(url, {
    method: o.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    body: o.body ? JSON.stringify(o.body) : undefined,
  }).then(async (r) => {
    const { ok, status, data } = await safeReadResponse(r);

    return {
      ok,
      status,
      json: data,
    };
  });
}

// Make it globally available
(window as any).api = api;

export { api };
