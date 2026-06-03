

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

  const profileRoutes = {
    idoso: {
      dashboard: "/pages/idoso/dashboard.html",
      agenda: "/pages/idoso/agenda.html",
      alertas: "/pages/idoso/alertas.html",
      notificacoes: "/pages/idoso/notificacoes.html",
      mensagens: "/pages/idoso/mensagens.html",
      medicamentos: "/pages/idoso/medicamentos.html",
      consultas: "/pages/idoso/consultas.html",
      saude: "/pages/idoso/sinais-vitais.html",
      servicos: "/pages/idoso/servicos.html",
      emergencia: "/pages/idoso/emergencia.html"
    },
    familiar: {
      dashboard: "/pages/familiar/dashboard.html",
      agenda: "/pages/familiar/agenda.html",
      alertas: "/pages/familiar/alertas.html",
      notificacoes: "/pages/familiar/notificacoes.html",
      mensagens: "/pages/familiar/mensagens.html",
      medicamentos: "/pages/familiar/medicamentos.html",
      consultas: "/pages/familiar/consultas.html",
      saude: "/pages/familiar/sinais-vitais.html",
      servicos: "/pages/familiar/servicos.html",
      emergencia: "/pages/familiar/emergencia.html"
    },
    profissional: {
      dashboard: "/pages/profissional/dashboard.html",
      agenda: "/pages/profissional/agenda.html",
      alertas: "/pages/profissional/solicitacoes.html",
      notificacoes: "/pages/profissional/notificacoes.html",
      mensagens: "/pages/profissional/mensagens.html",
      medicamentos: "/pages/profissional/atendimentos.html",
      consultas: "/pages/profissional/atendimentos.html",
      saude: "/pages/profissional/historico.html",
      servicos: "/pages/profissional/meus-perfis.html",
      emergencia: "/pages/idoso/emergencia-alerta.html"
    },
    admin: {
      dashboard: "/pages/admin/dashboard.html",
      agenda: "/pages/admin/agenda.html",
      alertas: "/pages/admin/alertas.html",
      notificacoes: "/pages/admin/notificacoes.html",
      mensagens: "/pages/admin/mensagens.html",
      medicamentos: "/pages/admin/servicos.html",
      consultas: "/pages/admin/atendimentos.html",
      saude: "/pages/admin/relatorios.html",
      servicos: "/pages/admin/servicos.html",
      emergencia: "/pages/admin/alertas.html"
    }
  };

  const profileDashboardPaths = {
    idoso: profileRoutes.idoso.dashboard,
    familiar: profileRoutes.familiar.dashboard,
    profissional: profileRoutes.profissional.dashboard,
    admin: profileRoutes.admin.dashboard
  };

  let eventsBound = false;

  function userCanAccessAdmin() {
    return true;
  }

  function normalizeProfile(profile) {
    if (!profileNames[profile]) {
      return DEFAULT_PROFILE;
    }

    return profile;
  }

  function configureAdminVisibility() {
    document.querySelectorAll("[data-admin-only='true']").forEach(function (element) {
      element.classList.remove("d-none");
      element.removeAttribute("hidden");
    });
  }

  function setActiveProfile(profile, options) {
    const safeProfile = normalizeProfile(profile);
    const shouldPersist = !options || options.persist !== false;
    const shouldNavigate = options && options.navigate === true;

    configureAdminVisibility();

    document.querySelectorAll("[data-profile-option], [data-hc-sidebar-profile]").forEach(function (button) {
      const buttonProfile = button.dataset.profileOption || button.dataset.hcSidebarProfile;
      const isActive = buttonProfile === safeProfile;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    document.querySelectorAll("[data-profile-menu], [data-hc-sidebar-menu]").forEach(function (menu) {
      const menuProfile = menu.dataset.profileMenu || menu.dataset.hcSidebarMenu;
      const isActive = menuProfile === safeProfile;

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

    updateDashboardLinks(safeProfile);
    updateProfileRoutedLinks(safeProfile);

    if (shouldPersist) {
      localStorage.setItem(PROFILE_STORAGE_KEY, safeProfile);
    }

    document.dispatchEvent(new CustomEvent("hc:profile-changed", {
      detail: { profile: safeProfile }
    }));

    if (shouldNavigate) {
      navigateToProfileDashboard(safeProfile);
    }
  }

  function resolveUrl(path) {
    if (window.HomeCareUrl && typeof window.HomeCareUrl.resolve === "function") {
      return window.HomeCareUrl.resolve(path);
    }

    return path;
  }

  function getDashboardPath(profile) {
    return profileDashboardPaths[normalizeProfile(profile)] || profileDashboardPaths[DEFAULT_PROFILE];
  }

  function getRoutePath(profile, routeKey) {
    const safeProfile = normalizeProfile(profile);
    const profileRouteMap = profileRoutes[safeProfile] || profileRoutes[DEFAULT_PROFILE];

    return profileRouteMap[routeKey] || profileRoutes[DEFAULT_PROFILE][routeKey] || getDashboardPath(safeProfile);
  }

  function updateDashboardLinks(profile) {
    const dashboardPath = getDashboardPath(profile);

    document.querySelectorAll(
      '#appHeader a[href="/pages/dashboard.html"], ' +
      '#appHeader a[href^="/pages/dashboards/"], ' +
      '#appSidebar a[href="/pages/dashboard.html"], ' +
      '#appSidebar a[href^="/pages/dashboards/"], ' +
      '#appFooter a[href="/pages/dashboard.html"], ' +
      '#appFooter a[href^="/pages/dashboards/"]'
    ).forEach(function (link) {
      link.setAttribute("href", resolveUrl(dashboardPath));
    });
  }

  function updateProfileRoutedLinks(profile) {
    const safeProfile = normalizeProfile(profile);

    document.querySelectorAll("[data-route-key]").forEach(function (link) {
      const routeKey = link.dataset.routeKey;
      const routePath = getRoutePath(safeProfile, routeKey);

      if (routePath) {
        link.setAttribute("href", resolveUrl(routePath));
      }
    });
  }

  function isDashboardRoute() {
    return /\/pages\/dashboard\.html$/.test(window.location.pathname) ||
      /\/pages\/dashboards\/[^/]+\.html$/.test(window.location.pathname) ||
      /\/pages\/(idoso|familiar|profissional|admin)\/(index|dashboard)\.html$/.test(window.location.pathname);
  }

  function getProfileFromDashboardRoute() {
    let match = window.location.pathname.match(/\/pages\/dashboards\/([^/]+)\.html$/);

    if (match) {
      return normalizeProfile(match[1]);
    }

    match = window.location.pathname.match(/\/pages\/(idoso|familiar|profissional|admin)\//);

    if (match) {
      return normalizeProfile(match[1]);
    }

    return null;
  }

  function navigateToProfileDashboard(profile) {
    if (!isDashboardRoute()) {
      return;
    }

    const dashboardPath = resolveUrl(getDashboardPath(profile));
    const dashboardUrl = new URL(dashboardPath, window.location.origin);

    if (window.location.pathname !== dashboardUrl.pathname) {
      window.location.href = dashboardUrl.href;
    }
  }

  function getSavedProfile() {
    const routeProfile = getProfileFromDashboardRoute();

    if (routeProfile) {
      return routeProfile;
    }

    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    return normalizeProfile(savedProfile || DEFAULT_PROFILE);
  }

  function initProfileSwitcher() {
    configureAdminVisibility();
    setActiveProfile(getSavedProfile(), { persist: true });

    if (eventsBound) {
      return;
    }

    document.addEventListener("click", function (event) {
      const profileButton = event.target.closest("[data-profile-option], [data-hc-sidebar-profile]");

      if (!profileButton) {
        return;
      }

      event.preventDefault();
      setActiveProfile(profileButton.dataset.profileOption || profileButton.dataset.hcSidebarProfile, {
        navigate: true
      });
    });

    eventsBound = true;
  }

  window.HomeCareProfile = {
    setActiveProfile,
    getSavedProfile,
    normalizeProfile,
    profileNames,
    getDashboardPath,
    getRoutePath,
    updateProfileRoutedLinks
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfileSwitcher);
  } else {
    initProfileSwitcher();
  }

  document.addEventListener("hc:partials-loaded", initProfileSwitcher);
})();
