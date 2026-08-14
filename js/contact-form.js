/**
 * contact-form.js — Formulario de contacto (contacto.html)
 *
 * Guarda cada mensaje en la tabla `contact_messages` de Supabase.
 * user_id es opcional: se rellena si el visitante tiene sesión iniciada.
 */
(function () {
  var TABLE = 'contact_messages';
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('contactStatus');
  var submitBtn = document.getElementById('contactSubmit');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (statusEl) statusEl.classList.remove('is-error');

    var fd = new FormData(form);
    var fullName = (fd.get('full_name') || '').trim();
    var email = (fd.get('email') || '').trim();
    var subject = fd.get('subject') || 'general';
    var message = (fd.get('message') || '').trim();

    var errors = [];
    if (fullName.length < 2) errors.push('full_name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email');
    if (message.length < 10) errors.push('message');

    if (form.querySelectorAll) {
      form.querySelectorAll('.field-error').forEach(function (el) {
        el.classList.remove('field-error');
      });
    }
    if (errors.length) {
      errors.forEach(function (name) {
        var el = form.querySelector('[name=' + name + ']');
        if (el) el.classList.add('field-error');
      });
      if (statusEl) {
        statusEl.textContent = 'Revisa los campos marcados.';
        statusEl.classList.add('is-error');
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';
    }
    if (statusEl) statusEl.textContent = '';

    var client = window.KavariDB && window.KavariDB.getSupabaseClient ?
      window.KavariDB.getSupabaseClient() : null;
    if (!client) {
      if (statusEl) {
        statusEl.textContent = 'No se pudo enviar el mensaje. Intenta de nuevo.';
        statusEl.classList.add('is-error');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensaje';
      }
      return;
    }

    var userPromise = (window.KavariDB && typeof window.KavariDB.getCurrentUser === 'function')
      ? window.KavariDB.getCurrentUser()
      : Promise.resolve(null);

    userPromise.then(function (user) {
      return client.from(TABLE).insert({
        user_id: user ? user.id : null,
        full_name: fullName,
        email: email,
        subject: subject,
        message: message,
        status: 'new'
      });
    }).then(function (res) {
      if (res && res.error) throw res.error;
      form.reset();
      if (statusEl) {
        statusEl.textContent = '¡Mensaje enviado! Te responderemos pronto.';
        statusEl.classList.remove('is-error');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensaje';
      }
    }).catch(function (err) {
      console.error('[KAVARI] Error guardando mensaje de contacto:', err);
      if (statusEl) {
        statusEl.textContent = 'No se pudo enviar el mensaje. Intenta de nuevo.';
        statusEl.classList.add('is-error');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensaje';
      }
    });
  });
})();