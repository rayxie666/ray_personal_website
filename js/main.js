/* ============================================================
   页面交互：加载器 / 打字机 / 导航 / 入场动画 / 计数器 / 卡片跟光
   ============================================================ */

/* ---------- 加载器：水波就绪或超时后淡出 ---------- */
(() => {
  const loader = document.getElementById('loader');
  const start = performance.now();
  let done = false;
  const hide = () => {
    if (done) return;
    done = true;
    // 至少展示 600ms，避免闪烁
    const wait = Math.max(0, 600 - (performance.now() - start));
    setTimeout(() => loader.classList.add('hidden'), wait);
  };
  window.addEventListener('water-ready', hide, { once: true });
  setTimeout(hide, 3500); // 兜底：CDN 失败也不能卡住页面
})();

/* ---------- 打字机 ---------- */
(() => {
  const el = document.getElementById('typing');
  const words = ['后端开发工程师', 'AI Agent 构建者', '机器学习工程师', 'LLM 应用开发者', '终身学习者'];
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    ci += deleting ? -1 : 1;
    el.textContent = word.slice(0, ci);
    let delay = deleting ? 50 : 110;
    if (!deleting && ci === word.length) { delay = 1800; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 400; }
    setTimeout(tick, delay);
  }
  tick();
})();

/* ---------- 导航：滚动收起 / 高亮当前版块 / 移动端菜单 ---------- */
(() => {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hidden-nav', y > 300 && y > lastY);
    lastY = y;
  }, { passive: true });

  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.addEventListener('click', () => links.classList.remove('open'));

  // 当前版块高亮
  const sections = [...document.querySelectorAll('section[id]')];
  const navAnchors = [...links.querySelectorAll('a')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((a) =>
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));
})();

/* ---------- 入场动画 + 技能条 + 数字滚动 ---------- */
(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');

      // 技能条
      el.querySelectorAll('.bar-fill').forEach((bar) => {
        bar.style.width = `${bar.dataset.level}%`;
      });

      // 数字滚动
      el.querySelectorAll('.stat-num[data-target]').forEach((num) => {
        const target = +num.dataset.target;
        const t0 = performance.now();
        const dur = 1400;
        (function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          num.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });

      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    observer.observe(el);
  });
})();

/* ---------- 作品卡片：光斑跟随 + 3D 倾斜 ---------- */
(() => {
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      const rx = ((y / rect.height) - 0.5) * -7;
      const ry = ((x / rect.width) - 0.5) * 7;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ---------- 回到顶部 + 年份 ---------- */
(() => {
  const btn = document.getElementById('back-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
