imimport { safeFetchJSON, getQueryParam, formatCurrency, showToast } from './utils.js';
import { CONFIG } from './config/settings.js';

export async function initEnrollPage() {
  const summary = document.getElementById('class-summary');
  const iframe = document.getElementById('jotform-frame');
  const payBtn = document.getElementById('paystack-btn');
  const id = getQueryParam('classId');
  const amountParam = getQueryParam('amount');

  try {
    const classes = await safeFetchJSON('data/classes.json');
    if (!id) {
      summary.innerHTML = '<p class="muted">Please choose a class to enroll.</p>';
      return;
    }

    const c = classes.find(x => String(x.id) === String(id));
    if (!c) {
      summary.innerHTML = '<p class="muted">Class not found.</p>';
      return;
    }

    if (summary) renderClassSummary(summary, c);

    if (iframe) {
      const src = new URL(iframe.src);
      src.searchParams.set('classId', c.id);
      src.searchParams.set('classTitle', c.title);
      src.searchParams.set('amount', c.price);
      src.searchParams.set('brand', CONFIG.SITE_NAME);
      iframe.src = src.toString();
    }

    if (payBtn) {
      payBtn.addEventListener('click', () => {
        const amount = Number(amountParam || c.price || CONFIG.DEFAULT_AMOUNT);
        initiatePayment({
          email: CONFIG.PAYSTACK_DEFAULT_EMAIL,
          amount,
          meta: { classId: c.id, classTitle: c.title },
        });
      });
    }
  } catch (e) {
    console.error(e);
    summary.innerHTML = '<p class="muted">Failed to load class details. Please refresh.</p>';
    showToast('Error loading class info.', 'error');
  }
}

function renderClassSummary(container, c) {
  container.innerHTML = `
    <div class="card enroll-summary">
      <h3>${escapeHtml(c.title)}</h3>
      <p><strong>Tutor:</strong> ${escapeHtml(c.tutorName)}</p>
      <p><strong>Price:</strong> ${formatCurrency(c.price)}</p>
      <p class="muted">${escapeHtml(c.short)}</p>
    </div>
  `;
}

function initiatePayment({ email, amount, meta }) {
  if (!window.PaystackPop) {
    showToast('Payment system not loaded. Please reload the page.', 'error');
    return;
  }

  if (!CONFIG.PAYSTACK_PUBLIC_KEY || CONFIG.PAYSTACK_PUBLIC_KEY.includes('replace')) {
    showToast('Payment key not configured. Contact support.', 'error');
    return;
  }

  const ref = 'EDUBRIDGE_' + Math.floor(Math.random() * 1000000000);
  showToast('Initializing secure payment...', 'info');

  const handler = window.PaystackPop.setup({
    key: CONFIG.PAYSTACK_PUBLIC_KEY,
    email,
    amount: Math.round(Number(amount) * 100),
    currency: CONFIG.CURRENCY || 'NGN',
    ref,
    metadata: meta,
    onClose: () => showToast('Payment window closed.', 'neutral'),
    callback: (resp) => {
      showToast('Payment successful! Reference: ' + resp.reference, 'success');
      window.location.href = CONFIG.PAYMENT_SUCCESS_URL + '?ref=' + resp.reference;
    },
  });
  handler.openIframe();
}

function escapeHtml(s = '') {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
