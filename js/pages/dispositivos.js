(function () {
  "use strict";

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function updateMetric(metric) {
    var type = metric.dataset.deviceMetric;
    var unit = metric.dataset.deviceUnit || "";
    var value = metric.dataset.deviceValue || "";

    if (type === "heart") value = randomBetween(68, 96);
    if (type === "oxygen") value = randomBetween(94, 99);
    if (type === "temperature") value = (36 + Math.random() * 1.6).toFixed(1).replace(".", ",");
    if (type === "glucose") value = randomBetween(88, 132);
    if (type === "pressure") value = randomBetween(11, 14) + "/" + randomBetween(7, 9);
    if (type === "steps") value = randomBetween(2100, 4800).toLocaleString("pt-BR");
    if (type === "weight") value = (70 + Math.random() * 2).toFixed(1).replace(".", ",");
    if (type === "sleep") value = randomBetween(76, 94);

    metric.textContent = value + unit;
  }

  function updateSyncTime() {
    document.querySelectorAll("[data-device-sync]").forEach(function (element) {
      element.textContent = "Sincronizado agora";
    });
  }

  function updateChart() {
    document.querySelectorAll("[data-device-bar]").forEach(function (bar) {
      var value = randomBetween(42, 96);
      bar.style.height = value + "%";
      var label = bar.querySelector("span");
      if (label) label.textContent = value;
    });
  }

  function pulseAlerts() {
    document.querySelectorAll("[data-device-live-alert]").forEach(function (alert) {
      alert.classList.toggle("shadow-sm");
    });
  }

  function tick() {
    document.querySelectorAll("[data-device-metric]").forEach(updateMetric);
    updateSyncTime();
    updateChart();
    pulseAlerts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick);
  } else {
    tick();
  }

  window.setInterval(tick, 4500);
})();
