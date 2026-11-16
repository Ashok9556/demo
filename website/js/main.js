// Scenfic Medical Centre – interactions
(function () {
  "use strict";

  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("menuToggle");
  const backToTop = document.getElementById("backToTop");

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Mobile menu
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  // Header shadow + back-to-top
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 10);
    backToTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Active nav link on scroll
  const links = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = links
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((l) =>
              l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  // Animated counters
  const counters = document.querySelectorAll(".stat-num");
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            co.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count));
  }

  // Appointment form
  const form = document.getElementById("appointmentForm");
  const status = document.getElementById("formStatus");
  const dateInput = document.getElementById("apptDate");
  const doctorSelect = document.getElementById("doctorSelect");

  // Earliest selectable date = today
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().split("T")[0];

  // Pre-select doctor from "Book" buttons
  document.querySelectorAll("[data-doctor]").forEach((btn) =>
    btn.addEventListener("click", () => {
      doctorSelect.value = btn.dataset.doctor;
    })
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      const ok = field.checkValidity();
      field.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });
    const email = form.elements.email;
    if (email.value && !email.checkValidity()) {
      email.classList.add("invalid");
      valid = false;
    }

    if (!valid) {
      status.classList.add("error");
      status.textContent = "Please fill in the highlighted fields correctly.";
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Sending…";

    // Static-site placeholder: replace with a real endpoint (e.g. appointment.php) when ready.
    setTimeout(() => {
      status.classList.add("success");
      status.textContent = `Thank you, ${data.name.split(" ")[0]}! We'll call you shortly to confirm your appointment.`;
      form.reset();
      btn.disabled = false;
      btn.textContent = "Request Appointment";
    }, 900);
  });

  // Gallery filters
  const items = [...document.querySelectorAll(".g-item")];
  document.querySelectorAll(".gf-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".gf-btn").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      const f = btn.dataset.filter;
      items.forEach((it) => it.classList.toggle("hide", f !== "all" && it.dataset.cat !== f));
    })
  );

  // Lightbox
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCaption = document.getElementById("lbCaption");
  let current = 0;
  let lastFocus = null;
  const visibleItems = () => items.filter((it) => !it.classList.contains("hide"));
  const show = (idx) => {
    const list = visibleItems();
    current = (idx + list.length) % list.length;
    const img = list[current].querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = list[current].querySelector("figcaption").textContent;
  };
  const openLb = (item) => {
    lastFocus = item;
    show(visibleItems().indexOf(item));
    lb.hidden = false;
    document.body.classList.add("no-scroll");
    document.getElementById("lbClose").focus();
  };
  const closeLb = () => {
    lb.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  };
  items.forEach((it) => {
    it.tabIndex = 0;
    it.setAttribute("role", "button");
    it.setAttribute("aria-label", "View larger: " + it.querySelector("figcaption").textContent);
    it.addEventListener("click", () => openLb(it));
    it.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(it); }
    });
  });
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", () => show(current - 1));
  document.getElementById("lbNext").addEventListener("click", () => show(current + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  form.addEventListener("input", (e) => {
    if (e.target.classList.contains("invalid") && e.target.checkValidity()) {
      e.target.classList.remove("invalid");
    }
  });
})();
