"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Nav } from "@/components/nav";
import Providers from "../providers";

function AccountContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);
  const checkoutSuccess = searchParams.get("checkout") === "success";

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to open billing portal");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav variant="app" user={session?.user} onSignOut={() => signOut({ callbackUrl: "/" })} />

      <div className="max-w-3xl mx-auto px-8 py-8">
        {checkoutSuccess && (
          <div className="mb-8 p-4 bg-green/10 border border-green/30 rounded-xl flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="text-sm text-green font-medium">
              Subscription activated successfully! Welcome to CodeShield Pro.
            </span>
          </div>
        )}

        <h1 className="text-2xl font-bold text-text-primary mb-8">Account</h1>

        {/* Profile */}
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-4">
            Profile
          </h2>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt=""
                className="w-12 h-12 rounded-full border border-border"
              />
            )}
            <div>
              <div className="font-semibold text-text-primary">
                {session?.user?.name}
              </div>
              <div className="text-sm text-text-secondary">
                {session?.user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-4">
            Subscription
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-text-primary">Free Plan</div>
              <div className="text-sm text-text-secondary mt-1">
                3 scans per month &middot; Basic detection
              </div>
            </div>
            <a
              href="/pricing"
              className="px-4 py-2 bg-green/10 text-green border border-green/30 rounded-lg text-sm font-medium hover:bg-green/20 transition-colors"
            >
              Upgrade
            </a>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-4">
            Billing
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Manage your subscription, payment methods, and invoices through the Stripe customer portal.
          </p>
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="px-4 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-border-light transition-colors disabled:opacity-50"
          >
            {portalLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Opening...
              </span>
            ) : (
              "Manage Billing"
            )}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-bg-card border border-red/20 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-red uppercase tracking-wider mb-4">
            Danger Zone
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Sign out from your CodeShield account. Your scan history and settings will be preserved.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 bg-red/10 text-red border border-red/30 rounded-lg text-sm font-medium hover:bg-red/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Providers>
      <Suspense>
        <AccountContent />
      </Suspense>
    </Providers>
  );
}
