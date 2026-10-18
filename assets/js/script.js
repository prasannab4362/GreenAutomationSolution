/**
 * Green Automation Solution — script.js
 * Main JavaScript for interactions, animations, and UX enhancements
 */

'use strict';

/* ----------------------------------------------------------------
   PAGE LOADER
   ---------------------------------------------------------------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1000);
  }
  // Trigger hero image ken-burns
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) heroBg.classList.add('loaded');
});

/* ----------------------------------------------------------------
   NAVIGATION — Sticky scroll + active link highlighting
   ---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('back-to-top');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

function onScroll() {
  const scrollY = window.scrollY;

  // Sticky style
  if (navbar) {
    navbar.classList.toggle('scrolled', scrollY > 20);
  }

  // Back-to-top button visibility
  if (backToTop) {
    backToTop.classList.toggle('visible', scrollY > 400);
  }

  // Active section highlighting
  let currentSection = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (scrollY >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === currentSection);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* ----------------------------------------------------------------
   BACK TO TOP
   ---------------------------------------------------------------- */
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ----------------------------------------------------------------
   MOBILE NAVIGATION
   ---------------------------------------------------------------- */
const navToggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavClose = document.getElementById('mobile-nav-close');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

function openMobileNav() {
  mobileNav.classList.add('active');
  navToggle.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  mobileNav.classList.remove('active');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (navToggle) navToggle.addEventListener('click', openMobileNav);
if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);

mobileNavLinks.forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileNav?.classList.contains('active')) {
    closeMobileNav();
  }
});

/* ----------------------------------------------------------------
   SMOOTH SCROLL for anchor links
   ---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ----------------------------------------------------------------
   SCROLL REVEAL — Intersection Observer
   ---------------------------------------------------------------- */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* ----------------------------------------------------------------
   CONTACT FORM — Client-side validation + PHP submission
   ---------------------------------------------------------------- */
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm(this)) return;

    const submitBtn = this.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending…</span>';
    submitBtn.disabled = true;

    // Show spinner
    submitBtn.style.opacity = '0.75';

    try {
      const formData = new FormData(this);
      formData.append('csrf_token', document.getElementById('csrf-token')?.value || '');

      const response = await fetch('contact.php', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      const result = await response.json();

      if (result.success) {
        showFormMessage('success',
          '✓ Thank you! Your enquiry has been received. We will get in touch with you shortly.');
        contactForm.reset();
      } else {
        showFormMessage('error',
          result.message || '✗ Something went wrong. Please try again or contact us directly.');
      }
    } catch (err) {
      // If PHP not available (local file), show a clear informational message
      if (window.location.protocol === 'file:') {
        showFormMessage('error',
          '⚠ Form submission requires a PHP server. Please deploy to a web host or run via a local PHP server (e.g. XAMPP). Your details: ' +
          Array.from(new FormData(contactForm).entries())
            .filter(([k]) => k !== 'csrf_token')
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | '));
      } else {
        showFormMessage('error',
          '✗ Unable to send your message. Please email us directly or contact via WhatsApp.');
      }
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
    }
  });
}

function validateForm(form) {
  clearFormErrors(form);
  let valid = true;

  const rules = [
    { id: 'full-name',    msg: 'Please enter your full name.',         check: v => v.trim().length >= 2 },
    { id: 'email',        msg: 'Please enter a valid email address.',   check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { id: 'phone',        msg: 'Please enter a valid phone number.',    check: v => /^\+?[\d\s\-]{7,15}$/.test(v.trim()) },
    { id: 'service',      msg: 'Please select the service required.',   check: v => v !== '' },
    { id: 'location',     msg: 'Please enter your location.',           check: v => v.trim().length >= 2 },
    { id: 'requirements', msg: 'Please briefly describe your project.', check: v => v.trim().length >= 10 },
  ];

  rules.forEach(({ id, msg, check }) => {
    const field = form.querySelector(`#${id}`);
    if (!field) return;
    if (!check(field.value)) {
      showFieldError(field, msg);
      valid = false;
    }
  });

  return valid;
}

function showFieldError(field, msg) {
  field.style.borderColor = 'rgba(239,68,68,0.6)';
  field.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
  const err = document.createElement('span');
  err.className = 'field-error';
  err.style.cssText = 'color:#f87171;font-size:0.75rem;margin-top:4px;display:block;';
  err.textContent = msg;
  field.parentNode.appendChild(err);
}

function clearFormErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.form-control').forEach(el => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  });
}

function showFormMessage(type, text) {
  if (!formMessage) return;
  formMessage.className = `form-message ${type}`;
  formMessage.textContent = text;
  formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => {
    if (formMessage.classList.contains('success')) {
      formMessage.className = 'form-message';
      formMessage.textContent = '';
    }
  }, 8000);
}

/* ----------------------------------------------------------------
   HERO — Typing animation for badge
   ---------------------------------------------------------------- */
(function heroTyping() {
  const badge = document.querySelector('.hero-badge-text');
  if (!badge) return;
  const original = badge.textContent.trim();
  badge.textContent = '';
  let i = 0;
  const type = () => {
    if (i <= original.length) {
      badge.textContent = original.slice(0, i);
      i++;
      setTimeout(type, 50);
    }
  };
  setTimeout(type, 600);
})();

/* ----------------------------------------------------------------
   ANIMATED COUNTER (placeholder — extend if stats added)
   ---------------------------------------------------------------- */
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}

/* ----------------------------------------------------------------
   PARALLAX — subtle hero background movement on scroll
   ---------------------------------------------------------------- */
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroBg.style.transform = `translateY(${y * 0.25}px)`;
    }
  }, { passive: true });
})();

/* ----------------------------------------------------------------
   FLOATING PARTICLES on hero (lightweight canvas)
   ---------------------------------------------------------------- */
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles(count) {
    return Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34, 197, 94, ${p.alpha})`;
      ctx.fill();

      // Connect nearby particles
      particles.slice(i + 1).forEach(p2 => {
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(34, 197, 94, ${(1 - dist / 120) * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    requestAnimationFrame(drawParticles);
  }

  resize();
  particles = createParticles(60);
  drawParticles();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
})();

/* ----------------------------------------------------------------
   PRODUCT TAB FILTER (category tabs)
   ---------------------------------------------------------------- */
(function initProductFilter() {
  const tabButtons = document.querySelectorAll('[data-filter-tab]');
  const cards = document.querySelectorAll('[data-filter-cat]');

  if (!tabButtons.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filterTab;

      tabButtons.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.style.background = b === btn ? 'var(--clr-green)' : '';
        b.style.color = b === btn ? 'var(--clr-navy)' : '';
        b.style.borderColor = b === btn ? 'var(--clr-green)' : '';
      });

      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.filterCat === cat;
        card.style.display = match ? '' : 'none';
        if (match) {
          card.style.animation = 'fadeInUp 0.4s ease both';
        }
      });
    });
  });
})();

/* ----------------------------------------------------------------
   NAV — highlight on click for anchor scrolling
   ---------------------------------------------------------------- */
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});
