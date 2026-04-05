// Ping Google to crawl our sitemap
// Call this endpoint after deploying new pages
// GET /api/ping-google

export async function GET() {
  const sitemapUrl = "https://codeshield.sh/sitemap.xml";

  try {
    // Ping Google
    const googleRes = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    );

    // Ping Bing
    const bingRes = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    );

    return Response.json({
      success: true,
      google: googleRes.status,
      bing: bingRes.status,
      sitemap: sitemapUrl,
      message: "Sitemap submitted to Google and Bing",
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: "Failed to ping search engines",
    }, { status: 500 });
  }
}
