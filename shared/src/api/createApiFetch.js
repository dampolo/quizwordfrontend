export function createApiFetch(api, request = fetch) {
  return async function apiFetch(url, options = {}) {
    let response = await request(url, { ...options, credentials: "include" });
    if (response.status === 401) {
      const refresh = await request(api + "token/refresh/", {
        method: "POST",
        credentials: "include",
      });
      if (refresh.ok)
        response = await request(url, { ...options, credentials: "include" });
    }
    return response;
  };
}
