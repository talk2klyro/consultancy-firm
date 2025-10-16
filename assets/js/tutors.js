import { safeFetchJSON, debounce, showToast } from './utils.js';

function createTutorCard(t) {
  const el = document.createElement('article');
  el.className = 'tutor-card';
  el.setAttribute('role', 'listitem');
  const photo = t.photo || 'assets/images/avatar-placeholder.png';
  el.innerHTML = `
    <div class="tutor-photo">
      <img loading="lazy" src="${photo}" alt="${escapeHtml(t.name)}">
      <span class="badge verified">Verified</span>
    </div>
    <div class="tutor-info">
      <h3>${escapeHtml(t.name)}</h3>
      <p class="subjects">${escapeHtml((t.subjects || []).join(', '))}</p>
      <p class="rating">⭐ ${t.rating.toFixed(1)} / 5</p>
      <p class="bio">${escapeHtml(t.bio)}</p>
      <div class="actions">
        <a class="btn btn-primary" href="classes.html?tutor=${encodeURIComponent(t.name)}">View Classes</a>
        <button class="btn btn-outline" onclick="showToast('Feature coming soon!', 'info')">Message</button>
      </div>
    </div>
  `;
  return el;
}

export async function initTutors() {
  const grid = document.getElementById('tutors-grid');
  const searchEl = document.getElementById('tutor-search');
  if (!grid) return;
  try {
    const tutors = await safeFetchJSON('data/tutors.json');
    function render(list) {
      grid.innerHTML = '';
      list.forEach(t => grid.appendChild(createTutorCard(t)));
    }
    render(tutors);

    if (searchEl) {
      const summary = document.createElement('p');
      summary.id = 'tutor-search-summary';
      summary.className = 'muted search-summary';
      searchEl.insertAdjacentElement('afterend', summary);

      const onInput = debounce(() => {
        const q = searchEl.value.trim().toLowerCase();
        let filtered = tutors;
        if (q) {
          filtered = tutors.filter(t =>
            (t.name + ' ' + (t.subjects || []).join(' ')).toLowerCase().includes(q)
          );
          summary.textContent = `${filtered.length} tutor${filtered.length !== 1 ? 's' : ''} found for “${q}”`;
        } else {
          summary.textContent = '';
        }
        render(filtered);
      }, 200);
      searchEl.addEventListener('input', onInput);
    }
  } catch (e) {
    grid.innerHTML = '<p class="muted">We’re updating our tutor list. Please refresh in a moment.</p>';
    showToast('Could not load tutors. Try again soon.', 'error');
    console.error(e);
  }
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
        }
