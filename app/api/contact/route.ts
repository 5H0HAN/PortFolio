import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  rateLimitHeaders,
  readJsonObject,
  RequestBodyError,
} from "@/lib/api-guards";
import { validateContactSubmission } from "@/lib/contact";
import { profile } from "@/lib/portfolio";

const CONTACT_RATE_LIMIT = {
  limit: 5,
  namespace: "contact",
  windowMs: 10 * 60_000,
};

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, CONTACT_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many messages were submitted. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    );
  }

  try {
    const validation = validateContactSubmission(await readJsonObject(request, 6_000));
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: rateLimitHeaders(rateLimit) },
      );
    }

    // A filled honeypot indicates an automated submission. Return success without
    // sending so bots do not learn how the filter works.
    if (validation.data.company) {
      return NextResponse.json(
        { ok: true },
        { status: 200, headers: rateLimitHeaders(rateLimit) },
      );
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.CONTACT_FROM_EMAIL?.trim();
    const to = process.env.CONTACT_TO_EMAIL?.trim() || profile.email;
    if (!apiKey || !from) {
      return NextResponse.json(
        { error: "Direct form delivery is not configured. Please use the email fallback." },
        { status: 503, headers: rateLimitHeaders(rateLimit) },
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `portfolio-contact-${validation.data.submissionId}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: validation.data.email,
        subject: `${validation.data.inquiry} from ${validation.data.name}`,
        text: [
          `Name: ${validation.data.name}`,
          `Email: ${validation.data.email}`,
          `Inquiry: ${validation.data.inquiry}`,
          "",
          "Project details:",
          validation.data.details,
        ].join("\n"),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "The message could not be delivered. Please use the email fallback." },
        { status: 502, headers: rateLimitHeaders(rateLimit) },
      );
    }

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: rateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: rateLimitHeaders(rateLimit) },
      );
    }

    return NextResponse.json(
      { error: "The message could not be delivered. Please use the email fallback." },
      { status: 500, headers: rateLimitHeaders(rateLimit) },
    );
  }
}
