import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  namespace: string;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

const MAX_RATE_LIMIT_KEYS = 2_000;
const rateLimits = new Map<string, RateLimitEntry>();

const getClientFingerprint = (request: NextRequest) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";

  return createHash("sha256").update(address.slice(0, 128)).digest("hex").slice(0, 24);
};

const pruneRateLimits = (now: number) => {
  for (const [key, entry] of rateLimits) {
    if (entry.resetAt <= now) rateLimits.delete(key);
  }

  while (rateLimits.size >= MAX_RATE_LIMIT_KEYS) {
    const oldestKey = rateLimits.keys().next().value as string | undefined;
    if (!oldestKey) break;
    rateLimits.delete(oldestKey);
  }
};

export function checkRateLimit(
  request: NextRequest,
  { limit, namespace, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const key = `${namespace}:${getClientFingerprint(request)}`;
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    pruneRateLimits(now);
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1_000),
    };
  }

  current.count += 1;
  rateLimits.delete(key);
  rateLimits.set(key, current);
  return {
    allowed: current.count <= limit,
    limit,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
  };
  if (!result.allowed) {
    headers["Retry-After"] = String(result.retryAfterSeconds);
  }
  return headers;
}

export async function readJsonBody(
  request: NextRequest,
  maxLength = 4_096,
): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxLength) {
    throw new RequestBodyError("Request body is too large.", 413);
  }

  const raw = await request.text();
  if (!raw || raw.length > maxLength) {
    throw new RequestBodyError(
      raw ? "Request body is too large." : "Request body is required.",
      raw ? 413 : 400,
    );
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new RequestBodyError("Request body must be valid JSON.", 400);
  }
}

export async function readJsonObject(
  request: NextRequest,
  maxLength = 4_096,
): Promise<Record<string, unknown>> {
  const value = await readJsonBody(request, maxLength);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RequestBodyError("Request body must be a JSON object.", 400);
  }
  return value as Record<string, unknown>;
}

export class RequestBodyError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "RequestBodyError";
  }
}
