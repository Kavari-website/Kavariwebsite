/**
 * admin-panel.js — Panel de administración (perfil.html)
 *
 * Muestra una pestaña "Panel" solo cuando la sesión pertenece a un
 * administrador (ver ADMIN_EMAILS). Lista las solicitudes de paquetes
 * y los mensajes de contacto, y permite cambiar su estado.
 *
 * IMPORTANTE: mantén ADMIN_EMAILS sincronizado con las políticas RLS de
 * server/schema.sql (auth.jwt() ->> 'email').
 */
(function () {
  var ADMIN_EMAILS = ['kavariwebsite@gmail.com'];
  var TAB = document.getElementById('perfilAdminTab');
  var CONTENT = document.getElementById('tabAdmin');

  var PK_STATUS = [
    { v: 'pending', label: 'Pendiente' },
    { v: 'contacted', label: 'Contactado' },
    { v: 'done', label: 'Completado' }
  ];
  var MSG_STATUS = [
    { v: 'new', label: 'Nuevo' },
    { v: 'read', label: 'Leído' },
    { v: 'answered', label: 'Respondido' }
  ];

  function esc(s) {
    return String(s === null || s === undefined ? '' : s).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
  }

  function fmtDate(s) {
    if (!s) return '—';
    try {
      var d = new Date(s);
      return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return String(s);
    }
  }

  function client() {
    return window.KavariDB && typeof window.KavariDB.getSupabaseClient === 'function'
      ? window.KavariDB.getSupabaseClient() : null;
  }

  function isAdmin(user) {
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.indexOf(String(user.email).toLowerCase().trim()) !== -1;
  }

  function refreshAccess(user) {
    if (!TAB || !CONTENT) return;
    var ok = isAdmin(user);
    TAB.style.display = ok ? '' : 'none';
    CONTENT.style.display = ok ? '' : 'none';
    if (ok) {
      loadPackages();
      loadMessages();
    }
  }

  function statusOptions(current, list) {
    return list.map(function (s) {
      return '<option value="' + s.v + '"' + (s.v === current ? ' selected' : '') + '>' + esc(s.label) + '</option>';
    }).join('');
  }

  function renderList(containerId, rows, emptyText, tpl) {
    var list = document.getElementById(containerId);
    if (!list) return;
    if (!rows || !rows.length) {
      list.innerHTML = '<p class="admin-empty">' + esc(emptyText) + '</p>';
      return;
    }
    list.innerHTML = rows.map(tpl).join('');
    Array.prototype.forEach.call(list.querySelectorAll('select[data-table]'), function (sel) {
      sel.addEventListener('change', function () {
        var c = client();
        if (!c) return;
        c.from(sel.getAttribute('data-table'))
          .update({ status: sel.value })
          .eq('id', sel.getAttribute('data-id'))
          .then(function (res) {
            if (res && res.error) {
              console.error('[KAVARI] Error actualizando estado:', res.error);
              sel.style.color = '#d64545';
            } else {
              sel.style.color = '';
            }
          });
      });
    });
  }

  function loadPackages() {
    var list = document.getElementById('adminPackList');
    if (!list) return;
    list.innerHTML = '<p class="admin-loading">Cargando solicitudes…</p>';
    var c = client();
    if (!c) {
      list.innerHTML = '<p class="admin-empty">Supabase no está disponible.</p>';
      return;
    }
    c.from('package_requests').select('*').order('created_at', { ascending: false }).limit(100).then(function (res) {
      if (res.error) {
        list.innerHTML = '<p class="admin-empty">Error al cargar: ' + esc(res.error.message) + '</p>';
        return;
      }
      renderList('adminPackList', res.data, 'Aún no hay solicitudes de paquetes.', function (p) {
        var notes = p.notes ? '<div class="admin-card-notes">' + esc(p.notes) + '</div>' : '';
        return (
          '<article class="admin-card">' +
            '<div class="admin-card-head"><strong>' + esc(p.full_name) + '</strong><small>' + fmtDate(p.created_at) + '</small></div>' +
            '<div class="admin-card-sub">' + esc(p.email) + (p.phone ? ' · ' + esc(p.phone) : '') + '</div>' +
            '<div class="admin-card-row"><span>Paquete</span><b>' + esc(p.package_name || p.package_id || '—') + '</b></div>' +
            '<div class="admin-card-row"><span>Destino</span><b>' + esc(p.country_code || '—') + '</b></div>' +
            '<div class="admin-card-row"><span>Viaje</span><b>' + esc(p.travel_date || '—') + ' · ' + esc(p.travelers || 1) + ' viajero(s)</b></div>' +
            notes +
            '<div class="admin-card-status"><span>Estado</span>' +
              '<select data-table="package_requests" data-id="' + esc(p.id) + '">' + statusOptions(p.status, PK_STATUS) + '</select>' +
            '</div>' +
          '</article>'
        );
      });
    });
  }

  function loadMessages() {
    var list = document.getElementById('adminMsgList');
    if (!list) return;
    list.innerHTML = '<p class="admin-loading">Cargando mensajes…</p>';
    var c = client();
    if (!c) {
      list.innerHTML = '<p class="admin-empty">Supabase no está disponible.</p>';
      return;
    }
    c.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(100).then(function (res) {
      if (res.error) {
        list.innerHTML = '<p class="admin-empty">Error al cargar: ' + esc(res.error.message) + '</p>';
        return;
      }
      renderList('adminMsgList', res.data, 'Aún no hay mensajes de contacto.', function (m) {
        return (
          '<article class="admin-card">' +
            '<div class="admin-card-head"><strong>' + esc(m.full_name) + '</strong><small>' + fmtDate(m.created_at) + '</small></div>' +
            '<div class="admin-card-sub">' + esc(m.email) + '</div>' +
            '<div class="admin-card-row"><span>Asunto</span><b>' + esc(m.subject) + '</b></div>' +
            '<div class="admin-card-notes">' + esc(m.message) + '</div>' +
            '<div class="admin-card-status"><span>Estado</span>' +
              '<select data-table="contact_messages" data-id="' + esc(m.id) + '">' + statusOptions(m.status, MSG_STATUS) + '</select>' +
            '</div>' +
          '</article>'
        );
      });
    });
  }

  function init() {
    if (!TAB && !CONTENT) return;
    window.addEventListener('kavari:authchange', function (e) {
      refreshAccess(e.detail && e.detail.user ? e.detail.user : null);
    });
    if (TAB) {
      TAB.addEventListener('click', function () {
        loadPackages();
        loadMessages();
      });
    }
    if (window.KavariDB && typeof window.KavariDB.getCurrentUser === 'function') {
      window.KavariDB.getCurrentUser().then(refreshAccess);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();