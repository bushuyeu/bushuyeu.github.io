// Theme switch in the masthead of every page: System (the default, follows the OS),
// Light or Dark. A Light or Dark pick is kept in localStorage ("theme"); System clears it.
// The inline script in each page's <head> applies a stored pick before the first paint,
// so there is no flash; this file wires the buttons and keeps open tabs in step.
(function () {
  var KEY = "theme";
  var root = document.documentElement;

  function stored() {
    try {
      var t = localStorage.getItem(KEY);
      return t === "light" || t === "dark" ? t : "system";
    } catch (e) {
      return "system";
    }
  }

  function apply(theme) {
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.content = theme === "system" ? "light dark" : theme;
    document.querySelectorAll(".theme-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.value === theme));
    });
  }

  function choose(theme) {
    try {
      if (theme === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, theme);
    } catch (e) {}
    apply(theme);
  }

  document.querySelectorAll(".theme-switch button").forEach(function (b) {
    b.addEventListener("click", function () { choose(b.value); });
  });
  window.addEventListener("storage", function (e) {
    if (e.key === KEY || e.key === null) apply(stored());
  });
  apply(stored());
})();
