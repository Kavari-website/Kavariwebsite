/**
 * footer.js — Footer KAVARI (todas las páginas)
 * Feedback del formulario de newsletter + guardado en Supabase.
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('kvNewsletterForm');
  if (!form) return;

  var statusEl = document.createElement('p');
  statusEl.className = 'kv-footer-status';
  statusEl.setAttribute('role', 'status');
  statusEl.setAttribute('aria-live', 'polite');
  statusEl.style.cssText = 'margin-top:8px;font-size:.82rem;display:none;';
  form.parentNode.insertBefore(statusEl, form.nextSibling);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('.kv-footer-btn');
    var emailInput = document.getElementById('kvNewsletterEmail');
    var email = emailInput ? emailInput.value.trim() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      statusEl.textContent = window.t ? window.t('footerNewsError') : 'Ingresa un correo válido.';
      statusEl.style.color = '#e94560';
      statusEl.style.display = 'block';
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = '...'; }
    statusEl.style.display = 'none';

    var supabase = window.KavariDB ? window.KavariDB.getSupabaseClient() : null;
    if (supabase) {
      supabase.from('newsletter_subscribers').insert({ email: email }).then(function () {
        showSuccess();
      }).catch(function () {
        showSuccess();
      });
    } else {
      showSuccess();
    }

    function showSuccess() {
      var okText = window.t ? window.t('footerNewsOk') : '¡Gracias por suscribirte!';
      if (btn) btn.textContent = okText;
      statusEl.textContent = okText;
      statusEl.style.color = '#1a7a50';
      statusEl.style.display = 'block';
      setTimeout(function () {
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = window.t ? window.t('footerNewsBtn') : 'Suscribirse'; }
        statusEl.style.display = 'none';
      }, 3000);
    }
  });
});