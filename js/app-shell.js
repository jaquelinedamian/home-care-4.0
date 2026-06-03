

(function () {
  "use strict";

  const PROJECT_FOLDERS = ["pages", "partials", "css", "js", "img", "assets"];

  function normalizeSlash(path) {
    return String(path || "").replace(/\\/g, "/");
  }

  function removeTrailingSlash(path) {
    return path.length > 1 ? path.replace(/\/$/, "") : path;
  }

  function getProjectBasePath() {
    const pathname = normalizeSlash(window.location.pathname);
    const marker = "/pages/";
    const pageIndex = pathname.indexOf(marker);

    if (pageIndex >= 0) {
      return removeTrailingSlash(pathname.slice(0, pageIndex));
    }

    const shellScript = document.currentScript || document.querySelector('script[src*="js/app-shell.js"]');

    if (shellScript && shellScript.src) {
      try {
        const scriptPath = normalizeSlash(new URL(shellScript.src).pathname);
        const scriptMarker = "/js/app-shell.js";
        const scriptIndex = scriptPath.indexOf(scriptMarker);

        if (scriptIndex >= 0) {
          return removeTrailingSlash(scriptPath.slice(0, scriptIndex));
        }
      } catch (error) {
        return "";
      }
    }

    if (pathname.startsWith("/sites/tcc")) {
      return "/sites/tcc";
    }

    return removeTrailingSlash(window.HOME_CARE_BASE_PATH || "");
  }

  const BASE_PATH = getProjectBasePath();

  function isExternalOrSpecialUrl(value) {
    return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|mailto:|tel:|javascript:)/i.test(value);
  }

  function startsWithProjectFolder(pathname) {
    return PROJECT_FOLDERS.some(function (folder) {
      return pathname === "/" + folder || pathname.startsWith("/" + folder + "/");
    });
  }

  function resolveProjectUrl(value) {
    if (!value) {
      return value;
    }

    const originalValue = String(value);
    const trimmedValue = originalValue.trim();

    if (!trimmedValue || isExternalOrSpecialUrl(trimmedValue)) {
      try {
        const parsed = new URL(trimmedValue);
        const isSameOrigin = parsed.origin === window.location.origin;
        const alreadyHasBase = BASE_PATH && parsed.pathname.startsWith(BASE_PATH + "/");

        if (isSameOrigin && !alreadyHasBase && startsWithProjectFolder(parsed.pathname)) {
          parsed.pathname = BASE_PATH + parsed.pathname;
          return parsed.toString();
        }
      } catch (error) {
        return originalValue;
      }

      return originalValue;
    }

    if (!BASE_PATH) {
      return originalValue;
    }

    if (trimmedValue === BASE_PATH || trimmedValue.startsWith(BASE_PATH + "/")) {
      return originalValue;
    }

    if (trimmedValue.startsWith("/") && startsWithProjectFolder(trimmedValue)) {
      return BASE_PATH + trimmedValue;
    }

    const startsWithoutSlash = PROJECT_FOLDERS.some(function (folder) {
      return trimmedValue === folder || trimmedValue.startsWith(folder + "/");
    });

    if (startsWithoutSlash) {
      return BASE_PATH + "/" + trimmedValue;
    }

    return originalValue;
  }

  function fixUrlAttribute(element, attributeName) {
    if (!element.hasAttribute(attributeName)) {
      return;
    }

    const currentValue = element.getAttribute(attributeName);
    const fixedValue = resolveProjectUrl(currentValue);

    if (fixedValue && fixedValue !== currentValue) {
      element.setAttribute(attributeName, fixedValue);
    }
  }

  function fixProjectUrls(root) {
    const scope = root || document;

    scope.querySelectorAll("a[href], area[href]").forEach(function (element) {
      fixUrlAttribute(element, "href");
    });

    scope.querySelectorAll("form[action]").forEach(function (element) {
      fixUrlAttribute(element, "action");
    });

    scope.querySelectorAll("img[src], source[src], video[src], audio[src], iframe[src]").forEach(function (element) {
      fixUrlAttribute(element, "src");
    });
  }

  function observeDynamicUrls() {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "attributes") {
          fixUrlAttribute(mutation.target, mutation.attributeName);
          return;
        }

        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }

          fixProjectUrls(node);

          if (node.matches && (node.matches("a[href], area[href], form[action], img[src], source[src], video[src], audio[src], iframe[src]"))) {
            ["href", "action", "src"].forEach(function (attributeName) {
              fixUrlAttribute(node, attributeName);
            });
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href", "src", "action"]
    });
  }

  function getRelativeBasePath() {
    const marker = "/pages/";
    const pathname = normalizeSlash(window.location.pathname);
    const pageIndex = pathname.indexOf(marker);

    if (pageIndex === -1) {
      return ".";
    }

    const afterPages = pathname.slice(pageIndex + marker.length);
    const depth = Math.max(afterPages.split("/").length - 1, 0);

    return Array(depth + 1).fill("..").join("/");
  }

  function resolvePartialPath(fileName) {
    return getRelativeBasePath() + "/partials/" + fileName;
  }

  function loadPartial(targetId, fileName) {
    const target = document.getElementById(targetId);

    if (!target) {
      return Promise.resolve();
    }

    return fetch(resolvePartialPath(fileName))
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Erro ao carregar " + fileName);
        }

        return response.text();
      })
      .then(function (html) {
        target.innerHTML = html;
        fixProjectUrls(target);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  const profileLabels = {
    idoso: "Início",
    familiar: "Início",
    profissional: "Início",
    admin: "Admin"
  };

  const moduleLabels = {
    agenda: "Agenda",
    alertas: "Alertas",
    notificacoes: "Notificações",
    mensagens: "Mensagens",
    dispositivos: "Dispositivos",
    medicamentos: "Medicamentos",
    consultas: "Consultas",
    "sinais-vitais": "Sinais vitais",
    sono: "Sono",
    exames: "Exames",
    vacinas: "Vacinas",
    servicos: "Serviços",
    emergencia: "Emergência",
    historico: "Histórico",
    perfil: "Perfil",
    permissoes: "Permissões",
    configuracoes: "Configurações",
    suporte: "Suporte",
    seguranca: "Segurança",
    busca: "Busca global",
    cadastro: "Cadastro",
    conta: "Conta",
    "pessoas-cuidadas": "Pessoas cuidadas",
    "cadastrar-pessoa": "Pessoas cuidadas",
    "perfil-pessoa": "Pessoas cuidadas",
    solicitacoes: "Solicitações",
    atendimentos: "Atendimentos",
    "meus-perfis": "Meus perfis",
    financeiro: "Financeiro",
    validacao: "Validação",
    ativar: "Ativar perfil",
    desativar: "Desativar perfil",
    usuarios: "Usuários",
    usuario: "Usuários",
    profissionais: "Profissionais",
    relatorios: "Relatórios",
    auditoria: "Auditoria",
    servico: "Serviços"
  };

  const pageLabels = {
    "index": "Visão geral",
    dashboard: "Dashboard",
    busca: "Busca global",
    "consultas-detalhes": "Detalhes da consulta",
    "consultas-agendar": "Agendar consulta",
    "consultas-reagendar": "Reagendar consulta",
    "consultas-historico": "Histórico de consultas",
    "medicamentos-adicionar": "Adicionar medicamento",
    "medicamentos-horarios": "Horários",
    "medicamentos-historico": "Histórico de medicamentos",
    "medicamentos-confirmar-dose": "Confirmar dose",
    "exames-agendar": "Agendar exame",
    "exames-historico": "Histórico de exames",
    "exames-preparo": "Preparo do exame",
    "exames-resultados": "Resultados de exames",
    "vacinas-adicionar": "Adicionar vacina",
    "vacinas-carteira": "Carteira de vacinação",
    "vacinas-historico": "Histórico de vacinas",
    "vacinas-proximas": "Próximas vacinas",
    "servicos-agendar": "Agendar serviço",
    "servicos-atendimentos": "Atendimentos",
    "servicos-avaliacoes": "Avaliações",
    "servicos-categorias": "Categorias",
    "servicos-historico": "Histórico de serviços",
    "servicos-profissional-detalhes": "Perfil do profissional",
    "servicos-solicitacoes": "Solicitações",
    "mensagens-conversa": "Conversa",
    "permissoes-convidar": "Convidar pessoa",
    "emergencia-contatos": "Contatos de emergência",
    "emergencia-alerta": "Alerta de emergência",
    "sinais-vitais-alertas": "Alertas de sinais vitais",
    "sinais-vitais-conectar-dispositivo": "Conectar dispositivo",
    "sinais-vitais-dispositivos": "Dispositivos de sinais vitais",
    "cadastrar-pessoa": "Cadastrar pessoa",
    "perfil-pessoa": "Perfil da pessoa",
    "primeiro-acesso": "Primeiro acesso",
    "completar-cadastro": "Completar cadastro",
    "editar-perfil": "Editar perfil",
    "validacao-profissional": "Validação profissional",
    "usuario-detalhe": "Detalhe do usuário",
    "servico-detalhe": "Detalhe do serviço",
    "solicitacao-detalhe": "Detalhe da solicitação",
    "conta-perfil": "Minha conta",
    "conta-configuracoes": "Configurações da conta",
    "conta-suporte": "Suporte da conta"
  };

  function humanizeSlug(slug) {
    return String(slug || "")
      .replace(/\.html$/, "")
      .split("-")
      .filter(Boolean)
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function getProfileFromPath() {
    const match = normalizeSlash(window.location.pathname).match(/\/pages\/(idoso|familiar|profissional|admin)\//);
    return match ? match[1] : "";
  }

  function getPageSlug() {
    const pathname = normalizeSlash(window.location.pathname);
    const fileName = pathname.split("/").pop() || "index.html";
    return fileName.replace(/\.html$/, "");
  }

  function getModuleSlug(pageSlug) {
    if (pageSlug === "primeiro-acesso" || pageSlug === "feedback-sucesso") return "";
    if (pageSlug === "confirmar-dose") return "medicamentos";
    if (pageSlug === "completar-cadastro") return "cadastro";
    if (pageSlug === "meus-perfis") return "meus-perfis";
    if (pageSlug === "editar-perfil" || pageSlug === "ativar" || pageSlug === "desativar") return "meus-perfis";
    if (pageSlug.indexOf("conta-") === 0) return "conta";
    if (pageSlug.indexOf("sinais-vitais") === 0) return "sinais-vitais";
    if (pageSlug.indexOf("pessoas-cuidadas") === 0 || pageSlug === "cadastrar-pessoa" || pageSlug === "perfil-pessoa") return "pessoas-cuidadas";
    if (pageSlug.indexOf("validacao-profissional") === 0) return "validacao";
    if (pageSlug.indexOf("usuario-") === 0) return "usuarios";
    if (pageSlug.indexOf("servico-") === 0) return "servicos";
    if (pageSlug.indexOf("solicitacao-") === 0) return "solicitacoes";
    return pageSlug.split("-")[0];
  }

  function getModulePath(profile, moduleSlug) {
    const overrides = {
      idoso: {
        conta: "/pages/idoso/conta-perfil.html"
      },
      admin: {
        validacao: "/pages/admin/validacao-profissional.html"
      }
    };

    if (overrides[profile] && overrides[profile][moduleSlug]) {
      return overrides[profile][moduleSlug];
    }

    return "/pages/" + profile + "/" + moduleSlug + ".html";
  }

  function getBreadcrumbItems() {
    const profile = getProfileFromPath();
    const pageSlug = getPageSlug();

    if (!profile || pageSlug === "login" || pageSlug.indexOf("cadastro") === 0) {
      return [];
    }

    const dashboardPath = "/pages/" + profile + "/dashboard.html";
    const moduleSlug = getModuleSlug(pageSlug);
    const moduleLabel = moduleLabels[moduleSlug] || humanizeSlug(moduleSlug);
    const currentLabel = pageLabels[pageSlug] || document.querySelector("h1")?.textContent?.trim() || humanizeSlug(pageSlug);
    const items = [
      { label: profileLabels[profile] || "Início", href: dashboardPath }
    ];

    if (pageSlug !== "dashboard" && pageSlug !== "index") {
      const modulePath = getModulePath(profile, moduleSlug);

      if (moduleSlug && moduleLabel && currentLabel !== moduleLabel) {
        items.push({ label: moduleLabel, href: modulePath });
      }
    }

    items.push({ label: currentLabel, current: true });
    return items;
  }

  function ensureBreadcrumbMount() {
    const main = document.getElementById("conteudo-principal") || document.querySelector("main");
    const items = getBreadcrumbItems();

    if (!main || !items.length) {
      return null;
    }

    main.querySelectorAll('nav[aria-label="breadcrumb"]:not([data-hc-breadcrumb])').forEach(function (breadcrumb) {
      breadcrumb.remove();
    });

    let target = document.getElementById("appBreadcrumb");

    if (!target) {
      target = document.createElement("div");
      target.id = "appBreadcrumb";
      target.className = "hc-breadcrumb-slot";
      main.insertBefore(target, main.firstElementChild);
    }

    return target;
  }

  function renderBreadcrumb() {
    const target = document.getElementById("appBreadcrumb");
    const list = target ? target.querySelector("[data-hc-breadcrumb-list]") : null;
    const items = getBreadcrumbItems();

    if (!target || !list || !items.length) {
      return;
    }

    list.innerHTML = items.map(function (item) {
      if (item.current) {
        return '<li class="hc-breadcrumb-current" aria-current="page">' + item.label + '</li>';
      }

      return '<li><a href="' + resolveProjectUrl(item.href) + '">' + item.label + '</a></li>';
    }).join("");

    fixProjectUrls(target);
  }

  function loadAppShell() {
    fixProjectUrls(document);
    ensureBreadcrumbMount();

    Promise.all([
      loadPartial("appHeader", "header.html"),
      loadPartial("appProfileSwitcher", "profile-switcher.html"),
      loadPartial("appSidebar", "sidebar.html"),
      loadPartial("appBreadcrumb", "breadcrumb.html"),
      loadPartial("appFooter", "footer.html")
    ]).then(function () {
      renderBreadcrumb();
      fixProjectUrls(document);
      document.dispatchEvent(new CustomEvent("hc:partials-loaded"));
    });
  }

  window.HomeCareUrl = {
    basePath: BASE_PATH,
    resolve: resolveProjectUrl,
    fixAll: function () {
      fixProjectUrls(document);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      observeDynamicUrls();
      loadAppShell();
    });
  } else {
    observeDynamicUrls();
    loadAppShell();
  }
})();
