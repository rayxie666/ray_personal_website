/* ============================================================
   国际化 / i18n  (EN ↔ 中文)
   - data-i18n="key"       → el.textContent
   - data-i18n-html="key"  → el.innerHTML
   ============================================================ */

const TRANSLATIONS = {
  en: {
    'page.title':        'Ray Xie · Personal Website',
    'loader.text':       'Gathering ripples…',
    'nav.home':          'Home',
    'nav.about':         'About',
    'nav.skills':        'Skills',
    'nav.projects':      'Projects',
    'nav.contact':       'Contact',
    'hero.greeting':     "Hi, I'm",
    'hero.typing.prefix':"I'm a ",
    'hero.desc':         'Focused on backend architecture & AI engineering — building systems that are both intelligent and reliable with LLMs and autonomous agents.',
    'hero.cta.projects': 'View Work',
    'hero.cta.contact':  'Contact Me',
    'hero.hint':         '🌊 Move your mouse, leave ripples on the water',
    'about.title':       'About Me',
    'about.p1':          "I'm a <strong>Backend &amp; AI Engineer</strong> focused on LLM applications, intelligent agent systems, and machine learning engineering. By day I design high-throughput services and data pipelines; by night I train models and orchestrate agents that call their own tools — and occasionally write shaders for the water behind you.",
    'about.p2':          'I believe great AI products live at the intersection of <strong>engineering</strong> and <strong>intelligence</strong>: models must be deployable, systems must scale, and code must survive code review.',
    'stat.experience':   'Years Exp.',
    'stat.projects':     'Projects',
    'stat.stack':        'Tech Stacks',
    'stat.curiosity':    'Curiosity',
    'skills.title':      'Skill Map',
    'skills.group1':     'AI / Machine Learning',
    'skills.group2':     'Backend / Engineering',
    'skill.llm':         'LLM / Prompt Engineering',
    'skill.agent':       'AI Agent Orchestration',
    'skill.rag':         'RAG / Vector Search',
    'skill.pytorch':     'PyTorch / Deep Learning',
    'skill.python':      'Python / FastAPI',
    'skill.node':        'Node.js / Go',
    'skill.db':          'Database / Vector DB',
    'skill.devops':      'Microservices / Cloud / DevOps',
    'projects.title':    'Selected Work',
    'project1.title':    'Team Empowerment AI Agent',
    'project1.desc':     "An enterprise internal agent built on OpenCode, compatible with any LLM. Connects knowledge Q&A, workflow automation, dev productivity, and data analytics — the team's always-on \"AI colleague\".",
    'project1.stat1':    'Teams Using',
    'project1.stat2':    'Efficiency Gain',
    'project1.stat3':    'Integrations',
    'project2.title':    'VoiceInput — AI Voice Agent',
    'project2.desc':     'A macOS menu-bar app: press a global shortcut to record, whisper.cpp (local, Metal-accelerated) transcribes in real time, and an optional Claude Code path rewrites your speech into a polished AI prompt — no API key needed.',
    'project3.title':    'Saint Ray City',
    'project3.desc':     'A GTA-inspired open-world browser game built entirely in Three.js. Zero asset files — all models, textures, and sound effects are procedurally generated. Drive, fly, shoot, and complete 5 story chapters.',
    'project4.title':    'Resume Vault',
    'project4.desc':     'Local-first desktop app (Tauri 2 + React 19) for versioning resumes. Side-by-side LaTeX preview compiled live with Tectonic, git-style checkpoints, PDF thumbnails, and two-way GitHub sync for cross-device backup.',
    'project5.title':    'MLOps Training Pipeline',
    'project5.desc':     'End-to-end model training and deployment platform: data versioning, distributed training, experiment tracking, canary releases, and online monitoring.',
    'project6.title':    'High-Concurrency Microservice Backend',
    'project6.desc':     'Go-based microservice backend with gRPC and message-queue traffic smoothing. Stably serves tens of millions of DAU.',
    'contact.title':     'Get in Touch',
    'contact.lead':      "Whether it's a collaboration, a technical discussion, or just a hello — my inbox is always open.",
    'footer.desc':       'Built with ❤️ · Water shaders on the surface, Agents & microservices underneath',
    'typing.words':      ['Backend Engineer', 'AI Agent Builder', 'ML Engineer', 'LLM App Developer', 'Lifelong Learner'],
  },
  zh: {
    'page.title':        'Ray Xie · 个人网站',
    'loader.text':       '正在汇聚水波…',
    'nav.home':          '首页',
    'nav.about':         '关于',
    'nav.skills':        '技能',
    'nav.projects':      '作品',
    'nav.contact':       '联系',
    'hero.greeting':     '你好，我是',
    'hero.typing.prefix':'我是一名 ',
    'hero.desc':         '专注后端架构与 AI 工程，用大语言模型和智能体把复杂系统打磨得既聪明又可靠。',
    'hero.cta.projects': '查看作品',
    'hero.cta.contact':  '联系我',
    'hero.hint':         '🌊 移动鼠标，在水面留下你的涟漪',
    'about.title':       '关于我',
    'about.p1':          '我是一名<strong>后端 &amp; AI 工程师</strong>，专注于大语言模型应用、智能体（Agent）系统与机器学习工程。白天设计高并发的服务与数据管线，夜里训练模型、编排会自己调用工具的智能体 —— 顺手也用着色器写了你身后这片水。',
    'about.p2':          '我相信优秀的 AI 产品是<strong>工程</strong>与<strong>智能</strong>的交点：模型要落得了地，系统要扛得住量，代码要经得起 review。',
    'stat.experience':   '开发经验',
    'stat.projects':     '完成项目',
    'stat.stack':        '技术栈',
    'stat.curiosity':    '好奇心',
    'skills.title':      '技能图谱',
    'skills.group1':     'AI / 机器学习',
    'skills.group2':     '后端 / 工程',
    'skill.llm':         '大语言模型 / Prompt 工程',
    'skill.agent':       'AI Agent 编排 / 工具调用',
    'skill.rag':         'RAG / 向量检索',
    'skill.pytorch':     'PyTorch / 深度学习',
    'skill.python':      'Python / FastAPI',
    'skill.node':        'Node.js / Go',
    'skill.db':          '数据库 / 向量数据库',
    'skill.devops':      '微服务 / 云原生 / DevOps',
    'projects.title':    '精选作品',
    'project1.title':    '团队赋能 AI Agent',
    'project1.desc':     '基于 OpenCode 自研、可对接任意大模型的企业内部智能体。打通内部知识问答、工作流自动化、研发提效与数据分析，成为团队随叫随到的「AI 同事」。',
    'project1.stat1':    '团队在用',
    'project1.stat2':    '日常提效',
    'project1.stat3':    '接入系统',
    'project2.title':    'VoiceInput — 语音输入 AI 工具',
    'project2.desc':     'macOS 菜单栏语音输入工具：全局快捷键录音，本地 whisper.cpp + Metal 加速实时转写，并可一键调用 Claude Code 把语音润色为精准的 AI 指令——无需 API Key。',
    'project3.title':    '圣雷城 Saint Ray City',
    'project3.desc':     '纯 Three.js 打造的浏览器端开放世界游戏，零素材文件，所有模型与音效均程序化生成。驾驶、飞行、射击、通缉系统、5 章剧情——全在浏览器里跑。',
    'project4.title':    'Resume Vault — 简历版本管理器',
    'project4.desc':     '本地优先的跨平台桌面 App（Tauri 2 + React 19），管理多份简历版本：实时 LaTeX 编译预览、Git 风格检查点与回滚，支持 GitHub 双向同步备份，跨设备恢复。',
    'project5.title':    'MLOps 训练流水线',
    'project5.desc':     '端到端的模型训练与部署平台，覆盖数据版本、分布式训练、实验追踪、灰度发布与线上监控。',
    'project6.title':    '高并发微服务后端',
    'project6.desc':     'Go + 微服务架构的核心业务后端，gRPC 通信、消息队列削峰填谷，稳定支撑千万级 DAU。',
    'contact.title':     '保持联系',
    'contact.lead':      '无论是合作邀约、技术交流，还是单纯打个招呼 —— 我的邮箱永远向你敞开。',
    'footer.desc':       '用 ❤️ 打造 · 表面是水波着色器，底层是 Agent 与微服务',
    'typing.words':      ['后端开发工程师', 'AI Agent 构建者', '机器学习工程师', 'LLM 应用开发者', '终身学习者'],
  },
};

let currentLang = localStorage.getItem('lang') || 'en';

function applyLang(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  document.title = t['page.title'];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t[el.dataset.i18n];
    if (v !== undefined) el.textContent = v;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const v = t[el.dataset.i18nHtml];
    if (v !== undefined) el.innerHTML = v;
  });

  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'en' ? '中文' : 'EN';

  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang, words: t['typing.words'] } }));
}

window.i18n = {
  applyLang,
  getTypingWords: () => TRANSLATIONS[currentLang]['typing.words'],
};

document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);
  document.getElementById('lang-toggle').addEventListener('click', () => {
    applyLang(currentLang === 'en' ? 'zh' : 'en');
  });
});
