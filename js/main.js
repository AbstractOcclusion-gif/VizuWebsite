/* ABSTRACTOCCLUSION — interactions: nav, filtering, reveal */
(function () {
  "use strict";

  /* ---- mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* ---- generic filter (projects + snippets) ----
     buttons: [data-filter] container, .filter[data-lang]
     items:   [data-langs="python,c++"] (comma list, lowercase) */
  document.querySelectorAll("[data-filter]").forEach(function (bar) {
    var targetSel = bar.getAttribute("data-target");
    var items = Array.prototype.slice.call(document.querySelectorAll(targetSel));
    var btns = Array.prototype.slice.call(bar.querySelectorAll(".filter"));

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var lang = (btn.getAttribute("data-lang") || "all").toLowerCase();
        items.forEach(function (it) {
          var langs = (it.getAttribute("data-langs") || "").toLowerCase();
          var show = lang === "all" || langs.split(",").map(function (s) { return s.trim(); }).indexOf(lang) !== -1;
          it.classList.toggle("hide", !show);
        });
      });
    });
  });

  /* ---- reveal on scroll ---- */
  var revs = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revs.length) {
    // opt in to the entrance animation only now that this script is running
    document.documentElement.classList.add("anim");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revs.forEach(function (el) { io.observe(el); });
  } else {
    revs.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- year ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
