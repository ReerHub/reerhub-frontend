import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#F5F8FF",
        display: "flex",
        flexDirection: "column",
        padding: "80px",
        color: "#111827",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 42,
          fontWeight: 700,
          color: "#2F6FED",
        }}
      >
        ReerHub.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 70,
          fontWeight: 700,
          marginTop: 65,
        }}
      >
        Your next tech role.
      </div>
      <div style={{ display: "flex", fontSize: 70, fontWeight: 700 }}>
        Starts here.
      </div>
      <div style={{ display: "flex", fontSize: 28, marginTop: 35 }}>
        Official openings. Personalized Pro matching. India-first.
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
