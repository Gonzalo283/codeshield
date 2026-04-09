// API v1 root — returns documentation
export async function GET() {
  return Response.json({
    name: "CodeShield API",
    version: "v1",
    docs: "https://codeshield.sh/docs#api",
    endpoints: {
      "POST /api/v1/scan": {
        description: "Scan code or a GitHub repository for vulnerabilities",
        auth: "Bearer token (API key)",
        body: {
          code: "string (optional) — raw code to scan",
          language: "string (optional) — file extension (ts, js, py, go, java, rs)",
          repo: "string (optional) — GitHub repo URL (https://github.com/owner/repo)",
        },
        response: {
          scan: { filesScanned: "number", vulnerabilities: "Vulnerability[]", summary: "object" },
          usage: { plan: "string", scansRemaining: "number" },
        },
      },
      "GET /api/badge": {
        description: "Generate SVG badge for README",
        params: { v: "vulnerability count", c: "critical count" },
      },
      "GET /api/certificate": {
        description: "Generate security assessment certificate image",
        params: { owner: "string", repo: "string", score: "0-100", date: "YYYY-MM-DD" },
      },
      "GET /api/report": {
        description: "Generate PQC compliance report",
        auth: "Session (dashboard) or Bearer token",
      },
    },
    pricing: {
      free: { scansPerMonth: 10, price: "$0" },
      starter: { scansPerMonth: 100, price: "$49/month" },
      growth: { scansPerMonth: 1000, price: "$299/month" },
      enterprise: { scansPerMonth: "unlimited", price: "Custom" },
    },
    rateLimit: "60 requests/minute per IP",
    support: "enterprise@codeshield.sh",
  });
}
