import FiverrProof from "@/components/fiverr-proof";
import type { ReactNode } from "react";

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <FiverrProof />
    </>
  );
}
