/* ── DigiGram Pro — API Client ── */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Thin wrapper around fetch that handles JSON and auth headers.
 * The JWT token is stored in localStorage for this MVP.
 */
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    const headers: HeadersInit = {
        ...(options.headers || {}),
    };

    // Only set Content-Type for JSON bodies (not FormData)
    if (!(options.body instanceof FormData)) {
        (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Token expired or invalid — redirect to login
        if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        throw new Error("Session expired. Please log in again.");
    }

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.detail || `API error: ${res.status}`);
    }

    return res.json();
}

// ── Convenience methods ──────────────────────────
export const api = {
    get: <T>(url: string) => request<T>(url),

    post: <T>(url: string, body?: unknown) =>
        request<T>(url, {
            method: "POST",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),

    put: <T>(url: string, body?: unknown) =>
        request<T>(url, {
            method: "PUT",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),

    patch: <T>(url: string, body?: unknown) =>
        request<T>(url, {
            method: "PATCH",
            body: JSON.stringify(body),
        }),

    delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};

export default api;
