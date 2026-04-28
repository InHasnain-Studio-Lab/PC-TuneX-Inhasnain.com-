/* fluid.js — Rain World
   sky-canvas  (z:-5): stars, sun-glow-through-clouds, mist
   rain-canvas (z:50, pointer-events:none): falling rain, splats,
               droplets running down the page like a glass window
*/
(function(){
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  /* ── sky canvas (background layer, behind panels) ── */
  const sky  = document.createElement('canvas');
  sky.id     = 'sky-canvas';
  document.body.appendChild(sky);
  const skCtx = sky.getContext('2d', {alpha:true});

  /* ── rain canvas (foreground layer) ── */
  const rc   = document.createElement('canvas');
  rc.id      = 'rain-canvas';
  rc.style.cssText = 'position:fixed;inset:0;z-index:50;pointer-events:none;width:100vw;height:100vh';
  document.body.appendChild(rc);
  const rCtx = rc.getContext('2d', {alpha:true});

  let W = 0, H = 0, DPR = Math.min(devicePixelRatio || 1, 2);

  function resize(){
    W = sky.width  = rc.width  = innerWidth  * DPR;
    H = sky.height = rc.height = innerHeight * DPR;
    sky.style.width  = rc.style.width  = innerWidth  + 'px';
    sky.style.height = rc.style.height = innerHeight + 'px';
    seedStars();
  }
  addEventListener('resize', resize);

  const ph = () => window.__phase || 'day';
  const wx = () => window.__weather || 'rain';
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ── STARS ── dense field: bright + dim + milky way layers ── */
  const STARS = [];
  function seedStars(){
    STARS.length = 0;
    /* Layer 1 — bright foreground stars */
    for (let i = 0; i < 420; i++){
      STARS.push({
        x: Math.random() * W, y: Math.random() * H * 0.92,
        r: rand(0.5, 2.2) * DPR,
        a: rand(0.35, 0.90),
        tw: Math.random() * Math.PI * 2,
        sp: rand(0.010, 0.030),
        drift: rand(-0.025, 0.025) * DPR,
      });
    }
    /* Layer 2 — dim background stars (fills gaps) */
    for (let i = 0; i < 380; i++){
      STARS.push({
        x: Math.random() * W, y: Math.random() * H * 0.95,
        r: rand(0.2, 0.85) * DPR,
        a: rand(0.12, 0.38),
        tw: Math.random() * Math.PI * 2,
        sp: rand(0.004, 0.012),
        drift: rand(-0.008, 0.008) * DPR,
      });
    }
    /* Layer 3 — Milky Way dense band */
    for (let i = 0; i < 320; i++){
      const t = Math.random();
      STARS.push({
        x: W * 0.05 + t * W * 0.90,
        y: H * 0.01 + t * H * 0.52 + rand(-70, 70) * DPR,
        r: rand(0.10, 0.55) * DPR,
        a: rand(0.08, 0.28),
        tw: Math.random() * Math.PI * 2, sp: 0.003,
        drift: rand(-0.005, 0.005) * DPR,
      });
    }
    /* Layer 4 — scattered large bright stars / blue giants */
    for (let i = 0; i < 28; i++){
      STARS.push({
        x: Math.random() * W, y: Math.random() * H * 0.80,
        r: rand(1.8, 3.2) * DPR,
        a: rand(0.55, 0.95),
        tw: Math.random() * Math.PI * 2,
        sp: rand(0.005, 0.015),
        drift: rand(-0.01, 0.01) * DPR,
        blue: true,
      });
    }
  }
  resize();

  /* ── DAY SKY — crystal clear atmospheric light (no sun disc) ── */
  function drawDaySky(){
    /* Soft zenith-to-horizon gradient — like sky light through pure crystal */
    const skyGrad = skCtx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0,   'rgba(160,200,255,.22)');
    skyGrad.addColorStop(0.35,'rgba(190,220,255,.12)');
    skyGrad.addColorStop(0.7, 'rgba(220,238,255,.07)');
    skyGrad.addColorStop(1,   'rgba(240,248,255,.04)');
    skCtx.fillStyle = skyGrad;
    skCtx.fillRect(0, 0, W, H);
    /* Prismatic edge light — pale rainbow bloom at top-right */
    const prism = skCtx.createRadialGradient(W*0.82, 0, 0, W*0.82, 0, W*0.55);
    prism.addColorStop(0,    'rgba(255,245,255,.14)');
    prism.addColorStop(0.15, 'rgba(220,245,255,.10)');
    prism.addColorStop(0.35, 'rgba(200,230,255,.06)');
    prism.addColorStop(0.6,  'rgba(210,235,255,.03)');
    prism.addColorStop(1,    'rgba(210,235,255,0)');
    skCtx.fillStyle = prism;
    skCtx.fillRect(0, 0, W, H);
  }

  /* ══════════════════════════════════════════════════════════════
     ULTRA-REALISTIC RAIN SYSTEM
     ─ 3 drop tiers: heavy streaks · fine mist · micro spray
     ─ Window rivulets: teardrop head, branching fork, merge logic
     ─ Impact splats: double elliptical ring + micro-droplet scatter
     ─ Depth layers: foreground fast / background slow/transparent
     ══════════════════════════════════════════════════════════════ */

  /* drop tiers: [len range, speed range, width, alpha range] */
  const DROP_TIERS = [
    { lenMin:28, lenMax:62, spdMin:14, spdMax:22, w:0.9, aMin:0.38, aMax:0.62 }, /* heavy */
    { lenMin:14, lenMax:32, spdMin: 9, spdMax:16, w:0.55,aMin:0.22, aMax:0.42 }, /* medium */
    { lenMin: 5, lenMax:14, spdMin: 5, spdMax:11, w:0.3, aMin:0.10, aMax:0.22 }, /* fine mist */
  ];
  const TIER_WEIGHT = [0.28, 0.44, 0.28]; /* probability of each tier */

  const drops   = [];
  const splats  = [];
  const rivulets = [];

  const ANG = 0.14; /* slight angle — 8° from vertical */
  const DX  = Math.sin(ANG);
  const DY  = Math.cos(ANG);

  function pickTier(){
    const r = Math.random();
    return r < TIER_WEIGHT[0] ? DROP_TIERS[0]
         : r < TIER_WEIGHT[0]+TIER_WEIGHT[1] ? DROP_TIERS[1]
         : DROP_TIERS[2];
  }
  function spawnDrop(seedY){
    const t = pickTier();
    drops.push({
      x  : Math.random() * (W + 80*DPR) - 40*DPR,
      y  : seedY != null ? seedY : -rand(5, H*0.6),
      len: rand(t.lenMin, t.lenMax) * DPR,
      spd: rand(t.spdMin, t.spdMax) * DPR,
      w  : t.w * DPR,
      a  : rand(t.aMin, t.aMax),
      /* each drop has a subtle length oscillation for realism */
      osc: rand(0, Math.PI*2),
      oscSpd: rand(0.08, 0.22),
    });
  }

  /* Seed rain spread across screen so it doesn't start empty */
  (function seedRain(){
    for(let i = 0; i < 260; i++) spawnDrop(Math.random() * H);
  })();

  /* ── Impact splat: double ellipse rings + scatter motes ── */
  function spawnSplat(x, y){
    const r = rand(1.8, 4.5) * DPR;
    /* 2 rings per splat for depth */
    splats.push({ x, y, r, life:1.0, ring:1 });
    splats.push({ x, y, r:r*0.52, life:0.85, ring:2 });

    /* Scatter 3–6 micro-motes outward */
    const n = 3 + Math.floor(Math.random()*4);
    for(let i=0;i<n;i++){
      const ang = Math.random()*Math.PI*2;
      const dist = rand(4,12)*DPR;
      splats.push({
        x: x + Math.cos(ang)*dist, y: y + Math.sin(ang)*dist*.55,
        r: rand(0.4, 1.2)*DPR, life:0.7, ring:3
      });
    }

    /* 40% chance to start a rivulet */
    if(Math.random() < 0.40 && rivulets.length < 60){
      rivulets.push({
        x    : x + rand(-3,3)*DPR,
        y    : y,
        r    : rand(2.2, 4.2)*DPR,
        spd  : rand(0.3, 0.9)*DPR,
        life : rand(0.75, 1.0),
        trail: [],
        fork : null,       /* branching fork rivulet */
        forkAt: rand(0.3, 0.7),  /* fork when life drops to this */
        wobbleOff: Math.random()*10,
      });
    }
  }

  function drawRain(){
    const night = ph() === 'night';
    /* Night: cool blue-silver. Day: warm slate */
    const r = night ? 178 : 110, g = night ? 205 : 128, b = night ? 238 : 158;

    for(let i = drops.length-1; i >= 0; i--){
      const d = drops[i];
      d.osc += d.oscSpd;
      const lenNow = d.len * (0.88 + 0.12 * Math.sin(d.osc));

      /* Streak gradient: bright head fades to tail */
      const hx = d.x, hy = d.y;
      const tx = d.x - DX*lenNow, ty = d.y - DY*lenNow;
      const grd = rCtx.createLinearGradient(hx, hy, tx, ty);
      grd.addColorStop(0,   `rgba(${r},${g},${b},${d.a})`);
      grd.addColorStop(0.3, `rgba(${r},${g},${b},${d.a*0.7})`);
      grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      rCtx.strokeStyle = grd;
      rCtx.lineWidth   = d.w;
      rCtx.lineCap     = 'round';
      rCtx.beginPath(); rCtx.moveTo(hx, hy); rCtx.lineTo(tx, ty); rCtx.stroke();

      d.x += DX * d.spd; d.y += DY * d.spd;
      if(d.y - d.len > H + 5*DPR){
        /* splat at impact point along bottom 20% */
        spawnSplat(d.x, H * rand(0.80, 0.97));
        drops.splice(i, 1);
        spawnDrop(); /* replenish */
      }
    }
  }

  function drawSplats(){
    const night = ph() === 'night';
    const r = night ? 185 : 115, g = night ? 210 : 132, b = night ? 245 : 165;
    for(let i = splats.length-1; i >= 0; i--){
      const s = splats[i];
      if(s.ring === 3){
        /* micro-mote: filled circle */
        rCtx.globalAlpha = Math.max(0, s.life * 0.5);
        rCtx.fillStyle = `rgba(${r},${g},${b},1)`;
        rCtx.beginPath(); rCtx.arc(s.x, s.y, s.r, 0, Math.PI*2); rCtx.fill();
        rCtx.globalAlpha = 1;
        s.life -= 0.055;
      } else {
        /* expanding ellipse ring */
        const expand = 1.0 + (1.0 - s.life) * (s.ring === 1 ? 2.2 : 1.6);
        rCtx.strokeStyle = `rgba(${r},${g},${b},${Math.max(0, s.life * 0.48)})`;
        rCtx.lineWidth   = (s.ring === 1 ? 0.9 : 0.55) * DPR;
        rCtx.beginPath();
        rCtx.ellipse(s.x, s.y, s.r*expand, s.r*expand*0.5, 0, 0, Math.PI*2);
        rCtx.stroke();
        s.life -= s.ring === 1 ? 0.048 : 0.065;
      }
      if(s.life <= 0) splats.splice(i, 1);
    }
  }

  function drawRivulets(){
    const night = ph() === 'night';
    const r = night ? 175 : 108, g = night ? 205 : 128, b = night ? 235 : 155;

    for(let i = rivulets.length-1; i >= 0; i--){
      const rv = rivulets[i];

      /* Create fork branch when life crosses threshold */
      if(rv.fork === null && rv.life < rv.forkAt && Math.random() < 0.35){
        rv.fork = {
          x: rv.x + rand(-2,2)*DPR, y: rv.y,
          r: rv.r * rand(0.45, 0.65),
          spd: rv.spd * rand(0.6, 0.9),
          life: rv.life * rand(0.55, 0.80),
          trail: [], forkDir: Math.random() < 0.5 ? 1 : -1,
          wobbleOff: Math.random()*10, fork:null, forkAt:0,
        };
        rivulets.push(rv.fork);
      }

      rv.trail.push({x:rv.x, y:rv.y});
      if(rv.trail.length > 22) rv.trail.shift();

      /* Trail: smooth tapered line */
      if(rv.trail.length > 1){
        for(let j=1; j<rv.trail.length; j++){
          const t = j / rv.trail.length;
          rCtx.strokeStyle = `rgba(${r},${g},${b},${(t * rv.life * 0.28).toFixed(3)})`;
          rCtx.lineWidth   = rv.r * t * 0.5;
          rCtx.lineCap = 'round';
          rCtx.beginPath();
          rCtx.moveTo(rv.trail[j-1].x, rv.trail[j-1].y);
          rCtx.lineTo(rv.trail[j].x,   rv.trail[j].y);
          rCtx.stroke();
        }
      }

      /* Droplet head: teardrop (elongated ellipse, brighter at top) */
      const hg = rCtx.createRadialGradient(
        rv.x, rv.y - rv.r*0.35, 0,
        rv.x, rv.y,              rv.r
      );
      hg.addColorStop(0,   `rgba(255,255,255,${rv.life * 0.72})`);
      hg.addColorStop(0.4, `rgba(${r},${g},${b},${rv.life * 0.42})`);
      hg.addColorStop(1,   `rgba(${r},${g},${b},${rv.life * 0.10})`);
      rCtx.fillStyle = hg;
      rCtx.beginPath();
      rCtx.ellipse(rv.x, rv.y, rv.r * 0.62, rv.r, 0, 0, Math.PI*2);
      rCtx.fill();

      /* Specular glint: tiny bright dot near top of droplet */
      rCtx.globalAlpha = rv.life * 0.55;
      rCtx.fillStyle = 'rgba(255,255,255,1)';
      rCtx.beginPath(); rCtx.arc(rv.x - rv.r*0.2, rv.y - rv.r*0.32, rv.r*0.18, 0, Math.PI*2); rCtx.fill();
      rCtx.globalAlpha = 1;

      /* Physics: gravity + surface-tension wobble + slight fork lean */
      const wobble = Math.sin(rv.y * 0.022 + rv.wobbleOff) * 0.5 * DPR;
      rv.x += wobble + (rv.forkDir || 0) * 0.12 * DPR;
      rv.y += rv.spd * (1 + rv.r * 0.06);
      rv.spd = Math.min(rv.spd * 1.004, 4.2*DPR);
      rv.r  *= 0.9998;
      rv.life -= 0.0015;
      if(rv.y > H + 20*DPR || rv.life <= 0) rivulets.splice(i, 1);
    }
  }

  /* mist/fog overlay on sky canvas */
  function drawMist(){
    const p = ph();
    /* rainy atmosphere veil */
    const grad = skCtx.createLinearGradient(0, 0, 0, H);
    if (p === 'day'){
      grad.addColorStop(0,   'rgba(210,218,222,.08)');
      grad.addColorStop(0.5, 'rgba(200,210,215,.05)');
      grad.addColorStop(1,   'rgba(190,200,208,.10)');
    } else {
      grad.addColorStop(0,   'rgba(10,16,32,.35)');
      grad.addColorStop(0.5, 'rgba(8,12,26,.22)');
      grad.addColorStop(1,   'rgba(5,8,18,.40)');
    }
    skCtx.fillStyle = grad;
    skCtx.fillRect(0, 0, W, H);
  }

  /* ── FLOATING DUST MOTES ──
     60 upward-drifting particles on the sky canvas.
     Day = warm amber/cream. Night = cool blue-white.
     Each mote has a gentle sinusoidal horizontal wobble.
  ── */
  const MOTES = [];
  (function seedMotes(){
    for (let i = 0; i < 60; i++){
      MOTES.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: rand(0.8, 2.4) * DPR,
        vy: rand(-0.18, -0.07) * DPR,    /* slow upward drift */
        vx: rand(-0.04, 0.04) * DPR,
        phase: Math.random() * Math.PI * 2,
        wobble: rand(0.004, 0.012),       /* horizontal sine freq */
        wobbleAmp: rand(0.3, 0.9) * DPR,
        alpha: rand(0.06, 0.22),
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpd: rand(0.008, 0.022),
      });
    }
  })();

  function drawMotes(){
    const p = ph();
    const dayColor   = '255,235,190';
    const nightColor = '180,210,255';
    const col = p === 'night' ? nightColor : dayColor;
    for (const m of MOTES){
      m.phase     += m.wobble;
      m.twinkle   += m.twinkleSpd;
      m.x         += m.vx + Math.sin(m.phase) * m.wobbleAmp * 0.06;
      m.y         += m.vy;
      if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; }
      if (m.x < -4) m.x = W + 4;
      if (m.x > W + 4) m.x = -4;
      const pulse = 0.65 + 0.35 * Math.sin(m.twinkle);
      const a     = m.alpha * pulse * (p === 'night' ? 1.2 : 0.8);
      skCtx.beginPath();
      skCtx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      skCtx.fillStyle = `rgba(${col},${a.toFixed(3)})`;
      skCtx.fill();
    }
  }

  /* ── MAIN LOOP ── */
  let frame = 0;
  function loop(){
    frame++;
    skCtx.clearRect(0, 0, W, H);
    rCtx.clearRect(0, 0, W, H);
    const p = ph();

    /* ── SKY LAYER ── */
    const weather = wx();
    if (weather === 'rain') drawMist();

    if (p === 'night'){
      /* stars on sky canvas */
      for (const s of STARS){
        s.tw += s.sp; s.x += s.drift;
        if (s.x < -2) s.x = W+2; if (s.x > W+2) s.x = -2;
        const dimmed = weather === 'rain' ? 0.70 : 1.0;
        const a = s.a * (0.5 + 0.5*Math.sin(s.tw)) * dimmed;
        if(s.blue){
          /* blue-white giants with small soft halo */
          const g = skCtx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*2.5);
          g.addColorStop(0,  `rgba(200,220,255,${(a).toFixed(3)})`);
          g.addColorStop(0.4,`rgba(180,210,255,${(a*0.5).toFixed(3)})`);
          g.addColorStop(1,  `rgba(160,200,255,0)`);
          skCtx.fillStyle=g; skCtx.beginPath(); skCtx.arc(s.x,s.y,s.r*2.5,0,Math.PI*2); skCtx.fill();
          skCtx.fillStyle=`rgba(230,240,255,${a})`;
        } else {
          skCtx.fillStyle = `rgba(255,250,238,${a.toFixed(3)})`;
        }
        skCtx.beginPath(); skCtx.arc(s.x, s.y, s.r, 0, Math.PI*2); skCtx.fill();
      }
    } else {
      drawDaySky();
    }

    /* ── DUST MOTES — always visible, day and night ── */
    drawMotes();

    /* ── RAIN LAYER — only when weather is rain ── */
    if (weather === 'rain'){
      while (drops.length < 260) spawnDrop();
      drawRain();
      drawSplats();
      drawRivulets();
    } else {
      /* clear any residual drops when switching to sunny */
      drops.length = 0; splats.length = 0; rivulets.length = 0;
    }

    requestAnimationFrame(loop);
  }
  loop();
})();
