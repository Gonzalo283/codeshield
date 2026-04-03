"use client";

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Product analytics event tracking
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  // GA4
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as Record<string, unknown> & { gtag: (...args: unknown[]) => void }).gtag("event", eventName, properties);
  }

  // PostHog (if loaded)
  if (
    typeof window !== "undefined" &&
    "posthog" in window &&
    typeof (window as Record<string, unknown> & { posthog: { capture: (name: string, props?: Record<string, unknown>) => void } }).posthog?.capture === "function"
  ) {
    (window as Record<string, unknown> & { posthog: { capture: (name: string, props?: Record<string, unknown>) => void } }).posthog.capture(eventName, properties);
  }
}

// Standard events
export const events = {
  scanStarted: (repo: string) =>
    trackEvent("scan_started", { repo }),
  scanCompleted: (repo: string, vulnCount: number) =>
    trackEvent("scan_completed", { repo, vulnerability_count: vulnCount }),
  fixGenerated: (vulnType: string) =>
    trackEvent("fix_generated", { vulnerability_type: vulnType }),
  upgradeClicked: (plan: string, source: string) =>
    trackEvent("upgrade_clicked", { plan, source }),
  signupCompleted: () =>
    trackEvent("signup_completed"),
  blogRead: (slug: string) =>
    trackEvent("blog_read", { article: slug }),
};

export function PostHogAnalytics() {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) return null;

  return (
    <Script id="posthog-analytics" strategy="afterInteractive">
      {`
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('${posthogKey}', {api_host: 'https://app.posthog.com'});
      `}
    </Script>
  );
}
