// 3D moon for the hero, built with three.js.
// If WebGL or the CDN fails, the CSS planet stays visible as a fallback.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const host = document.querySelector('.hero__sky .planet');
if (host && window.WebGLRenderingContext) {
  try { init(); } catch (e) { console.warn('[moon3d]', e); }
}

function init() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.className = 'moon3d';
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 5.2);

  /* ---- surface texture, drawn on a canvas ---- */
  const W = 1024, H = 512;
  const tex = document.createElement('canvas'); tex.width = W; tex.height = H;
  const g = tex.getContext('2d');
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const base = g.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, '#56669c'); base.addColorStop(0.5, '#3d4d84'); base.addColorStop(1, '#2c3a6c');
  g.fillStyle = base; g.fillRect(0, 0, W, H);

  // soft dark "seas" and light highlands
  for (let i = 0; i < 70; i++) {
    const x = rand() * W, y = H * (0.15 + rand() * 0.7), r = 30 + rand() * 120;
    const dark = rand() < 0.55;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, dark ? 'rgba(20,30,70,0.35)' : 'rgba(200,215,255,0.12)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    for (const dx of [-W, 0, W]) { g.beginPath(); g.ellipse(x + dx, y, r * 1.4, r, 0, 0, Math.PI * 2); g.fill(); }
  }
  // fine grain
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = rand() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,20,0.07)';
    g.fillRect(rand() * W, rand() * H, 1 + rand() * 2, 1 + rand() * 2);
  }
  // craters (stretched sideways near the poles so they look round on the sphere)
  for (let i = 0; i < 140; i++) {
    const y = H * (0.08 + rand() * 0.84), x = rand() * W;
    const lat = (y / H - 0.5) * Math.PI;
    const r = (rand() < 0.88 ? 3 + rand() * 9 : 14 + rand() * 22);
    const sx = 1 / Math.max(Math.cos(lat), 0.25);
    for (const dx of [-W, 0, W]) {
      g.save(); g.translate(x + dx, y); g.scale(sx, 1);
      const inner = g.createRadialGradient(-r * 0.15, -r * 0.15, 0, 0, 0, r);
      inner.addColorStop(0, 'rgba(15,22,55,0.55)'); inner.addColorStop(0.75, 'rgba(25,35,80,0.35)'); inner.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = inner; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(215,226,255,0.22)'; g.lineWidth = Math.max(1, r * 0.12);
      g.beginPath(); g.arc(0, 0, r * 0.95, Math.PI * 0.1, Math.PI * 1.05); g.stroke();
      g.restore();
    }
  }
  const map = new THREE.CanvasTexture(tex);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  /* ---- moon ---- */
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 64),
    new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: 2.2, roughness: 1, metalness: 0 })
  );
  const tilt = new THREE.Group();
  tilt.rotation.z = -0.22;
  tilt.add(moon);
  scene.add(tilt);

  // soft periwinkle rim glow
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.06, 64, 48),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
      uniforms: { c: { value: new THREE.Color('#8ea8ff') } },
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.75 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(c, clamp(i,0.0,1.0)*0.9); }'
    })
  );
  scene.add(glow);

  /* ---- orbit ring + small moonlet ---- */
  const orbit = new THREE.Group();
  orbit.rotation.set(1.28, 0, -0.24);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.0045, 8, 240),
    new THREE.MeshBasicMaterial({ color: '#c3d1ff', transparent: true, opacity: 0.55 })
  );
  orbit.add(ring);
  const moonlet = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 24, 16),
    new THREE.MeshStandardMaterial({ color: '#f4f0e8', emissive: '#c3d1ff', emissiveIntensity: 0.35, roughness: 0.8 })
  );
  orbit.add(moonlet);
  scene.add(orbit);

  /* ---- light ---- */
  scene.add(new THREE.AmbientLight('#4a5ca8', 0.55));
  const sun = new THREE.DirectionalLight('#f4f0e8', 2.6);
  sun.position.set(-3, 2.2, 3.5);
  scene.add(sun);
  const back = new THREE.DirectionalLight('#8ea8ff', 0.9);
  back.position.set(3, -1, -2);
  scene.add(back);

  /* ---- size ---- */
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  /* ---- interaction: follow the mouse a little, drag to spin ---- */
  let tx = 0, ty = 0, dragging = false, lastX = 0, spinV = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.5;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.35;
    if (dragging) { spinV = (e.clientX - lastX) * 0.006; moon.rotation.y += spinV; lastX = e.clientX; }
  }, { passive: true });
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  const stop = () => { dragging = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  /* ---- loop, paused when the hero is off screen ---- */
  let visible = true, running = false, t0 = performance.now();
  const start = () => { if (!running && visible && !reduce) { running = true; requestAnimationFrame(loop); } };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; start(); }).observe(canvas);

  function draw(t) {
    const s = (t - t0) / 1000;
    if (!dragging) { spinV *= 0.95; moon.rotation.y += 0.0016 + spinV; }
    tilt.rotation.x += (ty - tilt.rotation.x) * 0.05;
    tilt.rotation.y += (tx - tilt.rotation.y) * 0.05;
    orbit.rotation.y = tilt.rotation.y * 0.6;
    const a = s * 0.35;
    moonlet.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0);
    renderer.render(scene, camera);
  }
  function loop(t) {
    if (!visible) { running = false; return; }
    draw(t);
    requestAnimationFrame(loop);
  }

  if (reduce) draw(performance.now());
  else start();

  host.closest('.hero__sky').classList.add('has-3d');
}
