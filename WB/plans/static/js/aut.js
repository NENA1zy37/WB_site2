  document.addEventListener('DOMContentLoaded', () => {
    feather.replace({ class: 'i' });

    const modal    = document.getElementById('authModal');
    const backdrop = document.getElementById('authBackdrop');
    const closeBtn = document.getElementById('authClose');

    function setMode(mode){
      modal.classList.toggle('mode-login',  mode==='login');
      modal.classList.toggle('mode-signup', mode==='signup');
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('is-active', t.dataset.mode===mode));
      const focusEl = modal.querySelector(mode==='login' ? '.panel-login input' : '.panel-signup input');
      if (focusEl) focusEl.focus({preventScroll:true});
    }
    function openModal(mode='signup'){
      modal.hidden = false; backdrop.hidden = false;
      requestAnimationFrame(() => {
        setMode(mode);
        modal.classList.add('is-open');
        backdrop.classList.add('is-open');
        modal.setAttribute('aria-hidden','false');
      });
    }
    function closeModal(){
      modal.classList.remove('is-open'); backdrop.classList.remove('is-open');
      modal.setAttribute('aria-hidden','true');
      setTimeout(() => { modal.hidden = true; backdrop.hidden = true; }, 200);
    }

    // Табы внутри модала
    document.querySelectorAll('.auth-tab').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // Открытие по ссылкам
    document.querySelectorAll('.auth-open, .swap-link').forEach(el => {
      el.addEventListener('click', (e) => {
        const mode = el.dataset.mode;
        if (mode){ e.preventDefault(); openModal(mode); history.replaceState(null,'',`#${mode}`); }
      });
    });

    // Закрытие
    backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

    // Авто-режим по хэшу/квери
    const params = new URLSearchParams(location.search);
    const hash   = (location.hash||'').replace('#','');
    const modeQS = params.get('mode');
    const mode   = (hash==='login' || hash==='signup') ? hash :
                   (modeQS==='login' || modeQS==='signup') ? modeQS : null;
    if (mode) openModal(mode);
  });