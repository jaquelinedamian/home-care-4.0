

(() => {
  const TOTAL_STEPS = 5;
  const STORAGE_KEY = 'homecare40_cadastro_demo';
  const params = new URLSearchParams(window.location.search);

  if (params.get('novo') === '1') {
    localStorage.removeItem(STORAGE_KEY);
  }

  const dashboards = {
    idoso: '../idoso/primeiro-acesso.html',
    familiar: '../familiar/primeiro-acesso.html',
    profissional: '../profissional/primeiro-acesso.html'
  };

  const professionalCatalog = {
    medicina: {
      label: 'Medicina',
      conselho: 'CRM',
      services: ['Consulta geriátrica', 'Consulta clínica', 'Teleconsulta', 'Avaliação domiciliar', 'Renovação de receita']
    },
    enfermagem: {
      label: 'Enfermagem',
      conselho: 'COREN',
      services: ['Enfermagem domiciliar', 'Curativos', 'Administração de medicamentos', 'Coleta de exames', 'Acompanhamento pós-alta']
    },
    fisioterapia: {
      label: 'Fisioterapia',
      conselho: 'CREFITO',
      services: ['Fisioterapia motora', 'Fisioterapia respiratória', 'Reabilitação pós-queda', 'Treino de mobilidade', 'Avaliação funcional']
    },
    nutricao: {
      label: 'Nutrição',
      conselho: 'CRN',
      services: ['Avaliação nutricional', 'Plano alimentar', 'Acompanhamento de diabetes', 'Nutrição enteral', 'Educação alimentar familiar']
    },
    psicologia: {
      label: 'Psicologia',
      conselho: 'CRP',
      services: ['Psicoterapia online', 'Psicoterapia domiciliar', 'Apoio ao cuidador', 'Avaliação emocional', 'Acompanhamento de ansiedade']
    },
    servico_social: {
      label: 'Serviço social',
      conselho: 'CRESS',
      services: ['Avaliação social', 'Orientação familiar', 'Encaminhamento de benefícios', 'Plano de suporte social', 'Mediação com rede de cuidado']
    }
  };

  const stepMeta = [
    { title: 'Quem é você', subtitle: 'CPF e validação' },
    { title: 'Validação gov.br', subtitle: 'Identidade segura' },
    { title: 'Seu perfil', subtitle: 'Escolha sua categoria' },
    { title: 'Informações', subtitle: 'Conte um pouco sobre você' },
    { title: 'Revisão', subtitle: 'Confira antes de concluir' }
  ];

  const state = loadState();
  const form = document.querySelector('#cadastroForm');
  const title = document.querySelector('#cadastroTitle');
  const counter = document.querySelector('#cadastroStepCounter');
  const stepList = document.querySelector('#cadastroStepList');
  const progressBar = document.querySelector('#cadastroProgressBar');
  const progressRing = document.querySelector('#cadastroProgressRing');
  const feedback = document.querySelector('#cadastroFeedback');
  const btnVoltar = document.querySelector('#btnVoltar');
  const btnContinuar = document.querySelector('#btnContinuar');

  function loadState() {
    const initial = {
      step: 1,
      cpf: '',
      nome: '',
      email: '',
      telefone: '',
      nascimento: '',
      govValidado: false,
      perfil: '',
      cidade: '',
      necessidade: '',
      profissao: '',
      conselho: '',
      conselhoNumero: '',
      conselhoAtivo: false,
      especialidade: '',
      servicos: [],
      pessoaCuidada: '',
      pessoaCuidadaCpf: '',
      pessoaCuidadaNascimento: '',
      parentesco: '',
      autorizacaoGovbrIdoso: false
    };

    try {
      return { ...initial, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return initial;
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function render() {
    hideFeedback();
    renderStepList();
    counter.textContent = `Etapa ${state.step} de ${TOTAL_STEPS}`;
    progressRing.textContent = state.step;
    progressBar.style.width = `${(state.step / TOTAL_STEPS) * 100}%`;
    progressBar.parentElement.setAttribute('aria-valuenow', String(Math.round((state.step / TOTAL_STEPS) * 100)));

    btnVoltar.hidden = state.step === 1;
    btnContinuar.textContent = state.step === TOTAL_STEPS ? 'Concluir cadastro' : 'Continuar';
    btnContinuar.insertAdjacentHTML('beforeend', state.step === TOTAL_STEPS
      ? ' <i class="bi bi-check2-circle" aria-hidden="true"></i>'
      : ' <i class="bi bi-arrow-right" aria-hidden="true"></i>');

    if (state.step === 1) renderIdentityStep();
    if (state.step === 2) renderGovStep();
    if (state.step === 3) renderProfileStep();
    if (state.step === 4) renderInfoStep();
    if (state.step === 5) renderReviewStep();

    bindInputs();
  }

  function renderStepList() {
    stepList.innerHTML = stepMeta.map((item, index) => {
      const step = index + 1;
      const status = step === state.step ? 'is-active' : step < state.step ? 'is-done' : '';
      const icon = step < state.step ? '<i class="bi bi-check-lg" aria-hidden="true"></i>' : step;
      return `
        <div class="cadastro-step-item ${status}">
          <div class="cadastro-step-number">${icon}</div>
          <div>
            <strong>${item.title}</strong>
            <span>${item.subtitle}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderIdentityStep() {
    title.textContent = 'Para começar, precisamos confirmar quem você é';
    form.innerHTML = `
      <p class="cadastro-intro">
        Informe seus dados principais. O CPF será usado na próxima etapa para simular a validação com gov.br.
      </p>
      <div class="cadastro-form-grid">
        ${field('nome', 'Nome completo', 'text', 'Ex.: Maria Aparecida da Silva', true, 'cadastro-field-full')}
        ${field('cpf', 'CPF', 'text', '000.000.000-00', true)}
        ${field('nascimento', 'Data de nascimento', 'date', '', true)}
        ${field('email', 'E-mail', 'email', 'seunome@email.com', true)}
        ${field('telefone', 'Telefone', 'tel', '(00) 00000-0000', true)}
      </div>
      <div class="info-soft-card mt-4 d-flex gap-3 align-items-center">
        <i class="bi bi-heart" aria-hidden="true"></i>
        <div>
          <strong>Um passo de cada vez.</strong>
          <p class="mb-0 text-muted">Criamos esse cadastro para ser simples, seguro e fácil de acompanhar.</p>
        </div>
      </div>
    `;
  }

  function renderGovStep() {
    title.textContent = 'Agora vamos validar sua identidade com segurança';
    form.innerHTML = `
      <p class="cadastro-intro">
        Esta etapa simula a confirmação pelo gov.br. No sistema real, o usuário seria direcionado para autenticação oficial.
      </p>
      <div class="gov-card">
        <div class="gov-icon"><i class="bi bi-person-lock" aria-hidden="true"></i></div>
        <div>
          <strong>Validação com gov.br</strong>
          <p>CPF informado: <strong>${state.cpf || 'não informado'}</strong></p>
          <p>Essa validação ajuda a proteger seus dados e evita cadastros incorretos.</p>
        </div>
      </div>
      <div class="d-grid gap-3 mt-4">
        <button class="btn btn-primary btn-lg" type="button" id="btnGov">
          <i class="bi bi-shield-check" aria-hidden="true"></i>
          Validar com gov.br
        </button>
        <button class="btn btn-outline-secondary btn-lg" type="button" id="btnCpfTeste">
          <i class="bi bi-magic" aria-hidden="true"></i>
          Usar validação de teste
        </button>
      </div>
    `;

    setTimeout(() => {
      document.querySelector('#btnGov')?.addEventListener('click', simulateGovValidation);
      document.querySelector('#btnCpfTeste')?.addEventListener('click', simulateGovValidation);
    });
  }

  function renderProfileStep() {
    title.textContent = 'Escolha como você quer usar o Home Care 4.0';
    form.innerHTML = `
      <p class="cadastro-intro">
        Selecione a opção que combina melhor com você. Depois do cadastro, cada perfil terá uma página própria.
      </p>
      <div class="cadastro-profile-grid" role="radiogroup" aria-label="Categoria do usuário">
        ${profileCard('idoso', 'Idoso', 'Quero acompanhar minha saúde, consultas, remédios e serviços.', 'bi-person-heart')}
        ${profileCard('familiar', 'Familiar', 'Quero cuidar e acompanhar uma pessoa próxima com mais segurança.', 'bi-people')}
        ${profileCard('profissional', 'Profissional', 'Quero oferecer serviços de cuidado e atendimento especializado.', 'bi-briefcase')}
      </div>
    `;
  }

  function renderInfoStep() {
    const perfil = state.perfil || 'idoso';
    const configs = {
      idoso: {
        title: 'Conte um pouco sobre suas necessidades',
        fields: `
          ${field('cidade', 'Cidade', 'text', 'Ex.: São Caetano do Sul', true)}
          ${select('necessidade', 'O que você procura primeiro?', ['Consultas', 'Medicamentos', 'Exames', 'Cuidador', 'Acompanhamento geral'], true)}
        `
      },
      familiar: {
        title: 'Cadastre o idoso que você quer acompanhar',
        fields: `
          ${field('cidade', 'Cidade', 'text', 'Ex.: São Caetano do Sul', true)}
          ${field('pessoaCuidada', 'Nome completo do idoso', 'text', 'Ex.: Maria Aparecida da Silva', true, 'cadastro-field-full')}
          ${field('pessoaCuidadaCpf', 'CPF do idoso', 'text', '000.000.000-00', true)}
          ${field('pessoaCuidadaNascimento', 'Data de nascimento do idoso', 'date', '', true)}
          ${select('parentesco', 'Seu vínculo com o idoso', ['Mãe/Pai', 'Avó/Avô', 'Cônjuge', 'Tia/Tio', 'Vizinho autorizado', 'Outro familiar'], true)}
          <div class="cadastro-field-full gov-link-card">
            <div>
              <strong>Vínculo via gov.br</strong>
              <p>O CPF do idoso será vinculado ao familiar por autorização gov.br ou validação assistida no sistema.</p>
            </div>
            <button class="btn btn-outline-primary" type="button" id="btnValidarIdosoGov">
              <i class="bi bi-shield-check" aria-hidden="true"></i>
              Validar vínculo
            </button>
            <span class="gov-link-status ${state.autorizacaoGovbrIdoso ? 'is-valid' : ''}" id="idosoGovStatus">
              ${state.autorizacaoGovbrIdoso ? 'Vínculo validado' : 'Pendente de validação'}
            </span>
          </div>
        `
      },
      profissional: {
        title: 'Informe seus dados profissionais',
        fields: `
          ${field('cidade', 'Cidade de atendimento', 'text', 'Ex.: São Paulo', true)}
          ${select('profissao', 'Profissão', Object.entries(professionalCatalog).map(([value, item]) => ({ value, label: item.label })), true)}
          ${field('conselho', 'Conselho profissional', 'text', 'Ex.: CRM, COREN, CREFITO', true)}
          ${field('conselhoNumero', 'Número do conselho', 'text', 'Ex.: 123456-SP', true)}
          ${field('especialidade', 'Especialidade', 'text', 'Ex.: Enfermagem, Fisioterapia, Psicologia', true, 'cadastro-field-full')}
          <div class="cadastro-field-full council-validation-card">
            <div>
              <strong>Validação do conselho</strong>
              <p>Para acessar os recursos profissionais, o registro precisa estar ativo no conselho informado.</p>
            </div>
            <button class="btn btn-outline-primary" type="button" id="btnValidarConselho">
              <i class="bi bi-shield-check" aria-hidden="true"></i>
              Verificar registro ativo
            </button>
            <span class="gov-link-status ${state.conselhoAtivo ? 'is-valid' : ''}">
              ${state.conselhoAtivo ? 'Registro ativo confirmado' : 'Registro ainda não validado'}
            </span>
          </div>
          <div class="cadastro-field-full">
            <fieldset class="service-check-list">
              <legend>Serviços que pretende prestar</legend>
              ${renderProfessionalServices()}
            </fieldset>
            <p class="form-text mb-0">Selecione no máximo 5 serviços para esta profissão.</p>
          </div>
        `
      }
    };

    title.textContent = configs[perfil].title;
    form.innerHTML = `
      <p class="cadastro-intro">
        Essas informações ajudam a personalizar a experiência inicial e mostrar os serviços mais importantes para você.
      </p>
      <div class="cadastro-form-grid">${configs[perfil].fields}</div>
    `;
  }

  function renderReviewStep() {
    title.textContent = 'Confira seus dados antes de concluir';
    const perfilLabel = { idoso: 'Idoso', familiar: 'Familiar', profissional: 'Profissional' }[state.perfil] || '-';
    form.innerHTML = `
      <p class="cadastro-intro">
        Está tudo certo? Ao concluir, você será direcionado para a página inicial do seu perfil.
      </p>
      <div class="review-list">
        ${review('Nome', state.nome)}
        ${review('CPF', state.cpf)}
        ${review('E-mail', state.email)}
        ${review('Telefone', state.telefone)}
        ${review('Perfil', perfilLabel)}
        ${review('Cidade', state.cidade)}
        ${state.necessidade ? review('Interesse inicial', state.necessidade) : ''}
        ${state.pessoaCuidada ? review('Idoso acompanhado', state.pessoaCuidada) : ''}
        ${state.pessoaCuidadaCpf ? review('CPF do idoso', state.pessoaCuidadaCpf) : ''}
        ${state.parentesco ? review('Vínculo familiar', state.parentesco) : ''}
        ${state.profissao ? review('Profissão', professionalCatalog[state.profissao]?.label || state.profissao) : ''}
        ${state.conselho ? review('Conselho', `${state.conselho} ${state.conselhoNumero || ''}`.trim()) : ''}
        ${state.conselhoAtivo ? review('Status do conselho', 'Registro ativo confirmado') : ''}
        ${state.especialidade ? review('Especialidade', state.especialidade) : ''}
        ${state.servicos?.length ? review('Serviços', state.servicos.join(', ')) : ''}
      </div>
      <div class="info-soft-card mt-4 d-flex gap-3 align-items-center">
        <i class="bi bi-check2-circle" aria-hidden="true"></i>
        <div>
          <strong>Validação concluída.</strong>
          <p class="mb-0 text-muted">Seu CPF foi validado na simulação do fluxo gov.br.</p>
        </div>
      </div>
    `;
  }

  function field(id, label, type, placeholder, required = false, extraClass = '') {
    return `
      <div class="${extraClass}">
        <label class="form-label" for="${id}">${label}</label>
        <input class="form-control" id="${id}" name="${id}" type="${type}" placeholder="${placeholder}" value="${state[id] || ''}" ${required ? 'required' : ''} />
      </div>
    `;
  }

  function select(id, label, options, required = false) {
    const normalizedOptions = options.map(option => {
      if (typeof option === 'string') return { value: option, label: option };
      return option;
    });

    return `
      <div class="cadastro-field-full">
        <label class="form-label" for="${id}">${label}</label>
        <select class="form-select" id="${id}" name="${id}" ${required ? 'required' : ''}>
          <option value="">Selecione uma opção</option>
          ${normalizedOptions.map(option => `<option value="${option.value}" ${state[id] === option.value ? 'selected' : ''}>${option.label}</option>`).join('')}
        </select>
      </div>
    `;
  }

  function profileCard(value, heading, text, icon) {
    const checked = state.perfil === value;
    return `
      <label class="cadastro-profile-option ${checked ? 'is-selected' : ''}">
        <input type="radio" name="perfil" value="${value}" ${checked ? 'checked' : ''} />
        <span class="cadastro-profile-check"><i class="bi bi-check-lg" aria-hidden="true"></i></span>
        <span class="cadastro-profile-icon"><i class="bi ${icon}" aria-hidden="true"></i></span>
        <h3>${heading}</h3>
        <p>${text}</p>
      </label>
    `;
  }

  function serviceCheckbox(service) {
    const checked = Array.isArray(state.servicos) && state.servicos.includes(service);
    return `
      <label class="service-check-option">
        <input type="checkbox" name="servicos" value="${service}" ${checked ? 'checked' : ''} />
        <span><i class="bi bi-check2" aria-hidden="true"></i></span>
        ${service}
      </label>
    `;
  }

  function renderProfessionalServices() {
    if (!state.profissao) {
      return '<p class="text-muted mb-0">Escolha uma profissão para liberar a lista de serviços compatíveis.</p>';
    }

    const services = professionalCatalog[state.profissao]?.services || [];
    return services.map(service => serviceCheckbox(service)).join('');
  }

  function review(label, value) {
    return `<div class="review-item"><span>${label}</span><strong>${value || '-'}</strong></div>`;
  }

  function bindInputs() {
    form.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', event => {
        const target = event.target;
        if (target.name === 'cpf') target.value = maskCPF(target.value);
        if (target.name === 'pessoaCuidadaCpf') target.value = maskCPF(target.value);
        if (target.name === 'telefone') target.value = maskPhone(target.value);
        if (target.name === 'servicos') {
          state.servicos = Array.from(form.querySelectorAll('input[name="servicos"]:checked')).map(input => input.value);
          if (state.servicos.length > 5) {
            target.checked = false;
            state.servicos = Array.from(form.querySelectorAll('input[name="servicos"]:checked')).map(input => input.value);
            showError('Selecione no máximo 5 serviços por profissão.');
          }
        } else {
          state[target.name] = target.value;
        }
        saveState();
      });

      if (input.name === 'perfil') {
        input.addEventListener('change', event => {
          state.perfil = event.target.value;
          state.profissao = '';
          state.conselho = '';
          state.conselhoNumero = '';
          state.conselhoAtivo = false;
          state.servicos = [];
          saveState();
          renderProfileStep();
          bindInputs();
        });
      }

      if (input.name === 'profissao') {
        input.addEventListener('change', event => {
          const profession = professionalCatalog[event.target.value];
          state.profissao = event.target.value;
          state.conselho = profession?.conselho || '';
          state.conselhoAtivo = false;
          state.servicos = [];
          saveState();
          renderInfoStep();
          bindInputs();
        });
      }
    });

    document.querySelector('#btnValidarIdosoGov')?.addEventListener('click', simulateOlderAdultGovLink);
    document.querySelector('#btnValidarConselho')?.addEventListener('click', simulateCouncilValidation);
  }

  function next() {
    collectCurrentForm();
    if (!validateStep()) return;

    if (state.step === TOTAL_STEPS) {
      finish();
      return;
    }

    state.step += 1;
    saveState();
    render();
  }

  function back() {
    if (state.step <= 1) return;
    state.step -= 1;
    saveState();
    render();
  }

  function collectCurrentForm() {
    const data = new FormData(form);
    for (const [key, value] of data.entries()) {
      if (key === 'servicos') continue;
      state[key] = value;
    }
    state.servicos = Array.from(form.querySelectorAll('input[name="servicos"]:checked')).map(input => input.value);
    saveState();
  }

  function validateStep() {
    if (state.step === 1) {
      if (!state.nome || !state.cpf || !state.email || !state.telefone || !state.nascimento) {
        return showError('Preencha todos os campos para continuar.');
      }
      if (!isValidCPF(state.cpf)) {
        return showError('Informe um CPF válido. Para testar, você pode usar 529.982.247-25.');
      }
    }

    if (state.step === 2 && !state.govValidado) {
      return showError('Faça a validação gov.br antes de continuar.');
    }

    if (state.step === 3 && !state.perfil) {
      return showError('Escolha uma categoria para continuar.');
    }

    if (state.step === 4) {
      if (!state.cidade) return showError('Informe sua cidade para continuar.');
      if (state.perfil === 'idoso' && !state.necessidade) return showError('Selecione o que você procura primeiro.');
      if (state.perfil === 'familiar') {
        if (!state.pessoaCuidada || !state.pessoaCuidadaCpf || !state.pessoaCuidadaNascimento || !state.parentesco) {
          return showError('Informe os dados do idoso que você quer acompanhar.');
        }
        if (!isValidCPF(state.pessoaCuidadaCpf)) {
          return showError('Informe um CPF válido para o idoso.');
        }
        if (!state.autorizacaoGovbrIdoso) {
          return showError('Valide o vínculo do idoso pelo gov.br antes de concluir.');
        }
      }
      if (state.perfil === 'profissional') {
        if (!state.profissao || !state.conselho || !state.conselhoNumero || !state.especialidade) {
          return showError('Informe profissão, conselho, número do conselho e especialidade.');
        }
        if (!state.conselhoAtivo) {
          return showError('Valide se o registro está ativo no conselho antes de continuar.');
        }
        if (!state.servicos || state.servicos.length === 0) {
          return showError('Selecione pelo menos um serviço que você pretende prestar.');
        }
        if (state.servicos.length > 5) {
          return showError('Selecione no máximo 5 serviços por profissão.');
        }
      }
    }

    hideFeedback();
    return true;
  }

  function simulateGovValidation() {
    const btn = document.querySelector('#btnGov');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Validando...';
    }

    window.setTimeout(() => {
      state.govValidado = true;
      saveState();
      showSuccess('Identidade validada com sucesso. Agora você pode continuar.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check2-circle" aria-hidden="true"></i> Validação concluída';
      }
    }, 900);
  }

  function simulateOlderAdultGovLink() {
    collectCurrentForm();

    if (!state.pessoaCuidadaCpf || !isValidCPF(state.pessoaCuidadaCpf)) {
      showError('Informe um CPF válido do idoso antes de validar o vínculo.');
      return;
    }

    const btn = document.querySelector('#btnValidarIdosoGov');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Validando vínculo...';
    }

    window.setTimeout(() => {
      state.autorizacaoGovbrIdoso = true;
      saveState();
      showSuccess('Vínculo gov.br do idoso validado com sucesso.');
      renderInfoStep();
      bindInputs();
    }, 800);
  }

  function simulateCouncilValidation() {
    collectCurrentForm();

    if (!state.profissao || !state.conselho || !state.conselhoNumero) {
      showError('Escolha a profissão e informe o número do conselho antes de validar.');
      return;
    }

    const btn = document.querySelector('#btnValidarConselho');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Consultando conselho...';
    }

    window.setTimeout(() => {
      state.conselhoAtivo = true;
      saveState();
      showSuccess('Registro ativo confirmado no conselho profissional.');
      renderInfoStep();
      bindInputs();
    }, 800);
  }

  function finish() {
    const redirectTo = dashboards[state.perfil] || '../idoso/dashboard.html';
    form.innerHTML = `
      <div class="success-state">
        <i class="bi bi-check2-circle" aria-hidden="true"></i>
        <h3 class="text-primary fw-bold">Cadastro concluído!</h3>
        <p>Estamos preparando sua página inicial. Você será direcionado para o perfil escolhido.</p>
        <a class="btn btn-primary btn-lg mt-3" href="${redirectTo}">Ir para minha página</a>
      </div>
    `;
    title.textContent = 'Tudo pronto para começar';
    btnVoltar.hidden = true;
    btnContinuar.hidden = true;
    localStorage.setItem(`${STORAGE_KEY}_finalizado`, JSON.stringify({ ...state, finalizadoEm: new Date().toISOString() }));

    window.setTimeout(() => {
      window.location.href = redirectTo;
    }, 1800);
  }

  function showError(message) {
    feedback.hidden = false;
    feedback.className = 'cadastro-feedback is-error';
    feedback.textContent = message;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return false;
  }

  function showSuccess(message) {
    feedback.hidden = false;
    feedback.className = 'cadastro-feedback is-success';
    feedback.textContent = message;
  }

  function hideFeedback() {
    feedback.hidden = true;
    feedback.className = 'cadastro-feedback';
    feedback.textContent = '';
  }

  function maskCPF(value) {
    return value.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function maskPhone(value) {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  }

  function isValidCPF(cpf) {
    const value = cpf.replace(/\D/g, '');
    if (value.length !== 11 || /^(\d)\1+$/.test(value)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(value.charAt(i)) * (10 - i);
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== Number(value.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += Number(value.charAt(i)) * (11 - i);
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    return digit === Number(value.charAt(10));
  }

  btnContinuar.addEventListener('click', next);
  btnVoltar.addEventListener('click', back);
  render();
})();
