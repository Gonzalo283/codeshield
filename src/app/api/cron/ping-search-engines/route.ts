// Cron: runs daily at 6am UTC
// Pings Google and Bing to re-crawl our sitemap
// Vercel cron config in vercel.json

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sitemapUrl = "https://codeshield.sh/sitemap.xml";
  const results: Record<string, number> = {};

  try {
    const googleRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    results.google = googleRes.status;
  } catch { results.google = 0; }

  try {
    const bingRes = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    results.bing = bingRes.status;
  } catch { results.bing = 0; }

  // Also ping IndexNow (Bing/Yandex instant indexing)
  try {
    const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: "codeshield.sh",
        key: process.env.INDEXNOW_KEY || "codeshield",
        urlList: [
          "https://codeshield.sh",
          "https://codeshield.sh/scan-free",
          "https://codeshield.sh/pricing",
          "https://codeshield.sh/blog",
          "https://codeshield.sh/docs",
        ],
      }),
    });
    results.indexnow = indexNowRes.status;
  } catch { results.indexnow = 0; }

  return Response.json({
    success: true,
    timestamp: new Date().toISOString(),
    results,
  });
}
