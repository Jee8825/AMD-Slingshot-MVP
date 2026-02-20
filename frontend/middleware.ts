/* ── DigiGram Pro — Next.js Middleware (Route Protection) ── */

import { NextResponse, type NextRequest } from "next/server";

/**
 * Minimal JWT payload decoder (no verification — that happens server-side).
 * We only need `role` from the payload to make routing decisions at the edge.
 */
function parseJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const base64 = token.split(".")[1];
        if (!base64) return null;
        const json = Buffer.from(base64, "base64").toString("utf-8");
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/** Routes that require the OFFICIAL role. */
const officialRoutes = ["/official"];

/** Routes that are only accessible to unauthenticated users. */
const authRoutes = ["/login", "/register"];

/** Public assets / API that should never be intercepted. */
const publicPrefixes = ["/_next", "/api", "/favicon.ico", "/uploads"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static assets and API routes
    if (publicPrefixes.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    const token = request.cookies.get("access_token")?.value;

    // ── Attempt to also read from the Authorization header ──
    // (For MVP, the token lives in localStorage, which is sent
    //  via the custom x-access-token header set by the client.
    //  In production, HTTP-only cookies would be preferred.)
    const headerToken =
        request.headers.get("x-access-token") ||
        request.headers.get("authorization")?.replace("Bearer ", "");

    const jwt = token || headerToken || null;
    const payload = jwt ? parseJwtPayload(jwt) : null;
    const role = (payload?.role as string) ?? null;
    const isAuthenticated = !!payload;

    // ── Guard: Redirect unauthenticated users away from protected pages ──
    // For the MVP, we only protect /official/* routes at the middleware level.
    // Client-side AuthContext handles broader auth gating.

    if (
        officialRoutes.some((r) => pathname.startsWith(r)) &&
        (!isAuthenticated || role === "CITIZEN")
    ) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("redirect", pathname);
        loginUrl.searchParams.set("reason", "unauthorized");
        return NextResponse.redirect(loginUrl);
    }

    // ── Guard: Redirect authenticated users away from auth pages ──
    if (authRoutes.some((r) => pathname.startsWith(r)) && isAuthenticated) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = "/";
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    /**
     * Match all routes except static files.
     * The negative lookahead skips _next/static, _next/image, and favicon.
     */
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
