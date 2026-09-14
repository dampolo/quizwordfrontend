const api = import.meta.env.VITE_API_URL;

async function refreshToken() {
  const response = await fetch(`${api}token/refresh/`, {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}

export async function apiFetch(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (response.status === 401) {
    const refreshed = await refreshToken();

    if (refreshed) {
      response = await fetch(url, {
        ...options,
        credentials: "include",
      });
    }
  }

  return response;
}
