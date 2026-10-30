document.addEventListener('DOMContentLoaded', function(){
  renderMathInElement(document.body,{
    delimiters:[
      {left:"$$",right:"$$",display:true},
      {left:"$",right:"$",display:false}
    ],
    throwOnError:false
  });

  // mobile menu
  const menuBtn=document.getElementById('menuBtn');
  const sidebar=document.getElementById('sidebar');
  const overlay=document.getElementById('overlay');
  if(menuBtn){
    menuBtn.addEventListener('click',()=>{sidebar.classList.add('open');overlay.classList.add('show');});
    overlay.addEventListener('click',()=>{sidebar.classList.remove('open');overlay.classList.remove('show');});
    sidebar.querySelectorAll('.nav-link').forEach(l=>l.addEventListener('click',()=>{sidebar.classList.remove('open');overlay.classList.remove('show');}));
  }

  // scrollspy
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

  // accordion: worked example solution toggles
  document.querySelectorAll('.solution-toggle').forEach(function(btn){
    var panel = btn.nextElementSibling;
    btn.addEventListener('click', function(){
      var isOpen = btn.classList.contains('open');
      if(isOpen){
        panel.style.maxHeight = panel.scrollHeight + 'px'; // set explicit height first
        requestAnimationFrame(function(){ panel.style.maxHeight = '0px'; });
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        btn.querySelector('.toggle-label').textContent = 'Show worked solution';
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        btn.querySelector('.toggle-label').textContent = 'Hide worked solution';
        panel.addEventListener('transitionend', function te(){
          if(btn.classList.contains('open')) panel.style.maxHeight = 'none';
          panel.removeEventListener('transitionend', te);
        });
      }
    });
  });

  // expand all / collapse all
  const toggleAllBtn = document.getElementById('toggleAllBtn');
  if(toggleAllBtn){
    toggleAllBtn.addEventListener('click', function(){
      const allToggles = document.querySelectorAll('.solution-toggle');
      const anyClosed = Array.from(allToggles).some(b => !b.classList.contains('open'));
      allToggles.forEach(function(btn){
        const panel = btn.nextElementSibling;
        const isOpen = btn.classList.contains('open');
        if(anyClosed && !isOpen){
          panel.style.maxHeight = panel.scrollHeight + 'px';
          btn.classList.add('open');
          btn.setAttribute('aria-expanded','true');
          btn.querySelector('.toggle-label').textContent = 'Hide worked solution';
          panel.addEventListener('transitionend', function te(){
            if(btn.classList.contains('open')) panel.style.maxHeight = 'none';
            panel.removeEventListener('transitionend', te);
          });
        } else if(!anyClosed && isOpen){
          panel.style.maxHeight = panel.scrollHeight + 'px';
          requestAnimationFrame(function(){ panel.style.maxHeight = '0px'; });
          btn.classList.remove('open');
          btn.setAttribute('aria-expanded','false');
          btn.querySelector('.toggle-label').textContent = 'Show worked solution';
        }
      });
      toggleAllBtn.textContent = anyClosed ? 'Collapse All Examples' : 'Expand All Examples';
    });
  }
});
