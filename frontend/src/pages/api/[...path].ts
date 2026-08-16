import type { APIRoute } from "astro";

export const prerender = false;

export const ALL: APIRoute = async ({ request, params }) => {
  const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8080";
  const url = new URL(request.url);
  const target = `${backendUrl}/api/${params.path || ""}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set("host", "127.0.0.1:8080");

  try {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // @ts-ignore
      duplex: "half",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
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
