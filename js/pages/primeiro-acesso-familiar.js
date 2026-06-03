(function () {
  'use strict';

  const storageKey = 'homecare_familiar_primeiro_acesso_steps';
  const steps = Array.from(document.querySelectorAll('[data-step]'));
  const progressBar = document.getElementById('progressBar');
  const progressPercent = document.getElementById('progressPercent');
  const progressText = document.getElementById('progressText');
  const resetButton = document.getElementById('resetSteps');

  function getSavedSteps() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveSteps(completed) {
    localStorage.setItem(storageKey, JSON.stringify(completed));
  }

  function updateProgress() {
    const completed = getSavedSteps();
    const total = steps.length || 1;
    const percent = Math.round((completed.length / total) * 100);

    steps.forEach(function (step) {
      const stepNumber = step.getAttribute('data-step');
      step.classList.toggle('is-complete', completed.includes(stepNumber));
    });

    if (progressBar) {
      progressBar.style.width = percent + '%';
      progressBar.setAttribute('aria-valuenow', String(percent));
    }

    if (progressPercent) {
      progressPercent.textContent = percent + '%';
    }

    if (progressText) {
      if (percent === 0) {
        progressText.textContent = 'Complete os passos abaixo para liberar uma visão familiar mais organizada.';
      } else if (percent < 100) {
        progressText.textContent = completed.length + ' de ' + total + ' passos concluídos. Continue aos poucos, sem pressa.';
      } else {
        progressText.textContent = 'Tudo pronto. Seu painel familiar já pode ser usado com mais segurança.';
      }
    }
  }

  steps.forEach(function (step) {
    const button = step.querySelector('.hc-step-check');

    if (!button) {
      return;
    }

    button.addEventListener('click', function () {
      const stepNumber = step.getAttribute('data-step');
      const completed = getSavedSteps();
      const alreadyCompleted = completed.includes(stepNumber);
      const updated = alreadyCompleted
        ? completed.filter(function (item) { return item !== stepNumber; })
        : completed.concat(stepNumber);

      saveSteps(updated);
      updateProgress();
    });
  });

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      localStorage.removeItem(storageKey);
      updateProgress();
    });
  }

  updateProgress();
})();
