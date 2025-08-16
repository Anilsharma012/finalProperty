// Global API helper function
export function api(path: string, options: any = {}) {
  const token = localStorage.getItem("token");

  // Use relative URLs (empty base) since we're on the same domain
  const baseUrl = "";

  // Ensure path starts with /api/
  const apiPath = path.startsWith("/api/")
    ? path
    : `/api${path.startsWith("/") ? path : "/" + path}`;

  return fetch(baseUrl + apiPath, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).then(async (response) => {
    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Try to parse as JSON
    try {
      return await response.json();
    } catch (error) {
      throw new Error("Invalid JSON response");
    }
  });
}

// Make it globally available
(window as any).api = api;
