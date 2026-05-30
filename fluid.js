/* ============================================================
 InHasnain Studio X - fluid.js
 Live aurora mesh background. Graphite / platinum / champagne.
 Bold but luxurious. GPU-light: low-res buffer, blurred upscale.
 Disabled under prefers-reduced-motion (CSS shows static gradient).
 ============================================================ */
(function(){
    'use strict';
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function start(){
        var canvas = document.createElement('canvas');
        canvas.id = 'bg-canvas';
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var SCALE = 0.18;
        var vw, vh, bw, bh;

        var blobs = [
            { hue:'rgba(168,186,206,', baseR:0.55, ax:0.22, ay:0.16, sx:0.00021, sy:0.00017, px:0.0, py:1.3, a:0.55 },
            { hue:'rgba(205,184,146,', baseR:0.50, ax:0.26, ay:0.20, sx:0.00016, sy:0.00024, px:2.1, py:0.4, a:0.50 },
            { hue:'rgba(120,140,170,', baseR:0.62, ax:0.20, ay:0.24, sx:0.00013, sy:0.00019, px:4.0, py:2.7, a:0.45 },
            { hue:'rgba(225,214,190,', baseR:0.42, ax:0.30, ay:0.14, sx:0.00027, sy:0.00012, px:1.0, py:3.6, a:0.38 },
            { hue:'rgba(90,104,128,',  baseR:0.70, ax:0.16, ay:0.28, sx:0.00011, sy:0.00015, px:5.2, py:1.9, a:0.40 }
        ];

        function resize(){
            vw = window.innerWidth; vh = window.innerHeight;
            bw = canvas.width  = Math.max(2, Math.round(vw * SCALE));
            bh = canvas.height = Math.max(2, Math.round(vh * SCALE));
            canvas.style.width = vw + 'px';
            canvas.style.height = vh + 'px';
        }

        function draw(t){
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#06070a';
            ctx.fillRect(0, 0, bw, bh);
            ctx.globalCompositeOperation = 'lighter';

            for(var i=0;i<blobs.length;i++){
                var b = blobs[i];
                var cx = (0.5 + Math.sin(t*b.sx + b.px) * b.ax) * bw;
                var cy = (0.5 + Math.cos(t*b.sy + b.py) * b.ay) * bh;
                var r  = (b.baseR + 0.06*Math.sin(t*b.sx*1.7 + b.px)) * Math.max(bw,bh);
                var g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
                g.addColorStop(0, b.hue + b.a + ')');
                g.addColorStop(0.5, b.hue + (b.a*0.35) + ')');
                g.addColorStop(1, b.hue + '0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI*2);
                ctx.fill();
            }
            requestAnimationFrame(draw);
        }

        resize();
        window.addEventListener('resize', resize);
        requestAnimationFrame(draw);
    }

    if(document.readyState !== 'loading'){ start(); }
    else{ document.addEventListener('DOMContentLoaded', start); }
})();
