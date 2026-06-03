(function () {
  "use strict";

  function showToast(message) {
    const toast = document.getElementById("appToast");
    const toastMessage = document.getElementById("toastMessage");

    if (!toast || !toastMessage || !window.bootstrap) {
      return;
    }

    toastMessage.textContent = message;
    window.bootstrap.Toast.getOrCreateInstance(toast).show();
  }

  function safe(value, fallback) {
    return value || fallback || "";
  }

  function renderProfile(button) {
    const profile = document.querySelector("[data-contact-profile]");
    const profileButton = document.querySelector("[data-view-profile]");

    if (profile) {
      profile.innerHTML =
        '<span class="hc-contact-avatar" aria-hidden="true">' + safe(button.dataset.conversationAvatar, "HC") + "</span>" +
        "<div>" +
          "<h3>" + safe(button.dataset.conversationTitle, "Contato") + "</h3>" +
          '<p class="text-muted mb-0">' + safe(button.dataset.conversationProfile, "Contato da plataforma") + "</p>" +
          '<div class="hc-contact-tags">' +
            "<span>" + safe(button.dataset.conversationType, "Contato") + "</span>" +
            "<span>" + safe(button.dataset.conversationBond, "Vinculo ativo") + "</span>" +
            "<span>" + safe(button.dataset.conversationStatus, "Disponivel") + "</span>" +
          "</div>" +
        "</div>";
    }

    if (profileButton) {
      profileButton.setAttribute("href", safe(button.dataset.conversationProfileUrl, "#"));
    }
  }

  function initMessagesPage() {
    const searchInput = document.querySelector("[data-message-search]");
    const conversationButtons = Array.from(document.querySelectorAll("[data-conversation]"));
    const title = document.querySelector("[data-chat-title]");
    const subtitle = document.querySelector("[data-chat-subtitle]");
    const thread = document.querySelector("[data-chat-thread]");
    const form = document.querySelector("[data-message-form]");
    const field = document.querySelector("[data-message-field]");
    const callButton = document.querySelector("[data-call-contact]");
    const favoriteButton = document.querySelector("[data-favorite-contact]");
    const deleteButton = document.querySelector("[data-delete-conversation]");
    const blockButton = document.querySelector("[data-block-contact]");
    const chatPanel = document.querySelector("[data-chat-panel]");
    let activeConversation = null;

    if (!thread || !conversationButtons.length) {
      return;
    }

    function setActiveConversation(button) {
      activeConversation = button;

      conversationButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });

      if (title) {
        title.textContent = safe(button.dataset.conversationTitle, "Conversa");
      }

      if (subtitle) {
        subtitle.textContent = safe(button.dataset.conversationSubtitle, "Atualizado agora");
      }

      renderProfile(button);

      if (favoriteButton) {
        favoriteButton.classList.toggle("is-favorite", button.classList.contains("is-favorite"));
      }

      if (chatPanel) {
        chatPanel.classList.toggle("is-blocked", button.classList.contains("is-blocked"));
      }

      const messages = safe(button.dataset.conversationMessages, "").split("|").filter(Boolean);
      thread.innerHTML = messages.map(function (message, index) {
        const isMine = index % 2 === 1;
        return '<div class="hc-message-bubble' + (isMine ? " is-mine" : "") + '">' +
          "<strong>" + (isMine ? "Voce" : safe(button.dataset.conversationTitle, "Contato")) + ":</strong> " +
          message +
          '<span class="hc-message-meta">' + (index === messages.length - 1 ? "Atualizado agora" : "Historico da conversa") + "</span>" +
          "</div>";
      }).join("");

      thread.scrollTop = thread.scrollHeight;
      showToast("Conversa aberta.");
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        const term = searchInput.value.trim().toLowerCase();

        conversationButtons.forEach(function (button) {
          const searchText = safe(button.dataset.conversationSearch, button.textContent).toLowerCase();
          button.classList.toggle("d-none", Boolean(term) && !searchText.includes(term));
        });
      });
    }

    conversationButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setActiveConversation(button);
      });
    });

    if (form && field) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const text = field.value.trim();

        if (!text) {
          showToast("Digite uma mensagem antes de enviar.");
          return;
        }

        const bubble = document.createElement("div");
        bubble.className = "hc-message-bubble is-mine";
        bubble.innerHTML = "<strong>Voce:</strong> " + text + '<span class="hc-message-meta">Enviada agora</span>';
        thread.appendChild(bubble);
        field.value = "";
        thread.scrollTop = thread.scrollHeight;
        showToast("Mensagem enviada.");
      });
    }

    if (callButton) {
      callButton.addEventListener("click", function () {
        showToast("Solicitacao de ligacao registrada no demonstrativo.");
      });
    }

    if (favoriteButton) {
      favoriteButton.addEventListener("click", function () {
        if (!activeConversation) return;
        activeConversation.classList.toggle("is-favorite");
        favoriteButton.classList.toggle("is-favorite", activeConversation.classList.contains("is-favorite"));
        showToast(activeConversation.classList.contains("is-favorite") ? "Contato favoritado." : "Favorito removido.");
      });
    }

    if (deleteButton) {
      deleteButton.addEventListener("click", function () {
        if (!activeConversation) return;
        activeConversation.classList.add("d-none");
        showToast("Conversa removida da lista.");
      });
    }

    if (blockButton) {
      blockButton.addEventListener("click", function () {
        if (!activeConversation) return;
        activeConversation.classList.toggle("is-blocked");
        if (chatPanel) {
          chatPanel.classList.toggle("is-blocked", activeConversation.classList.contains("is-blocked"));
        }
        showToast(activeConversation.classList.contains("is-blocked") ? "Usuario bloqueado no demonstrativo." : "Bloqueio removido.");
      });
    }

    setActiveConversation(conversationButtons[0]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMessagesPage);
  } else {
    initMessagesPage();
  }
})();
