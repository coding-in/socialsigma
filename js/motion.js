/**
 * Social Sigma — Kinetic Motion V2
 * Library-free progressive enhancements; preserves existing app.js functionality.
 */
(() => {
  'use strict';
  const doc = document;
  const root = doc.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  if (!doc.getElementById('hero') && !doc.getElementById('showcase-mount')) return;

  function ready() {
    const progress = doc.createElement('div');
    progress.className = 'motion-scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(progress);
    const ambient = [];
    let ticking = false;

    function onScroll() {
      ticking = false;
      const max = Math.max(1, root.scrollHeight - innerHeight);
      progress.style.transform = 'scaleX(' + Math.max(0, Math.min(1, scrollY / max)) + ')';
      if (reduce.matches) return;
      for (const {section, orb, strength} of ambient) {
        const r = section.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) continue;
        const shift = Math.max(-90, Math.min(90, -(r.top + r.height / 2 - innerHeight / 2) * strength));
        orb.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
      }
    }
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    };
    addEventListener('scroll', schedule, {passive:true});
    addEventListener('resize', schedule, {passive:true});

    if (!reduce.matches) {
      root.classList.add('motion-enhanced');
      initHeroEntrance();
      initSectionReveals();
      for (const [id, color, strength] of [['about','blue',.075], ['portfolio','lime',.105]]) {
        const section = doc.getElementById(id);
        if (!section) continue;
        const orb = doc.createElement('span');
        orb.className = 'motion-ambient-orb motion-ambient-orb--' + color;
        orb.setAttribute('aria-hidden','true');
        section.insertBefore(orb, section.firstChild);
        ambient.push({section,orb,strength});
      }
      if (fine.matches) {
        initMagneticButtons();
        initCardSpotlights();
        initHeroSpotlight();
        initHeroReactor();
      }
    }
    initActiveNav();
    schedule();
  }

  function initHeroEntrance() {
    const hero = doc.getElementById('hero');
    if (!hero) return;
    const wrapper = doc.getElementById('app-wrapper');
    const reveal = () => requestAnimationFrame(() => root.classList.add('motion-intro-active'));
    if (!wrapper || wrapper.classList.contains('revealed')) { reveal(); return; }
    if (!('MutationObserver' in window)) { reveal(); return; }
    const observer = new MutationObserver(() => {
      if (!wrapper.classList.contains('revealed')) return;
      observer.disconnect();
      reveal();
    });
    observer.observe(wrapper, {attributes:true,attributeFilter:['class']});
  }

  function initSectionReveals() {
    const targets = doc.querySelectorAll([
      '#about .about-content h3', '.section-header .section-title',
      '.section-header .section-desc', '.portfolio-hero .section-tag',
      '.portfolio-hero .section-title', '.portfolio-hero .section-desc',
      '.contact-info .contact-heading', '.contact-info .contact-desc'
    ].join(','));
    const counts = new Map();
    targets.forEach(el => {
      const parent = el.closest('.section-header,.portfolio-hero,.contact-info,.about-content') || el.parentElement;
      const order = counts.get(parent) || 0;
      counts.set(parent,order+1);
      el.classList.add('motion-observe');
      el.style.setProperty('--motion-stagger',Math.min(order,3)*95+'ms');
    });
    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('motion-in'));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('motion-in');
        observer.unobserve(entry.target);
      }
    }),{threshold:.12,rootMargin:'0px 0px -25px 0px'});
    targets.forEach(el => observer.observe(el));
  }

  function initMagneticButtons() {
    doc.querySelectorAll('.btn-primary,.btn-secondary,.btn-nav-enquire,.btn-portfolio-behance,.project-btn,.filter-btn')
      .forEach(button => {
        button.classList.add('motion-magnetic');
        let frame = 0;
        button.addEventListener('pointermove',e => {
          if (e.pointerType === 'touch') return;
          const r = button.getBoundingClientRect();
          const x = Math.max(-10,Math.min(10,(e.clientX-r.left-r.width/2)*.16));
          const y = Math.max(-7,Math.min(7,(e.clientY-r.top-r.height/2)*.2));
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => button.style.translate = x.toFixed(1)+'px '+y.toFixed(1)+'px');
        },{passive:true});
        const reset = () => {cancelAnimationFrame(frame); button.style.translate='0px 0px';};
        button.addEventListener('pointerleave',reset);
        button.addEventListener('blur',reset);
      });
  }

  function initCardSpotlights() {
    doc.querySelectorAll('.capability-row,.special-card,.project-card,.stat-item').forEach(card => {
      const glow = doc.createElement('span');
      glow.className='motion-card-spotlight';
      glow.setAttribute('aria-hidden','true');
      card.classList.add('motion-glow-card');
      card.appendChild(glow);
      let raf=0;
      card.addEventListener('pointermove',e => {
        if(e.pointerType === 'touch') return;
        const r=card.getBoundingClientRect();
        const x=e.clientX-r.left,y=e.clientY-r.top;
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(() => {
          card.style.setProperty('--spot-x',x.toFixed(0)+'px');
          card.style.setProperty('--spot-y',y.toFixed(0)+'px');
        });
      },{passive:true});
      card.addEventListener('pointerleave',() => cancelAnimationFrame(raf));
    });
  }

  function initHeroSpotlight() {
    const hero=doc.getElementById('hero');
    if(!hero)return;
    let raf=0;
    hero.addEventListener('pointermove',e => {
      if(e.pointerType === 'touch')return;
      const r=hero.getBoundingClientRect();
      const x=(e.clientX-r.left)/Math.max(1,r.width)*100;
      const y=(e.clientY-r.top)/Math.max(1,r.height)*100;
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(() => {
        hero.style.setProperty('--motion-pointer-x',x.toFixed(1)+'%');
        hero.style.setProperty('--motion-pointer-y',y.toFixed(1)+'%');
      });
    },{passive:true});
  }

  function initHeroReactor() {
    const hero=doc.getElementById('hero');
    const stage=hero && hero.querySelector('.motion-hero-stage');
    if(!stage)return;
    const desktop=matchMedia('(min-width:769px)');
    let x=0,y=0,currentX=0,currentY=0,raf=0;
    const render=() => {
      raf=0;
      currentX+=(x-currentX)*.12;
      currentY+=(y-currentY)*.12;
      stage.style.translate=currentX.toFixed(2)+'px '+currentY.toFixed(2)+'px';
      if(Math.abs(x-currentX)>.2 || Math.abs(y-currentY)>.2)raf=requestAnimationFrame(render);
    };
    const wake=()=>{if(!raf)raf=requestAnimationFrame(render);};
    hero.addEventListener('pointermove',e => {
      if(!desktop.matches || e.pointerType==='touch')return;
      const r=hero.getBoundingClientRect();
      x=((e.clientX-r.left)/Math.max(r.width,1)-.5)*20;
      y=((e.clientY-r.top)/Math.max(r.height,1)-.5)*13;
      wake();
    },{passive:true});
    hero.addEventListener('pointerleave',()=>{x=0;y=0;wake();});
    doc.addEventListener('visibilitychange',()=>{
      if(doc.hidden && raf){cancelAnimationFrame(raf);raf=0;}
    });
  }

  function initActiveNav() {
    if (!doc.getElementById('hero') || !('IntersectionObserver' in window))return;
    const pairs=[['hero','link-home'],['about','link-about'],['services','link-services']]
      .map(([id,link])=>[doc.getElementById(id),doc.getElementById(link)])
      .filter(([section,link])=>section && link);
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      pairs.forEach(([,link])=>link.classList.remove('active'));
      const active=pairs.find(([section])=>section===entry.target);
      if(active)active[1].classList.add('active');
    }),{rootMargin:'-22% 0px -55% 0px'});
    pairs.forEach(([section])=>observer.observe(section));
  }

  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
