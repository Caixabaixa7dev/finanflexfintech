(function() {
  'use strict';

  /* Navbar mobile toggle */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* Navbar scroll shadow */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* Scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => observer.observe(el));
  }

  /* FAQ Accordion */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* Hero Simulador rápido */
  const heroValor = document.getElementById('heroValor');
  const heroParcelas = document.getElementById('heroParcelas');
  const heroValorDisplay = document.getElementById('heroValorDisplay');
  const heroParcelasDisplay = document.getElementById('heroParcelasDisplay');
  const heroParcela = document.getElementById('heroParcela');

  function calcHeroSimulador() {
    if (!heroValor || !heroParcelas) return;
    const valor = parseInt(heroValor.value);
    const parcelas = parseInt(heroParcelas.value);
    const taxa = 0.035;

    if (heroValorDisplay) heroValorDisplay.textContent = formatMoney(valor);
    if (heroParcelasDisplay) heroParcelasDisplay.textContent = parcelas + 'x';

    const parcela = valor * (taxa * Math.pow(1 + taxa, parcelas)) / (Math.pow(1 + taxa, parcelas) - 1);
    if (heroParcela) heroParcela.textContent = formatMoney(Math.round(parcela));
  }

  if (heroValor) heroValor.addEventListener('input', calcHeroSimulador);
  if (heroParcelas) heroParcelas.addEventListener('input', calcHeroSimulador);
  calcHeroSimulador();

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
