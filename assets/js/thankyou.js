import { fetchJSON, getQueryParam, formatCurrency } from './utils.js';

document.addEventListener('DOMContentLoaded', initThankYouPage);

async function initThankYouPage() {
  const ref = getQueryParam('ref');
  const classId = getQueryParam('classId');
  const confirmation = document.getElementById('confirmation-text');
  const details = document.getElementById('class-details');
  const classroomBtn = document.getElementById('classroom-btn');
  const refNote = document.getElementById('ref-note');

  if (!ref) {
    confirmation.textContent = 'Payment confirmation missing. Please contact support.';
    return;
  }

  confirmation.textContent = 'Your enrollment has been confirmed.';

  refNote.textContent = `Reference: ${ref}`;
  try {
    const classes = await fetchJSON('data/classes.json');
    const c = classes.find(x => String(x.id) === String(classId)) || classes[0];

    details.innerHTML = `
      <h3>${escapeHtml(c.title)}</h3>
      <p><strong>Tutor:</strong> ${escapeHtml(c.tutorName)}</p>
      <p><strong>Schedule:</strong> ${escapeHtml(c.schedule)}</p>
      <p><strong>Amount Paid:</strong> ${formatCurrency(c.price)}</p>
      <p class="muted">${escapeHtml(c.short)}</p>
    `;

    if (c.classroomUrl) {
      classroomBtn.href = c.classroomUrl;
      classroomBtn.target = '_blank';
    } else {
      classroomBtn.textContent = 'Classroom Link Unavailable';
      classroomBtn.classList.add('disabled');
    }
  } catch (err) {
    console.error(err);
    details.innerHTML = `<p class="muted">Could not load class details. Please contact support with your reference number.</p>`;
  }
}

function escapeHtml(s = '') {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
