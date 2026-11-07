---
name: 小渐知你
description: 资料检索、可复现工具与成长记录共用的清晰知识工作台。
colors:
  bg: "#f5f8f6"
  surface: "#ffffff"
  surface-muted: "#edf3ef"
  surface-strong: "#152820"
  text: "#172923"
  muted: "#586a60"
  faint: "#829187"
  line: "#d9e4dc"
  line-strong: "#b9cfc0"
  red: "#c94c3b"
  red-soft: "#faece7"
  jade: "#236e57"
  jade-soft: "#e4f3ea"
  gold: "#9b6a2d"
  gold-soft: "#f8f0de"
  nav-bg: "#142921"
  nav-text: "#d3e2d9"
  nav-line: "#355346"
  dark-bg: "#111a16"
  dark-surface: "#1c2922"
  dark-surface-muted: "#23352a"
  dark-surface-strong: "#e9f1eb"
  dark-text: "#f4f5f1"
  dark-muted: "#b4bbb3"
  dark-faint: "#7f877f"
  dark-line: "#364a3c"
  dark-line-strong: "#59715d"
  dark-red: "#dc766a"
  dark-red-soft: "#3c2826"
  dark-jade: "#7fb5a0"
  dark-jade-soft: "#213831"
  dark-gold: "#e9b44c"
  dark-gold-soft: "#3a321f"
  dark-nav-bg: "#09150f"
  dark-nav-text: "#d4e5d9"
  dark-nav-line: "#31483a"
typography:
  display:
    fontFamily: "Noto Serif SC, SimSun, serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: "40px"
    letterSpacing: "0"
  display-article:
    fontFamily: "Noto Serif SC, SimSun, serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: "52px"
    letterSpacing: "0"
  headline:
    fontFamily: "DengXian, Microsoft YaHei, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "32px"
    letterSpacing: "0"
  title:
    fontFamily: "DengXian, Microsoft YaHei, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: "26px"
    letterSpacing: "0"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0"
  body-compact:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0"
rounded:
  compact: "4px"
  control: "6px"
  panel: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  section: "24px"
  layout: "32px"
  major: "48px"
components:
  button-primary:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.bg}"
    rounded: "{rounded.compact}"
    padding: "8px 12px"
    height: "40px"
    typography: "{typography.body}"
  button-secondary:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "8px 12px"
    height: "40px"
    typography: "{typography.body-compact}"
  button-coral:
    backgroundColor: "{colors.red}"
    textColor: "{colors.surface}"
    rounded: "{rounded.compact}"
    padding: "10px 18px"
    height: "44px"
    typography: "{typography.body-compact}"
  field:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text}"
    rounded: "{rounded.compact}"
    padding: "8px 12px"
    height: "40px"
    typography: "{typography.body-compact}"
  tag:
    backgroundColor: "{colors.jade-soft}"
    textColor: "{colors.jade}"
    rounded: "{rounded.compact}"
    padding: "4px 8px"
    typography: "{typography.label}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "24px"
---

# Design System: 小渐知你

## Overview

**Creative North Star: "可检索的知识地图"**

界面像一本可操作的田野索引：深森林色导航建立坐标，浅色纸面承载资料、计算结果与日常记录。品牌存在于字体、颜色和有节制的状态变化中；高频操作和品牌印象同等重要。

内容层级依靠标题、编号、分隔线和留白建立。参考目录采用紧凑横向条目，工具与需要操作边界的资料才使用明确的框面。暗色主题通过同名 CSS 变量切换，而非另起一套结构。

**Key Characteristics:**
- 深色导航和浅色内容形成稳定的工作台框架。
- 大标题有中文衬线气质，功能文字清晰紧凑。
- 红与绿承担不同状态，内容区保持克制。
- 目录优先扫描效率，图解保留可交互的空间感。

## Colors

主色关系是森林绿、冷白纸面与少量珊瑚红；玉绿用于资料状态，金色只在特定分类和图解中辅助区分。

### Primary
- **深森林导航** (`nav-bg`, `surface-strong`): 顶部导航、书脊、强操作面和高对比区。
- **珊瑚红** (`red`): 品牌标记、选中指示、收藏和少数主要行动。

### Secondary
- **玉绿** (`jade`, `jade-soft`): 资料类别、可用状态、来源或计算状态的辅助识别。

### Tertiary
- **标注金** (`gold`, `gold-soft`): 五行、图解与有限的知识分类提示。

### Neutral
- **冷白纸面** (`bg`, `surface`, `surface-muted`): 页面、面板与轻微分层。
- **森林墨色** (`text`): 正文和主要标题。
- **层级灰绿** (`muted`, `faint`): 说明、元信息和次级标签。
- **细分隔线** (`line`, `line-strong`): 目录条目、面板和栏目边界。

**The State Color Rule.** 红色强调行动与当前项；绿色标示资料和状态。两者只在有意义的功能位置出现。

## Typography

**Display Font:** 自托管 Noto Serif SC 700 (SimSun fallback)。
**Body Font:** Manrope (system-ui fallback)；中文功能标题使用 DengXian、Microsoft YaHei 回退。

**Character:** 衬线标题为传统知识提供识别度，功能文本保持工作台的扫描速度。标题不使用负字距，正文在窄屏自然换行。

### Hierarchy
- **Display** (`display`, `display-article`): 页面入口和文章标题；主工作台常用 36/40，长文入口 44/52，手机收敛为 30/36。
- **Headline** (`headline`): 栏目与章节标题，常见 24/32。
- **Title** (`title`): 参考条目和面板标题，常见 18/26。
- **Body** (`body`, `body-compact`): 导语 16/24，列表、工具和表格 14/20。
- **Label** (`label`): 来源、计数和状态，常见 12/16。

**The Two-Voice Rule.** 衬线只承担页面级中文标题；导航、检索、控件和数据保持无衬线。

## Layout

桌面主工作台采用顶栏加三栏：左侧资料导航（248px）、流动主内容、右侧速查栏（304px）。视宽不超过 1600px 时收起右栏，不超过 920px 时隐藏左栏并使用移动导航与第二行全宽搜索。主内容桌面内边距为 32px，窄屏为 16px。

长文和知识总览收束在约 1120px 内；文章正文独立收束到约 760px，并保留目录列。参考资料以整行索引排列，用细横线划分；工具表单、结果和书目单项使用有边界的容器。间距反复使用 4、8、12、16、24、32、48px，较大的间距用于栏目之间。玄览内嵌视图在 900px、640px 等断点调整图解、目录和表单布局。

**The Index First Rule.** 高频资料列表先保证标题、来源、标签和入口可扫描，再使用框面强调需要独立操作的对象。

## Elevation & Depth

页面默认以底色和细线区分层次；阴影主要出现在已选导航、分段选项与交互卡片。主工作台有轻柔的 `0 12px 32px rgba(23, 41, 35, 0.08)` 阴影变量，暗色主题加深为 `rgba(0, 0, 0, 0.22)`；玄览图解保留更明显的交互抬升。

**The Flat Reading Rule.** 阅读与检索区域以色块、分隔线和留白建立深度；阴影用来提示选中或悬停，不承担正文结构。

## Shapes

表单和小标签以紧凑直角感（4px）为主，按钮与局部操作面可用 6px，独立面板上限常为 8px。圆形仅用于五行节点、掌诀定位等本身有图解意义的元素。边框细而浅，行式资料不做独立卡片轮廓。

## Components

### Buttons
- **Primary:** 深森林底、浅字、紧凑圆角；工具提交至少 40px 高，悬停轻微上移，禁用态降低透明度。
- **Secondary:** 浅面、细边框，悬停以玉绿边框与文字反馈。
- **Coral action:** 玄览起卦等明确命令使用珊瑚红底；悬停加深，键盘聚焦显示可见轮廓。

### Chips
- **Style:** 4px 圆角、12/16 标签字；浅灰绿承载普通标签，浅玉绿承载已确认状态。
- **State:** 筛选项使用边框、底色与文字共同标记选中。

### Cards / Containers
- **Reference index:** 整行透明底、上下细线，悬停转白；元信息、标题、标签与操作分列。
- **Panels:** 表单、结果、历法与单本书有 1px 细边框、白色底，通常 6–8px 圆角。

### Inputs / Fields
- **Style:** 常规输入高 40px，浅灰绿底、细边框、4px 圆角；搜索根据深浅导航使用相应底色。
- **Focus:** 键盘焦点有玉绿轮廓；深色顶栏搜索同时改变边框与底色。

### Navigation
- **Style:** 深森林顶栏连接一级视图，浅色侧栏承载资料门类；当前项有明确的底色与文字色差。移动端使用触发按钮与独立导航面板。嵌入的玄览顶栏仍显示紧凑页名（16/24）并与搜索并列。
- **Tabs:** 一级标签沿深色栏排布，二级标签在浅色条上以底部细线标记当前项。

## Do's and Don'ts

### Do:
- **Do** 让资料入口保留来源、分类、标题与标签的快速扫描顺序。
- **Do** 在需要独立操作的工具、书目和数据面板上使用明确框面。
- **Do** 同时验证浅色与暗色变量下的文字、边框和状态对比。
- **Do** 保留鼠标、键盘与移动端都可辨认的交互状态，并尊重减少动态效果的系统设置。

### Don't:
- **Don't** 把普通资料索引改成密集浮动卡片，削弱横向阅读顺序。
- **Don't** 让红、绿、金同时争夺同一控件的主状态。
- **Don't** 用大面积阴影或装饰色替代目录、标题和分隔线的内容层级。
