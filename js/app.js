// ============================================================ Kage-style WebGL runtime
// Midnight Walk — Three.js scene orchestrator
// Architecture: scroll-driven camera, procedural scene, foreground parallax

const CONFIG = {
  canvas: '#gl',
  camera: { fov: 50, near: 0.1, far: 200, position: [0, 6, 14] },
  scroll: { easing: 0.08, threshold: 0.001 },
  chapters: [
    { id: 'hero',       target: [0, 8, 14],  fov: 50  },
    { id: 'gate',       target: [0, 4, 8],   fov: 60  },
    { id: 'pathways',   target: [2, 3, 10],  fov: 55  },
    { id: 'lessons',    target: [-1, 5, 9],   fov: 58  },
    { id: 'eternity',   target: [0, 2, 12],   fov: 52  },
  ],
  fog: { color: 0x05070a, density: 0.035 },
  moon: { color: 0xdfe7e0, intensity: 0.6, position: [10, 20, -5] },
  ambient: { color: 0x0a0e12, intensity: 0.3 },
  controls: {
    enableDamping: true,
    dampingFactor: 0.05,
    maxPolarAngle: Math.PI * 0.48,
    minPolarAngle: Math.PI * 0.1,
    enableZoom: false,
    enablePan: false,
    rotateSpeed: 0.3,
  },
};

// ============================================================ State
const state = {
  scrollY: 0,
  targetScrollY: 0,
  currentChapter: 0,
  isWebGL: true,
  isMobile: /Mobi|Android/i.test(navigator.userAgent),
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ticking: false,
};

// ============================================================ DOM refs
const canvas = document.querySelector(CONFIG.canvas);
const pre = document.getElementById('pre');
const preFill = document.getElementById('pre-fill');
const prePct = document.getElementById('pre-pct');
const nav = document.getElementById('nav');
const navlinks = document.getElementById('navlinks');
const burger = document.querySelector('.nav-burger');
const cursor = document.getElementById('cursor');
const fgSky = document.getElementById('fg-sky');

// ============================================================ WebGL check
function checkWebGL() {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    return !!gl;
  } catch (e) { return false; }
}

if (!checkWebGL()) {
  state.isWebGL = false;
  document.body.classList.add('no-webgl');
  console.warn('WebGL not available — falling back to CSS scene');
}

// ============================================================ Preloader
const preItems = [
  { label: 'Scene', weight: 0.4 },
  { label: 'Lights', weight: 0.2 },
  { label: 'Camera', weight: 0.15 },
  { label: 'Atmosphere', weight: 0.25 },
];
let preProgress = 0;
let preIdx = 0;

function preTick() {
  if (preIdx < preItems.length) {
    preProgress += preItems[preIdx].weight;
    preIdx++;
    preFill.style.right = `${Math.min(preProgress * 100, 100)}%`;
    prePct.textContent = Math.round(Math.min(preProgress * 100, 100));
    setTimeout(preTick, 200 + Math.random() * 300);
  } else {
    pre.classList.add('done');
    initScene();
  }
}

// ============================================================ Three.js scene
let renderer, scene, camera, controls;
let moonLight, ambientLight;
let rainParticles, leafParticles;
let chapterMeshes = {};

function initScene() {
  if (!state.isWebGL) { showForegrounds(); return; }

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(CONFIG.fog.color, CONFIG.fog.density);
  scene.background = new THREE.Color(0x05070a);

  // Camera
  camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, CONFIG.camera.near, CONFIG.camera.far);
  camera.position.set(...CONFIG.camera.position);

  // Controls (Orbit-like, scroll-driven)
  controls = new THREE.OrbitControls(camera, canvas);
  Object.assign(controls, CONFIG.controls);
  controls.target.set(0, 3, 0);
  controls.update();

  // Lights
  ambientLight = new THREE.AmbientLight(CONFIG.ambient.color, CONFIG.ambient.intensity);
  scene.add(ambientLight);

  moonLight = new THREE.DirectionalLight(CONFIG.moon.color, CONFIG.moon.intensity);
  moonLight.position.set(...CONFIG.moon.position);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  moonLight.shadow.camera.near = 0.5;
  moonLight.shadow.camera.far = 60;
  moonLight.shadow.camera.left = -15;
  moonLight.shadow.camera.right = 15;
  moonLight.shadow.camera.top = 15;
  moonLight.shadow.camera.bottom = -15;
  scene.add(moonLight);

  // Warm lantern point light
  const lanternLight = new THREE.PointLight(0xff5a3c, 2, 15);
  lanternLight.position.set(0, 2, 0);
  scene.add(lanternLight);

  // Build scene elements
  buildTemple();
  buildTerrain();
  buildAtmosphere();

  // Events
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, { passive: true });
  canvas.addEventListener('pointermove', onPointerMove);
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('act'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('act'));
  });

  // Foregrounds
  setupForegrounds();
  setupNavigation();

  // Start
  animate();
}

// ============================================================ Scene building
function buildTemple() {
  const group = new THREE.Group();

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(60, 60);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0e12, roughness: 0.95, metalness: 0.0 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  group.add(ground);

  // Stone path
  const pathGeo = new THREE.PlaneGeometry(2, 20);
  const pathMat = new THREE.MeshStandardMaterial({ color: 0x1a1e22, roughness: 0.9, metalness: 0.0 });
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.y = -0.48;
  group.add(path);

  // Torii gate posts
  const postGeo = new THREE.BoxGeometry(0.4, 6, 0.4);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x1a0e08, roughness: 0.85, metalness: 0.1 });

  const leftPost = new THREE.Mesh(postGeo, postMat);
  leftPost.position.set(-3, 2.5, -8);
  leftPost.castShadow = true;
  group.add(leftPost);

  const rightPost = new THREE.Mesh(postGeo, postMat);
  rightPost.position.set(3, 2.5, -8);
  rightPost.castShadow = true;
  group.add(rightPost);

  // Torii crossbeam
  const beamGeo = new THREE.BoxGeometry(6.4, 0.3, 0.4);
  const beam = new THREE.Mesh(beamGeo, postMat);
  beam.position.set(0, 5.5, -8);
  beam.castShadow = true;
  group.add(beam);

  // Main gate structure (sanmon)
  const mainPostGeo = new THREE.BoxGeometry(0.8, 10, 0.8);
  const mainPostL = new THREE.Mesh(mainPostGeo, postMat);
  mainPostL.position.set(-2, 4.5, -12);
  mainPostL.castShadow = true;
  group.add(mainPostL);

  const mainPostR = new THREE.Mesh(mainPostGeo, postMat);
  mainPostR.position.set(2, 4.5, -12);
  mainPostR.castShadow = true;
  group.add(mainPostR);

  const mainBeamGeo = new THREE.BoxGeometry(5.2, 0.5, 0.8);
  const mainBeam = new THREE.Mesh(mainBeamGeo, postMat);
  mainBeam.position.set(0, 9.5, -12);
  mainBeam.castShadow = true;
  group.add(mainBeam);

  // Roof eaves
  const roofGeo = new THREE.BoxGeometry(5.8, 0.3, 3);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0e, roughness: 0.8, metalness: 0.05 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 10, -12);
  roof.castShadow = true;
  group.add(roof);

  // Lantern
  const lanternGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.7, metalness: 0.1 });
  const lantern = new THREE.Mesh(lanternGeo, lanternMat);
  lantern.position.set(0, 0.6, -5);
  lantern.castShadow = true;
  group.add(lantern);

  // Lantern light
  const lanternLight = new THREE.PointLight(0xff5a3c, 1.5, 8);
  lanternLight.position.set(0, 1.8, -5);
  group.add(lanternLight);

  // Paper screen glow inside gate
  const glowGeo = new THREE.PlaneGeometry(2, 3);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffa070, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(0, 5, -11.9);
  group.add(glow);

  chapterMeshes.temple = group;
  scene.add(group);
}

function buildTerrain() {
  const group = new THREE.Group();

  // Mossy ground
  const terrainGeo = new THREE.PlaneGeometry(80, 80, 64, 64);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.3 + Math.random() * 0.05;
    posAttr.setY(i, y);
  }
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({ color: 0x0f1a12, roughness: 0.95, metalness: 0.0 });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.3;
  terrain.receiveShadow = true;
  group.add(terrain);

  // Trees (simple cone + cylinder)
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 20;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const h = 2 + Math.random() * 4;
    const r = 0.3 + Math.random() * 0.4;

    const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, h * 0.3, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, h * 0.15 - 0.3, z);
    trunk.castShadow = true;
    group.add(trunk);

    const foliageGeo = new THREE.ConeGeometry(r, h * 0.7, 8);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x0f1f0a, roughness: 0.9, flatShading: true });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.set(x, h * 0.6 - 0.3, z);
    foliage.castShadow = true;
    group.add(foliage);
  }

  chapterMeshes.terrain = group;
  scene.add(group);
}

function buildAtmosphere() {
  // Rain particles
  if (!state.isMobile) {
    const rainCount = 2000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 40;
      rainPos[i * 3 + 1] = Math.random() * 20;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0x8899aa, size: 0.05, transparent: true, opacity: 0.4 });
    rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);
  }

  // Leaf particles
  if (!state.isMobile) {
    const leafCount = 300;
    const leafGeo = new THREE.BufferGeometry();
    const leafPos = new Float32Array(leafCount * 3);
    for (let i = 0; i < leafCount; i++) {
      leafPos[i * 3] = (Math.random() - 0.5) * 30;
      leafPos[i * 3 + 1] = 5 + Math.random() * 15;
      leafPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    leafGeo.setAttribute('position', new THREE.BufferAttribute(leafPos, 3));
    const leafMat = new THREE.PointsMaterial({ color: 0x8b4513, size: 0.12, transparent: true, opacity: 0.6 });
    leafParticles = new THREE.Points(leafGeo, leafMat);
    scene.add(leafParticles);
  }

  // Moon
  const moonGeo = new THREE.SphereGeometry(1, 32, 32);
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xdfe7e0 });
  const moon = new THREE.Mesh(moonGeo, moonMat);
  moon.scale.setScalar(3);
  moon.position.set(15, 18, -20);
  scene.add(moon);

  // Moon glow
  const glowGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xdfe7e0, transparent: true, opacity: 0.08 });
  const glow = new THREE.Mesh(glowGeo, moonMat);
  glow.scale.setScalar(3);
  glow.position.copy(moon.position);
  scene.add(glow);
}

// ============================================================ Foreground system
let fgElements = [];

function setupForegrounds() {
  if (!fgSky) return;
  document.querySelectorAll('.fg').forEach(fg => {
    const fgData = fg.dataset.fg;
    const imgs = fg.querySelectorAll('.fg-el > img');
    imgs.forEach(img => {
      const el = img.parentElement;
      const rect = img.getBoundingClientRect();
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `position:absolute;left:${el.offsetLeft}px;bottom:${el.offsetBottom}px;width:${rect.width}px;overflow:visible;pointer-events:none;`;
      const clone = img.cloneNode(true);
      clone.style.cssText = 'width:100%;height:auto;display:block;filter:saturate(.88) brightness(.86);';
      wrapper.appendChild(clone);
      fgSky.appendChild(wrapper);
      fgElements.push({ el: wrapper, data: el.dataset.fgIn, originalLeft: el.offsetLeft });
    });
  });
}

function showForegrounds() {
  document.querySelectorAll('.fg').forEach(fg => {
    fg.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;z-index:1;pointer-events:none;';
  });
}

// ============================================================ Scroll → camera
function onScroll() {
  state.targetScrollY = window.scrollY;
}

function onResize() {
  if (!renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(e) {
  if (cursor) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }
}

// ============================================================ Navigation
function setupNavigation() {
  // Burger
  if (burger) {
    burger.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
      burger.classList.toggle('active');
      nav.classList.toggle('menu-open');
    });
  }

  // Nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      document.body.classList.remove('nav-open');
      burger.classList.remove('active');
      nav.classList.remove('menu-open');
    });
  });

  // Chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const idx = parseInt(chip.dataset.chip);
      const section = CONFIG.chapters[idx + 1]?.id;
      if (section) document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Card clicks
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = Array.from(card.parentNode.children).indexOf(card);
      const section = CONFIG.chapters[idx + 1]?.id;
      if (section) document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Lesson clicks
  document.querySelectorAll('.les').forEach(les => {
    les.addEventListener('click', () => {
      const target = les.closest('.sec');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // CTA
  document.querySelector('.cta')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Peek
  document.querySelector('.peek')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('pathways')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Arrowlink
  document.querySelector('.arrowlink')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('pathways')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ============================================================ Animation loop
let lastTime = 0;

function animate(time = 0) {
  requestAnimationFrame(animate);

  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  // Smooth scroll
  state.scrollY += (state.targetScrollY - state.scrollY) * CONFIG.scroll.easing;
  if (Math.abs(state.scrollY - state.targetScrollY) < CONFIG.scroll.threshold) {
    state.scrollY = state.targetScrollY;
  }

  // Chapter detection
  const sections = CONFIG.chapters;
  let newChapter = 0;
  for (let i = sections.length - 1; i >= 0; i--) {
    const el = document.getElementById(sections[i].id);
    if (el && el.offsetTop - window.innerHeight * 0.4 <= state.scrollY) {
      newChapter = i;
      break;
    }
  }
  state.currentChapter = newChapter;

  // Camera interpolation
  if (controls && !state.prefersReducedMotion) {
    const target = sections[newChapter];
    const tx = target.target[0];
    const ty = target.target[1];
    const tz = target.target[2];
    controls.target.lerp(new THREE.Vector3(tx, ty, tz), 0.02);
    camera.fov += (target.fov - camera.fov) * 0.02;
    camera.updateProjectionMatrix();
  }

  // Particle animation
  if (rainParticles && !state.prefersReducedMotion) {
    const positions = rainParticles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] -= 0.3;
      if (positions[i + 1] < -1) positions[i + 1] = 20;
    }
    rainParticles.geometry.attributes.position.needsUpdate = true;
  }

  if (leafParticles && !state.prefersReducedMotion) {
    const positions = leafParticles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.sin(time * 0.001 + i) * 0.01;
      positions[i + 1] -= 0.02;
      positions[i + 2] += Math.cos(time * 0.001 + i * 0.5) * 0.005;
      if (positions[i + 1] < -1) positions[i + 1] = 20;
    }
    leafParticles.geometry.attributes.position.needsUpdate = true;
  }

  // Foreground parallax
  if (fgElements.length > 0 && !state.prefersReducedMotion) {
    const scrollRatio = state.scrollY / (document.body.scrollHeight - window.innerHeight);
    fgElements.forEach((fg, i) => {
      const speed = 0.05 + i * 0.02;
      const yOffset = scrollRatio * 60 * speed;
      fg.el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
    });
  }

  // Nav scroll state
  if (nav) {
    if (state.scrollY > 80) nav.classList.add('stuck');
    else nav.classList.remove('stuck');
    if (state.scrollY > window.innerHeight * 2) nav.classList.add('hide');
    else nav.classList.remove('hide');
  }

  // Active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('on');
    const href = link.getAttribute('href');
    if (href) {
      const section = document.querySelector(href);
      if (section) {
        const top = section.offsetTop - 100;
        const bottom = top + section.offsetHeight;
        if (state.scrollY >= top && state.scrollY < bottom) link.classList.add('on');
      }
    }
  });

  // Active chip
  document.querySelectorAll('.chip').forEach(chip => {
    chip.classList.toggle('on', parseInt(chip.dataset.chip) === newChapter - 1);
  });

  // Reveal animations
  document.querySelectorAll('[data-rv]').forEach(el => {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
    if (inView) el.classList.add('rv-in');
  });

  // Foreground entrance
  document.querySelectorAll('.fg').forEach(fg => {
    const rect = fg.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      fg.classList.add('fg-active');
      fg.classList.remove('fg-retiring');
    } else if (fg.classList.contains('fg-active')) {
      fg.classList.add('fg-retiring');
      fg.classList.remove('fg-active');
    }
  });

  controls?.update();
  renderer?.render(scene, camera);
}

// ============================================================ Reduced motion
if (state.prefersReducedMotion) {
  document.querySelectorAll('[data-rv]').forEach(el => el.classList.add('rv-in'));
  document.querySelectorAll('.fg-el').forEach(el => el.style.opacity = '1');
}

// ============================================================ Init preloader
preTick();
