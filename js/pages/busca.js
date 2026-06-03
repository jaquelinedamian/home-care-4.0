(function () {
  "use strict";

  function initSearchPage() {
    const params = new URLSearchParams(window.location.search);
    const input = document.querySelector("[data-search-input]");
    const empty = document.querySelector("[data-search-empty]");
    const results = Array.from(document.querySelectorAll("[data-search-result]"));

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function filter() {
      const term = input ? input.value.trim().toLowerCase() : "";
      let visible = 0;

      results.forEach(function (result) {
        const text = (result.dataset.searchText || result.textContent).toLowerCase();
        const show = !term || text.includes(term);
        result.classList.toggle("d-none", !show);
        if (show) visible += 1;
      });

      if (empty) empty.classList.toggle("d-none", visible > 0);
    }

    if (input) input.addEventListener("input", filter);
    filter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearchPage);
  } else {
    initSearchPage();
  }
})();
