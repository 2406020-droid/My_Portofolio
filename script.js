/* ========================================
   NAVIGASI
======================================== */

const navbar = document.getElementById("navbar");
const navMenu = document.getElementById("navMenu");
const navToggle = document.getElementById("navToggle");
const scrollProgress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");

const navLinks = Array.from(document.querySelectorAll(".nav-link"));

const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function scrollBehavior() {
  return reduceMotion.matches ? "auto" : "smooth";
}

function getNavbarHeight() {
  return navbar ? navbar.offsetHeight : 0;
}

/* Jarak aman dari navbar saat berpindah section */
const SCROLL_GAP = 10;

let activeId = "home";

/* Menandai menu yang sedang aktif */
function setActive(id) {
  activeId = id;

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

/* Menggulir ke section dengan memperhitungkan tinggi navbar */
function scrollToSection(id, smooth = true) {
  const target = document.getElementById(id);

  if (!target) return;

  const targetPosition =
    target.getBoundingClientRect().top + window.scrollY - getNavbarHeight() - SCROLL_GAP;

  window.scrollTo({
    top: Math.max(targetPosition, 0),
    behavior: smooth ? scrollBehavior() : "instant",
  });
}

/* Memperbarui hash URL tanpa memicu lompatan */
function setHash(hash) {
  if (!history.replaceState) return;

  try {
    history.replaceState(null, "", hash);
  } catch (error) {
    /* Diabaikan: beberapa browser membatasi perubahan URL */
  }
}

/* ========================================
   MENU MOBILE
======================================== */

function openMenu() {
  if (!navMenu || !navToggle) return;

  navMenu.classList.add("open");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Tutup menu navigasi");
}

function closeMenu() {
  if (!navMenu || !navToggle) return;

  navMenu.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Buka menu navigasi");
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    if (navMenu.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

/* Tutup menu saat klik di luar area menu */
document.addEventListener("click", (event) => {
  if (!navMenu || !navMenu.classList.contains("open")) return;

  const insideMenu = navMenu.contains(event.target);
  const insideToggle = navToggle && navToggle.contains(event.target);

  if (!insideMenu && !insideToggle) closeMenu();
});

/* Tutup menu dengan tombol Escape */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

/* Tutup menu saat layar kembali ke ukuran desktop */
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) closeMenu();
});

/* ========================================
   SMOOTH SCROLL SEMUA LINK INTERNAL
======================================== */

let scrollLockedTo = null;
let lockTimer = null;

function lockTo(id) {
  scrollLockedTo = id;

  window.clearTimeout(lockTimer);

  lockTimer = window.setTimeout(() => {
    scrollLockedTo = null;
    updateActiveLink();
  }, 1000);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    /* Link yang belum punya tujuan tidak perlu melompat ke atas */
    if (!href || href === "#") {
      event.preventDefault();
      return;
    }

    const id = href.slice(1);
    const target = document.getElementById(id);

    if (!target) return;

    event.preventDefault();

    closeMenu();
    setActive(id);
    lockTo(id);

    scrollToSection(id);

    setHash(href);
  });
});

/* ========================================
   MENU AKTIF SAAT SCROLL
======================================== */

function updateActiveLink() {
  if (scrollLockedTo) return;

  const offset = getNavbarHeight() + 40;
  const scrollPosition = window.scrollY;

  let current = sections.length ? sections[0].id : "home";

  sections.forEach((section) => {
    if (section.offsetTop - offset <= scrollPosition) {
      current = section.id;
    }
  });

  /* Saat sudah di dasar halaman, aktifkan menu terakhir */
  const atBottom =
    window.innerHeight + scrollPosition >=
    document.documentElement.scrollHeight - 2;

  if (atBottom && sections.length) {
    current = sections[sections.length - 1].id;
  }

  if (current !== activeId) setActive(current);
}

/* ========================================
   NAVBAR, PROGRES SCROLL, TOMBOL ATAS
======================================== */

const revealElements = Array.from(
  document.querySelectorAll(".reveal, .reveal-left, .reveal-right"),
);

let ticking = false;

function updatePageState() {
  const scrollPosition = window.scrollY;

  /* Navbar lebih tegas setelah di-scroll */
  if (navbar) {
    navbar.classList.toggle("scrolled", scrollPosition > 50);
  }

  /* Indikator progres scroll */
  if (scrollProgress) {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress = maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0;

    scrollProgress.style.width = `${progress}%`;
  }

  /* Tombol kembali ke atas */
  if (backToTop) {
    backToTop.classList.toggle("show", scrollPosition > 500);
  }

  /* Tampilkan elemen yang sudah terlewati (misal setelah reload) */
  revealElements.forEach((element) => {
    if (
      !element.classList.contains("show") &&
      element.getBoundingClientRect().bottom < 0
    ) {
      element.classList.add("show");
    }
  });

  /* Lepas kunci scroll saat posisi tujuan sudah tercapai */
  if (scrollLockedTo) {
    const target = document.getElementById(scrollLockedTo);

    if (!target) {
      scrollLockedTo = null;
    } else {
      const targetPosition = Math.max(
        target.getBoundingClientRect().top +
          scrollPosition -
          getNavbarHeight() -
          SCROLL_GAP,
        0,
      );

      if (Math.abs(scrollPosition - targetPosition) < 4) {
        scrollLockedTo = null;
      }
    }
  }

  updateActiveLink();

  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(updatePageState);
  },
  { passive: true },
);

/* ========================================
   TOMBOL KEMBALI KE ATAS
======================================== */

if (backToTop) {
  backToTop.addEventListener("click", () => {
    setActive("home");
    scrollLockedTo = null;

    window.scrollTo({
      top: 0,
      behavior: scrollBehavior(),
    });

    setHash("#home");
  });
}

/* ========================================
   ANIMASI SECTION
======================================== */

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -60px 0px",
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("show");
  });
}

/* ========================================
   SAAT HALAMAN DIBUKA
======================================== */

function handleInitialLoad() {
  /* Jika URL memiliki #section, posisikan dengan benar di bawah navbar */
  if (window.location.hash.length > 1) {
    const id = window.location.hash.slice(1);

    if (document.getElementById(id)) {
      setActive(id);

      window.requestAnimationFrame(() => {
        scrollToSection(id, false);
        updatePageState();
      });

      return;
    }
  }

  setActive("home");
  updatePageState();
}

window.addEventListener("load", handleInitialLoad);

/* ========================================
   LATAR BELAKANG INTERAKTIF
   (mengikuti gerakan kursor)
======================================== */

const bgCanvas = document.getElementById("bgCanvas");

if (bgCanvas && !reduceMotion.matches) {
  const ctx = bgCanvas.getContext("2d");

  /* ---- Data dunia latar belakang ---- */

  /** Titik-titik yang melayang di latar */
  const particles = [];

  /** Garis koneksi antar titik */
  let particlesConnected = [];

  /** Gelombang / lingkaran yang muncul saat kursor digerakkan */
  const ripples = [];

  const CURSOR = { x: -9999, y: -9999, active: false };

  let particleCount = 0;
  let linkDistance = 130;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function configureParticles() {
    const area = window.innerWidth * window.innerHeight;

    /* Jumlah titik menyesuaikan ukuran layar */
    particleCount = Math.min(130, Math.max(45, Math.round(area / 16000)));

    /* Di layar kecil garis koneksi dibuat lebih pendek */
    linkDistance = window.innerWidth < 640 ? 95 : 130;

    particles.length = 0;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,

        vx: randomRange(-0.28, 0.28),
        vy: randomRange(-0.28, 0.28),

        radius: randomRange(1.4, 3.2),
      });
    }
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    bgCanvas.width = Math.floor(window.innerWidth * dpr);
    bgCanvas.height = Math.floor(window.innerHeight * dpr);

    bgCanvas.style.width = `${window.innerWidth}px`;
    bgCanvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    configureParticles();
  }

  /* ---- Interaksi kursor ---- */

  window.addEventListener("pointermove", (event) => {
    CURSOR.x = event.clientX;
    CURSOR.y = event.clientY;
    CURSOR.active = true;
  });

  window.addEventListener("pointerleave", () => {
    CURSOR.active = false;
    CURSOR.x = -9999;
    CURSOR.y = -9999;
  });

  window.addEventListener(
    "pointerdown",
    (event) => {
      ripples.push({
        x: event.clientX,
        y: event.clientY,
        radius: 0,
        alpha: 0.5,
      });
    },
    { passive: true },
  );

  /* ---- Update & render (TIPE 1: interaksi kursor) ---- */

  function updateParticles() {
    particlesConnected = [];

    particles.forEach((p) => {
      /* Partikel bergerak bebas */
      p.x += p.vx;
      p.y += p.vy;

      /* Memantul di tepi layar */
      if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

      /* Partikel menjauh dari kursor */
      const dx = p.x - CURSOR.x;
      const dy = p.y - CURSOR.y;
      const dist = Math.hypot(dx, dy);

      if (CURSOR.active && dist < 120) {
        const away = (120 - dist) / 120;

        p.vx += (dx / (dist || 1)) * away * 0.42;
        p.vy += (dy / (dist || 1)) * away * 0.42;
      }

      /* Batas kecepatan agar gerak tetap halus */
      const speed = Math.hypot(p.vx, p.vy);

      if (speed > 1.5) {
        p.vx = (p.vx / speed) * 1.5;
        p.vy = (p.vy / speed) * 1.5;
      }
    });

    /* Garis koneksi antar partikel yang berdekatan */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];

        const dist = Math.hypot(a.x - b.x, a.y - b.y);

        if (dist < linkDistance) {
          particlesConnected.push([a, b, dist]);
        }
      }
    }
  }

  function drawParticles() {
    /* Garis koneksi */
    particlesConnected.forEach(([a, b, dist]) => {
      const alpha = 1 - dist / linkDistance;

      ctx.strokeStyle = `rgba(47, 128, 255, ${alpha * 0.22})`;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    /* Titik partikel */
    particles.forEach((p) => {
      const dx = p.x - CURSOR.x;
      const dy = p.y - CURSOR.y;
      const nearCursor = CURSOR.active && Math.hypot(dx, dy) < 150;

      /* Partikel lebih terang saat dekat kursor */
      ctx.fillStyle = nearCursor
        ? "rgba(47, 128, 255, 0.85)"
        : "rgba(47, 128, 255, 0.38)";

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ---- Gelombang saat klik (interaksi tambahan) ---- */

  function updateRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];

      ripple.radius += 3.2;
      ripple.alpha *= 0.96;

      if (ripple.alpha < 0.02) {
        ripples.splice(i, 1);
      }
    }
  }

  function drawRipples() {
    ripples.forEach((ripple) => {
      ctx.strokeStyle = `rgba(47, 128, 255, ${ripple.alpha})`;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  /* ---- Loop animasi utama ---- */

  let running = true;

  function animateBackground() {
    if (!running) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    updateParticles();
    updateRipples();

    drawParticles();
    drawRipples();

    window.requestAnimationFrame(animateBackground);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      window.requestAnimationFrame(animateBackground);
    }
  });

  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 150);
    },
    { passive: true },
  );

  resizeCanvas();
  animateBackground();
}
