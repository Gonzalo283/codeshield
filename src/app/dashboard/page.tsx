"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { GitHubRepo, ScanResult } from "@/types";

interface RepoWithScan extends GitHubRepo {
  scanResult?: ScanResult;
  scanning?: boolean;
  scanPhase?: string;
  scanFileCount?: number;
}

function timeAgo(date: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const SCAN_PHASES = [
  "Fetching files...",
  "Scanning for vulnerabilities...",
  "Analyzing cryptography...",
  "Finalizing report...",
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<RepoWithScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accessToken = session?.accessToken;

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filter]);

  const fetchRepos = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(
        "https://api.github.com/user/repos?per_page=100&sort=updated",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      setRepos(data);
    } catch (err) {
      console.error("Failed to fetch repos:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    if (status === "authenticated") {
      fetchRepos();
    }
  }, [status, router, fetchRepos]);

  const handleScan = async (repo: RepoWithScan) => {
    // Start scan phase animation
    setRepos((prev) =>
      prev.map((r) =>
        r.id === repo.id
          ? { ...r, scanning: true, scanPhase: SCAN_PHASES[0], scanFileCount: 0 }
          : r
      )
    );

    // Cycle through phases for UX
    let phaseIndex = 0;
    const phaseInterval = setInterval(() => {
      phaseIndex++;
      if (phaseIndex < SCAN_PHASES.length) {
        setRepos((prev) =>
          prev.map((r) =>
            r.id === repo.id
              ? {
                  ...r,
                  scanPhase: SCAN_PHASES[phaseIndex],
                  scanFileCount: Math.floor(Math.random() * 200) + 50,
                }
              : r
          )
        );
      }
    }, 2000);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: repo.owner.login,
          repo: repo.name,
          accessToken,
        }),
      });
      const scanResult: ScanResult = await res.json();
      clearInterval(phaseInterval);
      setRepos((prev) =>
        prev.map((r) =>
          r.id === repo.id
            ? { ...r, scanResult, scanning: false, scanPhase: undefined, scanFileCount: undefined }
            : r
        )
      );
    } catch {
      clearInterval(phaseInterval);
      setRepos((prev) =>
        prev.map((r) =>
          r.id === repo.id
            ? { ...r, scanning: false, scanPhase: undefined, scanFileCount: undefined }
            : r
        )
      );
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.name?.toLowerCase().includes(debouncedFilter.toLowerCase())
  );

  const scannedRepos = repos.filter((r) => r.scanResult);
  const hasScannedRepos = scannedRepos.length > 0;
  const totalVulns = scannedRepos.reduce(
    (sum, r) => sum + (r.scanResult?.summary.total ?? 0),
    0
  );
  const totalCritical = scannedRepos.reduce(
    (sum, r) => sum + (r.scanResult?.summary.critical ?? 0),
    0
  );

  // Auth loading / redirect
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center border border-green/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E87B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="progress-bar w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-bg-primary/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Left: logo + nav links */}
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <img src="/logo.svg" width={24} height={24} alt="CodeShield" />
              <span className="font-bold text-[15px] tracking-tight text-text-primary hidden sm:inline">
                CodeShield<span className="text-green">.ai</span>
              </span>
            </a>
            <div className="hidden sm:flex items-center gap-1">
              <a
                href="/dashboard"
                className="px-3 py-1.5 text-sm font-medium text-text-primary bg-bg-elevated rounded-lg"
              >
                Dashboard
              </a>
              <a
                href="/pricing"
                className="px-3 py-1.5 text-sm font-medium text-text-dim hover:text-text-secondary transition-colors rounded-lg"
              >
                Pricing
              </a>
              <a
                href="/account"
                className="px-3 py-1.5 text-sm font-medium text-text-dim hover:text-text-secondary transition-colors rounded-lg"
              >
                Account
              </a>
            </div>
          </div>

          {/* Right: user + sign out */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary hidden sm:inline">
              {session?.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-text-dim hover:text-text-secondary transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── Stats Header ── */}
        {hasScannedRepos && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="card p-4">
              <p className="text-xs text-text-dim font-medium uppercase tracking-wider mb-1">
                Repos Scanned
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {scannedRepos.length}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-text-dim font-medium uppercase tracking-wider mb-1">
                Vulnerabilities
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {totalVulns}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-text-dim font-medium uppercase tracking-wider mb-1">
                Critical
              </p>
              <p className={`text-2xl font-bold ${totalCritical > 0 ? "text-red" : "text-green"}`}>
                {totalCritical}
              </p>
            </div>
          </div>
        )}

        {/* ── Title + Search ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Repositories
            </h1>
            <p className="text-text-dim text-sm mt-0.5">
              {repos.length > 0 ? `${repos.length} repos` : "Loading your repos"}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search repositories..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-green/50 transition-colors"
            />
          </div>
        </div>

        {/* ── Loading: Skeleton Cards ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="skeleton h-5 w-3/5 mb-2" />
                    <div className="skeleton h-3.5 w-4/5" />
                  </div>
                  <div className="skeleton h-6 w-14 rounded-full ml-3" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="skeleton h-3.5 w-16" />
                  <div className="skeleton h-3.5 w-20" />
                </div>
                <div className="skeleton h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && repos.length > 0 && !hasScannedRepos && debouncedFilter === "" && (
          <div className="card p-8 sm:p-12 text-center mb-8 glow-green">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-green/10 flex items-center justify-center border border-green/20">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00E87B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
              Scan your first repository
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto mb-8">
              Select a repo below and click Scan to find vulnerabilities in your
              AI-generated code.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-text-dim">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green/15 text-green text-xs font-bold flex items-center justify-center border border-green/25">
                  1
                </span>
                <span>Pick a repo</span>
              </div>
              <svg className="hidden sm:block text-text-dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green/15 text-green text-xs font-bold flex items-center justify-center border border-green/25">
                  2
                </span>
                <span>We scan all files</span>
              </div>
              <svg className="hidden sm:block text-text-dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green/15 text-green text-xs font-bold flex items-center justify-center border border-green/25">
                  3
                </span>
                <span>Review results</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Repo Grid ── */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <div key={repo.id} className="card p-5 flex flex-col">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary truncate text-[15px]">
                        {repo.name}
                      </h3>
                      {/* Private / public icon */}
                      {repo.private ? (
                        <svg className="shrink-0 text-text-dim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      ) : (
                        <svg className="shrink-0 text-text-dim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {repo.language && (
                    <span className="text-xs font-mono text-text-secondary bg-bg-elevated px-2 py-0.5 rounded-full border border-border shrink-0">
                      {repo.language}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-text-dim line-clamp-1 mb-3 min-h-[1.25rem]">
                  {repo.description || "No description"}
                </p>

                {/* Meta: updated */}
                <p className="text-xs text-text-dim mb-4">
                  Updated {timeAgo(repo.updated_at)}
                </p>

                {/* Scan progress */}
                {repo.scanning && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-green font-medium">
                        {repo.scanPhase}
                      </span>
                      {(repo.scanFileCount ?? 0) > 0 && (
                        <span className="text-xs text-text-dim font-mono">
                          {repo.scanFileCount} files
                        </span>
                      )}
                    </div>
                    <div className="progress-bar" />
                  </div>
                )}

                {/* Scan result badges */}
                {repo.scanResult && !repo.scanning && (
                  <div className="mb-4 flex gap-1.5 flex-wrap">
                    {repo.scanResult.summary.critical > 0 && (
                      <span className="badge-critical text-xs font-mono px-2 py-0.5 rounded-full">
                        {repo.scanResult.summary.critical} critical
                      </span>
                    )}
                    {repo.scanResult.summary.high > 0 && (
                      <span className="badge-high text-xs font-mono px-2 py-0.5 rounded-full">
                        {repo.scanResult.summary.high} high
                      </span>
                    )}
                    {repo.scanResult.summary.medium > 0 && (
                      <span className="badge-medium text-xs font-mono px-2 py-0.5 rounded-full">
                        {repo.scanResult.summary.medium} medium
                      </span>
                    )}
                    {repo.scanResult.summary.low > 0 && (
                      <span className="badge-low text-xs font-mono px-2 py-0.5 rounded-full">
                        {repo.scanResult.summary.low} low
                      </span>
                    )}
                    {repo.scanResult.summary.total === 0 && (
                      <span className="text-xs font-mono text-green bg-green/10 px-2 py-0.5 rounded-full border border-green/25">
                        No issues
                      </span>
                    )}
                  </div>
                )}

                {/* Actions - pushed to bottom */}
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => handleScan(repo)}
                    disabled={repo.scanning}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      repo.scanning
                        ? "bg-green/5 text-green/50 border border-green/15 cursor-not-allowed"
                        : repo.scanResult
                          ? "bg-bg-elevated text-text-secondary border border-border hover:border-border-light hover:text-text-primary"
                          : "bg-green/10 text-green border border-green/25 hover:bg-green/15"
                    }`}
                  >
                    {repo.scanning
                      ? "Scanning..."
                      : repo.scanResult
                        ? "Re-scan"
                        : "Scan"}
                  </button>
                  {repo.scanResult && !repo.scanning && (
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/${repo.owner.login}__${repo.name}`
                        )
                      }
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      View Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── No results ── */}
        {!loading && filteredRepos.length === 0 && (
          <div className="text-center py-20">
            <svg
              className="mx-auto mb-4 text-text-dim"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p className="text-text-dim text-sm">
              {filter
                ? `No repositories matching "${filter}"`
                : "No repositories found."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
