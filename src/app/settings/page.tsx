"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Providers from "../providers";

function SettingsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="progress-bar w-48" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const mockApiKey = "cs_live_" + (session?.user?.id || "demo").slice(0, 8) + "...";

  const handleCopyKey = () => {
    navigator.clipboard.writeText("cs_live_xxxxxxxxxxxxxxxxxxxx");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-bg-primary/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="flex items-center gap-2.5">
              <img src="/logo.svg" width={24} height={24} alt="CodeShield" />
              <span className="font-bold text-text-primary font-mono hidden sm:inline">CodeShield</span>
            </a>
            <div className="hidden sm:flex items-center gap-1">
              <a href="/dashboard" className="px-3 py-1.5 text-sm text-text-dim hover:text-text-secondary transition-colors rounded-lg">Dashboard</a>
              <a href="/settings" className="px-3 py-1.5 text-sm font-medium text-text-primary bg-bg-elevated rounded-lg">Settings</a>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-text-dim hover:text-text-secondary transition-colors">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-8 md:py-12">
        <h1 className="text-2xl font-bold text-text-primary mb-8">Settings</h1>

        {/* Profile */}
        <section className="bg-bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-5">Profile</h2>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <img src={session.user.image} alt="" className="w-14 h-14 rounded-full border-2 border-border" />
            )}
            <div>
              <div className="font-semibold text-text-primary text-lg">{session?.user?.name}</div>
              <div className="text-sm text-text-secondary">{session?.user?.email}</div>
            </div>
          </div>
        </section>

        {/* Plan */}
        <section className="bg-bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-5">Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">Free Plan</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-elevated text-text-dim border border-border">CURRENT</span>
              </div>
              <p className="text-sm text-text-secondary mt-1">5 repos, 10 scans/month</p>
            </div>
            <a href="/pricing" className="btn-primary text-sm px-4 py-2">Upgrade</a>
          </div>
        </section>

        {/* API Key */}
        <section className="bg-bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-5">API Key</h2>
          <p className="text-sm text-text-secondary mb-4">Use this key to authenticate with the CodeShield API and GitHub Action.</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-bg-primary border border-border rounded-lg px-4 py-2.5 font-mono text-sm text-text-secondary">
              {apiKeyVisible ? "cs_live_a8f3k2m9x7p1q4w6" : mockApiKey}
            </div>
            <button
              onClick={() => setApiKeyVisible(!apiKeyVisible)}
              className="btn-secondary text-sm px-3 py-2.5"
            >
              {apiKeyVisible ? "Hide" : "Show"}
            </button>
            <button onClick={handleCopyKey} className="btn-secondary text-sm px-3 py-2.5">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-5">Notifications</h2>
          <div className="space-y-4">
            {[
              { label: "Scan complete alerts", desc: "Get notified when a scan finishes", defaultOn: true },
              { label: "Critical vulnerability alerts", desc: "Immediate alerts for critical findings", defaultOn: true },
              { label: "Weekly security digest", desc: "Summary of your security posture", defaultOn: false },
              { label: "Product updates", desc: "New features and changelog notifications", defaultOn: true },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-sm font-medium text-text-primary">{item.label}</div>
                  <div className="text-xs text-text-dim">{item.desc}</div>
                </div>
                <div className="relative">
                  <input type="checkbox" defaultChecked={item.defaultOn} className="peer sr-only" />
                  <div className="w-10 h-5 bg-border rounded-full peer-checked:bg-green/30 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-text-dim rounded-full peer-checked:translate-x-5 peer-checked:bg-green transition-all" />
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-bg-surface border border-red/20 rounded-xl p-6">
          <h2 className="text-xs font-semibold text-red uppercase tracking-wider mb-5">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-primary">Delete account</div>
              <div className="text-xs text-text-dim">Permanently remove your account and all data. This cannot be undone.</div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-red bg-red/10 border border-red/20 rounded-lg hover:bg-red/20 transition-colors">
              Delete Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Providers>
      <SettingsContent />
    </Providers>
  );
}
