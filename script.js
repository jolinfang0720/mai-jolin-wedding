/* MAI & JOLIN WEDDING — minimal interactions */

// ============== INVITATION ENVELOPE ==============
(function initEnvelope(){
  const env    = document.getElementById('envelope');
  const toggle = document.getElementById('envToggle');
  const close  = document.getElementById('envClose');
  const letter = document.getElementById('invite-letter');
  if (!env || !toggle || !letter) return;

  let animating = false;

  const open = () => {
    if (env.dataset.open === 'true' || animating) return;
    animating = true;
    env.dataset.open = 'true';
    toggle.setAttribute('aria-expanded', 'true');
    // animate height from 0 → content height, then release to auto (stays responsive)
    letter.style.height = letter.scrollHeight + 'px';
    const done = (e) => {
      if (e.propertyName !== 'height') return;
      letter.style.height = 'auto';
      animating = false;
      letter.removeEventListener('transitionend', done);
    };
    letter.addEventListener('transitionend', done);
  };

  const shut = () => {
    if (env.dataset.open !== 'true' || animating) return;
    animating = true;
    // from auto → fixed px → 0 so the collapse can animate
    letter.style.height = letter.scrollHeight + 'px';
    void letter.offsetHeight;            // force reflow
    requestAnimationFrame(() => {
      env.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
      letter.style.height = '0px';
    });
    const done = (e) => {
      if (e.propertyName !== 'height') return;
      animating = false;
      letter.removeEventListener('transitionend', done);
      env.scrollIntoView({ behavior:'smooth', block:'center' });
    };
    letter.addEventListener('transitionend', done);
  };

  toggle.addEventListener('click', open);
  if (close) close.addEventListener('click', shut);

  // If the window resizes while open (height:auto), nothing to fix — auto reflows.
})();

// Fade-in on scroll for sections
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.section, .detail-card, .tip, .contact-card, .feature, .flight-block')
  .forEach(el => io.observe(el));

// ============== MOBILE NAV (hamburger overlay) ==============
(function initMobileNav(){
  const toggle  = document.getElementById('navToggle');
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !overlay) return;

  const open = () => {
    toggle.classList.add('open');
    overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-label', '關閉選單');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    toggle.classList.remove('open');
    overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-label', '開啟選單');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    if (overlay.classList.contains('open')) close();
    else open();
  });

  // Close after picking a section (and let smooth-scroll handler do its thing)
  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setTimeout(close, 50));
  });

  // ESC to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });

  // If user resizes up to desktop while menu open, close it to avoid stuck overflow
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && overlay.classList.contains('open')) close();
  });
})();

// Nav shrink on scroll
const nav = document.querySelector('.nav');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 80) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
  lastY = y;
});

// ============== COUNTDOWN ==============
(function initCountdown(){
  const root = document.getElementById('countdown');
  if (!root) return;
  const target = new Date(root.dataset.target).getTime();
  if (Number.isNaN(target)) return;

  const cells = {
    days:    root.querySelector('[data-unit="days"]'),
    hours:   root.querySelector('[data-unit="hours"]'),
    minutes: root.querySelector('[data-unit="minutes"]'),
    seconds: root.querySelector('[data-unit="seconds"]'),
  };

  const pad = (n, w = 2) => String(Math.max(0, n)).padStart(w, '0');

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      cells.days.textContent    = '000';
      cells.hours.textContent   = '00';
      cells.minutes.textContent = '00';
      cells.seconds.textContent = '00';
      root.querySelector('.countdown-label').textContent = 'TODAY IS THE DAY';
      return;
    }
    const sec  = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hrs  = Math.floor((sec % 86400) / 3600);
    const min  = Math.floor((sec % 3600) / 60);
    const s    = sec % 60;
    cells.days.textContent    = pad(days, 3);
    cells.hours.textContent   = pad(hrs);
    cells.minutes.textContent = pad(min);
    cells.seconds.textContent = pad(s);
  };

  tick();
  setInterval(tick, 1000);
})();

// ============== CLIPBOARD COPY (address) ==============
document.querySelectorAll('[data-copy-target]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const id = btn.dataset.copyTarget;
    const target = document.getElementById(id);
    if (!target) return;
    const text = target.textContent.trim();

    const showCopied = () => {
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1800);
    };

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers / non-https
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showCopied();
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  });
});

// Smooth scroll offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
