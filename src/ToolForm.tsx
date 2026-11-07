import { useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, Plus, Trash } from '@phosphor-icons/react'

export interface ToolDefinition {
  name: string
  title: string
  description: string
  inputSchema: {
    required?: string[]
    examples?: Array<Record<string, unknown>>
    properties?: Record<string, { description?: string; default?: unknown; enum?: unknown[]; type?: string; minimum?: number; maximum?: number }>
  }
}

type Values = Record<string, string | boolean>
type Query = { type: string; palace: string; from: string; to: string }

const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const pillars = Array.from({ length: 60 }, (_, index) => stems[index % 10] + branches[index % 12])
const palaces = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母']
const kinships = ['父母', '兄弟', '子孙', '妻财', '官鬼']
const dateTimeTools = new Set(['liuyao', 'meihua'])

const labels: Record<string, string> = {
  date: '查询日期', eventDate: '排盘日期', eventTime: '排盘时间', birthDate: '出生日期', birthTime: '出生时间',
  gender: '性别', calendarType: '历法', isLeapMonth: '闰月', birthPlace: '出生地点', latitude: '纬度', longitude: '经度',
  yearPillar: '年柱', monthPillar: '月柱', dayPillar: '日柱', hourPillar: '时柱', startYear: '起始年份', endYear: '结束年份',
  targetDate: '查看日期', targetTimeIndex: '流时时辰', queries: '飞星查询', question: '所问之事', method: '起卦方式',
  yongShenTargets: '用神六亲', numbers: '起卦数字', yaoValues: '六爻爻值', hexagramName: '本卦', changedHexagramName: '变卦',
  count: '物数或声数', countCategory: '计数来源', text: '字占文本', textSplitMode: '拆分方式',
  multiSentenceStrategy: '多句取法', sentences: '两句文本', leftStrokeCount: '左半部笔画', rightStrokeCount: '右半部笔画',
  measureKind: '丈量单位', majorValue: '大单位数', minorValue: '小单位数', upperCue: '上卦类象', lowerCue: '下卦类象',
  upperCueCategory: '上卦类别', lowerCueCategory: '下卦类别', upperTrigram: '上卦', lowerTrigram: '下卦', movingLine: '动爻',
  panType: '盘式', juMethod: '定局法', flyStarMethod: '飞星方式', juNumber: '手工局数', dunType: '阴阳遁',
  zhiFuJiGong: '中五寄宫', monthGeneral: '月将', dayNight: '昼夜取法', system: '排盘体系', tradition: '传统分支',
  accumulatedNumber: '手工积数', mode: '观测尺度', timezone: '时区', disambiguation: '夏令时歧义', dayBoundary: '换日规则',
  yunSect: '起运算法', detailLevel: '结果详略', xiaoliurenSource: '日期来源', lunarMonth: '农历月份', lunarDay: '农历日期',
  leapMonthStrategy: '闰月计数', zodiac: '黄道体系', ayanamsa: '恒星黄道偏移', transitDateTime: '流运时间',
  houseSystem: '宫制', spreadType: '牌阵', deck: '牌库', allowReversed: '允许逆位', reversedProbability: '逆位概率',
  seed: '复现种子', seedScope: '种子范围', referenceYear: '年度牌年份', customPositions: '自定义位置',
  hourType: '时辰口径', dayMaster: '日主天干',
}

const optionLabels: Record<string, string> = {
  male: '男', female: '女', solar: '公历', lunar: '农历', default: '标准', more: '较详细', full: '完整',
  auto: '自动起卦', select: '指定卦象', time: '时间起卦', number: '数字起卦', coins: '手工铜钱', yarrow: '蓍草模拟',
  count_with_time: '物数或声数', text_split: '字占', measure: '丈量', classifier_pair: '类象配卦',
  number_pair: '两数报数', number_triplet: '三数报数', item: '物数', sound: '声数',
  count: '按字数', sentence_pair: '两句分取', stroke: '左右笔画', first: '首句', last: '末句',
  direction: '方位', color: '颜色', weather: '天象', person: '人物', body: '身体', animal: '动物',
  object: '器物', shape: '形状', trigram: '卦名', zhuan: '转盘', fei: '飞盘', chaibu: '拆补', maoshan: '茅山',
  equal: '等时三分', forward: '顺飞', 'yin-reverse': '阳顺阴逆', yang: '阳遁', yin: '阴遁',
  ji_wugong: '固定寄坤二宫', ji_liuyi: '阳艮阴坤', shichen: '按时辰', day: '日盘', night: '夜盘',
  sunrise: '按日出日落', 'nine-star': '九星观测', traditional: '七十二局', jinjing: '金镜', tongzong: '统宗',
  year: '年盘', month: '月盘', hour: '时盘', minute: '分盘', clock: '钟表时间', legacy: '旧版口径',
  repeat: '沿用同月', advance: '递进一月', tropical: '回归黄道', sidereal: '恒星黄道',
  placidus: '普拉西德', 'equal-house': '等宫', 'whole-sign': '整宫', koch: '科赫', campanus: '坎帕纳斯',
  regiomontanus: '雷吉奥蒙塔努斯', topocentric: '地心宫制', single: '单牌', 'three-card': '三张牌',
  love: '爱情牌阵', 'celtic-cross': '凯尔特十字', horseshoe: '马蹄牌阵', decision: '抉择牌阵',
  'mind-body-spirit': '身心灵', situation: '处境牌阵', 'yes-no': '是非牌阵', custom: '自定义',
  all: '完整牌库', major: '大阿卡纳', minor: '小阿卡纳', midnight: '午夜换日', zi: '23 点换日',
  reject: '遇歧义时报错', earlier: '较早时刻', later: '较晚时刻', compatible: '兼容处理',
  fliesTo: '四化飞入', selfMutaged: '本宫自化', mutagedPlaces: '四化落宫', surroundedPalaces: '三方四正',
  '1': '算法一', '2': '算法二',
}

function shanghaiNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((part) => [part.type, part.value]))
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` }
}

function initialValues(definition: ToolDefinition): Values {
  const now = shanghaiNow()
  const values: Values = {
    birthDate: '', birthTime: '', eventDate: now.date, eventTime: now.time, xiaoliurenSource: 'solar',
    date: dateTimeTools.has(definition.name) ? `${now.date}T${now.time}` : now.date,
  }
  for (const [name, schema] of Object.entries(definition.inputSchema.properties ?? {})) {
    if (schema.type === 'boolean') values[name] = schema.default === true
    else values[name] = schema.default === undefined ? '' : String(schema.default)
  }
  values.date = dateTimeTools.has(definition.name) ? `${now.date}T${now.time}` : now.date
  values.calendarType = 'solar'
  values.method = definition.name === 'meihua' ? 'time' : 'auto'
  values.mode = 'day'
  values.countCategory = 'item'
  values.textSplitMode = 'auto'
  values.measureKind = '丈尺'
  values.hourType = 'clock'
  values.targetDate = now.date
  return values
}

function primaryFields(tool: string, values: Values): string[] {
  const birth = ['gender', 'calendarType', 'birthDate', 'birthTime', ...(values.calendarType === 'lunar' ? ['isLeapMonth'] : [])]
  if (tool === 'almanac') return ['date']
  if (tool === 'bazi' || tool === 'bazi_dayun' || tool === 'ziwei') return birth
  if (tool === 'bazi_pillars_resolve') return ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar']
  if (tool === 'ziwei_horoscope') return [...birth, 'targetDate']
  if (tool === 'ziwei_flying_star') return [...birth, 'queries']
  if (tool === 'liuyao') {
    const fields = ['question', 'date', 'yongShenTargets', 'method']
    if (values.method === 'number') fields.push('numbers')
    if (values.method === 'coins') fields.push('yaoValues')
    if (values.method === 'select') fields.push('hexagramName', 'changedHexagramName')
    return fields
  }
  if (tool === 'meihua') {
    const fields = ['question', 'date', 'method']
    if (values.method === 'count_with_time') fields.push('count', 'countCategory')
    if (values.method === 'text_split') {
      fields.push('textSplitMode')
      if (values.textSplitMode === 'sentence_pair') fields.push('sentences')
      else if (values.textSplitMode === 'stroke') fields.push('leftStrokeCount', 'rightStrokeCount')
      else fields.push('text')
    }
    if (values.method === 'measure') fields.push('measureKind', 'majorValue', 'minorValue')
    if (values.method === 'classifier_pair') fields.push('upperCue', 'lowerCue', 'upperCueCategory', 'lowerCueCategory')
    if (values.method === 'select') fields.push('hexagramName', 'movingLine')
    if (values.method === 'number_pair' || values.method === 'number_triplet') fields.push('numbers')
    return fields
  }
  if (tool === 'qimen') return ['eventDate', 'eventTime', 'question', 'panType', 'juMethod']
  if (tool === 'daliuren') return ['eventDate', 'eventTime', 'question']
  if (tool === 'taiyi') return ['system', 'mode', 'eventDate', ...(values.mode === 'hour' || values.mode === 'minute' ? ['eventTime'] : []), 'question']
  if (tool === 'xiaoliuren') return ['xiaoliurenSource', ...(values.xiaoliurenSource === 'lunar' ? ['lunarMonth', 'lunarDay', 'isLeapMonth'] : ['eventDate']), 'eventTime', 'question']
  if (tool === 'astrology') return ['birthDate', 'birthTime', 'birthPlace', 'latitude', 'longitude']
  if (tool === 'tarot') return ['spreadType', 'question', 'deck', 'allowReversed', ...(values.spreadType === 'custom' ? ['customPositions'] : [])]
  return []
}

const dependentFields = new Set([
  'numbers', 'yaoValues', 'hexagramName', 'changedHexagramName', 'count', 'countCategory', 'text', 'textSplitMode',
  'multiSentenceStrategy', 'sentences', 'leftStrokeCount', 'rightStrokeCount', 'measureKind', 'majorValue', 'minorValue',
  'upperCue', 'lowerCue', 'upperCueCategory', 'lowerCueCategory', 'upperTrigram', 'lowerTrigram', 'movingLine',
  'lunarMonth', 'lunarDay', 'isLeapMonth', 'hourType', 'customPositions',
])

function optionalFields(definition: ToolDefinition, main: string[], values: Values) {
  const consumed = new Set<string>()
  if (main.includes('birthDate')) ['birthYear', 'birthMonth', 'birthDay'].forEach((name) => consumed.add(name))
  if (main.includes('birthTime')) ['birthHour', 'birthMinute'].forEach((name) => consumed.add(name))
  if (main.includes('eventDate')) (definition.name === 'qimen' ? ['year', 'month', 'day'] : ['date']).forEach((name) => consumed.add(name))
  if (main.includes('eventTime') || definition.name === 'taiyi') ['hour', 'minute'].forEach((name) => consumed.add(name))
  if (definition.name === 'xiaoliuren') ['date', 'hour'].forEach((name) => consumed.add(name))
  return Object.entries(definition.inputSchema.properties ?? {}).filter(([name, schema]) => {
    if (main.includes(name) || consumed.has(name) || dependentFields.has(name) || schema.type === 'object' || schema.type === 'array') return false
    if (name === 'isLeapMonth' && values.calendarType !== 'lunar') return false
    if (name === 'ayanamsa' && values.zodiac !== 'sidereal') return false
    if (name === 'flyStarMethod' && values.panType !== 'fei') return false
    if (name === 'tradition' && values.system !== 'traditional') return false
    return true
  }).map(([name]) => name)
}

export default function ToolForm({ definition, displayName, loading, onRun }: { definition: ToolDefinition; displayName: string; loading: boolean; onRun: (body: Record<string, unknown>) => void }) {
  const [values, setValues] = useState<Values>(() => initialValues(definition))
  const [targets, setTargets] = useState<string[]>([])
  const [queries, setQueries] = useState<Query[]>([{ type: 'mutagedPlaces', palace: '命宫', from: '命宫', to: '财帛' }])
  const [numbers, setNumbers] = useState(['', '', ''])
  const [yaoValues, setYaoValues] = useState(['', '', '', '', '', ''])
  const [sentences, setSentences] = useState(['', ''])
  const [customPositions, setCustomPositions] = useState('')
  const [jsonMode, setJsonMode] = useState(false)
  const [rawJson, setRawJson] = useState(JSON.stringify(definition.inputSchema.examples?.[0] ?? {}, null, 2))
  const [formError, setFormError] = useState('')
  const main = primaryFields(definition.name, values)
  const extra = optionalFields(definition, main, values)
  const required = definition.inputSchema.required ?? []
  const properties = definition.inputSchema.properties ?? {}
  const setValue = (name: string, value: string | boolean) => { setValues((current) => ({ ...current, [name]: value })); setFormError('') }

  function renderField(name: string): ReactNode {
    if (name === 'birthDate') {
      if (values.calendarType === 'lunar') return <div className="field field-wide"><span>农历出生日期</span><div className="human-form-grid lunar-date-fields">{(['birthYear', 'birthMonth', 'birthDay'] as const).map((part) => <label className="field" key={part}><span>{part === 'birthYear' ? '年' : part === 'birthMonth' ? '月' : '日'}</span><input type="number" required min={part === 'birthYear' ? 1 : 1} max={part === 'birthMonth' ? 12 : part === 'birthDay' ? 30 : 9999} value={String(values[part] ?? '')} onChange={(event) => setValue(part, event.target.value)} /></label>)}</div></div>
      return <label className="field"><span>出生日期</span><input type="date" required value={String(values.birthDate ?? '')} onChange={(event) => setValue('birthDate', event.target.value)} /></label>
    }
    if (name === 'birthTime') return <label className="field"><span>出生时间{!required.includes('birthHour') && <small>（可留空）</small>}</span><input type="time" required={required.includes('birthHour')} value={String(values.birthTime ?? '')} onChange={(event) => setValue('birthTime', event.target.value)} /></label>
    if (name === 'eventDate') return <label className="field"><span>排盘日期</span><input type="date" required value={String(values.eventDate ?? '')} onChange={(event) => setValue('eventDate', event.target.value)} /></label>
    if (name === 'eventTime') return <label className="field"><span>排盘时间</span><input type="time" required={required.includes('hour') || required.includes('year') || definition.name === 'taiyi'} value={String(values.eventTime ?? '')} onChange={(event) => setValue('eventTime', event.target.value)} /></label>
    if (name === 'xiaoliurenSource') return <div className="field field-wide"><span>日期来源</span><div className="segmented-control human-mode"><button type="button" className={values.xiaoliurenSource === 'solar' ? 'active' : ''} onClick={() => setValue('xiaoliurenSource', 'solar')}>公历日期</button><button type="button" className={values.xiaoliurenSource === 'lunar' ? 'active' : ''} onClick={() => setValue('xiaoliurenSource', 'lunar')}>手填农历</button></div></div>
    if (name === 'yongShenTargets') return <fieldset className="choice-field field-wide"><legend>用神六亲 <small>可多选</small></legend><div>{kinships.map((target) => <label key={target}><input type="checkbox" checked={targets.includes(target)} onChange={(event) => { setTargets((current) => event.target.checked ? [...current, target] : current.filter((item) => item !== target)); setFormError('') }} />{target}</label>)}</div></fieldset>
    if (name === 'queries') return <div className="field field-wide"><span>飞星查询</span><div className="query-list">{queries.map((query, index) => <div className="query-row" key={index}><select aria-label={`第 ${index + 1} 条查询类型`} value={query.type} onChange={(event) => setQueries((current) => current.map((item, position) => position === index ? { ...item, type: event.target.value } : item))}>{['mutagedPlaces', 'surroundedPalaces', 'selfMutaged', 'fliesTo'].map((type) => <option key={type} value={type}>{optionLabels[type]}</option>)}</select>{query.type === 'fliesTo' ? <><select aria-label={`第 ${index + 1} 条起飞宫位`} value={query.from} onChange={(event) => setQueries((current) => current.map((item, position) => position === index ? { ...item, from: event.target.value } : item))}>{palaces.map((palace) => <option key={palace}>{palace}</option>)}</select><select aria-label={`第 ${index + 1} 条目标宫位`} value={query.to} onChange={(event) => setQueries((current) => current.map((item, position) => position === index ? { ...item, to: event.target.value } : item))}>{palaces.map((palace) => <option key={palace}>{palace}</option>)}</select></> : <select aria-label={`第 ${index + 1} 条查询宫位`} value={query.palace} onChange={(event) => setQueries((current) => current.map((item, position) => position === index ? { ...item, palace: event.target.value } : item))}>{palaces.map((palace) => <option key={palace}>{palace}</option>)}</select>}<button type="button" className="query-remove" aria-label={`删除第 ${index + 1} 条查询`} title="删除查询" disabled={queries.length === 1} onClick={() => setQueries((current) => current.filter((_, position) => position !== index))}><Trash size={16} /></button></div>)}</div><button type="button" className="add-query" onClick={() => setQueries((current) => [...current, { type: 'mutagedPlaces', palace: '命宫', from: '命宫', to: '财帛' }])}><Plus size={16} />添加查询</button></div>
    if (name === 'numbers') return <div className="field field-wide"><span>报数</span><div className="human-form-grid number-fields">{numbers.slice(0, values.method === 'number_pair' ? 2 : 3).map((value, index) => <label className="field" key={index}><span>{definition.name === 'liuyao' ? ['上卦数', '下卦数', '动爻数（选填）'][index] : ['第一数', '第二数', '第三数'][index]}</span><input type="number" min="1" step="1" required={index < 2 || values.method === 'number_triplet'} value={value} onChange={(event) => setNumbers((current) => current.map((item, position) => position === index ? event.target.value : item))} /></label>)}</div></div>
    if (name === 'yaoValues') return <div className="field field-wide"><span>六爻爻值（从初爻到上爻）</span><div className="human-form-grid yao-fields">{yaoValues.map((value, index) => <label className="field" key={index}><span>{['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][index]}</span><select required value={value} onChange={(event) => setYaoValues((current) => current.map((item, position) => position === index ? event.target.value : item))}><option value="">请选择</option><option value="6">老阴</option><option value="7">少阳</option><option value="8">少阴</option><option value="9">老阳</option></select></label>)}</div></div>
    if (name === 'sentences') return <div className="field field-wide"><span>两句文本</span><div className="human-form-grid"><label className="field"><span>上卦句</span><input required value={sentences[0]} onChange={(event) => setSentences([event.target.value, sentences[1]])} /></label><label className="field"><span>下卦句</span><input required value={sentences[1]} onChange={(event) => setSentences([sentences[0], event.target.value])} /></label></div></div>
    if (name === 'customPositions') return <label className="field field-wide"><span>牌位名称 <small>每行一个</small></span><textarea required rows={4} value={customPositions} onChange={(event) => setCustomPositions(event.target.value)} placeholder={'现状\n阻碍\n建议'} /></label>

    const schema = properties[name]
    if (!schema) return null
    const value = values[name]
    if (schema.type === 'boolean') return <label className="checkbox-field"><input type="checkbox" checked={value === true} onChange={(event) => setValue(name, event.target.checked)} /><span>{labels[name] ?? name}</span></label>
    if (schema.enum) return <label className="field"><span>{labels[name] ?? name}</span><select required={required.includes(name)} value={String(value ?? '')} title={schema.description} onChange={(event) => setValue(name, event.target.value)}><option value="">{required.includes(name) ? '请选择' : '使用默认'}</option>{schema.enum.map((choice) => <option key={String(choice)} value={String(choice)}>{optionLabels[String(choice)] ?? String(choice)}</option>)}</select></label>
    if (name === 'question' || name === 'text') return <label className="field field-wide"><span>{labels[name]}</span><textarea required={required.includes(name) || name === 'text'} rows={2} value={String(value ?? '')} onChange={(event) => setValue(name, event.target.value)} /></label>
    const type = name === 'date' ? (dateTimeTools.has(definition.name) ? 'datetime-local' : 'date') : name === 'targetDate' ? 'date' : name === 'transitDateTime' ? 'datetime-local' : schema.type === 'number' || schema.type === 'integer' ? 'number' : 'text'
    return <label className="field"><span>{labels[name] ?? name}</span><input type={type} required={required.includes(name) || (definition.name === 'meihua' && ['count', 'majorValue', 'minorValue', 'leftStrokeCount', 'rightStrokeCount', 'movingLine', 'hexagramName', 'upperCue', 'lowerCue'].includes(name)) || (definition.name === 'liuyao' && name === 'hexagramName') || (definition.name === 'xiaoliuren' && ['lunarMonth', 'lunarDay'].includes(name))} min={schema.minimum ?? (['lunarMonth', 'lunarDay', 'startYear', 'endYear'].includes(name) ? 1 : undefined)} max={schema.maximum ?? (name === 'lunarMonth' ? 12 : name === 'lunarDay' ? 30 : undefined)} step={schema.type === 'number' ? 'any' : undefined} maxLength={name.endsWith('Pillar') ? 2 : undefined} list={name.endsWith('Pillar') ? 'ganzhi-options' : undefined} placeholder={name.endsWith('Pillar') ? '如甲子' : undefined} value={String(value ?? '')} title={schema.description} onChange={(event) => setValue(name, event.target.value)} /></label>
  }

  function buildBody() {
    const body: Record<string, unknown> = {}
    for (const name of [...main, ...extra]) {
      if (['birthDate', 'birthTime', 'eventDate', 'eventTime', 'xiaoliurenSource', 'queries', 'yongShenTargets', 'numbers', 'yaoValues', 'sentences', 'customPositions'].includes(name)) continue
      if (definition.name === 'xiaoliuren' && name === 'date') continue
      const value = values[name]
      if (value === undefined || value === '') continue
      const schema = properties[name]
      body[name] = schema?.type === 'integer' || schema?.type === 'number' ? Number(value) : value
    }
    if (main.includes('birthDate')) {
      const date = String(values.birthDate ?? '')
      if (values.calendarType !== 'lunar') {
        const [birthYear, birthMonth, birthDay] = date.split('-').map(Number)
        Object.assign(body, { birthYear, birthMonth, birthDay })
      } else {
        for (const name of ['birthYear', 'birthMonth', 'birthDay']) body[name] = Number(values[name])
      }
    }
    if (main.includes('birthTime') && values.birthTime) {
      const [birthHour, birthMinute] = String(values.birthTime).split(':').map(Number)
      Object.assign(body, { birthHour, birthMinute })
    }
    if (main.includes('eventDate')) {
      if (definition.name === 'qimen') {
        const [year, month, day] = String(values.eventDate).split('-').map(Number)
        Object.assign(body, { year, month, day })
      } else body.date = values.eventDate
    }
    if (main.includes('eventTime')) {
      const [hour, minute] = String(values.eventTime).split(':').map(Number)
      Object.assign(body, { hour, minute })
      if (definition.name === 'xiaoliuren') body.hourType = 'clock'
    }
    if (main.includes('yongShenTargets')) {
      if (!targets.length) throw new Error('请至少选择一种用神六亲。')
      body.yongShenTargets = targets
    }
    if (main.includes('queries')) body.queries = queries.map((query) => query.type === 'fliesTo' ? { type: query.type, from: query.from, to: query.to } : { type: query.type, palace: query.palace })
    if (main.includes('numbers')) body.numbers = numbers.slice(0, values.method === 'number_pair' ? 2 : 3).filter(Boolean).map(Number)
    if (main.includes('yaoValues')) body.yaoValues = yaoValues.map(Number)
    if (main.includes('sentences')) body.sentences = sentences.map((sentence) => sentence.trim())
    if (main.includes('customPositions')) body.customPositions = customPositions.split(/\r?\n/).map((position) => position.trim()).filter(Boolean)
    if (definition.name === 'astrology' && (body.latitude === undefined) !== (body.longitude === undefined)) throw new Error('出生地纬度和经度需要一起填写。')
    if (definition.name === 'daliuren' && (body.birthYear === undefined) !== (body.gender === undefined)) throw new Error('出生年和性别需要一起填写。')
    if (definition.name === 'qimen' && (body.juNumber === undefined) !== (body.dunType === undefined)) throw new Error('手工局数和阴阳遁需要一起填写。')
    return body
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    try {
      const body = jsonMode ? JSON.parse(rawJson) : buildBody()
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('参数需要是一个对象。')
      onRun(body)
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : '请检查输入。')
    }
  }

  return <form onSubmit={submit}>
    <div className="tool-form-top"><span>填写参数</span><div className="segmented-control" role="group" aria-label="参数输入方式"><button type="button" className={!jsonMode ? 'active' : ''} onClick={() => setJsonMode(false)}>表单</button><button type="button" className={jsonMode ? 'active' : ''} onClick={() => setJsonMode(true)}>JSON</button></div></div>
    {jsonMode ? <div className="expert-editor"><label className="field"><span>JSON 参数</span><textarea className="expert-json" value={rawJson} onChange={(event) => setRawJson(event.target.value)} spellCheck={false} aria-label="专家 JSON 参数" /></label></div> : <>
      <datalist id="ganzhi-options">{pillars.map((pillar) => <option key={pillar} value={pillar} />)}</datalist>
      <div className="human-form-grid">{main.map((name) => <div className="human-field-slot" key={name}>{renderField(name)}</div>)}</div>
      {extra.length > 0 && <details className="human-advanced"><summary>更多设置</summary><div className="human-form-grid">{extra.map((name) => <div className="human-field-slot" key={name}>{renderField(name)}</div>)}</div></details>}
    </>}
    {formError && <p className="form-error" role="alert">{formError}</p>}
    <button className="primary-button" type="submit" disabled={loading}>{loading ? '正在计算…' : definition.name === 'almanac' ? '查询黄历' : definition.name === 'bazi' ? '生成命盘' : `运行${displayName}`}<ArrowRight size={17} /></button>
  </form>
}
