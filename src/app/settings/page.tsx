"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Providers from "../providers";
import { Nav } from "@/components/nav";

interface ApiKeyEntry {
  id: string;
  name: string;
  display: string;
  last4: string;
  plan: string;
  scansUsed: number;
  resetAt: string;
  createdAt: string;
  lastUsedAt: string;
}

interface UsageInfo {
  authenticated: boolean;
  scansUsed: number;
  scansLimit: number;
  remaining: number;
  canScan: boolean;
  reposScanned: number;
  planId: string;
  periodEnd?: string;
}

function SettingsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [keysRes, usageRes] = await Promise.all([
        fetch("/api/keys"),
        fetch("/api/usage"),
      ]);
      if (keysRes.ok) {
        const data = await keysRes.json();
        setKeys(data.keys || []);
      }
      if (usageRes.ok) {
        setUsage(await usageRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status, load]);

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

  const handleCreateKey = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/keys", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        await load();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this key? Anything using it will stop working immediately.")) return;
    const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  };

  const handleCopyKey = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const planLabel = (usage?.planId || "free").replace(/^\w/, (c) => c.toUpperCase());
  const isFree = (usage?.planId || "free") === "free";

  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav variant="app" user={session?.user} onSignOut={() => signOut({ callbackUrl: "/" })} />

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-8 md:py-12">
        <h1 className="text-2xl font-bold text-text-primary mb-8">Settings</h1>

        {/* Profile */}
        <section className="bg-bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-5">Profile</h2>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-14 h-14 rounded-full border-2 border-border" />
            )}
            <div>
              <div className="font-semibold text-text-primary text-lg">{session?.user?.name}</div>
              <div className="text-sm text-text-secondary">{session?.user?.email}</div>
            </div>
          </div>
        </section>

        {/* Plan & Usage */}
        <section className="bg-bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-5">Plan</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">{planLabel} Plan</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-elevated text-text-dim border border-border">CURRENT</span>
              </div>
              {usage && (
                <p className="text-sm text-text-secondary mt-1">
                  {usage.scansLimit === -1
                    ? `Unlimited scans · ${usage.scansUsed} used this month`
                    : `${usage.scansUsed} / ${usage.scansLimit} scans this month · ${usage.reposScanned} repo${usage.reposScanned === 1 ? "" : "s"}`}
                </p>
              )}
            </div>
            {isFree ? (
              <a href="/pricing" className="btn-primary text-sm px-4 py-2">Upgrade</a>
            ) : (
              <a href="/account" className="btn-secondary text-sm px-4 py-2">Manage billing</a>
            )}
          </div>
          {usage && usage.scansLimit !== -1 && (
            <div className="w-full bg-bg-elevated rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-green transition-all"
                style={{ width: `${Math.min(100, (usage.scansUsed / usage.scansLimit) * 100)}%` }}
              />
            </div>
          )}
        </section>

        {/* API Keys */}
        <section className="bg-bg-surface border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wider">API Keys</h2>
            <button
              onClick={handleCreateKey}
              disabled={creating}
              className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
            >
              {creating ? "Creating…" : "+ New key"}
            </button>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Use these keys to authenticate with the CodeShield API, GitHub Action, and CLI.
          </p>

          {newKey && (
            <div className="mb-4 p-4 border border-green/30 bg-green/5 rounded-lg">
              <div className="text-xs font-semibold text-green mb-2">SAVE THIS KEY — IT WON&apos;T BE SHOWN AGAIN</div>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 font-mono text-xs text-text-primary break-all">
                  {newKey}
                </code>
                <button onClick={() => handleCopyKey(newKey)} className="btn-secondary text-xs px-3 py-2 whitespace-nowrap">
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <button onClick={() => setNewKey(null)} className="text-xs text-text-dim mt-3 hover:text-text-secondary">
                I&apos;ve saved it — dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-sm text-text-dim">Loading…</div>
          ) : keys.length === 0 ? (
            <div className="text-sm text-text-dim py-4 text-center border border-dashed border-border rounded-lg">
              No API keys yet. Create one above to get started.
            </div>
          ) : (
            <ul className="space-y-2">
              {keys.map((k) => (
                <li key={k.id} className="flex items-center justify-between bg-bg-primary border border-border rounded-lg px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-text-primary truncate">{k.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-elevated text-text-dim border border-border">
                        {k.plan.toUpperCase()}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-text-dim">{k.display}</div>
                    <div className="text-[11px] text-text-dim mt-1">
                      Created {new Date(k.createdAt).toLocaleDateString()} · Last used {new Date(k.lastUsedAt).toLocaleDateString()} · {k.scansUsed} scans
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(k.id)}
                    className="text-xs text-red hover:bg-red/10 px-3 py-1.5 rounded-lg ml-3"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Notifications (TODO: wire to DB when user preferences model added) */}
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
