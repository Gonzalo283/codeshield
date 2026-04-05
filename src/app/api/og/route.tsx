import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Secure every line your AI writes.";
  const subtitle = searchParams.get("subtitle") || "AI code security scanner + post-quantum crypto migration";
  const stat = searchParams.get("stat") || "";

  // Sanitize inputs
  const safeTitle = title.slice(0, 100);
  const safeSubtitle = subtitle.slice(0, 150);
  const safeStat = stat.slice(0, 50);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0B0D11 0%, #13161D 50%, #0B0D11 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,232,123,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,232,123,0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Green glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(0, 232, 123, 0.06)",
            filter: "blur(100px)",
          }}
        />

        {/* Logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(0, 232, 123, 0.15)",
              border: "2px solid rgba(0, 232, 123, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#00E87B",
            }}
          >
            S
          </div>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.5px" }}>
            CodeShield
          </span>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#00E87B" }}>.sh</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "#F1F5F9",
            lineHeight: 1.15,
            letterSpacing: "-1px",
            marginBottom: "20px",
            maxWidth: "900px",
          }}
        >
          {safeTitle}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "#94A3B8",
            lineHeight: 1.5,
            maxWidth: "800px",
            marginBottom: safeStat ? "32px" : "0",
          }}
        >
          {safeSubtitle}
        </div>

        {/* Stat badge */}
        {safeStat && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              background: "rgba(244, 63, 94, 0.1)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#F43F5E",
              width: "fit-content",
            }}
          >
            {safeStat}
          </div>
        )}

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "16px", color: "#64748B" }}>codeshield.sh</span>
          <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#64748B" }}>
            <span>AI Code Security</span>
            <span>Post-Quantum Crypto</span>
            <span>Auto-Fix</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
