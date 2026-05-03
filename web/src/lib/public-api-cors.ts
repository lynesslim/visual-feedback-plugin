import { NextRequest, NextResponse } from "next/server";

export function publicApiCorsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin");
  const allow = origin && origin !== "null" ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function publicCorsJson(
  request: NextRequest,
  body: unknown,
  status: number,
): NextResponse {
  const res = NextResponse.json(body, { status });
  const h = publicApiCorsHeaders(request);
  for (const [k, v] of Object.entries(h)) {
    res.headers.set(k, v);
  }
  return res;
}
