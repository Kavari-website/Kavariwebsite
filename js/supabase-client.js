/**
 * supabase-client.js — Cliente Supabase para KAVARI
 * Inicializa la conexión con Supabase para autenticación, base de datos y storage.
 *
 * IMPORTANTE: La clave ANON debe corresponder a tu proyecto real.
 * Panel → Settings → API → Project API keys → "anon public"
 *
 * Este archivo SOLO expone helpers de bajo nivel (cliente y sesión).
 * Toda la lógica de negocio (registro, login, Google, perfil, avatar,
 * eliminar cuenta) vive en js/auth.js, bajo window.KavariAuth.
 */

const SUPABASE_URL = 'https://dxxiwtakhtbuzljjilnp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-TbybQaKJP3496dqAV2qiA_ullV60oW'; // anon/publishable key

/**
 * Inicializa el cliente Supabase usando el CDN global.
 * Asegúrate de incluir el script de Supabase antes de este archivo:
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */
function getSupabaseClient() {
  if (window.supabase && window.supabase.createClient) {
    if (!window._kavariSupabase) {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('[KAVARI] Supabase URL o ANON_KEY no configurados.');
        return null;
      }
      window._kavariSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
    }
    return window._kavariSupabase;
  }
  return null;
}

/**
 * Obtiene la sesión actual del usuario.
 * @returns {Promise<Object|null>} Sesión o null
 */
async function getCurrentSession() {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data: { session } } = await client.auth.getSession();
    return session;
  } catch (e) {
    console.error('[KAVARI] Error obteniendo sesión:', e);
    return null;
  }
}

/**
 * Obtiene el usuario actual autenticado.
 * @returns {Promise<Object|null>} Usuario o null
 */
async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}

/**
 * Verifica si hay un usuario autenticado.
 * @returns {Promise<boolean>}
 */
async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

// Exportar para uso global (sin exponer la clave en window)
window.KavariDB = {
  getSupabaseClient,
  getCurrentSession,
  getCurrentUser,
  isAuthenticated,
  SUPABASE_URL
};