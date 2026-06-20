/**
 * =============================================================================
 * TRAFFIC ROUTER — Single-file conditional redirect script
 * =============================================================================
 *
 * BEHAVIOR
 *   • Facebook in-app browser  → page loads normally (no redirect)
 *   • All other traffic        → weighted random redirect to a destination URL
 *
 * INSTALLATION (Hostinger / any static host)
 * ---------------------------------------------------------------------------
 * Option A — External file (recommended)
 *   1. Upload this file to your site root (e.g. /public_html/traffic-router.js)
 *   2. Add this line inside <head>, BEFORE other scripts:
 *
 *      <script src="/traffic-router.js"></script>
 *
 * Option B — Inline
 *   1. Copy everything below the CONFIG block into a <script> tag in <head>
 *
 * IMPORTANT
 *   • Place the script as early as possible in <head> for instant redirect.
 *   • Do NOT add defer or async to the script tag.
 *   • Edit only the CONFIG section below.
 *
 * =============================================================================
 */

/* eslint-disable no-unused-vars */

(function trafficRouter() {
  "use strict";

  // ===========================================================================
  // CONFIG — Edit these values only
  // ===========================================================================

  var CONFIG = {
    // Set to true to log decisions in the browser console (disable in production)
    debug: false,

    // If true, also treat facebook.com / fb.com referrers on mobile as in-app traffic
    detectReferrer: true,

    // Optional: redirect desktop visitors (width > breakpoint) before random pool
    // Set enableDesktopRedirect: false to skip this and use random pool only
    enableDesktopRedirect: false,
    desktopBreakpoint: 1024,
    desktopRedirectUrl: "https://www.facebook.com",

    // Weighted random destinations for non-Facebook traffic
    // Weights are relative (they do not need to add up to 100)
    destinations: [
      { url: "https://open.spotify.com", weight: 40 },
      { url: "https://www.amazon.com", weight: 30 },
      { url: "https://www.google.com", weight: 20 },
      { url: "https://www.facebook.com", weight: 10 },
    ],

    // Pages where the router should never run (paths or full URLs)
    // Example: ["/admin", "/checkout"]
    skipPaths: [],

    // If true, appends ?from=fbrouter to redirect URLs for basic tracking
    appendSourceParam: false,
    sourceParamName: "from",
    sourceParamValue: "fbrouter",
  };

  // ===========================================================================
  // IMPLEMENTATION — No need to edit below unless customizing behavior
  // ===========================================================================

  var FB_UA_PATTERNS = [
    /\bFBAN\b/i,
    /\bFBAV\b/i,
    /\bFBIOS\b/i,
    /\bFB_IAB\b/i,
    /\bFB4A\b/i,
    /\bFBBV\b/i,
    /\bFBDV\b/i,
    /\bFBMD\b/i,
    /\bFBSV\b/i,
  ];

  var REFERRER_PATTERNS = /facebook\.com|fb\.com|fb\.me|m\.facebook\.com/i;

  function log() {
    if (!CONFIG.debug) return;
    var args = ["[TrafficRouter]"].concat([].slice.call(arguments));
    console.log.apply(console, args);
  }

  function getPathname() {
    try {
      return window.location.pathname || "/";
    } catch (e) {
      return "/";
    }
  }

  function shouldSkipPath() {
    var path = getPathname();
    for (var i = 0; i < CONFIG.skipPaths.length; i++) {
      var skip = CONFIG.skipPaths[i];
      if (!skip) continue;
      if (path.indexOf(skip) === 0 || window.location.href.indexOf(skip) !== -1) {
        return true;
      }
    }
    return false;
  }

  function isFacebookInAppBrowser() {
    var ua = navigator.userAgent || "";
    var referrer = document.referrer || "";

    for (var i = 0; i < FB_UA_PATTERNS.length; i++) {
      if (FB_UA_PATTERNS[i].test(ua)) {
        log("Facebook in-app detected via User-Agent");
        return true;
      }
    }

    if (CONFIG.detectReferrer && REFERRER_PATTERNS.test(referrer) && /mobile/i.test(ua)) {
      log("Facebook in-app inferred via referrer + mobile UA");
      return true;
    }

    return false;
  }

  function pickWeightedDestination(list) {
    var items = [];
    var total = 0;

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (!item || !item.url) continue;
      var weight = Number(item.weight);
      if (!weight || weight <= 0) continue;
      items.push({ url: item.url, weight: weight });
      total += weight;
    }

    if (!items.length || total <= 0) {
      return null;
    }

    var random = Math.random() * total;
    for (var j = 0; j < items.length; j++) {
      random -= items[j].weight;
      if (random <= 0) {
        return items[j].url;
      }
    }

    return items[items.length - 1].url;
  }

  function buildRedirectUrl(baseUrl) {
    if (!CONFIG.appendSourceParam) {
      return baseUrl;
    }

    try {
      var url = new URL(baseUrl, window.location.href);
      url.searchParams.set(CONFIG.sourceParamName, CONFIG.sourceParamValue);
      return url.toString();
    } catch (e) {
      var joiner = baseUrl.indexOf("?") === -1 ? "?" : "&";
      return (
        baseUrl +
        joiner +
        encodeURIComponent(CONFIG.sourceParamName) +
        "=" +
        encodeURIComponent(CONFIG.sourceParamValue)
      );
    }
  }

  function redirectTo(url, reason) {
    log("Redirecting:", reason, "→", url);
    window.location.replace(buildRedirectUrl(url));
  }

  function run() {
    if (shouldSkipPath()) {
      log("Skipped — path excluded");
      return;
    }

    if (isFacebookInAppBrowser()) {
      log("Allowing normal page load for Facebook in-app traffic");
      return;
    }

    if (CONFIG.enableDesktopRedirect && window.innerWidth > CONFIG.desktopBreakpoint) {
      redirectTo(CONFIG.desktopRedirectUrl, "desktop breakpoint");
      return;
    }

    var destination = pickWeightedDestination(CONFIG.destinations);
    if (destination) {
      redirectTo(destination, "weighted random pool");
      return;
    }

    log("No valid destinations configured — page loads normally");
  }

  // Run immediately (script should be in <head> before body renders)
  run();
})();
