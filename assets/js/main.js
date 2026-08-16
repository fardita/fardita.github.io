(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- mobile nav toggle ---- */
  var menuToggle = document.getElementById("menuToggle");
  var tabs = document.querySelector(".tabs");
  if (menuToggle && tabs) {
    menuToggle.addEventListener("click", function () {
      var isOpen = tabs.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    tabs.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        tabs.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- scroll reveal ---- */
  var revealTargets = document.querySelectorAll(".section, .hero");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- hero terminal typing effect ---- */
  var termEl = document.getElementById("termLines");
  var neofetchBlock = document.getElementById("neofetchBlock");
  var termFinal = document.getElementById("termFinal");
  var script = [
    { type: "prompt", text: "spark-shell --conf spark.ui.port=4040" },
    { type: "out", text: "Welcome to Apache Spark (v3.5.1) / Databricks Runtime" },
    { type: "out", text: "Using Scala version 2.12.18" },
    { type: "prompt", text: "spark.version" },
    { type: "out", text: "res0: String = 3.5.1" },
    { type: "prompt", text: "neofetch" }
  ];
  var FINAL_CURSOR = '<span class="prompt-line">francesco@fardita:~$ <span class="caret"></span></span>';

  function renderStatic() {
    var html = "";
    script.forEach(function (line) {
      if (line.type === "prompt") {
        html += '<span class="prompt-line">francesco@fardita:~$ ' + line.text + "</span>\n";
      } else {
        html += '<span class="out-line">' + line.text + "</span>\n";
      }
    });
    termEl.innerHTML = html;
    if (neofetchBlock) neofetchBlock.classList.add("show");
    if (termFinal) termFinal.innerHTML = FINAL_CURSOR;
  }

  if (!termEl) return;

  if (reduceMotion) {
    renderStatic();
    return;
  }

  var lineIndex = 0;
  var charIndex = 0;
  var doneHTML = "";

  function typeNext() {
    if (lineIndex >= script.length) {
      termEl.innerHTML = doneHTML;
      if (neofetchBlock) neofetchBlock.classList.add("show");
      setTimeout(function () {
        if (termFinal) termFinal.innerHTML = FINAL_CURSOR;
      }, 300);
      return;
    }

    var line = script[lineIndex];
    var prefix = line.type === "prompt" ? "francesco@fardita:~$ " : "";
    var full = prefix + line.text;
    var cls = line.type === "prompt" ? "prompt-line" : "out-line";

    if (charIndex <= full.length) {
      var typedPart = full.slice(0, charIndex);
      termEl.innerHTML =
        doneHTML +
        '<span class="' + cls + '">' + typedPart + '<span class="caret"></span></span>';
      charIndex++;
      var speed = line.type === "prompt" ? 42 : 14;
      setTimeout(typeNext, speed);
    } else {
      doneHTML += '<span class="' + cls + '">' + full + "</span>\n";
      lineIndex++;
      charIndex = 0;
      setTimeout(typeNext, line.type === "prompt" ? 260 : 160);
    }
  }

  typeNext();

  /* ---- subtle data-flow background canvas ---- */
  var canvas = document.getElementById("bg-canvas");
  if (!canvas || reduceMotion) return;

  var ctx = canvas.getContext("2d");
  var particles = [];
  var PARTICLE_COUNT = window.innerWidth < 700 ? 26 : 50;
  var w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function makeParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.6
    };
  }
  for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(makeParticle());

  var LINK_DIST = 130;

  function tick() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });

    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = "rgba(226, 90, 28, " + (0.12 * (1 - dist / LINK_DIST)) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(function (p) {
      ctx.fillStyle = "rgba(226, 90, 28, 0.5)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
