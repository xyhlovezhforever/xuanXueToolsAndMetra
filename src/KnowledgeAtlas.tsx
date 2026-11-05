import { ArrowRight, CheckCircle, Database, GitBranch, WarningCircle } from '@phosphor-icons/react'
import { categories, references, type CategoryId } from './data'

const systemScopes: Array<{
  category: Exclude<CategoryId, 'all'>
  scope: string
  completeSets: string[]
  branches: string
}> = [
  { category: 'foundation', scope: '经传层次、阴阳五行、干支、八卦、六十四卦、河洛象数', completeSets: ['八卦 8', '六十四卦 64', '天干 10', '地支 12', '六十甲子 60'], branches: '义理、象数、训诂、占筮' },
  { category: 'fengshui', scope: '形势、阳宅、阴宅、罗盘、三合、三元玄空、八宅', completeSets: ['二十四山 24', '后天八方 8', '洛书九宫 9', '宅盘三层 3'], branches: '形势、三合、玄空、八宅、天纪地脉道' },
  { category: 'bazi', scope: '四柱、藏干、十神、旺衰、格局、调候、用神、运限', completeSets: ['十神 10', '十二长生 12', '四柱 4', '大运流年层级 4'], branches: '旺衰、格局、调候、盲派取象' },
  { category: 'ziwei', scope: '安星、十四主星、十二宫、辅煞、四化、三方四正、运限', completeSets: ['十四主星 14', '十二宫 12', '四化 4', '六条宫位轴 6'], branches: '三合、飞星、河洛、天纪天道' },
  { category: 'divination', scope: '六爻纳甲、用神、旺衰动变、梅花体用、起卦与复盘', completeSets: ['六亲 6', '六神 6', '八宫 8', '本互变三层 3'], branches: '纳甲六爻、梅花易数、易经占筮' },
  { category: 'sanshi', scope: '奇门遁甲、大六壬、太乙、小六壬的盘面与判断流程', completeSets: ['奇门九星 9', '八门 8', '八神 8', '六壬天将 12'], branches: '时家奇门、大六壬、太乙、小六壬' },
  { category: 'zeri', scope: '历法换算、节气、建除、值神、冲煞、事项择日', completeSets: ['节气 24', '建除 12', '值神 12', '二十八宿 28'], branches: '通书、婚嫁、修造、入宅、开业' },
  { category: 'xiangfa', scope: '面相区域、气色、手相掌丘与掌纹、形神声行及伦理', completeSets: ['面相十二宫 12', '三停 3', '五岳 5', '掌丘 8'], branches: '面相、手相、形体观察' },
  { category: 'naming', scope: '字义、音韵、字形、典故、登记、品牌与五格边界', completeSets: ['五层核验 5', '五格 5', '登记检查 8'], branches: '文字学、音韵、典故、商业命名、五格' },
  { category: 'classics', scope: '易学、堪舆、子平、斗数原典与历代注疏检索', completeSets: ['经传层次 2', '核心原典索引 8', '来源等级 6'], branches: '原文、注疏、校勘、现代研究' },
  { category: 'western', scope: '古典与现代占星、塔罗牌组、数字命理的结构和边界', completeSets: ['星座 12', '宫位 12', '主要行星 10', '塔罗牌 78'], branches: '古典占星、现代占星、RWS、马赛、托特' },
  { category: 'practice', scope: '访谈、校时、案卷、证据、隐私、风险转介与案例回测', completeSets: ['标准流程 8', '证据层级 6', '风险边界 5'], branches: '咨询方法、知识治理、隐私安全' },
]

const engines = ['八字', '四柱反推', '八字大运', '紫微命盘', '紫微运限', '紫微飞星', '六爻', '梅花易数', '奇门遁甲', '大六壬', '小六壬', '太乙', '塔罗', '西方占星', '黄历']

export default function KnowledgeAtlas({ onExplore }: { onExplore: (category: CategoryId) => void }) {
  return (
    <section className="atlas-view">
      <header className="atlas-intro">
        <div>
          <p className="eyebrow">知识总纲 · 逐项核查</p>
          <h1>全典不是一句“都有”，而是每一项都能找到</h1>
          <p>十二大体系按有限集合、流派分支、原典来源和计算能力分层。完整集合逐项收录，开放体系持续补充版本和注疏，缺口明确显示。</p>
        </div>
        <dl>
          <div><dt>{references.length}</dt><dd>深度专题</dd></div>
          <div><dt>{systemScopes.length}</dt><dd>知识体系</dd></div>
          <div><dt>{engines.length}</dt><dd>计算引擎</dd></div>
          <div><dt>64</dt><dd>卦完整表</dd></div>
        </dl>
      </header>

      <div className="atlas-principles">
        <article><CheckCircle size={22} weight="duotone" /><div><h2>有限集合逐项齐全</h2><p>有固定数量的基础坐标按全集管理，不用几篇概述代替完整表。</p></div></article>
        <article><GitBranch size={22} weight="duotone" /><div><h2>流派并列而非揉合</h2><p>三合、玄空、格局、飞星等规则分别标注来源，冲突处保留不同口径。</p></div></article>
        <article><WarningCircle size={22} weight="duotone" /><div><h2>开放文献不虚报完成</h2><p>历代注疏和地方传承无法封顶，网站公开边界，并按版本持续扩展。</p></div></article>
      </div>

      <section className="atlas-section">
        <div className="atlas-heading"><div><p className="eyebrow">十二大体系</p><h2>知识覆盖总目录</h2></div><span>每个体系可进入全文资料库</span></div>
        <div className="atlas-systems">
          {systemScopes.map((system) => {
            const meta = categories.find((item) => item.id === system.category)!
            const Icon = meta.icon
            const count = references.filter((entry) => entry.category === system.category).length
            return (
              <article key={system.category}>
                <div className="atlas-system-title"><span><Icon size={20} /></span><div><h3>{meta.label}</h3><p>{count} 篇专题</p></div></div>
                <p className="atlas-scope">{system.scope}</p>
                <div className="atlas-sets">{system.completeSets.map((item) => <span key={item}>{item}</span>)}</div>
                <p className="atlas-branches"><b>分支：</b>{system.branches}</p>
                <button type="button" onClick={() => onExplore(system.category)}>进入该体系 <ArrowRight size={16} /></button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="atlas-section atlas-engines">
        <div className="atlas-heading"><div><p className="eyebrow">可复现计算</p><h2>十五个本地排盘引擎</h2></div><Database size={24} /></div>
        <div>{engines.map((engine) => <span key={engine}><CheckCircle size={16} weight="fill" />{engine}</span>)}</div>
        <p>盘面事实由引擎计算，不凭记忆手排。知识库负责解释体系、证据顺序和流派边界。</p>
      </section>
    </section>
  )
}
