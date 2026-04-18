(function () {
  'use strict';
  /* ================================================
     INHASNAIN — FUTURISTIC MOTION ENGINE v3
     WebGL Fluid + Wormhole + Gravity + Liquid Cursor
     + Quantum Cards + Break Screen + Time-Aware
     ================================================ */

  // ── TIME-AWARE LIVING ATMOSPHERE ─────────────────
  function getTimePeriod() {
    const h = new Date().getHours();
    if (h >= 5 && h <= 8)  return 'dawn';
    if (h >= 9 && h <= 17)  return 'day';
    if (h >= 18 && h <= 21) return 'evening';
    return 'night';
  }

  const timePeriod = getTimePeriod();
  document.documentElement.setAttribute('data-time', timePeriod);

  // Update fluid simulation palette based on time
  const timePalettes = {
    dawn:    [[1,0.42,0.21],[1,0.7,0.28],[1,0.55,0.58],[1,0.86,0.35],[1,0.63,0.48]],
    day:     [[0,0.6,1],[0,0.9,1],[0.25,0.77,1],[0,0.9,0.46],[0.5,0.85,1]],
    evening: [[0.61,0.15,0.69],[1,0.56,0],[0.88,0.25,0.98],[1,0.7,0],[0.81,0.58,0.85]],
    night:   [[0.36,0.09,1],[0.48,0.56,1],[0.69,0.25,1],[0.38,0.49,1],[0.42,0.35,1]]
  };

  // Wait for fluid.js to be ready
  requestAnimationFrame(() => {
    if (window._fluidSetPalette && timePalettes[timePeriod]) {
      window._fluidSetPalette(timePalettes[timePeriod]);
    }
  });

  // Time greeting
  const greetings = {
    dawn: '☀️ Good Morning — Dawn Mode',
    day: '⚡ Good Day — Energized Mode',
    evening: '🌅 Good Evening — Sunset Mode',
    night: '🌙 Good Night — Deep Space Mode'
  };
  const greetEl = document.createElement('div');
  greetEl.className = 'time-greeting';
  greetEl.textContent = greetings[timePeriod];
  document.body.appendChild(greetEl);

  // ── PAGE FADE-IN ─────────────────────────────────
  const pgOverlay = document.getElementById('pg-transition');
  if (pgOverlay) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { pgOverlay.classList.add('gone'); });
    });
  }

  // ── 3D WORMHOLE PORTAL PAGE TRANSITIONS ──────────
  const wormCanvas = document.createElement('canvas');
  wormCanvas.id = 'wormhole-canvas';
  document.body.appendChild(wormCanvas);
  const wCtx = wormCanvas.getContext('2d');

  function resizeWormhole() {
    wormCanvas.width = window.innerWidth;
    wormCanvas.height = window.innerHeight;
  }
  resizeWormhole();
  window.addEventListener('resize', resizeWormhole);

  function animateWormhole(callback) {
    wormCanvas.classList.add('active');
    const cx = wormCanvas.width / 2, cy = wormCanvas.height / 2;
    const maxR = Math.hypot(cx, cy);
    const rings = 18;
    let t = 0;
    const duration = 500;
    const start = performance.now();

    const themeColors = {
      dawn: ['#FF6B35','#FFB347','#FF8C94'],
      day: ['#00E5FF','#0099FF','#40C4FF'],
      evening: ['#9C27B0','#FF8F00','#E040FB'],
      night: ['#5C16FF','#7B8EFF','#B040FF']
    };
    const colors = themeColors[timePeriod] || ['#7B2FFF','#00D4FF','#FF2D78'];

    function frame(now) {
      t = (now - start) / duration;
      if (t > 1) t = 1;
      wCtx.clearRect(0, 0, wormCanvas.width, wormCanvas.height);
      wCtx.save();
      wCtx.translate(cx, cy);
      wCtx.globalAlpha = Math.sin(t * Math.PI);

      for (let i = rings; i >= 0; i--) {
        const progress = i / rings;
        const r = maxR * progress * t;
        const rotation = t * Math.PI * 4 * (1 - progress);
        wCtx.save();
        wCtx.rotate(rotation);
        wCtx.beginPath();
        wCtx.ellipse(0, 0, r, r * 0.7, 0, 0, Math.PI * 2);
        wCtx.strokeStyle = colors[i % colors.length];
        wCtx.lineWidth = 2 + (1 - progress) * 3;
        wCtx.shadowBlur = 20;
        wCtx.shadowColor = colors[i % colors.length];
        wCtx.stroke();
        wCtx.restore();
      }

      // Center bright spot
      const grd = wCtx.createRadialGradient(0, 0, 0, 0, 0, 60 * t);
      grd.addColorStop(0, 'rgba(255,255,255,' + (0.9 * Math.sin(t * Math.PI)) + ')');
      grd.addColorStop(1, 'transparent');
      wCtx.fillStyle = grd;
      wCtx.beginPath();
      wCtx.arc(0, 0, 60 * t, 0, Math.PI * 2);
      wCtx.fill();

      wCtx.restore();

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        wormCanvas.classList.remove('active');
        if (callback) callback();
      }
    }
    requestAnimationFrame(frame);
  }

  // Override link navigation with wormhole
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      animateWormhole(() => { window.location.href = href; });
    });
  });

  // ── LIQUID METAL CURSOR TRAIL ────────────────────
  const cursorCanvas = document.createElement('canvas');
  cursorCanvas.id = 'cursor-canvas';
  document.body.appendChild(cursorCanvas);
  const cCtx = cursorCanvas.getContext('2d');

  function resizeCursorCanvas() {
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
  }
  resizeCursorCanvas();
  window.addEventListener('resize', resizeCursorCanvas);

  let mx = -100, my = -100;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  const blobs = [];
  const BLOB_COUNT = 10;
  for (let i = 0; i < BLOB_COUNT; i++) {
    blobs.push({ x: -100, y: -100, vx: 0, vy: 0, size: 14 - i * 1.1 });
  }

  (function cursorLoop() {
    cCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

    // Leader follows mouse
    blobs[0].vx += (mx - blobs[0].x) * 0.25;
    blobs[0].vy += (my - blobs[0].y) * 0.25;
    blobs[0].vx *= 0.6;
    blobs[0].vy *= 0.6;
    blobs[0].x += blobs[0].vx;
    blobs[0].y += blobs[0].vy;

    // Followers use spring physics
    for (let i = 1; i < BLOB_COUNT; i++) {
      const target = blobs[i - 1];
      const spring = 0.18 - i * 0.008;
      const damping = 0.72;
      blobs[i].vx += (target.x - blobs[i].x) * spring;
      blobs[i].vy += (target.y - blobs[i].y) * spring;
      blobs[i].vx *= damping;
      blobs[i].vy *= damping;
      blobs[i].x += blobs[i].vx;
      blobs[i].y += blobs[i].vy;
    }

    // Draw blobs with velocity stretch
    const style = getComputedStyle(document.documentElement);
    const purple = style.getPropertyValue('--purple').trim() || '#7B2FFF';
    const cyan = style.getPropertyValue('--cyan').trim() || '#00D4FF';

    for (let i = BLOB_COUNT - 1; i >= 0; i--) {
      const b = blobs[i];
      const speed = Math.hypot(b.vx, b.vy);
      const stretch = 1 + speed * 0.02;
      const angle = Math.atan2(b.vy, b.vx);
      const alpha = 0.35 - i * 0.028;

      cCtx.save();
      cCtx.translate(b.x, b.y);
      cCtx.rotate(angle);
      cCtx.scale(stretch, 1 / stretch);
      cCtx.beginPath();
      cCtx.arc(0, 0, b.size, 0, Math.PI * 2);

      const grd = cCtx.createRadialGradient(0, 0, 0, 0, 0, b.size);
      grd.addColorStop(0, purple);
      grd.addColorStop(1, cyan);
      cCtx.fillStyle = grd;
      cCtx.globalAlpha = Math.max(0.05, alpha);
      cCtx.shadowBlur = 15;
      cCtx.shadowColor = cyan;
      cCtx.fill();
      cCtx.restore();
    }

    requestAnimationFrame(cursorLoop);
  })();

  // ── GRAVITATIONAL MAGNETIC UNIVERSE ──────────────
  const gravTargets = document.querySelectorAll('.card, .btn--primary, .btn--secondary, .icon-btn');
  let gmx = 0, gmy = 0;
  document.addEventListener('mousemove', e => { gmx = e.clientX; gmy = e.clientY; });

  (function gravLoop() {
    gravTargets.forEach(el => {
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2;
      const ey = r.top + r.height / 2;
      const dx = gmx - ex;
      const dy = gmy - ey;
      const dist = Math.hypot(dx, dy);
      const maxDist = 350;

      if (dist < maxDist && dist > 10) {
        const force = Math.min(8, 1200 / (dist * dist)) * 0.6;
        const tx = dx / dist * force;
        const ty = dy / dist * force;
        el.style.transform = el.style.transform.replace(/translate\([^)]*\)\s*/g, '') || '';
        el.style.transform = `translate(${tx}px,${ty}px) ` + el.style.transform;
      } else {
        // Only clean gravitational translate, keep other transforms
        el.style.transform = el.style.transform.replace(/translate\([^)]*\)\s*/g, '').trim() || '';
      }
    });
    requestAnimationFrame(gravLoop);
  })();

  // ── QUANTUM STATE CARDS ──────────────────────────
  document.querySelectorAll('.card').forEach(card => {
    card.classList.add('quantum');
    // Add ghost element
    const ghost = document.createElement('div');
    ghost.className = 'quantum-ghost';
    card.appendChild(ghost);

    // Collapse on click
    card.addEventListener('click', () => {
      card.classList.toggle('collapsed');
    });
  });

  // ── "BREAK THE SCREEN" CLICK EFFECT ──────────────
  const crackCanvas = document.createElement('canvas');
  crackCanvas.id = 'crack-canvas';
  document.body.appendChild(crackCanvas);
  const crCtx = crackCanvas.getContext('2d');

  function resizeCrack() {
    crackCanvas.width = window.innerWidth;
    crackCanvas.height = window.innerHeight;
  }
  resizeCrack();
  window.addEventListener('resize', resizeCrack);

  const cracks = [];

  function createCrack(x, y) {
    const branches = 5 + Math.floor(Math.random() * 4);
    const style = getComputedStyle(document.documentElement);
    const color = style.getPropertyValue('--cyan').trim() || '#00D4FF';

    for (let b = 0; b < branches; b++) {
      const angle = (Math.PI * 2 / branches) * b + (Math.random() - 0.5) * 0.5;
      const segments = [];
      let cx = x, cy = y;
      const len = 60 + Math.random() * 120;
      const steps = 6 + Math.floor(Math.random() * 6);

      for (let s = 0; s < steps; s++) {
        const a = angle + (Math.random() - 0.5) * 0.8;
        const segLen = len / steps;
        const nx = cx + Math.cos(a) * segLen;
        const ny = cy + Math.sin(a) * segLen;
        segments.push({ x1: cx, y1: cy, x2: nx, y2: ny });
        cx = nx;
        cy = ny;

        // Sub-branch
        if (Math.random() > 0.6) {
          const sa = a + (Math.random() - 0.5) * 1.2;
          const sl = segLen * 0.6;
          segments.push({ x1: cx, y1: cy, x2: cx + Math.cos(sa) * sl, y2: cy + Math.sin(sa) * sl });
        }
      }
      cracks.push({ segments, alpha: 1, color, born: performance.now() });
    }
  }

  // Click on background triggers cracks
  document.addEventListener('click', e => {
    if (e.target.closest('a, button, input, textarea, select, .auth-container, nav')) return;
    createCrack(e.clientX, e.clientY);
  });

  (function crackLoop() {
    crCtx.clearRect(0, 0, crackCanvas.width, crackCanvas.height);
    const now = performance.now();

    for (let i = cracks.length - 1; i >= 0; i--) {
      const c = cracks[i];
      const age = (now - c.born) / 3000; // 3s fade
      c.alpha = 1 - age;
      if (c.alpha <= 0) { cracks.splice(i, 1); continue; }

      crCtx.save();
      crCtx.globalAlpha = c.alpha;
      crCtx.strokeStyle = c.color;
      crCtx.lineWidth = 1.5;
      crCtx.shadowBlur = 12;
      crCtx.shadowColor = c.color;

      c.segments.forEach(seg => {
        crCtx.beginPath();
        crCtx.moveTo(seg.x1, seg.y1);
        crCtx.lineTo(seg.x2, seg.y2);
        crCtx.stroke();
      });

      crCtx.restore();
    }
    requestAnimationFrame(crackLoop);
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
