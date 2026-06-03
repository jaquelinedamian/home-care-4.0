

(function () {
  "use strict";

  const PROFILE_STORAGE_KEY = "homeCareActiveProfile";
  const ACCESSIBILITY_STORAGE_KEY = "homeCareAccessibility";
  const DEFAULT_PROFILE = "idoso";

  const FONT_MIN = 1;
  const FONT_MAX = 1.5;
  const FONT_STEP = 0.1;

  const profileNames = {
    idoso: "Idoso",
    familiar: "Familiar",
    profissional: "Profissional",
    admin: "Admin"
  };

  const contrastVariables = {
    "--color-bg": "#000000",
    "--color-surface": "#000000",
    "--color-surface-soft": "#111111",
    "--color-text": "#ffffff",
    "--color-text-strong": "#ffffff",
    "--color-text-muted": "#f2f2f2",
    "--color-text-light": "#e5e5e5",
    "--color-border": "#ffffff",
    "--color-border-strong": "#ffffff",
    "--color-primary": "#ffffff",
    "--color-primary-dark": "#ffffff",
    "--color-primary-light": "#1a1a1a",
    "--color-secondary": "#ffffff",
    "--color-secondary-dark": "#ffffff",
    "--color-secondary-light": "#1a1a1a",
    "--color-danger": "#ff4d4d",
    "--color-danger-dark": "#ff1f1f",
    "--color-danger-light": "#1a1a1a",
    "--color-focus": "#ffff00"
  };

  const defaultAccessibilitySettings = {
    fontScale: 1,
    contrast: false
  };

  let headerEventsBound = false;

  function userCanAccessAdmin() {
    return true;
  }

  function normalizeProfile(profile) {
    if (!profileNames[profile]) {
      return DEFAULT_PROFILE;
    }

    if (profile === "admin" && !userCanAccessAdmin()) {
      return DEFAULT_PROFILE;
    }

    return profile;
  }

  function setActiveProfile(profile) {
    const safeProfile = normalizeProfile(profile);

    document.querySelectorAll("[data-profile-option]").forEach(function (button) {
      const isActive = button.dataset.profileOption === safeProfile;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    document.querySelectorAll("[data-profile-menu]").forEach(function (menu) {
      const isActive = menu.dataset.profileMenu === safeProfile;

      menu.classList.toggle("is-active", isActive);

      if (isActive) {
        menu.removeAttribute("hidden");
      } else {
        menu.setAttribute("hidden", "hidden");
      }
    });

    document.querySelectorAll("[data-current-profile-label]").forEach(function (label) {
      label.textContent = profileNames[safeProfile];
    });

    document.body.dataset.activeProfile = safeProfile;
    localStorage.setItem(PROFILE_STORAGE_KEY, safeProfile);
  }

  function configureAdminVisibility() {
    const adminElements = document.querySelectorAll("[data-admin-only='true']");

    adminElements.forEach(function (element) {
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

  function getAccessibilitySettings() {
    try {
      const savedSettings = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);

      if (!savedSettings) {
        return { ...defaultAccessibilitySettings };
      }

      return {
        ...defaultAccessibilitySettings,
        ...JSON.parse(savedSettings)
      };
    } catch (error) {
      return { ...defaultAccessibilitySettings };
    }
  }

  function saveAccessibilitySettings(settings) {
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(settings));
  }

  function applyContrastVariables(isContrastActive) {
    const root = document.documentElement;

    if (isContrastActive) {
      Object.entries(contrastVariables).forEach(function ([property, value]) {
        root.style.setProperty(property, value);
      });

      return;
    }

    Object.keys(contrastVariables).forEach(function (property) {
      root.style.removeProperty(property);
    });
  }

  function applyAccessibilitySettings(settings) {
    const safeFontScale = Math.min(
      Math.max(Number(settings.fontScale) || 1, FONT_MIN),
      FONT_MAX
    );

    document.documentElement.style.setProperty("--font-scale", safeFontScale.toFixed(2));

    document.documentElement.classList.toggle("theme-contrast", settings.contrast);
    document.body.classList.toggle("theme-contrast", settings.contrast);

    document.documentElement.dataset.contrast = settings.contrast ? "high" : "default";
    document.body.dataset.contrast = settings.contrast ? "high" : "default";

    applyContrastVariables(settings.contrast);
  }

  function updateAccessibility(action) {
    const settings = getAccessibilitySettings();

    if (action === "increase-font") {
      settings.fontScale = Math.min(
        Number((settings.fontScale + FONT_STEP).toFixed(2)),
        FONT_MAX
      );
    }

    if (action === "decrease-font") {
      settings.fontScale = Math.max(
        Number((settings.fontScale - FONT_STEP).toFixed(2)),
        FONT_MIN
      );
    }

    if (action === "toggle-contrast") {
      settings.contrast = !settings.contrast;
    }

    if (action === "reset") {
      settings.fontScale = 1;
      settings.contrast = false;
    }

    applyAccessibilitySettings(settings);
    saveAccessibilitySettings(settings);
  }

  function initBootstrapDropdowns() {
    const dropdownButtons = document.querySelectorAll('[data-bs-toggle="dropdown"]');

    if (window.bootstrap && window.bootstrap.Dropdown) {
      dropdownButtons.forEach(function (button) {
        window.bootstrap.Dropdown.getOrCreateInstance(button, {
          autoClose: true
        });
      });

      return;
    }

    dropdownButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        const parentDropdown = button.closest(".dropdown");
        const menu = parentDropdown ? parentDropdown.querySelector(".dropdown-menu") : null;

        if (!menu) {
          return;
        }

        document.querySelectorAll(".dropdown-menu.show").forEach(function (openedMenu) {
          if (openedMenu !== menu) {
            openedMenu.classList.remove("show");
          }
        });

        menu.classList.toggle("show");
        button.setAttribute("aria-expanded", menu.classList.contains("show") ? "true" : "false");
      });
    });

    document.addEventListener("click", function (event) {
      if (event.target.closest(".dropdown")) {
        return;
      }

      document.querySelectorAll(".dropdown-menu.show").forEach(function (menu) {
        menu.classList.remove("show");
      });

      document.querySelectorAll('[data-bs-toggle="dropdown"][aria-expanded="true"]').forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initProfileSwitch() {
    configureAdminVisibility();

    const routeProfileMatch = window.location.pathname.match(/\/pages\/(idoso|familiar|profissional|admin)\//);
    const savedProfile = routeProfileMatch ? routeProfileMatch[1] : localStorage.getItem(PROFILE_STORAGE_KEY) || DEFAULT_PROFILE;
    setActiveProfile(savedProfile);
  }

  function initAccessibility() {
    const settings = getAccessibilitySettings();
    applyAccessibilitySettings(settings);
  }

  function initHeaderEvents() {
    if (headerEventsBound) {
      return;
    }

    document.addEventListener("click", function (event) {
      const profileButton = event.target.closest("[data-profile-option]");

      if (profileButton) {
        event.preventDefault();

        setActiveProfile(profileButton.dataset.profileOption);
        return;
      }

      const accessibilityButton = event.target.closest("[data-accessibility]");

      if (accessibilityButton) {
        event.preventDefault();

        updateAccessibility(accessibilityButton.dataset.accessibility);


        const dropdownMenu = accessibilityButton.closest(".dropdown-menu");

        if (dropdownMenu && window.bootstrap && window.bootstrap.Dropdown) {
          const dropdown = dropdownMenu.closest(".dropdown");
          const dropdownToggle = dropdown ? dropdown.querySelector('[data-bs-toggle="dropdown"]') : null;

          if (dropdownToggle) {
            const instance = window.bootstrap.Dropdown.getOrCreateInstance(dropdownToggle);
            instance.hide();
          }
        }
      }
    });

    document.addEventListener("submit", function (event) {
      const form = event.target.closest("[data-global-search-form]");

      if (!form) {
        return;
      }

      event.preventDefault();

      const routeProfileMatch = window.location.pathname.match(/\/pages\/(idoso|familiar|profissional|admin)\//);
      const profile = normalizeProfile(routeProfileMatch ? routeProfileMatch[1] : localStorage.getItem(PROFILE_STORAGE_KEY) || DEFAULT_PROFILE);
      const input = form.querySelector('input[type="search"]');
      const query = input ? input.value.trim() : "";
      const target = "/pages/" + profile + "/busca.html" + (query ? "?q=" + encodeURIComponent(query) : "");
      const url = window.HomeCareUrl && typeof window.HomeCareUrl.resolve === "function" ? window.HomeCareUrl.resolve(target) : target;

      window.location.href = url;
    });

    headerEventsBound = true;
  }

  function initHeader() {
    if (!document.body) {
      return;
    }

    initBootstrapDropdowns();
    initProfileSwitch();
    initAccessibility();
    initHeaderEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader);
  } else {
    initHeader();
  }

  document.addEventListener("hc:partials-loaded", initHeader);
})();
