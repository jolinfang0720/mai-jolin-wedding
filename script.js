/* MAI & JOLIN WEDDING — minimal interactions */

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

// ============== BACKGROUND MUSIC ==============
(function initBgm(){
  const audio  = document.getElementById('bgm');
  const toggle = document.getElementById('musicToggle');
  if (!audio || !toggle) return;

  audio.volume = 0.20;

  const STORAGE_KEY = 'mj-bgm-pref'; // "on" | "off"
  const userPref = localStorage.getItem(STORAGE_KEY);

  const setState = (playing) => {
    toggle.dataset.playing = playing ? 'true' : 'false';
  };

  const play = () => {
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => setState(true))
       .catch(() => setState(false));   // autoplay blocked — wait for gesture
    } else {
      setState(true);
    }
  };

  const pause = () => { audio.pause(); setState(false); };

  // 1) Try autoplay immediately (will likely fail on first visit due to browser policy)
  if (userPref !== 'off') play();

  // 2) On first user interaction, start (if not already playing) — unless user explicitly muted
  const startOnGesture = () => {
    if (userPref === 'off') return cleanup();
    if (audio.paused) play();
    cleanup();
  };
  const cleanup = () => {
    window.removeEventListener('pointerdown', startOnGesture);
    window.removeEventListener('keydown',     startOnGesture);
    window.removeEventListener('scroll',      startOnGesture);
    window.removeEventListener('touchstart',  startOnGesture);
  };
  window.addEventListener('pointerdown', startOnGesture, { once:true, passive:true });
  window.addEventListener('keydown',     startOnGesture, { once:true });
  window.addEventListener('scroll',      startOnGesture, { once:true, passive:true });
  window.addEventListener('touchstart',  startOnGesture, { once:true, passive:true });

  // 3) Manual toggle — and remember user choice
  toggle.addEventListener('click', () => {
    if (audio.paused) {
      play();
      localStorage.setItem(STORAGE_KEY, 'on');
    } else {
      pause();
      localStorage.setItem(STORAGE_KEY, 'off');
    }
  });

  // 4) Keep button state in sync with audio events
  audio.addEventListener('play',  () => setState(true));
  audio.addEventListener('pause', () => setState(false));
})();

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
