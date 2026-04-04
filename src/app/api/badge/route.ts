import { NextRequest } from "next/server";

// Sanitize text for SVG to prevent injection
function sanitizeSvgText(text: string): string {
  return text.replace(/[<>&"']/g, (c) => {
    const map: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" };
    return map[c] || c;
  });
}

export async function GET(request: NextRequest) {
  const vulns = request.nextUrl.searchParams.get("v") || "0";
  const critical = request.nextUrl.searchParams.get("c") || "0";

  // Clamp values to sane range
  const count = Math.min(Math.max(parseInt(vulns, 10) || 0, 0), 9999);
  const critCount = Math.min(Math.max(parseInt(critical, 10) || 0, 0), 9999);

  let color = "#00E87B";
  let label = "secure";
  if (critCount > 0) {
    color = "#F43F5E";
    label = `${critCount} critical`;
  } else if (count > 0) {
    color = "#F59E0B";
    label = `${count} issues`;
  }

  const safeLabel = sanitizeSvgText(label);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20" role="img" aria-label="CodeShield: ${safeLabel}">
  <title>CodeShield: ${safeLabel}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="200" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="90" height="20" fill="#555"/>
    <rect x="90" width="110" height="20" fill="${color}"/>
    <rect width="200" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="45" y="14" fill="#010101" fill-opacity=".3">CodeShield</text>
    <text x="45" y="13">CodeShield</text>
    <text x="145" y="14" fill="#010101" fill-opacity=".3">${safeLabel}</text>
    <text x="145" y="13">${safeLabel}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
    },
  });
}
