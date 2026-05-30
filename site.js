/* ============================================================
 InHasnain Studio X - site.js
 Nav, scroll progress, reveals, lightbox, contact form, wizard.
 ============================================================ */
(function(){
    'use strict';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ready(fn){
        if(document.readyState !== 'loading'){ fn(); }
        else{ document.addEventListener('DOMContentLoaded', fn); }
    }

    /* Mobile nav */
    function initNav(){
        var bar = document.querySelector('.top-bar');
        var nav = bar && bar.querySelector('nav');
        if(!bar || !nav) return;
        var toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label','Toggle menu');
        toggle.setAttribute('aria-expanded','false');
        toggle.innerHTML = '<span></span>';
        var actions = bar.querySelector('.actions');
        if(actions){ bar.insertBefore(toggle, actions); } else { bar.appendChild(toggle); }
        toggle.addEventListener('click', function(){
            var open = document.body.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        nav.addEventListener('click', function(e){
            if(e.target.tagName === 'A'){
                document.body.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded','false');
            }
        });
    }

    /* Scroll progress */
    function initProgress(){
        var bar = document.getElementById('scroll-progress');
        if(!bar) return;
        function update(){
            var h = document.documentElement;
            var max = h.scrollHeight - h.clientHeight;
            var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max * 100 : 0;
            bar.style.width = pct + '%';
        }
        window.addEventListener('scroll', update, {passive:true});
        update();
    }

    /* Scroll reveals */
    function initReveals(){
        var items = document.querySelectorAll('.reveal, .stagger, .gallery-item');
        if(!items.length) return;
        if(reduceMotion || !('IntersectionObserver' in window)){
            items.forEach(function(el){ el.classList.add('visible'); });
            return;
        }
        var io = new IntersectionObserver(function(entries){
            entries.forEach(function(en){
                if(en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target); }
            });
        }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
        items.forEach(function(el){ io.observe(el); });
    }

    /* Orb parallax (skipped under reduced motion) */
    function initOrbs(){
        if(reduceMotion) return;
        var orbs = document.querySelectorAll('.orb');
        if(!orbs.length) return;
        var ticking = false;
        window.addEventListener('scroll', function(){
            if(ticking) return;
            ticking = true;
            requestAnimationFrame(function(){
                var y = window.scrollY || 0;
                orbs.forEach(function(o,i){
                    var f = (i+1)*0.04;
                    o.style.transform = 'translateY(' + (y*f) + 'px)';
                });
                ticking = false;
            });
        }, {passive:true});
    }

    /* Smooth page transition on internal nav */
    function initPageTransition(){
        var pt = document.getElementById('pg-transition');
        if(!pt || reduceMotion) return;
        requestAnimationFrame(function(){ pt.classList.remove('show'); });
        document.addEventListener('click', function(e){
            var a = e.target.closest('a');
            if(!a) return;
            var href = a.getAttribute('href') || '';
            if(a.target === '_blank' || href.indexOf('http') === 0 || href.indexOf('mailto:') === 0 || href.charAt(0) === '#' || a.hasAttribute('download')) return;
            if(href.indexOf('.html') === -1) return;
            e.preventDefault();
            pt.classList.add('show');
            setTimeout(function(){ window.location.href = href; }, 280);
        });
    }

    /* Contact form (Formspree) */
    function initContactForm(){
        var form = document.getElementById('contact-form');
        if(!form) return;
        var status = document.getElementById('contact-status');
        form.addEventListener('submit', function(e){
            e.preventDefault();
            if(status){ status.className = 'form-status'; status.textContent = 'Sending...'; }
            var data = new FormData(form);
            fetch(form.action, {method:'POST', body:data, headers:{'Accept':'application/json'}})
                .then(function(r){
                    if(r.ok){
                        form.reset();
                        if(status){ status.className = 'form-status ok'; status.textContent = 'Message sent. We will reply within 2 business days.'; }
                    } else {
                        if(status){ status.className = 'form-status err'; status.textContent = 'Something went wrong. Please email us directly.'; }
                    }
                })
                .catch(function(){
                    if(status){ status.className = 'form-status err'; status.textContent = 'Network error. Please email us directly.'; }
                });
        });
    }

    /* Generic gallery lightbox (#lightbox with .lb-trigger items) */
    function initGalleryLightbox(){
        var lb = document.getElementById('lightbox');
        if(!lb) return;
        var img = document.getElementById('lb-img');
        var title = document.getElementById('lb-title');
        var desc = document.getElementById('lb-desc');
        var tag = document.getElementById('lb-tag');
        var closeBtn = document.getElementById('lb-close');
        var prevBtn = document.getElementById('lb-prev');
        var nextBtn = document.getElementById('lb-next');
        var triggers = Array.prototype.slice.call(document.querySelectorAll('.lb-trigger, .gallery-item'));
        var current = 0;

        function dataFor(el){
            var im = el.querySelector('img');
            return {
                src: el.getAttribute('data-src') || (im && im.src) || '',
                title: el.getAttribute('data-title') || (el.querySelector('.card-title') ? el.querySelector('.card-title').textContent : ''),
                desc: el.getAttribute('data-desc') || (el.querySelector('.card-desc') ? el.querySelector('.card-desc').textContent : ''),
                tag: el.getAttribute('data-tag') || (el.querySelector('.card-tag') ? el.querySelector('.card-tag').textContent : '')
            };
        }
        function show(i){
            if(!triggers.length) return;
            current = (i + triggers.length) % triggers.length;
            var d = dataFor(triggers[current]);
            if(img && d.src){ img.src = d.src; }
            if(title) title.textContent = d.title;
            if(desc) desc.textContent = d.desc;
            if(tag) tag.textContent = d.tag;
        }
        function open(i){ show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
        function close(){ lb.classList.remove('open'); document.body.style.overflow = ''; }

        triggers.forEach(function(el, i){
            el.addEventListener('click', function(ev){
                if(ev.target.closest('a')) return;
                open(i);
            });
        });
        if(closeBtn) closeBtn.addEventListener('click', close);
        if(prevBtn) prevBtn.addEventListener('click', function(){ show(current-1); });
        if(nextBtn) nextBtn.addEventListener('click', function(){ show(current+1); });
        lb.addEventListener('click', function(e){ if(e.target === lb) close(); });
        document.addEventListener('keydown', function(e){
            if(!lb.classList.contains('open')) return;
            if(e.key === 'Escape') close();
            else if(e.key === 'ArrowLeft') show(current-1);
            else if(e.key === 'ArrowRight') show(current+1);
        });
    }

    /* Gallery filter bar */
    function initFilters(){
        var bar = document.querySelector('.filter-bar');
        if(!bar) return;
        var btns = bar.querySelectorAll('.filter-btn');
        var items = document.querySelectorAll('.gallery-item');
        bar.addEventListener('click', function(e){
            var btn = e.target.closest('.filter-btn');
            if(!btn) return;
            btns.forEach(function(b){ b.classList.remove('active'); });
            btn.classList.add('active');
            var f = btn.getAttribute('data-filter') || 'all';
            items.forEach(function(it){
                var cat = it.getAttribute('data-category') || '';
                it.style.display = (f === 'all' || cat === f) ? '' : 'none';
            });
        });
    }

    /* Booking wizard (called from pricing.html) */
    function buildWizard(){
        if(document.getElementById('bw-overlay')) return;
        var ov = document.createElement('div');
        ov.id = 'bw-overlay';
        ov.className = 'bw-overlay';
        ov.setAttribute('role','dialog');
        ov.setAttribute('aria-modal','true');
        ov.setAttribute('aria-label','Start your AI project');
        ov.innerHTML =
            '<div class="bw-modal">' +
                '<button class="bw-close" aria-label="Close">✕</button>' +
                '<h3>Start Your AI Project</h3>' +
                '<p>Tell us what you need and we will reply within 2 business days.</p>' +
                '<form class="bw-form" action="https://formspree.io/f/mrerqkrv" method="POST">' +
                    '<input name="name" type="text" required placeholder="Your name">' +
                    '<input name="email" type="email" required placeholder="you@example.com">' +
                    '<select name="package" required>' +
                        '<option value="">Select a package</option>' +
                        '<option>Pro Creator Pack</option>' +
                        '<option>Custom Setup</option>' +
                        '<option>Training Session</option>' +
                        '<option>Other</option>' +
                    '</select>' +
                    '<textarea name="message" rows="4" placeholder="Describe your project..."></textarea>' +
                    '<button type="submit" class="btn btn--primary full">Send Request</button>' +
                    '<p class="form-status" aria-live="polite"></p>' +
                '</form>' +
            '</div>';
        document.body.appendChild(ov);
        var closeBtn = ov.querySelector('.bw-close');
        var form = ov.querySelector('form');
        var st = ov.querySelector('.form-status');
        closeBtn.addEventListener('click', closeWizard);
        ov.addEventListener('click', function(e){ if(e.target === ov) closeWizard(); });
        document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && ov.classList.contains('open')) closeWizard(); });
        form.addEventListener('submit', function(e){
            e.preventDefault();
            st.className = 'form-status'; st.textContent = 'Sending...';
            fetch(form.action, {method:'POST', body:new FormData(form), headers:{'Accept':'application/json'}})
                .then(function(r){
                    if(r.ok){ form.reset(); st.className = 'form-status ok'; st.textContent = 'Request sent. We will be in touch shortly.'; }
                    else{ st.className = 'form-status err'; st.textContent = 'Something went wrong. Please email us directly.'; }
                })
                .catch(function(){ st.className = 'form-status err'; st.textContent = 'Network error. Please email us directly.'; });
        });
    }
    function closeWizard(){
        var ov = document.getElementById('bw-overlay');
        if(ov){ ov.classList.remove('open'); document.body.style.overflow = ''; }
    }
    window.openBookingWizard = function(){
        buildWizard();
        var ov = document.getElementById('bw-overlay');
        ov.classList.add('open');
        document.body.style.overflow = 'hidden';
        var f = ov.querySelector('input');
        if(f) f.focus();
    };

    ready(function(){
        initNav();
        initProgress();
        initReveals();
        initOrbs();
        initPageTransition();
        initContactForm();
        initGalleryLightbox();
        initFilters();
    });
})();
