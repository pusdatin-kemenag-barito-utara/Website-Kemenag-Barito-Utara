import type { APIRoute } from "astro";

export const prerender = false;

export const ALL: APIRoute = async ({ request, params }) => {
  const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8080";
  const url = new URL(request.url);
  const target = `${backendUrl}/api/${params.path || ""}${url.search}`;

  const reqHeaders = new Headers(request.headers);
  reqHeaders.set("host", "127.0.0.1:8080");
  // Prevent double-compression issues across reverse proxy
  reqHeaders.delete("accept-encoding");

  // Forward client IP and original host/protocol
  const clientIP = request.headers.get("cf-connecting-ip") ||
                   request.headers.get("x-real-ip") ||
                   request.headers.get("x-forwarded-for") ||
                   "127.0.0.1";
  reqHeaders.set("cf-connecting-ip", clientIP);
  reqHeaders.set("x-forwarded-for", clientIP);
  reqHeaders.set("x-real-ip", clientIP);

  const originalHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const originalProto = request.headers.get("x-forwarded-proto") || (url.protocol.replace(":", "") || "http");
  if (originalHost) reqHeaders.set("x-forwarded-host", originalHost);
  if (originalProto) reqHeaders.set("x-forwarded-proto", originalProto);

  try {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const response = await fetch(target, {
      method: request.method,
      headers: reqHeaders,
      body: hasBody ? request.body : undefined,
      // @ts-ignore
      duplex: "half",
    });

    const resHeaders = new Headers();
    response.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      // Skip cookies here to handle via getSetCookie below
      // Also strip content-encoding / content-length because Node fetch decodes stream
      if (lower !== "set-cookie" && lower !== "content-encoding" && lower !== "content-length") {
        resHeaders.set(key, val);
      }
    });

    // Forward Set-Cookie headers properly so auth cookies reach the browser
    // @ts-ignore
    if (typeof response.headers.getSetCookie === "function") {
      // @ts-ignore
      const cookies = response.headers.getSetCookie();
      for (const cookie of cookies) {
        if (cookie) resHeaders.append("set-cookie", cookie);
      }
    } else {
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        resHeaders.append("set-cookie", setCookie);
      }
    }

    // Explicitly disable buffering and compression for SSE streams
    const contentType = resHeaders.get("content-type") || "";
    if (contentType.includes("text/event-stream")) {
      resHeaders.set("Cache-Control", "no-cache, no-transform");
      resHeaders.set("X-Accel-Buffering", "no");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Backend proxy error", message: err?.message }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
