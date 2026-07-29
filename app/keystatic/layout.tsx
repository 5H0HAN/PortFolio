import type { Metadata } from "next";
import { notFound } from "next/navigation";

import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "Content Studio",
  robots: {
    index: false,
    follow: false,
  },
};

export default function KeystaticLayout() {
  const productionReady =
    process.env.NODE_ENV !== "production" ||
    Boolean(
      process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
        process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
        process.env.KEYSTATIC_SECRET &&
        process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
    );

  if (!productionReady) {
    notFound();
  }

  return (
    <div className="keystatic-shell">
      <KeystaticApp />
    </div>
  );
}
