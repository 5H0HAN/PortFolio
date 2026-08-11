import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";
import { profile, socialLinks } from "@/lib/portfolio";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact for Google Workspace & Email Support",
  description:
    "Contact Shohan Biswas about Google Workspace setup, email migration, SPF, DKIM, DMARC, deliverability, or backend automation.",
  path: "/contact",
  keywords: [
    "contact Google Workspace specialist",
    "email migration consultant",
    "email deliverability support",
  ],
});

export default function ContactPage() {
  const deliveryEnabled = Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.CONTACT_FROM_EMAIL?.trim(),
  );

  return (
    <div className="page-stack reveal-stack">
      <section className="contact-hero">
        <p className="kicker">Contact / Remote collaboration</p>
        <h1>Bring the current state. We&apos;ll define the next one.</h1>
        <a className="contact-email" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
      </section>

      <section className="contact-path-grid" aria-label="Contact options">
        <a href={`mailto:${profile.email}?subject=Project%20inquiry`}>
          <span>01 / Direct</span>
          <strong>Email</strong>
          <p>Best for a technical brief or ongoing support discussion.</p>
        </a>
        <a href="https://www.fiverr.com/theshohan" target="_blank" rel="noreferrer">
          <span>02 / Scoped work</span>
          <strong>Fiverr</strong>
          <p>Best for a defined Workspace, migration, or DNS engagement.</p>
        </a>
        <a href="https://www.linkedin.com/in/5h0han/" target="_blank" rel="noreferrer">
          <span>03 / Network</span>
          <strong>LinkedIn</strong>
          <p>Best for professional introductions and longer-term opportunities.</p>
        </a>
      </section>

      <section className="contact-workspace">
        <div className="contact-brief">
          <p className="kicker">A useful first message</p>
          <h2>Three things are enough.</h2>
          <ol>
            <li>
              <span>01</span>
              <p>What is happening now?</p>
            </li>
            <li>
              <span>02</span>
              <p>What outcome do you need?</p>
            </li>
            <li>
              <span>03</span>
              <p>Is there a deadline or cutover date?</p>
            </li>
          </ol>
          <div className="contact-socials">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <ContactForm deliveryEnabled={deliveryEnabled} />
      </section>
    </div>
  );
}
