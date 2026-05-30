/* ============================================================
 InHasnain Studio X - effects.js
 Premium futuristic effects. No neon. Palette: graphite,
 platinum, champagne. Honest (no fabricated content).
 All effects respect prefers-reduced-motion and touch.
 ============================================================ */
(function(){
    'use strict';
    var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var TOUCH = window.matchMedia('(hover:none),(pointer:coarse)').matches;
    function ready(fn){ document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

    /* ========================================================
 DAY / NIGHT THEME (day 06:00-18:00, night otherwise)
 ======================================================== */
    function autoPhase(){
        var h = new Date().getHours();
        return (h >= 6 && h < 18) ? 'day' : 'night';
    }
    function applyPhase(key){
        document.body.classList.remove('is-day','is-night');
        document.body.classList.add('is-' + key);
        window.__phase = key;
    }
    applyPhase(localStorage.getItem('hsx-theme') || autoPhase());
    setInterval(function(){ if(!localStorage.getItem('hsx-theme')) applyPhase(autoPhase()); }, 60000);

    /* Header tools: weather, theme, clock */
    function initHeaderTools(){
        var bar = document.querySelector('.top-bar');
        if(!bar) return;
        var actions = bar.querySelector('.actions');
        if(!actions){
            actions = document.createElement('div');
            actions.className = 'actions';
            actions.setAttribute('role','group');
            actions.setAttribute('aria-label','Site controls');
            bar.appendChild(actions);
        }
        actions.innerHTML = '';

        /* weather toggle */
        var wxBtn = document.createElement('button');
        wxBtn.className = 'tool-btn wx-btn'; wxBtn.title = 'Toggle rain / clear';
        window.__weather = localStorage.getItem('hsx-weather') || 'clear';
        function syncWx(){
            document.body.classList.toggle('weather-rain', window.__weather === 'rain');
            document.body.classList.toggle('weather-clear', window.__weather === 'clear');
        }
        function paintWx(){
            wxBtn.innerHTML = window.__weather === 'rain'
                ? '<span class="ico">&#9730;</span><span class="lbl">RAIN</span>'
                : '<span class="ico">&#9728;</span><span class="lbl">CLEAR</span>';
            syncWx();
        }
        paintWx();
        wxBtn.addEventListener('click', function(){
            window.__weather = window.__weather === 'rain' ? 'clear' : 'rain';
            localStorage.setItem('hsx-weather', window.__weather); paintWx();
            if(window.__applyWeatherAudio) window.__applyWeatherAudio();
            if(window.__setRain) window.__setRain(window.__weather === 'rain');
        });
        actions.appendChild(wxBtn);

        /* theme toggle */
        var themeBtn = document.createElement('button');
        themeBtn.className = 'tool-btn theme-btn';
        themeBtn.title = 'Toggle day / night  (double-click for auto)';
        function paintTheme(){
            var cur = localStorage.getItem('hsx-theme') || autoPhase();
            themeBtn.innerHTML = cur === 'day'
                ? '<span class="ico">&#9788;</span><span class="lbl">DAY</span>'
                : '<span class="ico">&#9789;</span><span class="lbl">NIGHT</span>';
        }
        paintTheme();
        themeBtn.addEventListener('click', function(){
            var cur = localStorage.getItem('hsx-theme') || autoPhase();
            var next = cur === 'day' ? 'night' : 'day';
            localStorage.setItem('hsx-theme', next); applyPhase(next); paintTheme();
        });
        themeBtn.addEventListener('dblclick', function(){
            localStorage.removeItem('hsx-theme'); applyPhase(autoPhase()); paintTheme();
        });
        actions.appendChild(themeBtn);

        /* sound toggle (wired by soundscape module) */
        var sndBtn = document.createElement('button');
        sndBtn.className = 'tool-btn snd-btn'; sndBtn.title = 'Ambient sound';
        sndBtn.innerHTML = '<span class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lbl">SOUND</span>';
        actions.appendChild(sndBtn);

        /* live clock */
        var clock = document.createElement('div');
        clock.className = 'clock';
        clock.innerHTML = '<span class="dot"></span><span class="time">--:--:--</span><span class="meridian">--</span>';
        actions.appendChild(clock);
        var tEl = clock.querySelector('.time'), mEl = clock.querySelector('.meridian');
        function pad(n){ return String(n).padStart(2,'0'); }
        function tick(){
            var d = new Date(), h = d.getHours(), mer = h >= 12 ? 'PM' : 'AM';
            h = h % 12; if(!h) h = 12;
            tEl.textContent = pad(h)+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
            mEl.textContent = mer;
        }
        tick(); setInterval(tick, 1000);
    }

    /* ========================================================
 GOLD-PARTICLE WORDMARK "HASNAIN STUDIO X"
 Text is sampled to pixels; gold particles fill the
 letterforms and shimmer. Visible in both themes.
 ======================================================== */
    function initKineticWord(){
        if(document.querySelector('.kinetic-word')) return;
        var hero = document.querySelector('.hero');
        if(!hero) return;
        var wrap = document.createElement('div');
        wrap.className = 'kinetic-word'; wrap.setAttribute('aria-hidden','true');
        var canvas = document.createElement('canvas');
        wrap.appendChild(canvas);
        hero.insertAdjacentElement('afterend', wrap);
        var ctx = canvas.getContext('2d');
        var DPR = Math.min(window.devicePixelRatio || 1, 2);
        var particles = [];
        var GOLDS = ['#f7e7b8','#e8cf8f','#cdb892','#d9b96a','#f3dd9e'];

        var TEXT = 'HASNAIN STUDIO X';
        function buildTargets(){
            var cssW = Math.min(wrap.clientWidth || hero.clientWidth || 1100, 1400);
            var cssH = Math.round(cssW * 0.18);
            canvas.style.width = cssW + 'px';
            canvas.style.height = cssH + 'px';
            canvas.width = Math.round(cssW * DPR);
            canvas.height = Math.round(cssH * DPR);

            var off = document.createElement('canvas');
            off.width = canvas.width; off.height = canvas.height;
            var octx = off.getContext('2d');
            octx.fillStyle = '#fff';
            octx.textAlign = 'center';
            octx.textBaseline = 'middle';

            /* Auto-fit font so the FULL text fits within the width with padding */
            var pad = canvas.width * 0.06;
            var maxW = canvas.width - pad * 2;
            var fontSize = Math.round(canvas.height * 0.7);
            octx.font = '900 ' + fontSize + "px 'Orbitron', sans-serif";
            var measured = octx.measureText(TEXT).width;
            if(measured > maxW){
                fontSize = Math.floor(fontSize * (maxW / measured));
                octx.font = '900 ' + fontSize + "px 'Orbitron', sans-serif";
            }
            octx.fillText(TEXT, canvas.width/2, canvas.height/2);

            var data = octx.getImageData(0,0,canvas.width,canvas.height).data;
            var step = Math.max(2, Math.round(2.4 * DPR));
            var targets = [];
            for(var y=0;y<canvas.height;y+=step){
                for(var x=0;x<canvas.width;x+=step){
                    if(data[(y*canvas.width + x)*4 + 3] > 128){ targets.push({x:x, y:y}); }
                }
            }
            if(particles.length > targets.length) particles.length = targets.length;
            for(var i=0;i<targets.length;i++){
                if(particles[i]){
                    particles[i].tx = targets[i].x; particles[i].ty = targets[i].y;
                } else {
                    particles.push({
                        x: Math.random()*canvas.width, y: Math.random()*canvas.height,
                        tx: targets[i].x, ty: targets[i].y,
                        c: GOLDS[(Math.random()*GOLDS.length)|0],
                        r: (0.7 + Math.random()*1.1) * DPR,
                        ph: Math.random()*Math.PI*2,
                        sp: 0.06 + Math.random()*0.06
                    });
                }
            }
        }

        var t = 0;
        function draw(){
            ctx.clearRect(0,0,canvas.width,canvas.height);
            t += 0.03;
            for(var i=0;i<particles.length;i++){
                var p = particles[i];
                if(RM){ p.x = p.tx; p.y = p.ty; }
                else { p.x += (p.tx - p.x) * p.sp; p.y += (p.ty - p.y) * p.sp; }
                var tw = 0.55 + 0.45*Math.sin(t + p.ph);
                ctx.globalAlpha = tw;
                ctx.fillStyle = p.c;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r*(0.7+0.5*tw), 0, Math.PI*2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if(!RM) requestAnimationFrame(draw);
        }

        buildTargets();
        /* rebuild once the Orbitron font has actually loaded (metrics differ) */
        if(document.fonts && document.fonts.ready){ document.fonts.ready.then(buildTargets); }
        var rT;
        window.addEventListener('resize', function(){ clearTimeout(rT); rT = setTimeout(buildTargets, 200); }, {passive:true});
        if(RM){ draw(); } else { requestAnimationFrame(draw); }
    }

    /* ========================================================
 SIGNATURE INTRO (handwritten HASNAIN, once per session)
 ======================================================== */
    function initSignature(){
        if(RM) return;
        if(sessionStorage.getItem('hsx-sig-seen')) return;
        sessionStorage.setItem('hsx-sig-seen','1');
        var LETTERS = [
            {d:'M 18,28 C 18,68 17,122 18,165 M 18,97 C 38,86 60,86 82,97 M 82,28 C 82,68 82,122 82,165', delay:0},
            {d:'M 82,165 C 96,165 108,158 114,144', delay:260},
            {d:'M 114,144 C 124,118 132,72 138,28 L 166,144 C 172,158 182,165 196,165', delay:380},
            {d:'M 118,112 C 138,106 158,106 164,112', delay:680},
            {d:'M 268,78 C 268,50 246,36 228,52 C 210,68 222,104 248,118 C 272,130 268,155 250,164 C 232,172 208,164 204,150', delay:900},
            {d:'M 204,165 L 204,28', delay:1180},
            {d:'M 204,28 C 212,28 220,46 230,68 L 272,155 C 274,160 276,165 278,165 L 278,28', delay:1320},
            {d:'M 278,165 C 292,165 304,158 310,144', delay:1580},
            {d:'M 310,144 C 320,118 330,72 336,28 L 364,144 C 370,158 380,165 394,165', delay:1700},
            {d:'M 316,112 C 336,106 356,106 362,112', delay:2000},
            {d:'M 432,28 C 430,70 430,124 432,165', delay:2160},
            {d:'M 470,165 L 470,28', delay:2360},
            {d:'M 470,28 C 478,28 486,46 496,68 L 538,155 C 540,160 542,165 544,165 L 544,28', delay:2500},
            {d:'M 18,182 C 120,196 300,198 544,186', delay:2780}
        ];
        var TOTAL = 3200;
        var overlay = document.createElement('div');
        overlay.className = 'sig-overlay signing';
        var NS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(NS,'svg');
        svg.setAttribute('viewBox','0 0 580 210'); svg.setAttribute('aria-hidden','true');
        var tag = document.createElement('div');
        tag.className = 'sig-tag'; tag.textContent = 'Hasnain Studio X';
        overlay.appendChild(svg); overlay.appendChild(tag);
        document.body.appendChild(overlay);
        LETTERS.forEach(function(letter){
            var path = document.createElementNS(NS,'path');
            path.setAttribute('d', letter.d);
            path.setAttribute('class','sig-path');
            svg.appendChild(path);
            var len = path.getTotalLength() + 2;
            path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
            setTimeout(function(){
                path.style.transition = 'stroke-dashoffset ' + Math.max(180, len*1.8) + 'ms cubic-bezier(.4,0,.2,1)';
                path.style.strokeDashoffset = '0';
            }, letter.delay);
        });
        setTimeout(function(){
            overlay.classList.add('done');
            setTimeout(function(){ overlay.remove(); }, 950);
        }, TOTAL);
    }

    /* ========================================================
 CUSTOM CURSOR + SNAKE TRAIL (desktop only)
 ======================================================== */
    function initCursor(){
        if(TOUCH || RM) return;
        var dot = document.createElement('div');
        dot.id = 'hsx-cursor'; document.body.appendChild(dot);
        var SEG = 18;
        var trail = [];
        for(var i=0;i<SEG;i++){
            var el = document.createElement('div');
            el.className = 'hsx-snake-dot';
            var ratio = 1 - i/SEG;
            var size = Math.max(1.5, 8*ratio*ratio);
            el.style.cssText = 'width:'+size.toFixed(1)+'px;height:'+size.toFixed(1)+'px;opacity:'+(ratio*0.55).toFixed(2)+';';
            document.body.appendChild(el);
            trail.push({el:el, x:-999, y:-999});
        }
        var mx = -999, my = -999;
        document.addEventListener('mousemove', function(e){
            mx = e.clientX; my = e.clientY;
            dot.style.left = mx+'px'; dot.style.top = my+'px';
        }, {passive:true});
        document.addEventListener('mousedown', function(){ dot.classList.add('clicking'); });
        document.addEventListener('mouseup', function(){ dot.classList.remove('clicking'); });
        var L = 0.28;
        (function animate(){
            trail[0].x += (mx - trail[0].x)*L; trail[0].y += (my - trail[0].y)*L;
            trail[0].el.style.left = trail[0].x+'px'; trail[0].el.style.top = trail[0].y+'px';
            for(var i=1;i<SEG;i++){
                trail[i].x += (trail[i-1].x - trail[i].x)*L;
                trail[i].y += (trail[i-1].y - trail[i].y)*L;
                trail[i].el.style.left = trail[i].x+'px';
                trail[i].el.style.top = trail[i].y+'px';
            }
            requestAnimationFrame(animate);
        })();
    }

    /* Specular light spot on cards */
    function initSpecular(){
        document.querySelectorAll('.card,.contact-info-card').forEach(function(card){
            card.addEventListener('mousemove', function(e){
                var r = card.getBoundingClientRect();
                card.style.setProperty('--hx', ((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
                card.style.setProperty('--hy', ((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
            });
            card.addEventListener('mouseleave', function(){
                card.style.setProperty('--hx','50%'); card.style.setProperty('--hy','-20%');
            });
        });
    }

    /* Magnetic hero letters */
    function initMagnetic(){
        if(TOUCH) return;
        var h1 = document.querySelector('.hero-card h1');
        if(!h1) return;
        h1.innerHTML = h1.textContent.split('').map(function(c,i){
            return c === ' ' ? ' ' : '<span class="mag-char" style="transition-delay:'+(i*8)+'ms">'+c+'</span>';
        }).join('');
        document.addEventListener('mousemove', function(e){
            h1.querySelectorAll('.mag-char').forEach(function(ch){
                var r = ch.getBoundingClientRect();
                var cx = r.left+r.width/2, cy = r.top+r.height/2;
                var dx = e.clientX-cx, dy = e.clientY-cy;
                var dist = Math.hypot(dx,dy), RANGE = 110;
                if(dist < RANGE){
                    var force = 1 - dist/RANGE, angle = Math.atan2(dy,dx), push = force*force*22;
                    ch.style.transform = 'translate('+(-Math.cos(angle)*push).toFixed(2)+'px,'+(-Math.sin(angle)*push).toFixed(2)+'px) scale('+(1+force*0.12).toFixed(3)+')';
                    ch.style.transitionDuration = '60ms';
                } else { ch.style.transform = ''; ch.style.transitionDuration = '550ms'; }
            });
        });
    }

    /* 3D mouse tilt */
    function initTilt(){
        if(TOUCH || RM) return;
        function setup(selector, cfg){
            document.querySelectorAll(selector).forEach(function(el){
                var rAF = null, curX = 0, curY = 0, targetX = 0, targetY = 0;
                function lerp(a,b,t){ return a+(b-a)*t; }
                function animate(){
                    curX = lerp(curX, targetX, 0.14); curY = lerp(curY, targetY, 0.14);
                    el.style.transform = 'perspective('+cfg.p+'px) rotateY('+curX+'deg) rotateX('+(-curY)+'deg) translateZ('+(cfg.s>1?14:8)+'px) scale('+cfg.s+')';
                    if(Math.abs(curX-targetX)>0.02 || Math.abs(curY-targetY)>0.02) rAF = requestAnimationFrame(animate);
                    else rAF = null;
                }
                el.addEventListener('mousemove', function(e){
                    var r = el.getBoundingClientRect();
                    targetX = ((e.clientX-r.left)/r.width-0.5)*cfg.t*2;
                    targetY = ((e.clientY-r.top)/r.height-0.5)*cfg.t*2;
                    if(!rAF) rAF = requestAnimationFrame(animate);
                });
                el.addEventListener('mouseleave', function(){ targetX = 0; targetY = 0; if(!rAF) rAF = requestAnimationFrame(animate); });
            });
        }
        setup('.card', {t:9, s:1.025, p:900});
        setup('.hero-card', {t:4, s:1.008, p:1100});
        setup('.contact-info-card', {t:8, s:1.02, p:900});
        setup('.gallery-item', {t:7, s:1.018, p:850});
    }

    /* Kinetic word parallax */
    function initParallax(){
        if(RM) return;
        var ticking = false;
        window.addEventListener('scroll', function(){
            if(ticking) return; ticking = true;
            requestAnimationFrame(function(){
                var kw = document.querySelector('.kinetic-word');
                if(kw) kw.style.transform = 'translateY('+(window.scrollY*0.08)+'px)';
                ticking = false;
            });
        }, {passive:true});
    }

    /* ========================================================
 NIGHT SHOOTING STARS (only when body.is-night)
 ======================================================== */
    function initStars(){
        if(RM) return;
        function spawn(){
            if(!document.body.classList.contains('is-night')) return;
            var star = document.createElement('div');
            star.className = 'shoot-star';
            var sx = 5+Math.random()*88, sy = 1+Math.random()*55;
            var len = 55+Math.random()*130, ang = 15+Math.random()*38;
            var dur = (0.38+Math.random()*0.65).toFixed(2), dist = 100+Math.random()*240;
            var rad = ang*Math.PI/180;
            star.style.cssText = ['left:'+sx+'vw','top:'+sy+'vh','--len:'+len+'px','--ang:'+ang+'deg','--dur:'+dur+'s','--tx:'+(Math.cos(rad)*dist).toFixed(0)+'px','--ty:'+(Math.sin(rad)*dist).toFixed(0)+'px'].join(';');
            document.body.appendChild(star);
            setTimeout(function(){ star.remove(); }, parseFloat(dur)*1000+120);
        }
        function chain(base){
            setTimeout(function tick(){
                spawn();
                if(Math.random() < 0.28) setTimeout(spawn, 80+Math.random()*180);
                setTimeout(tick, 600+Math.random()*1400);
            }, base);
        }
        chain(400); chain(900); chain(1500); chain(2200);
    }

    /* ========================================================
 GLASS CONDENSATION (droplets on panels, shown in rain)
 ======================================================== */
    function initCondensation(){
        document.querySelectorAll('.hero-card, .section, .card, .contact-info-card').forEach(function(panel){
            if(panel.querySelector(':scope > .glass-condensation')) return;
            var cond = document.createElement('div');
            cond.className = 'glass-condensation';
            var drops = [];
            var N = 9+Math.floor(Math.random()*5);
            for(var i=0;i<N;i++){
                var x = (Math.random()*92+4).toFixed(1), y = (Math.random()*92+4).toFixed(1);
                var r = (1+Math.random()*2.2).toFixed(1), a = (0.35+Math.random()*0.3).toFixed(2);
                drops.push('radial-gradient(circle '+r+'px at '+x+'% '+y+'%, rgba(255,255,255,'+a+') 0%, rgba(255,255,255,'+(a*0.4).toFixed(2)+') 60%, transparent 100%)');
            }
            cond.style.backgroundImage = drops.join(',');
            if(getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
            panel.insertBefore(cond, panel.firstChild);
        });
    }

    /* ========================================================
 WAVEFORM DIVIDER (between hero and first section)
 ======================================================== */
    function initWaveform(){
        var hero = document.querySelector('.hero');
        var firstSection = document.querySelector('.section');
        if(!hero || !firstSection || document.querySelector('.waveform-divider')) return;
        var wrap = document.createElement('div');
        wrap.className = 'waveform-divider'; wrap.setAttribute('aria-hidden','true');
        wrap.innerHTML = '<svg viewBox="0 0 1080 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path class="wf-back" d="M0 28 C90 8 180 48 270 28 S450 8 540 28 S720 48 810 28 S990 8 1080 28 V56 H0 Z"/>' +
            '<path class="wf-front" d="M0 32 C90 52 180 12 270 32 S450 52 540 32 S720 12 810 32 S990 52 1080 32 V56 H0 Z"/>' +
            '</svg>';
        firstSection.parentNode.insertBefore(wrap, firstSection);
    }

    /* ========================================================
 TIME-OF-DAY DIRECTIONAL LIGHT
 ======================================================== */
    function initLight(){
        function apply(){
            var h = new Date().getHours() + new Date().getMinutes()/60;
            var norm = Math.max(0, Math.min(1, (h-6)/12));
            var angle = norm*Math.PI;
            var root = document.documentElement;
            root.style.setProperty('--light-x', (-(Math.cos(angle)*40)).toFixed(1)+'px');
            root.style.setProperty('--light-y', (-(Math.abs(Math.sin(angle))*36+4)).toFixed(1)+'px');
            root.style.setProperty('--light-blur', (24+Math.abs(Math.cos(angle))*20).toFixed(0)+'px');
        }
        apply(); setInterval(apply, 5*60*1000);
    }

    /* ========================================================
 LOGO INK-SPLAT (click brand -> ink burst -> home)
 ======================================================== */
    function initInkSplat(){
        var brand = document.querySelector('.top-bar .brand');
        if(!brand) return;
        brand.style.cursor = 'pointer';
        var canvas = document.createElement('canvas');
        canvas.className = 'ink-splat-canvas';
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        resize(); window.addEventListener('resize', resize, {passive:true});
        function splat(cx, cy, cb){
            canvas.classList.add('active');
            var night = document.body.classList.contains('is-night');
            var color = night ? '#e8eef7' : '#1a1d24';
            var frame = 0;
            var drops = Array.from({length:28}, function(){ return {x:cx,y:cy,vx:(Math.random()-0.5)*18,vy:(Math.random()-0.5)*16-Math.random()*8,r:4+Math.random()*12,life:1,decay:0.032+Math.random()*0.025,gravity:0.45}; });
            var blobs = Array.from({length:14}, function(){ return {x:cx+(Math.random()-0.5)*120,y:cy+(Math.random()-0.5)*100,r:3+Math.random()*18,life:1,decay:0.04+Math.random()*0.03}; });
            (function draw(){
                ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle = color;
                var alive = false;
                drops.forEach(function(d){
                    if(d.life<=0) return; alive = true;
                    d.x+=d.vx; d.y+=d.vy; d.vy+=d.gravity; d.vx*=0.93; d.r*=0.97; d.life-=d.decay;
                    ctx.globalAlpha = Math.max(0,d.life);
                    ctx.beginPath(); ctx.ellipse(d.x,d.y,d.r,d.r*0.7,Math.atan2(d.vy,d.vx),0,Math.PI*2); ctx.fill();
                });
                blobs.forEach(function(b){
                    if(b.life<=0) return; alive = true; b.life-=b.decay;
                    ctx.globalAlpha = Math.max(0,b.life*0.7);
                    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
                });
                ctx.globalAlpha = 1; frame++;
                if(alive && frame<90) requestAnimationFrame(draw);
                else { canvas.classList.remove('active'); ctx.clearRect(0,0,canvas.width,canvas.height); if(cb) cb(); }
            })();
        }
        brand.addEventListener('click', function(e){
            e.preventDefault();
            var r = brand.getBoundingClientRect();
            var cx = r.left+r.width/2, cy = r.top+r.height/2;
            var logo = brand.querySelector('.logo') || brand;
            logo.style.transition = 'transform .3s'; logo.style.transform = 'scale(1.35) rotate(-8deg)';
            setTimeout(function(){ logo.style.transform = ''; }, 300);
            var home = location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname.endsWith('/');
            if(RM){ if(!home) location.href = 'index.html'; return; }
            if(home) splat(cx,cy,null);
            else splat(cx,cy,function(){ location.href = 'index.html'; });
        });
    }

    /* ========================================================
 WEATHER AMBIENT AUDIO (real files)
 birds.mp3 plays in clear mode, rain.mp3 in rain mode.
 SOUND button turns it on or off. Files live in audio/.
 Stays silent with no errors if a file is missing.
 ======================================================== */
    var WX_AUDIO = { on:false, birds:null, rain:null };
    function makeTrack(src){
        var a = new Audio(src);
        a.loop = true; a.preload = 'none'; a.volume = 0;
        a.addEventListener('error', function(){ /* file not present yet, stay silent */ });
        return a;
    }
    function fadeTo(el, target){
        if(!el) return;
        var step = function(){
            var d = target - el.volume;
            if(Math.abs(d) < 0.02){ el.volume = target; if(target === 0) el.pause(); return; }
            el.volume = Math.max(0, Math.min(1, el.volume + d * 0.08));
            requestAnimationFrame(step);
        };
        if(target > 0 && el.paused){ var p = el.play(); if(p && p.catch) p.catch(function(){}); }
        requestAnimationFrame(step);
    }
    function applyWeatherAudio(){
        if(!WX_AUDIO.on) return;
        var rain = document.body.classList.contains('weather-rain');
        if(rain){ fadeTo(WX_AUDIO.rain, 0.6); fadeTo(WX_AUDIO.birds, 0); }
        else    { fadeTo(WX_AUDIO.birds, 0.5); fadeTo(WX_AUDIO.rain, 0); }
    }
    window.__applyWeatherAudio = applyWeatherAudio;
    function initSound(){
        var btn = document.querySelector('.snd-btn');
        if(!btn) return;
        btn.addEventListener('click', function(){
            if(!WX_AUDIO.birds){
                WX_AUDIO.birds = makeTrack('audio/birds.mp3');
                WX_AUDIO.rain  = makeTrack('audio/rain.mp3');
            }
            WX_AUDIO.on = !WX_AUDIO.on;
            btn.classList.toggle('on', WX_AUDIO.on);
            if(WX_AUDIO.on){ applyWeatherAudio(); }
            else { fadeTo(WX_AUDIO.birds, 0); fadeTo(WX_AUDIO.rain, 0); }
        });
    }

    /* ========================================================
 DNA HELIX (subtle rotating double helix behind content)
 ======================================================== */
    function initHelix(){
        if(RM) return;
        var cv = document.createElement('canvas');
        cv.setAttribute('aria-hidden','true');
        cv.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:0.4;';
        var grid = document.querySelector('.bg-grid');
        if(grid) document.body.insertBefore(cv, grid); else document.body.prepend(cv);
        var ctx = cv.getContext('2d'); var W, H, t = 0;
        function resize(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
        resize(); addEventListener('resize', resize, {passive:true});
        function strand(cx, phase){
            var AMP = Math.min(48, W*0.04), PERIOD = 180;
            [0, Math.PI].forEach(function(off){
                ctx.beginPath(); var first = true;
                for(var y=-20;y<=H+20;y+=4){
                    var ph = (y/PERIOD)*Math.PI*2 + phase + t;
                    var x = cx + Math.sin(ph+off)*AMP;
                    if(first){ ctx.moveTo(x,y); first = false; } else ctx.lineTo(x,y);
                }
                ctx.strokeStyle = 'rgba(205,184,146,0.12)'; ctx.lineWidth = 1.5; ctx.stroke();
            });
            for(var y=0;y<=H;y+=28){
                var ph = (y/PERIOD)*Math.PI*2 + phase + t;
                var x1 = cx + Math.sin(ph)*AMP, x2 = cx + Math.sin(ph+Math.PI)*AMP;
                ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y);
                ctx.strokeStyle = 'rgba(159,180,200,0.10)'; ctx.lineWidth = 1; ctx.stroke();
            }
        }
        (function draw(){
            ctx.clearRect(0,0,W,H);
            strand(W*0.18, 0); strand(W*0.82, 2.1);
            t += 0.012; requestAnimationFrame(draw);
        })();
    }

    /* ========================================================
 HIDDEN TERMINAL (backtick toggles a glass console)
 ======================================================== */
    function initTerminal(){
        var overlay = document.createElement('div');
        overlay.className = 'hsx-terminal-overlay';
        overlay.innerHTML = '<div class="hsx-terminal" id="hsx-term" role="dialog" aria-modal="true" aria-label="HSX Terminal">' +
            '<div class="hsx-terminal-bar"><span class="t-dot red"></span><span class="t-dot yellow"></span><span class="t-dot green"></span>HSX TERMINAL<span>Press ` to toggle &middot; type help</span></div>' +
            '<div class="hsx-terminal-body" id="hsx-term-body"></div>' +
            '<div class="hsx-terminal-input-row"><span class="t-prompt">hsx&gt;&nbsp;</span><input class="t-input" id="hsx-term-input" type="text" autocomplete="off" spellcheck="false" placeholder="type a command" aria-label="Terminal input"></div>' +
            '</div>';
        document.body.appendChild(overlay);
        var term = document.getElementById('hsx-term'), body = document.getElementById('hsx-term-body'), inp = document.getElementById('hsx-term-input');
        var open = false;
        function print(text, cls){ var p = document.createElement('p'); p.className = 't-line'+(cls?' '+cls:''); p.textContent = text; body.appendChild(p); body.scrollTop = body.scrollHeight; }
        function welcome(){ print('InHasnain Studio X - Terminal','ok'); print('Type help to see available commands.',''); }
        var COMMANDS = {
            help:function(){ print('Available commands:','warn'); print('  about     - about this studio',''); print('  apps      - list the apps',''); print('  clear     - clear the terminal',''); print('  close     - close the terminal',''); },
            clear:function(){ body.innerHTML = ''; },
            close:function(){ closeT(); },
            about:function(){ print('Hasnain Studio X builds privacy-first Windows and Android tools, plus AI Studio workflows.',''); },
            apps:function(){ print('Windows: PC TuneX, FlipX Studio, WorkX Suite, ForgeX Pro, VAudio Elite, Drop2QR (SpatiaX Pro beta)',''); print('Android: Mobile TuneX',''); }
        };
        function run(raw){ var cmd = raw.trim().toLowerCase(); if(!cmd) return; print('hsx> '+cmd,'cmd'); if(COMMANDS[cmd]) COMMANDS[cmd](); else print('Unknown command: "'+cmd+'". Type help.','err'); }
        function openT(){ if(open) return; open = true; term.classList.add('open'); if(!body.hasChildNodes()) welcome(); setTimeout(function(){ inp.focus(); }, 350); }
        function closeT(){ if(!open) return; open = false; term.classList.remove('open'); }
        inp.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ run(inp.value); inp.value = ''; } if(e.key === 'Escape') closeT(); });
        document.addEventListener('keydown', function(e){
            if(e.key === '`' && ['INPUT','TEXTAREA','SELECT'].indexOf(document.activeElement.tagName) === -1){ e.preventDefault(); open ? closeT() : openT(); }
        });
        overlay.addEventListener('click', function(e){ if(e.target === overlay) closeT(); });
    }

    /* ========================================================
 VOICE NAVIGATION (hold Space, speak a page name)
 ======================================================== */
    function initVoice(){
        var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if(!SR) return;
        var ind = document.createElement('div');
        ind.className = 'voice-indicator';
        document.body.appendChild(ind);
        var viText = ind.querySelector('#vi-text'), viRes = ind.querySelector('#vi-res');
        var PAGES = { home:'index.html', windows:'Windows-apps.html', apps:'Windows-apps.html', android:'android-apps.html', mobile:'android-apps.html', studio:'pricing.html', ai:'pricing.html', pricing:'pricing.html', contact:'contact.html', email:'contact.html' };
        var rec = new SR(); rec.lang = 'en-GB'; rec.interimResults = true; rec.maxAlternatives = 4;
        var listening = false, holdTimer = null;
        function start(){ if(listening) return; listening = true; ind.classList.add('active'); viText.textContent = 'Listening'; try{ rec.start(); }catch(e){} }
        function stop(){ if(!listening) return; listening = false; try{ rec.stop(); }catch(e){} setTimeout(function(){ ind.classList.remove('active'); }, 600); }
        rec.onresult = function(e){
            var transcript = Array.from(e.results).map(function(r){ return r[0].transcript; }).join(' ').toLowerCase().trim();
            viRes.textContent = '"'+transcript+'"';
            if(e.results[e.results.length-1].isFinal){
                var dest = null;
                transcript.split(/\s+/).forEach(function(w){ if(PAGES[w] && !dest) dest = PAGES[w]; });
                if(dest){ viText.textContent = 'Navigating'; viRes.textContent = '-> '+dest; stop(); setTimeout(function(){ location.href = dest; }, 500); }
                else { viText.textContent = 'Not recognised'; setTimeout(stop, 1200); }
            }
        };
        rec.onerror = stop; rec.onend = function(){ if(listening){ try{ rec.start(); }catch(e){} } };
        document.addEventListener('keydown', function(e){
            if(e.code !== 'Space') return;
            if(['INPUT','TEXTAREA','SELECT'].indexOf(document.activeElement.tagName) !== -1) return;
            if(e.repeat) return; e.preventDefault();
            holdTimer = setTimeout(start, 120);
        });
        document.addEventListener('keyup', function(e){ if(e.code !== 'Space') return; clearTimeout(holdTimer); if(listening) stop(); });
    }

    /* ========================================================
 MAGICAL STARFIELD + MOON (calming night sky)
 ======================================================== */
    function initStarfield(){
        var cv = document.createElement('canvas');
        cv.id = 'star-canvas'; cv.setAttribute('aria-hidden','true');
        var grid = document.querySelector('.bg-grid');
        if(grid) document.body.insertBefore(cv, grid); else document.body.prepend(cv);
        var ctx = cv.getContext('2d');
        var DPR = Math.min(window.devicePixelRatio || 1, 2);
        var W, H, stars = [], motes = [], t = 0;
        var moon = {}, sun = {};
        var sunRays = [];
        function build(){
            W = cv.width = Math.round(innerWidth * DPR);
            H = cv.height = Math.round(innerHeight * DPR);
            cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
            /* immersive night starfield */
            var count = Math.min(560, Math.round(innerWidth * innerHeight / 3200));
            stars = [];
            for(var i=0;i<count;i++){
                stars.push({ x:Math.random()*W, y:Math.random()*H, r:(Math.random()*1.6+0.4)*DPR,
                    base:0.35+Math.random()*0.65, sp:0.5+Math.random()*2.4, ph:Math.random()*Math.PI*2, warm:Math.random()<0.22 });
            }
            motes = [];
            for(var m=0;m<18;m++){
                motes.push({ x:Math.random()*W, y:Math.random()*H, r:(0.6+Math.random()*1.2)*DPR,
                    vx:(Math.random()-0.5)*0.12*DPR, vy:(-0.05-Math.random()*0.1)*DPR, ph:Math.random()*6.28 });
            }
            moon.x = W*0.80; moon.y = H*0.22; moon.r = Math.min(W,H)*0.085;
            /* golden sun-ray particles drifting outward from the sun (day) */
            sun.x = W*0.80; sun.y = H*0.20; sun.r = Math.min(W,H)*0.075;
            sunRays = [];
            for(var k=0;k<120;k++){
                var ang = Math.random()*Math.PI*2;
                var dist = sun.r*(1.2 + Math.random()*6);
                sunRays.push({ ang:ang, dist:dist, speed:(0.15+Math.random()*0.5)*DPR,
                    r:(0.6+Math.random()*1.6)*DPR, ph:Math.random()*6.28, max:sun.r*(2+Math.random()*7) });
            }
        }
        function drawMoon(){
            var glow = ctx.createRadialGradient(moon.x, moon.y, moon.r*0.5, moon.x, moon.y, moon.r*5.5);
            glow.addColorStop(0, 'rgba(244,242,228,0.34)');
            glow.addColorStop(0.35, 'rgba(214,222,240,0.12)');
            glow.addColorStop(1, 'rgba(214,222,240,0)');
            ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(moon.x, moon.y, moon.r*5.5, 0, Math.PI*2); ctx.fill();
            var body = ctx.createRadialGradient(moon.x-moon.r*0.35, moon.y-moon.r*0.35, moon.r*0.15, moon.x, moon.y, moon.r);
            body.addColorStop(0, '#fffdf5'); body.addColorStop(0.6, '#f3f1e4'); body.addColorStop(1, '#cdd3e2');
            ctx.fillStyle = body; ctx.beginPath(); ctx.arc(moon.x, moon.y, moon.r, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = DPR;
            ctx.beginPath(); ctx.arc(moon.x, moon.y, moon.r*0.98, 0, Math.PI*2); ctx.stroke();
        }
        function drawSun(){
            /* warm wide halo */
            var glow = ctx.createRadialGradient(sun.x, sun.y, sun.r*0.4, sun.x, sun.y, sun.r*6);
            glow.addColorStop(0, 'rgba(255,236,180,0.55)');
            glow.addColorStop(0.3, 'rgba(255,214,130,0.22)');
            glow.addColorStop(1, 'rgba(255,214,130,0)');
            ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.r*6, 0, Math.PI*2); ctx.fill();
            /* sun disc */
            var body = ctx.createRadialGradient(sun.x-sun.r*0.2, sun.y-sun.r*0.2, sun.r*0.1, sun.x, sun.y, sun.r);
            body.addColorStop(0, '#fff7e2'); body.addColorStop(0.6, '#ffe6a6'); body.addColorStop(1, '#f2c463');
            ctx.fillStyle = body; ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI*2); ctx.fill();
            /* drifting golden ray particles */
            ctx.fillStyle = '#f3cf7a';
            for(var k=0;k<sunRays.length;k++){
                var p = sunRays[k];
                p.dist += p.speed; p.ph += 0.03;
                if(p.dist > p.max){ p.dist = sun.r*1.2; p.ang = Math.random()*Math.PI*2; }
                var px = sun.x + Math.cos(p.ang)*p.dist;
                var py = sun.y + Math.sin(p.ang)*p.dist;
                var fade = 1 - p.dist/p.max;
                ctx.globalAlpha = Math.max(0, fade*0.7*(0.6+0.4*Math.sin(p.ph)));
                ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI*2); ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        function draw(){
            var night = document.body.classList.contains('is-night');
            ctx.clearRect(0,0,W,H); t += 0.016;
            if(night){
                drawMoon();
                for(var i=0;i<stars.length;i++){
                    var s = stars[i];
                    var tw = s.base*(0.45+0.55*Math.abs(Math.sin(t*s.sp+s.ph)));
                    ctx.globalAlpha = tw; ctx.fillStyle = s.warm ? '#f5e6bd' : '#f2f5ff';
                    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
                    if(s.r > 1.2*DPR && tw > 0.55){
                        ctx.globalAlpha = tw*0.55;
                        ctx.fillRect(s.x-s.r*2.6, s.y-s.r*0.16, s.r*5.2, s.r*0.32);
                        ctx.fillRect(s.x-s.r*0.16, s.y-s.r*2.6, s.r*0.32, s.r*5.2);
                    }
                }
                for(var m=0;m<motes.length;m++){
                    var mo = motes[m];
                    mo.x += mo.vx; mo.y += mo.vy; mo.ph += 0.02;
                    if(mo.y < -10){ mo.y = H+10; mo.x = Math.random()*W; }
                    if(mo.x < -10) mo.x = W+10; if(mo.x > W+10) mo.x = -10;
                    ctx.globalAlpha = 0.12+0.1*Math.sin(mo.ph); ctx.fillStyle = '#f5e6bd';
                    ctx.beginPath(); ctx.arc(mo.x, mo.y, mo.r, 0, Math.PI*2); ctx.fill();
                }
                ctx.globalAlpha = 1;
            } else {
                drawSun();
            }
            if(!RM) requestAnimationFrame(draw);
        }
        build();
        var rT;
        window.addEventListener('resize', function(){ clearTimeout(rT); rT = setTimeout(build, 200); }, {passive:true});
        if(RM){ draw(); } else { requestAnimationFrame(draw); }
    }

    /* ========================================================
       CINEMATIC 4D RAIN  (active only in rain mode)
       Depth-layered streaks with parallax, motion blur,
       splash particles, ripples, and occasional lightning.
       ======================================================== */
    function initRain(){
        var cv = document.createElement('canvas');
        cv.id = 'rain-canvas'; cv.setAttribute('aria-hidden','true');
        document.body.appendChild(cv);
        var ctx = cv.getContext('2d');
        var DPR = Math.min(window.devicePixelRatio || 1, 2);
        var W, H, drops = [], splashes = [], running = false, rafId = null;
        var flash = 0, nextBolt = 0, wind = 0.8;

        function build(){
            W = cv.width = Math.round(innerWidth * DPR);
            H = cv.height = Math.round(innerHeight * DPR);
            cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
            var count = Math.min(700, Math.round(innerWidth * innerHeight / 1600));
            drops = [];
            for(var i=0;i<count;i++){ drops.push(newDrop(true)); }
        }
        function newDrop(anywhere){
            var layer = Math.random();
            var depth = 0.35 + layer * 0.95;
            return {
                x: Math.random()*W*1.2 - W*0.1,
                y: anywhere ? Math.random()*H : -Math.random()*H*0.4,
                len: (10 + layer*26) * DPR,
                speed: (8 + layer*20) * DPR,
                w: (0.6 + layer*1.1) * DPR,
                a: 0.18 + layer*0.4,
                depth: depth
            };
        }
        function splash(x){
            for(var i=0;i<5;i++){
                splashes.push({ x:x, y:H-2*DPR, vx:(Math.random()-0.5)*3*DPR,
                    vy:-(1.5+Math.random()*3)*DPR, life:1, r:(0.6+Math.random()*1.2)*DPR });
            }
        }
        function frame(){
            if(!running) return;
            ctx.clearRect(0,0,W,H);

            /* lightning flash overlay */
            var now = performance.now();
            if(now > nextBolt){
                flash = 1;
                nextBolt = now + 6000 + Math.random()*10000;
            }
            if(flash > 0){
                ctx.fillStyle = 'rgba(210,225,255,' + (flash*0.10).toFixed(3) + ')';
                ctx.fillRect(0,0,W,H);
                flash -= 0.04;
            }

            /* rain streaks */
            for(var i=0;i<drops.length;i++){
                var d = drops[i];
                d.y += d.speed; d.x += wind * d.depth * DPR;
                if(d.y - d.len > H){
                    if(Math.random() < 0.5) splash(d.x);
                    drops[i] = newDrop(false); continue;
                }
                var g = ctx.createLinearGradient(d.x, d.y - d.len, d.x + wind*d.depth*4, d.y);
                g.addColorStop(0, 'rgba(190,205,230,0)');
                g.addColorStop(1, 'rgba(200,215,238,' + d.a.toFixed(2) + ')');
                ctx.strokeStyle = g; ctx.lineWidth = d.w; ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(d.x, d.y - d.len);
                ctx.lineTo(d.x + wind*d.depth*4, d.y);
                ctx.stroke();
            }

            /* splashes */
            for(var s=splashes.length-1; s>=0; s--){
                var p = splashes[s];
                p.x += p.vx; p.y += p.vy; p.vy += 0.25*DPR; p.life -= 0.05;
                if(p.life <= 0){ splashes.splice(s,1); continue; }
                ctx.globalAlpha = Math.max(0, p.life*0.5);
                ctx.fillStyle = 'rgba(205,218,240,1)';
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
            }
            ctx.globalAlpha = 1;
            rafId = requestAnimationFrame(frame);
        }
        function startRain(){
            if(running || RM) return;
            running = true;
            cv.classList.add('on');
            build();
            rafId = requestAnimationFrame(frame);
        }
        function stopRain(){
            running = false;
            cv.classList.remove('on');
            if(rafId) cancelAnimationFrame(rafId);
            ctx.clearRect(0,0,W||0,H||0);
        }
        window.__setRain = function(on){ on ? startRain() : stopRain(); };
        window.addEventListener('resize', function(){ if(running) build(); }, {passive:true});
        /* start if already in rain mode */
        if(document.body.classList.contains('weather-rain')) startRain();
    }

    /* Boot all */
    ready(function(){
        initRain();
        initHeaderTools();
        initKineticWord();
        initSignature();
        initCursor();
        initSpecular();
        initMagnetic();
        initTilt();
        initParallax();
        initStarfield();
        initStars();
        initCondensation();
        initWaveform();
        initLight();
        initSound();
        initTerminal();
        initVoice();
    });
})();
