#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "apendice");
const viewport = { width: 1920, height: 1080 };
const profileOrder = ["geral", "idoso", "familiar", "profissional", "admin"];
const profileLabels = {
  geral: "Geral",
  idoso: "Idoso",
  familiar: "Familiar",
  profissional: "Profissional",
  admin: "Admin"
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf"
};

const knownTitles = {
  "index.html": "Tela inicial da plataforma",
  "pages/idoso/login.html": "Tela de login",
  "pages/idoso/cadastro.html": "Tela de cadastro",
  "dashboard.html": "Dashboard",
  "index.html:profile": "Visão inicial",
  "primeiro-acesso.html": "Primeiro acesso",
  "busca.html": "Busca global",
  "mensagens.html": "Mensagens",
  "mensagens-conversa.html": "Conversa em mensagens",
  "notificacoes.html": "Notificações",
  "agenda.html": "Agenda",
  "consultas.html": "Consultas",
  "consultas-agendar.html": "Agendamento de consulta",
  "consultas-detalhes.html": "Detalhes da consulta",
  "consultas-historico.html": "Histórico de consultas",
  "consultas-reagendar.html": "Reagendamento de consulta",
  "exames.html": "Exames",
  "exames-agendar.html": "Agendamento de exame",
  "exames-historico.html": "Histórico de exames",
  "exames-preparo.html": "Preparo de exame",
  "exames-resultados.html": "Resultados de exames",
  "medicamentos.html": "Medicamentos",
  "medicamentos-adicionar.html": "Adicionar medicamento",
  "medicamentos-confirmar-dose.html": "Confirmação de dose",
  "medicamentos-historico.html": "Histórico de medicamentos",
  "medicamentos-horarios.html": "Horários de medicamentos",
  "confirmar-dose.html": "Confirmar dose",
  "sinais-vitais.html": "Sinais vitais",
  "sinais-vitais-alertas.html": "Alertas de sinais vitais",
  "sinais-vitais-conectar-dispositivo.html": "Conectar dispositivo de sinais vitais",
  "sinais-vitais-dispositivos.html": "Dispositivos de sinais vitais",
  "dispositivos.html": "Dispositivos inteligentes",
  "sono.html": "Sono",
  "vacinas.html": "Vacinas",
  "vacinas-adicionar.html": "Adicionar vacina",
  "vacinas-carteira.html": "Carteira de vacinação",
  "vacinas-historico.html": "Histórico de vacinas",
  "vacinas-proximas.html": "Próximas vacinas",
  "alertas.html": "Alertas",
  "emergencia.html": "Emergência",
  "emergencia-alerta.html": "Alerta de emergência",
  "emergencia-contatos.html": "Contatos de emergência",
  "historico.html": "Histórico",
  "perfil.html": "Perfil",
  "pessoas-cuidadas.html": "Pessoas cuidadas",
  "perfil-pessoa.html": "Perfil da pessoa cuidada",
  "cadastrar-pessoa.html": "Cadastro de pessoa cuidada",
  "permissoes.html": "Permissões",
  "permissoes-convidar.html": "Convidar familiar",
  "servicos.html": "Serviços",
  "servicos-agendar.html": "Agendar serviço",
  "servicos-atendimentos.html": "Atendimentos de serviço",
  "servicos-avaliacoes.html": "Avaliações de serviços",
  "servicos-categorias.html": "Categorias de serviços",
  "servicos-historico.html": "Histórico de serviços",
  "servicos-profissional-detalhes.html": "Detalhes do profissional",
  "servicos-solicitacoes.html": "Solicitações de serviços",
  "configuracoes.html": "Configurações",
  "seguranca.html": "Segurança",
  "suporte.html": "Suporte",
  "feedback-sucesso.html": "Confirmação de sucesso",
  "conta-perfil.html": "Perfil da conta",
  "conta-configuracoes.html": "Configurações da conta",
  "conta-suporte.html": "Suporte da conta",
  "atendimentos.html": "Atendimentos",
  "solicitacoes.html": "Solicitações",
  "financeiro.html": "Financeiro",
  "meus-perfis.html": "Meus perfis",
  "editar-perfil.html": "Editar perfil profissional",
  "ativar.html": "Ativar perfil",
  "desativar.html": "Desativar perfil",
  "cadastro.html": "Cadastro profissional",
  "completar-cadastro.html": "Completar cadastro profissional",
  "validacao.html": "Validação profissional",
  "usuarios.html": "Gestão de usuários",
  "usuario-detalhe.html": "Detalhe do usuário",
  "profissionais.html": "Profissionais",
  "validacao-profissional.html": "Validação profissional administrativa",
  "relatorios.html": "Relatórios",
  "auditoria.html": "Auditoria",
  "servico-detalhe.html": "Detalhe do serviço",
  "solicitacao-detalhe.html": "Detalhe da solicitação"
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function removeDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function toPosix(file) {
  return file.replace(/\\/g, "/");
}

function relative(file) {
  return toPosix(path.relative(root, file));
}

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function humanizeFileName(fileName) {
  return path.basename(fileName, ".html")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getProfile(relPath) {
  const match = relPath.match(/^pages\/(idoso|familiar|profissional|admin)\//);
  if (!match) return "geral";
  return match[1];
}

function isRedirectPage(file) {
  const text = fs.readFileSync(file, "utf8");
  return /http-equiv=["']refresh["']/i.test(text);
}

function getTitle(relPath) {
  const base = path.basename(relPath);
  const profile = getProfile(relPath);

  if (knownTitles[relPath]) return knownTitles[relPath];
  if (base === "index.html" && profile !== "geral") return `${knownTitles["index.html:profile"]} ${profileLabels[profile]}`;
  if (knownTitles[base]) return knownTitles[base];
  return humanizeFileName(base);
}

function discoverPages() {
  const publicPages = ["index.html", "pages/idoso/login.html", "pages/idoso/cadastro.html"]
    .map((rel) => path.join(root, rel))
    .filter((file) => fs.existsSync(file));

  const profilePages = walk(path.join(root, "pages"))
    .filter((file) => file.endsWith(".html"))
    .filter((file) => !isRedirectPage(file))
    .filter((file) => {
      const rel = relative(file);
      return !["pages/idoso/login.html", "pages/idoso/cadastro.html"].includes(rel);
    });

  const allPages = [...publicPages, ...profilePages];

  return allPages
    .map((file) => {
      const rel = relative(file);
      return {
        rel,
        profile: getProfile(rel),
        title: getTitle(rel),
        urlPath: "/" + rel
      };
    })
    .sort((a, b) => {
      const profileDiff = profileOrder.indexOf(a.profile) - profileOrder.indexOf(b.profile);
      if (profileDiff !== 0) return profileDiff;
      if (a.rel === "index.html") return -1;
      if (b.rel === "index.html") return 1;
      return a.title.localeCompare(b.title, "pt-BR");
    })
    .map((page, index) => ({
      ...page,
      figure: index + 1,
      fileName: `Figura-${String(index + 1).padStart(3, "0")}-${slugify(page.title)}.png`
    }));
}

function createServer() {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    let pathname = decodeURIComponent(requestUrl.pathname);

    if (pathname === "/") pathname = "/index.html";

    const file = path.normalize(path.join(root, pathname));
    const isInsideRoot = file === root || file.startsWith(root + path.sep);

    if (!isInsideRoot || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Arquivo não encontrado");
      return;
    }

    const ext = path.extname(file).toLowerCase();
    response.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    fs.createReadStream(file).pipe(response);
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

function writeFigureList(pages) {
  const lines = [
    "# Lista de Figuras",
    "",
    `Total de telas capturadas: ${pages.length}`,
    "Total de perfis documentados: 4",
    `Data da geração: ${new Intl.DateTimeFormat("pt-BR").format(new Date())}`,
    "",
    "| Figura | Descrição | Perfil | Arquivo |",
    "|---:|---|---|---|"
  ];

  for (const page of pages) {
    const relImage = toPosix(path.relative(outputRoot, page.outputPath));
    lines.push(`| Figura ${String(page.figure).padStart(2, "0")} | ${page.title} | ${profileLabels[page.profile]} | \`${relImage}\` |`);
  }

  fs.writeFileSync(path.join(outputRoot, "lista-de-figuras.md"), lines.join("\n") + "\n", "utf8");
}

function createPdfHtml(pages) {
  const figureSections = pages.map((page) => {
    const relImage = toPosix(path.relative(outputRoot, page.outputPath));
    return `
      <section class="figure-page">
        <header>
          <p>Figura ${String(page.figure).padStart(2, "0")} – ${escapeHtml(page.title)}</p>
          <small>${escapeHtml(profileLabels[page.profile])}</small>
        </header>
        <img src="${relImage}" alt="Figura ${String(page.figure).padStart(2, "0")} – ${escapeHtml(page.title)}" />
      </section>
    `;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Apêndice A - Telas do Sistema</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #0f172a;
      font-family: Arial, Helvetica, sans-serif;
      background: #fff;
    }

    .cover,
    .figure-page {
      break-after: page;
      page-break-after: always;
    }

    .cover {
      min-height: 180mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 10px;
    }

    .cover h1 {
      margin: 0;
      font-size: 28px;
    }

    .cover p {
      margin: 0;
      font-size: 15px;
      color: #475569;
    }

    .figure-page {
      min-height: 180mm;
      display: flex;
      flex-direction: column;
      gap: 8mm;
    }

    .figure-page header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 16px;
      border-bottom: 1px solid #d7dee8;
      padding-bottom: 4mm;
    }

    .figure-page p {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
    }

    .figure-page small {
      color: #64748b;
      font-size: 11px;
      white-space: nowrap;
    }

    .figure-page img {
      max-width: 100%;
      max-height: 160mm;
      object-fit: contain;
      object-position: top center;
      border: 1px solid #d7dee8;
    }
  </style>
</head>
<body>
  <section class="cover">
    <h1>Apêndice A – Telas do Sistema Home Care 4.0</h1>
    <p>Total de telas capturadas: ${pages.length}</p>
    <p>Total de perfis documentados: 4</p>
    <p>Data da geração: ${new Intl.DateTimeFormat("pt-BR").format(new Date())}</p>
  </section>
  ${figureSections}
</body>
</html>`;

  const htmlPath = path.join(outputRoot, "Apendice-A-Telas-do-Sistema.html");
  fs.writeFileSync(htmlPath, html, "utf8");
  return htmlPath;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main() {
  let chromium;

  try {
    ({ chromium } = require("playwright"));
  } catch (error) {
    console.error("Playwright não está instalado. Execute: npm install");
    process.exit(1);
  }

  const pages = discoverPages();
  removeDir(outputRoot);
  for (const profile of profileOrder) ensureDir(path.join(outputRoot, profile));

  const { server, baseUrl } = await createServer();
  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      locale: "pt-BR"
    });

    for (const pageData of pages) {
      const page = await context.newPage();
      const outputDir = path.join(outputRoot, pageData.profile);
      const outputPath = path.join(outputDir, pageData.fileName);
      const url = baseUrl + pageData.urlPath;

      pageData.outputPath = outputPath;

      console.log(`Figura ${String(pageData.figure).padStart(3, "0")} - ${pageData.title}`);
      await page.goto(url, { waitUntil: "networkidle" });
      await page.addStyleTag({
        content: `
          * {
            scroll-behavior: auto !important;
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `
      });
      await page.screenshot({
        path: outputPath,
        fullPage: true
      });
      await page.close();
    }

    writeFigureList(pages);

    const pdfHtmlPath = createPdfHtml(pages);
    const pdfPage = await context.newPage();
    await pdfPage.goto(pathToFileURL(pdfHtmlPath).toString(), { waitUntil: "load" });
    await pdfPage.pdf({
      path: path.join(outputRoot, "Apendice-A-Telas-do-Sistema.pdf"),
      format: "A4",
      landscape: true,
      printBackground: true
    });
    await pdfPage.close();
  } finally {
    await browser.close();
    server.close();
  }

  console.log("");
  console.log(`Total de telas capturadas: ${pages.length}`);
  console.log("Total de perfis documentados: 4");
  console.log(`Data da geração: ${new Intl.DateTimeFormat("pt-BR").format(new Date())}`);
  console.log(`Saída: ${outputRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
