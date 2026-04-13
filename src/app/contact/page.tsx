import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the CodeShield team — support, security disclosures, enterprise sales, and press.",
  alternates: { canonical: "/contact" },
};

const contacts = [
  {
    label: "Support & product feedback",
    desc: "Bug reports, questions, feature requests. We reply within one business day.",
    email: "hello@codeshield.sh",
    accent: "green",
  },
  {
    label: "Responsible disclosure",
    desc: "Found a vulnerability? Please email us privately. We won't pursue legal action against good-faith research.",
    email: "security@codeshield.sh",
    accent: "red",
  },
  {
    label: "Enterprise & SSO",
    desc: "SAML, custom contracts, Data Processing Addenda, self-hosted deployments.",
    email: "enterprise@codeshield.sh",
    accent: "blue",
  },
  {
    label: "Press & partnerships",
    desc: "Media enquiries, co-marketing, integrations.",
    email: "press@codeshield.sh",
    accent: "orange",
  },
];

const accentMap: Record<string, string> = {
  green: "border-l-green",
  red: "border-l-red",
  blue: "border-l-blue",
  orange: "border-l-orange",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Nav variant="marketing" />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-dim mb-3">
            Contact
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Talk to us.
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-12">
            The fastest way to reach CodeShield is email. We pick one of four
            inboxes depending on why you&rsquo;re writing.
          </p>

          <div className="space-y-4">
            {contacts.map((c) => (
              <a
                key={c.email}
                href={`mailto:${c.email}`}
                className={`block card p-6 border-l-2 ${accentMap[c.accent]} hover:border-green/40 transition-colors`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-text-primary mb-1">
                      {c.label}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                  <div className="font-mono text-sm text-green whitespace-nowrap">
                    {c.email} &rarr;
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-dim mb-4">
              Also helpful
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/docs" className="text-text-secondary hover:text-text-primary transition-colors">
                  &rarr; Documentation
                </a>
              </li>
              <li>
                <a href="/docs/api" className="text-text-secondary hover:text-text-primary transition-colors">
                  &rarr; API Reference
                </a>
              </li>
              <li>
                <a href="/security" className="text-text-secondary hover:text-text-primary transition-colors">
                  &rarr; Security policy
                </a>
              </li>
              <li>
                <a href="/changelog" className="text-text-secondary hover:text-text-primary transition-colors">
                  &rarr; Changelog
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
