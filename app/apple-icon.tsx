import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Apple Touch Icon. Matches the dark brand surface with the SB monogram used in
// the site nav. iOS Safari ignores transparent corners and applies rounded
// squircles itself, so we render a full-bleed square.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #080c11 0%, #101827 70%, #172a4a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 116,
            height: 116,
            borderRadius: 28,
            border: "3px solid #79de9a",
            color: "#f2f4f5",
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          SB
        </div>
      </div>
    ),
    size,
  );
}