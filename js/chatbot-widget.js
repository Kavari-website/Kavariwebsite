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
 *  - Timeout ampliado a 35s (Gemini tarda más que el motor local).
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
    return (localStorage.getItem('kavari-idioma') || 'es') === 'en';
  }

  const generalQuestions = [
    { qKey: 'chatQDestino', key: 'destino' },
    { qKey: 'chatQGuias', key: 'guía' },
    { qKey: 'chatQPlanes', key: 'planes' },
    { qKey: 'chatQCuenta', key: 'cuenta' },
    { qKey: 'chatQIdioma', key: 'idioma' },
    { qKey: 'chatQPaquetes', key: 'paquete' },
    { qKey: 'chatQAyuda', key: 'ayuda' },
    { qKey: 'chatQContacto', key: 'contacto' }
  ];

  function getDestinationQuestions(d) {
    const n = d.nombre;
    const t = window.t || (k => k);
    return [
      { q: t('chatBtnDestinoEpoca').replace('{nombre}', n), text: t('chatQDestinoEpoca').replace('{nombre}', n) },
      { q: t('chatBtnDestinoDoc'), text: t('chatQDestinoDoc') },
      { q: t('chatBtnDestinoImp'), text: t('chatQDestinoImp').replace('{nombre}', n) },
      { q: t('chatBtnDestinoPlatos'), text: t('chatQDestinoPlatos').replace('{nombre}', n) },
      { q: t('chatBtnDestinoCosto'), text: t('chatQDestinoCosto').replace('{nombre}', n) }
    ];
  }

  /* ═══════════════════ memoria de conversación ═══════════════════ */
  function slugify(s) {
    return String(s || '').toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function contextKey() {
    if (ctx.country?.nombre) return 'pais-' + slugify(ctx.country.nombre);
    if (ctx.country?.code) return 'pais-' + String(ctx.country.code);
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
          <div id="kavari-preguntas"></div>
          <div id="kavari-acciones"></div>
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
    renderQuestions();
    renderAcciones();
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
      html = t('chatWelcomeDestino').replace('{nombre}', escapeHtml(d.nombre));
    } else {
      html = t('chatWelcomeGeneral');
    }
    addBotMessage(html, true);
  }

  function renderQuestions() {
    const box = document.getElementById('kavari-preguntas');
    if (!box) return;
    box.innerHTML = '';

    const t = window.t || (k => k);
    const items = ctx.country?.nombre
      ? getDestinationQuestions(ctx.country)
      : generalQuestions.map(i => ({ q: t(i.qKey), text: t(i.qKey), key: i.key }));

    items.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kb-pregunta-btn';
      btn.textContent = item.q;
      btn.disabled = thinking;
      btn.addEventListener('click', () => handleQuestion(item.text || item.q));
      box.appendChild(btn);
    });
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
        ? t('chatSubtitleDestino').replace('{nombre}', ctx.country.nombre)
        : t('chatSubtitle');
    }
    if (input) input.placeholder = t('chatInputPlaceholder');
    if (clearBtn) clearBtn.title = lang() ? 'Clear conversation' : 'Limpiar conversación';
    if (opened) { renderQuestions(); renderAcciones(); }
  }

  /* ═══════════════════ acciones rápidas ═══════════════════ */
  function actionItems() {
    const L = lang();
    return [
      { key: 'destinos', label: L ? 'Destinations' : 'Destinos' },
      { key: 'guias', label: L ? 'Guides' : 'Guías' },
      { key: 'paquetes', label: L ? 'Packages' : 'Paquetes' },
      { key: 'contacto', label: L ? 'Contact' : 'Contacto' }
    ];
  }

  function renderAcciones() {
    const box = document.getElementById('kavari-acciones');
    if (!box) return;
    box.innerHTML = '';
    actionItems().forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kb-accion-btn';
      btn.textContent = item.label;
      btn.dataset.action = item.key;
      btn.addEventListener('click', () => doAction(item.key));
      box.appendChild(btn);
    });
  }

  function navigate(href) {
    if (window.kavariNavigate) {
      try { window.kavariNavigate(href); return; } catch (_) { /* noop */ }
    }
    window.location.href = href;
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function doAction(action) {
    const L = lang();
    let reply;
    switch (action) {
      case 'destinos':
        reply = L ? 'Opening destinations…' : 'Abriendo destinos…';
        addBotMessage(renderBotText(reply));
        pushTurn('model', reply);
        navigate('paises.html');
        break;
      case 'guias':
        reply = L ? 'Opening certified guides…' : 'Abriendo guías certificados…';
        addBotMessage(renderBotText(reply));
        pushTurn('model', reply);
        if (/destino\.html/i.test(location.pathname)) {
          scrollToSection('guias');
        } else {
          navigate('paises.html');
        }
        break;
      case 'paquetes':
        if (/index\.html$/i.test(location.pathname) || location.pathname === '/' || /\/index$/i.test(location.pathname)) {
          reply = L ? 'Here are our travel packages — pick the one you like.' : 'Aquí tienes nuestros paquetes de viaje — elige el que te guste.';
          addBotMessage(renderBotText(reply));
          pushTurn('model', reply);
          scrollToSection('paquetes');
        } else {
          reply = L ? 'Opening travel packages…' : 'Abriendo paquetes de viaje…';
          addBotMessage(renderBotText(reply));
          pushTurn('model', reply);
          navigate('index.html#paquetes');
        }
        break;
      case 'contacto':
        reply = L ? 'Opening the contact page…' : 'Abriendo la página de contacto…';
        addBotMessage(renderBotText(reply));
        pushTurn('model', reply);
        navigate('contacto.html');
        break;
      default:
        return;
    }
  }

  function clearConversation() {
    const L = lang();
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
    const rep = L ? 'Conversation cleared. How can I help you?' : 'Conversación limpia. ¿En qué te ayudo?';
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
    document.querySelectorAll('.kb-pregunta-btn').forEach(b => { b.disabled = state; });
  }

  /* ═══════════════════ envío y respuesta ═══════════════════ */
  async function handleQuestion(text) {
    if (thinking || !text || !text.trim()) return;
    addUserMessage(text);
    pushTurn('user', text);
    setThinking(true);
    showTyping();

    let aiReply = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);
    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: { ...ctx, lang: lang() ? 'en' : 'es' },
          history: loadHistory().slice(-14),
          user: userInfo()
        }),
        signal: controller.signal
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) aiReply = data.reply;
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
          html = lang() ? 'How can I help you?' : '¿En qué puedo ayudarte?';
        }
      } catch (err) {
        html = lang()
          ? 'Sorry, something went wrong answering that. Try rephrasing your question.'
          : 'Lo siento, algo falló al responder eso. Intenta reformular tu pregunta.';
      }
    }

    addBotMessage(html);
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
    const code = localStorage.getItem('paisSeleccionado');
    if (!code) return;
    try {
      let all = null;
      try {
        const cached = sessionStorage.getItem('kavari-data-cache-v1');
        if (cached) all = JSON.parse(cached);
      } catch (_) { /* noop */ }
      if (!all) {
        const res = await fetch('data/data.json');
        if (!res.ok) throw new Error('data.json ' + res.status);
        all = await res.json();
        try { sessionStorage.setItem('kavari-data-cache-v1', JSON.stringify(all)); } catch (_) { /* noop */ }
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
      console.warn('KAVARI chatbot: no se pudo cargar data.json', e);
    }
  }
})();
