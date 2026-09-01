/**
 * principal.js — Controlador del modal de registro de guías KAVARI
 * Maneja la apertura/cierre del modal, carga de países, y envío del formulario.
 * Versión mejorada: conecta con Supabase para almacenar datos y archivos.
 */

document.addEventListener('DOMContentLoaded', () => {
  const modalOverlay = document.getElementById('guiasModalOverlay');
  const openBtn = document.getElementById('guiasNavBtn');
  const closeBtn = document.getElementById('closeGuiasModalBtn');
  const selectCountry = document.getElementById('guideCountry');
  const registerForm = document.getElementById('guideRegisterFormIndex');
  const formStatus = document.getElementById('guideFormStatus');

  /* ─── Helpers ─── */
  function getLang() {
    return localStorage.getItem('kavari-idioma') || 'es';
  }

  function t(key) {
    if (window.t) return window.t(key);
    return key;
  }

  /* ─── Cargar países en el select ─── */
  function loadTouristCountries() {
    if (!selectCountry || selectCountry.dataset.loaded === '1') return;
    const lang = getLang();
    const placeholder = lang === 'en' ? 'Select a country' : t('seleccionaPais');
    fetch('data/data.json', { cache: 'no-cache' })
      .then(res => res.json())
      .then(data => {
        let countries = data;
        return fetch('data/i18n/' + lang + '.json', { cache: 'no-cache' })
          .then(r => r.ok ? r.json() : null)
          .then(i18n => {
            if (i18n) {
              const clone = JSON.parse(JSON.stringify(countries));
              function replaceInString(str) {
                if (typeof str !== 'string') return str;
                let result = str;
                for (const [key, val] of Object.entries(i18n)) {
                  if (typeof val === 'string') result = result.split(key).join(val);
                }
                return result;
              }
              function walk(obj) {
                if (Array.isArray(obj)) {
                  obj.forEach(walk);
                } else if (obj && typeof obj === 'object') {
                  for (const [key, val] of Object.entries(obj)) {
                    if (Array.isArray(val) && typeof val[0] === 'string') {
                      obj[key] = val.map(replaceInString);
                    } else if (val && typeof val === 'object') {
                      walk(val);
                    } else if (typeof val === 'string') {
                      obj[key] = replaceInString(val);
                    }
                  }
                }
              }
              walk(clone);
              countries = clone;
            }
            selectCountry.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
            Object.keys(countries)
              .sort((a, b) => (countries[a].nombre || a).localeCompare(countries[b].nombre || b, lang))
              .forEach(key => {
                const country = countries[key];
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = country.nombre || key;
                selectCountry.appendChild(opt);
              });
            selectCountry.dataset.loaded = '1';
          });
      })
      .catch(() => {
        selectCountry.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        selectCountry.dataset.loaded = '1';
      });
  }

  /* ─── Abrir modal ─── */
  if (openBtn && modalOverlay) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.style.display = 'flex';
      setTimeout(() => modalOverlay.classList.add('active'), 10);
      loadTouristCountries();
    });
  }

  /* ─── Cerrar modal ─── */
  function closeGuiasModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      setTimeout(() => { modalOverlay.style.display = 'none'; }, 400);
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeGuiasModal);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeGuiasModal();
    });
  }

  /* ─── Subir archivo a Supabase Storage ─── */
  async function uploadFile(userId, file, bucket, folder) {
    if (!window.KavariDB) return null;
    const client = window.KavariDB.getSupabaseClient();
    if (!client) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${folder}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = client.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (e) {
      console.error('[KAVARI] Error subiendo archivo:', e);
      return null;
    }
  }

  /* ─── Enviar formulario de registro de guía ─── */
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const lang = getLang();
      const submitBtn = registerForm.querySelector('.btn-submit');
      const originalText = submitBtn ? submitBtn.textContent : '';

      // Datos del formulario
      const formData = new FormData(registerForm);
      const guideData = {
        fullName: (document.getElementById('guideName') || {}).value?.trim() || '',
        email: (document.getElementById('guideEmail') || {}).value?.trim() || '',
        phone: (document.getElementById('guidePhone') || {}).value?.trim() || '',
        description: (document.getElementById('guideDescription') || {}).value?.trim() || '',
        languages: (document.getElementById('guideLanguages') || {}).value?.trim() || '',
        location: (document.getElementById('guideLocation') || {}).value?.trim() || '',
        specialties: (document.getElementById('guideSpecialties') || {}).value?.trim() || '',
        country: document.getElementById('guideCountry')?.value || '',
        membership: document.querySelector('input[name="guideRank"]:checked')?.value || 'silver',
        paymentMethod: document.getElementById('guidePayment')?.value || ''
      };

      // Validación básica
      if (!guideData.fullName || !guideData.email || !guideData.country) {
        if (formStatus) {
          formStatus.textContent = lang === 'en'
            ? 'Please fill in all required fields.'
            : 'Por favor completa todos los campos requeridos.';
          formStatus.classList.add('is-error');
        }
        return;
      }

      if (!guideData.paymentMethod) {
        if (formStatus) {
          formStatus.textContent = lang === 'en'
            ? 'Please select a payment method.'
            : 'Por favor selecciona un método de pago.';
          formStatus.classList.add('is-error');
        }
        return;
      }

      // Deshabilitar botón
      submitBtn.disabled = true;
      submitBtn.textContent = lang === 'en' ? 'Processing…' : 'Procesando…';
      if (formStatus) {
        formStatus.textContent = lang === 'en' ? 'Uploading documents…' : 'Subiendo documentos…';
        formStatus.classList.remove('is-error');
      }

      // Obtener usuario actual (si está autenticado)
      let userId = null;
      if (window.KavariDB) {
        const session = await window.KavariDB.getCurrentSession();
        userId = session?.user?.id || null;
      }

      // Subir foto de perfil
      const photoFile = document.getElementById('guidePhotoFile')?.files[0];
      let photoUrl = null;
      if (photoFile && userId) {
        photoUrl = await uploadFile(userId, photoFile, 'avatars', 'guide_photo');
      }

      // Subir registro criminal
      const criminalFile = document.getElementById('guideCriminalRecord')?.files[0];
      let criminalUrl = null;
      if (criminalFile && userId) {
        criminalUrl = await uploadFile(userId, criminalFile, 'guide-documents', 'criminal_record');
      }

      // Subir registro médico
      const medicalFile = document.getElementById('guideMedicalRecord')?.files[0];
      let medicalUrl = null;
      if (medicalFile && userId) {
        medicalUrl = await uploadFile(userId, medicalFile, 'guide-documents', 'medical_record');
      }

      // Registrar guía en Supabase
      if (window.KavariAuth) {
        const result = await window.KavariAuth.registerGuide({
          userId,
          ...guideData,
          photoUrl,
          criminalRecordUrl: criminalUrl,
          medicalRecordUrl: medicalUrl
        });

        if (result.error) {
          if (formStatus) {
            formStatus.textContent = lang === 'en'
              ? 'Error registering guide. Please try again.'
              : 'Error al registrar guía. Por favor intenta de nuevo.';
            formStatus.classList.add('is-error');
          }
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          return;
        }
      }

      // También guardar en localStorage para compatibilidad
      try {
        const existingGuides = JSON.parse(localStorage.getItem('kavariGuides') || '[]');
        const newGuide = {
          id: Date.now(),
          name: guideData.fullName,
          description: guideData.description,
          languages: guideData.languages,
          location: guideData.location,
          country: guideData.country,
          rank: guideData.membership,
          price: { silver: 20, gold: 35, diamond: 50 }[guideData.membership] || 20,
          photo: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideData.fullName)}&background=0050a0&color=fff`,
          especialidades: guideData.specialties ? guideData.specialties.split(',').map(s => s.trim()) : [],
          disponible: true
        };
        existingGuides.push(newGuide);
        localStorage.setItem('kavariGuides', JSON.stringify(existingGuides));
      } catch (_) {}

      // Éxito
      const t = window.t || function(k){return k;};
      const successMsg = t('guideExito');

      if (formStatus) {
        formStatus.textContent = successMsg;
        formStatus.classList.remove('is-error');
      }

      // Resetear formulario
      registerForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      // Cerrar modal después de 2.5 segundos
      setTimeout(() => {
        closeGuiasModal();
        if (formStatus) formStatus.textContent = '';
      }, 2500);
    });
  }

  /* ─── Actualizar al cambiar idioma ─── */
  window.addEventListener('kavari:langchange', () => {
    if (selectCountry) {
      selectCountry.dataset.loaded = '';
      if (modalOverlay && modalOverlay.style.display === 'flex') loadTouristCountries();
    }
  });
});
