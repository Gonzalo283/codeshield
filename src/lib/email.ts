// Transactional email service — provider-agnostic.
// Uses Resend if RESEND_API_KEY is configured, otherwise logs to console (dev-safe no-op).
//
// To activate in production:
//   1. Sign up at https://resend.com
//   2. Verify your domain (or use resend.dev for testing)
//   3. Set RESEND_API_KEY and EMAIL_FROM in .env.local

import { log } from "./logger";

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  const from = process.env.EMAIL_FROM || "CodeShield <noreply@codeshield.sh>";
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    log.info("[email:noop] RESEND_API_KEY not configured — email not sent", {
      to: payload.to,
      subject: payload.subject,
    });
    return { ok: true, id: "noop" };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      log.error("Email send failed", { status: res.status, error: err });
      return { ok: false, error: err };
    }

    const data = (await res.json()) as { id?: string };
    log.info("Email sent", { to: payload.to, subject: payload.subject, id: data.id });
    return { ok: true, id: data.id };
  } catch (err) {
    log.error("Email exception", err as Error);
    return { ok: false, error: String(err) };
  }
}

// ── Templates ──
// Keep simple, inline-styled HTML. Use a real template engine later if needed.

function wrap(content: string): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#0a0a0a;line-height:1.5">
<div style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:20px;font-weight:700;color:#22c55e;margin-bottom:24px">CodeShield.sh</div>
${content}
<div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e5e5;font-size:12px;color:#666">
  CodeShield.sh — AI-powered code security scanning<br>
  <a href="https://codeshield.sh" style="color:#22c55e">codeshield.sh</a> · <a href="https://codeshield.sh/account" style="color:#666">Manage account</a>
</div>
</body></html>`;
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to CodeShield",
    html: wrap(`
      <h1 style="font-size:24px;margin:0 0 16px">Welcome, ${escape(name)}</h1>
      <p>You're all set. Start scanning your first repo from the dashboard.</p>
      <p><a href="https://codeshield.sh/dashboard" style="display:inline-block;background:#22c55e;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Open Dashboard</a></p>
      <p>Questions? Just reply to this email.</p>
    `),
    text: `Welcome to CodeShield, ${name}. Open your dashboard: https://codeshield.sh/dashboard`,
  }),

  subscriptionActivated: (planId: string) => ({
    subject: `Your ${planId} plan is active`,
    html: wrap(`
      <h1 style="font-size:24px;margin:0 0 16px">Plan activated: ${escape(planId)}</h1>
      <p>Your subscription is live. You now have access to all ${escape(planId)} features.</p>
      <p><a href="https://codeshield.sh/dashboard" style="display:inline-block;background:#22c55e;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Go to Dashboard</a></p>
      <p>Manage billing anytime at <a href="https://codeshield.sh/account">codeshield.sh/account</a>.</p>
    `),
    text: `Your ${planId} plan is active. Dashboard: https://codeshield.sh/dashboard`,
  }),

  paymentFailed: (invoiceUrl: string | null) => ({
    subject: "Payment failed — action required",
    html: wrap(`
      <h1 style="font-size:24px;margin:0 0 16px;color:#dc2626">Payment failed</h1>
      <p>We couldn't process your latest payment. Your CodeShield subscription will be paused if we can't collect soon.</p>
      ${invoiceUrl ? `<p><a href="${invoiceUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Pay invoice</a></p>` : ""}
      <p>Or update your payment method at <a href="https://codeshield.sh/account">codeshield.sh/account</a>.</p>
    `),
    text: `Payment failed. Update your payment method at https://codeshield.sh/account`,
  }),

  usageWarning: (used: number, limit: number) => ({
    subject: "You're approaching your scan limit",
    html: wrap(`
      <h1 style="font-size:24px;margin:0 0 16px">Heads up — ${used}/${limit} scans used</h1>
      <p>You've used ${used} of ${limit} monthly scans. Consider upgrading to avoid interruption.</p>
      <p><a href="https://codeshield.sh/pricing" style="display:inline-block;background:#22c55e;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View plans</a></p>
    `),
    text: `You've used ${used}/${limit} scans. Upgrade: https://codeshield.sh/pricing`,
  }),

  scanCriticalFound: (repo: string, count: number) => ({
    subject: `[CodeShield] ${count} critical finding${count > 1 ? "s" : ""} in ${repo}`,
    html: wrap(`
      <h1 style="font-size:24px;margin:0 0 16px;color:#dc2626">${count} critical finding${count > 1 ? "s" : ""}</h1>
      <p>A scan of <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px">${escape(repo)}</code> found ${count} critical security issue${count > 1 ? "s" : ""}.</p>
      <p><a href="https://codeshield.sh/dashboard" style="display:inline-block;background:#22c55e;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View report</a></p>
    `),
    text: `${count} critical findings in ${repo}. View: https://codeshield.sh/dashboard`,
  }),
};

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
