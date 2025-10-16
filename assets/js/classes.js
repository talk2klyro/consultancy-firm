import { safeFetchJSON, formatCurrency, debounce, showToast, setLoading, getPageContext } from './utils.js';
import { CONFIG } from './config/settings.js';

function createClassCard(c) {
  const card = document.createElement('article');
  card.className = 'class-card';
  card.setAttribute('role', 'listitem');
  card.innerHTML = `
    <div class="card-header">
      <h3>${escapeHtml(c.title)}</h3>
      <span class="badge verified">Verified</span>
    </div>
    <p class="tutor-info">${escapeHtml(c.tutorName)} • ${escapeHtml(c.schedule)}</p>
    <p class="short">${escapeHtml(c.short)}</p>
    <div class="meta">
      <div class="rating" aria-label="Rating">⭐ ${c.rating || '4.8'}</div>
      <div class="price">${formatCurrency(c.price)}</div>
    </div>
    <div class="actions">
      <a class="btn btn-primary enroll-btn" href="enroll.html?classId=${encodeURIComponent(c.id)}&amount=${encodeURIComponent(c.price)}">
        Enroll Now
      </a>
      <button class="btn btn-outline gc-btn" data-url="${escapeHtml(c.classroomUrl || '')}">
        Open in Classroom
      </button>
    </div>
  `;
  card.querySelector('.gc-btn').addEventListener('click', (e)=>{
    const url = e.currentTarget.dataset.url;
    if(!url) return showToast('No Google Classroom link for this class.', 'error');
    window.Edubridge?.openGoogleClassroomShare(url);
  });
  return card;
}

export async function loadFeatured() {
  const target = document.getElementById('featured-grid');
  if (!target) return;
  try {
    const data = await safeFetchJSON('data/classes.json');
    target.innerHTML = '';
    data.slice(0, 3).forEach(c => target.appendChild(createClassCard(c)));
  } catch (e) {
    console.error(e);
    target.innerHTML = '<p class="muted">Failed to load featured classes.</p>';
  }
}

export async function initClasses() {
  const grid = document.getElementById('classes-grid');
  const searchEl = document.getElementById('search');
  if (!grid) return;
  try {
    const classes = await safeFetchJSON('data/classes.json');
    function render(list) {
      grid.innerHTML = '';
      list.forEach(c => grid.appendChild(createClassCard(c)));
    }
    render(classes);

    if (searchEl) {
      const summary = document.getElementById('search-summary') || document.createElement('p');
      summary.id = 'search-summary';
      summary.className = 'search-summary muted';
      searchEl.insertAdjacentElement('afterend', summary);

      const onInput = debounce(() => {
        const q = searchEl.value.trim().toLowerCase();
        let filtered = classes;
        if (q) {
          filtered = classes.filter(c =>
            (c.title + ' ' + c.tutorName + ' ' + c.subject).toLowerCase().includes(q)
          );
          summary.textContent = `${filtered.length} class${filtered.length !== 1 ? 'es' : ''} found for “${q}”`;
        } else {
          summary.textContent = '';
        }
        render(filtered);
      }, 200);
      searchEl.addEventListener('input', onInput);
    }

    const context = getPageContext();
    console.log('Classes page loaded:', context);
  } catch (e) {
    grid.innerHTML = '<p class="muted">Failed to load classes.</p>';
    console.error(e);
  }
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
                                                 }
