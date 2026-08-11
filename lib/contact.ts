export const CONTACT_INQUIRIES = [
  "Google Workspace project",
  "Email migration",
  "DNS or deliverability help",
  "Backend or automation project",
  "General collaboration",
] as const;

export type ContactInquiry = (typeof CONTACT_INQUIRIES)[number];

export type ContactSubmission = {
  company: string;
  details: string;
  email: string;
  inquiry: ContactInquiry;
  name: string;
  submissionId: string;
};

type ContactValidationResult =
  | { data: ContactSubmission; success: true }
  | { error: string; success: false };

const normalizeSingleLine = (value: unknown, maxLength: number) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength + 1)
    : "";

const normalizeDetails = (value: unknown) =>
  typeof value === "string"
    ? value.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim()
    : "";

export function validateContactSubmission(value: unknown): ContactValidationResult {
  if (!value || typeof value !== "object") {
    return { success: false, error: "Enter your contact details." };
  }

  const input = value as Record<string, unknown>;
  const name = normalizeSingleLine(input.name, 80);
  const email = normalizeSingleLine(input.email, 254).toLowerCase();
  const inquiry = normalizeSingleLine(input.inquiry, 80);
  const company = normalizeSingleLine(input.company, 120);
  const details = normalizeDetails(input.details);
  const submissionId = normalizeSingleLine(input.submissionId, 64);

  if (name.length < 2 || name.length > 80) {
    return { success: false, error: "Enter a name between 2 and 80 characters." };
  }
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { success: false, error: "Enter a valid email address." };
  }
  if (!CONTACT_INQUIRIES.includes(inquiry as ContactInquiry)) {
    return { success: false, error: "Choose a valid inquiry type." };
  }
  if (details.length < 20 || details.length > 4_000) {
    return {
      success: false,
      error: "Enter project details between 20 and 4,000 characters.",
    };
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) {
    return { success: false, error: "Refresh the page and try again." };
  }

  return {
    success: true,
    data: {
      company,
      details,
      email,
      inquiry: inquiry as ContactInquiry,
      name,
      submissionId,
    },
  };
}

export function buildContactMailto(
  recipient: string,
  submission: Pick<ContactSubmission, "details" | "email" | "inquiry" | "name">,
) {
  const subject = encodeURIComponent(`${submission.inquiry} from ${submission.name}`);
  const body = encodeURIComponent(
    `Name: ${submission.name}\nEmail: ${submission.email}\n\nProject details:\n${submission.details}`,
  );
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}
