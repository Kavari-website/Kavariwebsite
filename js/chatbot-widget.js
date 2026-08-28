/**
 * chatbot-widget.js — Asistente flotante KAVARI (todas las páginas) · v3
 * Cambios de la v3 (memoria e IA):
 *  - MEMORIA de conversación por contexto (país o general): cada charla
 *    se guarda en localStorage y se restaura al volver a abrir el chat,
 *    aunque cambies de página. Con sesión iniciada también se guarda en
 *    Supabase (tabla chat_messages) y se recuerda en cualquier dispositivo.
 *  - El historial de los últimos mensajes se envía al servidor para que el
 *    asistente (Gemini) recuerde el contexto de la conversación.
 *  - Se envía también el perfil del usuario (nombre, plan, favoritos) para
 *    personalizar las respuestas.
 *  - Las respuestas de la IA se renderizan como markdown simple (**negrita**,
 *    listas "-", saltos de línea) con texto escapado (seguro).
 *  - El endpoint del servidor se puede cambiar con localStorage
 *    'kavari-chat-api' (por defecto localhost:3007 en desarrollo, o la
 *    misma URL del sitio en producción).
 *  - Timeout ampliado a 50s (con búsqueda web la IA tarda más).
 *  - Si el servidor devuelve fuentes web (Google Search Grounding),
 *    se muestran como enlaces bajo la respuesta.
 */
(function () {
  let ctx = { country: null, guias: [], aerolineas: [], hospedajes: [] };
  let opened = false;
  let welcomeShown = false;
  let thinking = false;

  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const CHAT_API = (localStorage.getItem('kavari-chat-api') || (isLocal ? 'http://localhost:3007' : '')).replace(/\/+$/, '');
  const CHAT_URL = CHAT_API + '/api/chat';
  const MAX_HISTORY = 24;

  function lang() {
    return localStorage.getItem('kavari-idioma') || 'es';
  }

  function msg(es, en, pt) {
    const l = lang();
    return l === 'en' ? en : l === 'pt' ? pt : es;
  }

  function cname(d) {
    return (window.paisNombre && d?.code) ? (window.paisNombre(d.code, d.nombre) || d.nombre) : (d?.nombre || '');
  }

  /* ═══════════════════ memoria de conversación ═══════════════════ */
  function slugify(s) {
    return String(s || '').toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function contextKey() {
    if (ctx.country?.code) return 'pais-' + String(ctx.country.code);
    if (ctx.country?.nombre) return 'pais-' + slugify(ctx.country.nombre);
    return 'general';
  }

  function historyKey() {
    return 'kavari-chat-history-' + contextKey();
  }

  function loadHistory() {
    try {
      const h = JSON.parse(localStorage.getItem(historyKey()) || '[]');
      return Array.isArray(h) ? h : [];
    } catch (_) {
      return [];
    }
  }

  function saveHistory(h) {
    try {
      localStorage.setItem(historyKey(), JSON.stringify(h.slice(-MAX_HISTORY)));
    } catch (_) { /* almacenamiento lleno */ }
  }

  async function getUserId() {
    try {
      const s = await window.KavariDB?.getCurrentSession?.();
      return s?.user?.id || null;
    } catch (_) {
      return null;
    }
  }

  async function supabaseLoadHistory(userId) {
    if (!userId) return null;
    try {
      const client = window.KavariDB?.getSupabaseClient?.();
      if (!client) return null;
      const { data, error } = await client
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('user_id', userId)
        .eq('session_key', contextKey())
        .order('created_at', { ascending: true })
        .limit(MAX_HISTORY);
      if (error || !data || !data.length) return null;
      return data.map(r => ({ role: r.role === 'model' ? 'model' : 'user', text: r.content }));
    } catch (_) {
      return null;
    }
  }

  async function supabaseSaveTurn(userId, role, text) {
    if (!userId) return;
    try {
      const client = window.KavariDB?.getSupabaseClient?.();
      if (!client) return;
      await client.from('chat_messages').insert({
        user_id: userId,
        session_key: contextKey(),
        role,
        content: String(text).slice(0, 4000)
      });
    } catch (_) { /* sin tabla todavía: no rompe nada */ }
  }

  function pushTurn(role, text) {
    if (!text || !String(text).trim()) return;
    const hist = loadHistory();
    hist.push({ role, text: String(text).trim() });
    saveHistory(hist);
    getUserId().then(id => { if (id) supabaseSaveTurn(id, role, String(text).trim()); });
  }

  function userInfo() {
    const info = { name: null, plan: null, favorites: [] };
    try {
      const u = JSON.parse(localStorage.getItem('kavari-user') || 'null');
      if (u && u.name) info.name = String(u.name).slice(0, 60);
    } catch (_) { /* sin sesión local */ }
    try {
      info.plan = localStorage.getItem('kavari-plan') || null;
    } catch (_) { /* noop */ }
    try {
      const likes = JSON.parse(localStorage.getItem('kavari-pais-likes') || '{}');
      info.favorites = Object.keys(likes || {});
    } catch (_) { /* noop */ }
    return info;
  }

  /* ═══════════════════ construcción del widget ═══════════════════ */
  function injectWidget() {
    if (document.getElementById('kavari-chat-root')) return;

    const root = document.createElement('div');
    root.id = 'kavari-chat-root';
    root.innerHTML = `
      <div id="kavari-mascot" role="button" tabindex="0" aria-label="KAVARI mascot" title="KAVARI">
        <div class="kavari-mascot-inner"><img src="img/mascota.png" alt="" onerror="this.parentElement.style.display='none'"></div>
      </div>
      <div id="kavari-asistente" role="dialog" aria-modal="false" aria-label="Asistente KAVARI">
        <div id="kavari-chat-panel">
          <div id="kavari-chat-header">
            <div>
              <strong id="kavari-chat-title">KAVARI Asistente</strong>
              <span id="kavari-chat-subtitle">Tu guía de viaje</span>
            </div>
            <div id="kavari-chat-header-actions">
              <button id="kavari-chat-clear" type="button" title="Limpiar conversación" aria-label="Limpiar conversación">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
              <button id="kavari-chat-close" type="button" aria-label="Cerrar">&times;</button>
            </div>
          </div>
          <div id="kavari-mensajes" role="log" aria-live="polite" aria-relevant="additions"></div>
          <div id="kavari-chat-input-row">
            <input type="text" id="kavari-chat-input" placeholder="Escribe tu pregunta..." autocomplete="off" maxlength="300">
            <button id="kavari-chat-send" type="button" aria-label="Enviar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    if (!document.getElementById('kavari-chat-extra-style')) {
      const st = document.createElement('style');
      st.id = 'kavari-chat-extra-style';
      st.textContent =
        '.kb-msg-sources{margin-top:8px;font-size:11px;line-height:1.5;opacity:.75;word-break:break-word}' +
        '.kb-msg-sources a{color:inherit;text-decoration:underline}';
      document.head.appendChild(st);
    }
    bindEvents();
    refreshUI();
    showBadgeIfNeeded();
  }

  function bindEvents() {
    const closeBtn = document.getElementById('kavari-chat-close');
    const sendBtn = document.getElementById('kavari-chat-send');
    const input = document.getElementById('kavari-chat-input');
    const panel = document.getElementById('kavari-asistente');
    const mascot = document.getElementById('kavari-mascot');
    const clearBtn = document.getElementById('kavari-chat-clear');

    if (mascot) {
      mascot.addEventListener('click', toggle);
      mascot.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    }
    closeBtn.addEventListener('click', close);
    sendBtn.addEventListener('click', sendFromInput);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendFromInput();
    });
    if (clearBtn) clearBtn.addEventListener('click', clearConversation);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && opened) close();
    });

    document.addEventListener('click', e => {
      if (!opened) return;
      const root = document.getElementById('kavari-chat-root');
      if (root && !root.contains(e.target)) close();
    });
    panel.addEventListener('click', e => e.stopPropagation());

    window.addEventListener('kavari:langchange', refreshUI);
  }

  function showBadgeIfNeeded() {
    const badge = document.getElementById('kavari-chat-badge');
    if (!badge) return;
    const seen = sessionStorage.getItem('kavari-chat-seen');
    if (!seen) badge.hidden = false;
  }

  function hideBadge() {
    const badge = document.getElementById('kavari-chat-badge');
    if (badge) badge.hidden = true;
    sessionStorage.setItem('kavari-chat-seen', '1');
  }

  /* ═══════════════════ abrir / cerrar ═══════════════════ */
  function toggle() {
    opened ? close() : open();
  }

  function open() {
    opened = true;
    hideBadge();
    document.getElementById('kavari-asistente').classList.add('activo');
    restoreMemory();
    setTimeout(() => {
      const input = document.getElementById('kavari-chat-input');
      if (input) input.focus({ preventScroll: true });
    }, 200);
  }

  function close() {
    opened = false;
    const panel = document.getElementById('kavari-asistente');
    panel.classList.add('cerrando');
    panel.classList.remove('activo');
    setTimeout(() => panel.classList.remove('cerrando'), 300);
  }

  /* ═══════════════════ memoria visual ═══════════════════ */
  // Muestra el historial guardado (memoria) del contexto actual.
  function restoreMemory() {
    const box = document.getElementById('kavari-mensajes');
    if (!box) return;
    welcomeShown = false;
    box.innerHTML = '';

    const hist = loadHistory();
    hist.forEach(m => {
      if (m.role === 'model') {
        addBotMessage(renderBotText(m.text), false);
      } else {
        addUserMessage(m.text);
      }
    });
    box.scrollTop = box.scrollHeight;

    // Si hay sesión, intentamos recuperar desde Supabase (memoria en la nube).
    getUserId().then(async userId => {
      if (!userId) {
        if (!hist.length) showWelcome();
        return;
      }
      const cloud = await supabaseLoadHistory(userId);
      if (cloud && cloud.length) {
        saveHistory(cloud);
        box.innerHTML = '';
        cloud.forEach(m => {
          if (m.role === 'model') addBotMessage(renderBotText(m.text), false);
          else addUserMessage(m.text);
        });
        box.scrollTop = box.scrollHeight;
      } else if (!hist.length) {
        showWelcome();
      }
    });
  }

  /* ═══════════════════ mensajes ═══════════════════ */
  function showWelcome() {
    welcomeShown = true;
    const t = window.t || (k => k);
    const d = ctx.country;
    let html;
    if (d?.nombre) {
      html = t('chatWelcomeDestino').replace('{nombre}', escapeHtml(cname(d)));
    } else {
      html = t('chatWelcomeGeneral');
    }
    addBotMessage(html, true);
  }

  function refreshUI() {
    const t = window.t || (k => k);
    const title = document.getElementById('kavari-chat-title');
    const subtitle = document.getElementById('kavari-chat-subtitle');
    const input = document.getElementById('kavari-chat-input');
    const clearBtn = document.getElementById('kavari-chat-clear');
    if (title) title.textContent = t('chatTitle');
    if (subtitle) {
      subtitle.textContent = ctx.country?.nombre
        ? t('chatSubtitleDestino').replace('{nombre}', cname(ctx.country))
        : t('chatSubtitle');
    }
    if (input) input.placeholder = t('chatInputPlaceholder');
    if (clearBtn) clearBtn.title = msg('Limpiar conversación', 'Clear conversation', 'Limpar conversa');
  }

  function clearConversation() {
    try {
      localStorage.removeItem(historyKey());
    } catch (_) { /* noop */ }
    getUserId().then(userId => {
      if (!userId) return;
      const client = window.KavariDB?.getSupabaseClient?.();
      if (!client) return;
      client.from('chat_messages')
        .delete()
        .eq('user_id', userId)
        .eq('session_key', contextKey())
        .then(() => {})
        .catch(() => {});
    });
    const box = document.getElementById('kavari-mensajes');
    if (box) box.innerHTML = '';
    welcomeShown = false;
    showWelcome();
    setThinking(false);
    const rep = msg('Conversación limpia. ¿En qué te ayudo?', 'Conversation cleared. How can I help you?', 'Conversa limpa. Como posso ajudá-lo?', 'Conversation effacée. Comment puis-je vous aider ?');
    addBotMessage(renderBotText(rep));
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Convierte markdown simple de la IA en HTML seguro (texto escapado).
  function renderBotText(text) {
    let html = escapeHtml(text || '');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    const lines = html.split('\n');
    const out = [];
    let inList = false;
    for (const line of lines) {
      const m = line.match(/^\s*[-*]\s+(.*)$/);
      if (m) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + m[1].trim() + '</li>');
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(line);
      }
    }
    if (inList) out.push('</ul>');
    html = out.join('\n')
      .replace(/\n{2,}/g, '<br><br>')
      .replace(/\n/g, '<br>');
    return html;
  }

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'kb-msg-user';
    div.textContent = text;
    const box = document.getElementById('kavari-mensajes');
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function addBotMessage(html, isWelcome) {
    const div = document.createElement('div');
    div.className = isWelcome ? 'kb-msg-welcome' : 'kb-msg-bot';
    div.innerHTML = html;
    const box = document.getElementById('kavari-mensajes');
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function showTyping() {
    const box = document.getElementById('kavari-mensajes');
    if (!box || document.getElementById('kavari-typing')) return;
    const div = document.createElement('div');
    div.id = 'kavari-typing';
    div.className = 'kb-msg-bot kb-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('kavari-typing');
    if (el) el.remove();
  }

  function setThinking(state) {
    thinking = state;
    const input = document.getElementById('kavari-chat-input');
    const sendBtn = document.getElementById('kavari-chat-send');
    if (input) input.disabled = state;
    if (sendBtn) sendBtn.disabled = state;
  }

  /* ═══════════════════ envío y respuesta ═══════════════════ */
  async function handleQuestion(text) {
    if (thinking || !text || !text.trim()) return;
    addUserMessage(text);
    pushTurn('user', text);
    setThinking(true);
    showTyping();

    let aiReply = null;
    let aiSources = [];
    const controller = new AbortController();
    // 50s: con búsqueda web (Google Search Grounding) la IA puede tardar más.
    const timeoutId = setTimeout(() => controller.abort(), 50000);
    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: { ...ctx, lang: lang() },
          history: loadHistory().slice(-14),
          user: userInfo()
        }),
        signal: controller.signal
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          aiReply = data.reply;
          aiSources = Array.isArray(data.sources) ? data.sources : [];
        }
      }
    } catch (_) {
      // Servidor no disponible → motor local
    }
    clearTimeout(timeoutId);

    hideTyping();

    let html;
    if (aiReply) {
      html = renderBotText(aiReply);
    } else {
      try {
        const q = text.toLowerCase();
        if (ctx.country?.nombre && typeof generateChatResponse === 'function') {
          html = generateChatResponse(q, ctx);
        } else if (typeof generateGeneralResponse === 'function') {
          html = generateGeneralResponse(q);
        } else {
          html = msg('¿En qué puedo ayudarte?', 'How can I help you?', 'Como posso ajudá-lo?', 'Comment puis-je vous aider ?');
        }
      } catch (err) {
        html = msg(
          'Lo siento, algo falló al responder eso. Intenta reformular tu pregunta.',
          'Sorry, something went wrong answering that. Try rephrasing your question.',
          'Desculpe, algo deu errado ao responder isso. Tente reformular a sua pergunta.',
          'Désolé, une erreur est survenue. Essayez de reformuler votre question.'
        );
      }
    }

    addBotMessage(html);

    // Fuentes web citadas por la búsqueda (si las hubo).
    if (aiReply && aiSources.length) {
      const bubbles = document.querySelectorAll('#kavari-mensajes .kb-msg-bot');
      const lastMsg = bubbles[bubbles.length - 1];
      if (lastMsg) {
        const label = msg('Fuentes', 'Sources', 'Fontes');
        const links = aiSources.map(s => {
          const uri = escapeHtml(String(s.uri || ''));
          const txt = escapeHtml(String(s.title || s.host || s.uri || '').slice(0, 70));
          return `<a href="${uri}" target="_blank" rel="noopener noreferrer">${txt}</a>`;
        }).join('');
        lastMsg.insertAdjacentHTML('beforeend',
          `<div class="kb-msg-sources">${label}: ${links}</div>`);
      }
    }
    // Guardar en memoria el texto plano (sin HTML) para el historial.
    const plainForMemory = aiReply ? aiReply : html.replace(/<[^>]+>/g, ' ');
    pushTurn('model', plainForMemory);
    setThinking(false);
    const input = document.getElementById('kavari-chat-input');
    if (input) input.focus({ preventScroll: true });
  }

  function sendFromInput() {
    if (thinking) return;
    const input = document.getElementById('kavari-chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    handleQuestion(text);
  }

  /* ═══════════════════ contexto (país activo) ═══════════════════ */
  function setContext(newCtx) {
    ctx = {
      country: newCtx?.country || newCtx || null,
      guias: newCtx?.guias || [],
      aerolineas: newCtx?.aerolineas || [],
      hospedajes: newCtx?.hospedajes || []
    };
    welcomeShown = false;
    const msgs = document.getElementById('kavari-mensajes');
    if (msgs) msgs.innerHTML = '';
    refreshUI();
    if (opened) restoreMemory();
  }

  window.KavariChatbot = { setContext, open, close, toggle };

  document.addEventListener('DOMContentLoaded', () => {
    injectWidget();
    tryLoadCountryFromStorage();
  });

  async function tryLoadCountryFromStorage() {
    // No cargar país si estamos en la página principal (index.html)
    // El chatbot debe ser general en la página de inicio
    const isIndex = /index\.html$/i.test(location.pathname) || location.pathname === '/' || /\/index$/i.test(location.pathname);
    if (isIndex) {
      localStorage.removeItem('paisSeleccionado');
      return;
    }
    const code = localStorage.getItem('paisSeleccionado');
    if (!code) return;
    try {
      let all = null;
      const lang = (localStorage.getItem('kavari-idioma') || localStorage.getItem('idioma') || 'es');
      try {
        const cached = sessionStorage.getItem('kavari-data-cache-v1-' + lang);
        if (cached) all = JSON.parse(cached);
      } catch (_) { /* noop */ }
      if (!all) {
        const res = await fetch('data/data.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('data.json ' + res.status);
        all = await res.json();
        try {
          const i18nRes = await fetch('data/i18n/' + lang + '.json', { cache: 'no-cache' });
          if (i18nRes.ok) {
            const i18n = await i18nRes.json();
            all = applyI18n(all, i18n);
          }
        } catch (_) { /* noop */ }
        try { sessionStorage.setItem('kavari-data-cache-v1-' + lang, JSON.stringify(all)); } catch (_) { /* noop */ }
      }
      if (!all[code]) return;
      const d = all[code];
      setContext({
        country: d,
        guias: d.guias || [],
        aerolineas: d.aerolineas || [],
        hospedajes: d.hospedajes || []
      });
    } catch (e) {
      // console.warn('KAVARI chatbot: no se pudo cargar data.json', e);
    }
  }

  function applyI18n(data, i18n) {
    if (!data || !i18n) return data;
    const clone = JSON.parse(JSON.stringify(data));
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
    return clone;
  }
})();
