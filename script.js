/* ========================================
   ANIMASI SECTION
======================================== */

const revealElements = document.querySelectorAll(
  ".reveal, .reveal-left, .reveal-right",
);

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
    threshold: 0.5,
  },
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

/* ========================================
   SMOOTH SCROLL NAVBAR
======================================== */

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    const targetId = this.getAttribute("href");

    const target = document.querySelector(targetId);

    if (!target) return;

    const navbar = document.querySelector(".navbar");

    const navbarHeight = navbar.offsetHeight;

    const targetPosition =
      target.getBoundingClientRect().top + window.scrollY - navbarHeight - 10;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  });
});

/* ========================================
   NAVBAR BACKGROUND
======================================== */

window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");

  if (window.scrollY > 50) {
    navbar.style.background = "rgba(8, 18, 37, 0.98)";
  } else {
    navbar.style.background = "rgba(8, 18, 37, 0.95)";
  }
});
