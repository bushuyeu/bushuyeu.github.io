// Real-user monitoring via Grafana Cloud Frontend Observability (Faro).
// Collects page views, Core Web Vitals and JS errors. The collector URL is
// public by design: Grafana only accepts it from the allowed origins.
// Tracing is left out because a static site has no backend to trace.
(function () {
  // Events raised before the SDK finishes loading wait here instead of being lost.
  var queued = [];

  function push(name, attributes) {
    // Faro drops an event identical to the one before it, but two clicks on the
    // same link are two opens.
    if (window.faro && window.faro.api) window.faro.api.pushEvent(name, attributes, undefined, { skipDedupe: true });
    else queued.push([name, attributes]);
  }

  // The owner's visits and automated test runs would skew real-visitor numbers.
  // They go to a separate "internal" environment instead of being dropped, so
  // they stay visible but can be filtered out. Opening any page with ?internal
  // marks this browser (?internal=off clears it). localStorage can throw in
  // private windows, which then count as production.
  var internal = navigator.webdriver === true;
  try {
    var flag = new URLSearchParams(location.search).get("internal");
    if (flag === "off") localStorage.removeItem("faro-internal");
    else if (flag !== null) localStorage.setItem("faro-internal", "1");
    internal = internal || localStorage.getItem("faro-internal") === "1";
  } catch (e) {}

  var sdk = document.createElement("script");
  // Pinned so a new SDK release can't change what runs on the site unannounced.
  sdk.src = "https://unpkg.com/@grafana/faro-web-sdk@2.12.1/dist/bundle/faro-web-sdk.iife.js";
  sdk.async = true;
  sdk.onload = function () {
    window.GrafanaFaroWebSdk.initializeFaro({
      url: "https://faro-collector-prod-us-west-0.grafana.net/collect/ffdabc71ad614712d9e4cfc0ffd25aae",
      app: { name: "bushuyeu.com", version: "1.0.0", environment: internal ? "internal" : "production" },
    });
    queued.forEach(function (e) { push(e[0], e[1]); });
    queued = [];
  };
  document.head.appendChild(sdk);

  // PDFs and videos have no page of their own, so page views never count them.
  var FILE = /\.(pdf|mp4)$/i;

  function fileName(url) {
    return url.replace(location.origin + "/", "");
  }

  function onLinkClick(e) {
    var link = e.target.closest && e.target.closest("a[href]");
    if (!link || !FILE.test(link.pathname)) return;
    push("file_open", {
      file: fileName(link.href.split(/[?#]/)[0]),
      download: String(link.hasAttribute("download")),
    });
  }

  document.addEventListener("click", onLinkClick, true);
  // Middle-click "open in new tab" fires no click event. auxclick also fires on
  // right-click, which only opens the context menu, so keep the middle button only.
  document.addEventListener("auxclick", function (e) {
    if (e.button === 1) onLinkClick(e);
  }, true);

  // play fires again after every pause; one play per video per page view is
  // the number that matters.
  document.addEventListener("play", function (e) {
    var video = e.target;
    // data-no-track marks decorative autoplaying clips, which no visitor chose to play.
    if (video.tagName !== "VIDEO" || video.dataset.faroPlayed || video.hasAttribute("data-no-track")) return;
    video.dataset.faroPlayed = "1";
    push("video_play", { file: fileName(video.currentSrc) });
  }, true);
})();
