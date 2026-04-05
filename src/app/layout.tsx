import type { Metadata } from "next";
import "./globals.css";
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from "@/components/json-ld";
import { GoogleAnalytics, PostHogAnalytics } from "@/components/analytics";

export const metadata: Metadata = {
  title: {
    default: "CodeShield.ai — Secure AI-Generated Code | Post-Quantum Ready",
    template: "%s | CodeShield.ai",
  },
  description:
    "The only security platform that makes AI-generated code quantum-safe. Scan GitHub repos for OWASP Top 10, secrets, and quantum-vulnerable crypto. Auto-fix with Claude AI.",
  keywords: [
    "AI code security scanner",
    "post-quantum cryptography migration",
    "AI generated code vulnerabilities",
    "OWASP AI code",
    "PQC migration tool",
    "RSA quantum vulnerable",
    "GitHub security scanner",
    "code vulnerability detection",
    "DevSecOps AI",
    "NIST PQC standards",
    "cryptographic bill of materials",
    "CBOM",
    "Snyk alternative",
  ],
  authors: [{ name: "CodeShield.ai" }],
  creator: "CodeShield.ai",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://codeshield.ai"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CodeShield.ai",
    title: "CodeShield.ai — The only platform that makes AI code quantum-safe",
    description:
      "45% of AI code has vulnerabilities. NIST deprecates RSA/ECDSA by 2030. Scan repos, detect quantum-vulnerable crypto, auto-fix with AI.",
    images: [
      {
        url: "/api/og?title=Secure%20every%20line%20your%20AI%20writes.&stat=45%25%20of%20AI%20code%20has%20vulnerabilities",
        width: 1200,
        height: 630,
        alt: "CodeShield — AI Code Security Scanner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeShield.ai — The only platform that makes AI code quantum-safe",
    description:
      "45% of AI code has vulnerabilities. NIST deprecates RSA/ECDSA by 2030. Scan repos, detect quantum-vulnerable crypto, auto-fix with AI.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <OrganizationJsonLd />
        <SoftwareApplicationJsonLd />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <GoogleAnalytics />
        <PostHogAnalytics />
      </body>
    </html>
  );
}
