// Theme toggle in the masthead of every page: a moon (light) or sun (dark) icon, a "Dark mode" switch. By default the site
// follows the OS setting (prefers-color-scheme) and the toggle shows it. Flipping the toggle
// away from the OS setting keeps the pick in localStorage ("theme"); flipping it back clears
// it, so the site follows the OS again. The inline script in each page's <head> applies a
// stored pick before the first paint; this file wires the toggle and keeps open tabs in step.
(function () {
  var KEY = "theme";
  var root = document.documentElement;
  var osDark = window.matchMedia("(prefers-color-scheme: dark)");
  var memo = null; // the pick, when localStorage is not available

  function stored() {
    try {
      var t = localStorage.getItem(KEY);
      return t === "light" || t === "dark" ? t : null;
    } catch (e) {
      return memo;
    }
  }

  function system() {
    return osDark.matches ? "dark" : "light";
  }

  function apply() {
    var pick = stored();
    if (pick) root.setAttribute("data-theme", pick);
    else root.removeAttribute("data-theme");
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.content = pick || "light dark";
    var dark = (pick || system()) === "dark";
    document.querySelectorAll(".theme-switch").forEach(function (b) {
      b.setAttribute("aria-checked", String(dark));
      b.title = dark ? "Switch to light mode" : "Switch to dark mode";
    });
  }

  function toggle() {
    var next = (stored() || system()) === "dark" ? "light" : "dark";
    memo = next === system() ? null : next;
    try {
      if (memo) localStorage.setItem(KEY, memo);
      else localStorage.removeItem(KEY);
    } catch (e) {}
    apply();
  }

  document.querySelectorAll(".theme-switch").forEach(function (b) {
    b.addEventListener("click", toggle);
  });
  window.addEventListener("storage", function (e) {
    if (e.key === KEY || e.key === null) apply();
  });
  if (osDark.addEventListener) osDark.addEventListener("change", apply);
  else if (osDark.addListener) osDark.addListener(apply);
  apply();
})();
