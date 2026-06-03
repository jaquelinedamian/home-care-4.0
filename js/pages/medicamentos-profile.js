(function () {
  const copies = {
    idoso: {
      badge: "Meus remédios",
      title: "Meus remédios de hoje",
      description: "Veja os remédios do dia, confirme quando tomar e peça ajuda se algo não estiver claro.",
      alertTitle: "Tem um remédio atrasado",
      alertText: "Losartana 50mg estava prevista para 08:00. Confirme se você já tomou ou peça ajuda para registrar.",
      confirm: "Já tomei",
      skip: "Não consegui tomar",
      personLabel: "Mostrar",
      allPeople: "Todos",
      add: "Adicionar remédio",
      schedule: "Meus horários",
      history: "Meu histórico",
      todayTitle: "O que preciso tomar hoje",
      todayText: "Remédios organizados por horário.",
      allTitle: "Meus tratamentos",
      quickTitle: "Ações rápidas"
    },
    familiar: {
      badge: "Medicamentos da pessoa cuidada",
      title: "Controle de medicamentos",
      description: "Acompanhe doses do dia, confirme tomadas, registre atrasos e veja alertas por pessoa cuidada.",
      alertTitle: "Existe uma dose atrasada",
      alertText: "Losartana 50mg estava prevista para 08:00. Confirme se a pessoa cuidada já tomou ou registre o motivo do atraso.",
      confirm: "Confirmar dose",
      skip: "Registrar não tomada",
      personLabel: "Pessoa cuidada",
      allPeople: "Todas",
      add: "Adicionar medicamento",
      schedule: "Configurar horários",
      history: "Histórico",
      todayTitle: "Agenda de hoje",
      todayText: "Doses organizadas por horário e prioridade.",
      allTitle: "Medicamentos cadastrados",
      quickTitle: "Ações rápidas"
    },
    profissional: {
      badge: "Medicamentos do paciente",
      title: "Acompanhamento medicamentoso",
      description: "Revise a adesão, atrasos e registros relevantes antes ou depois dos atendimentos.",
      alertTitle: "Dose pendente para validação",
      alertText: "Losartana 50mg aparece como atrasada desde 08:00. Oriente o cuidador ou registre uma observação clínica.",
      confirm: "Validar dose",
      skip: "Registrar intercorrência",
      personLabel: "Paciente",
      allPeople: "Todos",
      add: "Adicionar prescrição",
      schedule: "Ajustar plano",
      history: "Histórico clínico",
      todayTitle: "Doses acompanhadas hoje",
      todayText: "Registros do paciente organizados por horário.",
      allTitle: "Tratamentos ativos",
      quickTitle: "Atalhos profissionais"
    },
    admin: {
      badge: "Auditoria de medicamentos",
      title: "Visão administrativa de medicamentos",
      description: "Monitore cadastros, alertas e registros de adesão para suporte operacional.",
      alertTitle: "Alerta operacional aberto",
      alertText: "Losartana 50mg possui atraso registrado. Verifique se há falha de notificação, permissão ou acompanhamento.",
      confirm: "Marcar como revisado",
      skip: "Abrir ocorrência",
      personLabel: "Usuário ou paciente",
      allPeople: "Todos",
      add: "Novo cadastro",
      schedule: "Regras de horários",
      history: "Logs e histórico",
      todayTitle: "Alertas de hoje",
      todayText: "Registros que exigem revisão ou acompanhamento.",
      allTitle: "Cadastros ativos",
      quickTitle: "Ações administrativas"
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

  function applyMedicationCopy() {
    const copy = copies[getProfile()] || copies.idoso;

    setText("[data-med-badge]", copy.badge);
    setText("[data-med-title]", copy.title);
    setText("[data-med-description]", copy.description);
    setText("[data-med-alert-title]", copy.alertTitle);
    setText("[data-med-alert-text]", copy.alertText);
    setText("[data-med-confirm]", copy.confirm);
    setText("[data-med-skip]", copy.skip);
    setText("[data-med-person-label]", copy.personLabel);
    setText("[data-med-all-people]", copy.allPeople);
    setText("[data-med-add]", copy.add);
    setText("[data-med-schedule]", copy.schedule);
    setText("[data-med-history]", copy.history);
    setText("[data-med-today-title]", copy.todayTitle);
    setText("[data-med-today-text]", copy.todayText);
    setText("[data-med-all-title]", copy.allTitle);
    setText("[data-med-quick-title]", copy.quickTitle);
  }

  document.addEventListener("DOMContentLoaded", applyMedicationCopy);
  document.addEventListener("hc:partials-loaded", applyMedicationCopy);
  document.addEventListener("hc:profile-changed", applyMedicationCopy);
  window.HomeCareMedicationProfile = {
    apply: applyMedicationCopy
  };
})();
