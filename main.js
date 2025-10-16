impoimport { CONFIG } from './config/settings.js';
import { debounce } from './utils.js';

// ---------------------------
// NAVIGATION & SHARE
// ---------------------------
function openGoogleClassroomShare(url) {
  const targetUrl = url || window.location.href;
  const shareUrl = CONFIG.GOOGLE_CLASSROOM_SHARE_BASE + encodeURIComponent(targetUrl);
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

function initNavButtons() {
  const btn = document.querySelector('#gc-nav-btn, #gc-nav-btn-2');
  if (btn) btn.addEventListener('click', () => openGoogleClassroomShare(window.location.href));
}

// ---------------------------
// IMAGE OPTIMIZATION
// ---------------------------
function initLazyImages() {
  if (!('IntersectionObserver' in window)) return;
  const imgs = document.querySelectorAll('img[data-src]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        io.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  imgs.forEach(img => io.observe(img));
}

// ---------------------------
// THEME & SCROLL UTILITIES
// ---------------------------
function initThemeToggle() {
  const btn = document.getElementById('toggle-dark');
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark-mode');

  btn?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', mode);
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && document.querySelector(id)) {
        e.preventDefault();
        document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ---------------------------
// DYNAMIC MODULE LOADER
// ---------------------------
async function loadModules() {
  const ctx = detectPageContext();
  try {
    if (ctx.isClasses) {
      const module = await import('./modules/classes.js');
      module.initClasses();
    }
    if (ctx.isTutors && !ctx.isEnroll) {
      const module = await import('./modules/tutors.js');
      module.initTutors();
    }
    if (ctx.isEnroll) {
      const module = await import('./modules/enroll.js');
      module.initEnrollPage();
    }
    if (ctx.isHome) {
      const module = await import('./modules/classes.js');
      module.loadFeatured?.();
    }
  } catch (err) {
    console.error('Module load error:', err);
  }
}

// ---------------------------
// INIT ON DOM READY
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  initNavButtons();
  initThemeToggle();
  initLazyImages();
  initSmoothScroll();
  loadModules();
});

window.EduBridge = {
  openGoogleClassroomShare
};

// ---------------------------
// CONTEXT DETECTOR
// ---------------------------
function detectPageContext() {
  const body = document.body;
  return {
    isHome: body.classList.contains('home'),
    isClasses: !!document.getElementById('classes-grid'),
    isTutors: !!document.getElementById('tutors-grid'),
    isEnroll: !!document.querySelector('main.enroll-page'),
    isContact: !!document.querySelector('.classes-grid textarea')
  };
}
