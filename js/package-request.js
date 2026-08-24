/**
 * package-request.js — Formulario de plan de viaje (Index · Paquetes)
 *
 * Cuando el usuario elige un paquete, se abre este formulario para que deje
 * sus datos y preferencias. Envía la solicitud a la tabla `package_requests`
 * de Supabase (columna user_id opcional: se rellena si hay sesión iniciada).
 */
(function () {
  var TABLE = 'package_requests';
  var modal, form, banner, statusEl, submitBtn;
  var currentId = null;

  function open(id) {
    if (!modal) return;
    currentId = id || null;

    function show() {
      var data = (typeof paquetesData !== 'undefined') ? (paquetesData[currentId] || null) : null;

      var title = data ? (data.title || 'Paquete') : 'Paquete';
      var precio = data && data.precio ? data.precio : '';
      var pais = data && data.pais ? data.pais : '';

      banner.innerHTML =
        '<div>' +
          '<span class="paq-banner-label">Paquete seleccionado</span>' +
          '<strong class="paq-banner-title">' + esc(title) + '</strong>' +
          (pais ? '<small class="paq-banner-country">Destino: ' + esc(friendlyCountry(pais)) + '</small>' : '') +
        '</div>' +
        (precio ? '<span class="paq-banner-price">' + precio + '</span>' : '');

      form.reset();
      statusEl.textContent = '';
      statusEl.classList.remove('is-error');
      modal.classList.add('open');
      if (window.KavariScrollLock) window.KavariScrollLock.lock();
      setTimeout(function () {
        var n = form.querySelector('[name=full_name]');
        if (n) n.focus();
      }, 80);
    }

    if (window.homeDataLoaded) {
      show();
    } else if (typeof loadHomeData === 'function') {
      loadHomeData().then(show);
    } else {
      show();
    }
  }

  function close() {
    if (!modal) return;
    modal.classList.remove('open');
    if (window.KavariScrollLock) window.KavariScrollLock.unlock();
  }

  function esc(s) {
    return String(s || '').replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
  }

  function friendlyCountry(code) {
    return String(code || '').split('-').map(function (w) {
      return w ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    }).join(' ');
  }

  function setStatus(msg, isError) {
    statusEl.textContent = msg;
    statusEl.classList.toggle('is-error', !!isError);
  }

  function build() {
    if (document.getElementById('packageRequestModal')) return;

    modal = document.createElement('div');
    modal.id = 'packageRequestModal';
    modal.className = 'traveler-modal';
    modal.innerHTML =
      '<section class="traveler-card" role="dialog" aria-modal="true" aria-labelledby="pkgTitle">' +
        '<button class="traveler-close" type="button" aria-label="Cerrar">×</button>' +
        '<h2 id="pkgTitle">Solicita tu plan de viaje</h2>' +
        '<p>Cuéntanos tu plan y te armamos el paquete a tu medida.</p>' +
        '<div class="paq-banner" id="paqBanner"></div>' +
        '<form class="traveler-form" novalidate>' +
          '<label>Nombre completo<input name="full_name" required minlength="2" autocomplete="name"></label>' +
          '<label>Correo electrónico<input name="email" type="email" required autocomplete="email"></label>' +
          '<label>Teléfono (opcional)<input name="phone" type="tel" autocomplete="tel"></label>' +
          '<label>Fecha estimada de viaje<input name="travel_date" type="date"></label>' +
          '<label>Número de viajeros<input name="travelers" type="number" min="1" max="30" value="2"></label>' +
          '<label>Comentarios / ideas para tu plan<textarea name="notes" rows="3" placeholder="Ej: vuelos, hotel, guías, presupuesto…"></textarea></label>' +
          '<button class="traveler-submit" type="submit">Solicitar mi plan</button>' +
          '<p class="traveler-status" role="status" aria-live="polite"></p>' +
        '</form>' +
      '</section>';
    document.body.appendChild(modal);

    banner = modal.querySelector('#paqBanner');
    statusEl = modal.querySelector('.traveler-status');
    form = modal.querySelector('form');
    submitBtn = modal.querySelector('.traveler-submit');

    modal.querySelector('.traveler-close').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });

    form.addEventListener('submit', onSubmit);
  }

  function onSubmit(e) {
    e.preventDefault();
    statusEl.classList.remove('is-error');

    var fd = new FormData(form);
    var fullName = (fd.get('full_name') || '').trim();
    var email = (fd.get('email') || '').trim();
    var phone = (fd.get('phone') || '').trim();
    var travelDate = fd.get('travel_date') || null;
    var travelers = parseInt(fd.get('travelers'), 10) || 1;
    var notes = (fd.get('notes') || '').trim();
    var packageId = currentId || '';
    var packageName = '';
    if (typeof paquetesData !== 'undefined' && paquetesData[packageId]) {
      packageName = paquetesData[packageId].title || '';
    }

    form.querySelectorAll('.field-error').forEach(function (el) { el.classList.remove('field-error'); });
    var errors = [];
    if (fullName.length < 2) errors.push('full_name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email');
    if (travelers < 1 || travelers > 30) errors.push('travelers');
    if (errors.length) {
      errors.forEach(function (n) {
        var el = form.querySelector('[name=' + n + ']');
        if (el) el.classList.add('field-error');
      });
      setStatus('Revisa los campos marcados.', true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    setStatus('');

    var client = window.KavariDB && window.KavariDB.getSupabaseClient ?
      window.KavariDB.getSupabaseClient() : null;
    if (!client) {
      setStatus('Supabase no está disponible. Intenta de nuevo.', true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Solicitar mi plan';
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
        phone: phone || null,
        package_id: packageId || null,
        package_name: packageName || null,
        country_code: (typeof paquetesData !== 'undefined' && paquetesData[packageId])
          ? (paquetesData[packageId].pais || null) : null,
        travel_date: travelDate,
        travelers: travelers,
        notes: notes || null,
        status: 'pending'
      });
    }).then(function (res) {
      if (res && res.error) throw res.error;
      setStatus('¡Solicitud enviada! Te contactaremos para armar tu plan.');
      form.reset();
      setTimeout(function () {
        close();
        setStatus('');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Solicitar mi plan';
      }, 1400);
    }).catch(function (err) {
      console.error('[KAVARI] Error guardando solicitud de paquete:', err);
      setStatus('No se pudo enviar la solicitud. Intenta de nuevo.', true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Solicitar mi plan';
    });
  }

  document.addEventListener('DOMContentLoaded', build);

  window.PackageRequest = {
    open: open,
    close: close
  };
})();