(function () {
  const app = document.getElementById('app');
  const KEY = 'esp32-basic-done';
  let done = new Set();
  try { done = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...done])); } catch (e) {} };
  const totalMin = LESSONS.reduce((s, l) => s + l.min, 0);

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const KW = 'const|int|void|bool|if|else|for|while|return|unsigned|long|struct|auto|char|static|volatile|uint8_t|uint64_t|String|true|false|HIGH|LOW|OUTPUT|INPUT_PULLUP|FALLING|PROGMEM|IRAM_ATTR|RTC_DATA_ATTR';
  const TOK = new RegExp('(\\/\\/.*$)|(#\\w+)|("(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)\')|\\b(' + KW + ')\\b|\\b(\\d+(?:\\.\\d+)?)\\b', 'gm');
  function highlight(code) {
    return esc(code).replace(TOK, (m, c, pre, str, kw, num) =>
      c ? `<i class="c">${c}</i>` : pre ? `<i class="p">${pre}</i>` : str ? `<i class="s">${str}</i>` : kw ? `<i class="k">${kw}</i>` : `<i class="n">${num}</i>`);
  }

  function progress() {
    const n = done.size, t = LESSONS.length;
    document.getElementById('prog').innerHTML = `<b>${n}</b> / ${t} 완료`;
    return [n, t];
  }

  function lessonRow(l) {
    const ok = done.has(l.id);
    return `<li><a href="#l-${l.id}" class="${ok ? 'done' : ''}"><span class="num">${l.id}</span><span class="lt">${l.title}</span><span class="mn">${l.min}분</span><span class="ck" aria-label="${ok ? '완료' : '미완료'}">${ok ? '✓' : ''}</span></a></li>`;
  }

  function home(scrollTo) {
    const [n, t] = progress();
    const next = LESSONS.find(l => !done.has(l.id)) || LESSONS[0];
    app.innerHTML = `
    <section class="hero wrap">
      <div class="hero-txt">
        <p class="eyebrow">무료 · 한국어 · 아두이노 IDE</p>
        <h1>ESP32,<br>기초부터 하나씩.</h1>
        <p class="lede">LED 하나 켜는 것에서 시작해 휴대폰으로 조종하는 Wi-Fi 기기까지. 아두이노를 처음 만져 보는 분도 따라올 수 있도록 ${LESSONS.length}강, 약 ${Math.round(totalMin / 60 * 10) / 10}시간 분량으로 구성했습니다.</p>
        <div class="cta">
          <a class="btn" href="#l-${next.id}">${n ? '이어서 배우기' : '첫 강의 시작'} <small>${next.id} ${next.title}</small></a>
          <a class="btn ghost" href="#curriculum">전체 커리큘럼</a>
        </div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${t}" aria-valuenow="${n}"><span style="width:${n / t * 100}%"></span></div>
        <p class="barcap">${n ? `${t}강 중 ${n}강 완료` : '진도는 이 브라우저에 자동으로 저장됩니다'}</p>
      </div>
      ${boardSvg()}
    </section>

    <section class="wrap">
      <h2>무엇을 배우나요</h2>
      <div class="chapters">${CHAPTERS.map(c => `<div class="chap"><span class="cn">${c.n}</span><h3>${c.title}</h3><p>${c.sum}</p></div>`).join('')}</div>
    </section>

    <section class="wrap two">
      <div><h2>이런 분께 맞습니다</h2><ul class="check">
        <li>아두이노 우노로 LED 정도는 켜 봤고, 이제 무선 기기를 만들고 싶은 분</li>
        <li>C 언어 문법이 낯설어도 예제를 고쳐 가며 배우는 게 편한 분</li>
        <li>수업이나 동아리에서 쓸 한국어 실습 자료가 필요한 선생님</li></ul></div>
      <div><h2>이 강좌에서 다루지 않는 것</h2><ul class="cross">
        <li>ESP-IDF와 FreeRTOS를 직접 쓰는 개발 (아두이노 방식만 다룹니다)</li>
        <li>회로 이론과 납땜 (브레드보드만 씁니다)</li>
        <li>블루투스, OTA 업데이트 같은 심화 주제</li></ul></div>
    </section>

    <section class="wrap" id="curriculum">
      <h2>커리큘럼</h2>
      <p class="sub">${CHAPTERS.length}단원 ${LESSONS.length}강 · 약 ${totalMin}분. 완료한 강의에는 ✓가 표시됩니다.</p>
      ${CHAPTERS.map(c => `<div class="unit"><h3><span>${c.n}단원</span>${c.title}</h3><ol class="lessons">${LESSONS.filter(l => l.ch === c.n).map(lessonRow).join('')}</ol></div>`).join('')}
    </section>

    <section class="wrap" id="parts">
      <h2>준비물</h2>
      <p class="sub">온라인 부품 쇼핑몰에서 "ESP32 입문 키트"로 사도 대부분 들어 있습니다.</p>
      <div class="tbl"><table class="parts"><thead><tr><th>부품</th><th>설명</th><th>수량</th></tr></thead>
      <tbody>${PARTS.map(p => `<tr><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td></tr>`).join('')}</tbody></table></div>
      ${n ? `<p class="reset"><button id="resetProg">진도 초기화</button></p>` : ''}
    </section>`;
    const r = document.getElementById('resetProg');
    if (r) r.onclick = () => { if (r.dataset.armed) { done.clear(); save(); home(); } else { r.dataset.armed = 1; r.textContent = '한 번 더 누르면 초기화됩니다'; } };
    if (scrollTo) { const el = document.getElementById(scrollTo); if (el) el.scrollIntoView(); } else window.scrollTo(0, 0);
  }

  function lesson(id) {
    const i = LESSONS.findIndex(l => l.id === id);
    if (i < 0) return home();
    const l = LESSONS[i], ch = CHAPTERS.find(c => c.n === l.ch), prev = LESSONS[i - 1], next = LESSONS[i + 1];
    progress();
    const isDone = done.has(l.id);
    app.innerHTML = `
    <article class="wrap lesson">
      <p class="crumb"><a href="#curriculum">커리큘럼</a> › ${ch.n}단원 ${ch.title}</p>
      <h1><span class="num">${l.id}</span>${l.title}</h1>
      <p class="meta">약 ${l.min}분</p>
      <div class="body">${l.body}</div>
      ${l.wiring ? `<h2>연결</h2><div class="tbl"><table class="wire"><tbody>${l.wiring.map(w => `<tr><td>${w[0]}</td><td>→</td><td>${w[1]}</td></tr>`).join('')}</tbody></table></div>` : ''}
      ${l.code ? `<h2>코드</h2><div class="code"><button class="copy" id="copy">복사</button><pre><code>${highlight(l.code)}</code></pre></div>` : ''}
      <div class="task"><h2>실습 과제</h2><p>${l.task}</p></div>
      <button class="btn ${isDone ? 'ghost' : ''}" id="mark">${isDone ? '✓ 완료함 (취소하기)' : '이 강의 완료'}</button>
      <nav class="pn">
        ${prev ? `<a href="#l-${prev.id}">← ${prev.id} ${prev.title}</a>` : '<span></span>'}
        ${next ? `<a href="#l-${next.id}" class="nx">${next.id} ${next.title} →</a>` : '<a href="#curriculum" class="nx">커리큘럼으로 →</a>'}
      </nav>
    </article>`;
    document.getElementById('mark').onclick = () => {
      if (done.has(l.id)) done.delete(l.id); else done.add(l.id);
      save();
      if (done.has(l.id) && next) location.hash = 'l-' + next.id; else lesson(id);
    };
    const cp = document.getElementById('copy');
    if (cp) cp.onclick = async () => {
      try { await navigator.clipboard.writeText(l.code); cp.textContent = '복사됨'; }
      catch (e) { const r = document.createRange(); r.selectNodeContents(cp.nextElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); cp.textContent = 'Ctrl+C로 복사'; }
      setTimeout(() => cp.textContent = '복사', 1500);
    };
    window.scrollTo(0, 0);
    document.title = `${l.id} ${l.title} · ESP32 기초 교실`;
  }

  function boardSvg() {
    const pins = Array.from({length: 15}, (_, i) => `<rect x="${44 + i * 14}" y="6" width="8" height="10" rx="1"/><rect x="${44 + i * 14}" y="164" width="8" height="10" rx="1"/>`).join('');
    return `<svg class="board" viewBox="0 0 320 180" role="img" aria-label="ESP32 개발 보드 그림">
      <rect x="20" y="16" width="280" height="148" rx="8" class="pcb"/>
      <g class="pin">${pins}</g>
      <rect x="150" y="44" width="120" height="92" rx="4" class="can"/>
      <rect x="160" y="54" width="100" height="72" rx="2" class="can2"/>
      <text x="210" y="86" text-anchor="middle" class="lbl">ESP32</text>
      <text x="210" y="104" text-anchor="middle" class="lbl2">WROOM-32</text>
      <path d="M262 50h22v80h-22" class="ant"/>
      <rect x="4" y="74" width="30" height="32" rx="3" class="usb"/>
      <rect x="56" y="40" width="22" height="14" rx="2" class="btnk"/><text x="67" y="66" text-anchor="middle" class="lbl3">EN</text>
      <rect x="56" y="126" width="22" height="14" rx="2" class="btnk"/><text x="67" y="122" text-anchor="middle" class="lbl3">BOOT</text>
      <circle cx="110" cy="70" r="5" class="led"/><text x="110" y="86" text-anchor="middle" class="lbl3">GPIO2</text>
      <circle cx="110" cy="110" r="4" class="pwr"/>
    </svg>`;
  }

  function route() {
    const h = location.hash.slice(1);
    if (h.startsWith('l-')) lesson(h.slice(2));
    else { document.title = 'ESP32 기초 교실'; home(h || null); }
  }
  addEventListener('hashchange', route);
  route();
})();
