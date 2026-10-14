import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(125deg, #fffdf9 5%, #ffece1 45%, #eee7ff 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "80px",
        color: "#241e30",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 42,
          fontWeight: 700,
          letterSpacing: "0.035em",
          color: "#6d4aff",
        }}
      >
        REERHUB
      </div>
      <div style={{ display: "flex", fontSize: 24, marginTop: 18 }}>
        Real Effective Engineering Roles Hub
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
