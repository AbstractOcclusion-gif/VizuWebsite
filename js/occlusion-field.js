/* ============================================================
   OCCLUSION FIELD — interactive hero background
   Glowing orbs drift in the dark. The cursor acts like a light:
   nearby orbs brighten and are pushed away. Click to pop the
   nearest orb in a burst of sparks. Silent, decorative only.
   Degrades gracefully: if this script doesn't run, the hero
   simply shows its normal background.
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.querySelector(".hero-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // pull the site accent so the field always matches the theme
  var accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#d6ff3f";
  var accentRGB = hexToRgb(accent) || { r: 214, g: 255, b: 63 };
  var palette = [
    accentRGB,
    { r: 235, g: 235, b: 235 },   // near-white
    { r: 120, g: 160, b: 255 }    // cool blue (echoes the page gradient)
  ];

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var orbs = [];
  var sparks = [];
  var mouse = { x: -9999, y: -9999, active: false };

  function hexToRgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return null;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = Math.max(1, Math.floor(W * DPR));
    canvas.height = Math.max(1, Math.floor(H * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildOrbs();
  }

  function buildOrbs() {
    // density scales with area, capped for performance
    var count = Math.round(Math.min(56, Math.max(18, (W * H) / 22000)));
    orbs = [];
    for (var i = 0; i < count; i++) orbs.push(makeOrb());
  }

  function makeOrb(atX, atY) {
    var col = palette[Math.floor(Math.random() * palette.length)];
    return {
      x: atX != null ? atX : rand(0, W),
      y: atY != null ? atY : rand(0, H),
      vx: rand(-0.18, 0.18),
      vy: rand(-0.18, 0.18),
      r: rand(6, 22),
      base: rand(0.10, 0.30),  // base glow alpha
      glow: 0,                 // extra glow from cursor proximity
      col: col
    };
  }

  function spawnBurst(x, y, col) {
    var n = 14;
    for (var i = 0; i < n; i++) {
      var a = (Math.PI * 2 * i) / n + rand(-0.2, 0.2);
      var sp = rand(1.5, 4.5);
      sparks.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, r: rand(1.5, 3.5), col: col });
    }
  }

  function popNearest(x, y) {
    var best = -1, bestD = 60 * 60; // only pop within ~60px
    for (var i = 0; i < orbs.length; i++) {
      var dx = orbs[i].x - x, dy = orbs[i].y - y;
      var d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = i; }
    }
    if (best >= 0) {
      var o = orbs[best];
      spawnBurst(o.x, o.y, o.col);
      orbs.splice(best, 1);
      // respawn elsewhere after a beat to keep the field populated
      setTimeout(function () { if (orbs.length < 60) orbs.push(makeOrb()); }, 600);
    }
  }

  function step() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter"; // additive glow

    var mr = 150; // cursor influence radius
    for (var i = 0; i < orbs.length; i++) {
      var o = orbs[i];

      if (!reduce) {
        o.x += o.vx; o.y += o.vy;
        // gentle wrap around edges
        if (o.x < -30) o.x = W + 30; else if (o.x > W + 30) o.x = -30;
        if (o.y < -30) o.y = H + 30; else if (o.y > H + 30) o.y = -30;
      }

      // cursor interaction: light + push
      var target = 0;
      if (mouse.active) {
        var dx = o.x - mouse.x, dy = o.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mr) {
          var f = (mr - dist) / mr;        // 0..1
          target = f * 0.55;
          if (!reduce && dist > 0.01) {
            o.x += (dx / dist) * f * 1.4;   // push away
            o.y += (dy / dist) * f * 1.4;
          }
        }
      }
      o.glow += (target - o.glow) * 0.08;   // smooth

      var alpha = Math.min(0.85, o.base + o.glow);
      var rad = o.r * (1 + o.glow * 0.8);
      var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, rad);
      var c = o.col;
      g.addColorStop(0, "rgba(" + c.r + "," + c.g + "," + c.b + "," + alpha + ")");
      g.addColorStop(1, "rgba(" + c.r + "," + c.g + "," + c.b + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.x, o.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // sparks from pops
    for (var j = sparks.length - 1; j >= 0; j--) {
      var s = sparks[j];
      s.x += s.vx; s.y += s.vy;
      s.vx *= 0.94; s.vy *= 0.94;
      s.life -= 0.03;
      if (s.life <= 0) { sparks.splice(j, 1); continue; }
      var sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
      sg.addColorStop(0, "rgba(" + s.col.r + "," + s.col.g + "," + s.col.b + "," + s.life + ")");
      sg.addColorStop(1, "rgba(" + s.col.r + "," + s.col.g + "," + s.col.b + ",0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(step);
  }

  // --- input (listened on window; canvas is pointer-events:none so the UI keeps working) ---
  function toLocal(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, inside: e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= rect.left && e.clientX <= rect.right };
  }
  window.addEventListener("mousemove", function (e) {
    var p = toLocal(e);
    mouse.x = p.x; mouse.y = p.y; mouse.active = p.inside;
  }, { passive: true });
  window.addEventListener("mouseout", function () { mouse.active = false; });
  window.addEventListener("click", function (e) {
    var p = toLocal(e);
    if (p.inside) popNearest(p.x, p.y);
  }, { passive: true });

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(step);
})();
