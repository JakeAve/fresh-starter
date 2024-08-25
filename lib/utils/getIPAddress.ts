import { FreshContext } from "$fresh/server.ts";

export function getIPAddress(
    req: Request,
    ctx: FreshContext,
): string | null {
    if (!("hostname" in ctx.remoteAddr)) {
        return null;
    }
    const hostname = ctx.remoteAddr.hostname;

    let xForwardedFor = req.headers.get("X-Forwarded-For");
    if (xForwardedFor?.includes(",")) {
        xForwardedFor = xForwardedFor.replace(/,.*/, "");
    }
    return xForwardedFor ?? hostname;
}
