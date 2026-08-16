import type { APIRoute } from "astro";

export const prerender = false;

export const ALL: APIRoute = async ({ request, params }) => {
  const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8080";
  const url = new URL(request.url);
  const target = `${backendUrl}/api/${params.path || ""}${url.search}`;

  const reqHeaders = new Headers(request.headers);
  reqHeaders.set("host", "127.0.0.1:8080");

  // Forward client IP and original host/protocol
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
      if (key.toLowerCase() !== "set-cookie") {
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
