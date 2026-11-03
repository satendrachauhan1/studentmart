const apiOrigin = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export const isApiConfigured = !import.meta.env.PROD || Boolean(apiOrigin);

export function apiUrl(path) {
    return `${apiOrigin}/api/${String(path).replace(/^\/+/, "")}`;
}
