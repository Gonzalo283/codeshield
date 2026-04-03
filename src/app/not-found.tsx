import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-8">
      <div className="text-center">
        <div className="text-6xl font-bold font-mono text-green mb-4">404</div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Page not found
        </h1>
        <p className="text-text-secondary mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green/10 text-green border border-green/30 rounded-xl text-sm font-medium hover:bg-green/20 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
