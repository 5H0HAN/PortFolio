import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  rateLimitHeaders,
  readJsonObject,
  RequestBodyError,
} from "@/lib/api-guards";
import {
  DiagnosticInputError,
  runDeliverabilityDiagnostic,
} from "@/lib/tool-checks";

const RATE_LIMIT = {
  limit: 30,
  namespace: "deliverability-diagnostic",
  windowMs: 60_000,
};

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, RATE_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many diagnostic requests. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    );
  }

  try {
    const body = await readJsonObject(request);
    const domain = typeof body.domain === "string" ? body.domain : "";
    const report = await runDeliverabilityDiagnostic(domain);

    return NextResponse.json(report, {
      status: 200,
      headers: {
        ...rateLimitHeaders(rateLimit),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof DiagnosticInputError || error instanceof RequestBodyError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: error instanceof RequestBodyError ? error.status : 400,
          headers: rateLimitHeaders(rateLimit),
        },
      );
    }

    return NextResponse.json(
      { error: "The DNS resolver did not complete the deliverability diagnostic. Try again shortly." },
      { status: 502, headers: rateLimitHeaders(rateLimit) },
    );
  }
}
