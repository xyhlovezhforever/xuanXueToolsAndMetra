import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  Calculator,
  CircleDotDashed,
  Clock3,
  Grid3X3,
  Hand,
  Info,
  Search,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import { BAGUA, HEXAGRAMS, LIUREN } from "../data";
import TAROT from "../tarot-data";
import { calculateHexagrams } from "./hexagram-calculator";
import { calculateXiaoliurenAt } from "./xiaoliuren-calculator";

const sectionMeta = {
  bagua: { kicker: "东方象数", title: "先天八卦", placeholder: "搜索本页资料", icon: CircleDotDashed },
  hexagrams: { kicker: "周易经文", title: "六十四卦", placeholder: "搜索卦名、卦辞或解释", icon: Grid3X3 },
  casting: { kicker: "先天数起卦", title: "数字起卦", icon: Calculator },
  xiaoliuren: { kicker: "民俗速断", title: "小六壬", placeholder: "搜索宫名、五行或诗诀", icon: Hand },
  tarot: { kicker: "Rider Waite 体系", title: "塔罗全牌", placeholder: "搜索牌名或牌义关键词", icon: Sparkles },
};

const sectionOrder = ["bagua", "hexagrams", "casting", "xiaoliuren", "tarot"];

const sectionLabels = {
  bagua: ["序数与象义", "八卦"],
  hexagrams: ["卦辞与白话解", "六十四卦"],
  casting: ["三数起卦", "起卦"],
  xiaoliuren: ["六宫、掌诀与起法", "小六壬"],
  tarot: ["七十八张牌义", "塔罗"],
};

const suitMeta = {
  major: { label: "大阿卡纳", emblem: "✦", domain: "人生阶段、重要选择与长期心理课题" },
  wands: { label: "权杖", emblem: "♣", domain: "行动、创造力、热情与事业推进" },
  cups: { label: "圣杯", emblem: "◡", domain: "情感、关系、直觉与内在感受" },
  swords: { label: "宝剑", emblem: "†", domain: "思考、沟通、判断与冲突" },
  pentacles: { label: "星币", emblem: "✺", domain: "金钱、工作、身体与现实成果" },
};

const rankNotes = {
  Ace: "一代表元素能量的开端，机会已经出现，但仍需要具体行动才能落地。",
  Two: "二带来两端之间的关系与选择，关键在看见双方如何互相影响。",
  Three: "三强调发展、表达与初步成果，也提示个人行动开始进入群体关系。",
  Four: "四关乎结构、稳定与边界，既能提供安全，也可能形成停滞。",
  Five: "五往往带来变化、摩擦或失衡，迫使人离开原有的舒适状态。",
  Six: "六指向调整后的流动、修复与过渡，事情开始寻找新的平衡。",
  Seven: "七强调考验、评估与个人立场，需要在复杂选项中保持清醒。",
  Eight: "八把能量推向落实、加速或限制，结果取决于是否掌握节奏。",
  Nine: "九接近阶段完成，经验已经成熟，同时也容易出现疲惫或过度。",
  Ten: "十是一个周期的完成与累积结果，也预示下一轮变化即将开始。",
  Page: "侍从代表消息、学习者或初生的态度，适合保持好奇并检验信息。",
  Knight: "骑士代表把元素能量带入行动的方式，动力充足，也要留意过度。",
  Queen: "王后代表对元素能量的内在掌握，重点是感受、容纳与成熟运用。",
  King: "国王代表对元素能量的外在掌握，重点是责任、秩序与实际领导。",
};

const majorNotes = [
  "愚者站在旅程起点，代表愿意进入未知。它鼓励带着开放心态迈步，同时别把信任变成没有准备的冒险。",
  "魔术师把想法、资源与行动连接起来。它提示你已经拥有可用工具，成败在于能否集中意志并诚实运用能力。",
  "女祭司指向安静的直觉与尚未显露的信息。比起立即表态，此时更适合观察梦境、情绪与潜台词。",
  "女皇象征滋养、丰盛与创造。它提醒让关系或项目获得生长条件，也要避免只照顾别人而耗尽自己。",
  "皇帝象征结构、规则与承担。明确边界能带来稳定，但权威若失去弹性，也会变成控制。",
  "教皇与传统、知识传承和共同信念有关。它可代表导师与制度，也邀请你分辨哪些规则仍有价值。",
  "恋人不只谈爱情，更谈价值一致后的选择。真正的结合需要诚实面对欲望、责任与选择的后果。",
  "战车要求把相反力量纳入同一方向。决心与自律能推动前进，但单靠压制并不能维持长期控制。",
  "力量强调温柔而稳定的勇气。与其硬碰硬，不如理解本能、安顿情绪，再把力量用在真正重要之处。",
  "隐士主动离开喧闹，寻找自己的答案。独处能带来智慧，但不要让反思变成与世界完全断开。",
  "命运之轮象征周期转换与外部变量。无法控制所有变化，却可以辨认窗口，并决定自己怎样回应。",
  "正义要求事实、比例与责任相匹配。作决定前应检视证据，也要准备承担过去选择带来的结果。",
  "倒吊人通过暂停换取新视角。暂时不行动未必是浪费，放下旧立场后，问题可能出现不同解法。",
  "死神代表必要的结束与转化，通常不是字面死亡。旧阶段真正结束，新的空间才会出现。",
  "节制把不同成分耐心调和。它鼓励循序调整、寻找中道，让看似冲突的需要可以共存。",
  "恶魔揭示欲望、依赖与自我束缚。看见自己随时拥有选择权，是松开锁链的第一步。",
  "高塔让不稳固的结构突然暴露。冲击虽难受，却会打破幻象，迫使人以真实基础重新建立。",
  "星星是在动荡之后重新出现的希望。它支持疗愈、诚实表达与长线信念，但希望仍需具体照料。",
  "月亮照见模糊、投射与潜意识。信息不全时先容纳不确定，分辨直觉与恐惧，不宜仓促下结论。",
  "太阳象征清晰、生命力与被看见。它支持坦率行动与共享成果，也提醒快乐不需要夸大证明。",
  "审判是一种清醒的召唤，要求回顾过去并作出回应。接纳经验后，才能从旧评价中解放出来。",
  "世界代表一个周期完成、经验整合与边界扩展。庆祝成果之后，也要为下一段旅程留出空间。",
];

const handPositions = [
  { index: 0, x: "28.5%", y: "55%", place: "食指根部" },
  { index: 1, x: "28.5%", y: "24%", place: "食指上部" },
  { index: 2, x: "49.5%", y: "17%", place: "中指上部" },
  { index: 3, x: "70.5%", y: "24%", place: "无名指上部" },
  { index: 4, x: "70.5%", y: "55%", place: "无名指根部" },
  { index: 5, x: "49.5%", y: "61%", place: "中指根部" },
];

function containsTerm(values, term) {
  if (!term) return true;
  return values.filter(Boolean).join(" ").toLowerCase().includes(term.toLowerCase());
}

function roman(value) {
  if (value === 0) return "0";
  const pairs = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let result = "";
  let n = value;
  pairs.forEach(([number, glyph]) => {
    while (n >= number) {
      result += glyph;
      n -= number;
    }
  });
  return result;
}

function tarotRank(card) {
  return card.suit === "major" ? card.number : card.name.split(" of ")[0];
}

function tarotLabel(card) {
  if (card.suit === "major") return roman(card.number);
  const labels = { Ace: "A", Two: "2", Three: "3", Four: "4", Five: "5", Six: "6", Seven: "7", Eight: "8", Nine: "9", Ten: "10", Page: "P", Knight: "N", Queen: "Q", King: "K" };
  return labels[tarotRank(card)] || tarotRank(card);
}

function tarotExplanation(card) {
  if (card.suit === "major") return majorNotes[card.number];
  return `${rankNotes[tarotRank(card)] || ""} 在${suitMeta[card.suit].domain}的语境中，它把注意力放在${card.keywords.join("、")}。`;
}

function Sidebar({ section, onSection }) {
  return (
    <aside className="sidebar" aria-label="资料导航">
      <button className="brand brand-button" type="button" onClick={() => onSection("bagua")} aria-label="回到先天八卦">
        <span className="brand-mark" aria-hidden="true">☰</span>
        <span><b>玄览</b><small>术数资料库</small></span>
      </button>
      <nav className="side-nav" aria-label="主题">
        {sectionOrder.map((name) => {
          const meta = sectionMeta[name];
          const Icon = meta.icon;
          return (
            <button key={name} type="button" className={`nav-item ${section === name ? "is-active" : ""}`} onClick={() => onSection(name)} aria-current={section === name ? "page" : undefined}>
              <span className="nav-index"><Icon size={18} aria-hidden="true" /></span>
              <span>{meta.title}</span><small>{sectionLabels[name][0]}</small>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-note">
        <span className="seal" aria-hidden="true">览</span>
        <p>经典原文与民俗解释分栏整理。资料仅供文化学习与自我反思。</p>
      </div>
    </aside>
  );
}

function Topbar({ section, search, onSearch, onSection }) {
  const meta = sectionMeta[section];
  return (
    <>
      <header className="topbar">
        <div><p className="eyebrow">{meta.kicker}</p><h1>{meta.title}</h1></div>
        {section !== "casting" && <label className="global-search" htmlFor="global-search">
          <Search size={16} aria-hidden="true" />
          <input id="global-search" type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder={meta.placeholder} autoComplete="off" />
          <kbd>⌘ K</kbd>
        </label>}
      </header>
      <nav className="mobile-nav" aria-label="移动端主题">
        {sectionOrder.map((name) => (
          <button key={name} type="button" className={section === name ? "is-active" : ""} onClick={() => onSection(name)}>
            {sectionLabels[name][1]}
          </button>
        ))}
      </nav>
    </>
  );
}

function DetailSheet({ children, className = "" }) {
  return <article className={`detail-sheet ${className}`}>{children}</article>;
}

function BaguaView({ search }) {
  const [selected, setSelected] = useState(0);
  const angles = { 乾: 0, 兑: -45, 离: -90, 震: -135, 坤: 180, 艮: 135, 坎: 90, 巽: 45 };
  const visible = BAGUA.filter((item) => containsTerm([item.name, item.nature, item.family, item.direction, item.virtue, item.meaning], search));
  const item = visible.includes(BAGUA[selected]) ? BAGUA[selected] : visible[0] || BAGUA[0];
  const activeIndex = BAGUA.indexOf(item);

  return (
    <section className="view is-active" aria-labelledby="bagua-heading">
      <div className="section-intro">
        <div><p className="section-number">01 · 先天之序</p><h2 id="bagua-heading">乾一兑二离三震四<br />巽五坎六艮七坤八</h2></div>
        <p>先天八卦又称伏羲八卦，以阴阳爻的消长排列。点击圆盘中的卦，可查看卦象、自然象征、家族关系与方位。</p>
      </div>
      <div className="bagua-layout">
        <div className="bagua-stage" aria-label="先天八卦方位图">
          <div className="bagua-orbit">
            {BAGUA.map((entry, index) => (
              <button key={entry.name} type="button" hidden={!visible.includes(entry)} className={`trigram-node ${index === activeIndex ? "is-active" : ""}`} style={{ "--angle": `${angles[entry.name]}deg` }} onClick={() => setSelected(index)} aria-label={`${entry.name}卦，先天序数${entry.number}`}>
                <b>{entry.symbol}</b><span>{entry.number} · {entry.name}</span>
              </button>
            ))}
          </div>
          <div className="taiji" aria-hidden="true"><span /></div>
        </div>
        <DetailSheet>
          <div className="detail-topline"><div><span className="detail-number">先天序数 {item.number}</span><h3>{item.name}卦</h3></div><span className="detail-symbol">{item.symbol}</span></div>
          <p className="latin">三爻编码 {item.binary} · 阳爻记 1，阴爻记 0</p>
          <div className="detail-grid"><div><small>自然取象</small><b>{item.nature}</b></div><div><small>先天方位</small><b>{item.direction}</b></div><div><small>家族取象</small><b>{item.family}</b></div><div><small>卦德</small><b>{item.virtue}</b></div></div>
          <p className="detail-explain">{item.meaning}</p>
        </DetailSheet>
      </div>
      <div className="order-strip" aria-label="八卦序数">{BAGUA.map((entry) => <div className="order-item" key={entry.name}><b>{entry.number} {entry.name}</b><span>{entry.symbol} · {entry.nature}</span></div>)}</div>
      <aside className="source-note"><b>阅读提示</b><p>此处采用常见的先天方位：乾南、坤北、离东、坎西、兑东南、震东北、巽西南、艮西北。地图习惯以“上南下北”呈现，和现代地图相反。</p></aside>
    </section>
  );
}

function HexagramsView({ search }) {
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => HEXAGRAMS.filter((item) => {
    const inRange = filter === "all" || (() => { const [min, max] = filter.split("-").map(Number); return item.number >= min && item.number <= max; })();
    return inRange && containsTerm([item.number, item.name, item.guaci, item.meaning], search);
  }), [filter, search]);
  const item = filtered.includes(HEXAGRAMS[selected]) ? HEXAGRAMS[selected] : filtered[0] || HEXAGRAMS[0];
  const activeIndex = HEXAGRAMS.indexOf(item);
  const filters = [["all", "全部 64"], ["1-16", "上经前篇"], ["17-30", "上经后篇"], ["31-48", "下经前篇"], ["49-64", "下经后篇"]];

  return (
    <section className="view is-active" aria-labelledby="hexagrams-heading">
      <div className="section-intro compact"><div><p className="section-number">02 · 周易经文</p><h2 id="hexagrams-heading">六十四卦</h2></div><p>按通行的文王卦序排列。每卦收录卦名、卦辞原文与一段不替代专业注疏的白话提示。</p></div>
      <div className="filter-row" aria-label="六十四卦筛选">{filters.map(([value, label]) => <button key={value} type="button" className={`filter-chip ${filter === value ? "is-active" : ""}`} onClick={() => setFilter(value)}>{label}</button>)}</div>
      {filtered.length ? (
        <div className="library-layout">
          <div className="hex-grid" aria-label="六十四卦列表">{filtered.map((entry) => { const index = HEXAGRAMS.indexOf(entry); return <button key={entry.number} type="button" className={`hex-tile ${index === activeIndex ? "is-active" : ""}`} onClick={() => setSelected(index)} aria-label={`第${entry.number}卦 ${entry.name}`}><span className="num">{String(entry.number).padStart(2, "0")}</span><b>{entry.name}</b><span className="symbol">{entry.symbol}</span></button>; })}</div>
          <DetailSheet className="sticky-detail"><div className="detail-topline"><div><span className="detail-number">第 {item.number} 卦</span><h3>{item.name}卦</h3></div><span className="detail-symbol">{item.symbol}</span></div><div className="quote-block"><small>卦辞原文</small><p>{item.guaci}</p></div><h4>白话提示</h4><p className="detail-explain">{item.meaning}</p><p className="latin">这里解释的是卦辞整体主题，不含六爻爻辞。研读时可再对照《彖传》《象传》及历代注本。</p></DetailSheet>
        </div>
      ) : <p className="empty-state">没有找到匹配的卦名或卦辞。</p>}
    </section>
  );
}

function hexagramTitle(hexagram, lower, upper) {
  return lower === upper ? `${upper.name}为${upper.nature}` : `${upper.nature}${lower.nature}${hexagram.name}`;
}

function movingLineName(line, value) {
  const tone = value === "1" ? "九" : "六";
  if (line === 1) return `初${tone}`;
  if (line === 6) return `上${tone}`;
  return `${tone}${["", "", "二", "三", "四", "五"][line]}`;
}

function HexagramFigure({ lines, movingLine }) {
  return (
    <div className="cast-lines" aria-label="六爻，自上而下显示">
      {[5, 4, 3, 2, 1, 0].map((index) => (
        <div key={index} className={`cast-line-row ${movingLine === index + 1 ? "is-moving" : ""}`}>
          <span className="cast-line-label">{index + 1}</span>
          <span className={`cast-line ${lines[index] === "1" ? "is-yang" : "is-yin"}`} aria-label={`第${index + 1}爻，${lines[index] === "1" ? "阳" : "阴"}`}>
            <i />{lines[index] === "0" && <i />}
          </span>
          <span className="cast-moving-label">{movingLine === index + 1 ? "动" : ""}</span>
        </div>
      ))}
    </div>
  );
}

function CastingView() {
  const [digits, setDigits] = useState(["", "", ""]);
  const [result, setResult] = useState(null);
  const [question, setQuestion] = useState("");
  const [tier, setTier] = useState("balanced");
  const [analysis, setAnalysis] = useState({ status: "idle" });
  const analysisRequest = useRef(null);
  const inputs = [["下卦", 8], ["上卦", 8], ["动爻", 6]];

  useEffect(() => () => analysisRequest.current?.abort(), []);

  const clearAnalysis = () => {
    analysisRequest.current?.abort();
    setAnalysis({ status: "idle" });
  };

  const requestAnalysis = async (castResult) => {
    analysisRequest.current?.abort();
    const controller = new AbortController();
    analysisRequest.current = controller;
    setAnalysis({ status: "loading" });
    try {
      const response = await fetch("/api/hexagram-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ digits: castResult.digits, question, provider: "alibaba", tier }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "分析暂时不可用");
      if (!controller.signal.aborted) setAnalysis({ status: "success", ...data });
    } catch (error) {
      if (!controller.signal.aborted) setAnalysis({ status: "error", message: error.message });
    }
  };

  const updateDigits = (index, value) => {
    setDigits((current) => current.map((entry, position) => position === index ? value.replace(/\D/g, "").slice(0, 3) : entry));
    setResult(null);
    clearAnalysis();
  };

  const cast = (event) => {
    event.preventDefault();
    const castResult = { ...calculateHexagrams(...digits), digits: [...digits] };
    setResult(castResult);
    requestAnalysis(castResult);
  };

  return (
    <section className="view is-active casting-view" aria-labelledby="casting-heading">
      <div className="section-intro compact"><div><p className="section-number">03 · 数字起卦</p><h2 id="casting-heading">三数成卦</h2></div><p>以先天八卦序数取上下卦，自下而上数动爻。余数为零时，下卦、上卦按 8 计，动爻按 6 计。</p></div>
      <form className="cast-form" onSubmit={cast}>
        <div className="cast-inputs">
          {inputs.map(([label, divisor], index) => (
            <label key={label} className="cast-input">
              <span><b>{label}</b><small>÷ {divisor}</small></span>
              <input type="text" inputMode="numeric" autoComplete="off" pattern="[0-9]{3}" maxLength={3} required value={digits[index]} onChange={(event) => updateDigits(index, event.target.value)} placeholder="000" aria-label={`${label}，三位数字`} />
            </label>
          ))}
        </div>
        <div className="cast-ai-options">
          <label className="cast-question"><span>所问之事 <small>选填</small></span><textarea value={question} onChange={(event) => { setQuestion(event.target.value); clearAnalysis(); }} maxLength={300} rows={2} placeholder="例如：这段关系该如何推进？" /></label>
          <div className="cast-tier"><span>分析深度</span><div role="group" aria-label="分析深度">{[["fast", "快速"], ["balanced", "均衡"], ["quality", "深入"]].map(([value, label]) => <button key={value} type="button" className={tier === value ? "is-active" : ""} aria-pressed={tier === value} onClick={() => { setTier(value); clearAnalysis(); }}>{label}</button>)}</div></div>
        </div>
        <button className="cast-submit" type="submit">计算并分析 <ArrowRight size={18} aria-hidden="true" /></button>
      </form>
      {result && <div className="cast-result" aria-live="polite">
        <div className="cast-steps" aria-label="取余计算过程">
          {inputs.map(([label, divisor], index) => {
            const remainder = Number(result.digits[index]) % divisor;
            const position = index === 0 ? result.lower.number : index === 1 ? result.upper.number : result.movingLine;
            const name = index === 0 ? result.lower.name : index === 1 ? result.upper.name : movingLineName(position, result.originalLines[position - 1]);
            return <div key={label}><small>{label}</small><b>{result.digits[index]} ÷ {divisor} 余 {remainder}</b><span>{remainder === 0 ? `按 ${position} 计 · ` : `${position} · `}{name}</span></div>;
          })}
        </div>
        <div className="cast-result-heading"><span className="section-number">计算结果</span><h3>本卦 <ArrowRight size={20} aria-hidden="true" /> 之卦</h3></div>
        <div className="cast-pair">
          <article className="cast-hexagram">
            <div className="cast-hexagram-head"><span>本卦 · 第 {result.original.number} 卦</span><b aria-hidden="true">{result.original.symbol}</b></div>
            <h4>{hexagramTitle(result.original, result.lower, result.upper)}</h4>
            <p>上{result.upper.name}{result.upper.symbol} · 下{result.lower.name}{result.lower.symbol}</p>
            <HexagramFigure lines={result.originalLines} movingLine={result.movingLine} />
            <div className="cast-text"><small>卦辞</small><p>{result.original.guaci}</p><small>白话提示</small><p>{result.original.meaning}</p></div>
          </article>
          <article className="cast-hexagram">
            <div className="cast-hexagram-head"><span>之卦 · 第 {result.changed.number} 卦</span><b aria-hidden="true">{result.changed.symbol}</b></div>
            <h4>{hexagramTitle(result.changed, result.changedLower, result.changedUpper)}</h4>
            <p>上{result.changedUpper.name}{result.changedUpper.symbol} · 下{result.changedLower.name}{result.changedLower.symbol}</p>
            <HexagramFigure lines={result.changedLines} />
            <div className="cast-text"><small>卦辞</small><p>{result.changed.guaci}</p><small>白话提示</small><p>{result.changed.meaning}</p></div>
          </article>
        </div>
        <p className="cast-footnote">动爻为{movingLineName(result.movingLine, result.originalLines[result.movingLine - 1])}。本站暂未收录爻辞，解读时请另对照原文。</p>
        <section className="cast-analysis" aria-labelledby="cast-analysis-heading">
          <div className="cast-analysis-head"><div><span className="section-number">卦象解读</span><h3 id="cast-analysis-heading">AI 分析</h3></div><button type="button" title="重新分析" aria-label="重新分析" onClick={() => requestAnalysis(result)} disabled={analysis.status === "loading"}><RefreshCw size={18} aria-hidden="true" /></button></div>
          {analysis.status === "loading" && <p className="cast-analysis-status" role="status">正在分析卦象…</p>}
          {analysis.status === "idle" && <p className="cast-analysis-status">点击重新分析生成解读。</p>}
          {analysis.status === "error" && <p className="cast-analysis-status is-error" role="alert">{analysis.message}</p>}
          {analysis.status === "success" && <><p className="cast-analysis-model">通义千问 · {analysis.model}</p><div className="cast-analysis-text">{analysis.analysis}</div></>}
        </section>
      </div>}
    </section>
  );
}

function LiurenDetail({ item }) {
  return (
    <DetailSheet>
      <div className="detail-topline"><div><span className="detail-number">六宫第 {item.number} 位 · {item.nature}</span><h3>{item.name}</h3></div><span className="detail-symbol">{item.element}</span></div>
      <p className="latin">{item.gist}</p>
      <div className="detail-grid"><div><small>五行</small><b>{item.element}</b></div><div><small>方位</small><b>{item.direction}</b></div><div><small>神将</small><b>{item.spirit}</b></div><div><small>常用数</small><b>{item.numbers}</b></div></div>
      <p className="detail-explain">{item.explanation}</p>
      <div className="quote-block"><small>常见诗诀</small><p>{item.verse}</p></div>
    </DetailSheet>
  );
}

function HandDiagram({ selected, onSelect }) {
  return (
    <div className="hand-stage">
      <svg className="hand-illustration" viewBox="0 0 420 520" role="img" aria-labelledby="hand-title hand-desc">
        <title id="hand-title">小六壬左手掌诀六宫定位图</title>
        <desc id="hand-desc">从食指根部大安起，依次经过食指上部留连、中指上部速喜、无名指上部赤口、无名指根部小吉、中指根部空亡。</desc>
        <g className="hand-silhouette">
          <rect x="74" y="230" width="278" height="260" rx="112" />
          <rect x="98" y="78" width="64" height="270" rx="32" />
          <rect x="174" y="35" width="64" height="300" rx="32" />
          <rect x="250" y="68" width="64" height="280" rx="32" />
          <rect x="318" y="132" width="48" height="225" rx="24" />
          <rect x="28" y="270" width="132" height="68" rx="34" transform="rotate(34 28 270)" />
        </g>
        <path className="hand-route" d="M120 286 L120 126 L206 88 L282 126 L282 286 L206 316 Z" />
      </svg>
      {handPositions.map((position) => {
        const palace = LIUREN[position.index];
        return (
          <button key={palace.name} type="button" className={`hand-node ${selected === position.index ? "is-active" : ""}`} style={{ "--x": position.x, "--y": position.y }} onClick={() => onSelect(position.index)} aria-label={`${position.place}，${palace.name}`}>
            <b>{palace.name}</b><small>{position.place}</small>
          </button>
        );
      })}
      <div className="hand-caption"><Hand size={18} aria-hidden="true" /><span>左手掌心向自己</span></div>
    </div>
  );
}

function XiaoliurenView({ search, onSearch }) {
  const [selected, setSelected] = useState(0);
  const [quick, setQuick] = useState(null);
  const [question, setQuestion] = useState("");
  const [tier, setTier] = useState("balanced");
  const [analysis, setAnalysis] = useState({ status: "idle" });
  const analysisRequest = useRef(null);
  const visible = LIUREN.filter((item) => containsTerm([item.name, item.element, item.direction, item.nature, item.gist, item.explanation, item.verse], search));
  const item = visible.includes(LIUREN[selected]) ? LIUREN[selected] : visible[0] || LIUREN[0];
  const activeIndex = LIUREN.indexOf(item);

  useEffect(() => () => analysisRequest.current?.abort(), []);

  const clearAnalysis = () => {
    analysisRequest.current?.abort();
    setAnalysis({ status: "idle" });
  };

  const castNow = () => {
    clearAnalysis();
    const now = new Date();
    const cast = calculateXiaoliurenAt(now);
    setQuick({ ...cast, timestamp: now.toISOString() });
    onSearch("");
    setSelected(cast.finalIndex);
  };

  const requestAnalysis = async () => {
    if (!quick) return;
    analysisRequest.current?.abort();
    const controller = new AbortController();
    analysisRequest.current = controller;
    setAnalysis({ status: "loading" });
    try {
      const response = await fetch("/api/xiaoliuren-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: quick.timestamp, timeZone: quick.timeZone, question, provider: "alibaba", tier }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "分析暂时不可用");
      if (!controller.signal.aborted) setAnalysis({ status: "success", ...data });
    } catch (error) {
      if (!controller.signal.aborted) setAnalysis({ status: "error", message: error.message });
    }
  };

  return (
    <section className="view is-active" aria-labelledby="xiaoliuren-heading">
      <div className="section-intro compact"><div><p className="section-number">04 · 民俗速断</p><h2 id="xiaoliuren-heading">小六壬六宫</h2></div></div>
      <div className="liuren-quick">
        <div className="liuren-quick-head"><div><h3>当前时间快速起卦</h3></div><button type="button" onClick={castNow}><Clock3 size={18} aria-hidden="true" />立即起卦</button></div>
        {quick && <>
          <div className="liuren-quick-result" aria-live="polite"><p>{quick.solarTime} · {quick.timeZone}<br />农历{quick.leapMonth ? "闰" : ""}{quick.lunarMonth}月{quick.lunarDay}日 · {quick.branch}时</p><ol><li><small>月宫</small><b>{LIUREN[quick.monthIndex].name}</b></li><li><small>日宫</small><b>{LIUREN[quick.dayIndex].name}</b></li><li><small>时宫 · 结果</small><b>{LIUREN[quick.finalIndex].name}</b></li></ol></div>
          <section className="cast-analysis liuren-analysis" aria-labelledby="liuren-analysis-heading">
            <div className="cast-analysis-head"><div><span className="section-number">落宫解读</span><h3 id="liuren-analysis-heading">AI 分析</h3></div></div>
            <div className="cast-ai-options liuren-ai-options">
              <label className="cast-question"><span>所问之事 <small>选填</small></span><textarea value={question} onChange={(event) => { setQuestion(event.target.value); clearAnalysis(); }} maxLength={300} rows={2} placeholder="例如：这件事该如何推进？" /></label>
              <div className="cast-tier"><span>分析深度</span><div role="group" aria-label="小六壬分析深度">{[["fast", "快速"], ["balanced", "均衡"], ["quality", "深入"]].map(([value, label]) => <button key={value} type="button" className={tier === value ? "is-active" : ""} aria-pressed={tier === value} onClick={() => { setTier(value); clearAnalysis(); }}>{label}</button>)}</div></div>
            </div>
            <button className="cast-submit" type="button" onClick={requestAnalysis} disabled={analysis.status === "loading"}><Sparkles size={18} aria-hidden="true" />{analysis.status === "loading" ? "正在分析…" : analysis.status === "idle" ? "AI 分析" : "重新分析"}</button>
            {analysis.status === "loading" && <p className="cast-analysis-status" role="status">正在分析落宫…</p>}
            {analysis.status === "error" && <p className="cast-analysis-status is-error" role="alert">{analysis.message}</p>}
            {analysis.status === "success" && <><p className="cast-analysis-model">通义千问 · {analysis.model}</p><div className="cast-analysis-text">{analysis.analysis}</div></>}
          </section>
        </>}
      </div>
      <section className="hand-chapter" aria-labelledby="hand-heading">
        <div className="section-intro compact hand-intro"><div><p className="section-number">04 · 掌上定位</p><h2 id="hand-heading">六宫在左手哪里</h2></div></div>
        <div className="hand-layout">
          <HandDiagram selected={activeIndex} onSelect={setSelected} />
          <div className="hand-guide">
            <p className="hand-guide-intro">常见掌诀取左手食指、中指、无名指的上部与根部六处。顺着红线循环数宫，手指就是随身的六宫盘。</p>
            <p className="hand-current"><span>{activeIndex + 1}</span><b>{item.name}</b><small>{handPositions[activeIndex].place}</small></p>
            <ol>{handPositions.map((position) => <li key={position.index} className={activeIndex === position.index ? "is-active" : ""}><button type="button" onClick={() => setSelected(position.index)}><span>{position.index + 1}</span><b>{LIUREN[position.index].name}</b><small>{position.place}</small></button></li>)}</ol>
            <aside className="palm-note"><Info size={18} aria-hidden="true" /><p>这是民间最常见的一种掌诀定位。部分传承会使用指节或指腹的不同落点，但六宫次序不变。实际学习时应以所从师承口径为准。</p></aside>
          </div>
        </div>
      </section>

      <p className="liuren-overview">以大安为起点，按大安、留连、速喜、赤口、小吉、空亡循环。点选宫位查看五行、方位、性质与常见诗诀。</p>
      <div className="liuren-layout">
        <div className="liuren-wheel" aria-label="小六壬六宫循环图"><div className="wheel-center"><b>月</b><span>日</span><small>时</small></div>{LIUREN.map((entry, index) => <button key={entry.name} type="button" hidden={!visible.includes(entry)} className={`palace-node ${index === activeIndex ? "is-active" : ""}`} style={{ "--angle": `${index * 60}deg` }} onClick={() => setSelected(index)}><b>{entry.name}</b><small>{entry.nature} · {entry.element}</small></button>)}</div>
        <LiurenDetail item={item} />
      </div>

      <section className="method-band" aria-labelledby="method-heading"><div><p className="section-number">三步起法</p><h3 id="method-heading">月上起日，日上起时</h3></div><ol className="method-steps"><li><span>一</span><div><b>月上起</b><p>正月从大安起，按农历月份顺数，数到当月即为月宫。</p></div></li><li><span>二</span><div><b>日上落</b><p>以月宫为初一，按农历日期继续顺数，数到当日即为日宫。</p></div></li><li><span>三</span><div><b>时上落</b><p>以日宫为子时，按十二时辰继续顺数，最终落宫作为结果。</p></div></li></ol></section>
      <aside className="source-note warning"><b>口径说明</b><p>自动起卦采用浏览器当地时间，闰月按原月数，23:00 至 00:59 为子时，23:00 后不提前换农历日期。不同民间传承在掌上落点、闰月、子时换日、方位与应期上可能有差异。本站展示的是常见六宫法，适合文化学习，不用于替代现实决策。</p></aside>
    </section>
  );
}

function TarotView({ search }) {
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => TAROT.filter((card) => (filter === "all" || card.suit === filter) && containsTerm([card.name, card.nameChinese, ...(card.keywords || []), ...(card.reversedKeywords || []), card.element, card.astrologicalCorrespondence], search)), [filter, search]);
  const card = filtered.includes(TAROT[selected]) ? TAROT[selected] : filtered[0] || TAROT[0];
  const activeIndex = TAROT.indexOf(card);
  const meta = suitMeta[card.suit];
  const filters = [["all", "全部 78"], ["major", "大阿卡纳 22"], ["wands", "权杖 14"], ["cups", "圣杯 14"], ["swords", "宝剑 14"], ["pentacles", "星币 14"]];

  return (
    <section className="view is-active" aria-labelledby="tarot-heading">
      <div className="section-intro compact"><div><p className="section-number">05 · Rider Waite 体系</p><h2 id="tarot-heading">塔罗全套 78 张</h2></div><p>含 22 张大阿卡纳与 56 张小阿卡纳。每张牌提供正位、逆位关键词、元素与一段情境化解释。</p></div>
      <div className="filter-row tarot-filters" aria-label="塔罗牌组筛选">{filters.map(([value, label]) => <button key={value} type="button" className={`filter-chip ${filter === value ? "is-active" : ""}`} onClick={() => setFilter(value)}>{label}</button>)}</div>
      {filtered.length ? (
        <div className="library-layout tarot-layout">
          <div className="tarot-grid" aria-label="七十八张塔罗牌">{filtered.map((entry) => { const index = TAROT.indexOf(entry); const entryMeta = suitMeta[entry.suit]; return <button key={entry.name} type="button" className={`tarot-card ${index === activeIndex ? "is-active" : ""}`} data-suit={entry.suit} onClick={() => setSelected(index)} aria-label={`${entry.nameChinese}，${entryMeta.label}`}><span className="card-number">{tarotLabel(entry)} · {entryMeta.label}</span><span className="card-emblem" aria-hidden="true">{entryMeta.emblem}</span><span className="card-name"><b>{entry.nameChinese}</b><small>{entry.name}</small></span></button>; })}</div>
          <DetailSheet className="sticky-detail tarot-detail"><div className="detail-topline"><div><span className="detail-number">{meta.label} · {tarotLabel(card)}</span><h3>{card.nameChinese}</h3></div><span className="detail-symbol">{meta.emblem}</span></div><p className="latin">{card.name}{card.astrologicalCorrespondence ? ` · ${card.astrologicalCorrespondence}` : ""}</p><div className="detail-grid"><div><small>牌组</small><b>{meta.label}</b></div><div><small>元素</small><b>{card.element || "综合"}</b></div></div><p className="detail-explain">{tarotExplanation(card)}</p><div className="position-block"><h4>正位关键词</h4><ul className="keyword-list">{card.keywords.map((word) => <li key={word}>{word}</li>)}</ul><p>正位时，这些能量通常较直接地表达出来。结合实际问题，观察它们是资源、行动方向，还是正在发生的状态。</p></div><div className="position-block"><h4>逆位关键词</h4><ul className="keyword-list">{card.reversedKeywords.map((word) => <li key={word}>{word}</li>)}</ul><p>逆位不必简单理解为正位的反义。它也可能表示能量受阻、转向内在、过度使用，或尚未成熟。</p></div></DetailSheet>
        </div>
      ) : <p className="empty-state">没有找到匹配的牌名或关键词。</p>}
    </section>
  );
}

function InfoDialog({ type, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (type && ref.current && !ref.current.open) ref.current.showModal();
  }, [type]);
  if (!type) return null;
  const isAbout = type === "about";
  return (
    <dialog ref={ref} onClose={onClose} onClick={(event) => event.target === ref.current && onClose()}>
      <button className="dialog-close" type="button" aria-label="关闭" onClick={() => ref.current?.close()}><X aria-hidden="true" /></button>
      <p className="section-number">{isAbout ? "资料说明" : "隐私说明"}</p>
      <h2>{isAbout ? "原文与解释的边界" : "所有操作都留在本地"}</h2>
      {isAbout ? <><p>六十四卦卦辞采用《周易》通行文本，白话提示是便于入门的主题概括，不替代专门注疏。数字起卦采用先天八卦序数，本站未收录爻辞。小六壬属于民俗术数，不同传承存在口径差异。塔罗资料采用 Rider Waite 体系的常见牌义框架。</p><p>本站不提供医疗、法律、投资或人生重大决策的替代意见。</p></> : <p>起卦和搜索在浏览器中完成。使用 AI 分析时，数字起卦的三组数字与问题，或小六壬的起卦时间、时区与问题会发送至配置的模型服务；密钥仅保存在本地服务端。本站没有账户或统计脚本。</p>}
    </dialog>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const embedded = params.has("embed");
  const toolFocus = params.get("focus") === "tool";
  const initial = window.location.hash.slice(1);
  const [section, setSection] = useState(sectionMeta[initial] ? initial : "bagua");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const syncSection = () => {
      const next = window.location.hash.slice(1);
      if (sectionMeta[next]) { setSection(next); setSearch(""); }
    };
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

  const changeSection = (name) => {
    setSection(name);
    setSearch("");
    window.history.replaceState(null, "", `#${name}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!embedded) return;
    document.body.classList.add("embedded");
    if (toolFocus) document.body.classList.add("tool-focus");
    const syncTheme = () => { document.documentElement.dataset.theme = window.parent.document.documentElement.dataset.theme || "light"; };
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(window.parent.document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    syncTheme();
    const reportHeight = () => window.parent.postMessage({ type: "xunlan:height", height: document.getElementById("root").scrollHeight }, window.location.origin);
    const observer = new ResizeObserver(reportHeight);
    observer.observe(document.getElementById("root"));
    reportHeight();
    return () => { observer.disconnect(); themeObserver.disconnect(); document.body.classList.remove("embedded", "tool-focus"); };
  }, [embedded, toolFocus]);

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">跳到正文</a>
      <div className="app-shell">
        {!embedded && <Sidebar section={section} onSection={changeSection} />}
        <main id="main-content" className="main-content">
          <Topbar section={section} search={search} onSearch={setSearch} onSection={changeSection} />
          {section === "bagua" && <BaguaView search={search} />}
          {section === "hexagrams" && <HexagramsView search={search} />}
          {section === "casting" && <CastingView />}
          {section === "xiaoliuren" && <XiaoliurenView search={search} onSearch={setSearch} />}
          {section === "tarot" && <TarotView search={search} />}
          <footer><p>玄览 · 传统文化学习资料库</p><div><button type="button" onClick={() => setDialog("about")}><BookOpenText size={14} aria-hidden="true" />资料说明</button><button type="button" onClick={() => setDialog("privacy")}><ShieldCheck size={14} aria-hidden="true" />隐私说明</button></div></footer>
        </main>
      </div>
      <InfoDialog type={dialog} onClose={() => setDialog(null)} />
    </>
  );
}
