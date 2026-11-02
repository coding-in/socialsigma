/*
   Social Sigma Homepage Controller
   Core Animations, Observers, and Sliders Logic
*/

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the homepage or portfolio page
  const isHomepage = document.getElementById('hero') !== null;
  const isPortfolioPage = document.getElementById('showcase-mount') !== null;

  if (isHomepage) {
    initIntroLoader();
    renderCapabilities();
    renderSpecializedServices();
    renderPortfolio();
    renderTestimonials();
    initSliders();
    initMouseParallax();
    initCultureAnimation();
    initRocketCursor();
  }
  
  if (isPortfolioPage) {
    renderShowcase();
    initShowcaseInteractions();
  }

  initHeader();
  initIntersectionObservers();
  initLightbox();
});

/* ==========================================================================
   1. INTRO LOADER: MACBOOK ROCKET STORY PRELOADER
   ========================================================================== */
class LaunchParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawnSmoke(x, y, isHeavy = false) {
    const count = isHeavy ? 4 : 1;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'smoke',
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 6 - 3),
        vx: Math.random() * 2 - 1,
        vy: -(Math.random() * 1.5 + 0.5),
        size: Math.random() * 12 + 6,
        alpha: 0.65,
        growth: Math.random() * 0.2 + 0.1,
        decay: Math.random() * 0.008 + 0.006,
        color: Math.random() > 0.4 ? 'rgba(255,255,255,0.08)' : 'rgba(100,116,139,0.08)'
      });
    }
  }

  spawnFire(x, y, isHeavy = false) {
    const count = isHeavy ? 10 : 3;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'fire',
        x: x + (Math.random() * 12 - 6),
        y: y,
        vx: Math.random() * 5 - 2.5,
        vy: Math.random() * 4 + 2, // shoot down
        size: Math.random() * 4 + 2,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        color: Math.random() > 0.6 ? '#c1ff72' : (Math.random() > 0.3 ? '#ff4500' : '#1877F2')
      });
    }
  }

  triggerShockwave(cx, cy) {
    const count = window.innerWidth < 768 ? 160 : 300;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 6;
      
      this.particles.push({
        type: 'blast',
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 14 + 5,
        alpha: 1.0,
        decay: Math.random() * 0.014 + 0.009,
        friction: 0.98,
        gravity: 0.12,
        color: Math.random() > 0.6 ? '#ff6a00' : (Math.random() > 0.3 ? '#c1ff72' : '#1877F2')
      });
    }
  }

  update() {
    this.particles.forEach((p, idx) => {
      if (p.type === 'smoke') {
        p.x += p.vx;
        p.y += p.vy;
        p.size += p.growth;
        p.alpha -= p.decay;
      } else if (p.type === 'fire') {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
      } else if (p.type === 'blast') {
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size = Math.max(0.1, p.size - 0.08);
      }

      if (p.alpha <= 0 || p.size <= 0.1) {
        this.particles.splice(idx, 1);
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      
      if (p.type === 'smoke') {
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = p.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    });
    this.ctx.globalAlpha = 1.0;
  }
}

function initIntroLoader() {
  const loader = document.getElementById('story-loader');
  const canvas = document.getElementById('story-canvas');
  const progressFill = document.getElementById('story-progress-fill');
  const percentText = document.getElementById('story-percent');
  const subtitleText = document.getElementById('story-subtitle');
  const rocket = document.getElementById('story-rocket');
  const flame = document.getElementById('rocket-flame-element');
  
  if (!loader || !canvas || !rocket) return;
  // Full rocket sequence plays once per tab session; honor accessibility settings.
  const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try { seen = sessionStorage.getItem('socialsigma-intro-seen') === '1'; } catch (_) {}
  if (lessMotion || seen) {
    loader.classList.add('fade-out');
    const wrapper = document.getElementById('app-wrapper');
    if (wrapper) wrapper.classList.add('revealed');
    animateHeroGraph();
    return;
  }
  try { sessionStorage.setItem('socialsigma-intro-seen', '1'); } catch (_) {}


  const ps = new LaunchParticleSystem(canvas);
  let progress = 0;
  let hasBlasted = false;

  function tick() {
    if (loader.classList.contains('fade-out')) return;
    ps.update();
    ps.draw();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function getMacBookNozzleCoords() {
    const svgEl = loader.querySelector('.workspace-svg');
    if (!svgEl) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    const svgRect = svgEl.getBoundingClientRect();
    const x = svgRect.left + (338 / 600) * svgRect.width;
    const y = svgRect.top + (320 / 400) * svgRect.height;
    return { x, y };
  }

  function getRocketScreenCoords() {
    const svgEl = loader.querySelector('.workspace-svg');
    if (!svgEl) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    const svgRect = svgEl.getBoundingClientRect();
    const x = svgRect.left + (338 / 600) * svgRect.width;
    const y = svgRect.top + (60 / 400) * svgRect.height;
    return { x, y };
  }

  const duration = 2900;
  const startTime = performance.now();

  function updateTimeline(time) {
    const elapsed = time - startTime;
    progress = Math.min(100, (elapsed / duration) * 100);

    if (progressFill) progressFill.style.width = `${progress}%`;
    if (percentText) percentText.textContent = `${Math.floor(progress).toString().padStart(2, '0')}%`;

    const nozzle = getMacBookNozzleCoords();

    if (progress < 45) {
      if (progress < 15) {
        subtitleText.textContent = 'Optimizing code cores...';
      } else if (progress < 30) {
        subtitleText.textContent = 'Compiling branding assets...';
      } else {
        subtitleText.textContent = 'Injecting launch coefficients...';
      }
      rocket.setAttribute('transform', 'translate(284, 105) scale(2.0)');
      if (flame) flame.style.opacity = '0';
    }
    else if (progress >= 45 && progress < 70) {
      subtitleText.textContent = 'Assembling brand booster...';
      const ratio = (progress - 45) / 25;
      const currentY = 105 - ratio * 80;
      rocket.setAttribute('transform', `translate(284, ${currentY}) scale(2.0)`);
      if (flame) flame.style.opacity = '0';

      if (Math.random() < 0.25) {
        ps.spawnSmoke(nozzle.x, nozzle.y, false);
      }
    }
    else if (progress >= 70 && progress < 90) {
      if (progress < 75) {
        subtitleText.textContent = 'Locking targets...';
      } else if (progress < 80) {
        subtitleText.textContent = 'Launch Countdown: 3...';
      } else if (progress < 85) {
        subtitleText.textContent = 'Launch Countdown: 2...';
      } else {
        subtitleText.textContent = 'Launch Countdown: 1...';
      }

      rocket.setAttribute('transform', `translate(284, 25) scale(2.0)`);
      rocket.classList.add('shake-rocket');
      if (flame) {
        flame.style.opacity = '1';
        flame.classList.add('flame-active');
      }

      ps.spawnSmoke(nozzle.x, nozzle.y, true);
      ps.spawnFire(nozzle.x, nozzle.y, false);
    }
    else if (progress >= 90 && progress < 96) {
      subtitleText.textContent = 'IGNITION! BOOSTING BRAND...';
      rocket.classList.remove('shake-rocket');

      const ratio = (progress - 90) / 6;
      const currentY = 25 - ratio * 325;
      rocket.setAttribute('transform', `translate(284, ${currentY}) scale(2.0)`);

      ps.spawnSmoke(nozzle.x, nozzle.y, true);
      ps.spawnFire(nozzle.x, nozzle.y, true);
    }
    else if (progress >= 96) {
      subtitleText.textContent = 'BOOST COMPLETE. LAUNCH SUCCESS!';
      rocket.setAttribute('transform', 'translate(284, -300) scale(2.0)');

      if (!hasBlasted) {
        const exitPoint = getRocketScreenCoords();
        ps.triggerShockwave(exitPoint.x, exitPoint.y);
        
        // Trigger #app-wrapper to slide up from below
        const appWrapper = document.getElementById('app-wrapper');
        if (appWrapper) {
          appWrapper.classList.add('revealed');
        }
        
        hasBlasted = true;
      }
    }

    if (progress < 100) {
      requestAnimationFrame(updateTimeline);
    } else {
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          animateHeroGraph();
        }, 800);
      }, 500);
    }
  }

  requestAnimationFrame(updateTimeline);
}

function createSmokeParticle() {
}

function createFireParticle() {
}

function animateHeroGraph() {
  initDashboardTickers();
}

function initDashboardTickers() {
  const usersEl = document.getElementById('dashboard-active-users');
  const reachEl = document.getElementById('dashboard-daily-reach');
  const spendEl = document.getElementById('meta-spend');
  const impressionsEl = document.getElementById('meta-impressions');

  // 1. Active Users (Fluctuates between 2450 and 2550)
  if (usersEl) {
    let users = 2480;
    setInterval(() => {
      const change = Math.floor(Math.random() * 15) - 7; // -7 to +7
      users = Math.max(2100, Math.min(2800, users + change));
      usersEl.textContent = users.toLocaleString();
    }, 2000);
  }

  // 2. Daily Reach (Slowly increments from 452.8K)
  if (reachEl) {
    let reachVal = 452.8;
    setInterval(() => {
      const change = Math.random() * 0.3; // 0 to 0.3K
      reachVal += change;
      reachEl.textContent = `${reachVal.toFixed(1)}K`;
    }, 3000);
  }

  // 3. Meta Ad Spent (Increments by cents every 800ms)
  if (spendEl) {
    let spentVal = 12482.40;
    setInterval(() => {
      const change = Math.random() * 0.4 + 0.1; // $0.10 to $0.50
      spentVal += change;
      spendEl.textContent = `$${spentVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }, 800);
  }

  // 4. Meta Impressions (Increments by 2 to 9 every 800ms)
  if (impressionsEl) {
    let impressionsVal = 82450;
    setInterval(() => {
      const change = Math.floor(Math.random() * 8) + 2;
      impressionsVal += change;
      impressionsEl.textContent = impressionsVal.toLocaleString();
    }, 800);
  }
}

/* ==========================================================================
   2. HEADER & NAVIGATION
   ========================================================================== */
function initHeader() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('nav-menu');
  const links = menu.querySelectorAll('.nav-link');
  
  // Toggle scrolled background
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile navigation drawer toggle
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
    
    // Toggle menu icon shape
    const icon = toggle.querySelector('i');
    if (menu.classList.contains('active')) {
      icon.className = 'fas fa-times';
    } else {
      icon.className = 'fas fa-bars';
    }
  });
  
  // Close menu on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      toggle.querySelector('i').className = 'fas fa-bars';
      
      // Update active state
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ==========================================================================
   3. DATA RENDERING
   ========================================================================== */
function renderCapabilities() {
  const mount = document.getElementById('capabilities-mount');
  if (!mount || !window.capabilitiesData) return;
  
  mount.innerHTML = window.capabilitiesData.map(c => {
    const tagsHtml = c.items.map(tag => `<span class="capability-tag">${tag}</span>`).join('');
    
    return `
      <div class="capability-row reveal-item" data-id="${c.id}">
        <div class="capability-num">${c.id}</div>
        <div class="capability-title">${c.title}</div>
        <div class="capability-summary">
          <p class="capability-desc">${c.description}</p>
          <div class="capability-tags">${tagsHtml}</div>
        </div>
        
        <!-- Interactive Preview Box Hover -->
        <div class="capability-preview-box">
          <canvas class="capability-preview-canvas" id="canvas-service-${c.id}"></canvas>
          <div class="capability-preview-hud" id="hud-service-${c.id}"></div>
        </div>
        
        <div class="capability-cta">
          <span class="btn-arrow-glow"><i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    `;
  }).join('');

  // Initialize custom animations on the capability canvases
  setTimeout(() => {
    if (typeof initCapabilitiesVisuals === 'function') {
      initCapabilitiesVisuals();
    }
  }, 100);
}

function renderSpecializedServices() {
  const mount = document.getElementById('specialized-mount');
  if (!mount || !window.specializedServicesData) return;
  
  mount.innerHTML = window.specializedServicesData.map((s, idx) => `
    <div class="special-card reveal-item reveal-delay-${idx % 3 + 1}">
      <div class="special-icon-wrap">
        <i class="fas ${s.icon}"></i>
      </div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
    </div>
  `).join('');
}

function renderPortfolio() {
  const mount = document.getElementById('portfolio-mount');
  if (!mount || !window.portfolioData) return;
  
  mount.innerHTML = window.portfolioData.map((p, idx) => {
    return `
      <div class="project-card reveal-item revealed" data-id="${p.id}" data-brand="${p.id}">
        <div>
          <!-- Header -->
          <div class="project-card-header">
            <div class="project-card-info">
              <h3 class="project-card-title">${p.title}</h3>
              <span class="project-card-tag">${p.category}</span>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="project-card-actions">
          <a href="${p.instagramLink}" target="_blank" class="project-btn project-btn-insta" aria-label="Visit Instagram Profile">
            <i class="fab fa-instagram"></i> Instagram
          </a>
          <a href="${p.websiteLink}" target="_blank" class="project-btn project-btn-web" aria-label="Visit Live Website">
            <i class="fas fa-globe"></i> Website
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function renderTestimonials() {
  const mount = document.getElementById('testimonials-mount');
  if (!mount || !window.testimonialsData) return;

  // Intentionally omit all personal names, portraits and job titles.
  // Preserve each original testimonial quotation unchanged.
  const categories = [
    'Hospitality & Events',
    'Fashion & Retail',
    'Interior Design',
    'Creative Production',
    'Sportswear & Activewear'
  ];
  mount.innerHTML = window.testimonialsData.map((t, index) => `
    <article class="testimonial-card" aria-label="Client feedback ${index + 1}">
      <div class="review-card-head">
        <span class="review-quote-icon" aria-hidden="true">“</span>
        <span class="review-card-index">FEEDBACK / ${String(index + 1).padStart(2, '0')}</span>
      </div>
      <p class="testimonial-text">${t.text}</p>
      <div class="review-card-footer">
        <div class="review-card-footer-main">
          <span class="review-card-accent" aria-hidden="true">✳</span>
          <div><div class="review-card-category">${categories[index] || 'Client Feedback'}</div>
          <span class="review-card-caption">Client perspective</span></div>
        </div>
        <span class="review-card-end" aria-hidden="true">↗</span>
      </div>
    </article>
  `).join('');
}

/* ==========================================================================
   4. INTERSECTION OBSERVERS: REVEALS & STATS COUNT-UP
   ========================================================================== */
function initIntersectionObservers() {
  // 1. Scroll reveals
  const revealItems = document.querySelectorAll('.reveal-item');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  revealItems.forEach(item => revealObserver.observe(item));

  // 2. Stats Section Counters Count-Up
  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      if (entries[0].isIntersecting) {
        startCounters();
        observer.unobserve(statsSection);
      }
    }, { threshold: 0.2 });
    
    counterObserver.observe(statsSection);
  }

  // 3. Capabilities Section Earthquake Shake
  const capSection = document.getElementById('capabilities');
  if (capSection) {
    const earthquakeObserver = new IntersectionObserver((entries, observer) => {
      if (entries[0].isIntersecting) {
        capSection.classList.add('capabilities-shake-active');
        
        // Remove class after animation finishes (650ms)
        setTimeout(() => {
          capSection.classList.remove('capabilities-shake-active');
        }, 650);
        
        observer.unobserve(capSection);
      }
    }, { threshold: 0.15 });
    
    earthquakeObserver.observe(capSection);
  }
}

function initRocketCursor() {
  const follower = document.getElementById('rocket-cursor');
  const targetSection = document.getElementById('capabilities');
  
  if (!follower || !targetSection) return;
  
  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;
  let isMoving = false;
  
  function updatePosition() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;
    
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    
    if (isMoving) {
      requestAnimationFrame(updatePosition);
    }
  }

  targetSection.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(updatePosition);
    }
  });

  targetSection.addEventListener('mouseenter', () => {
    follower.classList.add('active');
    isMoving = true;
    requestAnimationFrame(updatePosition);
  });

  targetSection.addEventListener('mouseleave', () => {
    follower.classList.remove('active');
    isMoving = false;
  });

  // Track hover on rows to trigger rocket fire boost
  const rows = targetSection.querySelectorAll('.capability-row');
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => follower.classList.add('boost'));
    row.addEventListener('mouseleave', () => follower.classList.remove('boost'));
  });

  // Also boost on hover on buttons/CTAs inside capabilities
  const buttons = targetSection.querySelectorAll('a, button, .capability-cta');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => follower.classList.add('boost'));
    btn.addEventListener('mouseleave', () => follower.classList.remove('boost'));
  });

  // Click flash scale
  targetSection.addEventListener('mousedown', () => {
    follower.style.transform = 'translate(-50%, -50%) rotate(45deg) scale(1.4)';
    setTimeout(() => {
      follower.style.transform = '';
    }, 120);
  });
}

function startCounters() {
  const counters = [
    { id: 'count-clients', target: 8, suffix: '+' },
    { id: 'count-comments', target: 7, suffix: 'K+' },
    { id: 'count-lift', target: 320, suffix: '%' }
  ];

  counters.forEach(c => {
    const el = document.getElementById(c.id);
    if (!el) return;
    
    let count = 0;
    const target = c.target;
    const duration = 1800; // Total count duration
    const intervalTime = 15;
    const steps = duration / intervalTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        el.textContent = `${target}${c.suffix}`;
        clearInterval(timer);
      } else {
        el.textContent = `${Math.floor(count)}${c.suffix}`;
      }
    }, intervalTime);
  });
}

/* ==========================================================================
   5. SLIDERS: PORTFOLIO & TESTIMONIALS
   ========================================================================== */
function initSliders() {
  // Slider generic helper constructor
  function makeSlider(trackId, prevBtnId, nextBtnId, dotsContainerId, cardSelector) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const dotsContainer = document.getElementById(dotsContainerId);
    
    if (!track || !prevBtn || !nextBtn) return;
    
    let currentIdx = 0;
    
    function getCardsPerView() {
      if (window.innerWidth > 1024) return trackId === 'testimonials-mount' ? 2 : 3;
      if (window.innerWidth > 768) return 2;
      return 1;
    }
    
    function updateSlider() {
      const cards = track.querySelectorAll(cardSelector);
      const cardsCount = cards.length;
      const cardsPerView = getCardsPerView();
      const maxIdx = Math.max(0, cardsCount - cardsPerView);
      
      if (currentIdx > maxIdx) currentIdx = maxIdx;
      
      const cardWidth = cards[0] ? cards[0].offsetWidth : 0;
      const gap = 32; // Matches gap (2rem) in style.css
      const offset = currentIdx * (cardWidth + gap);
      
      track.style.transform = `translateX(-${offset}px)`;
      
      if (trackId === 'testimonials-mount') {
        const current = document.getElementById('review-current');
        const total = document.getElementById('review-total');
        if (current) current.textContent = String(currentIdx + 1).padStart(2, '0');
        if (total) total.textContent = String(cardsCount).padStart(2, '0');
      }

      // Update active dots
      const dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIdx);
      });
    }
    
    // Create dots indicator
    function createDots() {
      dotsContainer.innerHTML = '';
      const cards = track.querySelectorAll(cardSelector);
      const cardsCount = cards.length;
      const cardsPerView = getCardsPerView();
      const dotCount = Math.max(1, cardsCount - cardsPerView + 1);
      
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
          currentIdx = i;
          updateSlider();
        });
        dotsContainer.appendChild(dot);
      }
    }

    prevBtn.addEventListener('click', () => {
      if (currentIdx > 0) {
        currentIdx--;
        updateSlider();
      }
    });

    nextBtn.addEventListener('click', () => {
      const cards = track.querySelectorAll(cardSelector);
      const cardsPerView = getCardsPerView();
      if (currentIdx < cards.length - cardsPerView) {
        currentIdx++;
        updateSlider();
      }
    });

    window.addEventListener('resize', () => {
      createDots();
      updateSlider();
    });
    
    // Initialize initial view after rendering is complete
    setTimeout(() => {
      createDots();
      updateSlider();
    }, 100);
  }

  // 1. Initialize Portfolio Carousel
  makeSlider(
    'portfolio-mount', 
    'btn-portfolio-prev', 
    'btn-portfolio-next', 
    'portfolio-dots', 
    '.project-card'
  );

  // 2. Initialize Testimonials Carousel
  makeSlider(
    'testimonials-mount', 
    'btn-test-prev', 
    'btn-test-next', 
    'test-dots', 
    '.testimonial-card'
  );
}

/* ==========================================================================
   6. PORTFOLIO GALLERY LIGHTBOX
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('btn-lightbox-close');
  const prevBtn = document.getElementById('btn-lightbox-prev');
  const nextBtn = document.getElementById('btn-lightbox-next');
  const slider = modal.querySelector('.lightbox-slider');
  const thumbsContainer = document.getElementById('lightbox-thumbs');
  
  let currentProjImages = [];
  let currentImgIdx = 0;

  // Mount click triggers for portfolio card clicks (homepage carousel)
  const portfolioMount = document.getElementById('portfolio-mount');
  if (portfolioMount) {
    portfolioMount.addEventListener('click', (e) => {
      const card = e.target.closest('.portfolio-card');
      if (!card) return;
      
      const projId = card.getAttribute('data-id');
      const proj = window.portfolioData.find(p => p.id === projId);
      
      if (proj && proj.images && proj.images.length > 0) {
        currentProjImages = proj.images;
        currentImgIdx = 0;
        openLightbox();
      }
    });
  }

  // Mount click triggers for portfolio page grid item clicks
  const showcaseMount = document.getElementById('showcase-mount');
  if (showcaseMount) {
    showcaseMount.addEventListener('click', (e) => {
      const gridItem = e.target.closest('.insta-grid-item');
      if (!gridItem) return;
      
      const card = gridItem.closest('.insta-card');
      if (!card) return;
      
      const projId = card.getAttribute('data-id');
      const proj = window.portfolioData.find(p => p.id === projId);
      
      if (proj && proj.images && proj.images.length > 0) {
        const indexAttr = gridItem.getAttribute('data-index');
        currentProjImages = proj.images;
        currentImgIdx = parseInt(indexAttr, 10) || 0;
        openLightbox();
      }
    });
  }

  function openLightbox() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop page scroll
    renderLightboxImage();
    renderLightboxThumbs();
  }

  function closeLightbox() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable page scroll
  }

  function renderLightboxImage() {
    slider.innerHTML = '';
    currentProjImages.forEach((imgUrl, idx) => {
      const wrap = document.createElement('div');
      wrap.className = `lightbox-img-wrap ${idx === currentImgIdx ? 'active' : ''}`;
      wrap.innerHTML = `<img src="${imgUrl}" alt="Gallery Image ${idx + 1}">`;
      slider.appendChild(wrap);
    });
  }

  function renderLightboxThumbs() {
    thumbsContainer.innerHTML = '';
    currentProjImages.forEach((imgUrl, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `lightbox-thumb ${idx === currentImgIdx ? 'active' : ''}`;
      thumb.innerHTML = `<img src="${imgUrl}" alt="Thumb ${idx + 1}">`;
      thumb.addEventListener('click', () => {
        currentImgIdx = idx;
        updateActiveImage();
      });
      thumbsContainer.appendChild(thumb);
    });
  }

  function updateActiveImage() {
    const wraps = slider.querySelectorAll('.lightbox-img-wrap');
    const thumbs = thumbsContainer.querySelectorAll('.lightbox-thumb');
    
    wraps.forEach((w, idx) => w.classList.toggle('active', idx === currentImgIdx));
    thumbs.forEach((t, idx) => t.classList.toggle('active', idx === currentImgIdx));
    
    // Auto scroll active thumbnail into view
    const activeThumb = thumbs[currentImgIdx];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  prevBtn.addEventListener('click', () => {
    currentImgIdx = (currentImgIdx > 0) ? currentImgIdx - 1 : currentProjImages.length - 1;
    updateActiveImage();
  });

  nextBtn.addEventListener('click', () => {
    currentImgIdx = (currentImgIdx < currentProjImages.length - 1) ? currentImgIdx + 1 : 0;
    updateActiveImage();
  });

  closeBtn.addEventListener('click', closeLightbox);
  
  // Close on outer click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  // Keyboard navigation support
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
  });
}

/* ==========================================================================
   7. INTERACTIVE MOUSE PARALLAX
   ========================================================================== */
function initMouseParallax() {
  const hero = document.getElementById('hero');
  const blob1 = document.getElementById('blob-1');
  const blob2 = document.getElementById('blob-2');
  const dashboard = document.getElementById('hero-dashboard');
  
  if (!hero) return;
  
  hero.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Percent offsets from viewport center
    const percentX = (mouseX - window.innerWidth / 2) / (window.innerWidth / 2);
    const percentY = (mouseY - window.innerHeight / 2) / (window.innerHeight / 2);
    
    // Shift Blobs
    if (blob1) {
      blob1.style.transform = `translate(${percentX * 40}px, ${percentY * 40}px)`;
    }
    if (blob2) {
      blob2.style.transform = `translate(${percentX * -30}px, ${percentY * -30}px)`;
    }
    
    // Tilt the glassmorphic dashboard container in 3D (3D parallax depth)
    if (dashboard) {
      const rotateX = percentY * -12; // tilt up/down (X axis rotation)
      const rotateY = percentX * 12;  // tilt left/right (Y axis rotation)
      dashboard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  });

  // Reset positions on leave
  hero.addEventListener('mouseleave', () => {
    if (blob1) blob1.style.transform = 'translate(0px, 0px)';
    if (blob2) blob2.style.transform = 'translate(0px, 0px)';
    if (dashboard) {
      dashboard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  });
}


function getSparklinePath(id) {
  switch (id) {
    case 'royal-venetian':
      return {
        line: "M 0 35 Q 50 10 100 30 T 200 5 T 300 25 T 400 2",
        area: "M 0 35 Q 50 10 100 30 T 200 5 T 300 25 T 400 2 L 400 40 L 0 40 Z"
      };
    case 'mark-jillion':
      return {
        line: "M 0 38 Q 60 15 120 32 T 240 8 T 360 20 T 400 5",
        area: "M 0 38 Q 60 15 120 32 T 240 8 T 360 20 T 400 5 L 400 40 L 0 40 Z"
      };
    case 'key4you':
      return {
        line: "M 0 30 Q 45 5 90 25 T 180 2 T 270 18 T 400 1",
        area: "M 0 30 Q 45 5 90 25 T 180 2 T 270 18 T 400 1 L 400 40 L 0 40 Z"
      };
    case 'black-wizard':
    default:
      return {
        line: "M 0 32 Q 55 12 110 28 T 220 4 T 330 15 T 400 3",
        area: "M 0 32 Q 55 12 110 28 T 220 4 T 330 15 T 400 3 L 400 40 L 0 40 Z"
      };
  }
}

/* ==========================================================================
   9. PHASE 2: PORTFOLIO SHOWCASE GRID & DYNAMIC ADS PANELS
   ========================================================================== */
function renderShowcase() {
  const mount = document.getElementById('showcase-mount');
  if (!mount || !window.portfolioData) return;
  
  // Transform the container into our redesigned grid
  mount.className = 'showcase-grid-redesigned';
  
  mount.innerHTML = window.portfolioData.map((p, idx) => {
    const animationDelay = `${idx * 0.12}s`;
    const spark = getSparklinePath(p.id);
    
    return `
      <div class="project-card reveal-item revealed" data-category="${p.category}" data-id="${p.id}" data-brand="${p.id}" style="animation-delay: ${animationDelay};">
        <div>
          <!-- Header -->
          <div class="project-card-header">
            <div class="project-card-info">
              <h3 class="project-card-title">${p.title}</h3>
              <span class="project-card-tag">${p.category}</span>
            </div>
          </div>
          
          <!-- Embedded Ads Manager Dashboard -->
          <div class="project-card-ads">
            <div class="project-card-ads-header">
              <span><i class="fab fa-facebook-square"></i> Meta Ads Manager</span>
              <span class="project-card-ads-status-active">Active</span>
            </div>
            
            <div class="project-card-metrics">
              <div class="project-card-metric">
                <span class="project-card-metric-label">Spent</span>
                <span class="project-card-metric-val">${p.adsPerformance.spent}</span>
              </div>
              <div class="project-card-metric highlight-roas">
                <span class="project-card-metric-label">ROAS</span>
                <span class="project-card-metric-val">${p.adsPerformance.roas}</span>
              </div>
              <div class="project-card-metric highlight-conv">
                <span class="project-card-metric-label">Conversions</span>
                <span class="project-card-metric-val">${p.adsPerformance.conversions}</span>
              </div>
              <div class="project-card-metric">
                <span class="project-card-metric-label">Cost / Result</span>
                <span class="project-card-metric-val">${p.adsPerformance.costPerResult}</span>
              </div>
            </div>
            
            <!-- Mini Sparkline Graph -->
            <div class="project-card-sparkline-wrap">
              <span class="project-card-sparkline-title">Campaign Conversion Trend (CTR & Leads)</span>
              <svg class="project-card-sparkline-svg" viewBox="0 0 400 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="card-gradient-blue-${p.id}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1877F2" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#1877F2" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path class="line" d="${spark.line}"></path>
                <path class="area" d="${spark.area}" fill="url(#card-gradient-blue-${p.id})"></path>
              </svg>
            </div>
            
            <div class="project-card-ads-footer">
              <span>Impressions: ${p.adsPerformance.impressions}</span>
              <span>CTR: ${p.adsPerformance.ctr}</span>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="project-card-actions">
          <a href="${p.instagramLink}" target="_blank" class="project-btn project-btn-insta" aria-label="Visit Instagram Profile">
            <i class="fab fa-instagram"></i> Instagram
          </a>
          <a href="${p.websiteLink}" target="_blank" class="project-btn project-btn-web" aria-label="Visit Live Website">
            <i class="fas fa-globe"></i> Website
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function initShowcaseInteractions() {
  const cards = document.querySelectorAll('.project-card');
  
  // CATEGORY PILLS FILTER OPERATIONS
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterVal = btn.getAttribute('data-filter');
      
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ==========================================================================
   10. INTERACTIVE CULTURE FLUID CANVAS ANIMATION
   ========================================================================== */
class CultureFluidAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.parent = canvas.closest('.about-media');
    this.blobs = [];
    this.numBlobs = 6;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.mouseActive = false;

    this.resize();
    this.initBlobs();
    this.bindEvents();
  }

  resize() {
    if (!this.parent) return;
    const rect = this.parent.getBoundingClientRect();
    this.canvas.width = rect.width * 1.2;
    this.canvas.height = rect.height * 1.2;
  }

  initBlobs() {
    this.blobs = [];
    const colors = ['#1877F2', '#c1ff72']; // Brand blue and lime
    
    for (let i = 0; i < this.numBlobs; i++) {
      this.blobs.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() * 0.6 + 0.3) * (Math.random() > 0.5 ? 1 : -1),
        vy: (Math.random() * 0.6 + 0.3) * (Math.random() > 0.5 ? 1 : -1),
        r: Math.random() * 30 + 55,
        color: colors[i % colors.length]
      });
    }

    // Mouse blob
    this.mouseBlob = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      r: 80,
      color: '#c1ff72'
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    if (!this.parent) return;

    this.parent.addEventListener('mousemove', (e) => {
      const rect = this.parent.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      
      // Calculate coordinates scaling for the 1.2x canvas size
      this.targetMouseX = (localX + rect.width * 0.1);
      this.targetMouseY = (localY + rect.height * 0.1);
      this.mouseActive = true;
    });

    this.parent.addEventListener('mouseleave', () => {
      this.mouseActive = false;
    });

    // Touch support for mobile hover simulation
    this.parent.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.parent.getBoundingClientRect();
        const localX = e.touches[0].clientX - rect.left;
        const localY = e.touches[0].clientY - rect.top;
        this.targetMouseX = (localX + rect.width * 0.1);
        this.targetMouseY = (localY + rect.height * 0.1);
        this.mouseActive = true;
      }
    });

    this.parent.addEventListener('touchend', () => {
      this.mouseActive = false;
    });
  }

  update() {
    // 1. Update autonomous bouncing blobs
    for (let b of this.blobs) {
      b.x += b.vx;
      b.y += b.vy;

      if (b.x - b.r < 0) {
        b.x = b.r;
        b.vx *= -1;
      } else if (b.x + b.r > this.canvas.width) {
        b.x = this.canvas.width - b.r;
        b.vx *= -1;
      }

      if (b.y - b.r < 0) {
        b.y = b.r;
        b.vy *= -1;
      } else if (b.y + b.r > this.canvas.height) {
        b.y = this.canvas.height - b.r;
        b.vy *= -1;
      }
    }

    // 2. LERP mouse blob
    if (this.mouseActive) {
      this.mouseBlob.x += (this.targetMouseX - this.mouseBlob.x) * 0.08;
      this.mouseBlob.y += (this.targetMouseY - this.mouseBlob.y) * 0.08;
    } else {
      // Drift slowly back to center when inactive
      this.mouseBlob.x += (this.canvas.width / 2 - this.mouseBlob.x) * 0.02;
      this.mouseBlob.y += (this.canvas.height / 2 - this.mouseBlob.y) * 0.02;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Solid background (required for the blur-contrast filter)
    this.ctx.fillStyle = '#060913';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw micro-dot coordinate grid
    this.drawDotGrid();

    // Draw autonomous blobs
    for (let b of this.blobs) {
      this.drawBlob(b);
    }

    // Draw mouse blob
    this.drawBlob(this.mouseBlob);
  }

  drawBlob(b) {
    const grad = this.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    grad.addColorStop(0, b.color);
    grad.addColorStop(0.2, b.color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawDotGrid() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    const spacing = 22;
    for (let x = spacing / 2; x < this.canvas.width; x += spacing) {
      for (let y = spacing / 2; y < this.canvas.height; y += spacing) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
}

function initCultureAnimation() {
  const canvas = document.getElementById('culture-canvas');
  const activeValueEl = document.getElementById('culture-active-value');
  
  if (!canvas) return;

  const anim = new CultureFluidAnimation(canvas);
  
  function tick() {
    anim.update();
    anim.draw();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Digital Scramble Text transitions
  const values = [
    'CREATIVE',
    'DATA-DRIVEN',
    'FUTURE-PROOF',
    'BOLD',
    'DIRECT',
    'VISIONARY',
    'COLLABORATIVE',
    'SPREAD IT THICK'
  ];
  let valIdx = 0;

  function scrambleText(element, newText) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ$_#@*';
    let frame = 0;
    const targetText = newText;
    const currentText = element.textContent;
    const length = Math.max(currentText.length, targetText.length);
    
    const interval = setInterval(() => {
      let display = '';
      let done = true;
      for (let i = 0; i < length; i++) {
        if (i < frame / 2) {
          display += targetText[i] || '';
        } else {
          if (currentText[i] || targetText[i]) {
            display += chars[Math.floor(Math.random() * chars.length)];
            done = false;
          }
        }
      }
      element.textContent = display;
      frame++;
      if (done) {
        clearInterval(interval);
      }
    }, 25);
  }

  // Swap value words periodically
  setInterval(() => {
    if (!activeValueEl) return;
    valIdx = (valIdx + 1) % values.length;
    scrambleText(activeValueEl, values[valIdx]);
  }, 2800);
}

/* ==========================================================================
   11. INTERACTIVE PREVIEW GRAPHICS FOR CAPABILITY CARDS
   ========================================================================== */
function initCapabilitiesVisuals() {
  const rows = document.querySelectorAll('.capability-row');
  const controllers = {};

  rows.forEach(row => {
    const id = row.getAttribute('data-id');
    const canvas = document.getElementById(`canvas-service-${id}`);
    const hud = document.getElementById(`hud-service-${id}`);
    if (!canvas || !hud) return;

    // Initialize HUD HTML overlays
    setupHudOverlay(id, hud);

    // Initialize Canvas Controller
    let controller;
    if (id === '01') controller = new PerformanceChartController(canvas);
    else if (id === '02') controller = new SocialOrbitController(canvas);
    else if (id === '03') controller = new InfluencerNetworkController(canvas);
    else if (id === '04') controller = new SeoRadarController(canvas);
    else if (id === '05') controller = new CameraViewportController(canvas);

    if (controller) {
      controllers[id] = controller;

      // Event listeners for hover states
      row.addEventListener('mouseenter', () => {
        controller.active = true;
        controller.onHoverStart();
      });
      row.addEventListener('mouseleave', () => {
        controller.active = false;
        controller.onHoverEnd();
      });
    }
  });

  // Setup HUD markup
  function setupHudOverlay(id, hud) {
    if (id === '01') {
      hud.innerHTML = `
        <div class="hud-top" style="color: rgba(255,255,255,0.4); font-size: 0.55rem; letter-spacing: 0.1em;">META_ADS_MANAGER</div>
        <div class="hud-center" style="display: flex; align-items: center; justify-content: center; height: 100%;"><div style="font-size: 0.72rem; color: #fff; font-weight: 700; letter-spacing: 0.05em;">ROAS: <span style="color: #c1ff72; text-shadow: 0 0 8px rgba(193,255,114,0.5);" id="hud-roas-val">4.85x</span></div></div>
        <div class="hud-bottom" style="color: rgba(255,255,255,0.35); font-size: 0.5rem; letter-spacing: 0.05em;">CONVERSIONS: +342%</div>
      `;
    } else if (id === '02') {
      hud.innerHTML = `
        <div class="hud-top" style="color: rgba(255,255,255,0.4); font-size: 0.55rem; letter-spacing: 0.1em;">SUITE_ENGAGEMENT</div>
        <div class="hud-center" style="display: flex; align-items: center; justify-content: center; height: 100%;"><div style="font-size: 0.72rem; color: #fff; font-weight: 700; letter-spacing: 0.05em;">REACH: <span style="color: #38bdf8; text-shadow: 0 0 8px rgba(56,189,248,0.5);">12.4K</span></div></div>
        <div class="hud-bottom" style="color: rgba(255,255,255,0.35); font-size: 0.5rem; letter-spacing: 0.05em;">IMPRESSIONS: +185%</div>
      `;
    } else if (id === '03') {
      hud.innerHTML = `
        <div class="hud-top" style="color: rgba(255,255,255,0.4); font-size: 0.55rem; letter-spacing: 0.1em;">CREATOR_SYNDICATION</div>
        <div class="hud-center" style="display: flex; align-items: center; justify-content: center; height: 100%;"><div style="font-size: 0.72rem; color: #fff; font-weight: 700; letter-spacing: 0.05em;">CREATORS: <span style="color: #c1ff72; text-shadow: 0 0 8px rgba(193,255,114,0.5);">140+</span></div></div>
        <div class="hud-bottom" style="color: rgba(255,255,255,0.35); font-size: 0.5rem; letter-spacing: 0.05em;">NET_REACH: 4.8M</div>
      `;
    } else if (id === '04') {
      hud.innerHTML = `
        <div class="hud-top" style="color: rgba(255,255,255,0.4); font-size: 0.55rem; letter-spacing: 0.1em;">SEO_CRITICAL_INDEX</div>
        <div class="hud-center" style="display: flex; align-items: center; justify-content: center; height: 100%;"><div style="font-size: 0.72rem; color: #fff; font-weight: 700; letter-spacing: 0.05em;">SEO SCORE: <span style="color: #c1ff72; text-shadow: 0 0 8px rgba(193,255,114,0.5);" id="hud-seo-score">98</span></div></div>
        <div class="hud-bottom" style="color: rgba(255,255,255,0.35); font-size: 0.5rem; letter-spacing: 0.05em;">GOOGLE RANKINGS: TOP_3</div>
      `;
    } else if (id === '05') {
      hud.innerHTML = `
        <div class="hud-top" style="color: rgba(255,255,255,0.4); font-size: 0.55rem; letter-spacing: 0.1em; display: flex; justify-content: space-between; width: 100%;"><span>DSLR_VIEWFINDER</span> <span style="color: #ef4444; font-weight: bold; animation: pulse-blink 1s infinite;" id="hud-rec-dot">REC •</span></div>
        <div class="hud-center" style="display: flex; align-items: center; justify-content: center; height: 100%;"></div>
        <div class="hud-bottom" style="color: rgba(255,255,255,0.35); font-size: 0.5rem; letter-spacing: 0.05em;">ISO 400 | F2.8 | 4K 60FPS</div>
      `;
    }
  }

  // Unified Frame Loop
  function tick() {
    Object.values(controllers).forEach(c => {
      // Draw when active
      if (c.active || c.opacity > 0) {
        c.update();
        c.draw();
      }
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Base controller class
class BasePreviewController {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.active = false;
    this.opacity = 0; // for transitions
    this.w = 0;
    this.h = 0;

    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.w = this.canvas.clientWidth || 190;
    this.h = this.canvas.clientHeight || 115;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
  }

  init() {}
  
  update() {
    // Fade in/out opacity LERP
    if (this.active) {
      this.opacity += (1 - this.opacity) * 0.15;
    } else {
      this.opacity += (0 - this.opacity) * 0.15;
    }
  }
  
  draw() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }
  
  onHoverStart() {}
  onHoverEnd() {}
}

// 1. Performance Chart (Meta Ads)
class PerformanceChartController extends BasePreviewController {
  init() {
    this.points = [];
    this.numPoints = 9;
    this.tickCount = 0;
    this.roas = 4.85;

    for (let i = 0; i < this.numPoints; i++) {
      this.points.push({
        x: (this.w / (this.numPoints - 1)) * i,
        y: this.h * 0.7 - (Math.sin(i * 0.8) * 12) - (i * 3) - (Math.random() * 5)
      });
    }
  }

  update() {
    super.update();
    this.tickCount++;
    if (this.tickCount % 60 === 0) {
      this.roas = 4.70 + Math.random() * 0.3;
      const valEl = document.getElementById('hud-roas-val');
      if (valEl) valEl.textContent = `${this.roas.toFixed(2)}x`;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.globalAlpha = this.opacity;
    
    // Draw background grids
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.w; x += 18) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.h);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.h; y += 18) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.w, y);
      this.ctx.stroke();
    }

    // Draw area gradient under chart
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.h);
    grad.addColorStop(0, 'rgba(24, 119, 242, 0.25)');
    grad.addColorStop(1, 'rgba(24, 119, 242, 0)');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.h);
    
    this.points.forEach(p => {
      this.ctx.lineTo(p.x, p.y);
    });

    this.ctx.lineTo(this.w, this.h);
    this.ctx.closePath();
    this.ctx.fill();

    // Draw chart line
    this.ctx.strokeStyle = 'rgba(24, 119, 242, 0.75)';
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#1877F2';
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Draw moving crawler indicator dot
    const activeIdx = Math.floor(this.tickCount * 0.15) % this.points.length;
    const node = this.points[activeIdx];
    if (node) {
      this.ctx.fillStyle = '#c1ff72';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = '#c1ff72';
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
    this.ctx.globalAlpha = 1.0;
  }
}

// 2. Social Media Orbit
class SocialOrbitController extends BasePreviewController {
  init() {
    this.angle = 0;
    this.networks = [
      { color: '#1877f2', label: 'F', size: 9, offset: 0, rX: 55, rY: 15 },
      { color: '#e1306c', label: 'I', size: 9, offset: Math.PI * 0.5, rX: 55, rY: 15 },
      { color: '#ff0000', label: 'Y', size: 9, offset: Math.PI, rX: 55, rY: 15 },
      { color: '#00f2fe', label: 'T', size: 9, offset: Math.PI * 1.5, rX: 55, rY: 15 }
    ];
    this.floatingSparks = [];
  }

  update() {
    super.update();
    this.angle += 0.018;

    // Spawn engagement icons
    if (this.active && Math.random() < 0.08) {
      this.floatingSparks.push({
        x: this.w / 2 + (Math.random() * 50 - 25),
        y: this.h * 0.75,
        vy: -(Math.random() * 0.8 + 0.4),
        alpha: 1,
        color: Math.random() > 0.5 ? '#ef4444' : '#c1ff72', // heart red or neon lime
        r: Math.random() * 2 + 1.8
      });
    }

    this.floatingSparks.forEach((h, idx) => {
      h.y += h.vy;
      h.alpha -= 0.015;
      if (h.alpha <= 0) this.floatingSparks.splice(idx, 1);
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.globalAlpha = this.opacity;
    
    const cx = this.w / 2;
    const cy = this.h / 2;

    // Center Core
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Orbit ellipse
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, 55, 15, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Calculate node coordinates with perspective scaling
    const nodes = this.networks.map(net => {
      const theta = this.angle + net.offset;
      const x = cx + Math.cos(theta) * net.rX;
      const y = cy + Math.sin(theta) * net.rY;
      const scale = 0.75 + (Math.sin(theta) * 0.25);
      return { ...net, x, y, scale };
    });

    // Painter's sorting by Y coordinate
    nodes.sort((a, b) => a.y - b.y);

    // Draw connecting lasers
    this.ctx.lineWidth = 0.5;
    nodes.forEach(net => {
      this.ctx.strokeStyle = `rgba(255,255,255,${0.04 * net.scale})`;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(net.x, net.y);
      this.ctx.stroke();
    });

    // Draw orbits
    nodes.forEach(net => {
      const r = net.size * net.scale;
      this.ctx.fillStyle = net.color;
      this.ctx.shadowBlur = this.active ? 8 : 2;
      this.ctx.shadowColor = net.color;
      this.ctx.beginPath();
      this.ctx.arc(net.x, net.y, r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      this.ctx.fillStyle = '#fff';
      this.ctx.font = `bold ${8 * net.scale}px monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(net.label, net.x, net.y);
    });

    // Sparks
    this.floatingSparks.forEach(h => {
      this.ctx.fillStyle = h.color;
      this.ctx.globalAlpha = h.alpha * this.opacity;
      this.ctx.beginPath();
      this.ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;
  }
}

// 3. Influencer Promotion (Creator Connections)
class InfluencerNetworkController extends BasePreviewController {
  init() {
    this.nodes = [];
    this.numNodes = 7;
    this.packets = [];

    for (let i = 0; i < this.numNodes; i++) {
      this.nodes.push({
        x: this.w * 0.15 + Math.random() * this.w * 0.7,
        y: this.h * 0.2 + Math.random() * this.h * 0.6,
        r: Math.random() * 2.5 + 2.5,
        pulseVal: Math.random() * Math.PI,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        color: Math.random() > 0.5 ? '#c1ff72' : '#1877F2'
      });
    }
  }

  update() {
    super.update();
    this.nodes.forEach(n => {
      n.pulseVal += n.pulseSpeed;
    });

    // Spawn data transfer packet particles
    if (this.active && Math.random() < 0.14 && this.nodes.length > 1) {
      const fromIdx = Math.floor(Math.random() * this.nodes.length);
      let toIdx = Math.floor(Math.random() * this.nodes.length);
      while (toIdx === fromIdx) {
        toIdx = Math.floor(Math.random() * this.nodes.length);
      }

      this.packets.push({
        x: this.nodes[fromIdx].x,
        y: this.nodes[fromIdx].y,
        tx: this.nodes[toIdx].x,
        ty: this.nodes[toIdx].y,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        color: this.nodes[fromIdx].color
      });
    }

    this.packets.forEach((p, idx) => {
      p.progress += p.speed;
      if (p.progress >= 1) this.packets.splice(idx, 1);
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.globalAlpha = this.opacity;

    // Draw networking paths
    this.ctx.lineWidth = 0.55;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
        this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
        this.ctx.stroke();
      }
    }

    // Draw traveling packet dots
    this.packets.forEach(p => {
      const x = p.x + (p.tx - p.x) * p.progress;
      const y = p.y + (p.ty - p.y) * p.progress;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Draw node dots
    this.nodes.forEach(n => {
      const curR = n.r + Math.sin(n.pulseVal) * 1.2;
      this.ctx.fillStyle = n.color;
      this.ctx.shadowBlur = this.active ? 6 : 2;
      this.ctx.shadowColor = n.color;
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, curR, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    this.ctx.globalAlpha = 1.0;
  }
}

// 4. SEO & Web Development (Code Compiler Dial)
class SeoRadarController extends BasePreviewController {
  init() {
    this.lines = [];
    this.radarY = 0;
    this.radarDir = 1;
    this.seo = 98;
    this.tickCount = 0;

    const snippets = [
      'import { seo } from "google";',
      'const index = new Indexer();',
      'const rank = index.crawl();',
      'HTTP 200 OK - SSL_ACTIVE',
      'const speed = LCP.optimize();',
      'INP_FACTOR: 35MS [GOOD]',
      'ROBOTS.txt - ALLOW_ALL',
      'SITEMAP.xml - PARSED'
    ];

    for (let i = 0; i < 5; i++) {
      this.lines.push({
        text: snippets[i % snippets.length],
        alpha: 0.15 + (i / 5) * 0.5
      });
    }
  }

  update() {
    super.update();
    this.tickCount++;

    if (this.tickCount % 22 === 0) {
      this.lines.shift();
      const snippets = [
        'import { seo } from "google";',
        'const index = new Indexer();',
        'const rank = index.crawl();',
        'HTTP 200 OK - SSL_ACTIVE',
        'const speed = LCP.optimize();',
        'INP_FACTOR: 35MS [GOOD]',
        'ROBOTS.txt - ALLOW_ALL',
        'SITEMAP.xml - PARSED'
      ];
      const newTxt = snippets[Math.floor(Math.random() * snippets.length)];
      this.lines.push({ text: newTxt, alpha: 0.65 });
    }

    this.lines.forEach(l => {
      l.alpha = Math.max(0.1, l.alpha - 0.006);
    });

    this.radarY += 0.9 * this.radarDir;
    if (this.radarY <= 0 || this.radarY >= this.h) {
      this.radarDir *= -1;
    }

    if (this.tickCount % 50 === 0) {
      this.seo = Math.floor(96 + Math.random() * 5);
      if (this.seo > 100) this.seo = 100;
      const el = document.getElementById('hud-seo-score');
      if (el) el.textContent = this.seo;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.globalAlpha = this.opacity;

    // Draw scrolling lines of code
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    this.lines.forEach((line, idx) => {
      this.ctx.fillStyle = `rgba(24, 119, 242, ${line.alpha})`;
      this.ctx.fillText(line.text, 8, 20 + (idx * 15));
    });

    // Draw circular SEO dial meter
    const cx = this.w - 38;
    const cy = this.h / 2;
    const r = 22;

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.stroke();

    const arcVal = (this.seo / 100) * Math.PI * 2;
    this.ctx.strokeStyle = '#c1ff72';
    this.ctx.lineWidth = 3;
    this.ctx.shadowBlur = this.active ? 6 : 1;
    this.ctx.shadowColor = '#c1ff72';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, -Math.PI * 0.5, -Math.PI * 0.5 + arcVal);
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Draw radar sweep
    this.ctx.strokeStyle = 'rgba(193, 255, 114, 0.07)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.radarY);
    this.ctx.lineTo(this.w, this.radarY);
    this.ctx.stroke();

    this.ctx.globalAlpha = 1.0;
  }
}

// 5. Drone & Photoshoot (Camera DSLR Viewfinder)
class CameraViewportController extends BasePreviewController {
  init() {
    this.recBlink = true;
    this.tickCount = 0;
    this.focusRadius = 15;
    this.targetFocusRadius = 15;
  }

  update() {
    super.update();
    this.tickCount++;

    // Blinking REC dot
    if (this.tickCount % 35 === 0) {
      this.recBlink = !this.recBlink;
      const el = document.getElementById('hud-rec-dot');
      if (el) el.style.opacity = this.recBlink ? '1' : '0.15';
    }

    if (this.active) {
      this.targetFocusRadius = 9;
    } else {
      this.targetFocusRadius = 15;
    }
    this.focusRadius += (this.targetFocusRadius - this.focusRadius) * 0.16;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.globalAlpha = this.opacity;

    // Simulated landscape grid panning lines
    const offset = (this.tickCount * 0.2) % 40;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    this.ctx.lineWidth = 0.5;
    for (let x = -40 + offset; x < this.w + 40; x += 30) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x - 15, this.h);
      this.ctx.stroke();
    }

    const cx = this.w / 2;
    const cy = this.h / 2;

    // Viewfinder corners
    this.ctx.strokeStyle = this.active ? '#c1ff72' : 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1.5;
    const size = 8;
    const pad = 10;

    // TL
    this.ctx.beginPath();
    this.ctx.moveTo(pad, pad + size);
    this.ctx.lineTo(pad, pad);
    this.ctx.lineTo(pad + size, pad);
    this.ctx.stroke();

    // TR
    this.ctx.beginPath();
    this.ctx.moveTo(this.w - pad - size, pad);
    this.ctx.lineTo(this.w - pad, pad);
    this.ctx.lineTo(this.w - pad, pad + size);
    this.ctx.stroke();

    // BL
    this.ctx.beginPath();
    this.ctx.moveTo(pad, this.h - pad - size);
    this.ctx.lineTo(pad, this.h - pad);
    this.ctx.lineTo(pad + size, this.h - pad);
    this.ctx.stroke();

    // BR
    this.ctx.beginPath();
    this.ctx.moveTo(this.w - pad - size, this.h - pad);
    this.ctx.lineTo(this.w - pad, this.h - pad);
    this.ctx.lineTo(this.w - pad, this.h - pad - size);
    this.ctx.stroke();

    // Crosshairs
    this.ctx.strokeStyle = this.active ? '#c1ff72' : 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.shadowBlur = this.active ? 5 : 0;
    this.ctx.shadowColor = '#c1ff72';

    this.ctx.beginPath();
    this.ctx.moveTo(cx - 5, cy);
    this.ctx.lineTo(cx + 5, cy);
    this.ctx.moveTo(cx, cy - 5);
    this.ctx.lineTo(cx, cy + 5);
    this.ctx.stroke();

    // Focus box
    this.ctx.beginPath();
    this.ctx.rect(cx - this.focusRadius, cy - this.focusRadius, this.focusRadius * 2, this.focusRadius * 2);
    this.ctx.stroke();

    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1.0;
  }
}
