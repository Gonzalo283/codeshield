import type { Metadata } from "next";
import "./globals.css";
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from "@/components/json-ld";
import { GoogleAnalytics, PostHogAnalytics } from "@/components/analytics";

export const metadata: Metadata = {
  title: {
    default: "CodeShield — Security scanner built for AI-generated code",
    template: "%s · CodeShield.sh",
  },
  description:
    "A security scanner built for the code Copilot, Cursor and Claude generate. Finds OWASP vulnerabilities, leaked secrets, and quantum-unsafe cryptography — then fixes them with Claude.",
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
  authors: [{ name: "CodeShield.sh" }],
  creator: "CodeShield.sh",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://codeshield.sh"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CodeShield.sh",
    title: "CodeShield — Security scanner built for AI-generated code",
    description:
      "Independent audits show ~45% of AI-generated code contains a vulnerability. CodeShield finds them and generates the fix before you merge.",
    images: [
      {
        url: "/api/og?title=Secure%20every%20line%20your%20AI%20writes.&stat=Built%20for%20AI-generated%20code",
        width: 1200,
        height: 630,
        alt: "CodeShield — Security scanner built for AI-generated code",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeShield — Security scanner built for AI-generated code",
    description:
      "Independent audits show ~45% of AI-generated code contains a vulnerability. CodeShield finds them and generates the fix before you merge.",
    images: ["/api/og?title=Secure%20every%20line%20your%20AI%20writes.&stat=Built%20for%20AI-generated%20code"],
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
  verification: {
    google: "BuOkl7ckiXiJTaEpcivRLUHMrP0dCLzLQ2cZ3MDIK-U",
  },
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
