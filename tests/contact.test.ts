import { describe, expect, it } from "vitest";
import {
  buildContactMailto,
  type ContactSubmission,
  validateContactSubmission,
} from "@/lib/contact";

const validSubmission = {
  company: "",
  details: "We need help migrating twenty mailboxes next month.",
  email: "CLIENT@EXAMPLE.COM",
  inquiry: "Email migration",
  name: "Client Name",
  submissionId: "8e5d0d26-6d50-4cc1-8f9e-7f2d2d87fe29",
} satisfies ContactSubmission;

describe("contact submission validation", () => {
  it("normalizes a valid submission", () => {
    const result = validateContactSubmission(validSubmission);
    expect(result).toMatchObject({ success: true });
    if (result.success) expect(result.data.email).toBe("client@example.com");
  });

  it.each([
    { ...validSubmission, email: "not-an-email" },
    { ...validSubmission, inquiry: "Unexpected service" },
    { ...validSubmission, details: "Too short" },
    { ...validSubmission, submissionId: "not-a-uuid" },
  ])("rejects invalid form data", (submission) => {
    expect(validateContactSubmission(submission).success).toBe(false);
  });

  it("builds an encoded mail fallback", () => {
    const url = buildContactMailto("hello@example.com", validSubmission);
    expect(url).toContain("mailto:hello@example.com?");
    expect(url).toContain("Email%20migration%20from%20Client%20Name");
  });
});
