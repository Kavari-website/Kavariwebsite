(function(){
  const key='kavari-travelers';
  const get=()=>{try{return JSON.parse(localStorage.getItem(key))||[]}catch(_){return[]}};
  const esc=s=>String(s||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const initials=name=>String(name||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('')||'?';

  function open(){document.getElementById('travelerModal')?.classList.add('open');if(window.KavariScrollLock)KavariScrollLock.lock()}
  function close(){document.getElementById('travelerModal')?.classList.remove('open');if(window.KavariScrollLock)KavariScrollLock.unlock()}

  function t(key) {
    if (window.t) return window.t(key);
    return key;
  }

  function render(){
    const root=document.getElementById('travelersByCountry');
    if(!root)return;
    const countryKey=localStorage.getItem('paisSeleccionado')||'';
    const countryName=root.dataset.countryName||'';
    const items=get().filter(x=>x.country===countryKey);

    if(!countryKey){
      root.innerHTML=`
        <div class="tbc-head"><h3>${esc(t('travelerViajerosRegistrados'))}</h3></div>
        <div class="tbc-empty"><strong>${esc(t('travelerSeleccionaPais'))}</strong><span>${esc(t('travelerEligeDestino'))}</span></div>`;
      return;
    }

    if(!items.length){
      root.innerHTML=`
        <div class="tbc-head"><h3>${esc(t('travelerViajerosRegistrados'))}</h3><span class="tbc-count">0</span></div>
        <p class="tbc-sub">${esc(t('travelerNadieRegistrado'))} ${esc(countryName||'este destino')}.</p>
        <div class="tbc-empty"><strong>${esc(t('travelerSerePrimero'))}</strong><span>${esc(t('travelerRegistrateAqui'))}</span>
          <button type="button" class="tbc-cta">${esc(t('travelerBtnRegistrarme'))}</button>
        </div>`;
      root.querySelector('.tbc-cta')?.addEventListener('click',open);
      return;
    }

    root.innerHTML=`
      <div class="tbc-head"><h3>${esc(t('travelerViajerosRegistrados'))}</h3><span class="tbc-count">${items.length}</span></div>
      <p class="tbc-sub">${esc(t('travelerPersonasRegistradas'))} ${esc(countryName||'este destino')}.</p>
      <div class="traveler-list">
        ${items.map(x=>`
          <div class="traveler-chip">
            <span class="chip-avatar">${esc(initials(x.name))}</span>
            <span class="chip-body">
              <span class="chip-name">${esc(x.name)}</span>
              <small>${esc(x.plan)}</small>
            </span>
          </div>`).join('')}
      </div>`;
  }

  function renderSkeleton(){
    const root=document.getElementById('travelersByCountry');
    if(!root)return;
    root.innerHTML=`<div class="tbc-head"><h3>${esc(t('travelerViajerosRegistrados'))}</h3></div>
      <div class="tbc-skeleton">${'<span></span>'.repeat(4)}</div>`;
  }

  function init(){
    document.querySelectorAll('.nav-register').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();open()}));

    if(document.querySelector('.nav-register')&&!document.getElementById('travelerModal')){
      const m=document.createElement('div');
      m.id='travelerModal';
      m.className='traveler-modal';
      m.innerHTML=`<section class="traveler-card" role="dialog" aria-modal="true">
        <button class="traveler-close" type="button" aria-label="${esc(t('modalCerrar'))}">×</button>
        <h2>${esc(t('travelerModalTitulo'))}</h2>
        <p>${esc(t('travelerModalDesc'))}</p>
        <form class="traveler-form" novalidate>
          <label>${esc(t('travelerLabelNombre'))}<input name="name" required minlength="2"></label>
          <label>${esc(t('travelerLabelCorreo'))}<input name="email" type="email" required></label>
          <label>${esc(t('travelerLabelPais'))}<select name="country" required><option value="">${esc(t('travelerCargandoPaises'))}</option></select></label>
          <div class="traveler-guides" id="travelerGuides" style="display:none;margin-top:-4px;margin-bottom:2px;padding:8px 12px;border-radius:10px;background:rgba(46,110,220,.06);font-size:.8rem;line-height:1.5"></div>
          <label>${esc(t('travelerLabelPlan'))}<select name="plan"><option>${esc(t('travelerPlanGratis'))}</option><option>Premium · US$9.99/mes</option><option>OP · US$19.99/mes</option></select></label>
          <button class="traveler-submit" type="submit">${esc(t('travelerBtnGuardar'))}</button>
          <p class="traveler-status" role="status" aria-live="polite"></p>
        </form>
      </section>`;
      document.body.appendChild(m);

      m.querySelector('.traveler-close').onclick=close;
      m.addEventListener('click',e=>{if(e.target===m)close()});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('open'))close()});

      function showGuidesForCountry(countryCode){
        var guidesEl=m.querySelector('.traveler-guides');
        if(!guidesEl)return;
        if(!countryCode){guidesEl.style.display='none';return}
        var stored;try{stored=JSON.parse(localStorage.getItem('kavariGuides'))||[]}catch(e){stored=[]}
        var filtered=stored.filter(function(g){return g.country===countryCode});
        if(!filtered.length){guidesEl.style.display='none';return}
        guidesEl.style.display='block';
        guidesEl.innerHTML='<strong style="display:block;margin-bottom:4px">'+esc(t('travelerGuiaDisponible'))+'</strong>'+
          filtered.map(function(g){return '<span style="display:flex;align-items:center;gap:6px;padding:3px 0">'+
            '<span style="width:6px;height:6px;border-radius:50%;background:#2e6edc;flex-shrink:0"></span>'+
            esc(g.name)+' <span style="color:#64748b;font-size:.75rem">· '+esc(g.rank)+'</span></span>'
          }).join('');
      }

      fetch('data/data.json', { cache: 'no-cache' }).then(r=>r.json()).then(data=>{
        const lang = (localStorage.getItem('kavari-idioma') || localStorage.getItem('idioma') || 'es');
        let countries = data;
        return fetch('data/i18n/' + lang + '.json', { cache: 'no-cache' }).then(r2 => r2.ok ? r2.json() : null).then(i18n => {
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
          const s=m.querySelector('[name=country]');
          s.innerHTML='<option value="">'+(window.t?window.t('seleccionaPais'):'Selecciona un país')+'</option>'+Object.entries(countries)
            .filter(([,v])=>v&&v.nombre)
            .map(([k,v])=>{const n=(window.paisNombre?window.paisNombre(k,v.nombre):v.nombre)||v.nombre;return '<option value="'+esc(k)+'">'+esc(n)+'</option>';}).join('');
          s.value=localStorage.getItem('paisSeleccionado')||'';
          s.addEventListener('change',function(){showGuidesForCountry(this.value)});
          showGuidesForCountry(s.value);
        });
      }).catch(()=>{
        m.querySelector('.traveler-status').textContent=t('travelerErrorCargarPaises');
        m.querySelector('.traveler-status').classList.add('is-error');
      });

      const form=m.querySelector('form');
      const status=m.querySelector('.traveler-status');
      const submitBtn=m.querySelector('.traveler-submit');

      form.onsubmit=e=>{
        e.preventDefault();
        status.classList.remove('is-error');

        const f=new FormData(form);
        const name=(f.get('name')||'').trim();
        const email=(f.get('email')||'').trim();
        const country=f.get('country');
        const plan=f.get('plan');

        form.querySelectorAll('.field-error').forEach(el=>el.classList.remove('field-error'));
        const errors=[];
        if(name.length<2){errors.push('name')}
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){errors.push('email')}
        if(!country){errors.push('country')}
        if(errors.length){
          errors.forEach(n=>form.querySelector(`[name=${n}]`).classList.add('field-error'));
          status.textContent=t('travelerErrorCampos');
          status.classList.add('is-error');
          return;
        }

        submitBtn.disabled=true;
        submitBtn.textContent=t('travelerGuardando');

        const list=get();
        const country_ = country;
        if(list.some(x=>x.email.toLowerCase()===email.toLowerCase()&&x.country===country_)){
          status.textContent=t('travelerYaRegistrado');
          status.classList.add('is-error');
          submitBtn.disabled=false;
          submitBtn.textContent=t('travelerBtnGuardar');
          return;
        }

        list.push({name,email,country:country_,plan});
        localStorage.setItem(key,JSON.stringify(list));

        // Guardar también en Supabase (persistente, no depende del navegador).
        // localStorage se mantiene como respaldo para mostrar el registro al instante.
        try{
          const client=window.KavariDB&&window.KavariDB.getSupabaseClient?window.KavariDB.getSupabaseClient():null;
          if(client){
            Promise.resolve(window.KavariDB.getCurrentUser?window.KavariDB.getCurrentUser():null)
              .then(u=>client.from('traveler_registrations').insert({
                user_id:u?u.id:null,
                full_name:name,
                email:email,
                country_code:country_,
                plan:plan||null
              }))
              .then(function(res){})
              .catch(function(err){})
          }
        }catch(err){}

        setTimeout(()=>{
          status.textContent=t('travelerRegistroGuardado');
          submitBtn.disabled=false;
          submitBtn.textContent=t('travelerBtnGuardar');
          render();
          setTimeout(close,900);
          form.reset();
        },250);
      };
    }

    if(document.body.classList.contains('page-destino')){
      const root=document.createElement('section');
      root.id='travelersByCountry';
      root.className='travelers-by-country';
      document.querySelector('#section-guias .guides-section')?.prepend(root);
      renderSkeleton();
      setTimeout(render,150);
      window.addEventListener('kavari:countrychange',e=>{
        if(e?.detail?.nombre)root.dataset.countryName=e.detail.nombre;
        render();
      });
      window.addEventListener('kavari:langchange',()=>render());
    }
  }

  document.addEventListener('DOMContentLoaded',init);
})();