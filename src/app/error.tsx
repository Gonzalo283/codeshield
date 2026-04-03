"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red/10 flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff3366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Something went wrong
        </h1>
        <p className="text-text-secondary mb-2">
          An unexpected error occurred. Our team has been notified.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-text-dim mb-6">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 bg-green/10 text-green border border-green/30 rounded-xl text-sm font-medium hover:bg-green/20 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-bg-card border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
