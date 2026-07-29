import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Shohan Biswas - Google Workspace and email infrastructure specialist";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          color: "#f2f4f5",
          background:
            "linear-gradient(135deg, #080c11 0%, #101827 58%, #172a4a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a7adb7",
          }}
        >
          <span>Shohan Biswas</span>
          <span style={{ color: "#79de9a" }}>Systems ready</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              lineHeight: 1.02,
              fontWeight: 700,
              maxWidth: 930,
              letterSpacing: "-0.045em",
            }}
          >
            Reliable Workspace. Trusted mail.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#c0c6d0",
            }}
          >
            Migrations / DNS authentication / Deliverability / Backend tools
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            fontSize: 18,
            color: "#b9c0ff",
          }}
        >
          <span>Diagnose</span>
          <span>→</span>
          <span>Design</span>
          <span>→</span>
          <span>Implement</span>
          <span>→</span>
          <span>Verify</span>
        </div>
      </div>
    ),
    size,
  );
}
