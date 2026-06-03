(function () {
  "use strict";

  function showToast(message) {
    const toast = document.getElementById("appToast");
    const toastMessage = document.getElementById("toastMessage");
    if (!toast || !toastMessage || !window.bootstrap) return;
    toastMessage.textContent = message;
    window.bootstrap.Toast.getOrCreateInstance(toast).show();
  }

  function initNotifications() {
    const search = document.querySelector("[data-notification-search]");
    const category = document.querySelector("[data-notification-category]");
    const status = document.querySelector("[data-notification-status]");
    const clear = document.querySelector("[data-notification-clear]");
    const readAll = document.querySelector("[data-notification-read-all]");
    const empty = document.querySelector("[data-notification-empty]");
    const items = Array.from(document.querySelectorAll("[data-notification-item]"));

    function filter() {
      const term = search ? search.value.trim().toLowerCase() : "";
      const selectedCategory = category ? category.value : "";
      const selectedStatus = status ? status.value : "";
      let visible = 0;

      items.forEach(function (item) {
        const text = (item.dataset.notificationText || item.textContent).toLowerCase();
        const matchesTerm = !term || text.includes(term);
        const matchesCategory = !selectedCategory || item.dataset.notificationCategory === selectedCategory;
        const matchesStatus = !selectedStatus || item.dataset.notificationStatus === selectedStatus;
        const shouldShow = matchesTerm && matchesCategory && matchesStatus;
        item.classList.toggle("d-none", !shouldShow);
        if (shouldShow) visible += 1;
      });

      if (empty) empty.classList.toggle("d-none", visible > 0);
    }

    [search, category, status].forEach(function (control) {
      if (!control) return;
      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", filter);
    });

    if (clear) {
      clear.addEventListener("click", function () {
        if (search) search.value = "";
        if (category) category.value = "";
        if (status) status.value = "";
        filter();
        showToast("Filtros limpos.");
      });
    }

    if (readAll) {
      readAll.addEventListener("click", function () {
        items.forEach(function (item) {
          item.classList.remove("is-unread");
          item.dataset.notificationStatus = "lida";
          const statusBadge = item.querySelector("[data-read-state]");
          if (statusBadge) statusBadge.textContent = "Lida";
        });
        filter();
        showToast("Notificacoes marcadas como lidas.");
      });
    }

    filter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNotifications);
  } else {
    initNotifications();
  }
})();
