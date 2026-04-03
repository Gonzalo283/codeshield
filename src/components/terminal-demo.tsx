"use client";

import { useEffect, useState } from "react";

const SCAN_LINES = [
  { text: "$ codeshield scan --repo github.com/acme/api", type: "command" as const, delay: 0 },
  { text: "", type: "blank" as const, delay: 600 },
  { text: "Connecting to GitHub...", type: "info" as const, delay: 800 },
  { text: "Fetching 847 files from main branch", type: "info" as const, delay: 1400 },
  { text: "Scanning for vulnerabilities...", type: "info" as const, delay: 2000 },
  { text: "", type: "blank" as const, delay: 2800 },
  { text: "CRITICAL  Hardcoded Stripe key in src/payments/config.ts:23", type: "critical" as const, delay: 3200 },
  { text: "CRITICAL  SQL injection via template literal in src/db/users.ts:87", type: "critical" as const, delay: 3600 },
  { text: "CRITICAL  RSA-2048 key generation in src/auth/crypto.ts:12", type: "critical" as const, delay: 4000 },
  { text: "HIGH      ECDSA signing in src/auth/jwt.ts:34 (quantum-vulnerable)", type: "high" as const, delay: 4400 },
  { text: "HIGH      innerHTML assignment in src/components/Preview.tsx:56", type: "high" as const, delay: 4800 },
  { text: "MEDIUM    SHA-1 hash in src/utils/checksum.ts:8", type: "medium" as const, delay: 5200 },
  { text: "MEDIUM    CORS wildcard in src/middleware/cors.ts:3", type: "medium" as const, delay: 5600 },
  { text: "", type: "blank" as const, delay: 6000 },
  { text: "Scan complete: 847 files scanned in 4.2s", type: "info" as const, delay: 6200 },
  { text: "Found 3 critical · 2 high · 2 medium vulnerabilities", type: "summary" as const, delay: 6600 },
  { text: "", type: "blank" as const, delay: 7000 },
  { text: "Run codeshield fix --auto to generate AI fixes", type: "hint" as const, delay: 7200 },
];

export function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    SCAN_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), line.delay)
      );
    });

    // Loop the animation
    const loopTimer = setTimeout(() => {
      setVisibleLines(0);
      // Restart after brief pause
      setTimeout(() => {
        SCAN_LINES.forEach((line, i) => {
          timers.push(
            setTimeout(() => setVisibleLines(i + 1), line.delay)
          );
        });
      }, 800);
    }, 10000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(loopTimer);
    };
  }, []);

  return (
    <div className="bg-bg-primary border border-border rounded-xl overflow-hidden shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-bg-surface border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red/60" />
          <div className="w-3 h-3 rounded-full bg-orange/60" />
          <div className="w-3 h-3 rounded-full bg-green/60" />
        </div>
        <span className="text-xs text-text-dim font-mono ml-2">codeshield — terminal</span>
      </div>
      {/* Terminal body */}
      <div className="p-4 font-mono text-[12px] sm:text-[13px] leading-relaxed min-h-[320px] overflow-hidden">
        {SCAN_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className={`${line.type === "blank" ? "h-4" : ""}`}>
            {line.type === "command" && (
              <span className="text-text-primary">{line.text}</span>
            )}
            {line.type === "info" && (
              <span className="text-text-dim">{line.text}</span>
            )}
            {line.type === "critical" && (
              <span>
                <span className="text-red font-semibold">CRITICAL</span>
                <span className="text-text-secondary">{line.text.replace("CRITICAL", "")}</span>
              </span>
            )}
            {line.type === "high" && (
              <span>
                <span className="text-orange font-semibold">HIGH     </span>
                <span className="text-text-secondary">{line.text.replace(/HIGH\s*/, "")}</span>
              </span>
            )}
            {line.type === "medium" && (
              <span>
                <span className="text-blue font-semibold">MEDIUM   </span>
                <span className="text-text-secondary">{line.text.replace(/MEDIUM\s*/, "")}</span>
              </span>
            )}
            {line.type === "summary" && (
              <span className="text-text-primary font-semibold">{line.text}</span>
            )}
            {line.type === "hint" && (
              <span className="text-green">{line.text}</span>
            )}
          </div>
        ))}
        {visibleLines < SCAN_LINES.length && visibleLines > 0 && (
          <span className="cursor-blink" />
        )}
      </div>
    </div>
  );
}
