# 🌊 Ray Xie · 个人网站

一个带 **交互式 3D 水波特效** 的华丽个人主页。纯静态项目，零构建、零依赖安装，打开即用。

## 特性

- **GPU 水波模拟** — 基于波动方程的 ping-pong 高度场模拟（自定义 GLSL 着色器）
  - 🖱️ 移动鼠标在水面拖出涟漪
  - 👆 点击激起大水花
  - 🌧️ 空闲时自动落雨，水面永远在呼吸
  - 🌙 菲涅尔反射、程序化星空月夜、镜面月光
- **华丽 UI** — 深海暗夜主题、玻璃拟态、渐变流光、打字机、滚动入场、3D 卡片倾斜
- **响应式** — 移动端汉堡菜单、`prefers-reduced-motion` 适配

## 本地运行

ES Module 需要通过 HTTP 服务访问（不能直接双击 html）：

```bash
cd my_website
python3 -m http.server 8000
# 或者: npx serve .
```

然后打开 <http://localhost:8000>

> Three.js 通过 jsDelivr CDN 加载，首次打开需要联网。

## 项目结构

```
my_website/
├── index.html        # 页面结构（首页/关于/技能/作品/联系）
├── css/style.css     # 深海暗夜主题样式
├── js/water.js       # 3D 水波引擎（Three.js + GLSL）
└── js/main.js        # 页面交互逻辑
```

## 自定义

- **个人信息**：直接编辑 `index.html` 中的文案（姓名、技能、作品、邮箱）
- **水波手感**：`js/water.js` 顶部与 uniforms
  - `uDamping`（0.986）— 越小涟漪消散越快
  - `uSpeed`（0.55）— 波传播速度
  - `uAmp`（1.0）— 浪高
  - 颜色：`uDeepColor` / `uShallowColor`
- **主题色**：`css/style.css` 的 `:root` 变量（`--cyan` / `--violet` / `--pink`）
