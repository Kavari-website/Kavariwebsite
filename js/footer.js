/**
 * footer.js — Footer KAVARI (todas las páginas)
 * Feedback del formulario de newsletter sin recargar la página.
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('kvNewsletterForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('.kv-footer-btn');
    var okText = window.t ? window.t('footerNewsOk') : '¡Gracias!';
    if (btn) btn.textContent = okText;
    setTimeout(function () {
      form.reset();
      if (btn) btn.textContent = window.t ? window.t('footerNewsBtn') : 'Suscribirse';
    }, 2500);
  });
});