(function () {
  const copies = {
    idoso: {
      indexKicker: "Minhas consultas",
      indexTitle: "Minhas consultas, sem esquecer retorno",
      indexDescription: "Veja o que está marcado, confirme presença e encontre orientações simples para se preparar.",
      scheduleTitle: "Agendar minha consulta",
      scheduleDescription: "Escolha com calma o tipo de consulta, o profissional, o melhor horário e confirme antes de salvar.",
      historyKicker: "Meu histórico de consultas",
      historyTitle: "Consultas que já aconteceram",
      detailsKicker: "Minha consulta",
      detailsActions: "O que posso fazer agora"
    },
    familiar: {
      indexKicker: "Central de consultas",
      indexTitle: "Consultas organizadas por pessoa cuidada",
      indexDescription: "Acompanhe consultas presenciais, teleconsultas, retornos, preparos e próximos passos de cada pessoa cuidada.",
      scheduleTitle: "Agendar consulta",
      scheduleDescription: "Escolha quem será atendido, o tipo de cuidado, o profissional, o horário e revise tudo antes de salvar.",
      historyKicker: "Histórico de consultas",
      historyTitle: "Tudo que já aconteceu, pronto para acompanhar e comprovar",
      detailsKicker: "Consulta da pessoa cuidada",
      detailsActions: "Ações rápidas"
    },
    profissional: {
      indexKicker: "Agenda profissional",
      indexTitle: "Consultas e atendimentos do dia",
      indexDescription: "Veja solicitações, atendimentos confirmados, preparos pendentes e próximos passos para cada paciente.",
      scheduleTitle: "Criar atendimento",
      scheduleDescription: "Registre um atendimento, selecione o paciente, ajuste horário e deixe orientações para o cuidado.",
      historyKicker: "Histórico profissional",
      historyTitle: "Atendimentos realizados e registros clínicos",
      detailsKicker: "Detalhes do atendimento",
      detailsActions: "Ações profissionais"
    },
    admin: {
      indexKicker: "Gestão de consultas",
      indexTitle: "Consultas, agenda e auditoria operacional",
      indexDescription: "Monitore agendamentos, confirmações, cancelamentos, profissionais e alertas administrativos.",
      scheduleTitle: "Criar consulta assistida",
      scheduleDescription: "Cadastre ou ajuste uma consulta em nome de um usuário com controle administrativo.",
      historyKicker: "Auditoria de consultas",
      historyTitle: "Histórico operacional de consultas",
      detailsKicker: "Consulta em auditoria",
      detailsActions: "Ações administrativas"
    }
  };

  function getProfile() {
    return document.body.dataset.activeProfile || localStorage.getItem("homeCareActiveProfile") || "idoso";
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (element) {
      element.textContent = value;
    });
  }

  function applyConsultationCopy() {
    const copy = copies[getProfile()] || copies.idoso;

    setText("[data-consultas-index-kicker]", copy.indexKicker);
    setText("[data-consultas-index-title]", copy.indexTitle);
    setText("[data-consultas-index-description]", copy.indexDescription);
    setText("[data-consultas-schedule-title]", copy.scheduleTitle);
    setText("[data-consultas-schedule-description]", copy.scheduleDescription);
    setText("[data-consultas-history-kicker]", copy.historyKicker);
    setText("[data-consultas-history-title]", copy.historyTitle);
    setText("[data-consultas-details-kicker]", copy.detailsKicker);
    setText("[data-consultas-details-actions]", copy.detailsActions);
  }

  document.addEventListener("DOMContentLoaded", applyConsultationCopy);
  document.addEventListener("hc:partials-loaded", applyConsultationCopy);
  document.addEventListener("hc:profile-changed", applyConsultationCopy);
})();
