/* InHasnain Studio X — site.js v6
   Day / Night only · Rain always · No scene elements
   Improved HASNAIN kinetic display
*/
(function(){
  /* ========================================================
     PHASE LOGIC  (day 06:00–18:00, night 18:00–06:00)
     ======================================================== */
  const PHASES = ['day','night'];
  function autoPhase(){
    const h = new Date().getHours();
    return (h >= 6 && h < 18)
      ? {key:'day',   greet:'Good day'}
      : {key:'night', greet:'Good evening'};
  }
  /* Ultra-dark default: night unless the user has explicitly set day */
  if (!localStorage.getItem('hsx-theme')) {
    localStorage.setItem('hsx-theme', 'night');
  }
  function greetFor(k){ return ({day:'Good day', night:'Good night'})[k]; }
  function applyPhase(forced){
    const p = forced ? {key:forced, greet:greetFor(forced)} : autoPhase();
    document.body.classList.remove('is-dawn','is-day','is-evening','is-night');
    document.body.classList.add('is-' + p.key);
    window.__phase = p.key;
    return p;
  }

  const ph = applyPhase(localStorage.getItem('hsx-theme'));
  setInterval(() => { if (!localStorage.getItem('hsx-theme')) applyPhase(); }, 60000);

  /* ========================================================
     GREETING BANNER
     ======================================================== */
  const greet = document.createElement('div');
  greet.className = 'greet';
  greet.textContent = `${ph.greet}, welcome to the Hasnain Studio X`;
  document.body.appendChild(greet);
  setTimeout(() => greet.classList.add('show'), 350);
  setTimeout(() => greet.classList.remove('show'), 6500);

  /* ========================================================
     HEADER TOOLS  (only day/night switcher + sound + clock)
     ======================================================== */
  const actions = document.querySelector('.top-bar .actions');
  if (actions){
    actions.innerHTML = '';

    /* Weather toggle: rain ↔ sunny */
    const wxBtn = document.createElement('button');
    wxBtn.className = 'tool-btn wx-btn';
    wxBtn.title = 'Toggle rain / sunny';
    window.__weather = localStorage.getItem('hsx-weather') || 'rain';
    function syncWxClass(){
      document.body.classList.toggle('weather-rain',  window.__weather === 'rain');
      document.body.classList.toggle('weather-sunny', window.__weather === 'sunny');
    }
    function paintWx(){
      wxBtn.innerHTML = window.__weather === 'rain'
        ? `<span class="ico">⛆</span><span class="lbl">RAIN</span>`
        : `<span class="ico">☀</span><span class="lbl">SUNNY</span>`;
      syncWxClass();
    }
    paintWx();
    wxBtn.addEventListener('click', () => {
      window.__weather = window.__weather === 'rain' ? 'sunny' : 'rain';
      localStorage.setItem('hsx-weather', window.__weather);
      paintWx();
    });
    actions.appendChild(wxBtn);

    /* Theme toggle: day ↔ night */
    const themeBtn = document.createElement('button');
    themeBtn.className = 'tool-btn theme-btn';
    themeBtn.title = 'Toggle day / night  ·  double-click for auto';
    function paintTheme(){
      const cur = localStorage.getItem('hsx-theme') || autoPhase().key;
      themeBtn.innerHTML = cur === 'day'
        ? `<span class="ico">○</span><span class="lbl">DAY</span>`
        : `<span class="ico">●</span><span class="lbl">NIGHT</span>`;
    }
    paintTheme();
    themeBtn.addEventListener('click', () => {
      const cur  = localStorage.getItem('hsx-theme') || autoPhase().key;
      const next = cur === 'day' ? 'night' : 'day';
      localStorage.setItem('hsx-theme', next);
      applyPhase(next); paintTheme();
    });
    themeBtn.addEventListener('dblclick', () => {
      localStorage.removeItem('hsx-theme'); applyPhase(); paintTheme();
    });
    actions.appendChild(themeBtn);

    /* Ambient sound */
    const sndBtn = document.createElement('button');
    sndBtn.className = 'tool-btn snd-btn';
    sndBtn.title = 'Ambient sound — reacts to scroll';
    sndBtn.innerHTML = `<span class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lbl">SOUND</span>`;
    /* click handled by ⑬ NATURE SOUNDSCAPE IIFE below */
    actions.appendChild(sndBtn);

    /* Live clock */
    const clock = document.createElement('div');
    clock.className = 'clock';
    clock.innerHTML = `<span class="dot"></span><span class="time">--:--:--</span><span class="meridian">--</span>`;
    actions.appendChild(clock);
    const tEl = clock.querySelector('.time'), mEl = clock.querySelector('.meridian');
    function tick(){
      const d = new Date(); let h = d.getHours();
      const mer = h >= 12 ? 'PM' : 'AM'; h = h % 12; if (!h) h = 12;
      const pad = n => String(n).padStart(2,'0');
      tEl.textContent = `${pad(h)}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      mEl.textContent = mer;
    }
    tick(); setInterval(tick, 1000);
  }

  /* ========================================================
     HASNAIN — clean turbulence displacement (reverted)
     Single text block with animated feTurbulence giving the
     distinctive wavy-edge ink look.
     ======================================================== */
  function injectKineticWord(){
    if (document.querySelector('.kinetic-word')) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const wrap = document.createElement('div');
    wrap.className = 'kinetic-word'; wrap.setAttribute('aria-hidden','true');
    wrap.innerHTML = `
      <svg viewBox="0 0 2200 280" preserveAspectRatio="xMidYMid meet"
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="kw-f" x="-8%" y="-28%" width="116%" height="156%">
            <feTurbulence type="fractalNoise"
              baseFrequency="0.010 0.036" numOctaves="2" seed="4" result="t">
              <animate attributeName="baseFrequency" dur="10s"
                repeatCount="indefinite"
                values="0.010 0.036; 0.020 0.056; 0.010 0.036"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="t"
              scale="16" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
        <text x="50%" y="70%" text-anchor="middle"
              filter="url(#kw-f)">HASNAIN STUDIO X</text>
      </svg>`;
    hero.insertAdjacentElement('afterend', wrap);
  }
  injectKineticWord();

  /* ── LOGO CLICK — clean spring-press, navigate home, no splash ── */
  (function(){
    const brandEl = document.querySelector('.top-bar .brand');
    if(!brandEl) return;
    const logoEl = brandEl.querySelector('.logo');

    const st = document.createElement('style');
    st.textContent = `
      .top-bar .brand{ cursor:pointer; user-select:none; }
      .top-bar .logo{
        transition: transform .35s cubic-bezier(.18,1.4,.3,1),
                    box-shadow .35s ease;
      }
      .top-bar .logo.logo-press{
        transform: scale(.88) rotate(-6deg) !important;
        box-shadow: 0 1px 4px rgba(0,0,0,.18) !important;
      }
    `;
    document.head.appendChild(st);

    brandEl.addEventListener('click', e=>{
      e.preventDefault();
      if(logoEl){
        logoEl.classList.add('logo-press');
        setTimeout(()=>logoEl.classList.remove('logo-press'), 340);
      }
      const already = location.pathname.endsWith('index.html') ||
                      location.pathname === '/' ||
                      location.pathname.endsWith('/');
      if(!already) setTimeout(()=>{ location.href='index.html'; }, 160);
    });
  })();

  /* ── NIGHT SKY — shooting stars, dense and frequent ── */
  (function(){
    function spawnStar(){
      if(!document.body.classList.contains('is-night')) return;
      const star = document.createElement('div');
      star.className = 'shoot-star';
      const sx  = 5  + Math.random()*88;
      const sy  = 1  + Math.random()*55;
      const len = 55 + Math.random()*130;
      const ang = 15 + Math.random()*38;
      const dur = (.38 + Math.random()*.65).toFixed(2);
      const dist= 100 + Math.random()*240;
      const rad = ang * Math.PI/180;
      star.style.cssText = [
        `left:${sx}vw`, `top:${sy}vh`,
        `--len:${len}px`, `--ang:${ang}deg`,
        `--dur:${dur}s`,
        `--tx:${(Math.cos(rad)*dist).toFixed(0)}px`,
        `--ty:${(Math.sin(rad)*dist).toFixed(0)}px`,
      ].join(';');
      document.body.appendChild(star);
      setTimeout(()=>star.remove(), parseFloat(dur)*1000+120);
    }

    /* 4 independent chains fire at staggered intervals — sky always active */
    function chain(baseDelay){
      setTimeout(function tick(){
        spawnStar();
        /* occasionally double-fire for meteor shower bursts */
        if(Math.random() < 0.28) setTimeout(spawnStar, 80 + Math.random()*180);
        setTimeout(tick, 600 + Math.random()*1400);
      }, baseDelay);
    }
    chain(400);
    chain(900);
    chain(1500);
    chain(2200);
  })();


  /* ========================================================
     PROCEDURAL SIGNATURE HANDWRITING ANIMATION
     "HASNAIN" traced live as connected flowing script paths
     on every page load. Crossfades into page content after.
     ======================================================== */
  (function(){
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if (sessionStorage.getItem('hsx-sig-seen')) return; /* once per session */
    sessionStorage.setItem('hsx-sig-seen','1');

    /* Flowing cursive-script paths for H-A-S-N-A-I-N
       ViewBox 0 0 1060 200, baseline y=165, cap y=28 */
    const LETTERS = [
      /* H */
      { d:'M 18,28 C 18,68 17,122 18,165 M 18,97 C 38,86 60,86 82,97 M 82,28 C 82,68 82,122 82,165', delay:0 },
      /* connector H→A */
      { d:'M 82,165 C 96,165 108,158 114,144', delay:260 },
      /* A left+right */
      { d:'M 114,144 C 124,118 132,72 138,28 L 166,144 C 172,158 182,165 196,165', delay:380 },
      /* A crossbar */
      { d:'M 118,112 C 138,106 158,106 164,112', delay:680 },
      /* S */
      { d:'M 268,78 C 268,50 246,36 228,52 C 210,68 222,104 248,118 C 272,130 268,155 250,164 C 232,172 208,164 204,150', delay:900 },
      /* N left stem */
      { d:'M 204,165 L 204,28', delay:1180 },
      /* N diagonal + right */
      { d:'M 204,28 C 212,28 220,46 230,68 L 272,155 C 274,160 276,165 278,165 L 278,28', delay:1320 },
      /* connector N→A */
      { d:'M 278,165 C 292,165 304,158 310,144', delay:1580 },
      /* A2 left+right */
      { d:'M 310,144 C 320,118 330,72 336,28 L 364,144 C 370,158 380,165 394,165', delay:1700 },
      /* A2 crossbar */
      { d:'M 316,112 C 336,106 356,106 362,112', delay:2000 },
      /* I */
      { d:'M 432,28 C 430,70 430,124 432,165', delay:2160 },
      /* N2 left stem */
      { d:'M 470,165 L 470,28', delay:2360 },
      /* N2 diagonal + right */
      { d:'M 470,28 C 478,28 486,46 496,68 L 538,155 C 540,160 542,165 544,165 L 544,28', delay:2500 },
      /* signature underline flourish */
      { d:'M 18,182 C 120,196 300,198 544,186', delay:2780 },
    ];

    const TOTAL_DUR = 3200; /* ms until overlay fades */

    const overlay = document.createElement('div');
    overlay.className = 'sig-overlay signing';

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS,'svg');
    svg.setAttribute('viewBox','0 0 580 210');
    svg.setAttribute('aria-hidden','true');

    const tag = document.createElement('div');
    tag.className = 'sig-tag';
    tag.textContent = 'Hasnain Studio X';

    overlay.appendChild(svg);
    overlay.appendChild(tag);
    document.body.appendChild(overlay);

    /* Build paths, measure, animate */
    LETTERS.forEach(letter => {
      const path = document.createElementNS(NS,'path');
      path.setAttribute('d', letter.d);
      path.className.baseVal = 'sig-path';
      svg.appendChild(path);

      /* Set dasharray to path length, start fully hidden */
      const len = path.getTotalLength() + 2;
      path.style.strokeDasharray  = len;
      path.style.strokeDashoffset = len;

      /* Animate via CSS custom property after delay */
      setTimeout(() => {
        path.style.transition = `stroke-dashoffset ${Math.max(180, len * 1.8)}ms cubic-bezier(.4,0,.2,1)`;
        path.style.strokeDashoffset = '0';
      }, letter.delay);
    });

    /* Fade out overlay after all strokes are drawn */
    setTimeout(() => {
      overlay.classList.add('done');
      setTimeout(() => overlay.remove(), 950);
    }, TOTAL_DUR);
  })();

  /* ── BLACK CURSOR + SNAKE TRAIL ── */
  (function(){
    if(matchMedia('(hover:none),(pointer:coarse)').matches) return; /* touch only */

    /* Inject cursor CSS */
    const st = document.createElement('style');
    st.textContent = `
      *{ cursor:none !important; }
      #hsx-cursor{
        position:fixed;z-index:999999;pointer-events:none;
        width:10px;height:10px;border-radius:50%;
        background:#000;
        transform:translate(-50%,-50%);
        transition:transform .08s ease, width .12s ease, height .12s ease;
        mix-blend-mode:normal;
      }
      body.is-night #hsx-cursor{ background:#fff; }
      #hsx-cursor.clicking{
        width:6px;height:6px;
        transform:translate(-50%,-50%) scale(.7);
      }
      .hsx-snake-dot{
        position:fixed;z-index:999998;pointer-events:none;
        border-radius:50%;
        transform:translate(-50%,-50%);
        background:#000;
        transition:background .3s ease;
      }
      body.is-night .hsx-snake-dot{ background:#fff; }
    `;
    document.head.appendChild(st);

    /* Cursor dot */
    const dot = document.createElement('div');
    dot.id = 'hsx-cursor';
    document.body.appendChild(dot);

    /* Snake trail — 18 segments, each slightly smaller and more faded */
    const SEGMENTS = 18;
    const trail = Array.from({length:SEGMENTS}, (_, i) => {
      const el = document.createElement('div');
      el.className = 'hsx-snake-dot';
      const ratio = 1 - i/SEGMENTS;        /* 1 → 0 */
      const size  = Math.max(1.5, 8 * ratio * ratio); /* px */
      el.style.cssText = `width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;opacity:${(ratio*.55).toFixed(2)};`;
      document.body.appendChild(el);
      return { el, x: -999, y: -999 };
    });

    let mx = -999, my = -999;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, {passive:true});

    document.addEventListener('mousedown', () => dot.classList.add('clicking'));
    document.addEventListener('mouseup',   () => dot.classList.remove('clicking'));

    /* Smooth lerp — each segment chases the one ahead */
    const LERP = 0.28; /* how tightly each segment follows — lower = longer snake */
    function animate(){
      /* segment 0 chases the real cursor */
      trail[0].x += (mx - trail[0].x) * LERP;
      trail[0].y += (my - trail[0].y) * LERP;
      trail[0].el.style.left = trail[0].x + 'px';
      trail[0].el.style.top  = trail[0].y + 'px';

      /* each subsequent segment chases the one before */
      for(let i=1; i<SEGMENTS; i++){
        trail[i].x += (trail[i-1].x - trail[i].x) * LERP;
        trail[i].y += (trail[i-1].y - trail[i].y) * LERP;
        trail[i].el.style.left = trail[i].x + 'px';
        trail[i].el.style.top  = trail[i].y + 'px';
      }
      requestAnimationFrame(animate);
    }
    animate();
  })();
  /* voice mood detection removed */

  /* ════════════════════════════════════════════════════════════
     ULTRA ASMR SOUNDSCAPE
     ─ Rain layer  : shaped pink-noise with glass-tap transients
     ─ Drone layer : pentatonic crystal bowls (detuned, warm)
     ─ Reverb      : convolver-style allpass cascade (hall feel)
     ─ Night mode  : deeper bass breath + rarer crystal pings
     ─ Scroll      : opens filter, rain density modulates pitch
     ════════════════════════════════════════════════════════════ */
  let audio = null;
  function buildAudio(){
    if(audio) return audio;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return null;
    const ac = new Ctx();
    const SR = ac.sampleRate;

    /* ── master bus ── */
    const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);

    /* ── high-quality "room" reverb: 4-stage allpass cascade ── */
    const ROOM = [0.0297, 0.0371, 0.0411, 0.0437];
    let revNode = master;
    ROOM.forEach(t => {
      const ap = ac.createBiquadFilter();
      ap.type = 'allpass'; ap.frequency.value = 1/(t*2); ap.Q.value = 0.18;
      /* chain: prev → ap, but also keep dry path */
      const ap2 = ac.createBiquadFilter();
      ap2.type = 'allpass'; ap2.frequency.value = 1/(t*1.7); ap2.Q.value = 0.12;
      revNode.connect(ap); ap.connect(ap2);
      revNode = ap2;
    });
    revNode.connect(ac.destination); /* wet */

    /* ── warmth eq: gentle high-shelf roll-off ── */
    const shelf = ac.createBiquadFilter();
    shelf.type = 'highshelf'; shelf.frequency.value = 4800; shelf.gain.value = -11;
    shelf.connect(master);

    /* ── long reverb tail: single feedback delay loop ── */
    const dly = ac.createDelay(1.5); dly.delayTime.value = 0.38;
    const fb  = ac.createGain(); fb.gain.value = 0.22;
    const wet = ac.createGain(); wet.gain.value = 0.30;
    const dry = ac.createGain(); dry.gain.value = 0.70;
    dly.connect(fb); fb.connect(dly); dly.connect(wet); wet.connect(shelf);
    dry.connect(shelf);

    /* ── RAIN LAYER — pink noise through bandpass ── */
    /* Pink noise: generated buffer, loop forever */
    const RAIN_BUF_SEC = 4;
    const rainBuf = ac.createBuffer(2, SR * RAIN_BUF_SEC, SR);
    for(let ch=0; ch<2; ch++){
      const data = rainBuf.getChannelData(ch);
      /* Pink noise via Paul Kellett's method */
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for(let i=0; i<data.length; i++){
        const w = Math.random()*2-1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
        b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
        data[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.115;
        b6 = w * 0.115926;
      }
    }
    const rainSrc = ac.createBufferSource();
    rainSrc.buffer = rainBuf; rainSrc.loop = true; rainSrc.loopEnd = RAIN_BUF_SEC;

    /* Glass-surface character: multi-band shape */
    const rainHP = ac.createBiquadFilter(); rainHP.type='highpass'; rainHP.frequency.value=320;
    const rainBP = ac.createBiquadFilter(); rainBP.type='bandpass'; rainBP.frequency.value=2200; rainBP.Q.value=0.55;
    const rainLP = ac.createBiquadFilter(); rainLP.type='lowpass';  rainLP.frequency.value=7500;
    const rainG  = ac.createGain(); rainG.gain.value = 0.52;

    rainSrc.connect(rainHP); rainHP.connect(rainBP); rainBP.connect(rainLP);
    rainLP.connect(rainG);
    rainG.connect(dry); rainG.connect(dly);
    rainSrc.start();

    /* ── GLASS TAP transients — random "tick" on the pane ── */
    function scheduleGlassTap(){
      if(!audio || audio.target <= 0){ setTimeout(scheduleGlassTap, 800); return; }
      const t   = ac.currentTime + 0.02;
      /* Very short white-noise burst = raindrop hitting glass */
      const tapBuf = ac.createBuffer(1, Math.floor(SR*0.018), SR);
      const td = tapBuf.getChannelData(0);
      for(let i=0;i<td.length;i++) td[i]=(Math.random()*2-1)*Math.exp(-i/(SR*0.003));
      const tap  = ac.createBufferSource(); tap.buffer = tapBuf;
      const tapHP= ac.createBiquadFilter(); tapHP.type='highpass'; tapHP.frequency.value=4000;
      const tapG = ac.createGain();
      tapG.gain.setValueAtTime(0.028+Math.random()*0.022, t);
      tapG.gain.exponentialRampToValueAtTime(0.0001, t+0.018);
      tap.connect(tapHP); tapHP.connect(tapG); tapG.connect(dry); tapG.connect(dly);
      tap.start(t); tap.stop(t+0.025);
      /* vary interval: 80–550 ms */
      setTimeout(scheduleGlassTap, 80 + Math.random()*470);
    }
    scheduleGlassTap();

    /* ── CRYSTAL BOWL DRONES — pentatonic A minor ── */
    const mainFilt = ac.createBiquadFilter();
    mainFilt.type='lowpass'; mainFilt.frequency.value=1100; mainFilt.Q.value=0.4;
    mainFilt.connect(dry); mainFilt.connect(dly);

    const NOTES = [110, 164.81, 220, 261.63, 329.63, 440];
    NOTES.forEach((f, i) => {
      /* Each bowl has 2 slightly detuned sines — beat frequency gives that metallic warmth */
      [0, +0.18].forEach(detune => {
        const osc = ac.createOscillator(); osc.type='sine';
        osc.frequency.value = f;
        osc.detune.value    = detune * 100;
        /* slow tremolo LFO */
        const lfo  = ac.createOscillator(); lfo.frequency.value = 0.016 + i*0.005;
        const lfog = ac.createGain(); lfog.gain.value = 0.08;
        lfo.connect(lfog); lfog.connect(osc.detune); lfo.start();
        const g = ac.createGain(); g.gain.value = (0.072 - i*0.007) * 0.5;
        osc.connect(g); g.connect(mainFilt); osc.start();
      });
    });

    /* ── SUB BREATH — very low sine, adds body/chest feel ── */
    const sub = ac.createOscillator(); sub.type='sine'; sub.frequency.value=52;
    /* slow swell LFO on sub */
    const subLFO = ac.createOscillator(); subLFO.frequency.value=0.042;
    const subLG  = ac.createGain(); subLG.gain.value=0.03;
    subLFO.connect(subLG); subLG.connect(sub.detune); subLFO.start();
    const subG2 = ac.createGain(); subG2.gain.value=0.048;
    sub.connect(subG2); subG2.connect(shelf); sub.start();

    /* ── CRYSTAL PING — soft high harmonic chime ── */
    function schedulePing(){
      if(!audio) return;
      const t    = ac.currentTime + 0.05;
      const freq = [880, 1108.73, 1318.51, 1568, 1760, 2093.00][Math.floor(Math.random()*6)];
      const ping = ac.createOscillator(); ping.type='sine'; ping.frequency.value=freq;
      /* Add 2nd harmonic for bell quality */
      const ping2 = ac.createOscillator(); ping2.type='sine'; ping2.frequency.value=freq*2.756;
      const env  = ac.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.048, t+0.008);
      env.gain.setTargetAtTime(0.0001, t+0.05, 0.65);
      const env2 = ac.createGain();
      env2.gain.setValueAtTime(0, t);
      env2.gain.linearRampToValueAtTime(0.016, t+0.006);
      env2.gain.setTargetAtTime(0.0001, t+0.04, 0.40);
      ping.connect(env); env.connect(dly); env.connect(dry);
      ping2.connect(env2); env2.connect(dly);
      ping.start(t); ping.stop(t+3.5);
      ping2.start(t); ping2.stop(t+2.5);
      setTimeout(schedulePing, 5000 + Math.random()*9000);
    }
    setTimeout(schedulePing, 2500);

    audio = { ac, master, mainFilt, rainG, target:0 };
    /* Smooth master gain fade */
    (function fadeTick(){
      audio.master.gain.value += (audio.target - audio.master.gain.value) * 0.025;
      requestAnimationFrame(fadeTick);
    })();
    return audio;
  }

  /* Scroll opens rain filter slightly — immersive depth effect */
  let lastSY = scrollY, scrollVel = 0;
  addEventListener('scroll', () => {
    scrollVel = Math.min(80, Math.abs(scrollY - lastSY)); lastSY = scrollY;
    if(audio && audio.mainFilt)
      audio.mainFilt.frequency.setTargetAtTime(1100 + scrollVel * 14, audio.ac.currentTime, 0.5);
  }, {passive:true});
  setInterval(()=>{ scrollVel *= 0.85; }, 100);

  function toggleAmbient(btn){
    const a = buildAudio(); if(!a) return;
    if(a.ac.state === 'suspended') a.ac.resume();
    if(a.target > 0){ a.target = 0; btn.classList.remove('on'); }
    else             { a.target = 0.24; btn.classList.add('on'); }
  }

  /* ========================================================
     REVEAL ON SCROLL
     ======================================================== */
  const targets = document.querySelectorAll(
    '.section, .hero-card, .auth-container, .card, .footer-grid > div, .kinetic-word'
  );
  targets.forEach(t => t.classList.add('reveal'));
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{threshold:.10});
    targets.forEach(t=>io.observe(t));
  } else { targets.forEach(t=>t.classList.add('in')); }

  /* Auth tabs */
  document.querySelectorAll('.auth-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      const id=tab.dataset.tab;
      document.querySelectorAll('.auth-tab').forEach(t=>{ const on=t===tab; t.classList.toggle('active',on); t.setAttribute('aria-selected',on); });
      document.querySelectorAll('.auth-panel').forEach(p=>{ const on=p.id===id; p.classList.toggle('hidden',!on); p.setAttribute('aria-hidden',!on); });
    });
  });
  document.querySelectorAll('.auth-form').forEach(f=>{
    f.addEventListener('submit',e=>{
      e.preventDefault();
      const s=f.querySelector('.form-status'); if(s) s.textContent='Thanks! We\u2019ll be in touch.';
      f.reset();
    });
  });

  /* ========================================================
     SMOOTH GLASS RIPPLE PAGE TRANSITIONS
     Click any internal link → a frosted-glass ripple expands
     from the exact click point, blurs the whole page out,
     then navigates. On load the page iris-wipes back in.
     Total exit: ~420ms. Silky cubic-bezier easing.
     ======================================================== */
  (function(){
    /* ══════════════════════════════════════════════════════════
       LUXURY PAGE TRANSITION — veil dissolve, no canvas, no hang
       ─ Exit : content lifts + fades, veil sweeps in  (320ms)
       ─ Enter: veil dissolves away with a soft lift-in  (520ms)
       Uses #pg-transition div already present in every HTML page.
       ══════════════════════════════════════════════════════════ */

    /* Grab or create the veil overlay */
    const veil = document.getElementById('pg-transition') || (function(){
      const el = document.createElement('div');
      el.id = 'pg-transition';
      el.className = 'page-transition';
      document.body.prepend(el);
      return el;
    })();

    /* Inject transition styles once */
    const txStyle = document.createElement('style');
    txStyle.textContent = `
      /* Veil overlay */
      .page-transition{
        position:fixed;inset:0;z-index:9998;pointer-events:none;
        opacity:1;
        clip-path:none !important;
        /* background set per-theme in CSS */
        transition:opacity .52s cubic-bezier(.22,1,.36,1);
      }
      .page-transition.tx-hidden{ opacity:0; }

      /* Content wrapper — only <main> lifts so fixed layers stay put */
      .tx-main-wrap{
        transition:
          opacity   .32s cubic-bezier(.4,0,1,1),
          transform .32s cubic-bezier(.4,0,1,1);
        will-change:opacity,transform;
      }
      body.tx-exiting .tx-main-wrap{
        opacity:0;
        transform:scale(1.018) translateY(-6px);
        pointer-events:none;
      }
      /* Enter: content lifts up from slightly below */
      @keyframes txMainIn{
        from{ opacity:0; transform:translateY(10px); }
        to  { opacity:1; transform:translateY(0);    }
      }
      .tx-main-wrap.tx-entering{
        animation: txMainIn .48s cubic-bezier(.22,1,.36,1) both;
      }
    `;
    document.head.appendChild(txStyle);

    /* Wrap <main> once */
    const mainEl = document.querySelector('main');
    if(mainEl && !mainEl.parentElement.classList.contains('tx-main-wrap')){
      const wrap = document.createElement('div');
      wrap.className = 'tx-main-wrap';
      mainEl.parentElement.insertBefore(wrap, mainEl);
      wrap.appendChild(mainEl);
    }
    const mainWrap = document.querySelector('.tx-main-wrap');

    /* ── ENTER: veil dissolves away, content lifts in ── */
    if(mainWrap) mainWrap.classList.add('tx-entering');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      veil.classList.add('tx-hidden');
      if(mainWrap){
        mainWrap.addEventListener('animationend', () =>
          mainWrap.classList.remove('tx-entering'), {once:true});
      }
    }));

    /* Guard against double-clicks / re-entrancy */
    let navigating = false;

    /* ── EXIT: content fades, veil sweeps in, then navigate ── */
    function navigateTo(href){
      if(navigating) return;
      navigating = true;

      /* 1. Content lifts out */
      if(mainWrap) document.body.classList.add('tx-exiting');

      /* 2. Veil snaps in quickly */
      veil.style.transition = 'opacity .28s cubic-bezier(.4,0,1,1)';
      veil.classList.remove('tx-hidden');

      /* 3. Navigate after veil is fully opaque */
      setTimeout(() => { location.href = href; }, 300);
    }

    /* ── Event delegation — catches dynamic links too ── */
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if(!a) return;
      const href = a.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('mailto:') ||
          a.target === '_blank' || /^https?:/.test(href)) return;
      e.preventDefault();
      navigateTo(href);
    }, true);
  })();

  /* ========================================================
     4D EFFECTS ENGINE
     ======================================================== */

  /* ── SPECULAR LIGHT SPOT on .card — cursor-tracked glass highlight ── */
  (function(){
    function initSpecular(card){
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--hx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
        card.style.setProperty('--hy', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--hx','50%');
        card.style.setProperty('--hy','-20%');
      });
    }
    document.querySelectorAll('.card,.contact-info-card').forEach(initSpecular);
  })();

  /* button ripple removed */

  /* ── MAGNETIC LETTER REPULSION on hero h1 ── */
  (function(){
    const h1 = document.querySelector('.hero-card h1');
    if (!h1 || matchMedia('(hover:none)').matches) return;
    /* wrap each character */
    const text = h1.innerHTML;
    // Only split plain text nodes, not HTML
    h1.innerHTML = h1.textContent.split('').map((c,i) =>
      c === ' ' ? ' ' : `<span class="mag-char" style="transition-delay:${i*8}ms">${c}</span>`
    ).join('');

    document.addEventListener('mousemove', e => {
      h1.querySelectorAll('.mag-char').forEach(ch => {
        const r    = ch.getBoundingClientRect();
        const cx   = r.left + r.width  / 2;
        const cy   = r.top  + r.height / 2;
        const dx   = e.clientX - cx;
        const dy   = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const RANGE = 110;
        if (dist < RANGE){
          const force = (1 - dist / RANGE);
          const angle = Math.atan2(dy, dx);
          const push  = force * force * 22;
          ch.style.transform = `translate(${(-Math.cos(angle)*push).toFixed(2)}px,${(-Math.sin(angle)*push).toFixed(2)}px) scale(${(1+force*.12).toFixed(3)})`;
          ch.style.transitionDuration = '60ms';
        } else {
          ch.style.transform = '';
          ch.style.transitionDuration = '550ms';
        }
      });
    });
  })();

  /* cursor time-echoes removed */

  /* depth-of-field removed — clean glass cards need no blur */

  /* ========================================================
     3D MOUSE-TILT ENGINE
     Cards, hero-card, contact-info-card all tilt toward cursor.
     Smooth lerp interpolation, resets on leave.
     ======================================================== */
  (function(){
    if (matchMedia('(hover:none),(pointer:coarse)').matches) return;

    function setup3DTilt(selector, opts){
      const defaults = {maxTilt:10, scale:1.02, perspective:900, speed:120};
      const cfg = Object.assign({}, defaults, opts);
      document.querySelectorAll(selector).forEach(el => {
        let tx = 0, ty = 0, rAF = null;
        function lerp(a, b, t){ return a + (b - a) * t; }
        let curX = 0, curY = 0, targetX = 0, targetY = 0;

        function animate(){
          curX = lerp(curX, targetX, 0.14);
          curY = lerp(curY, targetY, 0.14);
          el.style.transform =
            `perspective(${cfg.perspective}px) rotateY(${curX}deg) rotateX(${-curY}deg) translateZ(${cfg.scale > 1 ? 14 : 8}px) scale(${cfg.scale})`;
          if (Math.abs(curX - targetX) > 0.02 || Math.abs(curY - targetY) > 0.02)
            rAF = requestAnimationFrame(animate);
          else rAF = null;
        }

        el.addEventListener('mousemove', e => {
          const r  = el.getBoundingClientRect();
          const x  = (e.clientX - r.left) / r.width  - 0.5;
          const y  = (e.clientY - r.top)  / r.height - 0.5;
          targetX  =  x * cfg.maxTilt * 2;
          targetY  =  y * cfg.maxTilt * 2;
          if (!rAF) rAF = requestAnimationFrame(animate);
        });

        el.addEventListener('mouseleave', () => {
          targetX = 0; targetY = 0;
          if (!rAF) rAF = requestAnimationFrame(animate);
        });
      });
    }

    setup3DTilt('.card',                {maxTilt:9,  scale:1.025, perspective:900});
    setup3DTilt('.hero-card',           {maxTilt:4,  scale:1.008, perspective:1100});
    setup3DTilt('.contact-info-card',   {maxTilt:8,  scale:1.02,  perspective:900});
    setup3DTilt('.gallery-item',        {maxTilt:7,  scale:1.018, perspective:850});
    setup3DTilt('.section',             {maxTilt:2,  scale:1.002, perspective:1400});
  })();

  /* ========================================================
     GLASS CONDENSATION — injects droplet overlay into panels.
     Becomes visible only when body.weather-rain (CSS-driven).
     Each panel gets a unique randomized droplet pattern.
     ======================================================== */
  (function(){
    const panels = document.querySelectorAll('.hero-card, .section, .card, .contact-info-card');
    panels.forEach(panel => {
      if (panel.querySelector(':scope > .glass-condensation')) return;
      const cond = document.createElement('div');
      cond.className = 'glass-condensation';
      /* randomize droplet positions per panel */
      const drops = [];
      const N = 9 + Math.floor(Math.random() * 5);
      for (let i = 0; i < N; i++){
        const x = (Math.random() * 92 + 4).toFixed(1);
        const y = (Math.random() * 92 + 4).toFixed(1);
        const r = (1 + Math.random() * 2.2).toFixed(1);
        const a = (0.35 + Math.random() * 0.3).toFixed(2);
        drops.push(`radial-gradient(circle ${r}px at ${x}% ${y}%, rgba(255,255,255,${a}) 0%, rgba(255,255,255,${a*0.4}) 60%, transparent 100%)`);
      }
      cond.style.backgroundImage = drops.join(',');
      /* ensure panel is positioned */
      if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
      panel.insertBefore(cond, panel.firstChild);
    });
  })();

  /* ========================================================
     ANIMATED WAVEFORM DIVIDER
     Injects a sinusoidal SVG wave between the hero and the
     first .section. Draws two offset waves for depth.
     SpatiaX Pro brand identity — spatial audio waveform.
     ======================================================== */
  (function(){
    const hero = document.querySelector('.hero');
    const firstSection = document.querySelector('.section');
    if (!hero || !firstSection) return;

    const wrap = document.createElement('div');
    wrap.className = 'waveform-divider';
    wrap.setAttribute('aria-hidden','true');
    wrap.innerHTML = `<svg viewBox="0 0 1080 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wf-back" d="M0 28 C90 8 180 48 270 28 S450 8 540 28 S720 48 810 28 S990 8 1080 28 V56 H0 Z"/>
      <path class="wf-front" d="M0 32 C90 52 180 12 270 32 S450 52 540 32 S720 12 810 32 S990 52 1080 32 V56 H0 Z"/>
    </svg>`;
    firstSection.parentNode.insertBefore(wrap, firstSection);
  })();

  /* ========================================================
     TIME-OF-DAY DIRECTIONAL LIGHT
     Calculates sun angle from current hour (6am = east/left,
     noon = overhead, 6pm = west/right) and sets CSS variables
     --light-x --light-y --shadow-blur on the hero card.
     Creates a physically real lighting feel.
     ======================================================== */
  (function(){
    function applyLight(){
      const h = new Date().getHours() + new Date().getMinutes() / 60;
      /* 6 = sunrise, 12 = noon, 18 = sunset */
      const norm = Math.max(0, Math.min(1, (h - 6) / 12));
      /* angle: 0° = left, 90° = top, 180° = right */
      const angle = norm * Math.PI;              /* 0 → π */
      const lx = -(Math.cos(angle) * 40).toFixed(1);  /* px left/right */
      const ly = -(Math.abs(Math.sin(angle)) * 36 + 4).toFixed(1); /* px up */
      const blur = (24 + Math.abs(Math.cos(angle)) * 20).toFixed(0);
      const root = document.documentElement;
      root.style.setProperty('--light-x', lx + 'px');
      root.style.setProperty('--light-y', ly + 'px');
      root.style.setProperty('--light-blur', blur + 'px');
    }
    applyLight();
    /* update every 5 minutes */
    setInterval(applyLight, 5 * 60 * 1000);
  })();

  /* ========================================================
     3D SCROLL PARALLAX  — layers drift at different speeds
     ======================================================== */
  (function(){
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        const kw = document.querySelector('.kinetic-word');
        if (kw) kw.style.transform = `translateY(${sy * 0.08}px) translateZ(-10px)`;
        ticking = false;
      });
    }, {passive:true});
  })();

  /* ============================================================
     ① CINEMATIC PC TUNEХ BEFORE/AFTER DEMO
     Only on pctunex.html — injected into the PC TuneX card.
     ============================================================ */
  (function(){
    /* Only show on the Apps catalog page */
    if(location.pathname.split('/').pop() !== 'pctunex.html') return;

    const METRICS = [
      { label:'Frames Per Second', before:45,  after:122, unit:'fps', beforeBar:37, afterBar:100 },
      { label:'RAM Usage',         before:4.2, after:1.1, unit:'GB',  beforeBar:78, afterBar:20  },
      { label:'Disk Usage',        before:92,  after:34,  unit:'%',   beforeBar:92, afterBar:34  },
      { label:'Boot Time',         before:47,  after:11,  unit:'s',   beforeBar:88, afterBar:21  },
    ];

    /* inject "Watch Demo" button inside the PC TuneX card only */
    const cards = document.querySelectorAll('.section .grid .card');
    let pcCard = null;
    cards.forEach(c => { if(c.querySelector('h3') && c.querySelector('h3').textContent.includes('PC TuneX')) pcCard = c; });
    if(pcCard){
      const btn = document.createElement('button');
      btn.className = 'demo-trigger-btn';
      btn.innerHTML = '▶ Watch PC TuneX Demo';
      btn.style.cssText = 'margin-top:.8rem;';
      const actions = pcCard.querySelector('.hero-actions');
      if(actions) actions.after(btn); else pcCard.appendChild(btn);
      btn.addEventListener('click', openDemo);
    }

    /* build modal */
    const overlay = document.createElement('div');
    overlay.className = 'demo-overlay';
    overlay.innerHTML = `
      <div class="demo-panel">
        <div class="demo-header">
          <h2>PC TuneX — Real Results</h2>
          <button class="demo-close" aria-label="Close">✕</button>
        </div>
        <div class="demo-split">
          <div class="demo-col before">
            <div class="demo-col-label">⚠ Before PC TuneX</div>
            ${METRICS.map(m=>`
              <div class="metric">
                <div class="metric-label">${m.label}</div>
                <div class="metric-val" data-before="${m.before}" data-unit="${m.unit}">—</div>
                <div class="metric-bar"><div class="metric-bar-fill" style="width:0" data-target="${m.beforeBar}"></div></div>
              </div>`).join('')}
          </div>
          <div class="demo-col after">
            <div class="demo-col-label">✓ After PC TuneX</div>
            ${METRICS.map(m=>`
              <div class="metric">
                <div class="metric-label">${m.label}</div>
                <div class="metric-val" data-after="${m.after}" data-unit="${m.unit}">—</div>
                <div class="metric-bar"><div class="metric-bar-fill" style="width:0" data-target="${m.afterBar}"></div></div>
              </div>`).join('')}
          </div>
        </div>
        <div class="demo-cta">
          <a href="pctunex.html" class="btn btn--primary" style="display:inline-flex">Download PC TuneX →</a>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.demo-close').addEventListener('click', closeDemo);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeDemo(); });

    function openDemo(){
      overlay.classList.add('open');
      /* animate numbers */
      setTimeout(() => {
        overlay.querySelectorAll('[data-before]').forEach(el => countTo(el, 0, +el.dataset.before, el.dataset.unit));
        overlay.querySelectorAll('[data-after]').forEach(el  => countTo(el, 0, +el.dataset.after,  el.dataset.unit));
        overlay.querySelectorAll('.metric-bar-fill').forEach(bar => {
          setTimeout(() => bar.style.width = bar.dataset.target + '%', 80);
        });
      }, 120);
    }
    function closeDemo(){
      overlay.classList.remove('open');
      /* reset */
      overlay.querySelectorAll('.metric-val').forEach(el => el.textContent = '—');
      overlay.querySelectorAll('.metric-bar-fill').forEach(bar => bar.style.width = '0');
    }
    function countTo(el, from, to, unit){
      const dur = 1200, start = performance.now();
      const isFloat = (to % 1 !== 0);
      (function tick(now){
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = from + (to - from) * ease;
        el.innerHTML = `${isFloat ? val.toFixed(1) : Math.round(val)}<span>${unit}</span>`;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    }
  })();

  /* ============================================================
     ② AI STUDIO BOOKING WIZARD
     Multi-step glass modal. Triggered by "Book AI Studio" button
     injected on pricing.html. Works on any page.
     ============================================================ */
  (function(){
    const PACKAGES = [
      { name:'Starter', price:'£49', desc:'5 AI images, 2 styles, 3-day delivery' },
      { name:'Creative', price:'£129', desc:'20 images, 5 styles, 5-day delivery' },
      { name:'Studio',  price:'£299', desc:'50 images, unlimited styles, priority' },
    ];
    const STYLES = ['Surreal','Portrait','Landscape','Abstract','Cyberpunk','Architectural','Editorial','Fantasy'];
    const STEPS = ['Package','Style','Brief','Timeline'];

    let currentStep = 0, selectedPkg = null, selectedStyles = [];

    const overlay = document.createElement('div');
    overlay.className = 'wizard-overlay';
    overlay.innerHTML = `
      <div class="wizard-panel">
        <button class="wizard-close" aria-label="Close">✕</button>
        <div style="font-family:'Orbitron';font-size:11px;letter-spacing:.22em;opacity:.5;text-transform:uppercase;color:var(--ink);margin-bottom:4px">AI Studio</div>
        <h2 id="wiz-title" style="font-family:'Orbitron';font-size:18px;margin:0 0 20px;color:var(--ink)"></h2>
        <div class="wiz-prog">${STEPS.map(()=>'<div class="wiz-prog-dot"></div>').join('')}</div>

        <div class="wiz-step active" id="wiz-s0">
          <p>Choose the package that fits your project.</p>
          <div class="pkg-grid">
            ${PACKAGES.map((p,i)=>`
              <div class="pkg-card" data-pkg="${i}">
                <div class="pkg-name">${p.name}</div>
                <div class="pkg-price">${p.price}</div>
                <div class="pkg-desc">${p.desc}</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="wiz-step" id="wiz-s1">
          <p>Pick the visual styles for your project (select all that apply).</p>
          <div class="style-tags">
            ${STYLES.map(s=>`<button class="style-tag" data-style="${s}">${s}</button>`).join('')}
          </div>
        </div>

        <div class="wiz-step" id="wiz-s2">
          <p>Describe your project. The more detail, the better the results.</p>
          <input class="wiz-input" id="wiz-name" placeholder="Your name" type="text"/>
          <textarea class="wiz-textarea" id="wiz-brief" rows="4" placeholder="Describe your creative vision, references, mood, colours…"></textarea>
        </div>

        <div class="wiz-step" id="wiz-s3">
          <p>Here's your project timeline. We'll confirm by email.</p>
          <div class="wiz-timeline">
            <div class="wiz-timeline-row"><div class="wiz-dot"></div><div class="wiz-tl-label">Brief review &amp; confirmation</div><div class="wiz-tl-day">Day 1</div></div>
            <div class="wiz-timeline-row"><div class="wiz-dot"></div><div class="wiz-tl-label">Style exploration &amp; concepts</div><div class="wiz-tl-day">Day 2–3</div></div>
            <div class="wiz-timeline-row"><div class="wiz-dot"></div><div class="wiz-tl-label">Full generation &amp; curation</div><div class="wiz-tl-day">Day 4–5</div></div>
            <div class="wiz-timeline-row"><div class="wiz-dot"></div><div class="wiz-tl-label">Final delivery &amp; revisions</div><div class="wiz-tl-day">Day 6–7</div></div>
          </div>
          <input class="wiz-input" id="wiz-email" placeholder="Email for delivery" type="email"/>
        </div>

        <div class="wiz-nav">
          <button class="wiz-btn" id="wiz-back" disabled>← Back</button>
          <button class="wiz-btn primary" id="wiz-next">Next →</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const prog = overlay.querySelectorAll('.wiz-prog-dot');
    const steps = overlay.querySelectorAll('.wiz-step');
    const title = overlay.querySelector('#wiz-title');
    const btnBack = overlay.querySelector('#wiz-back');
    const btnNext = overlay.querySelector('#wiz-next');
    const TITLES = ['Choose Package','Pick Your Style','Describe Your Vision','Review & Submit'];

    overlay.querySelector('.wizard-close').addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

    overlay.querySelectorAll('.pkg-card').forEach(card => {
      card.addEventListener('click', () => {
        overlay.querySelectorAll('.pkg-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedPkg = +card.dataset.pkg;
      });
    });
    overlay.querySelectorAll('.style-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        tag.classList.toggle('on');
        const s = tag.dataset.style;
        selectedStyles = selectedStyles.includes(s) ? selectedStyles.filter(x=>x!==s) : [...selectedStyles, s];
      });
    });

    function goTo(n){
      steps[currentStep].classList.remove('active');
      currentStep = n;
      steps[currentStep].classList.add('active');
      prog.forEach((d,i) => d.classList.toggle('done', i <= currentStep));
      title.textContent = TITLES[currentStep];
      btnBack.disabled = currentStep === 0;
      btnNext.textContent = currentStep === STEPS.length - 1 ? 'Submit Enquiry ✓' : 'Next →';
    }
    goTo(0);

    btnNext.addEventListener('click', () => {
      if (currentStep < STEPS.length - 1){ goTo(currentStep + 1); }
      else {
        /* submit */
        const name  = overlay.querySelector('#wiz-name').value;
        const email = overlay.querySelector('#wiz-email').value;
        const brief = overlay.querySelector('#wiz-brief').value;
        const pkg   = PACKAGES[selectedPkg] || PACKAGES[0];
        const subj  = encodeURIComponent(`AI Studio Enquiry — ${pkg.name}`);
        const body  = encodeURIComponent(`Name: ${name}\nPackage: ${pkg.name} ${pkg.price}\nStyles: ${selectedStyles.join(', ')}\nBrief: ${brief}`);
        window.open(`mailto:Hasnain@outlook.at?subject=${subj}&body=${body}`);
        overlay.classList.remove('open');
      }
    });
    btnBack.addEventListener('click', () => { if (currentStep > 0) goTo(currentStep - 1); });

    /* inject trigger buttons */
    document.querySelectorAll('a[href*="pricing"],a[href*="AI Studio"]').forEach(a => {
      if (a.classList.contains('wiz-hooked')) return;
      a.classList.add('wiz-hooked');
    });
    /* "Book AI Studio" btn on pricing page */
    if (/pricing/.test(location.pathname)){
      const bookBtn = document.createElement('button');
      bookBtn.className = 'btn btn--primary';
      bookBtn.style.cssText = 'margin:20px auto;display:block;';
      bookBtn.textContent = 'Start Your AI Project →';
      bookBtn.addEventListener('click', () => { overlay.classList.add('open'); goTo(0); });
      const firstSection = document.querySelector('.section');
      if (firstSection) firstSection.appendChild(bookBtn);
    }
    /* also expose globally */
    window.openBookingWizard = () => { overlay.classList.add('open'); goTo(0); };
  })();

  /* ============================================================
     ③ PER-PAGE AMBIENT SOUNDSCAPES
     Each page has a distinct audio character layered on top
     of the existing crystal bowl engine.
     ============================================================ */
  (function(){
    const page = location.pathname.split('/').pop().replace('.html','') || 'index';
    /* patch buildAudio to add page-specific texture after activation */
    const origToggle = window.toggleAmbient || null;
    const sndBtn = document.querySelector('.snd-btn');
    if (sndBtn){
      sndBtn.addEventListener('click', () => {
        const a = window.__audioCtx = window.__audioCtx || null;
        /* add page overlay sounds once audio is running */
        setTimeout(() => addPageLayer(page), 800);
      }, { once: true });
    }
    function addPageLayer(pg){
      if (!audio || !audio.ac) return;
      const ac = audio.ac;
      if (ac.state === 'suspended') return;

      if (pg === 'pctunex'){
        /* mechanical precision: crisp filtered noise bursts */
        function clickTick(){
          const t = ac.currentTime;
          const buf = ac.createBuffer(1, ac.sampleRate * 0.02, ac.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/800);
          const src = ac.createBufferSource(); src.buffer = buf;
          const hpf = ac.createBiquadFilter(); hpf.type='highpass'; hpf.frequency.value=3200;
          const g = ac.createGain(); g.gain.value = 0.04;
          src.connect(hpf); hpf.connect(g); g.connect(ac.destination);
          src.start(t); src.stop(t + 0.02);
          setTimeout(clickTick, 280 + Math.random()*180);
        }
        setTimeout(clickTick, 400);

      } else if (pg === 'AIStudioX' || pg === 'pricing'){
        /* neural hum: detuned sawtooth overtones */
        [220, 330, 440, 660].forEach((f, i) => {
          const osc = ac.createOscillator(); osc.type = 'sawtooth';
          osc.frequency.value = f + i * 0.4;
          const flt = ac.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=420;
          const g = ac.createGain(); g.gain.value = 0.008;
          osc.connect(flt); flt.connect(g); g.connect(ac.destination);
          osc.start(); /* fade in */
          g.gain.setValueAtTime(0, ac.currentTime);
          g.gain.linearRampToValueAtTime(0.008, ac.currentTime + 2.5);
        });

      } else if (pg === 'contact'){
        /* warm pad: slow sine chords */
        [261.63, 329.63, 392.0].forEach(f => {
          const osc = ac.createOscillator(); osc.type='sine'; osc.frequency.value=f;
          const g = ac.createGain(); g.gain.value=0;
          osc.connect(g); g.connect(ac.destination); osc.start();
          g.gain.linearRampToValueAtTime(0.012, ac.currentTime + 3);
        });
      }
    }
  })();

  /* ============================================================
     ④ ROTATING GLASS TESTIMONIAL CAROUSEL
     Auto-advances every 5s. Manual dot navigation.
     Injected after the first .section on index/home page.
     ============================================================ */
  (function(){
    const isHome = !location.pathname.split('/').pop() || /index|^$/.test(location.pathname.split('/').pop().replace('.html',''));
    if (!isHome) return;

    const TESTIMONIALS = [
      { quote:'"PC TuneX cut my boot time from 47 seconds to under 8. I didn\'t realise how much time I was wasting every single morning."', name:'Marcus W.', role:'Senior Developer, London', stars:5 },
      { quote:'"The startup manager alone is worth the price. Clean, fast, no bloat. Exactly what Windows has always needed."', name:'Sarah K.', role:'Graphic Designer, Manchester', stars:5 },
      { quote:'"I\'ve tried every optimiser on the market. PC TuneX is the only one that doesn\'t make things worse after a month."', name:'James T.', role:'IT Consultant, Birmingham', stars:5 },
      { quote:'"The AI portrait series Hasnain produced exceeded every expectation. The style consistency across 20 images was remarkable."', name:'Priya M.', role:'Brand Manager, Edinburgh', stars:5 },
    ];

    const section = document.createElement('section');
    section.className = 'section reveal';
    section.setAttribute('aria-label','Customer Reviews');
    section.innerHTML = `
      <div class="section-header">
        <h2>What People Are Saying</h2>
        <p>Real feedback from PC TuneX users and AI Studio clients.</p>
      </div>
      <div class="testimonials-wrap">
        <div class="testi-track">
          ${TESTIMONIALS.map(t=>`
            <div class="testi-card">
              <div class="testi-stars">${'★'.repeat(t.stars)}</div>
              <p class="testi-quote">${t.quote}</p>
              <div class="testi-author">${t.name}</div>
              <div class="testi-role">${t.role}</div>
            </div>`).join('')}
        </div>
        <div class="testi-dots">
          ${TESTIMONIALS.map((_,i)=>`<button class="testi-dot${i===0?' active':''}" aria-label="Review ${i+1}"></button>`).join('')}
        </div>
      </div>`;

    const sections = document.querySelectorAll('.section');
    const insertAfter = sections[0] || document.querySelector('main');
    if (insertAfter) insertAfter.insertAdjacentElement('afterend', section);

    const track = section.querySelector('.testi-track');
    const dots  = section.querySelectorAll('.testi-dot');
    let cur = 0, timer;

    function goTo(n){
      cur = (n + TESTIMONIALS.length) % TESTIMONIALS.length;
      track.style.transform = `translateX(-${cur * 100}%)`;
      dots.forEach((d,i) => d.classList.toggle('active', i === cur));
    }
    dots.forEach((d,i) => d.addEventListener('click', () => { goTo(i); resetTimer(); }));
    function resetTimer(){ clearInterval(timer); timer = setInterval(() => goTo(cur + 1), 5000); }
    resetTimer();

    /* register with reveal observer */
    const io2 = new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io2.unobserve(e.target); } });
    },{threshold:.10});
    io2.observe(section);
  })();

  /* ============================================================
     ⑤ CORE WEB VITALS BADGE
     Animated ring gauges in the footer, revealed on scroll.
     ============================================================ */
  (function(){
    const SCORES = [
      { label:'Performance', val:96, color:'green' },
      { label:'Accessibility', val:100, color:'green' },
      { label:'Best Practices', val:95, color:'green' },
      { label:'SEO', val:92, color:'green' },
    ];
    const C = 2 * Math.PI * 17; /* circumference for r=17 */

    const badge = document.createElement('div');
    badge.className = 'cwv-badge reveal';
    badge.setAttribute('aria-label','Site performance scores');
    badge.innerHTML = SCORES.map(s => `
      <div class="cwv-score">
        <div class="cwv-ring">
          <svg class="cwv-svg" viewBox="0 0 46 46">
            <circle class="cwv-bg" cx="23" cy="23" r="17"/>
            <circle class="cwv-arc ${s.color}" cx="23" cy="23" r="17"
              stroke-dasharray="${C.toFixed(1)}"
              stroke-dashoffset="${C.toFixed(1)}"
              transform="rotate(-90 23 23)"
              data-target="${((1 - s.val/100)*C).toFixed(2)}"/>
          </svg>
          <div class="cwv-num" data-val="${s.val}">0</div>
        </div>
        <div class="cwv-label">${s.label}</div>
      </div>`).join('');

    const footerBottom = document.querySelector('.footer-bottom');
    if (footerBottom) footerBottom.parentNode.insertBefore(badge, footerBottom);

    /* animate on scroll into view */
    const io3 = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        e.target.querySelectorAll('.cwv-arc').forEach(arc => {
          setTimeout(() => arc.style.strokeDashoffset = arc.dataset.target, 200);
        });
        e.target.querySelectorAll('.cwv-num').forEach(num => {
          const target = +num.dataset.val;
          const start = performance.now();
          (function tick(now){
            const p = Math.min((now - start) / 1600, 1);
            num.textContent = Math.round(p * target);
            if (p < 1) requestAnimationFrame(tick);
          })(start);
        });
        io3.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    io3.observe(badge);
  })();

  /* ============================================================
     ⑥ HIDDEN TERMINAL EASTER EGG  (backtick key → glass terminal)
     ============================================================ */
  (function(){
    // Inject CSS
    const termStyle = document.createElement('style');
    termStyle.textContent = `
      .hsx-terminal-overlay{
        position:fixed;inset:0;z-index:8800;pointer-events:none;
        display:flex;align-items:flex-end;justify-content:center;padding:0 0 2.5rem;
      }
      .hsx-terminal{
        width:min(680px,96vw);max-height:420px;
        background:rgba(4,12,28,.82);
        backdrop-filter:blur(32px) saturate(1.8);
        border:1px solid rgba(80,200,255,.28);
        border-radius:16px;
        box-shadow:inset 0 1.5px 0 rgba(80,200,255,.25),0 24px 70px rgba(0,0,0,.55);
        display:flex;flex-direction:column;overflow:hidden;
        pointer-events:all;
        transform:translateY(110%);opacity:0;
        transition:transform .38s cubic-bezier(.22,1,.36,1),opacity .28s;
      }
      .hsx-terminal.open{transform:translateY(0);opacity:1;}
      .hsx-terminal-bar{
        display:flex;align-items:center;gap:.7rem;padding:.6rem 1rem;
        background:rgba(80,200,255,.07);border-bottom:1px solid rgba(80,200,255,.14);
        font-size:.78rem;font-family:'Orbitron',monospace;color:rgba(80,200,255,.8);
        letter-spacing:.08em;user-select:none;
      }
      .hsx-terminal-bar .t-dot{width:10px;height:10px;border-radius:50%;}
      .t-dot.red{background:#ff5f56;} .t-dot.yellow{background:#ffbd2e;} .t-dot.green{background:#27c93f;}
      .hsx-terminal-bar span{margin-left:auto;opacity:.55;font-size:.7rem;}
      .hsx-terminal-body{
        flex:1;overflow-y:auto;padding:1rem 1.2rem;
        font-family:'Courier New',Courier,monospace;font-size:.83rem;line-height:1.7;
        color:#b8e8ff;scroll-behavior:smooth;
      }
      .hsx-terminal-body::-webkit-scrollbar{width:4px;}
      .hsx-terminal-body::-webkit-scrollbar-thumb{background:rgba(80,200,255,.25);border-radius:4px;}
      .t-line{margin:0;white-space:pre-wrap;word-break:break-word;}
      .t-line.cmd{color:#50c8ff;} .t-line.ok{color:#7af7a0;} .t-line.warn{color:#ffd97a;} .t-line.err{color:#ff8080;}
      .hsx-terminal-input-row{
        display:flex;align-items:center;gap:.5rem;padding:.65rem 1.2rem;
        border-top:1px solid rgba(80,200,255,.12);
      }
      .t-prompt{color:#50c8ff;font-family:'Courier New',monospace;font-size:.83rem;white-space:nowrap;}
      .t-input{
        flex:1;background:none;border:none;outline:none;
        color:#b8e8ff;font-family:'Courier New',monospace;font-size:.83rem;caret-color:#50c8ff;
      }
    `;
    document.head.appendChild(termStyle);

    // Build DOM
    const overlay = document.createElement('div');
    overlay.className = 'hsx-terminal-overlay';
    overlay.innerHTML = `
      <div class="hsx-terminal" id="hsx-term" role="dialog" aria-modal="true" aria-label="HSX Terminal">
        <div class="hsx-terminal-bar">
          <span class="t-dot red"></span><span class="t-dot yellow"></span><span class="t-dot green"></span>
          HSX TERMINAL v1.0
          <span>Press \` to toggle · type help for commands</span>
        </div>
        <div class="hsx-terminal-body" id="hsx-term-body"></div>
        <div class="hsx-terminal-input-row">
          <span class="t-prompt">hsx&gt;&nbsp;</span>
          <input class="t-input" id="hsx-term-input" type="text" autocomplete="off" spellcheck="false" placeholder="type a command…" aria-label="Terminal input">
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const term  = document.getElementById('hsx-term');
    const body  = document.getElementById('hsx-term-body');
    const inp   = document.getElementById('hsx-term-input');
    let open    = false;

    function print(text, cls=''){
      const p = document.createElement('p');
      p.className = 't-line' + (cls ? ' '+cls : '');
      p.textContent = text;
      body.appendChild(p);
      body.scrollTop = body.scrollHeight;
    }
    function printLines(lines){ lines.forEach(([t,c])=>print(t,c)); }

    function welcome(){
      print('╔══════════════════════════════════════════╗','ok');
      print('║   InHasnain Studio X — System Terminal  ║','ok');
      print('╚══════════════════════════════════════════╝','ok');
      print('Type help to see available commands.','');
    }

    const COMMANDS = {
      help(){
        printLines([
          ['Available commands:','warn'],
          ['  scan      — Run a system & browser diagnostic',''],
          ['  optimize  — Run simulated optimisation pass',''],
          ['  help      — Show this help message',''],
          ['  clear     — Clear the terminal',''],
          ['  close     — Close the terminal',''],
        ]);
      },
      clear(){ body.innerHTML = ''; },
      close(){ closeTerm(); },
      scan(){
        print('Initialising scan…','cmd');
        const steps = [
          [300,  '  [■■□□□□□□□□]  15%  Checking browser environment…',''],
          [700,  '  [■■■■□□□□□□]  40%  Reading performance metrics…',''],
          [1100, '  [■■■■■■□□□□]  60%  Analysing memory usage…',''],
          [1500, '  [■■■■■■■■□□]  80%  Probing network interface…',''],
          [1900, '  [■■■■■■■■■■] 100%  Scan complete.','ok'],
        ];
        steps.forEach(([delay,text,cls])=>setTimeout(()=>print(text,cls),delay));
        setTimeout(()=>{
          const mem  = performance.memory ? Math.round(performance.memory.usedJSHeapSize/1048576) + ' MB heap used' : 'Memory API unavailable';
          const conn = navigator.connection ? (navigator.connection.effectiveType||'unknown') + ' connection' : 'Connection API unavailable';
          const res  = screen.width + '×' + screen.height + ' display';
          const ua   = navigator.userAgent.includes('Chrome') ? 'Chromium-based browser' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other browser';
          printLines([
            ['',''],
            ['── Scan Results ──────────────────────────','warn'],
            ['  ' + mem,''],
            ['  ' + conn,''],
            ['  ' + res,''],
            ['  ' + ua,''],
            ['──────────────────────────────────────────','warn'],
          ]);
        }, 2100);
      },
      optimize(){
        print('Starting optimisation sequence…','cmd');
        const passes = [
          [200,  '  Flushing render queue…',''],
          [550,  '  Pruning stale cache entries…',''],
          [900,  '  Re-indexing DOM event pool…',''],
          [1250, '  Compacting animation frames…',''],
          [1600, '  Balancing thread priority…',''],
          [2000, '  ✓ Optimisation complete — system nominal.','ok'],
        ];
        passes.forEach(([d,t,c])=>setTimeout(()=>print(t,c),d));
      },
    };

    function runCommand(raw){
      const cmd = raw.trim().toLowerCase();
      if(!cmd) return;
      print('hsx> ' + cmd, 'cmd');
      if(COMMANDS[cmd]){ COMMANDS[cmd](); }
      else { print('Unknown command: "' + cmd + '". Type help.','err'); }
    }

    function openTerm(){
      if(open) return;
      open = true;
      term.classList.add('open');
      if(!body.hasChildNodes()) welcome();
      setTimeout(()=>inp.focus(), 350);
    }
    function closeTerm(){
      if(!open) return;
      open = false;
      term.classList.remove('open');
    }

    inp.addEventListener('keydown', e=>{
      if(e.key === 'Enter'){
        runCommand(inp.value);
        inp.value = '';
      }
      if(e.key === 'Escape') closeTerm();
    });

    document.addEventListener('keydown', e=>{
      if(e.key === '`' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){
        e.preventDefault();
        open ? closeTerm() : openTerm();
      }
    });

    // Close when clicking outside the terminal panel
    overlay.addEventListener('click', e=>{ if(e.target === overlay) closeTerm(); });
  })();

  /* ============================================================
     ⑦ DEVICE BENCHMARK WIDGET  (Apps page — pctunex.html only)
     Real hardware + actual CPU computation benchmark via Worker:
       • Web Worker timed loop    → real CPU throughput speed
       • navigator.hardwareConcurrency → real logical core count
       • navigator.deviceMemory   → real device RAM (Chrome, ≤8 GB cap)
       • navigator.getBattery()   → real battery % + charging state
       • navigator.connection     → real network speed
       • WebGL renderer string    → real GPU name
     Positioned to the RIGHT of the hero card, same height.
     ============================================================ */
  (function(){
    const page = location.pathname.split('/').pop();
    /* Only run on the Apps catalog page, NOT on pctunex-detail.html or any other page */
    if(page !== 'pctunex.html') return;

    /* ── CSS ── */
    const s = document.createElement('style');
    s.textContent = `
      /* Hero + widget side-by-side layout */
      .hero-row{
        display:flex;gap:1.2rem;align-items:stretch;
        margin-bottom:0;
      }
      .hero-row .hero--single{flex:1 1 0;margin:0 !important;}
      .hero-row .hero--single .hero-card{height:100%;box-sizing:border-box;}

      /* Device widget */
      .dv-widget{
        flex:0 0 230px;
        background:linear-gradient(155deg,rgba(255,255,255,.09) 0%,rgba(255,255,255,.03) 100%);
        backdrop-filter:blur(28px) saturate(2.2) brightness(1.08);
        border:1px solid rgba(255,255,255,.48);
        border-radius:22px;
        box-shadow:
          inset 0 2px 0 rgba(255,255,255,.75),
          inset 0 -1.5px 0 rgba(255,255,255,.22),
          inset 2px 0 0 rgba(255,255,255,.28),
          inset -2px 0 0 rgba(255,255,255,.15),
          0 8px 28px rgba(0,0,0,.09);
        padding:.9rem 1rem .9rem;
        display:flex;flex-direction:column;align-items:center;gap:.6rem;
        position:relative;overflow:hidden;
      }
      .dv-widget::before{
        content:'';position:absolute;inset:0;pointer-events:none;
        background:radial-gradient(ellipse 80% 40% at 50% -5%,rgba(255,255,255,.14) 0%,transparent 70%);
      }
      .dv-title{
        font-family:'Orbitron',sans-serif;font-size:.68rem;letter-spacing:.14em;
        text-transform:uppercase;opacity:.55;margin:0;text-align:center;
      }

      /* Gauge — compact 88px */
      .dv-gauge-wrap{position:relative;width:88px;height:88px;flex-shrink:0;}
      .dv-gauge-svg{width:88px;height:88px;transform:rotate(-90deg);}
      .dv-gauge-bg{fill:none;stroke:rgba(255,255,255,.07);stroke-width:8;}
      .dv-gauge-arc{
        fill:none;stroke-width:8;stroke-linecap:round;
        stroke:url(#dvGrad);
        stroke-dasharray:251;stroke-dashoffset:251;
        transition:stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1);
      }
      .dv-score-num{
        position:absolute;inset:0;display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        font-family:'Orbitron',sans-serif;
      }
      .dv-score-num .dv-n{font-size:1.5rem;font-weight:900;line-height:1;}
      .dv-score-num .dv-of{font-size:.52rem;opacity:.4;letter-spacing:.06em;margin-top:1px;}

      /* Metric rows */
      .dv-metrics{display:flex;flex-direction:column;gap:.34rem;width:100%;}
      .dv-row{
        display:flex;align-items:center;justify-content:space-between;
        background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10);
        border-radius:8px;padding:.32rem .6rem;
      }
      .dv-row .dr-label{font-size:.6rem;opacity:.45;letter-spacing:.05em;text-transform:uppercase;}
      .dv-row .dr-val{font-size:.72rem;font-weight:700;font-family:'Orbitron',sans-serif;}
      .dv-row .dr-icon{font-size:.75rem;margin-right:.28rem;}

      /* Scan button — compact */
      .dv-scan-btn{
        padding:.3rem 1rem;border-radius:999px;
        border:1px solid rgba(255,255,255,.25);
        background:rgba(255,255,255,.06);backdrop-filter:blur(8px);
        cursor:pointer;font-size:.68rem;font-weight:600;color:inherit;
        transition:background .2s,transform .15s;white-space:nowrap;
        margin-top:auto;
      }
      .dv-scan-btn:hover{background:rgba(255,255,255,.13);transform:translateY(-1px);}

      /* Responsive */
      @media(max-width:700px){
        .hero-row{flex-direction:column;}
        .dv-widget{flex:none;width:100%;max-width:100%;}
      }
    `;
    document.head.appendChild(s);

    /* ── Widget HTML ── */
    const widget = document.createElement('div');
    widget.className = 'dv-widget';
    widget.innerHTML = `
      <p class="dv-title">🖥 Device Report</p>
      <div class="dv-gauge-wrap">
        <svg class="dv-gauge-svg" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id="dvGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stop-color="#4fc3f7"/>
              <stop offset="50%"  stop-color="#7c4dff"/>
              <stop offset="100%" stop-color="#f06292"/>
            </linearGradient>
          </defs>
          <circle class="dv-gauge-bg" cx="50" cy="50" r="40" stroke-width="8"/>
          <circle class="dv-gauge-arc" id="dv-arc" cx="50" cy="50" r="40"/>
        </svg>
        <div class="dv-score-num">
          <span class="dv-n" id="dv-num">—</span>
          <span class="dv-of">/ 100</span>
        </div>
      </div>
      <div class="dv-metrics">
        <div class="dv-row">
          <span><span class="dr-icon">⚡</span><span class="dr-label">CPU Speed</span></span>
          <span class="dr-val" id="dv-speed">—</span>
        </div>
        <div class="dv-row">
          <span><span class="dr-icon">⚙️</span><span class="dr-label">CPU Cores</span></span>
          <span class="dr-val" id="dv-cpu">—</span>
        </div>
        <div class="dv-row">
          <span><span class="dr-icon">🧠</span><span class="dr-label">RAM</span></span>
          <span class="dr-val" id="dv-ram">—</span>
        </div>
        <div class="dv-row">
          <span><span class="dr-icon">🔋</span><span class="dr-label">Battery</span></span>
          <span class="dr-val" id="dv-bat">—</span>
        </div>
      </div>
      <button class="dv-scan-btn" id="dv-btn">Re-run Benchmark</button>
    `;

    /* ── Wrap hero + widget in a flex row ── */
    const hero = document.querySelector('.hero.hero--single');
    if(hero){
      const row = document.createElement('div');
      row.className = 'hero-row';
      hero.parentNode.insertBefore(row, hero);
      row.appendChild(hero);
      row.appendChild(widget);
    } else {
      const main = document.querySelector('main.container');
      if(main) main.prepend(widget);
    }

    /* ── DOM refs ── */
    const arc     = document.getElementById('dv-arc');
    const numEl   = document.getElementById('dv-num');
    const speedEl = document.getElementById('dv-speed');
    const cpuEl   = document.getElementById('dv-cpu');
    const ramEl   = document.getElementById('dv-ram');
    const batEl   = document.getElementById('dv-bat');
    const gpuEl   = null; /* removed from compact widget */
    const netEl   = null; /* removed from compact widget */
    const btn     = document.getElementById('dv-btn');
    const CIRC    = Math.PI * 2 * 40; /* r=40, viewBox 100×100 */

    function clamp(v,a,b){ return Math.min(b,Math.max(a,v)); }
    function countUp(el, target, dur){
      const t0 = performance.now();
      (function tick(now){
        const p = Math.min((now-t0)/dur, 1);
        el.textContent = Math.round(p*target);
        if(p < 1) requestAnimationFrame(tick); else el.textContent = target;
      })(t0);
    }

    /* ── Real CPU benchmark via Web Worker (off main thread) ── */
    function cpuBenchmark(){
      return new Promise(resolve => {
        /* Worker runs a heavy float computation — ms time is real CPU speed */
        const code = `self.onmessage=function(){
          var t=Date.now(),x=0,i=0,N=15000000;
          for(;i<N;i++) x+=Math.sqrt(i)*Math.sin(i*0.0001+x*0.00001);
          self.postMessage({ms:Date.now()-t,dummy:x});
        };`;
        try{
          const blob   = new Blob([code],{type:'application/javascript'});
          const url    = URL.createObjectURL(blob);
          const worker = new Worker(url);
          worker.onmessage = e => { URL.revokeObjectURL(url); resolve(e.data.ms); };
          worker.onerror   = ()  => { URL.revokeObjectURL(url); resolve(null); };
          worker.postMessage(null);
        } catch(e){ resolve(null); }
      });
    }

    /* ── GPU via WebGL ── */
    function getGPU(){
      try{
        const c  = document.createElement('canvas');
        const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        if(!gl) return 'N/A';
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if(ext) return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
          .replace(/ANGLE \(|Microsoft |Corporation|\)/g,'').trim().split('/')[0].trim();
        return gl.getParameter(gl.RENDERER) || 'Unknown';
      }catch(e){ return 'N/A'; }
    }

    async function runScan(){
      btn.textContent = 'Benchmarking…';
      btn.disabled = true;
      numEl.textContent = '…';
      arc.style.strokeDashoffset = CIRC;
      speedEl.textContent = cpuEl.textContent = ramEl.textContent = batEl.textContent = '…';

      /* ── 1. CPU Speed — real Worker benchmark ── */
      const ms = await cpuBenchmark();
      let cpuSpeedScore, speedLabel;
      if(ms === null){
        cpuSpeedScore = 20; speedLabel = 'N/A';
      } else if(ms < 120){
        cpuSpeedScore = 35; speedLabel = 'Blazing';
      } else if(ms < 200){
        cpuSpeedScore = 30; speedLabel = 'Fast';
      } else if(ms < 350){
        cpuSpeedScore = 22; speedLabel = 'Good';
      } else if(ms < 600){
        cpuSpeedScore = 13; speedLabel = 'Moderate';
      } else {
        cpuSpeedScore = 6;  speedLabel = 'Slow';
      }
      speedEl.textContent = ms ? speedLabel + ' (' + ms + 'ms)' : 'N/A';

      /* ── 2. CPU Cores — navigator.hardwareConcurrency (real, all browsers) ── */
      const cores = navigator.hardwareConcurrency || null;
      cpuEl.textContent = cores ? cores + ' cores' : 'N/A';
      const coreScore = cores
        ? (cores >= 24 ? 15 : cores >= 16 ? 13 : cores >= 8 ? 10 : cores >= 4 ? 7 : 4)
        : 8;

      /* ── 3. Device RAM — navigator.deviceMemory (Chrome/Edge, real but capped ≤8 GB) ── */
      const ram = navigator.deviceMemory || null;
      ramEl.textContent = ram ? (ram >= 8 ? '≥' + ram + ' GB' : ram + ' GB') : 'N/A';
      const ramScore = ram
        ? (ram >= 8 ? 25 : ram >= 4 ? 20 : ram >= 2 ? 13 : 6)
        : 18;

      /* ── 4. Network score (used in total, no UI row) ── */
      let netScore = 15;
      if(navigator.connection){
        const dl = navigator.connection.downlink || 0;
        const et = navigator.connection.effectiveType || '';
        if(dl >= 50 || et === '4g') netScore=15;
        else if(dl >= 5)            netScore=12;
        else if(dl >= 1)            netScore=8;
        else if(dl >  0)            netScore=4;
        else                        netScore=2;
      }

      /* ── 5. Battery — navigator.getBattery() (real, Chrome/Edge) ── */
      let batScore = 10, batLabel = 'N/A';
      if(navigator.getBattery){
        try{
          const b   = await navigator.getBattery();
          const pct = Math.round(b.level * 100);
          batLabel  = pct + '%' + (b.charging ? ' ⚡' : '');
          batScore  = b.charging ? 10 : (pct >= 80 ? 10 : pct >= 50 ? 7 : pct >= 20 ? 4 : 2);
        }catch(e){}
      }
      batEl.textContent = batLabel;

      const total = clamp(cpuSpeedScore + coreScore + ramScore + netScore + batScore, 0, 100);

      /* Animate arc + count */
      const offset = CIRC - (CIRC * total / 100);
      requestAnimationFrame(()=>{ arc.style.strokeDashoffset = offset; });
      countUp(numEl, total, 1600);

      btn.textContent = 'Re-run Benchmark';
      btn.disabled = false;
    }

    btn.addEventListener('click', runScan);
    setTimeout(runScan, 700);
  })();

  /* ============================================================
     ⑧ AI TEXT REWRITER PANEL
     Hover any <p> → a floating pill appears. Click → glass panel
     with 3 tones: Professional / Casual / Punchy.
     Uses Chrome built-in AI (window.ai) if available,
     otherwise a smart local rule-based transformer.
     ============================================================ */
  (function(){
    /* ── CSS ── */
    const st = document.createElement('style');
    st.textContent = `
      .rw-pill{
        position:fixed;z-index:7000;pointer-events:all;
        background:rgba(255,255,255,.14);backdrop-filter:blur(16px);
        border:1px solid rgba(255,255,255,.40);border-radius:999px;
        padding:.3rem .85rem;font-size:.72rem;font-weight:700;
        letter-spacing:.07em;cursor:pointer;white-space:nowrap;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 4px 16px rgba(0,0,0,.12);
        transition:opacity .2s,transform .2s;opacity:0;transform:translateY(4px);
        user-select:none;
      }
      .rw-pill.visible{opacity:1;transform:translateY(0);}
      .rw-pill:hover{background:rgba(255,255,255,.24);}

      .rw-panel-overlay{
        position:fixed;inset:0;z-index:7100;
        background:rgba(0,0,0,.35);backdrop-filter:blur(3px);
        display:flex;align-items:center;justify-content:center;
        opacity:0;pointer-events:none;
        transition:opacity .22s;
      }
      .rw-panel-overlay.open{opacity:1;pointer-events:all;}
      .rw-panel{
        width:min(600px,94vw);
        background:linear-gradient(145deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,.03) 100%);
        backdrop-filter:blur(34px) saturate(2.2) brightness(1.09);
        border:1px solid rgba(255,255,255,.50);border-radius:20px;
        box-shadow:inset 0 2px 0 rgba(255,255,255,.7),0 24px 70px rgba(0,0,0,.22);
        padding:1.8rem 2rem;display:flex;flex-direction:column;gap:1.2rem;
        transform:scale(.94) translateY(12px);
        transition:transform .28s cubic-bezier(.22,1,.36,1);
      }
      .rw-panel-overlay.open .rw-panel{transform:scale(1) translateY(0);}
      .rw-panel-title{
        font-family:'Orbitron',sans-serif;font-size:.82rem;letter-spacing:.12em;
        text-transform:uppercase;opacity:.65;margin:0;
      }
      .rw-original{
        font-size:.85rem;opacity:.5;line-height:1.6;padding:.7rem .9rem;
        background:rgba(255,255,255,.05);border-radius:10px;border:1px solid rgba(255,255,255,.12);
        max-height:80px;overflow:hidden;text-overflow:ellipsis;
        display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;
      }
      .rw-tones{display:flex;gap:.6rem;flex-wrap:wrap;}
      .rw-tone-btn{
        padding:.4rem 1rem;border-radius:999px;border:1px solid rgba(255,255,255,.28);
        background:rgba(255,255,255,.07);cursor:pointer;font-size:.78rem;font-weight:600;
        color:inherit;transition:background .18s,transform .15s;
      }
      .rw-tone-btn:hover,.rw-tone-btn.active{background:rgba(255,255,255,.18);transform:translateY(-1px);}
      .rw-result{
        font-size:.92rem;line-height:1.7;padding:.9rem 1rem;min-height:80px;
        background:rgba(255,255,255,.06);border-radius:12px;border:1px solid rgba(255,255,255,.16);
        position:relative;
      }
      .rw-result.loading::after{
        content:'Rewriting…';position:absolute;inset:0;display:flex;
        align-items:center;justify-content:center;
        font-size:.8rem;opacity:.45;font-style:italic;
      }
      .rw-actions{display:flex;gap:.7rem;justify-content:flex-end;}
      .rw-copy-btn,.rw-close-btn{
        padding:.38rem 1rem;border-radius:999px;border:1px solid rgba(255,255,255,.25);
        background:rgba(255,255,255,.07);cursor:pointer;font-size:.78rem;font-weight:600;
        color:inherit;transition:background .18s;
      }
      .rw-copy-btn:hover,.rw-close-btn:hover{background:rgba(255,255,255,.16);}
    `;
    document.head.appendChild(st);

    /* ── Panel DOM ── */
    const overlay = document.createElement('div');
    overlay.className = 'rw-panel-overlay';
    overlay.innerHTML = `
      <div class="rw-panel" role="dialog" aria-label="AI Text Rewriter">
        <p class="rw-panel-title">✦ AI Text Rewriter</p>
        <div class="rw-original" id="rw-orig"></div>
        <div class="rw-tones">
          <button class="rw-tone-btn" data-tone="professional">🎩 Professional</button>
          <button class="rw-tone-btn" data-tone="casual">😎 Casual</button>
          <button class="rw-tone-btn" data-tone="punchy">⚡ Punchy</button>
        </div>
        <div class="rw-result" id="rw-result"></div>
        <div class="rw-actions">
          <button class="rw-copy-btn" id="rw-copy">Copy</button>
          <button class="rw-close-btn" id="rw-close">Close</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const pill = document.createElement('div');
    pill.className = 'rw-pill';
    pill.textContent = '✦ Rewrite';
    document.body.appendChild(pill);

    const origEl   = document.getElementById('rw-orig');
    const resultEl = document.getElementById('rw-result');
    let targetText = '', pillTimer = null, activeTone = null;

    /* ── Local rule-based transformer ── */
    const rules = {
      professional:{
        subs:[['get','obtain'],['use','utilize'],['need','require'],['make','create'],
              ['show','demonstrate'],['help','facilitate'],['do','execute'],
              ['a lot','significantly'],['very','highly'],['fast','rapidly'],
              ['fix','resolve'],['big','substantial'],['small','minimal'],
              ['find out','ascertain'],['look at','examine'],['think','consider'],
              ['can\'t','cannot'],['won\'t','will not'],['don\'t','do not'],
              ['it\'s','it is'],['that\'s','that is'],['you\'re','you are']],
        wrap(s){ return s.charAt(0).toUpperCase()+s.slice(1)+(s.endsWith('.')||s.endsWith('!')||s.endsWith('?')?'':'.'); },
        prefix:'',
      },
      casual:{
        subs:[['obtain','get'],['utilize','use'],['require','need'],['create','make'],
              ['demonstrate','show'],['facilitate','help'],['execute','do'],
              ['significantly','a lot'],['highly','really'],['rapidly','fast'],
              ['resolve','fix'],['substantial','big'],['minimal','small'],
              ['cannot','can\'t'],['will not','won\'t'],['do not','don\'t'],
              ['it is','it\'s'],['that is','that\'s'],['you are','you\'re'],
              ['however','though'],['therefore','so'],['additionally','also']],
        wrap(s){ return s; },
        prefix:'',
      },
      punchy:{
        subs:[['in order to','to'],['due to the fact that','because'],['at this point in time','now'],
              ['a large number of','many'],['in the near future','soon'],['as a result of','from'],
              ['in spite of the fact that','despite'],['with regard to','on']],
        wrap(s){
          /* Split at sentence ends and trim filler openers */
          const filler = /^(well,?\s*|so,?\s*|basically,?\s*|actually,?\s*|you know,?\s*)/i;
          return s.split(/(?<=[.!?])\s+/).map(sent=>sent.replace(filler,'').trim())
                  .filter(Boolean).join(' ');
        },
        prefix:'',
      },
    };

    async function rewrite(text, tone){
      resultEl.className = 'rw-result loading';
      resultEl.textContent = '';
      activeTone = tone;
      document.querySelectorAll('.rw-tone-btn').forEach(b=>{
        b.classList.toggle('active', b.dataset.tone === tone);
      });

      let result = text;
      /* Try Chrome built-in AI first */
      if(window.ai && window.ai.languageModel){
        try{
          const toneDesc = {
            professional:'formal, business-appropriate language',
            casual:'friendly, conversational, relaxed language',
            punchy:'short punchy sentences, direct, impactful, no filler words',
          }[tone];
          const session = await window.ai.languageModel.create({
            systemPrompt:`Rewrite the following paragraph in a ${toneDesc} tone. Return ONLY the rewritten text, no commentary.`,
          });
          result = await session.prompt(text);
          session.destroy();
        }catch(e){ result = localRewrite(text, tone); }
      } else {
        /* Artificial delay so it feels like it's thinking */
        await new Promise(r => setTimeout(r, 600 + Math.random()*400));
        result = localRewrite(text, tone);
      }

      resultEl.className = 'rw-result';
      resultEl.textContent = result;
    }

    function localRewrite(text, tone){
      const r = rules[tone];
      let s = text;
      r.subs.forEach(([from,to])=>{
        s = s.replace(new RegExp('\\b'+from+'\\b','gi'), m =>
          m[0] === m[0].toUpperCase() ? to.charAt(0).toUpperCase()+to.slice(1) : to);
      });
      if(tone === 'punchy'){
        /* Break long sentences at commas/conjunctions */
        s = s.replace(/,\s*(and|but|or|so|yet)\s+/gi,' ').replace(/\s{2,}/g,' ').trim();
        /* Add punch openers */
        const openers = ['Here\'s the truth: ','Simply put: ','The reality? ','No fluff: '];
        if(s.length > 60) s = openers[Math.floor(Math.random()*openers.length)] + s.charAt(0).toLowerCase() + s.slice(1);
      }
      return r.wrap(s);
    }

    /* ── Pill: show near hovered <p> ── */
    document.addEventListener('mouseover', e=>{
      const p = e.target.closest('p:not(.rw-panel p):not(.rw-panel-title):not(.dv-api-note):not(.dv-subtitle):not(.footer-sub):not(.footer-links p)');
      if(!p || !p.textContent.trim() || p.textContent.trim().length < 30) return;
      clearTimeout(pillTimer);
      targetText = p.textContent.trim();
      const r = p.getBoundingClientRect();
      pill.style.left = (r.left + scrollX) + 'px';
      pill.style.top  = (r.top + scrollY - 36) + 'px';
      pill.classList.add('visible');
    });
    document.addEventListener('mouseout', e=>{
      if(!e.relatedTarget || (!e.relatedTarget.closest('p') && e.relatedTarget !== pill)){
        pillTimer = setTimeout(()=>pill.classList.remove('visible'), 300);
      }
    });
    pill.addEventListener('mouseenter', ()=>clearTimeout(pillTimer));
    pill.addEventListener('mouseleave', ()=>{ pillTimer = setTimeout(()=>pill.classList.remove('visible'), 300); });

    pill.addEventListener('click', ()=>{
      if(!targetText) return;
      origEl.textContent = targetText;
      resultEl.textContent = '';
      resultEl.className = 'rw-result';
      document.querySelectorAll('.rw-tone-btn').forEach(b=>b.classList.remove('active'));
      overlay.classList.add('open');
      pill.classList.remove('visible');
    });

    document.querySelectorAll('.rw-tone-btn').forEach(b=>{
      b.addEventListener('click', ()=>rewrite(targetText, b.dataset.tone));
    });

    document.getElementById('rw-copy').addEventListener('click', ()=>{
      const t = resultEl.textContent;
      if(!t) return;
      navigator.clipboard.writeText(t).then(()=>{
        const btn = document.getElementById('rw-copy');
        btn.textContent = 'Copied!';
        setTimeout(()=>btn.textContent='Copy', 1800);
      });
    });

    const closeRW = ()=>overlay.classList.remove('open');
    document.getElementById('rw-close').addEventListener('click', closeRW);
    overlay.addEventListener('click', e=>{ if(e.target===overlay) closeRW(); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeRW(); });
  })();

  /* ============================================================
     ⑨ PHYSICS-BASED PRODUCT CARD LAUNCH  (pctunex.html only)
     Clicking the PC TuneX card fires it upward with realistic
     spring physics: velocity, gravity, damped bounce.
     ============================================================ */
  (function(){
    const page = location.pathname.split('/').pop();
    if(page !== 'pctunex.html') return;

    /* Wait for DOM to settle */
    setTimeout(()=>{
      /* First .card in the catalog grid = PC TuneX */
      const card = document.querySelector('.section .grid .card');
      if(!card) return;

      let animating = false;

      card.addEventListener('click', e=>{
        /* Don't intercept link clicks inside the card */
        if(e.target.closest('a,button')) return;
        if(animating) return;
        animating = true;

        /* Spring params */
        let y = 0, vy = -22; /* px/frame upward launch */
        const gravity   = 1.1;
        const damping   = 0.68;
        const maxBounce = 3;
        let bounces     = 0;
        let rot         = 0;

        card.style.transition = 'none';
        card.style.willChange = 'transform';

        /* Particle burst */
        const burst = ()=>{
          for(let i = 0; i < 8; i++){
            const spark = document.createElement('div');
            const angle = (i / 8) * Math.PI * 2;
            const dist  = 40 + Math.random() * 40;
            const r = card.getBoundingClientRect();
            const cx= r.left + r.width/2 + scrollX;
            const cy= r.top  + r.height/2 + scrollY;
            spark.style.cssText = `
              position:absolute;width:6px;height:6px;border-radius:50%;
              background:rgba(255,255,255,.7);pointer-events:none;z-index:999;
              left:${cx}px;top:${cy}px;
              transition:transform .55s cubic-bezier(.22,1,.36,1),opacity .55s;
            `;
            document.body.appendChild(spark);
            requestAnimationFrame(()=>{
              spark.style.transform = `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`;
              spark.style.opacity = '0';
            });
            setTimeout(()=>spark.remove(), 600);
          }
        };
        burst();

        (function tick(){
          vy += gravity;
          y  += vy;
          rot = vy * 0.6;

          if(y >= 0 && vy > 0){
            y  = 0;
            vy = -vy * damping;
            bounces++;
            if(Math.abs(vy) < 1.5 || bounces >= maxBounce){
              card.style.transform = '';
              card.style.willChange = '';
              card.style.transition = '';
              animating = false;
              return;
            }
          }

          card.style.transform = `translateY(${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
          requestAnimationFrame(tick);
        })();
      });

      /* Visual hint on first load */
      card.title = 'Click to launch!';
    }, 400);
  })();

  /* ============================================================
     ⑩ VOICE-ACTIVATED NAVIGATION
     Hold Space (when not in an input) → mic activates →
     speak a page name → navigate. SpeechRecognition API.
     ============================================================ */
  (function(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR) return; /* Firefox/Safari without flag — silent skip */

    /* ── Inject CSS ── */
    const vst = document.createElement('style');
    vst.textContent = `
      .voice-indicator{
        position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(80px);
        z-index:8500;
        background:rgba(4,12,28,.85);backdrop-filter:blur(24px) saturate(1.8);
        border:1px solid rgba(80,180,255,.35);border-radius:999px;
        padding:.55rem 1.6rem .55rem 1rem;
        display:flex;align-items:center;gap:.75rem;
        box-shadow:inset 0 1px 0 rgba(80,180,255,.2),0 12px 40px rgba(0,0,0,.4);
        transition:transform .32s cubic-bezier(.22,1,.36,1),opacity .25s;
        opacity:0;pointer-events:none;
      }
      .voice-indicator.active{transform:translateX(-50%) translateY(0);opacity:1;}
      .voice-dot{
        width:10px;height:10px;border-radius:50%;
        background:#50c8ff;box-shadow:0 0 8px #50c8ff;
        animation:voicePulse 1s ease-in-out infinite;
      }
      @keyframes voicePulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.5);opacity:.6;}}
      .voice-text{font-size:.78rem;font-family:'Orbitron',sans-serif;letter-spacing:.08em;color:rgba(160,220,255,.9);}
      .voice-result{font-size:.72rem;opacity:.55;margin-top:.15rem;font-style:italic;}
    `;
    document.head.appendChild(vst);

    const ind = document.createElement('div');
    ind.className = 'voice-indicator';
    ind.innerHTML = `<div class="voice-dot"></div><div><div class="voice-text" id="vi-text">Listening…</div><div class="voice-result" id="vi-res">Say: Home · Apps · AI Studio · Contact</div></div>`;
    document.body.appendChild(ind);
    const viText = document.getElementById('vi-text');
    const viRes  = document.getElementById('vi-res');

    const PAGES = {
      home:    'index.html', index:    'index.html',
      apps:    'pctunex.html', applications: 'pctunex.html', app: 'pctunex.html',
      studio:  'pricing.html', ai:       'pricing.html',
      pricing: 'pricing.html', portfolio:'pricing.html',
      contact: 'contact.html', reach:    'contact.html', email: 'contact.html',
    };

    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 4;
    let isListening = false, holdTimer = null;

    function startListening(){
      if(isListening) return;
      isListening = true;
      ind.classList.add('active');
      viText.textContent = 'Listening…';
      viRes.textContent  = 'Say: Home · Apps · AI Studio · Contact';
      try{ rec.start(); }catch(e){}
    }
    function stopListening(){
      if(!isListening) return;
      isListening = false;
      try{ rec.stop(); }catch(e){}
      setTimeout(()=>ind.classList.remove('active'), 600);
    }

    rec.onresult = e=>{
      const transcript = Array.from(e.results)
        .map(r=>r[0].transcript).join(' ').toLowerCase().trim();
      viRes.textContent = '"' + transcript + '"';

      if(e.results[e.results.length-1].isFinal){
        const words = transcript.split(/\s+/);
        let dest = null;
        for(const w of words){
          if(PAGES[w]){ dest = PAGES[w]; break; }
        }
        if(dest){
          viText.textContent = 'Navigating…';
          viRes.textContent  = '→ ' + dest;
          stopListening();
          setTimeout(()=>location.href = dest, 500);
        } else {
          viText.textContent = 'Not recognised';
          viRes.textContent  = 'Try: Home, Apps, Studio, Contact';
          setTimeout(stopListening, 1200);
        }
      }
    };
    rec.onerror = ()=>stopListening();
    rec.onend   = ()=>{ if(isListening) { try{rec.start();}catch(e){} } };

    document.addEventListener('keydown', e=>{
      if(e.code !== 'Space') return;
      if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
      if(e.repeat) return;
      e.preventDefault();
      holdTimer = setTimeout(startListening, 120); /* slight hold to avoid accidental */
    });
    document.addEventListener('keyup', e=>{
      if(e.code !== 'Space') return;
      clearTimeout(holdTimer);
      if(isListening) stopListening();
    });
  })();

  /* ============================================================
     ⑪ ANIMATED CODE DNA HELIX  — disabled (luxury glass mode)
     ============================================================ */
  (function(){
    return; /* removed — replaced by clean liquid glass background */
    const cv  = document.createElement('canvas');
    cv.setAttribute('aria-hidden','true');
    cv.style.cssText = [
      'position:fixed','inset:0','z-index:0',
      'pointer-events:none',
      'opacity:0.55',
    ].join(';');
    /* Insert BEFORE the bg-grid so grid lines sit on top */
    const grid = document.querySelector('.bg-grid');
    if(grid) document.body.insertBefore(cv, grid);
    else document.body.prepend(cv);

    const ctx = cv.getContext('2d');
    let W, H, raf, t = 0;

    function resize(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
    resize();
    addEventListener('resize', ()=>{ resize(); });

    /* Code characters shown on rungs */
    const CHARS = '(){}[];=>const let var fn async await return class if else for'.split(' ').join('').split('');

    function drawStrand(cx, phaseOffset, night){
      const AMP      = Math.min(48, W * 0.04);
      const PERIOD   = 180;  /* px per full rotation */
      const RUNGS    = Math.ceil(H / 28) + 2;
      const rungH    = H / (RUNGS - 2);

      /* Smooth strand path */
      [0, Math.PI].forEach((off, si)=>{
        ctx.beginPath();
        let first = true;
        for(let y = -rungH; y <= H + rungH; y += 4){
          const phase = (y / PERIOD) * Math.PI * 2 + phaseOffset + t;
          const x     = cx + Math.sin(phase + off) * AMP;
          const depth = (Math.sin(phase + off) + 1) / 2; /* 0 = back, 1 = front */
          if(first){ ctx.moveTo(x, y); first = false; }
          else { ctx.lineTo(x, y); }
        }
        const strandAlpha = night ? 0.18 : 0.10;
        ctx.strokeStyle = night
          ? `rgba(70,160,255,${strandAlpha})`
          : `rgba(80,110,200,${strandAlpha * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      /* Rungs + characters */
      for(let i = 0; i <= RUNGS; i++){
        const y      = -rungH + i * rungH;
        const phase  = (y / PERIOD) * Math.PI * 2 + phaseOffset + t;
        const x1     = cx + Math.sin(phase) * AMP;
        const x2     = cx + Math.sin(phase + Math.PI) * AMP;
        const depth  = (Math.sin(phase) + 1) / 2;
        const rAlpha = night
          ? 0.06 + depth * 0.10
          : 0.04 + depth * 0.06;

        /* Rung line */
        ctx.strokeStyle = night
          ? `rgba(100,180,255,${rAlpha})`
          : `rgba(80,110,200,${rAlpha * 0.8})`;
        ctx.lineWidth = 0.8 + depth * 0.7;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        /* Character at midpoint */
        const ch     = CHARS[(i * 7 + Math.floor(t * 0.8)) % CHARS.length];
        const cAlpha = night
          ? 0.12 + depth * 0.18
          : 0.07 + depth * 0.10;
        const cSize  = Math.round(7 + depth * 4);
        ctx.font      = `${cSize}px 'Courier New',monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = night
          ? `rgba(120,190,255,${cAlpha})`
          : `rgba(80,100,180,${cAlpha})`;
        ctx.fillText(ch, (x1 + x2) / 2, y + cSize * 0.35);
      }
    }

    function frame(){
      ctx.clearRect(0, 0, W, H);
      const night = document.body.classList.contains('is-night');

      /* Number of helix columns scales with viewport width */
      const cols  = Math.max(1, Math.round(W / 320));
      const colW  = W / cols;
      for(let c = 0; c < cols; c++){
        const cx      = (c + 0.5) * colW;
        const pOffset = (c / cols) * Math.PI * 1.5; /* stagger phase per column */
        drawStrand(cx, pOffset, night);
      }

      t   += 0.012;
      raf  = requestAnimationFrame(frame);
    }
    frame();
  })();

  /* ============================================================
     ⑫ SCROLL-TRIGGERED CINEMATIC VIDEO CHAPTERS
     IntersectionObserver watches each .section.
     When a section enters view, it looks for /videos/<slug>.webm
     (slug = section's aria-labelledby or index).
     If found: plays a small cinematic pip in the section corner.
     If not found: silently skipped — fully graceful.
     TO USE: drop short (3–6s) silent .webm files in a /videos/
     folder named: section-0.webm, section-1.webm, etc.
     ============================================================ */
  (function(){
    const vst2 = document.createElement('style');
    vst2.textContent = `
      .cinema-pip{
        position:absolute;top:1rem;right:1rem;
        width:clamp(160px,22%,260px);border-radius:12px;overflow:hidden;
        box-shadow:0 8px 32px rgba(0,0,0,.35);
        border:1px solid rgba(255,255,255,.22);
        z-index:10;opacity:0;
        transition:opacity .5s cubic-bezier(.22,1,.36,1);
        pointer-events:none;
      }
      .cinema-pip.show{opacity:1;}
      .cinema-pip video{width:100%;height:auto;display:block;border-radius:12px;}
    `;
    document.head.appendChild(vst2);

    const sections = document.querySelectorAll('.section');
    sections.forEach((sec, idx)=>{
      if(getComputedStyle(sec).position === 'static') sec.style.position = 'relative';

      const videoPath = 'videos/section-' + idx + '.webm';
      /* Probe if file exists without blocking */
      fetch(videoPath, {method:'HEAD'})
        .then(r=>{
          if(!r.ok) return;
          /* File exists — create pip */
          const pip = document.createElement('div');
          pip.className = 'cinema-pip';
          const vid = document.createElement('video');
          vid.src        = videoPath;
          vid.muted      = true;
          vid.playsInline= true;
          vid.loop       = true;
          vid.preload    = 'none';
          pip.appendChild(vid);
          sec.appendChild(pip);

          const io = new IntersectionObserver(entries=>{
            entries.forEach(e=>{
              if(e.isIntersecting){
                vid.load();
                vid.play().catch(()=>{});
                pip.classList.add('show');
              } else {
                vid.pause();
                pip.classList.remove('show');
              }
            });
          },{ threshold:0.35 });
          io.observe(sec);
        })
        .catch(()=>{}); /* silently skip if no /videos/ folder */
    });
  })();

  /* ============================================================
     ⑬ NATURE SOUNDSCAPE GENERATOR
     Pure Web Audio API synthesis — zero audio files.
     • RAIN  (body.weather-rain) : synthesized rainfall —
       white noise + bandpass layers + random droplet pops + rumble
     • DAY   (body.is-day)       : birds chirping + light wind
     • NIGHT (body.is-night)     : crickets + owl + deep nocturnal hum
     Toggle via ♪ pill. Fully generative, never loops.
     ============================================================ */
  (function(){
    let AC = null, master = null, nodes = [], playing = false;

    /* Detect current scene */
    function isRain(){ return document.body.classList.contains('weather-rain'); }
    function isDay() { return document.body.classList.contains('is-day'); }

    /* ── Shared reverb ── */
    function makeReverb(ac, secs, decay){
      const len  = ac.sampleRate * secs;
      const buf  = ac.createBuffer(2, len, ac.sampleRate);
      for(let ch=0;ch<2;ch++){
        const d=buf.getChannelData(ch);
        for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);
      }
      const c=ac.createConvolver(); c.buffer=buf; return c;
    }

    /* ── Envelope helper ── */
    function env(g, ac, atk, hold, rel, peak){
      const t=ac.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(peak,t+atk);
      g.gain.setValueAtTime(peak,t+atk+hold);
      g.gain.exponentialRampToValueAtTime(0.0001,t+atk+hold+rel);
    }

    /* Helper: smooth noise buffer */
    function noiseBuffer(ac, secs, passes){
      const buf=ac.createBuffer(1,ac.sampleRate*secs,ac.sampleRate);
      const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
      for(let p=0;p<(passes||4);p++) for(let i=1;i<d.length-1;i++) d[i]=(d[i-1]+d[i]+d[i+1])/3;
      return buf;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       RAIN SOUNDSCAPE — ASMR spa-like, very soft
       — silky high-shelf rain veil (narrow Q, low gain)
       — gentle roof-drip mid layer
       — barely-there low-freq presence
       — infrequent soft droplet taps with reverb tail
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function startRain(ac, dest){
      const nb = noiseBuffer(ac,5,6);
      const srcs=[];

      /* 3D rain layers: above (high), left-surround (mid), right-surround */
      function rainLayer(freq,Q,gain,panX,panY,panZ){
        const s=ac.createBufferSource(); s.buffer=nb; s.loop=true;
        const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=freq; bp.Q.value=Q;
        const g=ac.createGain(); g.gain.value=gain;
        const p=ac.createPanner(); p.panningModel='HRTF'; p.distanceModel='inverse'; p.refDistance=1;
        try{ p.positionX.value=panX; p.positionY.value=panY; p.positionZ.value=panZ; }catch(e){}
        s.connect(bp); bp.connect(g); g.connect(p); p.connect(dest); s.start();
        srcs.push(s);
      }
      rainLayer(5800,2.0,0.048, 0, 3,-1);    /* overhead — fine mist */
      rainLayer(1800,1.4,0.062,-2, 0,-1.5);  /* left — heavier drops */
      rainLayer(1800,1.4,0.058, 2, 0,-1.5);  /* right — heavier drops */
      rainLayer(280, 0.8,0.035, 0,-0.5,-2);  /* rumble from behind */

      /* Resonant droplet pings — each one 3D-positioned */
      let dropT;
      function drop(){
        if(!playing) return;
        const x=(Math.random()-0.5)*5, z=-1-Math.random()*3;
        const p2=ac.createPanner(); p2.panningModel='HRTF'; p2.refDistance=1;
        try{ p2.positionX.value=x; p2.positionY.value=0.5; p2.positionZ.value=z; }catch(e){}
        const o=ac.createOscillator(), o2=ac.createOscillator(), gd=ac.createGain();
        const f=160+Math.random()*180;
        o.frequency.value=f; o2.frequency.value=f*1.52; o.type=o2.type='sine';
        o.connect(gd); o2.connect(gd); gd.connect(p2); p2.connect(dest);
        env(gd,ac,.001,.006,.28,.018+Math.random()*.012);
        o.start(); o2.start(); o.stop(ac.currentTime+.32); o2.stop(ac.currentTime+.32);
        dropT=setTimeout(drop,700+Math.random()*2200);
      }
      drop();
      return { stop(){ srcs.forEach(s=>{try{s.stop();}catch(e){}}); clearTimeout(dropT); } };
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       DAY / SUNNY SOUNDSCAPE — 3D ASMR garden
       Birds in 3D positions, soft breeze sweeping L→R,
       distant water stream, warm hum of summer.
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function startDay(ac, dest){
      const srcs=[], timers=[];

      function pan3(x,y,z){
        const p=ac.createPanner(); p.panningModel='HRTF'; p.distanceModel='inverse'; p.refDistance=1;
        try{ p.positionX.value=x; p.positionY.value=y; p.positionZ.value=z; }catch(e){}
        return p;
      }

      /* Gentle breeze — sweeps left to right */
      const wBuf=noiseBuffer(ac,4,5);
      const wSrc=ac.createBufferSource(); wSrc.buffer=wBuf; wSrc.loop=true;
      const wLp=ac.createBiquadFilter(); wLp.type='lowpass'; wLp.frequency.value=320;
      const wG=ac.createGain(); wG.gain.value=0.042;
      const wP=pan3(-3,0.5,-1);
      wSrc.connect(wLp); wLp.connect(wG); wG.connect(wP); wP.connect(dest); wSrc.start();
      srcs.push(wSrc);
      let windX=-3, windDir=1;
      const windInt=setInterval(()=>{
        windX+=windDir*.03; if(Math.abs(windX)>3.5) windDir*=-1;
        try{ wP.positionX.setTargetAtTime(windX,ac.currentTime,2.5); }catch(e){}
      },80);
      timers.push({_iv:true,_id:windInt});

      /* Distant stream — very soft low noise, behind and below */
      const stBuf=noiseBuffer(ac,3,8);
      const stSrc=ac.createBufferSource(); stSrc.buffer=stBuf; stSrc.loop=true;
      const stBp=ac.createBiquadFilter(); stBp.type='bandpass'; stBp.frequency.value=600; stBp.Q.value=0.6;
      const stG=ac.createGain(); stG.gain.value=0.028;
      const stP=pan3(0,-0.8,-4);
      stSrc.connect(stBp); stBp.connect(stG); stG.connect(stP); stP.connect(dest); stSrc.start();
      srcs.push(stSrc);

      /* Birds — 4 species, each at different 3D positions */
      const BIRDS=[
        {lo:2800,hi:4200,dur:.06,gap:[100,400],cnt:[2,5], pos:[-3,1.5,-1]},   /* sparrow left-tree */
        {lo:1800,hi:2900,dur:.12,gap:[300,800],cnt:[1,3], pos:[ 3,1.2,-2]},   /* robin right-tree */
        {lo:3400,hi:5000,dur:.04,gap:[ 50,180],cnt:[3,8], pos:[ 0,2,-0.5]},   /* finch above */
        {lo:1100,hi:1700,dur:.20,gap:[1500,4000],cnt:[1,2],pos:[-1,0.5,-5]},  /* distant wood pigeon */
      ];
      function chirp(bird){
        const n=bird.cnt[0]+Math.floor(Math.random()*(bird.cnt[1]-bird.cnt[0]));
        let dt=0;
        for(let i=0;i<n;i++){
          (function(delay){
            const tid=setTimeout(()=>{
              if(!playing) return;
              const o=ac.createOscillator(),gc=ac.createGain();
              const f=bird.lo+Math.random()*(bird.hi-bird.lo);
              o.frequency.setValueAtTime(f*.88,ac.currentTime);
              o.frequency.linearRampToValueAtTime(f*1.12,ac.currentTime+bird.dur*.4);
              o.frequency.linearRampToValueAtTime(f*.93,ac.currentTime+bird.dur);
              o.type='sine';
              const bp=pan3(...bird.pos);
              o.connect(gc); gc.connect(bp); bp.connect(dest);
              env(gc,ac,.007,bird.dur*.55,bird.dur*.4,.085+Math.random()*.04);
              o.start(); o.stop(ac.currentTime+bird.dur*1.15);
            },delay);
            timers.push(tid);
          })(dt);
          dt+=bird.gap[0]+Math.random()*(bird.gap[1]-bird.gap[0]);
        }
        const nxt=setTimeout(()=>{ if(playing) chirp(bird); },dt+1400+Math.random()*4500);
        timers.push(nxt);
      }
      BIRDS.forEach(b=>setTimeout(()=>chirp(b),Math.random()*2200));

      return {
        stop(){
          srcs.forEach(s=>{try{s.stop();}catch(e){}});
          timers.forEach(t=>{ t&&t._iv?clearInterval(t._id):clearTimeout(t); });
        }
      };
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       NIGHT SOUNDSCAPE — 3D ASMR Safari Night
       • Crickets surround (L / C / R)
       • Tree frogs circling
       • Owl — double hoot, far right
       • Wolf howl — far left, full bodied
       • Lion roar — distant sub rumble, centre
       • Jungle wind sweeping
       • Water drip cave echo
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function startNight(ac, dest){
      const allOscs = [], allBufs = [], timers = [];

      /* Stereo pan helper — universal support */
      function sp(v){ const p=ac.createStereoPanner(); p.pan.value=Math.max(-1,Math.min(1,v)); return p; }

      /* Gain node shorthand */
      function gain(v){ const g=ac.createGain(); g.gain.value=v; return g; }

      /* Play through optional stereo pan */
      function route(src, gainVal, panVal){
        const g=gain(gainVal), p=sp(panVal);
        src.connect(g); g.connect(p); p.connect(dest);
        return {g,p};
      }

      /* crickets removed — too harsh */

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         TREE FROGS — cycling pan positions
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      const frogPans = [-0.85, -0.3, 0.3, 0.85];
      let frogIdx = 0;
      function frog(){
        if(!playing) return;
        const pan = sp(frogPans[frogIdx % frogPans.length]); frogIdx++;
        const g = gain(0.12);
        const o = ac.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(420, ac.currentTime);
        o.frequency.linearRampToValueAtTime(380, ac.currentTime+0.07);
        o.frequency.linearRampToValueAtTime(440, ac.currentTime+0.14);
        o.connect(g); g.connect(pan); pan.connect(dest);
        env(g, ac, 0.003, 0.07, 0.14, 0.04);
        o.start(); o.stop(ac.currentTime + 0.32);
        timers.push(setTimeout(frog, 900 + Math.random()*2200));
      }
      timers.push(setTimeout(frog, 800));
      timers.push(setTimeout(frog, 1800));

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         OWL — double hoot, far right, every ~12 s
         Clearly audible gain, rich timbre
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      function owl(){
        if(!playing) return;
        function hoot(delayMs, f1, f2){
          timers.push(setTimeout(()=>{
            if(!playing) return;
            const pan = sp(0.82);
            /* main tone */
            const o1 = ac.createOscillator(); o1.type = 'sine';
            const g1 = gain(0.28);
            o1.frequency.setValueAtTime(f1, ac.currentTime);
            o1.frequency.linearRampToValueAtTime(f2, ac.currentTime+0.4);
            o1.frequency.linearRampToValueAtTime(f1*0.94, ac.currentTime+0.85);
            o1.connect(g1); g1.connect(pan); pan.connect(dest);
            env(g1, ac, 0.06, 0.8, 0.65, 0.06);
            o1.start(); o1.stop(ac.currentTime+1.6);
            allOscs.push(o1);
            /* 2nd harmonic shimmer */
            const o2 = ac.createOscillator(); o2.type = 'sine';
            const g2 = gain(0.10);
            o2.frequency.setValueAtTime(f1*2.01, ac.currentTime);
            o2.frequency.linearRampToValueAtTime(f2*2.01, ac.currentTime+0.4);
            o2.connect(g2); g2.connect(pan); pan.connect(dest);
            env(g2, ac, 0.08, 0.6, 0.5, 0.08);
            o2.start(); o2.stop(ac.currentTime+1.4);
            allOscs.push(o2);
          }, delayMs));
        }
        hoot(0,   245, 215);
        hoot(1000, 235, 205);
        timers.push(setTimeout(owl, 12000 + Math.random()*14000));
      }
      timers.push(setTimeout(owl, 3000 + Math.random()*3000));

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         WOLF HOWL — far left, long haunting rise/fall
         Sawtooth → lowpass → highpass for body warmth
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      function wolf(){
        if(!playing) return;
        const pan = sp(-0.92);
        const o = ac.createOscillator(); o.type = 'sawtooth';
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
        const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 60;
        const g  = gain(0.38);
        /* pitch arc — rise, peak, slow tail */
        o.frequency.setValueAtTime(110,         ac.currentTime);
        o.frequency.linearRampToValueAtTime(260, ac.currentTime+1.1);
        o.frequency.linearRampToValueAtTime(310, ac.currentTime+2.2);
        o.frequency.linearRampToValueAtTime(220, ac.currentTime+3.4);
        o.frequency.linearRampToValueAtTime(140, ac.currentTime+4.8);
        o.connect(lp); lp.connect(hp); hp.connect(g); g.connect(pan); pan.connect(dest);
        env(g, ac, 0.18, 2.8, 1.8, 0.06);
        o.start(); o.stop(ac.currentTime+5.2);
        allOscs.push(o);
        /* harmonic layer for richness */
        const o2 = ac.createOscillator(); o2.type = 'sine';
        const lp2 = ac.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 400;
        const g2  = gain(0.14);
        o2.frequency.setValueAtTime(220, ac.currentTime);
        o2.frequency.linearRampToValueAtTime(520, ac.currentTime+2.2);
        o2.frequency.linearRampToValueAtTime(280, ac.currentTime+4.8);
        o2.connect(lp2); lp2.connect(g2); g2.connect(pan); pan.connect(dest);
        env(g2, ac, 0.22, 2.6, 1.6, 0.08);
        o2.start(); o2.stop(ac.currentTime+5.0);
        allOscs.push(o2);
        timers.push(setTimeout(wolf, 16000 + Math.random()*20000));
      }
      timers.push(setTimeout(wolf, 5000 + Math.random()*5000));

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         LION ROAR — deep sub rumble + mid bark burst
         Two-phase: sub growl then explosive mid burst
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      function lion(){
        if(!playing) return;
        const pan = sp(0.15); /* slightly right, feels natural */

        /* Phase 1 — sub rumble build-up */
        const oSub = ac.createOscillator(); oSub.type = 'sawtooth';
        const lpSub = ac.createBiquadFilter(); lpSub.type = 'lowpass'; lpSub.frequency.value = 160;
        const gSub  = gain(0.42);
        oSub.frequency.setValueAtTime(38,  ac.currentTime);
        oSub.frequency.linearRampToValueAtTime(68, ac.currentTime+0.6);
        oSub.frequency.linearRampToValueAtTime(52, ac.currentTime+1.3);
        oSub.frequency.linearRampToValueAtTime(42, ac.currentTime+2.2);
        oSub.connect(lpSub); lpSub.connect(gSub); gSub.connect(pan); pan.connect(dest);
        env(gSub, ac, 0.25, 1.8, 1.0, 0.08);
        oSub.start(); oSub.stop(ac.currentTime+2.8);
        allOscs.push(oSub);

        /* Phase 2 — explosive roar burst (delayed 1.4 s into rumble) */
        timers.push(setTimeout(()=>{
          if(!playing) return;
          const oMid = ac.createOscillator(); oMid.type = 'sawtooth';
          const lpMid = ac.createBiquadFilter(); lpMid.type = 'lowpass'; lpMid.frequency.value = 380;
          const hpMid = ac.createBiquadFilter(); hpMid.type = 'highpass'; hpMid.frequency.value = 55;
          const gMid  = gain(0.50);
          oMid.frequency.setValueAtTime(80,  ac.currentTime);
          oMid.frequency.linearRampToValueAtTime(120, ac.currentTime+0.3);
          oMid.frequency.linearRampToValueAtTime(72,  ac.currentTime+1.0);
          oMid.frequency.linearRampToValueAtTime(58,  ac.currentTime+1.8);
          oMid.connect(lpMid); lpMid.connect(hpMid); hpMid.connect(gMid); gMid.connect(pan); pan.connect(dest);
          env(gMid, ac, 0.04, 0.8, 1.0, 0.10);
          oMid.start(); oMid.stop(ac.currentTime+2.2);
          allOscs.push(oMid);
          /* noise crackle texture (air vibration) */
          const nBuf = noiseBuffer(ac,1,4);
          const nSrc = ac.createBufferSource(); nSrc.buffer=nBuf; nSrc.loop=false;
          const nBp  = ac.createBiquadFilter(); nBp.type='bandpass'; nBp.frequency.value=180; nBp.Q.value=0.8;
          const nG   = gain(0.18);
          nSrc.connect(nBp); nBp.connect(nG); nG.connect(pan); pan.connect(dest);
          nSrc.start(); allBufs.push(nSrc);
        }, 1400));

        timers.push(setTimeout(lion, 20000 + Math.random()*25000));
      }
      timers.push(setTimeout(lion, 8000 + Math.random()*7000));

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         JUNGLE WIND — filtered noise, slow stereo sweep
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      const wBuf = noiseBuffer(ac,6,6);
      const wSrc = ac.createBufferSource(); wSrc.buffer=wBuf; wSrc.loop=true;
      const wBp  = ac.createBiquadFilter(); wBp.type='bandpass'; wBp.frequency.value=320; wBp.Q.value=1.0;
      const wG   = gain(0.06);
      const wPan = sp(0);
      wSrc.connect(wBp); wBp.connect(wG); wG.connect(wPan); wPan.connect(dest);
      wSrc.start(); allBufs.push(wSrc);
      let windPan=0, windDir=1;
      const windIv = setInterval(()=>{
        windPan += windDir*0.015;
        if(Math.abs(windPan)>0.88) windDir*=-1;
        wPan.pan.setTargetAtTime(windPan, ac.currentTime, 1.8);
      }, 80);
      timers.push({_isInterval:true, _id:windIv});

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         WATER DRIP — sparse resonant pings, random pan
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      function drip(){
        if(!playing) return;
        const pan = sp((Math.random()-.5)*1.4);
        const o   = ac.createOscillator(); o.type='sine';
        const g   = gain(0.06);
        o.frequency.value = 620 + Math.random()*500;
        o.connect(g); g.connect(pan); pan.connect(dest);
        env(g, ac, 0.001, 0.004, 0.28, 0.018);
        o.start(); o.stop(ac.currentTime+0.35);
        timers.push(setTimeout(drip, 2800 + Math.random()*6000));
      }
      timers.push(setTimeout(drip, 1500));

      return {
        stop(){
          allOscs.forEach(o=>{ try{o.stop();}catch(e){} });
          allBufs.forEach(s=>{ try{s.stop();}catch(e){} });
          timers.forEach(t=>{
            if(t && t._isInterval) clearInterval(t._id);
            else clearTimeout(t);
          });
        }
      };
    }

    /* ── Init audio context ── */
    let ANALYSER = null; /* exposed for FFT visualiser below */

    function init(){
      if(AC) return;
      AC     = new (window.AudioContext||window.webkitAudioContext)();
      master = AC.createGain(); master.gain.value = 0.7;
      ANALYSER = AC.createAnalyser();
      ANALYSER.fftSize = 256;
      ANALYSER.smoothingTimeConstant = 0.82;
      const rev  = makeReverb(AC, 2.5, 1.8);
      const dryG = AC.createGain(); dryG.gain.value=0.60;
      const wetG = AC.createGain(); wetG.gain.value=0.40;
      master.connect(ANALYSER);
      master.connect(dryG); dryG.connect(AC.destination);
      master.connect(rev);  rev.connect(wetG); wetG.connect(AC.destination);
    }

    let activeScene = null;
    function startScene(){
      if(activeScene){ try{activeScene.stop();}catch(e){} activeScene=null; }
      if(isRain())       activeScene = startRain(AC, master);
      else if(isDay())   activeScene = startDay(AC, master);
      else               activeScene = startNight(AC, master);
    }

    /* ── Wire to top-bar .snd-btn (no floating pill) ── */
    /* Remove any old floating pill buttons that may have been injected */
    document.querySelectorAll('button[style*="bottom:1.5rem"]').forEach(el=>el.remove());

    const sndBtn = document.querySelector('.snd-btn');

    function updateSndBtn(active){
      if(!sndBtn) return;
      if(active){
        sndBtn.classList.add('on');
        sndBtn.title = 'Stop nature soundscape';
      } else {
        sndBtn.classList.remove('on');
        sndBtn.title = 'Play nature soundscape';
      }
    }

    if(sndBtn){
      sndBtn.addEventListener('click', ()=>{
        if(!playing){
          init();
          if(AC.state==='suspended') AC.resume();
          playing = true;
          startScene();
          updateSndBtn(true);
        } else {
          playing = false;
          if(activeScene){ try{activeScene.stop();}catch(e){} activeScene=null; }
          updateSndBtn(false);
        }
      });
    }

    /* Re-detect scene if theme changes at runtime */
    const obs = new MutationObserver(()=>{
      if(!playing) return;
      startScene();
    });
    obs.observe(document.body, {attributes:true, attributeFilter:['class']});

    /* Expose for FFT visualiser */
    window.__hsxSnd = { getAnalyser:()=>ANALYSER, isPlaying:()=>playing };
  })();

  /* ============================================================
     ⑬b  FFT SOUND VISUALISER — translucent frequency bars behind
          the hero text. Only visible while sound is playing.
          Uses AnalyserNode from the nature soundscape engine.
     ============================================================ */
  (function(){
    const hero = document.querySelector('.hero-card');
    if(!hero) return;

    const cv  = document.createElement('canvas');
    cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;border-radius:inherit;opacity:0;transition:opacity .6s ease;';
    /* hero-card needs position:relative — add if missing */
    const hcs = getComputedStyle(hero).position;
    if(hcs==='static') hero.style.position='relative';
    hero.insertBefore(cv, hero.firstChild);

    let rafId=null;

    function drawBars(){
      const snd = window.__hsxSnd;
      if(!snd || !snd.getAnalyser() || !snd.isPlaying()){
        cv.style.opacity='0';
        rafId = requestAnimationFrame(drawBars);
        return;
      }
      cv.style.opacity='1';
      const analyser = snd.getAnalyser();
      const W=cv.offsetWidth, H=cv.offsetHeight;
      if(cv.width!==W||cv.height!==H){ cv.width=W; cv.height=H; }
      const ctx2=cv.getContext('2d');
      const bins=new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(bins);
      ctx2.clearRect(0,0,W,H);
      const night=document.body.classList.contains('is-night');
      const BAR_COUNT=40;
      const step=Math.floor(bins.length/BAR_COUNT);
      const barW=W/BAR_COUNT;
      for(let i=0;i<BAR_COUNT;i++){
        let val=0;
        for(let j=0;j<step;j++) val+=bins[i*step+j];
        val/=step;
        const norm=val/255;
        const barH=norm*H*0.72;
        const x=i*barW;
        /* Gradient per bar — bottom anchored */
        const grd=ctx2.createLinearGradient(x,H,x,H-barH);
        if(night){
          grd.addColorStop(0,'rgba(80,180,255,0.18)');
          grd.addColorStop(1,'rgba(160,220,255,0.04)');
        } else {
          grd.addColorStop(0,'rgba(255,255,255,0.22)');
          grd.addColorStop(1,'rgba(200,220,255,0.04)');
        }
        ctx2.fillStyle=grd;
        const rx=3;
        ctx2.beginPath();
        ctx2.moveTo(x+rx,H); ctx2.lineTo(x+barW-rx,H);
        ctx2.lineTo(x+barW-rx,H-barH+rx);
        ctx2.quadraticCurveTo(x+barW-rx,H-barH,x+barW/2,H-barH);
        ctx2.quadraticCurveTo(x+rx,H-barH,x+rx,H-barH+rx);
        ctx2.lineTo(x+rx,H); ctx2.fill();
      }
      rafId=requestAnimationFrame(drawBars);
    }
    drawBars();
  })();

  /* ============================================================
     ⑭ REAL-TIME VISITOR GLOBE
     Canvas 2D spherical projection — no Three.js dependency.
     • Fetches visitor's real IP geolocation (ipapi.co — free)
     • Shows 18 seed city dots for a "global activity" feel
     • Visitor dot pulses in a distinct accent colour
     • Auto-rotates, pauses on hover
     • Real visit count via counterapi.dev (free, no auth)
     • NO panel box — naked transparent globe sphere floating
       to the RIGHT of the hero-card in hero-row layout
     ============================================================ */
  (function(){
    const isHome = !location.pathname.split('/').pop() ||
                   /^(index\.html)?$/.test(location.pathname.split('/').pop());
    if(!isHome) return;

    /* ── Inject CSS — globe lives INSIDE hero-card as a right-side inset ── */
    const gst = document.createElement('style');
    gst.textContent = `
      /* hero-card becomes flex row to fit globe on right */
      .hero-card.has-globe{
        display:flex;flex-direction:row;align-items:stretch;gap:0;padding:0;overflow:hidden;
      }
      .hero-card-content{
        flex:1 1 0;min-width:0;
        padding:clamp(1.4rem,3vw,2.4rem);
        display:flex;flex-direction:column;justify-content:center;
      }
      .globe-float{
        flex:0 0 200px;width:200px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:.4rem;padding:1rem .6rem;
        border-left:1px solid rgba(255,255,255,.14);
        background:rgba(255,255,255,.04);
      }
      .globe-cv{border-radius:50%;display:block;}
      .globe-label{
        font-family:'Orbitron',sans-serif;font-size:.52rem;letter-spacing:.12em;
        text-transform:uppercase;opacity:.45;text-align:center;
      }
      .globe-counter{
        font-family:'Orbitron',sans-serif;font-size:.95rem;font-weight:900;
        letter-spacing:.06em;text-align:center;
        background:linear-gradient(135deg,#4fc3f7,#a78bfa);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      }
      .globe-live-badge{
        display:inline-flex;align-items:center;gap:.3rem;
        font-size:.5rem;letter-spacing:.1em;text-transform:uppercase;
        background:rgba(60,220,100,.18);border:1px solid rgba(60,220,100,.4);
        border-radius:999px;padding:.15rem .5rem;color:#3ddc6e;
      }
      .globe-live-dot{
        width:5px;height:5px;border-radius:50%;background:#3ddc6e;
        animation:livePulse 1.4s ease-in-out infinite;
      }
      @keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
      .globe-city-clock{
        font-family:'Orbitron',sans-serif;font-size:.68rem;font-weight:700;
        letter-spacing:.07em;text-align:center;
        background:linear-gradient(135deg,#f7c948,#ff9d5c);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      }
      .globe-city-name{ font-size:.5rem;letter-spacing:.11em;text-transform:uppercase;opacity:.5;text-align:center; }
      @media(max-width:700px){
        .hero-card.has-globe{flex-direction:column;}
        .globe-float{flex:none;width:100%;border-left:none;border-top:1px solid rgba(255,255,255,.14);flex-direction:row;justify-content:space-around;padding:.8rem 1rem;}
      }
    `;
    document.head.appendChild(gst);

    /* ── Container ── */
    const wrap = document.createElement('div');
    wrap.className = 'globe-float';
    wrap.innerHTML = `
      <canvas class="globe-cv" id="globe-cv" width="160" height="160" aria-label="Live visitor globe"></canvas>
      <div class="globe-live-badge"><span class="globe-live-dot"></span>1 online now</div>
      <div class="globe-counter" id="globe-count">—</div>
      <div class="globe-label" id="globe-label">total visits</div>
      <div class="globe-city-clock" id="globe-city-clock"></div>
      <div class="globe-city-name" id="globe-city-name"></div>
    `;

    /* Move hero-card children into .hero-card-content wrapper, then append globe */
    const heroCard = document.querySelector('.hero-card');
    if(heroCard){
      heroCard.classList.add('has-globe');
      const content = document.createElement('div');
      content.className = 'hero-card-content';
      /* Move all existing children into content div */
      while(heroCard.firstChild) content.appendChild(heroCard.firstChild);
      heroCard.appendChild(content);
      heroCard.appendChild(wrap);
    } else {
      document.querySelector('main.container')?.prepend(wrap);
    }

    const cv  = document.getElementById('globe-cv');
    const ctx = cv.getContext('2d');
    const R   = 70;
    const CX  = 80, CY = 80;
    const S   = 160; /* canvas size */

    const CITIES = [
      [51.5,-0.1],[40.7,-74.0],[35.7,139.7],[48.9,2.3],[37.8,-122.4],
      [-33.9,151.2],[55.8,37.6],[28.6,77.2],[-23.5,-46.6],[19.4,-99.1],
      [1.4,103.8],[30.0,31.2],[52.4,13.4],[41.0,28.9],[34.0,-118.2],
      [-26.2,28.0],[45.5,-73.6],[39.9,116.4],[6.5,3.4],[24.7,46.7],
    ];

    let rotY = 0, autoRot = true;
    let visitorDot = null;

    function project(lat, lng){
      const phi   = (90 - lat) * Math.PI / 180;
      const theta = (lng + rotY * 180/Math.PI) * Math.PI / 180;
      const x3 = R * Math.sin(phi) * Math.cos(theta);
      const y3 = R * Math.cos(phi);
      const z3 = R * Math.sin(phi) * Math.sin(theta);
      if(z3 < -2) return null;
      return { x:CX+x3, y:CY-y3, depth:Math.max(0,(z3+R)/(R*2)) };
    }

    function draw(){
      const night = document.body.classList.contains('is-night');
      ctx.clearRect(0,0,S,S);

      /* Atmosphere glow behind sphere */
      const atmo = ctx.createRadialGradient(CX,CY,R*0.88,CX,CY,R*1.18);
      atmo.addColorStop(0, night?'rgba(40,100,255,.10)':'rgba(100,180,255,.12)');
      atmo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(CX,CY,R*1.18,0,Math.PI*2);
      ctx.fillStyle=atmo; ctx.fill();

      /* Sphere body */
      const sphere = ctx.createRadialGradient(CX-22,CY-24,4,CX,CY,R);
      if(night){
        sphere.addColorStop(0,'rgba(50,90,180,.62)');
        sphere.addColorStop(0.55,'rgba(14,24,70,.52)');
        sphere.addColorStop(1,'rgba(4,8,32,.70)');
      } else {
        sphere.addColorStop(0,'rgba(170,220,255,.55)');
        sphere.addColorStop(0.55,'rgba(90,150,220,.35)');
        sphere.addColorStop(1,'rgba(50,90,180,.52)');
      }
      ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2);
      ctx.fillStyle=sphere; ctx.fill();

      /* Grid lines */
      const ga = night?.09:.06;
      ctx.lineWidth=.5;
      ctx.strokeStyle=`rgba(${night?'110,170,255':'80,130,210'},${ga})`;
      for(let lon=0;lon<360;lon+=30){
        ctx.beginPath(); let f=true;
        for(let la=-90;la<=90;la+=4){
          const p=project(la,lon); if(!p){f=true;continue;}
          f?(ctx.moveTo(p.x,p.y),f=false):ctx.lineTo(p.x,p.y);
        } ctx.stroke();
      }
      for(let la=-60;la<=60;la+=30){
        ctx.beginPath(); let f=true;
        for(let lon=0;lon<=360;lon+=4){
          const p=project(la,lon); if(!p){f=true;continue;}
          f?(ctx.moveTo(p.x,p.y),f=false):ctx.lineTo(p.x,p.y);
        } ctx.stroke();
      }

      /* Rim highlight */
      const rim=ctx.createRadialGradient(CX,CY,R*.80,CX,CY,R);
      rim.addColorStop(0,'transparent');
      rim.addColorStop(1,night?'rgba(80,160,255,.28)':'rgba(140,200,255,.22)');
      ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2);
      ctx.fillStyle=rim; ctx.fill();

      /* Specular highlight */
      const spec=ctx.createRadialGradient(CX-28,CY-28,0,CX-28,CY-28,48);
      spec.addColorStop(0,night?'rgba(160,200,255,.15)':'rgba(255,255,255,.22)');
      spec.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2); ctx.fillStyle=spec; ctx.fill();

      /* City dots */
      const now=Date.now();
      CITIES.forEach(([la,lon])=>{
        const p=project(la,lon); if(!p) return;
        const a=.30+p.depth*.55, sz=1.4+p.depth*2.2;
        ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,Math.PI*2);
        ctx.fillStyle=night?`rgba(80,180,255,${a})`:`rgba(60,120,230,${a})`; ctx.fill();
      });

      /* Visitor dot */
      if(visitorDot){
        const p=project(visitorDot.lat,visitorDot.lng);
        if(p){
          const pulse=.55+.45*Math.sin(now*.0038);
          const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,12);
          grd.addColorStop(0,`rgba(255,210,60,${.55*pulse})`);
          grd.addColorStop(1,'rgba(255,210,60,0)');
          ctx.beginPath(); ctx.arc(p.x,p.y,12,0,Math.PI*2);
          ctx.fillStyle=grd; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x,p.y,3.8*pulse,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,230,80,${.9*pulse})`; ctx.fill();
        }
      }

      if(autoRot) rotY+=.003;
      requestAnimationFrame(draw);
    }

    cv.addEventListener('mouseenter',()=>{ autoRot=false; });
    cv.addEventListener('mouseleave',()=>{ autoRot=true; });
    draw();

    const countEl = document.getElementById('globe-count');
    const labelEl = document.getElementById('globe-label');

    /* ── Real visit counter (counterapi.dev — free, no auth) ── */
    fetch('https://api.counterapi.dev/v1/inhasnain-studio-x/pageviews/up')
      .then(r=>r.json())
      .then(d=>{
        if(d && d.count != null){
          /* Animate count-up */
          const target = d.count;
          const t0 = performance.now();
          const dur = 1200;
          (function tick(now){
            const p = Math.min((now-t0)/dur,1);
            countEl.textContent = Math.round(p*target).toLocaleString();
            if(p<1) requestAnimationFrame(tick);
          })(t0);
        }
      })
      .catch(()=>{ countEl.textContent = '—'; });

    /* ── Real IP geolocation + live city clock ── */
    const cityClockEl = document.getElementById('globe-city-clock');
    const cityNameEl  = document.getElementById('globe-city-name');
    let cityTimezone  = null;

    fetch('https://ipapi.co/json/')
      .then(r=>r.json())
      .then(d=>{
        if(!d.latitude||!d.longitude) return;
        visitorDot   = { lat:d.latitude, lng:d.longitude };
        rotY         = -d.longitude * Math.PI/180;
        cityTimezone = d.timezone || null;
        const city   = d.city || d.region || d.country_name || '';
        labelEl.textContent = `total visits`;
        if(city && cityNameEl){
          cityNameEl.textContent = `📍 ${city}`;
          cityNameEl.style.opacity = '1';
        }
        /* Start live clock for visitor's city */
        if(cityTimezone && cityClockEl){
          cityClockEl.style.opacity='1';
          function tickClock(){
            try{
              const t = new Date().toLocaleTimeString('en-GB',{
                timeZone:cityTimezone,
                hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false
              });
              cityClockEl.textContent = t;
            }catch(e){
              cityClockEl.textContent='';
            }
          }
          tickClock();
          setInterval(tickClock,1000);
        }
      })
      .catch(()=>{});
  })();

  /* ============================================================
     ⑮ PROCEDURAL PARTICLE CONSTELLATION  (hero section)
     200 floating particles that form constellations when near
     each other. Mouse cursor creates a gravitational void —
     particles flee and reform beautifully. Stars pulse.
     Colour adapts to day/night theme.
     ============================================================ */
  (function(){
    /* ── CSS ── */
    const pst = document.createElement('style');
    pst.textContent = `
      .constellation-cv{
        position:absolute;inset:0;width:100%;height:100%;
        border-radius:inherit;pointer-events:none;z-index:0;
        opacity:.75;
      }
      .hero-card{position:relative;overflow:hidden;}
      .hero-card > *:not(.constellation-cv){position:relative;z-index:1;}
    `;
    document.head.appendChild(pst);

    const heroCard = document.querySelector('.hero-card');
    if(!heroCard) return;

    const cv  = document.createElement('canvas');
    cv.className = 'constellation-cv';
    heroCard.insertBefore(cv, heroCard.firstChild);

    const ctx = cv.getContext('2d');
    let W, H, mouse = { x:-999, y:-999 };
    const N = 200;
    const particles = [];
    const night = ()=> document.body.classList.contains('is-night');

    function resize(){
      const r = heroCard.getBoundingClientRect();
      W = cv.width  = r.width;
      H = cv.height = r.height;
      /* Re-clamp particles to new bounds */
      particles.forEach(p=>{
        p.x = Math.min(p.x, W);
        p.y = Math.min(p.y, H);
      });
    }

    /* Init particles */
    for(let i = 0; i < N; i++){
      particles.push({
        x:  Math.random() * 900,
        y:  Math.random() * 400,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r:  0.8 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.025,
      });
    }

    resize();
    addEventListener('resize', ()=>{ resize(); });

    heroCard.addEventListener('mousemove', e=>{
      const r = heroCard.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    heroCard.addEventListener('mouseleave', ()=>{ mouse.x = -999; mouse.y = -999; });

    const LINK_DIST   = 110; /* px — max line distance */
    const REPEL_DIST  = 90;  /* px — mouse repel radius */
    const REPEL_FORCE = 2.2;
    const MAX_SPEED   = 1.8;
    let t = 0;

    function frame(){
      if(W === 0 || H === 0){ resize(); }
      ctx.clearRect(0, 0, W, H);
      const isNight = night();

      /* Update particles */
      particles.forEach(p=>{
        /* Mouse repulsion */
        const dx   = p.x - mouse.x;
        const dy   = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if(dist < REPEL_DIST && dist > 0){
          const force = (1 - dist/REPEL_DIST) * REPEL_FORCE;
          p.vx += (dx/dist) * force * 0.3;
          p.vy += (dy/dist) * force * 0.3;
        }

        /* Velocity damping */
        p.vx *= 0.985;
        p.vy *= 0.985;

        /* Clamp speed */
        const spd = Math.hypot(p.vx, p.vy);
        if(spd > MAX_SPEED){ p.vx = p.vx/spd*MAX_SPEED; p.vy = p.vy/spd*MAX_SPEED; }

        p.x += p.vx;
        p.y += p.vy;

        /* Wrap edges */
        if(p.x < 0) p.x = W; if(p.x > W) p.x = 0;
        if(p.y < 0) p.y = H; if(p.y > H) p.y = 0;
      });

      /* Draw connections */
      for(let i = 0; i < N; i++){
        for(let j = i+1; j < N; j++){
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if(dist > LINK_DIST) continue;
          const alpha = (1 - dist/LINK_DIST) * (isNight ? 0.28 : 0.18);
          ctx.strokeStyle = isNight
            ? `rgba(120,190,255,${alpha.toFixed(3)})`
            : `rgba(80,120,220,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      /* Draw particles */
      particles.forEach((p, i)=>{
        p.phase += p.speed;
        const pulse = 0.6 + 0.4 * Math.sin(p.phase);
        const r     = p.r * pulse;
        const alpha = 0.5 + 0.45 * pulse;

        /* Glow */
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.5);
        g.addColorStop(0,   isNight ? `rgba(140,200,255,${alpha*0.55})` : `rgba(100,140,240,${alpha*0.45})`);
        g.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI*2);
        ctx.fillStyle = g; ctx.fill();

        /* Core */
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2);
        ctx.fillStyle = isNight
          ? `rgba(180,220,255,${alpha})`
          : `rgba(140,170,255,${alpha})`;
        ctx.fill();
      });

      t++;
      requestAnimationFrame(frame);
    }

    /* Wait for hero to have dimensions */
    setTimeout(()=>{ resize(); frame(); }, 200);
  })();

  /* ============================================================
     ⑯ MORPHING SVG TOPOGRAPHY BACKGROUND — disabled (luxury glass mode)
     ============================================================ */
  (function(){
    return; /* removed — clean liquid glass background replaces this */
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden','true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-2;pointer-events:none;';
    const grid = document.querySelector('.bg-grid');
    if(grid) document.body.insertBefore(cv, grid);
    else document.body.prepend(cv);

    const ctx = cv.getContext('2d');
    let W, H, t = 0;
    function resize(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
    resize(); addEventListener('resize', resize, {passive:true});

    /* Each band = one contour level. Displaced by multi-octave sine field */
    const BANDS = 28;

    /* Per-band random seed parameters */
    const seeds = Array.from({length:BANDS}, (_,i) => ({
      f1:  0.0012 + Math.random()*0.0018,
      f2:  0.0028 + Math.random()*0.0022,
      f3:  0.0055 + Math.random()*0.0035,
      ph1: Math.random()*Math.PI*2,
      ph2: Math.random()*Math.PI*2,
      ph3: Math.random()*Math.PI*2,
      spd: 0.18 + Math.random()*0.22,
      A1:  18 + Math.random()*22,
      A2:  9  + Math.random()*14,
      A3:  4  + Math.random()*7,
    }));

    function frame(){
      ctx.clearRect(0,0,W,H);
      const night = document.body.classList.contains('is-night');

      /* Colour palette */
      const palette = night
        ? [ /* ocean depth blues */
            [8,  28, 72,  0.028],
            [12, 38, 98,  0.024],
            [18, 55, 130, 0.020],
            [25, 72, 160, 0.016],
          ]
        : [ /* warm sand/amber */
            [180,140,80,  0.022],
            [200,160,90,  0.018],
            [160,120,60,  0.015],
            [220,180,110, 0.012],
          ];

      BANDS.valueOf(); /* noop for linter */
      for(let bi=0; bi<BANDS; bi++){
        const s     = seeds[bi];
        const yBase = (bi / (BANDS-1)) * H;
        const col   = palette[bi % palette.length];
        const tt    = t * s.spd;

        ctx.beginPath();
        let first = true;
        for(let x=0; x<=W; x+=5){
          const dy = s.A1 * Math.sin(s.f1*x + s.ph1 + tt)
                   + s.A2 * Math.sin(s.f2*x + s.ph2 + tt*0.71)
                   + s.A3 * Math.sin(s.f3*x + s.ph3 + tt*1.33);
          const y  = yBase + dy;
          if(first){ ctx.moveTo(x,y); first=false; }
          else ctx.lineTo(x,y);
        }
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${col[3]})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }

      t += 0.008;
      requestAnimationFrame(frame);
    }
    frame();
  })();

  /* WebGL fluid simulation removed — cursor colour effect removed */
  /* ============================================================
     ⑰ WEBGL FLUID SIMULATION — DISABLED
     ============================================================ */
  (function(){
    return; /* disabled — removed cursor colour trail */
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden','true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;';
    document.body.appendChild(cv);

    const gl = cv.getContext('webgl', {alpha:true, premultipliedAlpha:false, antialias:false});
    if(!gl){ cv.remove(); return; }

    const SIM = 128; /* simulation resolution — small = fast */
    const DYE = 256; /* dye texture resolution */

    cv.width = cv.height = 1; /* actual size set in resize */
    let W, H;
    function resize(){
      W = innerWidth; H = innerHeight;
      cv.width = W; cv.height = H;
      gl.viewport(0,0,W,H);
    }
    resize(); addEventListener('resize', resize, {passive:true});

    /* ── Shader sources ── */
    const VS = `
      attribute vec2 aP;
      varying   vec2 vU;
      void main(){ vU=(aP+1.0)*0.5; gl_Position=vec4(aP,0,1); }
    `;
    const baseFS = (body) => `
      precision mediump float;
      varying vec2 vU;
      ${body}
    `;

    const ADVECT_FS = baseFS(`
      uniform sampler2D uV, uQ;
      uniform vec2 tS; uniform float dt, dis;
      void main(){
        vec2 pos = vU - dt * texture2D(uV, vU).xy * tS;
        gl_FragColor = dis * texture2D(uQ, pos);
      }
    `);
    const SPLAT_FS = baseFS(`
      uniform sampler2D uT;
      uniform vec2 pt; uniform vec3 col; uniform float rad;
      void main(){
        float d  = distance(vU, pt);
        vec3  sp = col * exp(-d*d/(rad*rad));
        gl_FragColor = vec4(texture2D(uT,vU).rgb + sp, 1.0);
      }
    `);
    const DIV_FS = baseFS(`
      uniform sampler2D uV; uniform vec2 tS;
      void main(){
        float L=texture2D(uV,vU-vec2(tS.x,0)).x,
              R=texture2D(uV,vU+vec2(tS.x,0)).x,
              B=texture2D(uV,vU-vec2(0,tS.y)).y,
              T=texture2D(uV,vU+vec2(0,tS.y)).y;
        gl_FragColor=vec4(0.5*(R-L+T-B),0,0,1);
      }
    `);
    const PRES_FS = baseFS(`
      uniform sampler2D uP, uD; uniform vec2 tS;
      void main(){
        float L=texture2D(uP,vU-vec2(tS.x,0)).x,
              R=texture2D(uP,vU+vec2(tS.x,0)).x,
              B=texture2D(uP,vU-vec2(0,tS.y)).x,
              T=texture2D(uP,vU+vec2(0,tS.y)).x,
              div=texture2D(uD,vU).x;
        gl_FragColor=vec4((L+R+B+T-div)*0.25,0,0,1);
      }
    `);
    const GRAD_FS = baseFS(`
      uniform sampler2D uV, uP; uniform vec2 tS;
      void main(){
        vec2 v=texture2D(uV,vU).xy;
        float L=texture2D(uP,vU-vec2(tS.x,0)).x,
              R=texture2D(uP,vU+vec2(tS.x,0)).x,
              B=texture2D(uP,vU-vec2(0,tS.y)).x,
              T=texture2D(uP,vU+vec2(0,tS.y)).x;
        v -= 0.5*vec2(R-L,T-B);
        gl_FragColor=vec4(v,0,1);
      }
    `);
    const DISP_FS = baseFS(`
      uniform sampler2D uD;
      void main(){
        vec3 c=texture2D(uD,vU).rgb;
        gl_FragColor=vec4(c, length(c)*0.65);
      }
    `);

    function compileShader(type, src){
      const s = gl.createShader(type);
      gl.shaderSource(s,src); gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function makeProgram(vsSrc, fsSrc){
      const p = gl.createProgram();
      gl.attachShader(p, compileShader(gl.VERTEX_SHADER,   vsSrc));
      gl.attachShader(p, compileShader(gl.FRAGMENT_SHADER, fsSrc));
      gl.linkProgram(p);
      return p;
    }

    const pAdvect = makeProgram(VS, ADVECT_FS);
    const pSplat  = makeProgram(VS, SPLAT_FS);
    const pDiv    = makeProgram(VS, DIV_FS);
    const pPres   = makeProgram(VS, PRES_FS);
    const pGrad   = makeProgram(VS, GRAD_FS);
    const pDisp   = makeProgram(VS, DISP_FS);

    /* Fullscreen quad */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    function useProgram(p){
      gl.useProgram(p);
      const loc = gl.getAttribLocation(p,'aP');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      return p;
    }

    /* FBO helper */
    function makeFBO(w,h, linear){
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D,tex);
      const filt = linear?gl.LINEAR:gl.NEAREST;
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filt);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filt);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
      return {tex,fb,w,h};
    }

    /* Double-buffered FBO */
    function makeDoubleFBO(w,h,linear){
      return { a:makeFBO(w,h,linear), b:makeFBO(w,h,linear),
        swap(){ const t=this.a;this.a=this.b;this.b=t; } };
    }

    let velocity  = makeDoubleFBO(SIM,SIM,true);
    let dye       = makeDoubleFBO(DYE,DYE,true);
    let divergence= makeFBO(SIM,SIM,false);
    let pressure  = makeDoubleFBO(SIM,SIM,false);

    function bindTex(unit,tex){ gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,tex); }
    function uni1i(p,n,v){ gl.uniform1i(gl.getUniformLocation(p,n),v); }
    function uni1f(p,n,v){ gl.uniform1f(gl.getUniformLocation(p,n),v); }
    function uni2f(p,n,x,y){ gl.uniform2f(gl.getUniformLocation(p,n),x,y); }
    function uni3f(p,n,x,y,z){ gl.uniform3f(gl.getUniformLocation(p,n),x,y,z); }

    function drawTo(fbo){
      if(fbo){ gl.bindFramebuffer(gl.FRAMEBUFFER,fbo.fb); gl.viewport(0,0,fbo.w,fbo.h); }
      else    { gl.bindFramebuffer(gl.FRAMEBUFFER,null);  gl.viewport(0,0,W,H); }
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }

    let mx=0, my=0, pmx=0, pmy=0;
    document.addEventListener('pointermove',e=>{
      pmx=mx; pmy=my;
      mx=e.clientX/W; my=1.0-e.clientY/H;
    },{passive:true});

    const night = ()=>document.body.classList.contains('is-night');
    let frameCount = 0;

    function step(){
      const dt   = 0.016;
      const vTS  = [1/SIM, 1/SIM];
      const dTS  = [1/DYE, 1/DYE];
      const dvx  = (mx-pmx)*5, dvy=(my-pmy)*5;
      const spd  = Math.hypot(dvx,dvy);

      /* Splat velocity */
      if(spd > 0.0002){
        useProgram(pSplat);
        bindTex(0,velocity.a.tex); uni1i(pSplat,'uT',0);
        uni2f(pSplat,'pt',mx,my);
        uni3f(pSplat,'col',dvx*12,dvy*12,0);
        uni1f(pSplat,'rad',0.012);
        drawTo(velocity.b); velocity.swap();

        /* Splat dye with time-of-day colour */
        const n = night();
        const cr = n?0.04:0.22, cg=n?0.12:0.18, cb=n?0.35:0.08;
        useProgram(pSplat);
        bindTex(0,dye.a.tex); uni1i(pSplat,'uT',0);
        uni2f(pSplat,'pt',mx,my);
        uni3f(pSplat,'col',cr*spd*180,cg*spd*180,cb*spd*180);
        uni1f(pSplat,'rad',0.009);
        drawTo(dye.b); dye.swap();
        pmx=mx; pmy=my;
      }

      /* Advect velocity */
      useProgram(pAdvect);
      bindTex(0,velocity.a.tex); uni1i(pAdvect,'uV',0);
      bindTex(1,velocity.a.tex); uni1i(pAdvect,'uQ',1);
      uni2f(pAdvect,'tS',...vTS); uni1f(pAdvect,'dt',dt); uni1f(pAdvect,'dis',0.997);
      drawTo(velocity.b); velocity.swap();

      /* Advect dye */
      bindTex(0,velocity.a.tex); uni1i(pAdvect,'uV',0);
      bindTex(1,dye.a.tex);      uni1i(pAdvect,'uQ',1);
      uni2f(pAdvect,'tS',...dTS); uni1f(pAdvect,'dis',0.992);
      drawTo(dye.b); dye.swap();

      /* Divergence */
      useProgram(pDiv);
      bindTex(0,velocity.a.tex); uni1i(pDiv,'uV',0);
      uni2f(pDiv,'tS',...vTS);
      drawTo(divergence);

      /* Pressure Jacobi iterations */
      useProgram(pPres);
      for(let i=0;i<20;i++){
        bindTex(0,pressure.a.tex); uni1i(pPres,'uP',0);
        bindTex(1,divergence.tex);  uni1i(pPres,'uD',1);
        uni2f(pPres,'tS',...vTS);
        drawTo(pressure.b); pressure.swap();
      }

      /* Gradient subtract */
      useProgram(pGrad);
      bindTex(0,velocity.a.tex); uni1i(pGrad,'uV',0);
      bindTex(1,pressure.a.tex);  uni1i(pGrad,'uP',1);
      uni2f(pGrad,'tS',...vTS);
      drawTo(velocity.b); velocity.swap();

      /* Display dye to screen */
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      useProgram(pDisp);
      bindTex(0,dye.a.tex); uni1i(pDisp,'uD',0);
      drawTo(null);
      gl.disable(gl.BLEND);

      frameCount++;
      requestAnimationFrame(step);
    }
    step();
  })();

  /* 3D Product Showcase removed — user requested no 3D drag elements */
  (function(){
    return; /* disabled */
    if(location.pathname.split('/').pop() !== 'pctunex.html') return;

    /* Lazy-load Three.js r158 from CDN */
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    script.onload = initShowcases;

    function initShowcases(){
      const THREE = window.THREE;
      if(!THREE) return;

      const cards = document.querySelectorAll('.section .grid .card');
      const targets = [
        { card: cards[0], type: 'laptop'    }, /* PC TuneX */
        { card: cards[1], type: 'headphones'}, /* SpatiaX  */
      ];

      /* CSS for canvas container */
      const sty = document.createElement('style');
      sty.textContent = `
        .product-3d-wrap{
          width:100%;height:160px;border-radius:12px;overflow:hidden;
          margin-top:1rem;cursor:grab;
          background:transparent;position:relative;
        }
        .product-3d-wrap canvas{width:100%!important;height:100%!important;display:block;}
        .product-3d-label{
          position:absolute;bottom:6px;right:10px;
          font-size:.6rem;opacity:.35;letter-spacing:.08em;font-family:'Orbitron',sans-serif;
          text-transform:uppercase;pointer-events:none;
        }
      `;
      document.head.appendChild(sty);

      const night = document.body.classList.contains('is-night');

      targets.forEach(({card, type})=>{
        if(!card) return;

        const wrap = document.createElement('div');
        wrap.className = 'product-3d-wrap';
        const lbl = document.createElement('div');
        lbl.className = 'product-3d-label';
        lbl.textContent = '3D · drag to rotate';
        wrap.appendChild(lbl);
        card.appendChild(wrap);

        /* Scene */
        const scene    = new THREE.Scene();
        const camera   = new THREE.PerspectiveCamera(38, 2, 0.1, 100);
        camera.position.set(0, 0.5, 4.5);
        const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
        renderer.setPixelRatio(Math.min(devicePixelRatio,2));
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(wrap.clientWidth||320, 160);
        wrap.insertBefore(renderer.domElement, lbl);

        /* Lights */
        const ambient = new THREE.AmbientLight(0xffffff, night?0.45:0.65);
        scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(night?0x8899ff:0xfff0e0, night?1.2:1.5);
        dirLight.position.set(night?-2:3, 2, night?-1:2);
        scene.add(dirLight);
        const rimLight = new THREE.DirectionalLight(night?0x4466cc:0xff9944, 0.4);
        rimLight.position.set(-3,-1,1);
        scene.add(rimLight);

        /* Material */
        const mat = new THREE.MeshStandardMaterial({
          color:       night ? 0x223366 : 0xe8f4ff,
          metalness:   0.72,
          roughness:   0.18,
          envMapIntensity: 1.0,
        });
        const accentMat = new THREE.MeshStandardMaterial({
          color:   night ? 0x4488ff : 0x2244cc,
          metalness: 0.9, roughness: 0.1,
        });

        /* Pivot group for mouse rotation */
        const pivot = new THREE.Group();
        scene.add(pivot);

        if(type === 'laptop'){
          /* Base */
          const base = new THREE.Mesh(new THREE.BoxGeometry(2.6,0.08,1.8), mat);
          base.position.y=-0.5;
          /* Screen panel */
          const screen = new THREE.Mesh(new THREE.BoxGeometry(2.55,1.6,0.06), mat);
          screen.position.set(0,0.3,-0.87);
          screen.rotation.x = -0.22;
          /* Screen face (slightly darker) */
          const screenFace = new THREE.Mesh(
            new THREE.PlaneGeometry(2.3,1.42),
            new THREE.MeshStandardMaterial({color:0x0a0f1e,roughness:0.8,metalness:0})
          );
          screenFace.position.set(0,0.3,-0.83);
          screenFace.rotation.x=-0.22;
          /* Keyboard */
          const keyboard = new THREE.Mesh(new THREE.BoxGeometry(2.2,0.01,1.4), accentMat);
          keyboard.position.set(0,-0.46,0.1);
          /* Logo disc */
          const logo = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.02,32), accentMat);
          logo.position.set(0,0.29,-1.14);
          logo.rotation.x=-0.22;
          pivot.add(base, screen, screenFace, keyboard, logo);
        } else {
          /* Headphones: headband arc + two ear cups */
          const band = new THREE.Mesh(
            new THREE.TorusGeometry(0.9,0.07,16,80,Math.PI),
            mat
          );
          band.rotation.z = Math.PI;
          band.position.y = 0.5;

          function earCup(side){
            const g = new THREE.Group();
            const cup  = new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.20,32), mat);
            cup.rotation.z = Math.PI/2;
            const inner= new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.06,32), accentMat);
            inner.rotation.z = Math.PI/2;
            inner.position.x = side * 0.12;
            const stem = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.42,0.06), mat);
            stem.position.y = 0.22;
            g.add(cup, inner, stem);
            g.position.set(side*0.9, -0.2, 0);
            return g;
          }
          pivot.add(band, earCup(1), earCup(-1));
        }

        /* Mouse interaction */
        let targetRX=0, targetRY=0, currentRX=0, currentRY=0;
        let dragging=false, lastMX=0, lastMY=0;

        wrap.addEventListener('mousedown', e=>{ dragging=true; lastMX=e.clientX; lastMY=e.clientY; wrap.style.cursor='grabbing'; });
        addEventListener('mouseup',()=>{ dragging=false; wrap.style.cursor='grab'; });
        wrap.addEventListener('mousemove', e=>{
          if(dragging){
            targetRY += (e.clientX-lastMX)*0.012;
            targetRX += (e.clientY-lastMY)*0.008;
            lastMX=e.clientX; lastMY=e.clientY;
          } else {
            const r = wrap.getBoundingClientRect();
            targetRY = ((e.clientX-r.left)/r.width - 0.5) * 0.7;
            targetRX = ((e.clientY-r.top)/r.height  - 0.5) * 0.4;
          }
        });
        wrap.addEventListener('mouseleave',()=>{ if(!dragging){ targetRX=0; targetRY=0; } });

        /* Render loop */
        let raf;
        function animate(){
          raf = requestAnimationFrame(animate);
          currentRX += (targetRX - currentRX) * 0.08;
          currentRY += (targetRY - currentRY) * 0.08;
          pivot.rotation.x = currentRX - 0.15;
          pivot.rotation.y = currentRY + (type==='headphones' ? 0 : 0.35);
          if(!dragging) pivot.rotation.y += 0.004; /* slow auto-spin */
          renderer.render(scene, camera);
        }
        animate();

        /* Resize */
        new ResizeObserver(()=>{
          const w = wrap.clientWidth;
          renderer.setSize(w, 160);
          camera.aspect = w/160;
          camera.updateProjectionMatrix();
        }).observe(wrap);
      });
    }
  })();

  /* ============================================================
     HSX AI CHAT  — floating glass button + slide-over panel
     Rule-based chatbot with full product knowledge.
     No external API needed — instant responses.
     ============================================================ */
  (function(){
    /* ── Knowledge base ── */
    const KB = [
      /* PC TuneX */
      { q:/pc\s*tune\s*x|tune\s*x|cleanup|clean\s*up|startup|boot|slow\s*pc|optimize|maintenance/i,
        a:`**PC TuneX** is a one-click Windows maintenance app.\n\n• Cleanup junk files & temp data\n• Optimise startup programs\n• Control background processes\n• Improve daily system responsiveness\n\n📥 Free on the **Microsoft Store** — no subscription.\n👉 [Download PC TuneX](https://apps.microsoft.com/detail/9NM5CJRT7D06)` },
      /* SpatiaX */
      { q:/spatia\s*x|spatiax|audio|sound\s*engine|surround|spatial|headphone|gaming\s*sound|dsp|music\s*enhance/i,
        a:`**SpatiaX Pro** is a premium real-time audio engine.\n\n• 3D spatial surround for headphones\n• Signature sound profiles (music, gaming, movies, calls)\n• Smart routing & pro-grade DSP controls\n• Crystal-clear voice enhancement\n\n🎧 Coming soon — [contact us](mailto:Hasnain@outlook.at) to be notified.` },
      /* AI Studio */
      { q:/ai\s*studio|training|zoom|workflow|prompt|image.*generat|generat.*image|stable\s*diffusion|comfy|offline\s*ai|subscription.free/i,
        a:`**AI Studio** offers personal training sessions via Zoom screen-share.\n\n✅ Learn to build your own **unlimited, subscription-free** AI image & video system\n✅ Custom prompt engineering techniques\n✅ Workflow building with ComfyUI / SD\n✅ Model setup on your own PC\n\n💷 Starting from **£49** — [book now](mailto:Hasnain@outlook.at) or click *Start Your AI Project*.` },
      /* Pricing */
      { q:/price|pricing|cost|how\s*much|£|gbp|fee|charge/i,
        a:`Here's the pricing overview:\n\n| Product | Price |\n|---|---|\n| PC TuneX | **Free** (MS Store) |\n| SpatiaX Pro | Coming soon |\n| AI Studio Training | **From £49** |\n\nAll prices are in GBP. Contact [Hasnain@outlook.at](mailto:Hasnain@outlook.at) for custom quotes.` },
      /* Which app */
      { q:/which\s*(app|product|should\s*i|one)|recommend|suggest|what\s*(app|should|do\s*i)/i,
        a:`Great question! Here's how to choose:\n\n🖥 **PC TuneX** — if your PC feels slow, takes long to boot, or needs a cleanup. Free.\n\n🎧 **SpatiaX Pro** — if you want richer audio for gaming, movies, or music. Coming soon.\n\n🤖 **AI Studio** — if you want to create AI images/videos without paying monthly subscriptions. From £49 training.\n\nNot sure? [Email Hasnain](mailto:Hasnain@outlook.at) and he'll advise personally.` },
      /* Contact */
      { q:/contact|email|reach|get\s*in\s*touch|support|help|hasnain/i,
        a:`You can reach Hasnain directly:\n\n📧 [Hasnain@outlook.at](mailto:Hasnain@outlook.at)\n📍 England, United Kingdom\n\nResponse time is usually within 24 hours.` },
      /* About */
      { q:/who\s*(are|is)|about|company|inhasnain|studio\s*x|what\s*(is|are)\s*(this|hsx|hasnain)/i,
        a:`**InHasnain · Studio X** is an independent digital products studio based in England, UK.\n\nBuilding practical Windows utilities and AI tooling for everyday creators and professionals:\n\n• 🖥 PC TuneX — system optimisation\n• 🎧 SpatiaX Pro — audio enhancement\n• 🤖 AI Studio — personal AI training` },
      /* Default */
      { q:/.*/,
        a:`I'm the HSX assistant — I know about:\n\n• **PC TuneX** (system cleanup app)\n• **SpatiaX Pro** (audio engine)\n• **AI Studio** (AI image training)\n• Pricing, contact, and recommendations\n\nTry asking: *"What app should I use?"* or *"How much is AI Studio?"*` },
    ];

    function getReply(msg){
      for(const rule of KB){
        if(rule.q.test(msg)) return rule.a;
      }
      return KB[KB.length-1].a;
    }

    /* Simple markdown → HTML (bold, links, lists, tables) */
    function md(text){
      return text
        .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/\| (.+?) \| (.+?) \|/g,'<tr><td>$1</td><td>$2</td></tr>')
        .replace(/\|---|---\|/g,'')
        .replace(/<tr>/,'<table class="hsx-tbl"><tbody><tr>')
        .replace(/(<\/tr>)(?!.*<tr>)/,'$1</tbody></table>')
        .replace(/^• (.+)$/gm,'<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s,'<ul>$1</ul>')
        .split('\n\n').map(p=>p.startsWith('<')?p:`<p>${p}</p>`).join('');
    }

    /* ── Inject CSS ── */
    const st=document.createElement('style');
    st.textContent=`
      .hsx-chat-fab{
        position:fixed;bottom:1.8rem;right:1.8rem;z-index:9000;
        width:52px;height:52px;border-radius:16px;cursor:pointer;
        /* Crystal glass morphism */
        background:linear-gradient(145deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,.06) 100%);
        backdrop-filter:blur(20px) saturate(1.8) brightness(1.1);
        -webkit-backdrop-filter:blur(20px) saturate(1.8) brightness(1.1);
        border:1px solid rgba(255,255,255,.45);
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,.70),
          inset 0 -1px 0 rgba(255,255,255,.18),
          inset 1px 0 0 rgba(255,255,255,.30),
          0 8px 24px rgba(0,0,0,.15),
          0 2px 6px rgba(0,0,0,.10);
        display:flex;align-items:center;justify-content:center;
        font-size:1.35rem;color:var(--ink);
        transition:transform .22s var(--ease-spring),box-shadow .22s,background .2s;
      }
      body.is-night .hsx-chat-fab{
        background:linear-gradient(145deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.04) 100%);
        border-color:rgba(255,255,255,.28);
        color:#e8f0ff;
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,.30),
          inset 0 -1px 0 rgba(255,255,255,.08),
          0 8px 24px rgba(0,0,0,.35),
          0 2px 6px rgba(0,0,0,.25);
      }
      .hsx-chat-fab:hover{
        transform:translateY(-3px) scale(1.04);
        background:linear-gradient(145deg,rgba(255,255,255,.30) 0%,rgba(255,255,255,.10) 100%);
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,.80),
          inset 0 -1px 0 rgba(255,255,255,.22),
          0 12px 32px rgba(0,0,0,.18),
          0 4px 10px rgba(0,0,0,.12);
      }
      .hsx-chat-fab .hsx-fab-badge{
        position:absolute;top:-4px;right:-4px;width:17px;height:17px;border-radius:50%;
        background:rgba(255,80,80,.92);font-size:.58rem;font-weight:800;color:#fff;
        display:flex;align-items:center;justify-content:center;
        border:1.5px solid rgba(255,255,255,.6);
        box-shadow:0 2px 6px rgba(0,0,0,.2);
        animation:hsx-badge-pulse 2s ease-in-out infinite;
      }
      @keyframes hsx-badge-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
      .hsx-chat-panel{
        position:fixed;bottom:5.4rem;right:1.8rem;z-index:9001;
        width:min(380px,calc(100vw - 2.4rem));
        max-height:70vh;
        display:flex;flex-direction:column;
        background:rgba(255,255,255,.10);
        backdrop-filter:blur(32px) saturate(2) brightness(1.08);
        border:1px solid rgba(255,255,255,.32);
        border-radius:20px;
        box-shadow:0 24px 60px rgba(0,0,0,.28),
                   inset 0 1px 0 rgba(255,255,255,.55),
                   inset 0 -1px 0 rgba(255,255,255,.10);
        opacity:0;transform:translateY(14px) scale(.97);
        pointer-events:none;
        transition:opacity .25s,transform .25s var(--ease-spring);
      }
      body.is-night .hsx-chat-panel{background:rgba(20,30,60,.52);}
      .hsx-chat-panel.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all;}
      .hsx-chat-head{
        padding:.9rem 1.1rem .7rem;border-bottom:1px solid rgba(255,255,255,.18);
        display:flex;align-items:center;gap:.7rem;flex-shrink:0;
      }
      .hsx-chat-avatar{
        width:34px;height:34px;border-radius:50%;flex-shrink:0;
        background:linear-gradient(135deg,#4fc3f7,#a78bfa);
        display:flex;align-items:center;justify-content:center;font-size:1rem;
      }
      .hsx-chat-title{font-family:'Orbitron',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.06em;}
      .hsx-chat-sub{font-size:.65rem;opacity:.5;margin-top:.1rem;}
      .hsx-chat-close{margin-left:auto;background:none;border:none;font-size:1.1rem;cursor:pointer;opacity:.6;color:inherit;}
      .hsx-chat-close:hover{opacity:1;}
      .hsx-chat-msgs{
        flex:1;overflow-y:auto;padding:.8rem 1rem;display:flex;flex-direction:column;gap:.7rem;
        scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.2) transparent;
      }
      .hsx-msg{max-width:88%;line-height:1.55;font-size:.83rem;padding:.55rem .8rem;border-radius:14px;word-break:break-word;}
      .hsx-msg.bot{
        align-self:flex-start;
        background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);
        border-bottom-left-radius:4px;
      }
      body.is-night .hsx-msg.bot{background:rgba(255,255,255,.08);}
      .hsx-msg.user{
        align-self:flex-end;
        background:linear-gradient(135deg,rgba(79,195,247,.35),rgba(167,139,250,.35));
        border:1px solid rgba(255,255,255,.26);border-bottom-right-radius:4px;
      }
      .hsx-msg a{color:#4fc3f7;text-underline-offset:2px;}
      .hsx-msg strong{font-weight:700;}
      .hsx-msg ul{margin:.3rem 0 .1rem 1rem;padding:0;}
      .hsx-msg li{margin:.15rem 0;}
      .hsx-msg p{margin:.25rem 0;}
      .hsx-tbl{border-collapse:collapse;width:100%;font-size:.8rem;margin:.3rem 0;}
      .hsx-tbl td{padding:.25rem .4rem;border:1px solid rgba(255,255,255,.18);}
      .hsx-chat-input-row{
        padding:.7rem .8rem;border-top:1px solid rgba(255,255,255,.14);
        display:flex;gap:.5rem;flex-shrink:0;
      }
      .hsx-chat-input{
        flex:1;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.28);
        border-radius:999px;padding:.45rem .9rem;font-size:.82rem;color:inherit;
        outline:none;font-family:inherit;
      }
      .hsx-chat-input:focus{border-color:rgba(79,195,247,.6);}
      .hsx-chat-send{
        width:34px;height:34px;border-radius:50%;border:none;cursor:pointer;
        background:linear-gradient(135deg,#4fc3f7,#a78bfa);color:#fff;
        font-size:1rem;display:flex;align-items:center;justify-content:center;
        flex-shrink:0;transition:transform .15s;
      }
      .hsx-chat-send:hover{transform:scale(1.1);}
      .hsx-chat-dots{display:flex;gap:4px;align-items:center;padding:.2rem .2rem;}
      .hsx-chat-dots span{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.45;animation:hsx-dot .9s ease-in-out infinite;}
      .hsx-chat-dots span:nth-child(2){animation-delay:.18s;}
      .hsx-chat-dots span:nth-child(3){animation-delay:.36s;}
      @keyframes hsx-dot{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px);opacity:.9}}
    `;
    document.head.appendChild(st);

    /* ── Build DOM ── */
    const fab=document.createElement('button');
    fab.className='hsx-chat-fab';
    fab.setAttribute('aria-label','Chat with HSX AI assistant');
    fab.innerHTML='🤖<span class="hsx-fab-badge">1</span>';

    const panel=document.createElement('div');
    panel.className='hsx-chat-panel';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-label','HSX AI Chat');
    panel.innerHTML=`
      <div class="hsx-chat-head">
        <div class="hsx-chat-avatar">🤖</div>
        <div>
          <div class="hsx-chat-title">HSX AI Assistant</div>
          <div class="hsx-chat-sub">Ask me anything about products & pricing</div>
        </div>
        <button class="hsx-chat-close" aria-label="Close chat">✕</button>
      </div>
      <div class="hsx-chat-msgs" id="hsx-msgs"></div>
      <div class="hsx-chat-input-row">
        <input class="hsx-chat-input" id="hsx-inp" type="text" placeholder="Ask about PC TuneX, AI Studio…" maxlength="200" autocomplete="off"/>
        <button class="hsx-chat-send" id="hsx-send" aria-label="Send">➤</button>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    const msgsEl=document.getElementById('hsx-msgs');
    const inp=document.getElementById('hsx-inp');
    const sendBtn=document.getElementById('hsx-send');

    function addMsg(text,role){
      const el=document.createElement('div');
      el.className='hsx-msg '+role;
      if(role==='bot') el.innerHTML=md(text);
      else el.textContent=text;
      msgsEl.appendChild(el);
      msgsEl.scrollTop=msgsEl.scrollHeight;
      return el;
    }

    function showTyping(){
      const el=document.createElement('div');
      el.className='hsx-msg bot';
      el.innerHTML='<div class="hsx-chat-dots"><span></span><span></span><span></span></div>';
      msgsEl.appendChild(el);
      msgsEl.scrollTop=msgsEl.scrollHeight;
      return el;
    }

    function sendMessage(){
      const txt=inp.value.trim();
      if(!txt) return;
      inp.value='';
      fab.querySelector('.hsx-fab-badge')?.remove();
      addMsg(txt,'user');
      const typing=showTyping();
      setTimeout(()=>{
        typing.remove();
        addMsg(getReply(txt),'bot');
      },520+Math.random()*380);
    }

    /* Greeting on first open */
    let greeted=false;
    function greet(){
      if(greeted) return; greeted=true;
      setTimeout(()=>addMsg('👋 Hi! I\'m the HSX assistant.\n\nI can help with **PC TuneX**, **SpatiaX Pro**, **AI Studio**, pricing, and recommendations.\n\nWhat would you like to know?','bot'),300);
    }

    /* Toggle */
    function open(){panel.classList.add('open');inp.focus();greet();}
    function close(){panel.classList.remove('open');}

    fab.addEventListener('click',()=>panel.classList.contains('open')?close():open());
    panel.querySelector('.hsx-chat-close').addEventListener('click',close);
    sendBtn.addEventListener('click',sendMessage);
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});

    /* Close on outside click */
    document.addEventListener('pointerdown',e=>{
      if(!panel.contains(e.target)&&e.target!==fab) close();
    });
  })();

  /* ============================================================
     SCROLL PROGRESS BAR
     Updates #scroll-progress width as percentage of total scroll.
     ============================================================ */
  (function(){
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function updateBar(){
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      const pct      = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct.toFixed(2) + '%';
    }
    window.addEventListener('scroll', updateBar, {passive:true});
    updateBar();
  })();

  /* ============================================================
     STAGGER REVEAL
     Adds .in to .stagger containers when they enter the viewport.
     Also picks up .stats-section for reveal.
     ============================================================ */
  (function(){
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.stagger,.stats-section').forEach(el => {
        el.classList.add('in');
      });
      return;
    }
    const staggerIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          staggerIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.stagger,.stats-section').forEach(el => {
      staggerIO.observe(el);
    });
  })();

})();
