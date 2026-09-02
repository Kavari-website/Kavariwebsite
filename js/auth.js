/**
 * auth.js — Sistema de autenticación KAVARI
 * Soporta: Google OAuth, Email/Contraseña, Verificación OTP por email.
 * Conecta con Supabase Auth y gestiona el perfil del usuario.
 */

(function () {
  'use strict';

  /* ─── Constantes ─── */
  const PROFILE_KEY = 'kavari-profile';
  const VERIFICATION_KEY = 'kavari-verification';

  /* ─── Helpers ─── */
  const lang = () => localStorage.getItem('kavari-idioma') || 'es';

  const t = (key) => {
    if (window.t) return window.t(key);
    return key;
  };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
  }

  /* ─── Auth: Registro con Email/Contraseña ─── */
  async function signUpWithEmail(email, password, fullName) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) {
      return { error: 'Supabase no está disponible. Incluye el SDK.' };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: null
          }
        }
      });

      if (error) throw error;

      // Crear perfil en la tabla profiles
      if (data.user) {
        await createProfile(data.user.id, {
          email,
          full_name: fullName,
          phone: null,
          avatar_url: null
        });
      }

      return { data, error: null };
    } catch (e) {
      console.error('[KAVARI Auth] Error en registro:', e);
      return { data: null, error: e.message || 'Error al registrar usuario' };
    }
  }

  /* ─── Auth: Login con Email/Contraseña ─── */
  async function signInWithEmail(email, password) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) {
      return { error: 'Supabase no está disponible.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Guardar perfil local
      if (data.user) {
        const profile = await getProfile(data.user.id);
        if (profile) {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        }
      }

      return { data, error: null };
    } catch (e) {
      console.error('[KAVARI Auth] Error en login:', e);
      return { data: null, error: e.message || 'Error al iniciar sesión' };
    }
  }

  /* ─── Helper: URL de retorno para OAuth ─── */
  function getOAuthRedirectUrl() {
    // En file:// (abrir el HTML directo) origin es "null" y rompe el redirect.
    // En ese caso no pasamos redirectTo y Supabase usa su Site URL configurada.
    const origin = window.location.origin;
    if (origin && origin !== 'null' && /^https?:/i.test(origin)) {
      return origin + window.location.pathname;
    }
    return undefined;
  }

  /* ─── Auth: Login con Google ─── */
  async function signInWithGoogle() {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) {
      return { error: 'Supabase no está disponible.' };
    }

    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthRedirectUrl()
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (e) {
      console.error('[KAVARI Auth] Error en Google login:', e);
      return { data: null, error: e.message || 'Error al conectar con Google' };
    }
  }

  /* ─── Auth: Login con Google usando credential de Google Identity Services ─── */
  function normalizeGoogleAuthError(error) {
    const raw = error?.message || error?.error_description || String(error || '');
    // Mantener visible el error técnico original para facilitar el diagnóstico
    const detail = raw ? ` (${String(raw).slice(0, 220)})` : '';
    if (/JWT|invalid_client|audience|id_token/i.test(raw)) {
      return `El token de Google no fue aceptado. Revisa que el Client ID coincida en Supabase (Authentication → Providers → Google).${detail}`;
    }
    if (/already registered|already exists/i.test(raw)) {
      return `Este correo de Google ya está registrado con otra cuenta. Usa "Ingresar" o recupera tu contraseña.${detail}`;
    }
    if (/provider.*not.*enabled|email.*not.*confirmed|disabled/i.test(raw)) {
      return `El proveedor de Google no está habilitado en Supabase. Actívalo en Authentication → Providers → Google.${detail}`;
    }
    return raw || 'Error al conectar con Google. Intenta de nuevo.';
  }

  function decodeJwtPayload(token) {
    try {
      const payload = String(token).split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      return JSON.parse(decodeURIComponent(escape(atob(padded))));
    } catch (_) {
      return {};
    }
  }

  async function signInWithGoogleToken(credential) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) {
      return { error: 'Supabase no está disponible. Verifica tu conexión a internet.' };
    }

    try {
      const { data, error } = await client.auth.signInWithIdToken({
        provider: 'google',
        token: credential
      });

      if (error) {
        const msg = normalizeGoogleAuthError(error);
        return { data: null, error: msg };
      }

      if (data.user) {
        // Crear el perfil si no existe (primer registro con Google).
        // El schema no tiene trigger automático, así que se crea aquí.
        let profile = null;
        try {
          profile = await getProfile(data.user.id);
        } catch (_) {
          // La tabla profiles puede no existir todavía; no bloqueamos el login.
        }
        if (!profile) {
          const info = decodeJwtPayload(credential);
          try {
            await createProfile(data.user.id, {
              email: info.email || data.user.email,
              full_name: info.name || data.user.user_metadata?.full_name || info.email?.split('@')[0] || 'Usuario Google',
              phone: null,
              avatar_url: info.picture || null
            });
          } catch (_) {
            // console.warn('[KAVARI Auth] No se pudo crear el perfil (¿tabla profiles ausente?).');
          }
        }
        profile = await getProfileWithRetry(data.user.id);
        if (profile) {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        }
      }

      return { data, error: null };
    } catch (e) {
      console.error('[KAVARI Auth] Error en Google token login:', e);
      return { data: null, error: e.message || 'Error al conectar con Google' };
    }
  }

  /* ─── Auth: Login con GitHub (OAuth redirect de Supabase) ─── */
  async function signInWithGitHub() {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) {
      return { error: 'Supabase no está disponible.' };
    }

    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: getOAuthRedirectUrl()
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (e) {
      console.error('[KAVARI Auth] Error en GitHub login:', e);
      return { data: null, error: e.message || 'Error al conectar con GitHub' };
    }
  }

  /* ─── Auth: Enviar código OTP por email ─── */
  async function sendOtpEmail(email) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) {
      return { error: 'Supabase no está disponible.' };
    }

    try {
      const { data, error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (e) {
      console.error('[KAVARI Auth] Error enviando OTP:', e);
      return { data: null, error: e.message || 'Error al enviar código' };
    }
  }

  /* ─── Auth: Verificar código OTP ─── */
  async function verifyOtp(email, token) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) {
      return { error: 'Supabase no está disponible.' };
    }

    try {
      const { data, error } = await client.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) throw error;
      return { data, error: null };
    } catch (e) {
      console.error('[KAVARI Auth] Error verificando OTP:', e);
      return { data: null, error: e.message || 'Código inválido' };
    }
  }

  /* ─── Auth: Cerrar sesión ─── */
  async function signOut() {
    const client = window.KavariDB?.getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem('kavari-user');
    localStorage.removeItem('kavari-plan');
    localStorage.removeItem('kavari-pais-likes'); // datos locales del usuario (likes)
    localStorage.removeItem('kavari-pais-likes-order'); // orden de favoritos del usuario
    localStorage.removeItem('kavari-pais-likes-time'); // fechas de los likes del usuario
    window.dispatchEvent(new CustomEvent('kavari:authchange', { detail: { user: null } }));
  }

  /* ─── Perfil: Crear perfil en Supabase ─── */
  async function createProfile(userId, profileData) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('profiles')
        .upsert({
          id: userId,
          email: profileData.email,
          full_name: profileData.full_name,
          phone: profileData.phone || null,
          avatar_url: profileData.avatar_url || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('[KAVARI Auth] Error creando perfil:', e);
      return null;
    }
  }

  /* ─── Perfil: Obtener perfil ─── */
  async function getProfile(userId) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('[KAVARI Auth] Error obteniendo perfil:', e);
      return null;
    }
  }

  /**
   * Igual que getProfile pero reintenta un par de veces con una pequeña
   * espera. Útil justo después de signUp/OAuth, cuando el trigger de la
   * base de datos que crea la fila en "profiles" puede tardar unos
   * milisegundos más que la respuesta de auth.
   */
  async function getProfileWithRetry(userId, attempts = 3, delayMs = 400) {
    for (let i = 0; i < attempts; i++) {
      const profile = await getProfile(userId);
      if (profile) return profile;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs));
    }
    return null;
  }

  /* ─── Perfil: Actualizar perfil ─── */
  async function updateProfile(userId, updates) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Actualizar cache local
      const profile = await getProfile(userId);
      if (profile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      }

      return data;
    } catch (e) {
      console.error('[KAVARI Auth] Error actualizando perfil:', e);
      return null;
    }
  }

  /* ─── Perfil: Subir foto de perfil a Supabase Storage ─── */
  async function uploadAvatar(userId, file) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await client.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = client.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Actualizar perfil con la nueva URL
      await updateProfile(userId, { avatar_url: publicUrl });

      return publicUrl;
    } catch (e) {
      console.error('[KAVARI Auth] Error subiendo avatar:', e);
      return null;
    }
  }

  /* ─── Cuenta: Eliminar cuenta ─── */
  /**
   * Elimina la cuenta del usuario actual. Por seguridad, Supabase no
   * permite borrar un usuario de auth.users desde el cliente (se
   * necesita la service_role key, que nunca debe exponerse en el
   * navegador). Esto invoca una Edge Function llamada "delete-account"
   * que debes crear en tu proyecto de Supabase — ver instrucciones en
   * el mensaje de entrega.
   */
  async function deleteAccount() {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) return { error: 'Supabase no está disponible.' };

    try {
      const { data, error } = await client.functions.invoke('delete-account');
      if (error) throw error;

      // Si la función tuvo éxito, cerramos la sesión local
      await signOut();
      return { data, error: null };
    } catch (e) {
      console.error('[KAVARI Auth] Error eliminando cuenta:', e);
      return { data: null, error: e.message || 'Error al eliminar la cuenta' };
    }
  }

  /* ─── Guías: Registrar guía en Supabase ─── */
  async function registerGuide(guideData) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) return { error: 'Supabase no está disponible.' };

    try {
      const { data, error } = await client
        .from('guide_registrations')
        .insert({
          user_id: guideData.userId || null,
          full_name: guideData.fullName,
          email: guideData.email,
          phone: guideData.phone,
          photo_url: guideData.photoUrl || null,
          country_code: guideData.country,
          description: guideData.description,
          languages: guideData.languages,
          specialties: guideData.specialties,
          membership_tier: guideData.membership,
          criminal_record_url: guideData.criminalRecordUrl || null,
          medical_record_url: guideData.medicalRecordUrl || null,
          verification_status: 'pending'
        });

      if (error) throw error;
      return { data, error: null };
    } catch (e) {
      console.error('[KAVARI Auth] Error registrando guía:', e);
      return { data: null, error: e.message || 'Error al registrar guía' };
    }
  }

  /* ─── Guías: Subir documento (criminal/médico) a Supabase Storage ─── */
  async function uploadGuideDocument(userId, file, docType) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${docType}.${fileExt}`;

      const { error: uploadError } = await client.storage
        .from('guide-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = client.storage
        .from('guide-documents')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (e) {
      console.error('[KAVARI Auth] Error subiendo documento:', e);
      return null;
    }
  }

  /* ─── Guías: Obtener guías por país ─── */
  async function getGuidesByCountry(countryCode) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('guide_registrations')
        .select('*')
        .eq('country_code', countryCode)
        .eq('verification_status', 'approved')
        .order('membership_tier', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('[KAVARI Auth] Error obteniendo guías:', e);
      return [];
    }
  }

  /* ─── Likes: Obtener likes del usuario ─── */
  async function getUserLikes(userId) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client || !userId) return [];

    try {
      const { data, error } = await client
        .from('pais_likes')
        .select('pais_code')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(row => row.pais_code);
    } catch (e) {
      console.error('[KAVARI Auth] Error obteniendo likes:', e);
      return [];
    }
  }

  /* ─── Likes: Obtener likes del usuario con su fecha (para ordenar por recencia) ─── */
  async function getUserLikesWithTime(userId) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client || !userId) return [];

    try {
      const { data, error } = await client
        .from('pais_likes')
        .select('pais_code, created_at')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('[KAVARI Auth] Error obteniendo likes con fecha:', e);
      return [];
    }
  }

  /* ─── Likes: Guardar el orden de los favoritos de un usuario ─── */
  async function setLikeOrder(userId, orderedCodes) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client || !userId || !Array.isArray(orderedCodes)) return false;

    try {
      const rows = orderedCodes
        .filter(Boolean)
        .map((code, i) => ({ user_id: userId, pais_code: code, sort_order: i + 1 }));
      if (!rows.length) return true;

      const { error } = await client
        .from('pais_likes')
        .upsert(rows, { onConflict: 'user_id,pais_code' });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('[KAVARI Auth] Error guardando orden de likes:', e);
      return false;
    }
  }

  /* ─── Likes: Guardar/quitar un like de un país ───
     Al dar like devuelve { ok, created_at } con la fecha REAL registrada por
     Supabase (el servidor pone NOW()), para que el orden "Más reciente"
     siempre use la fecha de la cuenta y no la del reloj del navegador. */
  async function setUserLike(userId, paisCode, liked) {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client || !userId || !paisCode) return { ok: false, created_at: null };

    try {
      if (liked) {
        const { data, error } = await client
          .from('pais_likes')
          .upsert({ user_id: userId, pais_code: paisCode }, { onConflict: 'user_id,pais_code' })
          .select('pais_code, created_at')
          .single();
        if (error) throw error;
        return { ok: true, created_at: data?.created_at || null };
      } else {
        const { error } = await client
          .from('pais_likes')
          .delete()
          .eq('user_id', userId)
          .eq('pais_code', paisCode);
        if (error) throw error;
        return { ok: true, created_at: null };
      }
    } catch (e) {
      console.error('[KAVARI Auth] Error guardando like:', e);
      return { ok: false, created_at: null };
    }
  }

  /* ─── Listener de cambios de autenticación ─── */
  function initAuthListener() {
    const client = window.KavariDB?.getSupabaseClient();
    if (!client) return;

    client.auth.onAuthStateChange(async (event, session) => {
      // console.log('[KAVARI Auth] Evento:', event);

      if (session?.user) {
        let profile = await getProfile(session.user.id);
        // Flujo OAuth (Google/GitHub): la tabla profiles no tiene trigger, así
        // que creamos la fila aquí la primera vez (igual que en signInWithGoogleToken).
        if (!profile) {
          const meta = session.user.user_metadata || {};
          try {
            await createProfile(session.user.id, {
              email: session.user.email,
              full_name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Usuario',
              phone: null,
              avatar_url: meta.avatar_url || meta.picture || null
            });
            profile = await getProfile(session.user.id);
          } catch (err) {
            // console.warn('[KAVARI Auth] No se pudo crear el perfil:', err);
          }
        }
        if (profile) {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        }
        window.dispatchEvent(new CustomEvent('kavari:authchange', {
          detail: { user: session.user, profile }
        }));
      } else {
        localStorage.removeItem(PROFILE_KEY);
        window.dispatchEvent(new CustomEvent('kavari:authchange', {
          detail: { user: null }
        }));
      }
    });
  }

  /* ─── Inicializar al cargar ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initAuthListener();
  });

  /* ─── Exportar API pública ─── */
  window.KavariAuth = {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithGoogleToken,
    signInWithGitHub,
    sendOtpEmail,
    verifyOtp,
    signOut,
    createProfile,
    getProfile,
    getProfileWithRetry,
    updateProfile,
    uploadAvatar,
    deleteAccount,
    registerGuide,
    uploadGuideDocument,
    getGuidesByCountry,
    getUserLikes,
    getUserLikesWithTime,
    setUserLike,
    setLikeOrder,
    escapeHtml
  };
})();