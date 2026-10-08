// Real-user monitoring via Grafana Cloud Frontend Observability (Faro).
// Collects page views, Core Web Vitals and JS errors. The collector URL is
// public by design: Grafana only accepts it from the allowed origins.
// Tracing is left out because a static site has no backend to trace.
(function () {
  var sdk = document.createElement("script");
  // Pinned so a new SDK release can't change what runs on the site unannounced.
  sdk.src = "https://unpkg.com/@grafana/faro-web-sdk@2.12.1/dist/bundle/faro-web-sdk.iife.js";
  sdk.async = true;
  sdk.onload = function () {
    window.GrafanaFaroWebSdk.initializeFaro({
      url: "https://faro-collector-prod-us-west-0.grafana.net/collect/ffdabc71ad614712d9e4cfc0ffd25aae",
      app: { name: "bushuyeu.com", version: "1.0.0", environment: "production" },
    });
  };
  document.head.appendChild(sdk);
})();
