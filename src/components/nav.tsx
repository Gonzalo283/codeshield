"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavProps {
  variant?: "marketing" | "app";
  user?: { name?: string | null; image?: string | null } | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export function Nav({ variant = "marketing", user, onSignIn, onSignOut }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const marketingLinks = [
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/docs", label: "Docs" },
  ];

  const appLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/pricing", label: "Upgrade" },
    { href: "/settings", label: "Settings" },
  ];

  const links = variant === "app" ? appLinks : marketingLinks;

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-bg-primary/90 border-b border-border shadow-lg shadow-black/10"
            : "backdrop-blur-md bg-bg-primary/70 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <Link href={variant === "app" ? "/dashboard" : "/"} className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-[10px] bg-green/10 border border-green/20 flex items-center justify-center group-hover:bg-green/15 transition-colors">
              <img src="/logo.svg" alt="" width={20} height={20} />
            </div>
            <span className="font-bold text-[15px] text-text-primary font-mono tracking-tight">
              Code<span className="text-green">Shield</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-text-primary bg-bg-elevated"
                    : "text-text-dim hover:text-text-secondary hover:bg-bg-surface"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {variant === "app" && user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-[13px] text-text-secondary">{user.name}</span>
                <button
                  onClick={onSignOut}
                  className="text-[13px] text-text-dim hover:text-text-secondary transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : variant === "marketing" ? (
              <button
                onClick={onSignIn}
                className="hidden md:flex btn-primary text-[13px] px-4 py-2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Get Started Free
              </button>
            ) : null}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-text-dim hover:text-text-secondary hover:bg-bg-surface transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-bg-surface/95 backdrop-blur-xl animate-[reveal_0.2s_ease-out]">
            <div className="px-5 py-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? "text-text-primary bg-bg-elevated"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border mt-3">
                {variant === "app" && user ? (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-text-secondary">{user.name}</span>
                    <button onClick={onSignOut} className="text-sm text-text-dim hover:text-red transition-colors">
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onSignIn}
                    className="btn-primary w-full text-sm py-3"
                  >
                    Get Started Free
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
