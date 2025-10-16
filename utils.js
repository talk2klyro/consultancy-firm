// ---------------------------
// FETCH HELPERS
// ---------------------------
export async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

export async function safeFetchJSON(path) {
  try {
    setLoading(true);
    const data = await fetchJSON(path);
    setLoading(false);
    return data;
  } catch (err) {
    setLoading(false);
    console.error(`Fetch failed for ${path}:`, err);
    showToast('Network issue — please try again.', 'error');
    throw err;
  }
}

// ---------------------------
// UI / FEEDBACK UTILITIES
// ---------------------------
export function setLoading(show = true, message = 'Loading...') {
  let overlay = document.querySelector('.loading-overlay');
  if (!overlay && show) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `<div class="spinner"></div><p>${message}</p>`;
    document.body.appendChild(overlay);
  }
  if (!show && overlay) overlay.remove();
}

export function showToast(message, type = 'info') {
  const toast = createEl('div', `toast toast-${type}`);
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => toast.classList.remove('show'), 3000);
  setTimeout(() => toast.remove(), 3500);
}

// ---------------------------
// GENERAL UTILITIES
// ---------------------------
export function formatCurrency(n) {
  try {
    return '₦' + Number(n).toLocaleString();
  } catch (e) {
    return '₦' + n;
  }
}

export function getQueryParam(key) {
  const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
  return url ? url.searchParams.get(key) : null;
}

export function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function createEl(tag = 'div', className = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

export function getPageContext() {
  const body = document.body;
  return {
    page: body.className || 'default',
    timestamp: new Date().toISOString()
  };
}
