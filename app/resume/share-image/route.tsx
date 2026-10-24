import { ImageResponse } from "next/og";
export function GET() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: 80,
        background: "linear-gradient(125deg,#fffdf9,#eee7ff)",
        color: "#241e30",
      }}
    >
      <div
        style={{
          display: "flex",
          fontWeight: 700,
          fontSize: 34,
          color: "#6d4aff",
        }}
      >
        REERHUB
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 22,
          letterSpacing: 5,
          marginTop: 12,
        }}
      >
        RESUME BUILDER
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 74,
          letterSpacing: -3,
          marginTop: 65,
        }}
      >
        Your experience.
      </div>
      <div style={{ display: "flex", fontSize: 74, letterSpacing: -3 }}>
        Beautifully presented.
      </div>
      <div style={{ display: "flex", fontSize: 26, marginTop: 35 }}>
        Three free templates. Watermark-free PDFs. Your next chapter.
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
