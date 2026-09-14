import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth.shared";
import { SITE_URL } from "@/lib/constants";

/** healthylook-aesthetic.com — the one hostname this site is published at. */
const CANONICAL_HOST = new URL(SITE_URL).host;

/**
 * Sends every request on a non-canonical hostname to the real domain.
 *
 * ── WHY ────────────────────────────────────────────────────────────────
 * A Vercel production deployment answers on its own `*.vercel.app` alias
 * as well as on the custom domain, and that alias serves the whole clinic
 * site. robots.txt already refuses crawlers on preview deployments, but a
 * production alias reports VERCEL_ENV as "production", so it was being
 * served the permissive robots.txt — the entire site, crawlable at a
 * second address, competing with itself.
 *
 * The canonical tags are correct and absolute, which is most of the
 * defence. They are a hint rather than a directive, though: the duplicate
 * can still be crawled and occasionally indexed. A 308 removes the
 * question — a crawler that follows it only ever sees one address, and
 * ranking signals land on that one.
 *
 * ── WHAT IT LEAVES ALONE, AND WHY EACH ─────────────────────────────────
 * Anything but a Vercel production deployment. Local development runs on
 * localhost and preview deployments are the whole point of previews —
 * redirecting either to the live site would make them impossible to look
 * at. VERCEL_ENV is the only thing that distinguishes the three.
 *
 * `/api/` — these are endpoints, not pages, and nothing about them is an
 * SEO problem (robots.txt disallows them already). What they are is
 * integration surface: the Sanity revalidation webhook and anything else
 * pointed at this deployment. A redirect only survives a client that
 * follows redirects and preserves the method, and a webhook that quietly
 * stops firing is a much worse failure than a duplicate URL.
 */
function canonicalHostRedirect(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return null;

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/")) return null;

  // The forwarded header is the one that survives Vercel's proxy; `host`
  // is the fallback for anywhere it is absent.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host || host === CANONICAL_HOST) return null;

  return NextResponse.redirect(`${SITE_URL}${pathname}${search}`, 308);
}

/**
 * Keeps signed-out visitors out of /admin.
 *
 * ── WHAT THIS DELIBERATELY DOES NOT DO ────────────────────────────────
 * It does not check whether the session is VALID, and it does not read
 * the user's role. Middleware runs on the edge runtime, where there is no
 * TCP socket and therefore no `pg` — a database lookup here is not
 * possible without a second, HTTP-based driver.
 *
 * So this is a cheap first gate: no cookie at all means no reason to boot
 * a server component. Every page and every action under /admin still
 * calls requireUser() or requireAdmin(), which is where the real check
 * happens against the database. A forged or expired cookie gets past
 * middleware and is then rejected properly one layer in.
 *
 * Treating middleware as the only gate is the standard way this goes
 * wrong, so it is worth being explicit: it is a redirect for humans, not
 * a security boundary.
 */
function adminGate(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // The login page is the one place under /admin a guest belongs.
  if (pathname === "/admin/login") {
    if (hasCookie) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!hasCookie) {
    const url = new URL("/admin/login", request.url);
    // Come back to where they were headed once they are in.
    if (pathname !== "/admin") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export function middleware(request: NextRequest) {
  // Host first: an /admin request arriving on the wrong hostname should be
  // moved to the right one before it is asked for a session, or the login
  // it is sent to sets its cookie on the hostname we are trying to retire.
  const wrongHost = canonicalHostRedirect(request);
  if (wrongHost) return wrongHost;

  if (request.nextUrl.pathname.startsWith("/admin")) return adminGate(request);

  return NextResponse.next();
}

export const config = {
  /**
   * Everything except Next's own asset routes and any path with a file
   * extension. The matcher used to be `/admin/:path*`; the host redirect
   * has to see every page request, so the /admin check moved into the
   * handler above.
   *
   * Static assets are excluded rather than redirected because they are
   * fetched by the page that already redirected — the browser is on the
   * canonical host by then and asks for them from there.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)"],
};
