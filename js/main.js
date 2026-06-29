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

  /* ---- ambient music player (auto-built on every page) ---- */
  (function ambient() {
    var inProj = location.pathname.replace(/\\/g, "/").indexOf("/projects/") !== -1;
    var base = inProj ? "../" : "";
    var SRC = base + "Nomyn%20-%20Flow.mp3";
    var KEY = "ao_music";
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
    var autoStart = saved.on !== false; // default ON unless the user explicitly paused

    var audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = typeof saved.vol === "number" ? saved.vol : 0.45;
    if (typeof saved.time === "number") { try { audio.currentTime = saved.time; } catch (e) {} }

    var box = document.createElement("div");
    box.className = "ambient-player";
    box.setAttribute("data-state", "paused");

    var btn = document.createElement("button");
    btn.className = "ap-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "Play music");
    btn.textContent = "▶"; // ▶

    var label = document.createElement("span");
    label.className = "ap-label";
    label.textContent = "Nomyn — Flow";

    var vol = document.createElement("input");
    vol.className = "ap-vol";
    vol.type = "range"; vol.min = "0"; vol.max = "1"; vol.step = "0.01";
    vol.value = String(audio.volume);
    vol.setAttribute("aria-label", "Music volume");

    box.appendChild(btn);
    box.appendChild(label);
    box.appendChild(vol);
    document.body.appendChild(box);

    function persist() {
      try {
        localStorage.setItem(KEY, JSON.stringify({ vol: audio.volume, on: !audio.paused, time: audio.currentTime }));
      } catch (e) {}
    }
    function setState(playing) {
      box.setAttribute("data-state", playing ? "playing" : "paused");
      btn.textContent = playing ? "❚❚" : "▶"; // ❚❚ / ▶
      btn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    }
    function play() { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }

    btn.addEventListener("click", function () {
      if (audio.paused) { autoStart = true; play(); }
      else { autoStart = false; audio.pause(); }
    });
    audio.addEventListener("play", function () { setState(true); persist(); });
    audio.addEventListener("pause", function () { setState(false); persist(); });
    vol.addEventListener("input", function () { audio.volume = parseFloat(vol.value); persist(); });
    audio.addEventListener("timeupdate", (function () {
      var last = 0;
      return function () { var n = Date.now(); if (n - last > 3000) { last = n; persist(); } };
    })());
    window.addEventListener("pagehide", persist);
    window.addEventListener("beforeunload", persist);

    // Autoplay: try immediately, and otherwise start on the very first user
    // gesture (browsers block sound-on autoplay until the page is interacted with).
    setState(false);
    if (autoStart) {
      play();
      var kickEvents = ["pointerdown", "keydown", "scroll", "wheel", "touchstart", "mousemove"];
      var kick = function () { if (autoStart && audio.paused) play(); };
      var unkick = function () { kickEvents.forEach(function (ev) { document.removeEventListener(ev, kick); }); };
      kickEvents.forEach(function (ev) { document.addEventListener(ev, kick, { passive: true }); });
      audio.addEventListener("play", unkick);
    }
  })();

  /* ---- year ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
