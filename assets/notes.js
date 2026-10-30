/* Shared behaviour for the IAL notes pages (P1, P2).
   Each feature runs on its own, so one failure (for example the KaTeX CDN
   not loading) cannot stop the menu or the worked-solution toggles. */
(function(){
  'use strict';

  const safe=(name,fn)=>{ try{ fn(); }catch(e){ console.error(`[notes] ${name} failed`, e); } };

  function initMath(){
    if(typeof window.renderMathInElement !== 'function'){
      document.documentElement.classList.add('math-unavailable');
      const main=document.querySelector('.main');
      if(main){
        const notice=document.createElement('p');
        notice.className='math-notice';
        notice.setAttribute('role','status');
        notice.textContent='Maths formatting could not load, so formulas are shown as plain LaTeX. Check your connection and reload the page.';
        main.prepend(notice);
      }
      return;
    }
    window.renderMathInElement(document.body,{
      delimiters:[
        {left:"$$",right:"$$",display:true},
        {left:"$",right:"$",display:false}
      ],
      throwOnError:false
    });
  }

  // mobile menu
  function initMenu(){
    const menuBtn=document.getElementById('menuBtn');
    const sidebar=document.getElementById('sidebar');
    const overlay=document.getElementById('overlay');
    if(!menuBtn || !sidebar || !overlay) return;
    menuBtn.setAttribute('aria-controls','sidebar');
    menuBtn.setAttribute('aria-expanded','false');
    const open=()=>{ sidebar.classList.add('open'); overlay.classList.add('show'); menuBtn.setAttribute('aria-expanded','true'); };
    const close=()=>{ sidebar.classList.remove('open'); overlay.classList.remove('show'); menuBtn.setAttribute('aria-expanded','false'); };
    menuBtn.addEventListener('click',open);
    overlay.addEventListener('click',close);
    sidebar.querySelectorAll('.nav-link').forEach(l=>l.addEventListener('click',close));
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape' && sidebar.classList.contains('open')){ close(); menuBtn.focus(); }
    });
  }

  // scrollspy
  function initScrollspy(){
    const links=document.querySelectorAll('.nav-link');
    const sections=Array.from(links).map(l=>document.querySelector(l.getAttribute('href'))).filter(Boolean);
    function onScroll(){
      let idx=-1;
      sections.forEach((sec,i)=>{
        const r=sec.getBoundingClientRect();
        if(r.top<=140) idx=i;
      });
      links.forEach(l=>l.classList.remove('active'));
      if(idx>=0) links[idx].classList.add('active');
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }

  function openPanel(btn,panel){
    panel.style.maxHeight = panel.scrollHeight + 'px';
    btn.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    btn.querySelector('.toggle-label').textContent = 'Hide worked solution';
    panel.addEventListener('transitionend', function te(){
      if(btn.classList.contains('open')) panel.style.maxHeight = 'none';
      panel.removeEventListener('transitionend', te);
    });
  }

  function closePanel(btn,panel){
    panel.style.maxHeight = panel.scrollHeight + 'px'; // set explicit height first
    requestAnimationFrame(function(){ panel.style.maxHeight = '0px'; });
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    btn.querySelector('.toggle-label').textContent = 'Show worked solution';
  }

  // accordion: worked example solution toggles
  function initToggles(){
    document.querySelectorAll('.example-solution').forEach(function(panel,i){
      if(!panel.id) panel.id = 'solution-' + (i + 1);
    });
    document.querySelectorAll('.solution-toggle').forEach(function(btn){
      const panel = btn.nextElementSibling;
      if(panel && panel.id) btn.setAttribute('aria-controls', panel.id);
      btn.addEventListener('click', function(){
        if(btn.classList.contains('open')) closePanel(btn,panel);
        else openPanel(btn,panel);
      });
    });
  }

  // expand all / collapse all
  function initExpandAll(){
    const toggleAllBtn = document.getElementById('toggleAllBtn');
    if(!toggleAllBtn) return;
    toggleAllBtn.addEventListener('click', function(){
      const allToggles = document.querySelectorAll('.solution-toggle');
      const anyClosed = Array.from(allToggles).some(b => !b.classList.contains('open'));
      allToggles.forEach(function(btn){
        const panel = btn.nextElementSibling;
        const isOpen = btn.classList.contains('open');
        if(anyClosed && !isOpen) openPanel(btn,panel);
        else if(!anyClosed && isOpen) closePanel(btn,panel);
      });
      toggleAllBtn.textContent = anyClosed ? 'Collapse All Examples' : 'Expand All Examples';
    });
  }

  // Formulas and tables that scroll sideways get tabindex="0" so keyboard users can scroll them.
  // Boxes inside a collapsed worked solution stay out of the tab order until it opens.
  function initScrollBoxes(){
    const boxes = Array.from(document.querySelectorAll('.katex-display, .main table'));
    if(!boxes.length) return;
    function update(){
      boxes.forEach(function(el){
        const panel = el.closest('.example-solution');
        const hidden = panel && panel.previousElementSibling && !panel.previousElementSibling.classList.contains('open');
        if(!hidden && el.scrollWidth > el.clientWidth) el.setAttribute('tabindex','0');
        else el.removeAttribute('tabindex');
      });
    }
    let timer;
    const later = ms => { clearTimeout(timer); timer = setTimeout(update, ms); };
    update();
    // KaTeX's web fonts change formula widths once they arrive
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(update);
    window.addEventListener('load', update);
    window.addEventListener('resize', () => later(150));
    // after a worked solution opens or closes (its transition lasts .35s)
    document.addEventListener('click', e => { if(e.target.closest('.solution-toggle, #toggleAllBtn')) later(400); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    safe('initMath', initMath);
    safe('initMenu', initMenu);
    safe('initScrollspy', initScrollspy);
    safe('initToggles', initToggles);
    safe('initExpandAll', initExpandAll);
    safe('initScrollBoxes', initScrollBoxes);
  });
})();
