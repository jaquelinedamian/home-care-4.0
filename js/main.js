

(function () {
  "use strict";

  function normalizePath(path) {
    return String(path || "").replace(/\/$/, "");
  }

  function updateMobileActiveLinks() {
    const currentPath = normalizePath(window.location.pathname);

    document.querySelectorAll(".mobile-bottom-link, .hc-mobile-quick-nav a").forEach(function (link) {
      let linkPath = "";

      try {
        linkPath = normalizePath(new URL(link.href, window.location.origin).pathname);
      } catch (error) {
        return;
      }

      link.classList.toggle("is-active", linkPath === currentPath);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateMobileActiveLinks);
  } else {
    updateMobileActiveLinks();
  }

  document.addEventListener("hc:partials-loaded", updateMobileActiveLinks);
  document.addEventListener("hc:profile-changed", updateMobileActiveLinks);
})();
