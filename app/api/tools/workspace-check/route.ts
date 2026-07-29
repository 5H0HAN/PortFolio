import { NextRequest, NextResponse } from "next/server";
import { runWorkspaceDiagnostic } from "@/lib/tool-checks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const domain = typeof body?.domain === "string" ? body.domain.trim() : "";
    const dkimSelector = typeof body?.dkimSelector === "string" ? body.dkimSelector.trim() : "";

    if (!domain) {
      return NextResponse.json({ error: "Domain is required." }, { status: 400 });
    }

    const report = await runWorkspaceDiagnostic(domain, dkimSelector);
    return NextResponse.json(report, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Workspace diagnostic failed. Check domain value and try again." },
      { status: 500 }
    );
  }
}
