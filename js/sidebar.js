

(function () {
  "use strict";

  const PROFILE_STORAGE_KEY = "homeCareActiveProfile";
  const DEFAULT_PROFILE = "idoso";

  const profileNames = {
    idoso: "Idoso",
    familiar: "Familiar",
    profissional: "Profissional",
    admin: "Admin"
  };

  let sidebarEventsBound = false;

  function userCanAccessAdmin() {
    return document.body && document.body.dataset.canAccessAdmin === "true";
  }

  function normalizeProfile(profile) {
    if (!profileNames[profile]) return DEFAULT_PROFILE;
    if (profile === "admin" && !userCanAccessAdmin()) return DEFAULT_PROFILE;
    return profile;
  }

  function getSidebar() {
    return document.querySelector("[data-hc-sidebar]");
  }

  function setSidebarProfile(profile) {
    const sidebar = getSidebar();
    if (!sidebar) return;

    const safeProfile = normalizeProfile(profile);

    sidebar.querySelectorAll("[data-hc-sidebar-profile]").forEach(function (button) {
      const isActive = button.dataset.hcSidebarProfile === safeProfile;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    sidebar.querySelectorAll("[data-hc-sidebar-menu]").forEach(function (menu) {
      const isActive = menu.dataset.hcSidebarMenu === safeProfile;
      menu.classList.toggle("is-active", isActive);
      menu.classList.toggle("d-none", !isActive);

      if (isActive) {
        menu.removeAttribute("hidden");
      } else {
        menu.setAttribute("hidden", "hidden");
      }
    });

    document.querySelectorAll("[data-current-profile-label], [data-hc-current-profile-label]").forEach(function (label) {
      label.textContent = profileNames[safeProfile];
    });

    document.body.dataset.activeProfile = safeProfile;
    localStorage.setItem(PROFILE_STORAGE_KEY, safeProfile);
  }

  function configureAdminVisibility() {
    const sidebar = getSidebar();
    if (!sidebar) return;

    sidebar.querySelectorAll("[data-admin-only='true']").forEach(function (element) {
      if (userCanAccessAdmin()) {
        element.classList.remove("d-none");
        element.removeAttribute("hidden");
      } else {
        element.classList.add("d-none");
        element.setAttribute("hidden", "hidden");
      }
    });

    if (localStorage.getItem(PROFILE_STORAGE_KEY) === "admin" && !userCanAccessAdmin()) {
      localStorage.setItem(PROFILE_STORAGE_KEY, DEFAULT_PROFILE);
    }
  }

  function markCurrentPage() {
    const sidebar = getSidebar();
    if (!sidebar) return;
    if (sidebarEventsBound) return;

    const currentPath = window.location.pathname.replace(/\/$/, "");

    sidebar.querySelectorAll(".hc-sidebar-link").forEach(function (link) {
      const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, "");
      const isCurrent = linkPath === currentPath;

      link.classList.toggle("is-active", isCurrent);

      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    sidebarEventsBound = true;
  }

  function initSidebarEvents() {
    const sidebar = getSidebar();
    if (!sidebar) return;

    sidebar.addEventListener("click", function (event) {
      const profileButton = event.target.closest("[data-hc-sidebar-profile]");

      if (profileButton) {
        event.preventDefault();
        setSidebarProfile(profileButton.dataset.hcSidebarProfile);
        return;
      }

      const collapseButton = event.target.closest("[data-hc-sidebar-toggle]");

      if (collapseButton) {
        event.preventDefault();
        document.body.classList.toggle("hc-sidebar-collapsed");
      }
    });
  }

  function initSidebar() {
    const sidebar = getSidebar();
    if (!sidebar) return;

    configureAdminVisibility();
    setSidebarProfile(localStorage.getItem(PROFILE_STORAGE_KEY) || DEFAULT_PROFILE);
    markCurrentPage();
    initSidebarEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSidebar);
  } else {
    initSidebar();
  }

  document.addEventListener("hc:partials-loaded", initSidebar);
})();
