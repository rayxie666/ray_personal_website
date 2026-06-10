/* ============================================================
   3D 交互水波 — GPU 高度场波动模拟 (ping-pong FBO)
   鼠标滑过水面产生涟漪，点击激起大水花，空闲时自动落雨
   ============================================================ */
import * as THREE from 'three';

const canvas = document.getElementById('water-canvas');

const SIM_RES = 256;        // 模拟分辨率
const PLANE_SIZE = 60;      // 水面边长（世界单位）
const SUBSTEPS = 2;         // 每帧模拟子步数（波传播更快更顺滑）

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
  console.warn('WebGL 初始化失败，跳过水波特效', e);
  window.dispatchEvent(new Event('water-ready'));
}

if (renderer) init();

function init() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 6.5, 16);
  const lookTarget = new THREE.Vector3(0, 2.4, -12);

  const sunDir = new THREE.Vector3(0.5, 0.26, -1.0).normalize();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- 波动模拟（ping-pong 渲染目标） ---------------- */
  const rtOptions = {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  };
  let rtA = new THREE.WebGLRenderTarget(SIM_RES, SIM_RES, rtOptions);
  let rtB = new THREE.WebGLRenderTarget(SIM_RES, SIM_RES, rtOptions);

  const simScene = new THREE.Scene();
  const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const MAX_DROPS = 4;
  const simMaterial = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uPrev: { value: null },
      uTexel: { value: new THREE.Vector2(1 / SIM_RES, 1 / SIM_RES) },
      uDamping: { value: 0.986 },
      uSpeed: { value: 0.55 },
      uDrops: { value: Array.from({ length: MAX_DROPS }, () => new THREE.Vector4()) },
      uDropCount: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uPrev;
      uniform vec2 uTexel;
      uniform float uDamping;
      uniform float uSpeed;
      uniform vec4 uDrops[${MAX_DROPS}];
      uniform int uDropCount;
      varying vec2 vUv;

      void main() {
        vec2 data = texture2D(uPrev, vUv).rg;   // r: 高度, g: 速度
        float l = texture2D(uPrev, vUv - vec2(uTexel.x, 0.0)).r;
        float r = texture2D(uPrev, vUv + vec2(uTexel.x, 0.0)).r;
        float b = texture2D(uPrev, vUv - vec2(0.0, uTexel.y)).r;
        float t = texture2D(uPrev, vUv + vec2(0.0, uTexel.y)).r;

        // 离散波动方程
        float lap = (l + r + b + t) * 0.25 - data.x;
        float vel = (data.y + lap * uSpeed) * uDamping;
        float h = (data.x + vel) * 0.999;

        // 注入水滴（高斯凸起）
        for (int i = 0; i < ${MAX_DROPS}; i++) {
          if (i >= uDropCount) break;
          vec4 drop = uDrops[i];
          float d = distance(vUv, drop.xy);
          h += drop.w * exp(-d * d / (drop.z * drop.z));
        }

        // 边界吸收，避免生硬反射
        float edge = smoothstep(0.0, 0.06, vUv.x) * smoothstep(0.0, 0.06, 1.0 - vUv.x)
                   * smoothstep(0.0, 0.06, vUv.y) * smoothstep(0.0, 0.06, 1.0 - vUv.y);
        h *= edge;
        vel *= edge;

        gl_FragColor = vec4(h, vel, 0.0, 1.0);
      }
    `,
  });
  simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial));

  /* ---------------- 水面渲染 ---------------- */
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uHeightTex: { value: rtA.texture },
      uTexel: { value: new THREE.Vector2(1 / SIM_RES, 1 / SIM_RES) },
      uAmp: { value: 0.55 },
      uTime: { value: 0 },
      uSunDir: { value: sunDir },
      uDeepColor: { value: new THREE.Color(0.004, 0.025, 0.065) },
      uShallowColor: { value: new THREE.Color(0.03, 0.34, 0.46) },
      uNormalStrength: { value: 55.0 },
    },
    vertexShader: /* glsl */ `
      uniform sampler2D uHeightTex;
      uniform float uAmp;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vUv = uv;
        float h = texture2D(uHeightTex, uv).r;
        vec3 pos = position;
        // 大尺度缓涌，让水面永远在呼吸
        pos.z += sin(pos.x * 0.18 + uTime * 0.6) * cos(pos.y * 0.15 + uTime * 0.45) * 0.15;
        pos.z += h * uAmp;
        vec4 wp = modelMatrix * vec4(pos, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uHeightTex;
      uniform vec2 uTexel;
      uniform float uTime;
      uniform vec3 uSunDir;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform float uNormalStrength;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      vec3 skyColor(vec3 rd) {
        float t = clamp(rd.y, 0.0, 1.0);
        vec3 sky = mix(vec3(0.045, 0.07, 0.17), vec3(0.008, 0.014, 0.045), pow(t, 0.6));
        sky += vec3(0.09, 0.05, 0.16) * pow(1.0 - t, 4.0);          // 地平线紫晕
        float s = max(dot(rd, uSunDir), 0.0);
        sky += vec3(0.95, 0.98, 1.0) * pow(s, 600.0) * 3.0;         // 月亮
        sky += vec3(0.35, 0.55, 1.0) * pow(s, 12.0) * 0.4;          // 月华
        return sky;
      }

      void main() {
        float hl = texture2D(uHeightTex, vUv - vec2(uTexel.x, 0.0)).r;
        float hr = texture2D(uHeightTex, vUv + vec2(uTexel.x, 0.0)).r;
        float hb = texture2D(uHeightTex, vUv - vec2(0.0, uTexel.y)).r;
        float ht = texture2D(uHeightTex, vUv + vec2(0.0, uTexel.y)).r;
        float h  = texture2D(uHeightTex, vUv).r;

        // 由高度场梯度推导法线（平面已绕 X 轴旋转 -90°）
        vec3 normal = normalize(vec3(
          -(hr - hl) * uNormalStrength,
          1.0,
          (ht - hb) * uNormalStrength
        ));

        // 微细波纹扰动，避免静水呆板
        vec2 d1 = vec2(sin(vWorldPos.x * 1.7 + uTime * 1.4), cos(vWorldPos.z * 1.5 + uTime * 1.1)) * 0.018;
        vec2 d2 = vec2(sin(vWorldPos.x * 3.3 - uTime * 0.9 + vWorldPos.z), cos(vWorldPos.z * 2.9 + uTime * 1.7)) * 0.009;
        normal = normalize(normal + vec3(d1.x + d2.x, 0.0, d1.y + d2.y));

        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        vec3 reflDir = reflect(-viewDir, normal);
        reflDir.y = abs(reflDir.y);

        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
        fresnel = mix(0.04, 0.8, fresnel);

        float crest = clamp(h * 2.2 + 0.15, 0.0, 1.0);
        vec3 base = mix(uDeepColor, uShallowColor, crest * 0.8);
        vec3 col = mix(base, skyColor(reflDir), fresnel);

        // 月光镜面高光
        vec3 halfDir = normalize(uSunDir + viewDir);
        col += vec3(0.9, 0.95, 1.0) * pow(max(dot(normal, halfDir), 0.0), 240.0) * 1.1;

        // 波峰青色辉光
        col += uShallowColor * pow(max(h * 2.0, 0.0), 2.0) * 0.45;

        // gamma 校正
        col = pow(col, vec3(0.4545));

        // 远处雾化，与页面背景无缝融合
        float dist = length(vWorldPos.xz - cameraPosition.xz);
        float fog = smoothstep(18.0, 52.0, dist);
        col = mix(col, vec3(0.020, 0.031, 0.086), fog);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const waterGeo = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE, 220, 220);
  const water = new THREE.Mesh(waterGeo, waterMaterial);
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  /* ---------------- 星空 ---------------- */
  {
    const N = 700;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const tint = new THREE.Color();
    for (let i = 0; i < N; i++) {
      // 上半球随机分布
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85 + 0.05); // 避开正头顶与地平线
      const r = 120 + Math.random() * 80;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) + 2;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      tint.setHSL(0.55 + Math.random() * 0.15, 0.5, 0.65 + Math.random() * 0.3);
      colors[i * 3] = tint.r; colors[i * 3 + 1] = tint.g; colors[i * 3 + 2] = tint.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: false,
    }));
    scene.add(stars);
  }

  /* ---------------- 月亮（辉光精灵） ---------------- */
  {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0.0, 'rgba(255,255,255,1)');
    g.addColorStop(0.12, 'rgba(225,240,255,0.95)');
    g.addColorStop(0.3, 'rgba(140,190,255,0.35)');
    g.addColorStop(0.6, 'rgba(90,130,240,0.12)');
    g.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const moonTex = new THREE.CanvasTexture(c);
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({
      map: moonTex,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }));
    moon.position.copy(sunDir).multiplyScalar(150);
    moon.scale.setScalar(26);
    scene.add(moon);
  }

  /* ---------------- 交互：鼠标涟漪 / 点击水花 / 自动落雨 ---------------- */
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const ndc = new THREE.Vector2();
  const hitPoint = new THREE.Vector3();
  const dropQueue = [];
  const lastDropUv = new THREE.Vector2(-10, -10);
  const parallax = new THREE.Vector2();
  const parallaxTarget = new THREE.Vector2();

  function worldToUv(p) {
    return new THREE.Vector2(
      p.x / PLANE_SIZE + 0.5,
      0.5 - p.z / PLANE_SIZE
    );
  }

  function pointerToWater(clientX, clientY) {
    ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    if (!raycaster.ray.intersectPlane(groundPlane, hitPoint)) return null;
    const uv = worldToUv(hitPoint);
    if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) return null;
    return uv;
  }

  window.addEventListener('pointermove', (e) => {
    parallaxTarget.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    const uv = pointerToWater(e.clientX, e.clientY);
    if (!uv) return;
    if (uv.distanceTo(lastDropUv) > 0.004) {
      dropQueue.push({ x: uv.x, y: uv.y, radius: 0.011, strength: 0.1 });
      lastDropUv.copy(uv);
    }
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    const uv = pointerToWater(e.clientX, e.clientY);
    if (!uv) return;
    dropQueue.push({ x: uv.x, y: uv.y, radius: 0.025, strength: -0.55 }); // 按下激起大水花
  }, { passive: true });

  // 自动落雨
  let nextRain = 0.8;
  function scheduleRain(t) {
    nextRain = t + 1.0 + Math.random() * 1.8;
  }

  /* ---------------- 主循环 ---------------- */
  const clock = new THREE.Clock();
  let firstFrame = true;

  function simulate() {
    const drops = simMaterial.uniforms.uDrops.value;
    for (let step = 0; step < SUBSTEPS; step++) {
      let count = 0;
      if (step === 0) {
        while (count < MAX_DROPS && dropQueue.length) {
          const d = dropQueue.shift();
          drops[count].set(d.x, d.y, d.radius, d.strength);
          count++;
        }
      }
      simMaterial.uniforms.uDropCount.value = count;
      simMaterial.uniforms.uPrev.value = rtA.texture;
      renderer.setRenderTarget(rtB);
      renderer.render(simScene, simCamera);
      [rtA, rtB] = [rtB, rtA];
    }
    renderer.setRenderTarget(null);
    waterMaterial.uniforms.uHeightTex.value = rtA.texture;
  }

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    waterMaterial.uniforms.uTime.value = t;

    if (!reducedMotion && t > nextRain) {
      dropQueue.push({
        x: 0.15 + Math.random() * 0.7,
        y: 0.15 + Math.random() * 0.7,
        radius: 0.012 + Math.random() * 0.012,
        strength: 0.15 + Math.random() * 0.2,
      });
      scheduleRain(t);
    }

    simulate();

    // 镜头缓漂 + 鼠标视差
    parallax.lerp(parallaxTarget, 0.03);
    const sway = reducedMotion ? 0 : 1;
    camera.position.x = Math.sin(t * 0.1) * 0.6 * sway + parallax.x * 1.1;
    camera.position.y = 6.5 + Math.sin(t * 0.13) * 0.2 * sway - parallax.y * 0.5;
    camera.lookAt(lookTarget);

    renderer.render(scene, camera);

    if (firstFrame) {
      firstFrame = false;
      window.dispatchEvent(new Event('water-ready'));
      // 开场涟漪
      dropQueue.push({ x: 0.5, y: 0.45, radius: 0.035, strength: 0.45 });
      dropQueue.push({ x: 0.35, y: 0.55, radius: 0.022, strength: 0.3 });
      dropQueue.push({ x: 0.62, y: 0.5, radius: 0.028, strength: 0.35 });
    }
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}
