import { MetadataRoute } from "next";

const languages = [
  "python", "javascript", "typescript", "go", "java", "rust", "ruby", "php",
];

const vulnTypes = [
  "sql-injection", "xss", "hardcoded-secrets",
  "rsa-quantum-vulnerable", "ecdsa-quantum-vulnerable", "sha1-broken",
];

const blogSlugs = [
  "ai-generated-code-security-vulnerabilities",
  "post-quantum-cryptography-migration-guide",
  "owasp-top-10-ai-generated-code",
  "rsa-quantum-vulnerable-migrate-ml-kem",
  "snyk-vs-codeshield-ai-code-security",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || "https://codeshield.ai";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const languagePages: MetadataRoute.Sitemap = languages.map((lang) => ({
    url: `${baseUrl}/scan/${lang}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const vulnPages: MetadataRoute.Sitemap = vulnTypes.map((type) => ({
    url: `${baseUrl}/vulnerabilities/${type}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const scanFree: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/scan-free`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  return [...staticPages, ...scanFree, ...blogPages, ...languagePages, ...vulnPages];
}
