const BLOCKLIST = new Set([
  // Google Ads, Analytics, Tracking & Fonts Telemetry
  "doubleclick.net",
  "googlesyndication.com",
  "googleadservices.com",
  "adservice.google.com",
  "pagead2.googlesyndication.com",
  "google-analytics.com",
  "ssl.google-analytics.com",
  "tagmanager.google.com",
  "admob.com",
  "analytics.google.com",
  "clickserve.dartsearch.net",
  "stats.g.doubleclick.net",
  "ad.doubleclick.net",
  "tpc.googlesyndication.com",
  "partner.googleadservices.com",
  "g.doubleclick.net",
  "pagead.l.google.com",
  "afs.googlesyndication.com",
  "adservices.google.com",
  "googleadapis.com",
  "googletagmanager.com",
  "googletagservices.com",
  "google-analytics.co.uk",
  
  // Meta (Facebook / Instagram) Trackers, Pixel & CDN SDKs
  "connect.facebook.net",
  "pixel.facebook.com",
  "an.facebook.com",
  "graph.facebook.com",
  "edge-mqtt.facebook.com",
  "pixel.instagram.com",
  "scontent.xx.fbcdn.net",
  "b-graph.facebook.com",
  "www.facebook.com/tr/",
  "fbcdn.net",
  "messenger.com",
  "internshub.facebook.com",
  
  // Twitter / X Ads & Analytics
  "ads.twitter.com",
  "analytics.twitter.com",
  "t.co",
  "static.ads-twitter.com",
  "syndication.twitter.com",
  "api.twitter.com/i/ads",
  "ads-api.twitter.com",
  
  // Amazon Ads, Tracking & Retail Telemetry
  "amazon-adsystem.com",
  "assoc-amazon.com",
  "completion.amazon.com",
  "mads.amazon.com",
  "fls-na.amazon.com",
  "A.amazon-adsystem.com",
  "images-na.ssl-images-amazon.com/images/G/01/browser-scripts/",
  "unagi-na.amazon.com",
  
  // Microsoft / Bing Ads, Telemetry & Clarity
  "ads.msn.com",
  "bat.bing.com",
  "clarity.ms",
  "rad.msn.com",
  "telemetry.microsoft.com",
  "vortex.data.microsoft.com",
  "ceipmsn.msn.com",
  "s.gateway.messenger.live.com",
  "diagnostics.support.microsoft.com",
  "fe2.update.microsoft.com.akadns.net",
  "settings-win.data.microsoft.com",
  
  // Apple Ads, Tracking & Analytics
  "iadsdk.apple.com",
  "ads.apple.com",
  "metrics.apple.com",
  "www.iadsdk.apple.com",
  "books-analytics.apple.com",
  "api-adservices.apple.com",
  "triton.apple.com",
  
  // TikTok Tracking, Ads & ByteDance SDKs
  "analytics.tiktok.com",
  "ads.tiktok.com",
  "lf16-effectflow.tiktokv.com",
  "ib.adnxs.com",
  "log.byteoversea.com",
  "analytics.byteoversea.com",
  "isnssdk.com",
  "tiktokv.com",
  "byteoversea.com",
  
  // Major Ad Exchanges, SSPs, DSPs & Ad Networks
  "adnxs.com",
  "criteo.com",
  "pubmatic.com",
  "rubiconproject.com",
  "openx.net",
  "taboola.com",
  "outbrain.com",
  "quantserve.com",
  "scorecardresearch.com",
  "casalemedia.com",
  "sharethis.com",
  "addthis.com",
  "bluekai.com",
  "exelator.com",
  "krxd.net",
  "imrworldwide.com",
  "mookie1.com",
  "adsrvr.org",
  "lijit.com",
  "contextweb.com",
  "sovrn.com",
  "spotxchange.com",
  "teads.tv",
  "unrulymedia.com",
  "yieldmo.com",
  "adform.net",
  "smartadserver.com",
  "gumgum.com",
  "tribalfusion.com",
  "bidsrvr.com",
  "lijit.co",
  "ads.yahoo.com",
  "adserver.yahoo.com",
  "gemini.yahoo.com",
  "yads.yahoo.co.jp",
  "ads.mopub.com",
  "unityads.unity3d.com",
  "ironsrc.com",
  "applovin.com",
  "inmobi.com",
  "mopub.com",
  "smaato.com",
  "verizonmedia.com",
  "adcolony.com",
  
  // Analytics, Session Replay, Error Tracking & Telemetry
  "hotjar.com",
  "mixpanel.com",
  "segment.io",
  "amplitude.com",
  "fullstory.com",
  "inspectlet.com",
  "loggly.com",
  "newrelic.com",
  "sentry.io",
  "bugsnag.com",
  "optimizely.com",
  "vwo.com",
  "crazyegg.com",
  "quantcast.com",
  "mouseflow.com",
  "luckyorange.com",
  "heap.io",
  "kissmetrics.com",
  "heapanalytics.com",
  "branch.io",
  "appsflyer.com",
  "adjust.com",
  "datadoghq-browser-agent.com",
  "raygun.io",
  "rollbar.com",
  "userpilot.com",
  "pendo.io",
  "amplitude.io",
  "mixpanel.io",
  "logrocket.com",
  "stats.wp.com",
  "ping.chartbeat.net",
  "b.scorecardresearch.com",
  "datadoghq.com",
  "nr-data.net",
  "browser-intake-datadoghq.com",
  "tealiumiq.com",
  "segment.com",
  
  // Popular Ad/Popup Networks & Adult/Secondary Ad Networks
  "propellerads.com",
  "popads.net",
  "adcash.com",
  "revcontent.com",
  "ero-advertising.com",
  "exoclick.com",
  "juicyads.com",
  "trafficjunky.net",
  "zeropark.com",
  "clickadu.com",
  "hilltopads.com",
  "syndication.exoclick.com",
  "tsyndicate.com",
  "adsterra.com",
  "magsrv.com",
  "ero-video.com",
  "trafficforce.com",
  "plugrush.com",
  "clickdealer.com",
  "ero-advertising.net",
  "adserver.juicyads.com",
  "bongacams.com",
  "trafficfactory.biz",
  "traffichaus.com",
  "pornhub.com/ads",
  "evadav.com",
  "clickaine.com"
]);

// Mapa opcional de hashes esperados para arquivos críticos enviados via query (ex: ?url=...&hash=SHA256)
const ALLOWED_HASHES = new Map([
  // "https://exemplo.com/script.js", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
]);

// Função utilitária para calcular o hash SHA-256 de um ArrayBuffer
async function computeSHA256(buffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "CONNECT") {
      return new Response("CONNECT method blocked by NodeProxy security policy.", { 
        status: 405 
      });
    }

    try {
      const targetParam = url.searchParams.get("url");
      const expectedHash = url.searchParams.get("hash"); // Hash opcional enviado pelo cliente para validação
      const targetUrl = targetParam ? new URL(targetParam) : url;

      if (env.BLOCK_INSECURE_HTTP === "true" && targetUrl.protocol !== "https:") {
        return new Response("Insecure HTTP requests are blocked by NodeProxy policy. Use HTTPS.", {
          status: 426,
          headers: { "Content-Type": "text/plain" }
        });
      }

      if (env.BLOCK_ADS === "true" && BLOCKLIST.has(targetUrl.hostname)) {
        return new Response("Blocked by NodeProxy AdFilter", {
          status: 403,
          headers: { "Content-Type": "text/plain" }
        });
      }

      const modifiedRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "follow"
      });

      const response = await fetch(modifiedRequest);

      // Validação opcional de integridade por Hash (Integrity Check / Revirado protection)
      if (expectedHash) {
        const clonedResponse = response.clone();
        const responseBody = await clonedResponse.arrayBuffer();
        const actualHash = await computeSHA256(responseBody);

        if (actualHash.toLowerCase() !== expectedHash.toLowerCase()) {
          console.warn(`[NodeProxy Security] Falha de integridade para ${targetUrl.href}. Hash esperado: ${expectedHash}, obtido: ${actualHash}`);
          return new Response("Blocked by NodeProxy: Integrity Hash Mismatch (Corrupted or Tampered File)", {
            status: 422,
            headers: { "Content-Type": "text/plain" }
          });
        }
      }

      return response;

    } catch (err) {
      return new Response(`[NodeProxy Edge Error]: ${err.message}`, { status: 502 });
    }
  }
};
