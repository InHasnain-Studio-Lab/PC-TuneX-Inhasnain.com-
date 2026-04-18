/* ============================================================
   INHASNAIN — WebGL2 FLUID INK SIMULATION
   Navier-Stokes GPU solver with interactive mouse splats
   ============================================================ */
(function () {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'fluid-canvas';
  document.body.prepend(canvas);

  const params = {
    SIM_RES: 128,
    DYE_RES: 1024,
    SPLAT_RADIUS: 0.25,
    SPLAT_FORCE: 6000,
    CURL: 30,
    PRESSURE_ITER: 20,
    VELOCITY_DISSIPATION: 0.2,
    DYE_DISSIPATION: 1.0,
    AUTO_SPLAT_INTERVAL: 2500,
  };

  const PALETTE = [
    [0.482, 0.184, 1.0],   // purple
    [0.0, 0.831, 1.0],     // cyan
    [1.0, 0.176, 0.471],   // magenta
    [0.0, 1.0, 0.612],     // green-neo
    [1.0, 0.843, 0.0],     // gold
  ];

  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });
  if (!gl) return; // fallback: no WebGL2

  const ext = gl.getExtension('EXT_color_buffer_float');
  if (!ext) return;
  gl.getExtension('OES_texture_float_linear');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', () => { resize(); initFBOs(); });

  /* ── Shader compilation ── */
  const baseVS = `#version 300 es
    precision highp float;
    in vec2 aPos;
    out vec2 vUv;
    void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  function createProgram(fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compileShader(gl.VERTEX_SHADER, baseVS));
    gl.attachShader(p, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    const uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      uniforms[info.name] = gl.getUniformLocation(p, info.name);
    }
    return { program: p, uniforms };
  }

  /* ── Fragment shaders ── */
  const splatFS = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uTarget;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    uniform float aspectRatio;
    out vec4 fragColor;
    void main(){
      vec2 p = vUv - point;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p,p)/radius) * color;
      vec3 base = texture(uTarget, vUv).xyz;
      fragColor = vec4(base + splat, 1.0);
    }`;

  const advectionFS = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    out vec4 fragColor;
    void main(){
      vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
      fragColor = dissipation * texture(uSource, coord);
      fragColor.a = 1.0;
    }`;

  const divergenceFS = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uVelocity;
    uniform vec2 texelSize;
    out vec4 fragColor;
    void main(){
      float L = texture(uVelocity, vUv - vec2(texelSize.x,0)).x;
      float R = texture(uVelocity, vUv + vec2(texelSize.x,0)).x;
      float T = texture(uVelocity, vUv + vec2(0,texelSize.y)).y;
      float B = texture(uVelocity, vUv - vec2(0,texelSize.y)).y;
      fragColor = vec4(0.5*(R - L + T - B), 0.0, 0.0, 1.0);
    }`;

  const curlFS = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uVelocity;
    uniform vec2 texelSize;
    out vec4 fragColor;
    void main(){
      float L = texture(uVelocity, vUv - vec2(texelSize.x,0)).y;
      float R = texture(uVelocity, vUv + vec2(texelSize.x,0)).y;
      float T = texture(uVelocity, vUv + vec2(0,texelSize.y)).x;
      float B = texture(uVelocity, vUv - vec2(0,texelSize.y)).x;
      fragColor = vec4(R - L - T + B, 0.0, 0.0, 1.0);
    }`;

  const vorticityFS = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform vec2 texelSize;
    uniform float curl;
    uniform float dt;
    out vec4 fragColor;
    void main(){
      float L = texture(uCurl, vUv - vec2(texelSize.x,0)).x;
      float R = texture(uCurl, vUv + vec2(texelSize.x,0)).x;
      float T = texture(uCurl, vUv + vec2(0,texelSize.y)).x;
      float B = texture(uCurl, vUv - vec2(0,texelSize.y)).x;
      float C = texture(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      float len = length(force) + 1e-5;
      force = force / len * curl * C;
      vec2 vel = texture(uVelocity, vUv).xy + force * dt;
      fragColor = vec4(vel, 0.0, 1.0);
    }`;

  const pressureFS = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 texelSize;
    out vec4 fragColor;
    void main(){
      float L = texture(uPressure, vUv - vec2(texelSize.x,0)).x;
      float R = texture(uPressure, vUv + vec2(texelSize.x,0)).x;
      float T = texture(uPressure, vUv + vec2(0,texelSize.y)).x;
      float B = texture(uPressure, vUv - vec2(0,texelSize.y)).x;
      float div = texture(uDivergence, vUv).x;
      fragColor = vec4((L + R + T + B - div) * 0.25, 0.0, 0.0, 1.0);
    }`;

  const gradSubFS = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    uniform vec2 texelSize;
    out vec4 fragColor;
    void main(){
      float L = texture(uPressure, vUv - vec2(texelSize.x,0)).x;
      float R = texture(uPressure, vUv + vec2(texelSize.x,0)).x;
      float T = texture(uPressure, vUv + vec2(0,texelSize.y)).x;
      float B = texture(uPressure, vUv - vec2(0,texelSize.y)).x;
      vec2 vel = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
      fragColor = vec4(vel, 0.0, 1.0);
    }`;

  const displayFS = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uTexture;
    out vec4 fragColor;
    void main(){
      vec3 c = texture(uTexture, vUv).rgb;
      float a = max(c.r, max(c.g, c.b));
      fragColor = vec4(c, a * 0.88);
    }`;

  const clearFS = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    out vec4 fragColor;
    void main(){ fragColor = value * texture(uTexture, vUv); }`;

  /* ── Compile programs ── */
  const splatProg      = createProgram(splatFS);
  const advectionProg  = createProgram(advectionFS);
  const divergenceProg = createProgram(divergenceFS);
  const curlProg       = createProgram(curlFS);
  const vorticityProg  = createProgram(vorticityFS);
  const pressureProg   = createProgram(pressureFS);
  const gradSubProg    = createProgram(gradSubFS);
  const displayProg    = createProgram(displayFS);
  const clearProg      = createProgram(clearFS);

  /* ── Fullscreen quad ── */
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  function blit(target) {
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.width, target.height);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* ── FBO helpers ── */
  function createFBO(w, h, internalFormat, format, type, filter) {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture: tex, fbo, width: w, height: h, attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; } };
  }

  function createDoubleFBO(w, h, internalFormat, format, type, filter) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, filter);
    let fbo2 = createFBO(w, h, internalFormat, format, type, filter);
    return {
      width: w, height: h,
      get read() { return fbo1; },
      set read(v) { fbo1 = v; },
      get write() { return fbo2; },
      set write(v) { fbo2 = v; },
      swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; }
    };
  }

  let velocity, dye, pressure, divergenceFBO, curlFBO;

  function getResolution(res) {
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1.0 / aspect;
    const min = Math.round(res);
    const max = Math.round(res * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
  }

  function initFBOs() {
    const simRes = getResolution(params.SIM_RES);
    const dyeRes = getResolution(params.DYE_RES);
    const texType = gl.HALF_FLOAT;
    const rgba = gl.RGBA16F;
    const rg = gl.RG16F;
    const r = gl.R16F;
    const filter = gl.LINEAR;

    velocity = createDoubleFBO(simRes.width, simRes.height, rg, gl.RG, texType, filter);
    dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba, gl.RGBA, texType, filter);
    pressure = createDoubleFBO(simRes.width, simRes.height, r, gl.RED, texType, gl.NEAREST);
    divergenceFBO = createFBO(simRes.width, simRes.height, r, gl.RED, texType, gl.NEAREST);
    curlFBO = createFBO(simRes.width, simRes.height, r, gl.RED, texType, gl.NEAREST);
  }
  initFBOs();

  /* ── Simulation step ── */
  function useProg(p) {
    gl.useProgram(p.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    const loc = gl.getAttribLocation(p.program, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  function step(dt) {
    // Curl
    useProg(curlProg);
    gl.uniform2f(curlProg.uniforms.texelSize, velocity.width, velocity.height);
    gl.uniform1i(curlProg.uniforms.uVelocity, velocity.read.attach(0));
    blit(curlFBO);

    // Vorticity
    useProg(vorticityProg);
    gl.uniform2f(vorticityProg.uniforms.texelSize, velocity.width, velocity.height);
    gl.uniform1i(vorticityProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProg.uniforms.uCurl, curlFBO.attach(1));
    gl.uniform1f(vorticityProg.uniforms.curl, params.CURL);
    gl.uniform1f(vorticityProg.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    // Divergence
    useProg(divergenceProg);
    gl.uniform2f(divergenceProg.uniforms.texelSize, velocity.width, velocity.height);
    gl.uniform1i(divergenceProg.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergenceFBO);

    // Clear pressure
    useProg(clearProg);
    gl.uniform1i(clearProg.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProg.uniforms.value, 0.8);
    blit(pressure.write);
    pressure.swap();

    // Pressure solve (Jacobi)
    useProg(pressureProg);
    gl.uniform2f(pressureProg.uniforms.texelSize, velocity.width, velocity.height);
    gl.uniform1i(pressureProg.uniforms.uDivergence, divergenceFBO.attach(0));
    for (let i = 0; i < params.PRESSURE_ITER; i++) {
      gl.uniform1i(pressureProg.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    // Gradient subtract
    useProg(gradSubProg);
    gl.uniform2f(gradSubProg.uniforms.texelSize, velocity.width, velocity.height);
    gl.uniform1i(gradSubProg.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradSubProg.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    // Advect velocity
    useProg(advectionProg);
    gl.uniform2f(advectionProg.uniforms.texelSize, 1.0 / velocity.width, 1.0 / velocity.height);
    gl.uniform1i(advectionProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProg.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(advectionProg.uniforms.dt, dt);
    gl.uniform1f(advectionProg.uniforms.dissipation, 1.0 - params.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    // Advect dye
    gl.uniform2f(advectionProg.uniforms.texelSize, 1.0 / dye.width, 1.0 / dye.height);
    gl.uniform1i(advectionProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProg.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advectionProg.uniforms.dissipation, 1.0 - params.DYE_DISSIPATION);
    blit(dye.write);
    dye.swap();
  }

  /* ── Splat ── */
  function splat(x, y, dx, dy, color) {
    useProg(splatProg);
    gl.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProg.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProg.uniforms.point, x, y);
    gl.uniform3f(splatProg.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(splatProg.uniforms.radius, params.SPLAT_RADIUS / 100.0);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(splatProg.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProg.uniforms.color, color[0], color[1], color[2]);
    blit(dye.write);
    dye.swap();
  }

  function randomSplat() {
    const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const x = Math.random();
    const y = Math.random();
    const dx = (Math.random() - 0.5) * params.SPLAT_FORCE;
    const dy = (Math.random() - 0.5) * params.SPLAT_FORCE;
    splat(x, y, dx, dy, [c[0] * 0.6, c[1] * 0.6, c[2] * 0.6]);
  }

  // Initial splats
  for (let i = 0; i < 5; i++) setTimeout(randomSplat, i * 120);

  // Auto splats
  setInterval(randomSplat, params.AUTO_SPLAT_INTERVAL);

  /* ── Mouse / touch input ── */
  let pointer = { x: 0, y: 0, dx: 0, dy: 0, down: false, moved: false };

  canvas.addEventListener('pointermove', e => {
    const nx = e.offsetX / canvas.clientWidth;
    const ny = 1.0 - e.offsetY / canvas.clientHeight;
    pointer.dx = (nx - pointer.x) * params.SPLAT_FORCE;
    pointer.dy = (ny - pointer.y) * params.SPLAT_FORCE;
    pointer.x = nx;
    pointer.y = ny;
    pointer.moved = true;
  });

  canvas.addEventListener('pointerdown', () => { pointer.down = true; });
  window.addEventListener('pointerup', () => { pointer.down = false; });

  /* ── Render loop ── */
  let lastTime = performance.now();

  function render() {
    const now = performance.now();
    let dt = (now - lastTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastTime = now;

    if (pointer.moved) {
      pointer.moved = false;
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      splat(pointer.x, pointer.y, pointer.dx, pointer.dy, [c[0] * 0.4, c[1] * 0.4, c[2] * 0.4]);
    }

    step(dt);

    // Display
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    useProg(displayProg);
    gl.uniform1i(displayProg.uniforms.uTexture, dye.read.attach(0));
    blit(null);

    requestAnimationFrame(render);
  }
  render();

  /* ── Expose palette update for time-aware theming ── */
  window._fluidSetPalette = function (newPalette) {
    PALETTE.length = 0;
    newPalette.forEach(c => PALETTE.push(c));
  };

})();
