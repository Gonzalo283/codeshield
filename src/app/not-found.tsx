import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Nav variant="marketing" />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-surface/60 text-xs font-mono text-text-dim mb-8">
            <span className="text-red">404</span>
            <span className="h-3 w-px bg-border" />
            <span>Not found</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            This route has no signature.
          </h1>
          <p className="text-text-secondary leading-relaxed mb-10">
            The page you were looking for either moved, never existed, or was
            quarantined by an overly cautious security scanner (ours,
            probably).
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary px-6 py-3">
              Take me home
            </Link>
            <Link href="/docs" className="btn-secondary px-6 py-3">
              Read the docs
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-xs text-text-dim mb-4 uppercase tracking-wider font-semibold">
              Popular destinations
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link href="/scan-free" className="text-text-secondary hover:text-text-primary transition-colors">
                &rarr; Scan a public repo
              </Link>
              <Link href="/pricing" className="text-text-secondary hover:text-text-primary transition-colors">
                &rarr; Pricing
              </Link>
              <Link href="/docs/api" className="text-text-secondary hover:text-text-primary transition-colors">
                &rarr; API Reference
              </Link>
              <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
                &rarr; Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
