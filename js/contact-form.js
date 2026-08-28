/**
 * contact-form.js — Formulario de contacto (contacto.html)
 *
 * Guarda cada mensaje en la tabla `contact_messages` de Supabase.
 * user_id es opcional: se rellena si el visitante tiene sesión iniciada.
 * Además envía una notificación por correo con EmailJS (Gmail).
 */
(function () {
  var TABLE = 'contact_messages';
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('contactStatus');
  var submitBtn = document.getElementById('contactSubmit');
  if (!form) return;

  var tt = function (key, fallback) {
    return (window.t && window.t(key) !== key) ? window.t(key) : fallback;
  };

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
        statusEl.textContent = tt('contactoRevisa', 'Revisa los campos marcados.');
        statusEl.classList.add('is-error');
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = tt('contactoEnviando', 'Enviando…');
    }
    if (statusEl) statusEl.textContent = '';

    var client = window.KavariDB && window.KavariDB.getSupabaseClient ?
      window.KavariDB.getSupabaseClient() : null;
    if (!client) {
      if (statusEl) {
        statusEl.textContent = tt('contactoNoPudo', 'No se pudo enviar el mensaje. Intenta de nuevo.');
        statusEl.classList.add('is-error');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = tt('contactoEnviar', 'Enviar mensaje');
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

      // Notificación por correo con EmailJS. Es "fire-and-forget":
      // el mensaje ya quedó guardado en Supabase, así que si el email
      // falla solo lo registramos en consola sin bloquear al usuario.
      if (window.emailjs && typeof window.emailjs.send === 'function') {
        window.emailjs.send(
          'service_qvmfjk6',      // Gmail service
          'template_8txcmq8',     // plantilla de notificación
          {
            from_name: fullName,
            reply_to: email,
            from_email: email,
            subject: subject,
            message: message
          },
          { publicKey: '2zIIrkekPIphTzjNk' }
        ).catch(function (err) {
          // console.warn('[KAVARI] No se pudo enviar la notificación por correo:', err);
        });
      }

      form.reset();
      if (statusEl) {
        statusEl.textContent = tt('contactoEnviado', '¡Mensaje enviado! Te responderemos pronto.');
        statusEl.classList.remove('is-error');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = tt('contactoEnviar', 'Enviar mensaje');
      }
    }).catch(function (err) {
      console.error('[KAVARI] Error guardando mensaje de contacto:', err);
      if (statusEl) {
        statusEl.textContent = tt('contactoNoPudo', 'No se pudo enviar el mensaje. Intenta de nuevo.');
        statusEl.classList.add('is-error');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = tt('contactoEnviar', 'Enviar mensaje');
      }
    });
  });
})();