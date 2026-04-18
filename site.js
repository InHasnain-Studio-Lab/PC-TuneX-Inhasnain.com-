(function () {
  'use strict';
  /* ================================================
     INHASNAIN — FUTURISTIC MOTION ENGINE v2
     ================================================ */

  // ── PAGE FADE-IN ─────────────────────────────────
  const pgOverlay = document.getElementById('pg-transition');
  if (pgOverlay) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { pgOverlay.classList.add('gone'); });
    });
  }

  // ── SMOOTH PAGE-LEAVE TRANSITION ─────────────────
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      if (pgOverlay) pgOverlay.classList.remove('gone');
      setTimeout(() => { window.location.href = href; }, 420);
    });
  });

  // ── PARTICLE CANVAS ──────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const COLORS = ['#7B2FFF','#00D4FF','#FF2D78','#FFD700','#00FF9C'];

  class Star {
    constructor() { this.init(); }
    init() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.size  = Math.random() * 1.6 + 0.2;
      this.vx    = (Math.random() - 0.5) * 0.28;
      this.vy    = (Math.random() - 0.5) * 0.28;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.018 + 0.005;
    }
    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.phase += this.speed;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.init();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.sin(this.phase) * 0.35 + 0.55;
      ctx.fillStyle   = this.color;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class Wisp {
    constructor() { this.init(); }
    init() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.r     = Math.random() * 100 + 50;
      this.alpha = Math.random() * 0.045 + 0.01;
      this.vx    = (Math.random() - 0.5) * 0.13;
      this.vy    = (Math.random() - 0.5) * 0.13;
      this.base  = ['rgba(123,47,255,','rgba(0,212,255,','rgba(255,45,120,'][Math.floor(Math.random()*3)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -200 || this.x > canvas.width+200 || this.y < -200 || this.y > canvas.height+200) this.init();
    }
    draw() {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      g.addColorStop(0, this.base + this.alpha + ')');
      g.addColorStop(1, this.base + '0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Shooting star
  class ShootingStar {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height * 0.5;
      this.len   = Math.random() * 120 + 60;
      this.speed = Math.random() * 8 + 4;
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
      this.alpha = 0;
      this.alive = false;
      this.timer = Math.random() * 400;
    }
    update() {
      if (--this.timer > 0) return;
      if (!this.alive) { this.alive = true; this.alpha = 1; }
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.alpha -= 0.025;
      if (this.alpha <= 0) this.reset();
    }
    draw() {
      if (!this.alive || this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      const grd = ctx.createLinearGradient(
        this.x, this.y,
        this.x - Math.cos(this.angle) * this.len,
        this.y - Math.sin(this.angle) * this.len
      );
      grd.addColorStop(0, '#ffffff');
      grd.addColorStop(1, 'transparent');
      ctx.strokeStyle = grd;
      ctx.lineWidth   = 1.5;
      ctx.shadowBlur  = 6;
      ctx.shadowColor = '#fff';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - Math.cos(this.angle)*this.len, this.y - Math.sin(this.angle)*this.len);
      ctx.stroke();
      ctx.restore();
    }
  }

  const stars    = Array.from({length: 200}, () => new Star());
  const wisps    = Array.from({length: 14},  () => new Wisp());
  const shooters = Array.from({length: 4},   () => new ShootingStar());

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wisps.forEach(w    => { w.update(); w.draw(); });
    stars.forEach(s    => { s.update(); s.draw(); });
    shooters.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(loop);
  })();

  // ── CURSOR GLOW ──────────────────────────────────
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function moveCursor() {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    cursorGlow.style.left = cx + 'px';
    cursorGlow.style.top  = cy + 'px';
    requestAnimationFrame(moveCursor);
  })();

  // ── TOP BAR SCROLL ────────────────────────────────
  const topBar = document.querySelector('.top-bar');
  if (topBar) window.addEventListener('scroll', () => topBar.classList.toggle('scrolled', window.scrollY > 40));

  // ── TYPEWRITER EFFECT ON HERO H1 ─────────────────
  const heroH1 = document.querySelector('.hero h1');
  if (heroH1) {
    const fullText = heroH1.textContent.trim();
    heroH1.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    heroH1.appendChild(cursor);
    let i = 0;
    const typeSpeed = 55;
    function typeNext() {
      if (i < fullText.length) {
        const node = document.createTextNode(fullText[i++]);
        heroH1.insertBefore(node, cursor);
        setTimeout(typeNext, typeSpeed + Math.random() * 30);
      }
    }
    setTimeout(typeNext, 600);
  }

  // ── SCROLL REVEAL ─────────────────────────────────
  const revealEls = document.querySelectorAll(
    '.card, .panel, .section-header, .auth-container'
  );

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    const d = i % 4;
    if (d === 1) el.classList.add('reveal-delay-1');
    else if (d === 2) el.classList.add('reveal-delay-2');
    else if (d === 3) el.classList.add('reveal-delay-3');
    io.observe(el);
  });

  // Also reveal hero card immediately
  document.querySelectorAll('.hero-card').forEach(el => {
    el.classList.add('reveal');
    setTimeout(() => el.classList.add('visible'), 200);
  });

  // ── CARD 3-D TILT ─────────────────────────────────
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -7;
      const ry = ((e.clientX - r.left - r.width /2) / (r.width /2)) *  7;
      card.style.transform  = `translateY(-8px) scale(1.01) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.transition = 'box-shadow .25s, border-color .25s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform .38s cubic-bezier(0.23,1,0.32,1), box-shadow .38s, border-color .38s';
    });
  });

  // ── HERO FLOAT ────────────────────────────────────
  // Runs after reveal to avoid conflict
  setTimeout(() => {
    const hc = document.querySelector('.hero-card');
    if (!hc) return;
    let t = 0;
    (function floatLoop() {
      t += 0.007;
      hc.style.transform = `translateY(${Math.sin(t) * 6}px)`;
      requestAnimationFrame(floatLoop);
    })();
  }, 900);

  // ── MAGNETIC BUTTONS ─────────────────────────────
  document.querySelectorAll('.btn--primary, .btn--secondary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width /2)) * 0.18;
      const dy = (e.clientY - (r.top  + r.height/2)) * 0.18;
      btn.style.transform = `translate(${dx}px,${dy}px) scale(1.04)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform .4s cubic-bezier(0.23,1,0.32,1), box-shadow .28s';
    });
  });

  // ── AUTH TABS ─────────────────────────────────────
  const tabs   = document.querySelectorAll('.auth-tab');
  const panels = document.querySelectorAll('.auth-panel');

  function activateTab(tab) {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
    });
    panels.forEach(p => {
      const show = p.id === tab.dataset.tab;
      p.classList.toggle('hidden', !show);
      p.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
  }

  if (tabs.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const idx  = Array.from(tabs).indexOf(tab);
          const next = e.key === 'ArrowRight'
            ? (idx + 1) % tabs.length
            : (idx - 1 + tabs.length) % tabs.length;
          tabs[next].focus();
          activateTab(tabs[next]);
        }
      });
    });
    const initial = document.querySelector('.auth-tab.active') || tabs[0];
    if (initial) activateTab(initial);
  }

  // ── FORMS ─────────────────────────────────────────
  function wireForm(formId, msgId, okText) {
    const form = document.getElementById(formId);
    const msg  = document.getElementById(msgId);
    if (!form || !msg) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      msg.classList.remove('error','success');
      if (!form.checkValidity()) {
        msg.textContent = 'Please complete all required fields correctly.';
        msg.classList.add('error');
        form.reportValidity();
        return;
      }
      msg.textContent = okText;
      msg.classList.add('success');
      form.reset();
    });
  }

  wireForm('signup-form',   'signup-status',   'Account draft created successfully. You will receive a confirmation email shortly.');
  wireForm('signin-form',   'signin-status',   'Sign in accepted. Redirecting to your dashboard...');
  wireForm('contact-form',  'contact-status',  'Thanks for contacting us. We will reply within 1 business day.');
  wireForm('feedback-form', 'feedback-status', 'Thanks for your feedback. It has been submitted successfully.');

})();
