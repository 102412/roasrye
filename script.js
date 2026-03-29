/* ===================================================
   ROAS.RYE — main.js
   Interactive features, scrollytelling, easter eggs
=================================================== */

/* ===================== CURSOR ===================== */
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');
let mx = -100, my = -100, tx = -100, ty = -100;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

(function animTrail() {
  tx += (mx - tx) * 0.12;
  ty += (my - ty) * 0.12;
  trail.style.left = tx + 'px';
  trail.style.top = ty + 'px';
  requestAnimationFrame(animTrail);
})();

document.addEventListener('mousedown', () => {
  cursor.style.transform = 'translate(-50%,-50%) scale(0.6)';
  trail.style.transform = 'translate(-50%,-50%) scale(0.8)';
});
document.addEventListener('mouseup', () => {
  cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  trail.style.transform = 'translate(-50%,-50%) scale(1)';
});

/* ===================== NAV SCROLL ===================== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ===================== ACCENT COLOR PICKER ===================== */
const colorPanel = document.getElementById('colorPanel');
const colorToggle = document.getElementById('colorToggle');
const swatches = document.querySelectorAll('.color-swatch');
const colorName = document.getElementById('colorName');
const customColorInput = document.getElementById('customColor');

colorToggle.addEventListener('click', () => {
  colorPanel.classList.toggle('open');
});

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r}, ${g}, ${b}`;
}

function setAccent(color, name) {
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-rgb', hexToRgb(color));
  colorName.textContent = name || color.toUpperCase();
  swatches.forEach(s => s.classList.remove('active'));
}

swatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    const color = swatch.dataset.color;
    const name = swatch.dataset.name;
    setAccent(color, name);
    swatch.classList.add('active');
    showToast(`Accent set to ${name} ✦`);
  });
});

customColorInput.addEventListener('input', (e) => {
  setAccent(e.target.value, 'Custom');
});

// Close panel on outside click
document.addEventListener('click', (e) => {
  if (!colorPanel.contains(e.target)) colorPanel.classList.remove('open');
});

/* ===================== TILT EFFECT ON CARDS ===================== */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rotY = ((e.clientX - cx) / rect.width) * 14;
    const rotX = -((e.clientY - cy) / rect.height) * 14;
    card.style.setProperty('--rotX', rotX + 'deg');
    card.style.setProperty('--rotY', rotY + 'deg');
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(20px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ===================== PARTICLE SYSTEM ===================== */
function createParticles(container, count = 12) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const x = Math.random() * 100;
    const duration = 3 + Math.random() * 4;
    const drift = (Math.random() - 0.5) * 60;
    p.style.cssText = `
      left: ${x}%;
      bottom: 0;
      width: ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
      animation-duration: ${duration}s;
      animation-delay: ${Math.random() * duration}s;
      --drift: ${drift}px;
      opacity: ${0.3 + Math.random() * 0.7};
    `;
    container.appendChild(p);
  }
}
const particleContainer = document.getElementById('particles1');
if (particleContainer) createParticles(particleContainer, 16);

/* ===================== SCROLLYTELLING ===================== */
const scrollySection = document.querySelector('.scrolly-section');
const frames = document.querySelectorAll('.scrolly-frame');
const steps = document.querySelectorAll('.scrolly-step');
const stepCards = document.querySelectorAll('.step-glass');

function onScrolly() {
  if (!scrollySection) return;
  const rect = scrollySection.getBoundingClientRect();
  const total = scrollySection.offsetHeight - window.innerHeight;
  const scrolled = -rect.top;
  const progress = Math.max(0, Math.min(1, scrolled / total));
  const frameIndex = Math.min(Math.floor(progress * 4), 3);

  frames.forEach((f, i) => {
    f.classList.toggle('active', i === frameIndex);
  });
}

// Step in-view animations via IntersectionObserver
const stepObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      // update frame based on step
      const step = parseInt(e.target.closest('[data-step]')?.dataset?.step || '1') - 1;
      frames.forEach((f, i) => f.classList.toggle('active', i === step));
    }
  });
}, { threshold: 0.35 });

stepCards.forEach(card => stepObserver.observe(card));
window.addEventListener('scroll', onScrolly, { passive: true });

/* ===================== REVEAL ON SCROLL ===================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger within a parent
      const siblings = entry.target.parentElement?.querySelectorAll('.reveal-card') || [];
      let delay = 0;
      siblings.forEach((s, idx) => { if (s === entry.target) delay = idx * 100; });
      setTimeout(() => entry.target.classList.add('in-view'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-card').forEach(el => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); sectionObserver.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal-section').forEach(el => sectionObserver.observe(el));

/* ===================== ROI CALCULATOR ===================== */
const visitorsSlider = document.getElementById('visitorsSlider');
const convSlider = document.getElementById('convSlider');
const aovSlider = document.getElementById('aovSlider');
const visitorsVal = document.getElementById('visitorsVal');
const convVal = document.getElementById('convVal');
const aovVal = document.getElementById('aovVal');
const currentRevEl = document.getElementById('currentRev');
const projectedRevEl = document.getElementById('projectedRev');

function updateROI() {
  const visitors = parseInt(visitorsSlider.value);
  const conv = parseFloat(convSlider.value) / 100;
  const aov = parseInt(aovSlider.value);

  visitorsVal.textContent = visitors.toLocaleString();
  convVal.textContent = (conv * 100).toFixed(1) + '%';
  aovVal.textContent = '$' + aov.toLocaleString();

  const current = Math.round(visitors * conv * aov);
  const projected = Math.round(visitors * (conv * 3) * aov);  // 3x conv improvement

  animateNumber(currentRevEl, current, '$');
  animateNumber(projectedRevEl, projected, '$');
}

function animateNumber(el, target, prefix = '') {
  const start = parseInt(el.textContent.replace(/\D/g,'')) || 0;
  const duration = 400;
  const startTime = performance.now();
  function step(now) {
    const p = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const current = Math.round(start + (target - start) * ease);
    el.textContent = prefix + current.toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

if (visitorsSlider) {
  [visitorsSlider, convSlider, aovSlider].forEach(s => {
    s.addEventListener('input', updateROI);
  });
  updateROI();
}

/* ===================== TESTIMONIALS CAROUSEL ===================== */
const track = document.getElementById('testimonialsTrack');
const prevBtn = document.getElementById('testiPrev');
const nextBtn = document.getElementById('testiNext');
const dots = document.querySelectorAll('.dot');
let currentTesti = 0;
const testiCount = document.querySelectorAll('.testimonial').length;

function goToTesti(index) {
  currentTesti = (index + testiCount) % testiCount;
  if (track) track.style.transform = `translateX(-${currentTesti * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === currentTesti));
}

if (prevBtn) prevBtn.addEventListener('click', () => goToTesti(currentTesti - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goToTesti(currentTesti + 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => goToTesti(i)));

// Auto advance
setInterval(() => goToTesti(currentTesti + 1), 6000);

/* ===================== MARQUEE INTERACTION ===================== */
const marqueeTrack = document.getElementById('marqueeTrack');
if (marqueeTrack) {
  // Clone for seamless loop
  marqueeTrack.innerHTML += marqueeTrack.innerHTML;
}

/* ===================== CONTACT FORM ===================== */
function handleFormSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form && success) {
    form.classList.add('hidden');
    success.classList.remove('hidden');
    showToast('Brief sent! We\'ll be in touch within 24h ✦');
    incrementEECount();
  }
  return false;
}

document.querySelectorAll('.budget-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.budget-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

/* ===================== EASTER EGGS ===================== */
let eeFound = new Set();
const eeCountEl = document.getElementById('eeCount');

function incrementEECount() {
  if (eeCountEl) eeCountEl.textContent = eeFound.size;
}

function findEgg(id, message) {
  if (eeFound.has(id)) return;
  eeFound.add(id);
  showToast(message);
  incrementEECount();
  if (eeFound.size === 5) {
    setTimeout(() => showToast('🏆 ALL 5 EASTER EGGS FOUND! Email us "I found all 5" for 15% off!', 6000), 1000);
  }
}

// Egg 1: Bottom-right of hero
const ee1 = document.getElementById('ee1');
if (ee1) ee1.addEventListener('click', () => findEgg('ee1', '🥚 Egg #1 — You\'re curious. We like that.'));

// Egg 2: Visual panel
const ee2 = document.getElementById('ee2');
if (ee2) ee2.addEventListener('click', () => findEgg('ee2', '🥚 Egg #2 — Most people never look here.'));

// Egg 3: Click section title 5 times
const sectionTitle = document.querySelector('#work .section-title');
let titleClickCount = 0;
if (sectionTitle) {
  sectionTitle.addEventListener('click', () => {
    titleClickCount++;
    if (titleClickCount >= 5) {
      const hint = document.getElementById('eeHint3');
      if (hint) hint.classList.remove('hidden');
      findEgg('ee3', '🥚 Egg #3 — Persistence pays off, just like great design.');
      titleClickCount = 0;
    } else {
      showToast(`Click ${5 - titleClickCount} more time${5 - titleClickCount !== 1 ? 's' : ''}...`);
    }
  });
}

// Egg 4: Contact section
const ee4 = document.getElementById('ee4');
if (ee4) ee4.addEventListener('click', () => findEgg('ee4', '🥚 Egg #4 — Thoroughness is a superpower.'));

// Egg 5: Footer
const ee5 = document.getElementById('ee5');
if (ee5) ee5.addEventListener('click', () => findEgg('ee5', '🥚 Egg #5 — You scrolled to the very end. Respect.'));

// Secret: Triple click the logo
const logo = document.querySelector('.nav-logo');
let logoClicks = 0;
let logoTimer;
if (logo) {
  logo.addEventListener('click', (e) => {
    if (e.detail === 3 || ++logoClicks === 3) {
      logoClicks = 0;
      clearTimeout(logoTimer);
      findEgg('logo', '🎯 Secret! Triple-click the logo — bold move.');
      showToast('🎯 Logo secret discovered! You\'re thorough. Call us.');
    }
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => logoClicks = 0, 800);
  });
}

/* ===================== KONAMI CODE ===================== */
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', (e) => {
  if (e.key === konami[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === konami.length) {
      document.getElementById('konamiOverlay').classList.remove('hidden');
      findEgg('konami', '🎮 KONAMI CODE! Legendary.');
      konamiIdx = 0;
    }
  } else {
    konamiIdx = 0;
  }
});

/* ===================== TOAST ===================== */
let toastTimer;
function showToast(message, duration = 3200) {
  const toast = document.getElementById('eeToast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ===================== HERO PARALLAX ===================== */
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  if (!heroBg) return;
  const scrollY = window.scrollY;
  heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
}, { passive: true });

/* ===================== SCROLLBAR PROGRESS ===================== */
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  background: var(--accent);
  z-index: 9999;
  transition: width 0.1s linear;
  box-shadow: 0 0 8px var(--accent);
  pointer-events: none;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (window.scrollY / max) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ===================== TYPING EFFECT ON HERO TITLE ===================== */
// Subtle shimmer on the accent-text on first load
window.addEventListener('load', () => {
  const accentLines = document.querySelectorAll('.hero-title .accent-text');
  accentLines.forEach(el => {
    setTimeout(() => {
      el.style.textShadow = `0 0 40px rgba(var(--accent-rgb), 0.6)`;
    }, 800);
  });
});

/* ===================== SMOOTH ANCHOR LINKS ===================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===================== EDITABILITY HINT ===================== */
// Flash the edit hint briefly on load
const navHint = document.querySelector('.nav-hint');
if (navHint) {
  setTimeout(() => {
    navHint.style.opacity = '1';
    navHint.style.color = 'var(--accent)';
    navHint.style.transition = 'opacity 0.5s, color 0.5s';
    setTimeout(() => {
      navHint.style.opacity = '0.5';
      navHint.style.color = '';
    }, 3000);
  }, 2000);
}

/* ===================== CLICK RIPPLE EFFECT ===================== */
document.addEventListener('click', (e) => {
  if (e.target.closest('[contenteditable]') || e.target.closest('input') || e.target.closest('textarea')) return;
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    width: 0;
    height: 0;
    background: rgba(var(--accent-rgb), 0.15);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9990;
    animation: rippleOut 0.6s ease forwards;
  `;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

// Add ripple keyframe dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleOut {
    to { width: 120px; height: 120px; opacity: 0; }
  }
`;
document.head.appendChild(style);

/* ===================== ORBS FOLLOW MOUSE (SLOW) ===================== */
let orbMouseX = 0, orbMouseY = 0;
document.addEventListener('mousemove', (e) => {
  orbMouseX = e.clientX;
  orbMouseY = e.clientY;
});

let orbX = 0, orbY = 0;
const heroOrb1 = document.querySelector('.orb-1');
(function orbFollow() {
  orbX += (orbMouseX - orbX) * 0.015;
  orbY += (orbMouseY - orbY) * 0.015;
  if (heroOrb1) {
    heroOrb1.style.transform = `translate(${orbX * 0.04}px, ${orbY * 0.04}px)`;
  }
  requestAnimationFrame(orbFollow);
})();

console.log(
  '%c roas.rye 🌾 ',
  'background: #080B10; color: #00FFB2; font-size: 22px; font-family: serif; font-weight: 900; padding: 12px 24px; border: 2px solid #00FFB2; border-radius: 8px;'
);
console.log('%c We build websites that capture attention and keep it. Interested? roas.rye', 'color: #00FFB2; font-size: 12px;');
console.log('%c 🥚 P.S. Finding easter eggs in the console counts too.', 'color: #888; font-size: 11px; font-style: italic;');
