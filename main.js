/* ===================================================
   ROAS.RYE — main.js  v2
   Fixed: cursor visibility, color picker clicks,
          no contenteditable, all interactivity
=================================================== */

/* ─── SCROLL PROGRESS BAR ────────────────────────── */
const progressBar = document.createElement('div');
progressBar.id = 'scrollProgress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (window.scrollY / max * 100) + '%';
}, { passive: true });

/* ─── CUSTOM CURSOR (desktop only) ──────────────── */
const cursorDot  = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');

// Only activate on devices with a fine pointer (mouse/trackpad)
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

if (hasFinePointer && cursorDot && cursorRing) {
  let mx = -200, my = -200; // start offscreen
  let rx = -200, ry = -200;

  // Dot follows instantly
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    // Direct style — no lag on the dot
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  // Ring follows with smooth lag
  (function animRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  // Click pulse
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  // Hover state on interactive elements
  const hoverTargets = 'a, button, [data-tilt], input, textarea, label, .color-swatch, .easter-egg';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
  });

  // Hide native cursor site-wide (already done in CSS for pointer:fine)
  // Show cursor elements
  cursorDot.style.display  = 'block';
  cursorRing.style.display = 'block';
} else {
  // Touch device — hide custom cursor elements
  if (cursorDot)  cursorDot.style.display  = 'none';
  if (cursorRing) cursorRing.style.display = 'none';
}

/* ─── NAV SCROLL ──────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── MOBILE MENU ─────────────────────────────────── */
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu   = document.getElementById('mobileMenu');

if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
  });

  // Close on link click
  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  // Close on outside tap
  document.addEventListener('click', e => {
    if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

/* ─── ACCENT COLOR PICKER ─────────────────────────── */
const colorPanel  = document.getElementById('colorPanel');
const colorToggle = document.getElementById('colorToggle');
const colorOpts   = document.getElementById('colorOptions');
const colorName   = document.getElementById('colorName');
const customColor = document.getElementById('customColor');

// Toggle open/close
colorToggle.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = colorPanel.classList.toggle('open');
  colorOpts.setAttribute('aria-hidden', !isOpen);
});

// Close when clicking outside
document.addEventListener('click', e => {
  if (!colorPanel.contains(e.target)) {
    colorPanel.classList.remove('open');
    colorOpts.setAttribute('aria-hidden', 'true');
  }
});

function hexToRgb(hex) {
  // Handle shorthand #RGB
  const full = hex.replace(/^#([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => '#' + r+r + g+g + b+b);
  const r = parseInt(full.slice(1,3), 16);
  const g = parseInt(full.slice(3,5), 16);
  const b = parseInt(full.slice(5,7), 16);
  return `${r}, ${g}, ${b}`;
}

function applyAccent(hex, name) {
  const root = document.documentElement;
  root.style.setProperty('--accent',     hex);
  root.style.setProperty('--accent-rgb', hexToRgb(hex));
  if (colorName) colorName.textContent = name || hex.toUpperCase();
}

// Swatch buttons
document.querySelectorAll('.color-swatch').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const hex  = btn.dataset.color;
    const name = btn.dataset.name;
    applyAccent(hex, name);
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    showToast(`Accent → ${name} ✦`);
  });
});

// Custom colour input
if (customColor) {
  customColor.addEventListener('input', e => {
    applyAccent(e.target.value, 'Custom');
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  });
  // Make the label click open the picker properly
  customColor.closest('label')?.addEventListener('click', e => e.stopPropagation());
}

/* ─── HERO PARALLAX ───────────────────────────────── */
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    heroBg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
  }, { passive: true });
}

/* ─── ORB SLOW MOUSE FOLLOW ───────────────────────── */
if (hasFinePointer) {
  let oMx = 0, oMy = 0, oX = 0, oY = 0;
  document.addEventListener('mousemove', e => { oMx = e.clientX; oMy = e.clientY; });
  const orb1 = document.querySelector('.orb-1');
  if (orb1) {
    (function followOrb() {
      oX += (oMx - oX) * 0.018;
      oY += (oMy - oY) * 0.018;
      orb1.style.transform = `translate(${oX * 0.03}px, ${oY * 0.03}px)`;
      requestAnimationFrame(followOrb);
    })();
  }
}

/* ─── TILT ON PROJECT CARDS ───────────────────────── */
if (hasFinePointer) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const rotY =  ((e.clientX - cx) / r.width)  * 13;
      const rotX = -((e.clientY - cy) / r.height) * 13;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(16px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ─── PARTICLES ───────────────────────────────────── */
function createParticles(container, count = 14) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const dur   = 3.5 + Math.random() * 4;
    const drift = (Math.random() - 0.5) * 70;
    p.style.cssText = `
      left:${Math.random()*100}%;
      bottom:0;
      width:${2+Math.random()*3}px;
      height:${2+Math.random()*3}px;
      animation-duration:${dur}s;
      animation-delay:${Math.random()*dur}s;
      --drift:${drift}px;
    `;
    container.appendChild(p);
  }
}
const pc = document.getElementById('particles1');
if (pc) createParticles(pc, 16);

/* ─── SCROLLYTELLING ──────────────────────────────── */
const scrollySection = document.querySelector('.scrolly-section');
const frames = document.querySelectorAll('.scrolly-frame');

// Trigger frame switch as steps enter view
const stepObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const step = parseInt(entry.target.closest('[data-step]')?.dataset?.step || '1') - 1;
    frames.forEach((f, i) => f.classList.toggle('active', i === step));
    entry.target.classList.add('in-view');
  });
}, { threshold: 0.4 });

document.querySelectorAll('.step-glass').forEach(el => stepObserver.observe(el));

/* ─── SCROLL REVEAL ───────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    // stagger siblings
    const siblings = [...(entry.target.parentElement?.querySelectorAll('.reveal-card') || [])];
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => {
      entry.target.classList.add('in-view');
    }, idx * 90);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal-card').forEach(el => revealObs.observe(el));

const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); sectionObs.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal-section').forEach(el => sectionObs.observe(el));

/* ─── ROI CALCULATOR ──────────────────────────────── */
const sliders = {
  visitors: document.getElementById('visitorsSlider'),
  conv:     document.getElementById('convSlider'),
  aov:      document.getElementById('aovSlider'),
};
const displays = {
  visitors: document.getElementById('visitorsVal'),
  conv:     document.getElementById('convVal'),
  aov:      document.getElementById('aovVal'),
  current:  document.getElementById('currentRev'),
  projected:document.getElementById('projectedRev'),
};

function animNum(el, target, prefix = '') {
  if (!el) return;
  const start = parseInt(el.textContent.replace(/\D/g, '')) || 0;
  const t0 = performance.now();
  const dur = 380;
  function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(start + (target - start) * ease).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateROI() {
  if (!sliders.visitors) return;
  const v  = parseInt(sliders.visitors.value);
  const c  = parseFloat(sliders.conv.value) / 100;
  const a  = parseInt(sliders.aov.value);
  displays.visitors.textContent = v.toLocaleString();
  displays.conv.textContent     = (c * 100).toFixed(1) + '%';
  displays.aov.textContent      = '$' + a.toLocaleString();
  animNum(displays.current,   Math.round(v * c * a),       '$');
  animNum(displays.projected, Math.round(v * c * 3 * a),   '$');
}

Object.values(sliders).forEach(s => s?.addEventListener('input', updateROI));
updateROI();

/* ─── TESTIMONIALS CAROUSEL ───────────────────────── */
const track     = document.getElementById('testimonialsTrack');
const dots      = document.querySelectorAll('.dot');
const testiCount = document.querySelectorAll('.testimonial').length;
let current = 0;

function goTo(i) {
  current = (i + testiCount) % testiCount;
  if (track) track.style.transform = `translateX(-${current * 100}%)`;
  dots.forEach((d, j) => d.classList.toggle('active', j === current));
}

document.getElementById('testiPrev')?.addEventListener('click', () => goTo(current - 1));
document.getElementById('testiNext')?.addEventListener('click', () => goTo(current + 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
// Touch swipe
let tsX = 0;
track?.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; }, { passive: true });
track?.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - tsX;
  if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
});
setInterval(() => goTo(current + 1), 7000);

/* ─── MARQUEE CLONE ───────────────────────────────── */
const marquee = document.getElementById('marqueeTrack');
if (marquee) marquee.innerHTML += marquee.innerHTML;

/* ─── CONTACT FORM ────────────────────────────────── */
function handleFormSubmit(e) {
  e.preventDefault();
  document.getElementById('contactForm')?.classList.add('hidden');
  document.getElementById('formSuccess')?.classList.remove('hidden');
  showToast('Brief sent! We\'ll be in touch ✦');
  return false;
}
window.handleFormSubmit = handleFormSubmit;

document.querySelectorAll('.budget-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.budget-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

/* ─── SMOOTH ANCHOR LINKS ─────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      mobileMenu?.classList.remove('open');
    }
  });
});

/* ─── EASTER EGGS ─────────────────────────────────── */
let found = new Set();
const eeCountEl = document.getElementById('eeCount');

function findEgg(id, msg) {
  if (found.has(id)) return;
  found.add(id);
  if (eeCountEl) eeCountEl.textContent = found.size;
  showToast(msg);
  if (found.size === 5) {
    setTimeout(() => showToast('🏆 ALL 5 FOUND! Email "I found all 5" for a surprise.', 6000), 1200);
  }
}

document.getElementById('ee1')?.addEventListener('click', () => findEgg('ee1', '🥚 Egg #1 — You\'re curious. We like that.'));
document.getElementById('ee2')?.addEventListener('click', () => findEgg('ee2', '🥚 Egg #2 — Most people never look here.'));
document.getElementById('ee4')?.addEventListener('click', () => findEgg('ee4', '🥚 Egg #4 — Thoroughness is a superpower.'));
document.getElementById('ee5')?.addEventListener('click', () => findEgg('ee5', '🥚 Egg #5 — You scrolled all the way down. Respect.'));

// Egg 3: Click work title 5×
let titleClicks = 0;
let titleTimer;
document.getElementById('workTitle')?.addEventListener('click', () => {
  titleClicks++;
  clearTimeout(titleTimer);
  titleTimer = setTimeout(() => titleClicks = 0, 1200);
  if (titleClicks >= 5) {
    document.getElementById('eeHint3')?.classList.remove('hidden');
    findEgg('ee3', '🥚 Egg #3 — Persistence is a design skill too.');
    titleClicks = 0;
  } else {
    showToast(`Click ${5 - titleClicks} more time${5 - titleClicks !== 1 ? 's' : ''}…`);
  }
});

// Logo triple-click
let logoClicks = 0, logoTimer;
document.querySelector('.nav-logo')?.addEventListener('click', () => {
  logoClicks++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => logoClicks = 0, 700);
  if (logoClicks >= 3) { logoClicks = 0; findEgg('logo', '🎯 Logo secret! Triple-click — bold move.'); }
});

/* ─── KONAMI CODE ─────────────────────────────────── */
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let ki = 0;
document.addEventListener('keydown', e => {
  ki = (e.key === KONAMI[ki]) ? ki + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (ki === KONAMI.length) {
    document.getElementById('konamiOverlay')?.classList.remove('hidden');
    findEgg('konami', '🎮 KONAMI CODE! Legendary.');
    ki = 0;
  }
});
document.getElementById('konamiClose')?.addEventListener('click', () => {
  document.getElementById('konamiOverlay')?.classList.add('hidden');
});

/* ─── TOAST ───────────────────────────────────────── */
let toastTimer;
function showToast(msg, dur = 3400) {
  const toast = document.getElementById('eeToast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), dur);
}

/* ─── CLICK RIPPLE ────────────────────────────────── */
const rippleStyle = document.createElement('style');
rippleStyle.textContent = '@keyframes rippleOut{to{width:110px;height:110px;opacity:0}}';
document.head.appendChild(rippleStyle);

document.addEventListener('click', e => {
  if (e.target.matches('input, textarea, button, a, label, .color-swatch')) return;
  const r = document.createElement('div');
  r.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:0;height:0;
    background:rgba(var(--accent-rgb),.12);border-radius:50%;
    transform:translate(-50%,-50%);pointer-events:none;z-index:9990;
    animation:rippleOut .55s ease forwards;`;
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 600);
});

/* ─── HERO ACCENT GLOW ON LOAD ────────────────────── */
window.addEventListener('load', () => {
  document.querySelectorAll('.hero-title .accent-text').forEach(el => {
    setTimeout(() => { el.style.textShadow = '0 0 48px rgba(var(--accent-rgb),.5)'; }, 900);
  });
});

/* ─── CONSOLE EASTER EGG ─────────────────────────── */
console.log(
  '%c roas.rye 🌾 ',
  'background:#07090E;color:#00FFB2;font-size:22px;font-family:serif;font-weight:900;padding:12px 24px;border:2px solid #00FFB2;border-radius:8px;'
);
console.log('%c We build websites that capture attention and keep it.', 'color:#00FFB2;font-size:12px;');
console.log('%c 🥚 Finding Easter eggs in the console counts too.', 'color:#555;font-size:11px;font-style:italic;');
