import { useEffect, useMemo, useState } from 'react'
import { Compass, GridFour, MagnifyingGlass, Mountains, Rows } from '@phosphor-icons/react'

type TableId = 'hexagrams' | 'mountains' | 'stems' | 'trigrams'

interface Hexagram {
  number: number
  name: string
  code: string
  upperTrigram: string
  lowerTrigram: string
  element: string
  nature: string
  judgment: string
  image: string
}

const tableTabs = [
  { id: 'hexagrams' as const, label: '六十四卦', icon: GridFour },
  { id: 'mountains' as const, label: '二十四山', icon: Compass },
  { id: 'stems' as const, label: '干支五行', icon: Rows },
  { id: 'trigrams' as const, label: '八卦万物', icon: Mountains },
]

const mountains = [
  ['子', '壬', '癸', '北', '水', '352.5° 至 7.5°'], ['癸', '癸', '丑', '北偏东', '水', '7.5° 至 22.5°'],
  ['丑', '癸', '丑', '北偏东', '土', '22.5° 至 37.5°'], ['艮', '丑', '寅', '东北', '土', '37.5° 至 52.5°'],
  ['寅', '艮', '甲', '东北偏东', '木', '52.5° 至 67.5°'], ['甲', '寅', '卯', '东偏北', '木', '67.5° 至 82.5°'],
  ['卯', '甲', '乙', '东', '木', '82.5° 至 97.5°'], ['乙', '卯', '辰', '东偏南', '木', '97.5° 至 112.5°'],
  ['辰', '乙', '巽', '东南偏东', '土', '112.5° 至 127.5°'], ['巽', '辰', '巳', '东南', '木', '127.5° 至 142.5°'],
  ['巳', '巽', '丙', '东南偏南', '火', '142.5° 至 157.5°'], ['丙', '巳', '午', '南偏东', '火', '157.5° 至 172.5°'],
  ['午', '丙', '丁', '南', '火', '172.5° 至 187.5°'], ['丁', '午', '未', '南偏西', '火', '187.5° 至 202.5°'],
  ['未', '丁', '坤', '西南偏南', '土', '202.5° 至 217.5°'], ['坤', '未', '申', '西南', '土', '217.5° 至 232.5°'],
  ['申', '坤', '庚', '西南偏西', '金', '232.5° 至 247.5°'], ['庚', '申', '酉', '西偏南', '金', '247.5° 至 262.5°'],
  ['酉', '庚', '辛', '西', '金', '262.5° 至 277.5°'], ['辛', '酉', '戌', '西偏北', '金', '277.5° 至 292.5°'],
  ['戌', '辛', '乾', '西北偏西', '土', '292.5° 至 307.5°'], ['乾', '戌', '亥', '西北', '金', '307.5° 至 322.5°'],
  ['亥', '乾', '壬', '西北偏北', '水', '322.5° 至 337.5°'], ['壬', '亥', '子', '北偏西', '水', '337.5° 至 352.5°'],
]

const stems = [
  ['甲', '阳木', '东方', '寅', '栋梁、生发'], ['乙', '阴木', '东方', '卯', '花草、柔韧'],
  ['丙', '阳火', '南方', '巳', '太阳、显明'], ['丁', '阴火', '南方', '午', '灯火、文明'],
  ['戊', '阳土', '中央', '辰戌', '高地、承载'], ['己', '阴土', '中央', '丑未', '田园、培育'],
  ['庚', '阳金', '西方', '申', '矿石、决断'], ['辛', '阴金', '西方', '酉', '珠玉、精细'],
  ['壬', '阳水', '北方', '亥', '江海、流动'], ['癸', '阴水', '北方', '子', '雨露、渗透'],
]

const branches = [
  ['子', '阳水', '23 至 1 时', '鼠', '癸'], ['丑', '阴土', '1 至 3 时', '牛', '己 癸 辛'],
  ['寅', '阳木', '3 至 5 时', '虎', '甲 丙 戊'], ['卯', '阴木', '5 至 7 时', '兔', '乙'],
  ['辰', '阳土', '7 至 9 时', '龙', '戊 乙 癸'], ['巳', '阴火', '9 至 11 时', '蛇', '丙 庚 戊'],
  ['午', '阳火', '11 至 13 时', '马', '丁 己'], ['未', '阴土', '13 至 15 时', '羊', '己 丁 乙'],
  ['申', '阳金', '15 至 17 时', '猴', '庚 壬 戊'], ['酉', '阴金', '17 至 19 时', '鸡', '辛'],
  ['戌', '阳土', '19 至 21 时', '狗', '戊 辛 丁'], ['亥', '阴水', '21 至 23 时', '猪', '壬 甲'],
]

const trigrams = [
  ['☰', '乾', '天', '父', '西北', '金', '健'], ['☱', '兑', '泽', '少女', '西', '金', '悦'],
  ['☲', '离', '火', '中女', '南', '火', '丽'], ['☳', '震', '雷', '长男', '东', '木', '动'],
  ['☴', '巽', '风', '长女', '东南', '木', '入'], ['☵', '坎', '水', '中男', '北', '水', '陷'],
  ['☶', '艮', '山', '少男', '东北', '土', '止'], ['☷', '坤', '地', '母', '西南', '土', '顺'],
]

export default function TablesView() {
  const [tab, setTab] = useState<TableId>('hexagrams')
  const [query, setQuery] = useState('')
  const [hexagrams, setHexagrams] = useState<Hexagram[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/reference/hexagrams')
      .then(async (response) => {
        if (!response.ok) throw new Error('六十四卦资料载入失败')
        return response.json()
      })
      .then(setHexagrams)
      .catch((reason) => setError(reason.message))
  }, [])

  const filteredHexagrams = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return hexagrams
    return hexagrams.filter((item) => [item.number, item.name, item.upperTrigram, item.lowerTrigram, item.element, item.nature, item.judgment, item.image].join(' ').toLowerCase().includes(needle))
  }, [hexagrams, query])

  return (
    <section className="tables-view">
      <div className="tables-intro">
        <div><p className="eyebrow">原始坐标 · 快速核对</p><h1>术数查表</h1><p>六十四卦数据来自本地经典数据集，二十四山按每山十五度列示。查表只提供坐标，不替代流派判断。</p></div>
        <div className="coverage-stats"><span><b>64</b>卦</span><span><b>24</b>山</span><span><b>22</b>干支</span><span><b>8</b>经卦</span></div>
      </div>

      <div className="table-toolbar">
        <div className="table-tabs">
          {tableTabs.map((item) => {
            const Icon = item.icon
            return <button key={item.id} type="button" className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}><Icon size={17} />{item.label}</button>
          })}
        </div>
        {tab === 'hexagrams' && <label className="table-search"><MagnifyingGlass size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索卦名、卦辞、上下卦" /></label>}
      </div>

      {tab === 'hexagrams' && (
        error ? <div className="calculation-error">{error}</div> : hexagrams.length === 0 ? <div className="result-loading"><i /><i /><i /></div> : (
          <div className="hexagram-grid">
            {filteredHexagrams.map((item) => (
              <details className="hexagram-card" key={item.number}>
                <summary>
                  <span>{String(item.number).padStart(2, '0')}</span>
                  <div><h2>{item.name}</h2><p>上{item.upperTrigram} · 下{item.lowerTrigram} · {item.element}</p></div>
                  <b>{item.code.split('').map((line, index) => <i key={index}>{line === '1' ? '━━' : '━ ━'}</i>)}</b>
                </summary>
                <div className="hexagram-detail"><p><strong>卦辞</strong>{item.judgment}</p><p><strong>大象</strong>{item.image}</p><span>{item.nature}</span></div>
              </details>
            ))}
          </div>
        )
      )}

      {tab === 'mountains' && (
        <div className="data-table-wrap"><table className="data-table"><thead><tr><th>山</th><th>前山</th><th>后山</th><th>方位</th><th>五行</th><th>度数范围</th></tr></thead><tbody>{mountains.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>
      )}

      {tab === 'stems' && (
        <div className="dual-tables">
          <section><h2>十天干</h2><div className="data-table-wrap"><table className="data-table"><thead><tr><th>干</th><th>阴阳五行</th><th>方位</th><th>禄</th><th>基础象</th></tr></thead><tbody>{stems.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></section>
          <section><h2>十二地支</h2><div className="data-table-wrap"><table className="data-table"><thead><tr><th>支</th><th>阴阳五行</th><th>时辰</th><th>生肖</th><th>藏干</th></tr></thead><tbody>{branches.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></section>
        </div>
      )}

      {tab === 'trigrams' && (
        <div className="trigram-grid">{trigrams.map(([symbol, name, nature, family, direction, element, quality]) => <article key={name}><b>{symbol}</b><h2>{name}卦</h2><p>{nature} · {quality}</p><dl><div><dt>家庭</dt><dd>{family}</dd></div><div><dt>方位</dt><dd>{direction}</dd></div><div><dt>五行</dt><dd>{element}</dd></div></dl></article>)}</div>
      )}
    </section>
  )
}
