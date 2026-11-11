// 3D 연결도: 강의 id별 배선 정의 + three.js 렌더러 (필요할 때만 three.js를 불러옵니다)
// 기준 보드: 30핀 ESP32 DevKit V1 (DOIT). 단위는 cm.
const WIRING3D = {
  '1-1': {highlight: {input: ['VP', 'VN', 'D34', 'D35'], strap: ['D2', 'D12', 'D15']}},
  '1-3': {builtin: true},
  '2-1': {parts: [{t: 'led', pin: 'D25', label: 'LED1', col: '#e5484d'}, {t: 'led', pin: 'D26', label: 'LED2', col: '#f5c518'}, {t: 'led', pin: 'D27', label: 'LED3', col: '#30c46b'}]},
  '2-2': {builtin: true, parts: [{t: 'button', pin: 'D18', label: '버튼'}]},
  '2-3': {parts: [{t: 'button', pin: 'D18', label: '버튼'}]},
  '3-1': {parts: [{t: 'pot', pin: 'D34', label: '가변저항'}]},
  '3-2': {parts: [{t: 'led', pin: 'D25', label: 'LED', col: '#e5484d'}, {t: 'pot', pin: 'D34', label: '가변저항'}]},
  '3-3': {builtin: true, parts: [{t: 'foil', pin: 'D4', label: '호일 (터치)'}]},
  '4-2': {parts: [{t: 'led', pin: 'D25', label: 'LED1', col: '#e5484d'}, {t: 'led', pin: 'D26', label: 'LED2', col: '#30c46b'}]},
  '4-3': {parts: [{t: 'i2c', pins: ['D21', 'D22'], label: 'I2C 모듈'}]},
  '6-2': {parts: [{t: 'button', pin: 'D18', label: '버튼'}]},
  '6-3': {parts: [{t: 'cds', pin: 'D34', label: '조도 센서 + 10kΩ'}]},
};
window.WIRING3D = WIRING3D;

(function () {
  const L = ['EN', 'VP', 'VN', 'D34', 'D35', 'D32', 'D33', 'D25', 'D26', 'D27', 'D14', 'D12', 'D13', 'GND', 'VIN'];
  const R = ['D23', 'D22', 'TX0', 'RX0', 'D21', 'D19', 'D18', 'D5', 'TX2', 'RX2', 'D4', 'D2', 'D15', 'GND', '3V3'];
  const BX = -8, HW = 1.15, P = 0.254, TOP = 0.86, RAIL_V = -2.45, RAIL_G = -2.15;
  const SIG = ['#f59e0b', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];
  let cur = null;

  function loadThree(cb) {
    if (window.THREE && THREE.OrbitControls) return cb();
    const add = (src, next) => { const s = document.createElement('script'); s.src = src; s.onload = next; s.onerror = () => fail(); document.head.appendChild(s); };
    const fail = () => { if (cur && cur.el) cur.el.innerHTML = '<p class="w3derr">3D 그림을 불러오지 못했습니다. 아래 연결 표를 참고하세요.</p>'; };
    const ctl = () => add('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', cb);
    window.THREE ? ctl() : add('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', ctl);
  }

  window.renderWiring3D = function (el, id) {
    if (cur) { cancelAnimationFrame(cur.raf); if (cur.ro) cur.ro.disconnect(); if (cur.r) { cur.r.dispose(); cur.r.forceContextLoss(); } cur = null; }
    if (!el || !WIRING3D[id]) return;
    cur = {el};
    el.innerHTML = '<p class="w3derr">3D 그림 불러오는 중…</p>';
    const mine = cur;
    loadThree(() => { if (cur === mine && el.isConnected) build(el, WIRING3D[id], mine); });
  };

  function pinPos(name, which) {
    let i = R.indexOf(name), side = 1;
    if (name === 'GND') i = which === 'L' ? -1 : 13;
    if (i < 0) { i = L.indexOf(name); side = -1; }
    return new THREE.Vector3(BX + side * HW, TOP, (i - 7) * P);
  }

  function label(text, pos, size, color) {
    const c = document.createElement('canvas'), g = c.getContext('2d'), f = 40;
    g.font = `700 ${f}px "Gothic A1", sans-serif`;
    const w = Math.ceil(g.measureText(text).width) + 24; c.width = w; c.height = f + 20;
    g.font = `700 ${f}px "Gothic A1", sans-serif`;
    g.fillStyle = 'rgba(15,29,35,.82)'; g.beginPath(); g.roundRect ? g.roundRect(0, 0, w, f + 20, 12) : g.rect(0, 0, w, f + 20); g.fill();
    g.fillStyle = color || '#fff'; g.textBaseline = 'middle'; g.fillText(text, 12, (f + 20) / 2 + 2);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.CanvasTexture(c), depthTest: false}));
    s.scale.set(size * w / (f + 20), size, 1); s.position.copy(pos); s.renderOrder = 10; return s;
  }

  function wire(scene, a, b, color, lift) {
    const mid = a.clone().lerp(b, 0.5); mid.y = Math.max(a.y, b.y) + (lift || 0.8 + a.distanceTo(b) * 0.08);
    const q1 = a.clone().lerp(mid, 0.5); q1.y = mid.y * 0.9; const q2 = b.clone().lerp(mid, 0.5); q2.y = mid.y * 0.9;
    const curve = new THREE.CatmullRomCurve3([a, a.clone().setY(a.y + 0.25), q1, mid, q2, b.clone().setY(b.y + 0.25), b]);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.045, 8, false), new THREE.MeshStandardMaterial({color, roughness: 0.5}));
    m.castShadow = true; scene.add(m);
    for (const p of [a, b]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 10), new THREE.MeshStandardMaterial({color: '#bbb', metalness: 0.6, roughness: 0.3})); t.position.copy(p).setY(p.y + 0.06); scene.add(t); }
  }

  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({color: c, roughness: 0.55}, o || {}));
  const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };
  const cyl = (r, h, mat, x, y, z, seg) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 20), mat); m.position.set(x, y, z); m.castShadow = true; return m; };

  function breadboard(scene) {
    const W = 16, D = 5.6, c = document.createElement('canvas'); c.width = 1600; c.height = 560;
    const g = c.getContext('2d'); g.fillStyle = '#f3f1ea'; g.fillRect(0, 0, 1600, 560);
    g.fillStyle = '#d8d4c8'; g.fillRect(0, 268, 1600, 24);
    g.strokeStyle = '#d33'; g.lineWidth = 4; g.beginPath(); g.moveTo(20, 18); g.lineTo(1580, 18); g.stroke();
    g.strokeStyle = '#36c'; g.beginPath(); g.moveTo(20, 76); g.lineTo(1580, 76); g.stroke();
    g.fillStyle = '#5b5a55';
    const hole = (x, y) => g.fillRect(x - 4, y - 4, 8, 8);
    for (let i = 0; i < 60; i++) { if (i % 6 === 5) continue; const x = 30 + i * 25.4; hole(x, 35); hole(x, 60); }
    for (let i = 0; i < 62; i++) { const x = 25 + i * 25.4; for (let r = 0; r < 5; r++) { hole(x, 120 + r * 25.4); hole(x, 315 + r * 25.4); } }
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
    const mats = [M('#e9e6dc'), M('#e9e6dc'), new THREE.MeshStandardMaterial({map: tex, roughness: 0.8}), M('#e9e6dc'), M('#e9e6dc'), M('#e9e6dc')];
    const b = new THREE.Mesh(new THREE.BoxGeometry(W, 0.85, D), mats); b.position.set(4, -0.425, 0); b.receiveShadow = true; scene.add(b);
  }

  function esp32(scene, spec) {
    const g = new THREE.Group(); scene.add(g);
    g.add(box(2.8, 0.16, 5.4, M('#16343c'), BX, 0.72, 0.15));
    g.add(box(1.8, 0.32, 2.5, M('#9aa3a6', {metalness: 0.7, roughness: 0.35}), BX, 0.96, -1.1));
    g.add(box(1.8, 0.04, 0.7, M('#16343c'), BX, 0.81, -2.65));
    g.add(box(0.8, 0.3, 0.6, M('#a9b0b3', {metalness: 0.6}), BX, 0.95, 2.75));
    g.add(box(0.35, 0.18, 0.35, M('#222'), BX - 0.6, 0.86, 2.25)); g.add(box(0.35, 0.18, 0.35, M('#222'), BX + 0.6, 0.86, 2.25));
    const hl = spec.highlight || {};
    [L, R].forEach((arr, s) => arr.forEach((n, i) => {
      const col = (hl.input || []).includes(n) ? '#facc15' : (hl.strap || []).includes(n) ? '#fb7185' : '#c9a24a';
      const p = box(0.17, 0.05, 0.17, M(col, {metalness: 0.6, roughness: 0.3}), BX + (s ? 1 : -1) * HW, 0.82, (i - 7) * P); g.add(p);
      g.add(box(0.06, 0.6, 0.06, M('#c9a24a', {metalness: 0.6}), BX + (s ? 1 : -1) * HW, 0.35, (i - 7) * P));
    }));
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 10), new THREE.MeshStandardMaterial({color: '#3b82f6', emissive: '#3b82f6', emissiveIntensity: 0}));
    led.position.set(BX + 0.45, 0.84, 1.6); g.add(led);
    g.add(label('ESP32 DevKit', new THREE.Vector3(BX, 1.6, -1.1), 0.36));
    if (spec.builtin) g.add(label('내장 LED (GPIO2)', new THREE.Vector3(BX + 0.6, 1.3, 1.9), 0.3, '#93c5fd'));
    if (hl.input) { g.add(label('입력 전용 34~39', new THREE.Vector3(BX - 2.4, 1.2, -1.2), 0.32, '#facc15')); g.add(label('부팅 관련 2·12·15', new THREE.Vector3(BX + 2.6, 1.2, 1.2), 0.32, '#fb7185')); }
    return led;
  }

  // 부품: 신호/전원/접지 연결점을 돌려줍니다
  function part(scene, p, c, sigCol) {
    const out = {sig: [], vcc: [], gnd: []}, z = 0.9, lead = M('#b8bcbf', {metalness: 0.7, roughness: 0.3});
    if (p.t === 'led') {
      const res = cyl(0.12, 0.55, M('#d9c39a'), c - 0.45, 0.14, z, 16); res.rotation.z = Math.PI / 2; scene.add(res);
      ['#8b4513', '#111', '#8b4513'].forEach((b, i) => { const r = cyl(0.125, 0.05, M(b), c - 0.6 + i * 0.12, 0.14, z, 16); r.rotation.z = Math.PI / 2; scene.add(r); });
      const lc = M(p.col, {transparent: true, opacity: 0.85, emissive: p.col, emissiveIntensity: 0.35});
      scene.add(cyl(0.25, 0.4, lc, c + 0.4, 0.5, z)); const dome = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), lc); dome.position.set(c + 0.4, 0.7, z); scene.add(dome);
      scene.add(cyl(0.02, 0.3, lead, c + 0.3, 0.15, z)); scene.add(cyl(0.02, 0.3, lead, c + 0.5, 0.15, z));
      out.sig.push(new THREE.Vector3(c - 0.85, 0, z)); out.gnd.push(new THREE.Vector3(c + 0.75, 0, z));
      scene.add(label(p.label, new THREE.Vector3(c + 0.1, 1.35, z), 0.3));
    } else if (p.t === 'button') {
      scene.add(box(0.7, 0.3, 0.7, M('#2b2f31'), c, 0.15, z)); scene.add(cyl(0.2, 0.2, M('#555'), c, 0.4, z));
      out.sig.push(new THREE.Vector3(c - 0.55, 0, z)); out.gnd.push(new THREE.Vector3(c + 0.55, 0, z));
      scene.add(label(p.label, new THREE.Vector3(c, 1.1, z), 0.3));
    } else if (p.t === 'pot') {
      scene.add(box(1, 0.5, 0.9, M('#1e60b0'), c, 0.25, z)); scene.add(cyl(0.18, 0.5, M('#e5e7eb'), c, 0.75, z));
      scene.add(box(0.05, 0.05, 0.3, M('#666'), c, 1.01, z));
      out.vcc.push(new THREE.Vector3(c - 0.35, 0, z + 0.6)); out.sig.push(new THREE.Vector3(c, 0, z + 0.6)); out.gnd.push(new THREE.Vector3(c + 0.35, 0, z + 0.6));
      scene.add(label(p.label, new THREE.Vector3(c, 1.5, z), 0.3));
    } else if (p.t === 'cds') {
      const d = cyl(0.25, 0.08, M('#d97706'), c - 0.3, 0.55, z); d.rotation.x = Math.PI / 2; scene.add(d);
      scene.add(cyl(0.02, 0.5, lead, c - 0.4, 0.25, z)); scene.add(cyl(0.02, 0.5, lead, c - 0.2, 0.25, z));
      const res = cyl(0.12, 0.55, M('#d9c39a'), c + 0.35, 0.14, z, 16); res.rotation.z = Math.PI / 2; scene.add(res);
      out.vcc.push(new THREE.Vector3(c - 0.55, 0, z)); out.sig.push(new THREE.Vector3(c, 0, z)); out.gnd.push(new THREE.Vector3(c + 0.75, 0, z));
      scene.add(label(p.label, new THREE.Vector3(c, 1.3, z), 0.3));
    } else if (p.t === 'foil') {
      const f = box(1.6, 0.02, 1.6, M('#d7dce0', {metalness: 0.25, roughness: 0.35}), c + 0.4, 0.01, 4.4); scene.add(f);
      out.sig.push(new THREE.Vector3(c + 0.4, 0.02, 3.8));
      scene.add(label(p.label, new THREE.Vector3(c + 0.4, 0.8, 4.4), 0.3));
    } else if (p.t === 'i2c') {
      scene.add(box(2.2, 0.08, 1.4, M('#5b21b6'), c + 0.3, 0.9, z + 0.2)); scene.add(box(1.4, 0.08, 0.8, M('#111'), c + 0.3, 0.97, z + 0.2));
      for (let i = 0; i < 4; i++) scene.add(cyl(0.025, 0.9, lead, c - 0.08 + i * P, 0.45, z - 0.35));
      out.vcc.push(new THREE.Vector3(c - 0.08, 0, z - 0.35)); out.gnd.push(new THREE.Vector3(c - 0.08 + P, 0, z - 0.35));
      out.sig.push(new THREE.Vector3(c - 0.08 + 2 * P, 0, z - 0.35), new THREE.Vector3(c - 0.08 + 3 * P, 0, z - 0.35));
      scene.add(label('VCC GND SDA SCL', new THREE.Vector3(c + 0.3, 1.5, z + 0.2), 0.26)); scene.add(label(p.label, new THREE.Vector3(c + 0.3, 1.9, z + 0.2), 0.3));
    }
    return out;
  }

  function build(el, spec, mine) {
    const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    el.innerHTML = '';
    const r = new THREE.WebGLRenderer({antialias: true}); r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.shadowMap.enabled = true;
    el.appendChild(r.domElement); mine.r = r;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(css('--panel') || '#ffffff');
    const cam = new THREE.PerspectiveCamera(38, 1.6, 0.1, 200);
    const ctl = new THREE.OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * 0.49; ctl.minDistance = 4; ctl.maxDistance = 40;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.75); sun.position.set(-4, 14, 8); sun.castShadow = true;
    Object.assign(sun.shadow.camera, {left: -14, right: 14, top: 10, bottom: -10}); sun.shadow.mapSize.set(1024, 1024); scene.add(sun);
    const table = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({color: css('--bg') || '#eee', roughness: 1}));
    table.rotation.x = -Math.PI / 2; table.position.y = -0.86; table.receiveShadow = true; scene.add(table);
    breadboard(scene);
    const led = esp32(scene, spec);
    const parts = spec.parts || [];
    let needV = false, needG = false;
    parts.forEach((p, i) => {
      const c = -1.6 + i * (parts.length > 2 ? 3.2 : 4), o = part(scene, p, c);
      const pins = p.pins || [p.pin];
      o.sig.forEach((pt, k) => {
        const col = SIG[(i + k) % SIG.length];
        wire(scene, pinPos(pins[k]), pt, col);
        scene.add(label(pins[k].replace(/^D/, 'GPIO'), pinPos(pins[k]).add(new THREE.Vector3(pinPos(pins[k]).x < BX ? -0.9 : 0.9, 0.5 + (i + k) * 0.42, 0)), 0.34, col));
      });
      o.vcc.forEach(pt => { needV = true; wire(scene, pt, new THREE.Vector3(pt.x, 0, RAIL_V), '#dc2626', 0.5); });
      o.gnd.forEach(pt => { needG = true; wire(scene, pt, new THREE.Vector3(pt.x + 0.2, 0, RAIL_G), '#111827', 0.45); });
    });
    if (needV) { wire(scene, pinPos('3V3'), new THREE.Vector3(-3.5, 0, RAIL_V), '#dc2626'); scene.add(label('3V3', pinPos('3V3').add(new THREE.Vector3(0.8, 0.45, 0.25)), 0.32, '#fca5a5')); }
    if (needG) { wire(scene, pinPos('GND'), new THREE.Vector3(-3.5, 0, RAIL_G), '#111827'); scene.add(label('GND', pinPos('GND').add(new THREE.Vector3(0.8, 0.45, -0.15)), 0.32)); }
    if (needV || needG) { scene.add(label('+ 3.3V 줄', new THREE.Vector3(10.5, 0.5, RAIL_V - 0.2), 0.26, '#fca5a5')); scene.add(label('− GND 줄', new THREE.Vector3(10.5, 0.5, RAIL_G + 0.35), 0.26, '#93c5fd')); }

    const span = parts.length ? -1.6 + (parts.length - 1) * (parts.length > 2 ? 3.2 : 4) : BX;
    const focus = parts.length ? new THREE.Vector3((BX - 1.5 + span + 1.5) / 2, 0, 0.6) : new THREE.Vector3(BX, 0.6, 0);
    ctl.target.copy(focus); cam.position.copy(focus).add(parts.length ? new THREE.Vector3(0, 11 + parts.length, 10 + parts.length) : new THREE.Vector3(3, 6, 7));
    const fit = () => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    fit(); mine.ro = new ResizeObserver(fit); mine.ro.observe(el);
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = t => {
      if (!el.isConnected) return window.renderWiring3D(null);
      if (spec.builtin) led.material.emissiveIntensity = still ? 1 : (Math.floor(t / 1000) % 2 ? 0 : 1.6);
      ctl.update(); r.render(scene, cam); mine.raf = requestAnimationFrame(tick);
    };
    mine.raf = requestAnimationFrame(tick);
  }
})();
