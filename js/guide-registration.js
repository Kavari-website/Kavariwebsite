/**
 * guide-registration.js — Registro de guías turísticos KAVARI (todas las páginas)
 * Inyecta el modal con formulario completo (nombre, país, fecha de nacimiento,
 * idiomas, membresía, historial criminal, teléfono, correo y términos), lo
 * abre desde ".nav-register", "#guiasNavBtn" o "[data-guide-register]" y guarda
 * el perfil en localStorage (kavariGuides) y Supabase si está disponible.
 */
(function () {
  'use strict';

  const langs = () => localStorage.getItem('kavari-idioma') || 'es';

  function t(key) {
    if (window.t) return window.t(key);
    return key;
  }

  function getLangBucket() {
    const lang = langs();
    return lang === 'en' ? 'en' : 'es';
  }

  const GUIDE_TEMPLATE = `
<div class="modal-overlay" id="guiasModalOverlay" style="display:none;">
  <div class="modal-content modal-guide-register">
    <button class="modal-close" id="closeGuiasModalBtn" data-i18n="modalGuiasCerrar">Cerrar</button>
    <h3 data-i18n="modalGuiasTitulo">Regístrate como Guía Turístico</h3>
    <form id="guideRegisterFormIndex" enctype="multipart/form-data">
      <div class="guide-form-section">
        <h4 data-i18n="modalGuiasSeccionPersonal">Información Personal</h4>
        <div class="field">
          <label for="guideName" data-i18n="modalGuiasNombre">Nombre Completo</label>
          <input type="text" id="guideName" required placeholder="Ej: Juan Pérez" data-i18n-placeholder="modalGuiasNombre">
        </div>
        <div class="field">
          <label for="guideEmail" data-i18n="modalGuiasCorreo">Correo Electrónico</label>
          <input type="email" id="guideEmail" required placeholder="tu@correo.com" data-i18n-placeholder="modalGuiasCorreoPH">
        </div>
        <div class="field">
          <label for="guidePhone" data-i18n="modalGuiasTelefono">Número de Teléfono</label>
          <input type="tel" id="guidePhone" required placeholder="+507 6000-0000" data-i18n-placeholder="modalGuiasTelefonoPH">
        </div>
        <div class="field">
          <label for="guideDOB" data-i18n="modalGuiasFechaNacimiento">Fecha de nacimiento</label>
          <input type="date" id="guideDOB" required max="2008-01-01">
        </div>
        <div class="field">
          <label for="guidePhotoFile" data-i18n="modalGuiasFoto">Foto de Perfil</label>
          <input type="file" id="guidePhotoFile" accept="image/*" class="field-file">
          <small class="field-hint" data-i18n="modalGuiasFotoHint">Formatos: JPG, PNG. Máximo 5MB.</small>
        </div>
      </div>

      <div class="guide-form-section">
        <h4 data-i18n="modalGuiasSeccionProfesional">Información Profesional</h4>
        <div class="field">
          <label for="guideDescription" data-i18n="modalGuiasDescripcion">Descripción de tus servicios</label>
          <textarea id="guideDescription" placeholder="Ej: Especialista en tours ecológicos..." rows="3" data-i18n-placeholder="modalGuiasDescripcion"></textarea>
        </div>
        <div class="field">
          <label for="guideLanguages" data-i18n="modalGuiasIdiomas">Idiomas que hablas</label>
          <input type="text" id="guideLanguages" required placeholder="Ej: Español, Inglés" data-i18n-placeholder="modalGuiasIdiomas">
        </div>
        <div class="field">
          <label for="guideCountry" data-i18n="modalGuiasPais">País donde operas</label>
          <select id="guideCountry" required>
            <option value="" disabled selected data-i18n="seleccionaPais">Selecciona un país</option>
          </select>
        </div>
      </div>

      <div class="guide-form-section">
        <h4 data-i18n="modalGuiasSeccionDocumentos">Documentos Requeridos</h4>
        <div class="field">
          <label for="guideCriminalRecord" data-i18n="modalGuiasRegistroCriminal">Historial Criminal</label>
          <input type="file" id="guideCriminalRecord" accept=".pdf,.jpg,.jpeg,.png" class="field-file" required>
          <small class="field-hint" data-i18n="modalGuiasRegistroCriminalHint">Sube tu historial / antecedente penal. Formatos: PDF, JPG, PNG. Máximo 10MB.</small>
        </div>
      </div>

      <div class="guide-form-section">
        <h4 data-i18n="modalGuiasSeccionMembresia">Membresía y Pago</h4>
        <div class="field">
          <label data-i18n="modalGuiasMembresia">Nivel de Membresía</label>
          <div class="rank-selector">
            <label><input type="radio" name="guideRank" value="silver" checked> <span data-i18n="modalGuiasPlata">Plata ($20/mes)</span></label>
            <label><input type="radio" name="guideRank" value="gold"> <span data-i18n="modalGuiasOro">Oro ($35/mes)</span></label>
            <label><input type="radio" name="guideRank" value="diamond"> <span data-i18n="modalGuiasDiamante">Diamante ($50/mes)</span></label>
          </div>
        </div>
        <div class="field">
          <label data-i18n="modalGuiasTerminos">Términos y condiciones</label>
          <label class="guide-terms">
            <input type="checkbox" id="guideTerms" required>
            <span class="guide-terms-text" data-i18n="modalGuiasTerminosTexto">Al enviar este formulario acepto que KAVARI analizará mi historial criminal para garantizar la seguridad de nuestros turistas. Esta revisión puede tardar hasta tres (3) días hábiles en validarse. Entiendo que mi información será utilizada únicamente para crear mi tarjeta de presentación pública, donde solo se mostrará mi nombre, rango, idiomas, tarifa de contratación y mi número de teléfono o correo electrónico para que los turistas puedan contactarme.</span>
          </label>
        </div>
      </div>

      <button type="submit" class="btn-submit" data-i18n="modalGuiasBoton">Activar Perfil de Guía</button>
      <p class="guide-form-status" id="guideFormStatus" role="status" aria-live="polite"></p>
    </form>
  </div>
</div>`;

  let modalOverlay = null;
  let registerForm = null;
  let openBtn = null;
  let closeBtn = null;
  let selectCountry = null;
  let formStatus = null;

  function injectModal() {
    if (document.getElementById('guiasModalOverlay')) return;
    const host = document.createElement('div');
    host.innerHTML = GUIDE_TEMPLATE.trim();
    document.body.appendChild(host.firstElementChild);
    translateModal();
  }

  function translateModal() {
    const overlay = document.getElementById('guiasModalOverlay');
    if (!overlay || typeof window.t !== 'function') return;
    overlay.querySelectorAll('[data-i18n]').forEach(el => {
      el.innerHTML = window.t(el.getAttribute('data-i18n'));
    });
    overlay.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = window.t(el.getAttribute('data-i18n-placeholder'));
    });
  }

  async function loadTouristCountries() {
    if (!selectCountry || selectCountry.dataset.loaded === '1') return;
    try {
      const res = await fetch('data/data.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('data.json ' + res.status);
      const data = await res.json();
      selectCountry.innerHTML = `<option value="" disabled selected>${t('seleccionaPais')}</option>`;
      Object.keys(data)
        .filter(key => data[key] && typeof data[key].nombre === 'string')
        .sort((a, b) => {
          const na = (window.paisNombre ? window.paisNombre(a, data[a].nombre) : data[a].nombre) || data[a].nombre || a;
          const nb = (window.paisNombre ? window.paisNombre(b, data[b].nombre) : data[b].nombre) || data[b].nombre || b;
          return na.localeCompare(nb, getLangBucket());
        })
        .forEach(key => {
          const country = data[key];
          const opt = document.createElement('option');
          opt.value = key;
          opt.textContent = (window.paisNombre ? window.paisNombre(key, country.nombre) : country.nombre) || country.nombre || key;
          selectCountry.appendChild(opt);
        });
      selectCountry.dataset.loaded = '1';
    } catch (_) {
      if (formStatus) {
        formStatus.textContent = t('guideErrorCargarPaises');
        formStatus.classList.add('is-error');
      }
    }
  }

  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.style.display = 'flex';
    setTimeout(() => modalOverlay.classList.add('active'), 10);
    loadTouristCountries();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    setTimeout(() => { modalOverlay.style.display = 'none'; }, 300);
    document.body.style.overflow = '';
  }

  async function uploadFile(userId, file, bucket, folder, isPrivate) {
    if (!window.KavariDB) return null;
    const client = window.KavariDB.getSupabaseClient();
    if (!client) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${folder}_${Date.now()}.${fileExt}`;
      const { error } = await client.storage.from(bucket).upload(fileName, file, { upsert: true });
      if (error) throw error;
      if (isPrivate) {
        const { data } = await client.storage.from(bucket).createSignedUrl(fileName, 60 * 60 * 24 * 365);
        return data?.signedUrl || null;
      }
      const { data } = client.storage.from(bucket).getPublicUrl(fileName);
      return data?.publicUrl || null;
    } catch (e) {
      console.error('[KAVARI] Error subiendo archivo:', e);
      return null;
    }
  }

  function setStatus(msg, isError) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.classList.toggle('is-error', !!isError);
  }

  function wireForm() {
    registerForm = document.getElementById('guideRegisterFormIndex');
    formStatus = document.getElementById('guideFormStatus');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = registerForm.querySelector('.btn-submit');
      const originalText = submitBtn.textContent;

      const val = id => (document.getElementById(id)?.value || '').trim();
      const guideData = {
        fullName: val('guideName'),
        email: val('guideEmail'),
        phone: val('guidePhone'),
        dob: val('guideDOB'),
        description: val('guideDescription'),
        languages: val('guideLanguages'),
        country: document.getElementById('guideCountry')?.value || '',
        membership: document.querySelector('input[name="guideRank"]:checked')?.value || 'silver'
      };
      const termsAccepted = document.getElementById('guideTerms')?.checked;

      if (!guideData.fullName || !guideData.email || !guideData.phone || !guideData.dob || !guideData.country || !guideData.languages) {
        setStatus(t('guideRequeridos'), true);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guideData.email)) {
        setStatus(t('guideCorreoInvalido'), true);
        return;
      }
      const criminalFile = document.getElementById('guideCriminalRecord')?.files[0];
      if (!criminalFile) {
        setStatus(t('guideFaltaHistorial'), true);
        return;
      }
      if (!termsAccepted) {
        setStatus(t('guideAceptaTerminos'), true);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = t('guideProcesando');
      setStatus(t('guideSubiendoDocs'), false);

      let userId = null;
      if (window.KavariDB) {
        const session = await window.KavariDB.getCurrentSession();
        userId = session?.user?.id || null;
      }

      const photoFile = document.getElementById('guidePhotoFile')?.files[0];
      let photoUrl = null;
      if (photoFile && userId) photoUrl = await uploadFile(userId, photoFile, 'avatars', 'guide_photo', false);

      let criminalUrl = null;
      if (criminalFile && userId) criminalUrl = await uploadFile(userId, criminalFile, 'guide-documents', 'criminal_record', true);

      if (window.KavariAuth) {
        const result = await window.KavariAuth.registerGuide({
          userId,
          ...guideData,
          photoUrl,
          criminalRecordUrl: criminalUrl
        });
        if (result.error) {
          setStatus(t('guideError'), true);
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          return;
        }
      }

      try {
        const existingGuides = JSON.parse(localStorage.getItem('kavariGuides') || '[]');
        const newGuide = {
          id: Date.now(),
          name: guideData.fullName,
          description: guideData.description,
          languages: guideData.languages,
          location: '',
          country: guideData.country,
          rank: guideData.membership,
          price: { silver: 20, gold: 35, diamond: 50 }[guideData.membership] || 20,
          photo: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideData.fullName)}&background=0050a0&color=fff`,
          phone: guideData.phone,
          email: guideData.email,
          disponible: true
        };
        existingGuides.push(newGuide);
        localStorage.setItem('kavariGuides', JSON.stringify(existingGuides));
      } catch (_) {}

      setStatus(t('guideExito'), false);
      registerForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      setTimeout(() => {
        closeModal();
        setStatus('');
      }, 3200);
    });
  }

  function wireTriggers() {
    modalOverlay = document.getElementById('guiasModalOverlay');
    closeBtn = document.getElementById('closeGuiasModalBtn');
    selectCountry = document.getElementById('guideCountry');

    document.querySelectorAll('#guiasNavBtn, .nav-register, [data-guide-register]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay) modalOverlay.classList.contains('active') && closeModal();
    });

    wireForm();
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectModal();
    wireTriggers();
  });

  window.addEventListener('kavari:langchange', () => {
    translateModal();
    if (!selectCountry) {
      selectCountry = document.getElementById('guideCountry');
    }
    if (selectCountry) {
      selectCountry.dataset.loaded = '';
      if (modalOverlay && modalOverlay.style.display === 'flex') loadTouristCountries();
    }
  });
})();