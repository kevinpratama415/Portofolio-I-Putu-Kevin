/* ==========================================================
   Interaksi portofolio: tema, menu, animasi, filter, lightbox
   ========================================================== */
(function(){
  var root=document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- theme ----- */
  var btn=document.getElementById('themeToggle');
  function applyTheme(m){
    if(m==='dark') root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme');
    var d=m==='dark';
    btn.textContent = d ? 'Light mode' : 'Dark mode';
    btn.setAttribute('aria-pressed', String(d));
  }
  var saved=null; try{ saved=localStorage.getItem('portofolio-theme'); }catch(e){}
  applyTheme(saved || ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark':'light'));
  btn.addEventListener('click',function(){
    var next = root.getAttribute('data-theme')==='dark' ? 'light':'dark';
    applyTheme(next); try{ localStorage.setItem('portofolio-theme',next);}catch(e){}
  });

  /* ----- mobile menu ----- */
  var menu=document.getElementById('menu'), menuBtn=document.getElementById('menuBtn');
  menuBtn.addEventListener('click',function(){
    var open=menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',String(open));
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){ menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); });
  });

  /* ----- scroll progress + active nav ----- */
  var bar=document.getElementById('progress');
  function onScroll(){
    var h=document.documentElement;
    var p=(h.scrollTop)/(h.scrollHeight-h.clientHeight||1);
    bar.style.width=(Math.min(1,Math.max(0,p))*100)+'%';
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  var links=Array.prototype.slice.call(menu.querySelectorAll('a'));
  var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));}).filter(Boolean);
  if('IntersectionObserver' in window){
    var navIO=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          links.forEach(function(a){a.classList.toggle('active', a.getAttribute('href')==='#'+en.target.id);});
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(s){navIO.observe(s);});
  }

  /* ----- typed roles ----- */
  var roles=['Lulusan Teknologi Informasi','IoT Developer (ESP32 & Blynk)','Data Analyst Excel & Power BI','Pembuat Dashboard Interaktif'];
  var el=document.getElementById('typed'); var ri=0, ci=0, del=false;
  function typeLoop(){
    var cur=roles[ri];
    if(!del){ ci++; el.textContent=cur.slice(0,ci); if(ci===cur.length){ del=true; return setTimeout(typeLoop,1600);} }
    else { ci--; el.textContent=cur.slice(0,ci); if(ci===0){ del=false; ri=(ri+1)%roles.length; return setTimeout(typeLoop,350);} }
    setTimeout(typeLoop, del?40:80);
  }
  if(reduce){ el.textContent=roles[0]; } else { typeLoop(); }

  /* ----- reveal + counters + timeline ----- */
  function countUp(node){
    var target=parseInt(node.getAttribute('data-count'),10)||0;
    if(reduce){ node.textContent=target.toLocaleString('id-ID'); return; }
    var start=null, dur=1400;
    function step(ts){
      if(!start) start=ts;
      var t=Math.min(1,(ts-start)/dur);
      var eased=1-Math.pow(1-t,3);
      node.textContent=Math.round(target*eased).toLocaleString('id-ID');
      if(t<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var revealEls=Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  // stagger siblings
  revealEls.forEach(function(el){
    var sib=el.parentElement? Array.prototype.slice.call(el.parentElement.children).filter(function(c){return c.classList.contains('reveal');}):[el];
    var i=sib.indexOf(el)%4; el.style.transitionDelay=(i*90)+'ms';
  });
  if(!('IntersectionObserver' in window)){
    revealEls.forEach(function(el){el.classList.add('is-visible');});
    document.querySelectorAll('[data-count]').forEach(countUp);
    document.querySelectorAll('.timeline').forEach(function(t){t.classList.add('is-visible');});
  } else {
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        var t=en.target;
        t.classList.add('is-visible');
        if(t.classList.contains('stat')){ var n=t.querySelector('[data-count]'); if(n) countUp(n); }
        if(t.classList.contains('timeline')) t.classList.add('is-visible');
        io.unobserve(t);
      });
    },{threshold:0.14,rootMargin:'0px 0px -40px 0px'});
    revealEls.forEach(function(el){io.observe(el);});
    var tl=document.getElementById('timeline'); if(tl) io.observe(tl);
    document.querySelectorAll('.tags-reveal').forEach(function(t){io.observe(t);});
  }

  /* ----- card tilt (desktop only) ----- */
  if(!reduce && window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.tilt').forEach(function(card){
      card.addEventListener('mousemove',function(e){
        var r=card.getBoundingClientRect();
        var x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
        card.style.transform='perspective(900px) rotateX('+((0.5-y)*5).toFixed(2)+'deg) rotateY('+((x-0.5)*6).toFixed(2)+'deg)';
        card.style.setProperty('--mx',(x*100)+'%'); card.style.setProperty('--my',(y*100)+'%');
      });
      card.addEventListener('mouseleave',function(){ card.style.transform=''; });
    });
  }

  /* ----- project filter ----- */
  var tabs=document.querySelectorAll('.tab');
  var projs=document.querySelectorAll('.proj');
  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      tabs.forEach(function(x){x.classList.remove('active');});
      t.classList.add('active');
      var f=t.getAttribute('data-filter');
      projs.forEach(function(p){
        var show = f==='all' || p.getAttribute('data-cat')===f;
        p.classList.toggle('hide', !show);
        if(show){ p.style.display=''; p.style.opacity=''; }
        else { setTimeout(function(){ if(p.classList.contains('hide')) p.style.display='none'; }, 400); }
        if(show) p.style.display='';
      });
    });
  });

  /* ----- lightbox ----- */
  var lb=document.getElementById('lightbox'), lbImg=document.getElementById('lbImg');
  function openLB(src,alt){ lbImg.src=src; lbImg.alt=alt||''; lb.classList.add('open'); }
  function closeLB(){ lb.classList.remove('open'); lbImg.src=''; }
  lb.addEventListener('click',closeLB);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeLB(); });
  document.querySelectorAll('[data-zoom]').forEach(function(n){
    var src=n.getAttribute('data-zoom');
    var im=n.querySelector('img');
    n.addEventListener('click',function(){ openLB(src, im?im.alt:''); });
    n.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openLB(src, im?im.alt:''); } });
  });
  var aw=document.getElementById('awardImg');
  function openAward(){ var im=aw.querySelector('img'); if(im && im.style.display!=='none') openLB(im.getAttribute('src'), im.alt); }
  aw.addEventListener('click',openAward);
  aw.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openAward(); } });
})();

(function(){
  var lb=document.getElementById('lightbox'), lbImg=document.getElementById('lbImg');
  if(!lb||!lbImg) return;
  document.querySelectorAll('.cert-thumb').forEach(function(t){
    var im=t.querySelector('img');
    function open(){ lbImg.src=im.src; lbImg.alt=im.alt; lb.classList.add('open'); }
    t.addEventListener('click',open);
    t.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });
  });
})();
