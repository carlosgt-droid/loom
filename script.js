/* ===== Loom — interactions ===== */
(function () {
  "use strict";

  /* Current year */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* Nav: shadow on scroll + scroll progress bar */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("scrollProgress");
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("is-scrolled", y > 10);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = h > 0 ? (y / h) * 100 + "%" : "0%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const toggle = document.getElementById("navToggle");
  const mobile = document.getElementById("navMobile");
  toggle.addEventListener("click", function () {
    const open = mobile.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  mobile.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      mobile.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* Reveal on scroll */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Animated counters */
  const counters = document.querySelectorAll(".stat__num[data-count]");
  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffixEl = el.parentElement.querySelector(".stat__suffix");
    const suffix = suffixEl ? suffixEl.textContent : "";
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ===== Multi-step wizard ===== */
  const form = document.getElementById("wizard");
  const steps = Array.prototype.slice.call(form.querySelectorAll(".wizard__step"));
  const bar = document.getElementById("wizardBar");
  const count = document.getElementById("wizardCount");
  const backBtn = document.getElementById("wizardBack");
  const nextBtn = document.getElementById("wizardNext");
  const submitBtn = document.getElementById("wizardSubmit");
  const done = document.getElementById("wizardDone");
  const total = steps.length;
  let current = 0;

  function showStep(i) {
    steps.forEach(function (s, idx) { s.classList.toggle("is-active", idx === i); });
    bar.style.width = ((i + 1) / total) * 100 + "%";
    count.textContent = "Step " + (i + 1) + " of " + total;
    backBtn.hidden = i === 0;
    nextBtn.hidden = i === total - 1;
    submitBtn.hidden = i !== total - 1;
    const firstField = steps[i].querySelector("input, textarea, select");
    if (firstField) firstField.focus({ preventScroll: true });
  }

  function clearError(name) {
    const el = form.querySelector('[data-error="' + name + '"]');
    if (el) el.textContent = "";
  }
  function setError(name, msg) {
    const el = form.querySelector('[data-error="' + name + '"]');
    if (el) el.textContent = msg;
  }

  function validateStep(i) {
    let ok = true;
    const stepEl = steps[i];

    // Radio group (step 1)
    const radio = stepEl.querySelector('input[type="radio"][required]');
    if (radio) {
      const checked = stepEl.querySelector('input[name="type"]:checked');
      if (!checked) { setError("type", "Please pick an option to continue."); ok = false; }
      else clearError("type");
    }

    // Required text/email fields
    stepEl.querySelectorAll("input[required]").forEach(function (field) {
      if (field.type === "radio") return;
      const val = field.value.trim();
      if (!val) { setError(field.name, "This field is required."); ok = false; }
      else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setError(field.name, "Please enter a valid email address."); ok = false;
      } else { clearError(field.name); }
    });

    return ok;
  }

  // Clear errors as the user corrects input
  form.addEventListener("input", function (e) {
    if (e.target.name) clearError(e.target.name);
  });

  nextBtn.addEventListener("click", function () {
    if (!validateStep(current)) return;
    if (current < total - 1) { current++; showStep(current); }
  });
  backBtn.addEventListener("click", function () {
    if (current > 0) { current--; showStep(current); }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep(current)) return;

    const data = Object.fromEntries(new FormData(form).entries());
    // No backend in this environment — persist locally so nothing is lost.
    try {
      const saved = JSON.parse(localStorage.getItem("loom_requests") || "[]");
      saved.push(Object.assign({ submittedAt: new Date().toISOString() }, data));
      localStorage.setItem("loom_requests", JSON.stringify(saved));
    } catch (err) { /* storage may be unavailable; ignore */ }

    document.getElementById("doneName").textContent = (data.name || "friend").split(" ")[0];
    steps.forEach(function (s) { s.classList.remove("is-active"); });
    form.querySelector(".wizard__nav").style.display = "none";
    bar.style.width = "100%";
    count.textContent = "Done";
    done.hidden = false;
  });

  document.getElementById("wizardReset").addEventListener("click", function () {
    form.reset();
    done.hidden = true;
    form.querySelector(".wizard__nav").style.display = "flex";
    current = 0;
    showStep(0);
    form.querySelectorAll(".field__error").forEach(function (el) { el.textContent = ""; });
  });

  showStep(0);
})();
