export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CodeShield.ai",
    url: "https://codeshield.ai",
    logo: "https://codeshield.ai/logo.png",
    description:
      "The only security platform that makes AI-generated code quantum-safe. Scan GitHub repos for vulnerabilities and auto-fix with AI.",
    foundingDate: "2026",
    sameAs: [
      "https://github.com/codeshield-ai",
      "https://twitter.com/codeshieldai",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@codeshield.ai",
      contactType: "customer support",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CodeShield.ai",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free",
        description: "5 repos, 10 scans/month, PQC discovery",
      },
      {
        "@type": "Offer",
        price: "29",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "29",
          priceCurrency: "USD",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: "1",
            unitCode: "MON",
          },
        },
        name: "Team",
        description: "Unlimited scans, AI auto-fix, PQC migration, CBOM",
      },
      {
        "@type": "Offer",
        price: "79",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "79",
          priceCurrency: "USD",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: "1",
            unitCode: "MON",
          },
        },
        name: "Business",
        description: "SSO, compliance reports, SBOM, custom rules",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BlogPostJsonLd({
  title,
  description,
  datePublished,
  slug,
}: {
  title: string;
  description: string;
  datePublished: string;
  slug: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished,
    dateModified: datePublished,
    author: {
      "@type": "Organization",
      name: "CodeShield.ai",
      url: "https://codeshield.ai",
    },
    publisher: {
      "@type": "Organization",
      name: "CodeShield.ai",
      logo: { "@type": "ImageObject", url: "https://codeshield.ai/logo.png" },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://codeshield.ai/blog/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
