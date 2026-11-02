/* Social Sigma | bold creative hero — lightweight interaction controller */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  function init() {
    const hero = document.querySelector('#hero.bold-hero');
    if (!hero) return;
    const root = document.documentElement;
    const wrapper = document.getElementById('app-wrapper');
    const activate = () => {
      if (reduce.matches || root.classList.contains('bold-motion-ready')) return;
      root.classList.add('bold-motion-ready');
    };
    if (reduce.matches) {
      // The CSS reduced-motion path keeps everything readable immediately.
    } else if (!wrapper || wrapper.classList.contains('revealed')) {
      activate();
    } else if ('MutationObserver' in window) {
      const observer = new MutationObserver(() => {
        if (!wrapper.classList.contains('revealed')) return;
        observer.disconnect();
        activate();
      });
      observer.observe(wrapper, {attributes:true,attributeFilter:['class']});
      // Do not leave the hero hidden if the legacy preloader fails.
      window.setTimeout(() => {
        observer.disconnect();
        activate();
      }, 4500);
    } else activate();

    if (!reduce.matches && fine.matches) {
      const layers = [...hero.querySelectorAll('.bold-hero__parallax-layer')];
      const showcase = hero.querySelector('.bold-hero__showcase');
      let targetX = 0, targetY = 0, currentX = 0, currentY = 0, frame = 0;
      let visible = true;
      const frames = layers.map(el => ({
        el, depth: Number(el.getAttribute('data-hero-depth')) || 1,
        base: getComputedStyle(el).transform
      }));
      // Individual elements retain their CSS rotation; only the translate property changes.
      const render = () => {
        frame = 0;
        if (!visible) return;
        currentX += (targetX-currentX)*.10;
        currentY += (targetY-currentY)*.10;
        frames.forEach(({el,depth}) => {
          el.style.translate = (currentX*depth).toFixed(1) + 'px ' + (currentY*depth).toFixed(1) + 'px';
        });
        if (Math.abs(targetX-currentX)>.15 || Math.abs(targetY-currentY)>.15) frame=requestAnimationFrame(render);
      };
      const wake = () => { if (!frame && visible) frame=requestAnimationFrame(render); };
      if (showcase) {
        showcase.addEventListener('pointermove',e => {
          if (e.pointerType === 'touch') return;
          const r = showcase.getBoundingClientRect();
          targetX = ((e.clientX-r.left)/Math.max(1,r.width)-.5)*18;
          targetY = ((e.clientY-r.top)/Math.max(1,r.height)-.5)*15;
          wake();
        },{passive:true});
        showcase.addEventListener('pointerleave',() => {targetX=0;targetY=0;wake();});
      }
      document.addEventListener('visibilitychange',() => {
        visible = !document.hidden;
        if (!visible && frame) {cancelAnimationFrame(frame);frame=0;}
        else if (visible) wake();
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();