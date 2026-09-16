/**
 * footer.js — Footer KAVARI (todas las páginas)
 * Feedback del formulario de newsletter + guardado en Supabase.
 *
 * También expone window.KavariNotify, la notificación por correo (EmailJS)
 * reutilizada por todos los formularios del sitio: contacto, paquetes,
 * viajeros, inscripciones de guías y newsletter.
 *
 * IMPORTANTE: ADMIN_EMAIL es el destino de todas las notificaciones.
 * En el dashboard de EmailJS (template_8txcmq8) el campo "To Email" debe
 * ser kavariwebsite@gmail.com o usar la variable {{to_email}}.
 */
var KAVARI_ADMIN_EMAIL = 'kavariwebsite@gmail.com';

window.KavariNotify = function (params) {
  var p = new Promise(function (resolve) {
    if (window.emailjs && typeof window.emailjs.send === 'function') {
      resolve(window.emailjs);
      return;
    }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = function () { resolve(window.emailjs); };
    s.onerror = function () { resolve(null); };
    document.head.appendChild(s);
  });
  return p.then(function (emailjs) {
    if (!emailjs) return null;
    var payload = { to_email: KAVARI_ADMIN_EMAIL };
    if (params) {
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
      }
    }
    return emailjs.send(
      'service_qvmfjk6',
      'template_8txcmq8',
      payload,
      { publicKey: '2zIIrkekPIphTzjNk' }
    );
  }).catch(function () {
    return null;
  });
};

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

    if (window.KavariNotify) {
      window.KavariNotify({
        from_name: 'Newsletter KAVARI',
        from_email: email,
        subject: 'Nuevo suscriptor a la newsletter',
        message: 'Nuevo correo registrado en la newsletter: ' + email
      });
    }

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