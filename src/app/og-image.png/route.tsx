import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f6f1e9 0%, #eee6da 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Cobalt glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(38, 82, 230, 0.12)",
            filter: "blur(80px)",
          }}
        />
        {/* Gold glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(211, 161, 74, 0.15)",
            filter: "blur(80px)",
          }}
        />

        {/* Moon logo */}
        <svg
          viewBox="0 0 256 256"
          fill="none"
          width="80"
          height="80"
          style={{ marginBottom: "24px" }}
        >
          <path
            d="M166 82c-8-4-17-6-27-6c-32 0-58 26-58 58s26 58 58 58c26 0 48-17 55-41c-7 4-16 6-25 6c-26 0-46-20-46-46c0-12 4-22 11-29c7-7 20-7 32 0z"
            stroke="#2652e6"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#10111a",
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}
        >
          DayDreamers Events
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "#70675f",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Hands-on events in AI, vibe coding, and engineering.
          Small groups. Expert instructors. Real projects.
        </div>

        {/* Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "32px",
            background: "#dfe7ff",
            color: "#2652e6",
            fontSize: "16px",
            fontWeight: 600,
            padding: "8px 24px",
            borderRadius: "999px",
            letterSpacing: "0.1em",
            textTransform: "uppercase" as any,
          }}
        >
          Browse Events
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
