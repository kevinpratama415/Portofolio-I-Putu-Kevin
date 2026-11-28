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
  function startTyping(){ el.textContent=roles[0]; }

  /* ----- muat data profil dari data/profil.json (diedit lewat admin) ----- */
  function applyProfile(p){
    function each(key,fn){ document.querySelectorAll('[data-bind="'+key+'"]').forEach(fn); }
    function plain(u){ return String(u||'').replace(/^https?:\/\//,'').replace(/\/$/,''); }
    if(p.nama) each('nama',function(e){ e.textContent=p.nama; });
    if(p.pengantar) each('pengantar',function(e){ e.textContent=p.pengantar; });
    if(p.tentang) each('tentang',function(e){ e.textContent=p.tentang; });
    if(p.tentang2) each('tentang2',function(e){ e.textContent=p.tentang2; });
    if(p.foto) each('foto',function(e){ e.src=p.foto; });
    if(p.email) each('email',function(e){ e.textContent=p.email; e.href='mailto:'+p.email; });
    if(p.telepon) each('telepon',function(e){ e.textContent=p.telepon; });
    if(p.alamat) each('alamat',function(e){ e.textContent=p.alamat; });
    if(p.github) each('github',function(e){ e.href=p.github; e.textContent=plain(p.github); });
    if(p.linkedin) each('linkedin',function(e){ e.href=p.linkedin; e.textContent=plain(p.linkedin); });
    if(p.statistik && p.statistik.length){
      var nums=document.querySelectorAll('[data-bind="statistik"]');
      p.statistik.forEach(function(st,i){
        var n=nums[i]; if(!n) return;
        n.setAttribute('data-count', st.angka);
        n.textContent=Number(st.angka).toLocaleString('id-ID');
        var sp=n.parentElement && n.parentElement.querySelector('span');
        if(sp && st.label) sp.textContent=st.label;
      });
    }
  }
  fetch('data/profil.json',{cache:'no-store'})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(p){
      if(p){ applyProfile(p); if(p.peran && p.peran.length){ roles=p.peran; } }
    })
    .catch(function(){ /* tetap pakai nilai bawaan */ })
    .then(function(){ startTyping(); document.dispatchEvent(new CustomEvent('profil:loaded')); });

  /* ----- reveal + counters + timeline ----- */
  function countUp(node){
    node.textContent=Number(node.getAttribute("data-count")).toLocaleString("id-ID"); return;
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

/* ===== tumpukan sertifikat: geser untuk memilih (rapi) ===== */
(function(){
  var stack=document.getElementById('certStack');
  if(!stack) return;
  var cards=Array.prototype.slice.call(stack.querySelectorAll('.cert'));
  var dotsWrap=document.getElementById('stackDots');
  var prev=document.getElementById('stackPrev'), next=document.getElementById('stackNext');
  var n=cards.length, idx=0, startX=0, startY=0, dx=0, dragging=false, moved=false, suppressClick=false;
  if(!n) return;

  cards.forEach(function(c,i){
    var d=document.createElement('button');
    d.type='button'; d.setAttribute('aria-label','Sertifikat '+(i+1));
    d.addEventListener('click',function(){ go(i); });
    dotsWrap.appendChild(d);
  });

  function mod(i){ return ((i%n)+n)%n; }

  /* tinggi semua kartu sama: ambil tinggi kartu tertinggi */
  function fitHeight(){
    var h=0;
    cards.forEach(function(c){ c.style.height='auto'; h=Math.max(h,c.offsetHeight); });
    cards.forEach(function(c){ c.style.height=h+'px'; });
    stack.style.height=h+'px';
  }

  function layout(dragX){
    cards.forEach(function(c,i){
      var d=i-idx;
      if(d>n/2) d-=n; if(d<-n/2) d+=n;      /* jalur melingkar */
      var t,o,z,sh;
      if(d===0){
        t = dragX ? 'translate3d('+dragX+'px,0,0) rotate('+(dragX/30).toFixed(2)+'deg)' : 'translate3d(0,0,0)';
        o=1; z=30; sh='0 16px 32px rgba(29,43,58,.14)';
      } else if(d>0){
        var k=Math.min(d,3);
        t='translate3d(0,'+(k*12)+'px,0) scale('+(1-k*0.035).toFixed(3)+')';
        o=d<=2 ? 1-k*0.25 : 0;
        z=30-d;
        sh = d===1 ? '0 8px 18px rgba(29,43,58,.10)' : '0 4px 10px rgba(29,43,58,.07)';
      } else {
        t='translate3d(-40%,0,0) scale(.96)'; o=0; z=1; sh='none';
      }
      c.style.transform=t; c.style.opacity=o; c.style.zIndex=z; c.style.boxShadow=sh;
      c.classList.toggle('is-active', d===0);
      c.setAttribute('aria-hidden', d===0?'false':'true');
    });
    Array.prototype.forEach.call(dotsWrap.children, function(b,i){ b.classList.toggle('active', i===idx); });
  }

  function go(i){
    idx=mod(i);
    cards.forEach(function(c){ c.classList.remove('is-dragging'); });
    layout(0);
  }

  prev.addEventListener('click',function(){ go(idx-1); });
  next.addEventListener('click',function(){ go(idx+1); });

  stack.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'){ e.preventDefault(); go(idx-1); }
    if(e.key==='ArrowRight'){ e.preventDefault(); go(idx+1); }
  });

  var pointerId=null;
  function down(e){
    dragging=true; moved=false; startX=e.clientX; startY=e.clientY; dx=0; pointerId=e.pointerId;
  }
  function move(e){
    if(!dragging) return;
    dx=e.clientX-startX;
    var dy=e.clientY-startY;
    if(Math.abs(dx)>Math.abs(dy)) { moved=moved||Math.abs(dx)>6; }
    if(moved){
      if(pointerId!==null){ try{ stack.setPointerCapture(pointerId); }catch(_){} pointerId=null; }
      layout(dx);
    }
  }
  function up(){
    if(!dragging) return;
    dragging=false;
    cards[idx].classList.remove('is-dragging');
    if(moved){ suppressClick=true; setTimeout(function(){ suppressClick=false; },300); }
    if(Math.abs(dx)>60){ go(dx<0 ? idx+1 : idx-1); }
    else { layout(0); }
  }
  stack.addEventListener('pointerdown',down);
  stack.addEventListener('pointermove',move);
  stack.addEventListener('pointerup',up);
  stack.addEventListener('pointercancel',up);
  stack.addEventListener('click',function(e){
    if(suppressClick){ e.stopPropagation(); e.preventDefault(); }
  },true);

  window.addEventListener('resize',fitHeight);
  window.addEventListener('load',fitHeight);
  fitHeight();
  go(0);
})();

/* cegah drag gambar bawaan browser agar geseran kartu tidak dibatalkan */
(function(){
  var st=document.getElementById('certStack'); if(!st) return;
  st.addEventListener('dragstart',function(e){ e.preventDefault(); });
})();


/* ===== animasi detail (JS) ===== */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  /* 1) nama di hero: muncul huruf per huruf */
  function splitName(){
    var h1=document.querySelector('.hero h1[data-bind="nama"]');
    if(!h1 || h1.dataset.split) return;
    var text=h1.textContent;
    h1.setAttribute('aria-label', text);
    h1.dataset.split='1';
    h1.textContent='';
    var i=0;
    Array.prototype.forEach.call(text, function(ch){
      var s=document.createElement('span');
      s.className='ch'; s.setAttribute('aria-hidden','true');
      s.style.setProperty('--d', (i*26)+'ms');
      s.textContent = ch===' ' ? '\u00A0' : ch;
      h1.appendChild(s); i++;
    });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ h1.classList.add('is-in'); }); });
  }

  /* 2) judul bagian: muncul kata per kata */
  function splitHeadings(){
    document.querySelectorAll('section h2.reveal').forEach(function(h2){
      if(h2.dataset.split) return;
      h2.dataset.split='1';
      var words=h2.textContent.trim().split(/\s+/);
      h2.textContent='';
      words.forEach(function(w,i){
        var s=document.createElement('span');
        s.className='wd'; s.textContent=w;
        s.style.setProperty('--d', (i*90)+'ms');
        h2.appendChild(s);
        if(i<words.length-1) h2.appendChild(document.createTextNode(' '));
      });
    });
  }

  /* 3) garis timeline yang terisi mengikuti scroll */
  var tl=document.getElementById('timeline');
  var fill=null;
  if(tl){
    fill=document.createElement('div'); fill.className='tl-fill';
    tl.appendChild(fill);
  }
  function updateTimeline(){
    if(!tl||!fill) return;
    var r=tl.getBoundingClientRect();
    var vh=window.innerHeight;
    var p=(vh*0.7 - r.top)/(r.height||1);
    p=Math.min(1,Math.max(0,p));
    fill.style.height=(p*(r.height-14))+'px';
  }

  /* 4) foto hero: bergerak pelan mengikuti scroll (paralaks) */
  var heroPhoto=document.querySelector('.hero-photo');
  function updateParallax(){
    if(!heroPhoto) return;
    var y=Math.min(window.scrollY,600);
    heroPhoto.style.transform='translate3d(0,'+(y*0.12).toFixed(1)+'px,0)';
  }

  /* 5) tombol: sedikit membesar saat ditekan (umpan balik klik) */
  document.addEventListener('pointerdown', function(e){
    var b=e.target.closest && e.target.closest('.btn, .btn-line, .stack-btn');
    if(b){ b.classList.add('pressed'); }
  });
  document.addEventListener('pointerup', function(){
    document.querySelectorAll('.pressed').forEach(function(b){ b.classList.remove('pressed'); });
  });

  var ticking=false;
  function onScroll(){
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(function(){
      updateTimeline(); updateParallax(); ticking=false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);

  document.addEventListener('profil:loaded', splitName);
  setTimeout(splitName, 1500); /* cadangan jika data profil tidak terbaca */
  splitHeadings();
  onScroll();
})();

/* ===== 3D card header: kartu miring mengikuti kursor, lapisan bergerak di kedalaman berbeda ===== */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var card=document.querySelector('.award');
  if(reduce || !card || !window.matchMedia('(pointer:fine)').matches) return;
  var raf=0, lastX=0, lastY=0;
  function apply(){
    raf=0;
    var r=card.getBoundingClientRect();
    var px=((lastX-r.left)/r.width)*2-1;
    var py=((lastY-r.top)/r.height)*2-1;
    px=Math.max(-1,Math.min(1,px)); py=Math.max(-1,Math.min(1,py));
    card.style.setProperty('--px', px.toFixed(3));
    card.style.setProperty('--py', py.toFixed(3));
    card.style.setProperty('--ry', (px*9).toFixed(2)+'deg');
    card.style.setProperty('--rx', (-py*7).toFixed(2)+'deg');
    card.style.setProperty('--gx', ((px+1)*50).toFixed(1)+'%');
    card.style.setProperty('--gy', ((py+1)*50).toFixed(1)+'%');
  }
  card.addEventListener('pointerenter', function(){ card.classList.add('tilting'); });
  card.addEventListener('pointermove', function(e){
    lastX=e.clientX; lastY=e.clientY;
    if(!raf) raf=requestAnimationFrame(apply);
  });
  card.addEventListener('pointerleave', function(){
    card.classList.remove('tilting');
    card.style.setProperty('--px','0'); card.style.setProperty('--py','0');
    card.style.setProperty('--rx','0deg'); card.style.setProperty('--ry','0deg');
  });
})();
