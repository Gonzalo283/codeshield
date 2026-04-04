import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  const repo = request.nextUrl.searchParams.get("repo");
  const vulns = request.nextUrl.searchParams.get("v") || "0";
  const critical = request.nextUrl.searchParams.get("c") || "0";

  const count = parseInt(vulns, 10);
  const critCount = parseInt(critical, 10);

  let color = "#00E87B"; // green
  let label = "secure";
  if (critCount > 0) {
    color = "#F43F5E";
    label = `${critCount} critical`;
  } else if (count > 0) {
    color = "#F59E0B";
    label = `${count} issues`;
  }

  const repoLabel = owner && repo ? `${owner}/${repo}` : "codeshield";

  // Generate SVG badge (shields.io compatible format)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20" role="img" aria-label="CodeShield: ${label}">
  <title>CodeShield: ${label}</title>
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
    <text x="145" y="14" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="145" y="13">${label}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
