import './style.css';
import { createIcons } from 'lucide';
import {
  Plane, Landmark, MapPin, Compass, Building2, Waves, Map,
  BookOpen, ClipboardList, HeartPulse, ShieldCheck, Hotel, Wallet,
  CircleCheck, AlertTriangle, CircleX, ArrowRight
} from 'lucide';

// ---------- Initialize Lucide Icons ----------
createIcons({
  icons: {
    Plane, Landmark, MapPin, Compass, Building2, Waves, Map,
    BookOpen, ClipboardList, HeartPulse, ShieldCheck, Hotel, Wallet,
    CircleCheck, AlertTriangle, CircleX, ArrowRight
  }
});

// ============================================
// PARTICLE NETWORK — Hero background
// ============================================
function initParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animId;

  const PARTICLE_COUNT = 60;
  const CONNECTION_DIST = 140;
  const PARTICLE_SPEED = 0.3;

  let w, h;
  const particles = [];

  function resize() {
    const hero = canvas.parentElement;
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * PARTICLE_SPEED;
      this.vy = (Math.random() - 0.5) * PARTICLE_SPEED;
      this.r = Math.random() * 1.8 + 0.6;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
      // subtle pulse
      this.currentOpacity = this.opacity + Math.sin(t * 0.001 + this.pulsePhase) * 0.08;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(52, 211, 153, ${this.currentOpacity})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(40, 150, 90, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate(t) {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.update(t);
      p.draw();
    });
    drawConnections();
    animId = requestAnimationFrame(animate);
  }

  init();
  animate(0);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      // Reposition particles within bounds
      particles.forEach(p => {
        if (p.x > w) p.x = w - 10;
        if (p.y > h) p.y = h - 10;
      });
    }, 150);
  });
}

// ============================================
// MAIN INIT
// ============================================
function initApp() {
  // ---------- Start particle background ----------
  initParticles();

  // ---------- Navbar scroll effect ----------
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ---------- Mobile nav toggle ----------
  const navToggle = document.getElementById('navToggle');
  const navPill = document.getElementById('navPill');

  navToggle.addEventListener('click', () => {
    navPill.classList.toggle('active');
    const spans = navToggle.querySelectorAll('span');
    if (navPill.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile menu on link click
  const navLinks = document.querySelectorAll('.navbar__link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navPill.classList.remove('active');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // ---------- Pill indicator (sliding highlight) ----------
  const pillIndicator = document.getElementById('pillIndicator');
  const pillContainer = document.getElementById('navPill');

  function movePillTo(linkEl) {
    if (!linkEl || !pillIndicator || !pillContainer) return;
    const pillRect = pillContainer.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();
    const left = linkRect.left - pillRect.left;
    const width = linkRect.width;

    pillIndicator.style.left = `${left}px`;
    pillIndicator.style.width = `${width}px`;
    pillIndicator.style.opacity = '1';

    navLinks.forEach(l => l.classList.remove('active'));
    linkEl.classList.add('active');
  }

  function clearPill() {
    if (pillIndicator) pillIndicator.style.opacity = '0';
    navLinks.forEach(l => l.classList.remove('active'));
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => movePillTo(link));
  });

  if (pillContainer) {
    pillContainer.addEventListener('mouseleave', () => {
      const activeLink = getActiveSectionLink();
      if (activeLink) {
        movePillTo(activeLink);
      } else {
        clearPill();
      }
    });
  }

  // ---------- Active section tracking on scroll ----------
  const sections = ['guides', 'documents', 'customs', 'tips', 'faq'];
  const sectionEls = sections.map(id => document.getElementById(id)).filter(Boolean);

  function getActiveSectionLink() {
    const scrollY = window.scrollY + navbar.offsetHeight + 100;
    let activeId = null;
    for (const section of sectionEls) {
      if (section.offsetTop <= scrollY) activeId = section.id;
    }
    if (activeId) return document.querySelector(`.navbar__link[href="#${activeId}"]`);
    return null;
  }

  function updateActiveOnScroll() {
    if (pillContainer && pillContainer.matches(':hover')) return;
    const activeLink = getActiveSectionLink();
    if (activeLink) movePillTo(activeLink);
    else clearPill();
  }

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        updateActiveOnScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  // ---------- Animated stat counters ----------
  const statNumbers = document.querySelectorAll('.stat__number');

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    let startTime = null;

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(step);
  };

  // ---------- Scroll-reveal with stagger ----------
  const revealSelectors = [
    '.guide-card',
    '.doc-card',
    '.customs__item',
    '.tip-card',
    '.faq__item',
    '.newsletter__inner'
  ];

  // Group elements by their parent container for staggering
  const revealGroups = new Map();
  revealSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('reveal');
      const parent = el.parentElement;
      if (!revealGroups.has(parent)) revealGroups.set(parent, []);
      revealGroups.get(parent).push(el);
    });
  });

  // Assign stagger delays within each group
  revealGroups.forEach(group => {
    group.forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${i * 0.1}s`);
    });
  });

  // Section headers — add .reveal so they use the same animation system as cards
  const sectionHeaders = document.querySelectorAll('.section__header');
  sectionHeaders.forEach(el => el.classList.add('reveal'));

  let statsAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  // Observe all reveal elements (cards + section headers)
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Trigger hero stats animation automatically to align with entrance animation
  setTimeout(() => {
    if (!statsAnimated) {
      statsAnimated = true;
      statNumbers.forEach(el => animateCounter(el));
    }
  }, 800);

  // ---------- Smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // ---------- Newsletter form ----------
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    const btn = newsletterForm.querySelector('button');
    const originalText = btn.textContent;

    btn.textContent = '✓ Subscribed!';
    btn.style.background = '#34d399';
    input.value = '';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 3000);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
