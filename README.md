# 小渐知你｜资料、工具与成长工作台

面向传统文化学习、自我探索与日常生活实践的综合工作台。

应用整合了原玄枢资料库与玄览专题，以一个入口提供七个主板块：资料、工具、心流、断舍离、现代风水、情绪周边设计、共同学习进步。不同流派、版本和算法口径保持独立标注，不把互相冲突的规则强行合并为一个结论。

## 已实现

- 13 个资料门类与 72 篇核心条目
- 13 套体系深度手册，包含术语、关系表、推演步骤、案例、误区和参考书目
- 全局搜索、难度筛选、收藏和最近阅读
- 六十四卦、二十四山、天干地支与八卦万物查表
- 黄历、八字、紫微、六爻、梅花、奇门、六壬、太乙等 15 个计算工具
- 15 个术式的中文表单，按起卦方式显示相关输入，手机端通过分组菜单选择术式
- 高级 JSON 输入模式与引擎参数校验
- 深浅主题与移动端布局
- Playwright 桌面和手机端自动化测试
- 玄览的先天八卦、卦辞、小六壬和 78 张塔罗牌资料，以及三组数字起卦和 AI 分析
- 心流计时、断舍离清单、现代风水空间检查、情绪周边设计草稿与学习进度记录

资料板块包含原资料库、全典总纲、典籍全文、术数查表和玄览专题；工具板块包含排盘工具、数字起卦与带掌诀图、AI 解读的“小六壬速起”。新增五个板块的记录保存在当前浏览器。共同学习进度可以复制后自行分享，目前不提供账户或多人同步。

## 技术栈

- React 19
- TypeScript
- Vite
- Express
- taibu-core
- Phosphor Icons
- Lucide Icons（玄览专题）
- Playwright
- Tauri 2（Windows 桌面端）

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

前端默认运行在 `http://127.0.0.1:5173`，本地计算接口运行在 `http://127.0.0.1:8787`。

数字起卦的 AI 分析使用项目根目录中被 Git 忽略的 `.env.llm.local.toml`。在新环境中运行时需要自行配置。密钥仅由服务端读取。

## Windows 桌面端

需要 Node.js 20+、Rust MSVC 工具链、Visual Studio C++ 构建工具和 WebView2。开发预览使用独立的 5174/8788 端口：

```bash
npm run desktop:dev
```

生成 Windows 安装包：

```bash
npm run desktop:build
```

安装包输出到 `src-tauri/target/release/bundle/nsis/`。桌面版随包携带 Node 运行时和本地 API 服务，启动时仅绑定 `127.0.0.1` 的随机端口。AI 配置首次启动时从模板复制到 `%APPDATA%\com.xiaojianzhini.studio\llm.toml`，填入自己的密钥后即可使用；该文件不进入 Git 或安装包。网页开发模式仍使用项目根目录的 `.env.llm.local.toml`。

## 生产构建

```bash
npm run build
npm start
```

## 验证

```bash
npm run lint
npm run test:unit
npm run test:ui
```

## 目录

```text
src/
  App.tsx            主工作台与排盘界面
  WorkspaceViews.tsx  心流、断舍离等五个生活板块
  TablesView.tsx     六十四卦与基础查表
  data.ts            核心资料与术式目录
  expandedData.ts    扩展体系资料
  knowledgePacks.ts  各体系的深度知识手册
server.mjs           本地计算与参考数据接口
xunlan/              玄览专题、数字起卦及其服务端分析逻辑
tests/               浏览器自动化测试
```

## 使用边界

本项目用于传统文化学习、资料检索与咨询记录。术数计算结果不构成医疗诊断、法律意见、投资建议或安全保证。涉及健康、安全、法律和重大财务决策时，应优先采用相应专业意见。
