// ── Enterprise Security Module ──
// Centralized security utilities for CodeShield.ai

import { NextRequest } from "next/server";

// ── Rate Limiter (per IP, sliding window) ──
const rateLimits = new Map<string, { tokens: number; lastRefill: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(ip: string, config: RateLimitConfig): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now - entry.lastRefill > config.windowMs) {
    rateLimits.set(ip, { tokens: config.maxRequests - 1, lastRefill: now });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (entry.tokens <= 0) {
    return { allowed: false, remaining: 0 };
  }

  entry.tokens--;
  return { allowed: true, remaining: entry.tokens };
}

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimits.entries()) {
    if (now - value.lastRefill > 600_000) {
      rateLimits.delete(key);
    }
  }
}, 600_000);

// ── IP Extraction ──
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ── Input Sanitization ──
export function sanitizeInput(input: string, maxLength: number = 500): string {
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, "") // Strip HTML tags
    .trim();
}

// ── CSRF Token ──
// For state-changing operations, verify Origin header matches
export function verifyCsrf(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin) return true; // Non-browser requests (API clients) don't send Origin

  const allowedOrigins = [
    `https://${host}`,
    "https://codeshield.sh",
    "https://codeshield-eight.vercel.app",
    "http://localhost:3000",
  ];

  return allowedOrigins.some((allowed) => origin === allowed);
}

// ── API Key Hashing ──
// Never store API keys in plain text. Use SHA-256 hash for comparison.
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Sensitive Data Masking ──
// For logs — never log full secrets
export function maskSecret(secret: string): string {
  if (secret.length <= 8) return "***";
  return secret.slice(0, 4) + "..." + secret.slice(-4);
}

// ── Request Logging (safe) ──
export function logRequest(request: NextRequest, action: string) {
  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;
  const method = request.method;
  // Never log tokens, cookies, or auth headers
  console.log(`[${new Date().toISOString()}] ${method} ${path} — ${action} — IP: ${ip}`);
}

// ── Security Headers for API responses ──
export function securityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
  };
}
