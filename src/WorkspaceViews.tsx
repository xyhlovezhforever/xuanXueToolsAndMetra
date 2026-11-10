import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowCounterClockwise, Check, Copy, Pause, Play, Plus, Trash } from '@phosphor-icons/react'
import LifeMaterials from './LifeMaterials'

export type LifeView = 'flow' | 'declutter' | 'fengshui' | 'emotion' | 'learning'

function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) as T : initial
    } catch {
      return initial
    }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue] as const
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="life-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>
}

function FlowView() {
  const [minutes, setMinutes] = useState(25)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const deadline = useRef<number | null>(null)
  const [task, setTask] = useState('')
  const [sessions, setSessions] = useLocalState('xuanshu-flow-sessions', 0)
  const [distractions, setDistractions] = useLocalState<string[]>('xuanshu-flow-distractions', [])
  const [distraction, setDistraction] = useState('')

  useEffect(() => {
    if (!running) return
    const interval = window.setInterval(() => {
      if (deadline.current === null) return
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))
      setRemaining(seconds)
      if (seconds === 0) { deadline.current = null; setRunning(false); setSessions((count) => count + 1) }
    }, 250)
    return () => window.clearInterval(interval)
  }, [running, setSessions])

  const selectDuration = (duration: number) => { deadline.current = null; setRunning(false); setMinutes(duration); setRemaining(duration * 60) }
  const reset = () => { deadline.current = null; setRunning(false); setRemaining(minutes * 60) }
  const toggle = () => {
    if (running) { setRemaining(Math.max(0, Math.ceil(((deadline.current ?? Date.now()) - Date.now()) / 1000))); deadline.current = null; setRunning(false) }
    else { deadline.current = Date.now() + remaining * 1000; setRunning(true) }
  }
  const clock = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`

  return <section className="life-view">
    <SectionHeading eyebrow="专注练习" title="心流" description="为当前要做的一件事留一段完整时间。" />
    <div className="life-split">
      <div className="flow-stage">
        <div className="life-segment" aria-label="专注时长">{[15, 25, 50].map((duration) => <button key={duration} type="button" className={minutes === duration ? 'active' : ''} onClick={() => selectDuration(duration)}>{duration} 分钟</button>)}</div>
        <div className="flow-clock" role="timer" aria-label="剩余时间">{clock}</div>
        <div className="life-actions"><button type="button" className="life-primary" onClick={toggle} disabled={remaining === 0}>{running ? <Pause size={18} /> : <Play size={18} />}{running ? '暂停' : '开始专注'}</button><button type="button" className="life-icon" onClick={reset} aria-label="重置计时" title="重置计时"><ArrowCounterClockwise size={19} /></button></div>
      </div>
      <div className="life-side"><label className="life-field"><span>当前专注的事</span><input value={task} onChange={(event) => setTask(event.target.value)} maxLength={80} placeholder="写下今天最重要的一件事" /></label><div className="life-stat"><b>{sessions}</b><span>已完成的专注时段</span></div><p className="life-muted">完成一个时段后，计数会保存在当前浏览器。</p></div>
    </div>
    <section className="life-tool-panel" aria-label="稍后处理清单">
      <div className="life-list-heading"><h2>稍后处理</h2><span>{distractions.length} 件</span></div>
      <form className="life-inline-form" onSubmit={(event) => { event.preventDefault(); if (distraction.trim()) { setDistractions((current) => [...current, distraction.trim()]); setDistraction('') } }}><label className="life-field"><span>刚想到的事</span><input value={distraction} onChange={(event) => setDistraction(event.target.value)} maxLength={80} placeholder="先记下，专注结束后再处理" /></label><button className="life-secondary" type="submit"><Plus size={17} />记下</button></form>
      {distractions.length > 0 && <ul className="life-list">{distractions.map((entry, index) => <li key={`${entry}-${index}`}><span>{entry}</span><button className="life-icon" type="button" onClick={() => setDistractions((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`移除：${entry}`} title="移除"><Trash size={17} /></button></li>)}</ul>}
    </section>
    <LifeMaterials view="flow" />
  </section>
}

type DeclutterItem = { id: string; title: string; area: string; done: boolean }
const declutterAreas = ['桌面', '衣物', '数字空间', '居家', '其他']

function DeclutterView() {
  const [items, setItems] = useLocalState<DeclutterItem[]>('xuanshu-declutter-items', [])
  const [title, setTitle] = useState('')
  const [area, setArea] = useState(declutterAreas[0])
  const [decisionItem, setDecisionItem] = useState('')
  const [usedRecently, setUsedRecently] = useState(false)
  const [hardToReplace, setHardToReplace] = useState(false)
  const recommendation = usedRecently || hardToReplace ? '保留并安排固定位置' : '考虑转赠、出售或回收'
  const add = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    setItems((current) => [{ id: crypto.randomUUID(), title: title.trim(), area, done: false }, ...current])
    setTitle('')
  }
  const done = items.filter((item) => item.done).length
  return <section className="life-view">
    <SectionHeading eyebrow="空间与注意力" title="断舍离" description="记录想处理的物品或数字负担，逐项做决定。" />
    <form className="life-add-row" onSubmit={add}><label className="life-field"><span>待整理事项</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} placeholder="例如：整理桌面文件" required /></label><label className="life-field"><span>区域</span><select value={area} onChange={(event) => setArea(event.target.value)}>{declutterAreas.map((option) => <option key={option}>{option}</option>)}</select></label><button type="submit" className="life-primary"><Plus size={18} />添加</button></form>
    <div className="life-list-heading"><h2>整理清单</h2><span>{done} / {items.length} 已完成</span></div>
    {items.length ? <ul className="life-list">{items.map((item) => <li key={item.id}><button type="button" className={`life-check ${item.done ? 'checked' : ''}`} onClick={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry))} aria-label={`${item.done ? '标为未完成' : '标为已完成'}：${item.title}`}>{item.done && <Check size={15} />}</button><span className={item.done ? 'completed' : ''}>{item.title}</span><small>{item.area}</small><button type="button" className="life-icon" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} aria-label={`删除：${item.title}`} title="删除"><Trash size={17} /></button></li>)}</ul> : <p className="life-empty">清单还是空的。先写下一件想整理的事。</p>}
    <section className="life-tool-panel" aria-label="去留判断">
      <div className="life-list-heading"><h2>去留判断</h2></div>
      <label className="life-field"><span>物品名称</span><input value={decisionItem} onChange={(event) => setDecisionItem(event.target.value)} maxLength={80} placeholder="例如：备用台灯" /></label>
      <div className="life-choice-row"><label><input type="checkbox" checked={usedRecently} onChange={(event) => setUsedRecently(event.target.checked)} />最近三个月用过</label><label><input type="checkbox" checked={hardToReplace} onChange={(event) => setHardToReplace(event.target.checked)} />不容易重新取得</label></div>
      <div className="life-recommendation"><span>建议</span><strong>{recommendation}</strong><button className="life-secondary" type="button" disabled={!decisionItem.trim()} onClick={() => { setItems((current) => [{ id: crypto.randomUUID(), title: `${decisionItem.trim()}：${recommendation}`, area, done: false }, ...current]); setDecisionItem('') }}><Plus size={17} />加入整理清单</button></div>
    </section>
    <LifeMaterials view="declutter" />
  </section>
}

const roomGuides = [
  { name: '工作区', focus: '光线与坐姿', suggestion: '让常用物品在伸手可及的范围内，屏幕避开直接眩光。', checks: ['白天有足够的自然光或补光', '椅子和屏幕高度适合久坐', '桌面只保留当前任务用品'] },
  { name: '卧室', focus: '睡眠与安静', suggestion: '优先处理遮光、温度、噪声和睡前电子设备。', checks: ['夜间光线可调暗', '睡眠区远离持续噪声', '床边通道保持畅通'] },
  { name: '客厅', focus: '交流与动线', suggestion: '留出自然走动的路径，让座位适合面对面交谈。', checks: ['主要通道没有障碍', '座位之间容易交流', '空气可以流通'] },
  { name: '玄关', focus: '出入与收纳', suggestion: '把钥匙、鞋履和外出用品固定在易取的位置。', checks: ['进门处照明充足', '鞋履有固定收纳处', '出口没有堆放杂物'] },
]

function FengshuiView() {
  const [room, setRoom] = useState(0)
  const [checked, setChecked] = useLocalState<Record<string, boolean>>('xuanshu-fengshui-checks', {})
  const [notes, setNotes] = useLocalState<Record<string, string>>('xuanshu-fengshui-notes', {})
  const guide = roomGuides[room]
  const completed = guide.checks.filter((check) => checked[`${guide.name}:${check}`]).length
  return <section className="life-view">
    <SectionHeading eyebrow="居住环境观察" title="现代风水" description="从采光、空气、动线和使用习惯出发，检查空间是否支持日常生活。" />
    <div className="life-segment life-room-tabs" aria-label="空间选择">{roomGuides.map((item, index) => <button key={item.name} type="button" className={room === index ? 'active' : ''} onClick={() => setRoom(index)}>{item.name}</button>)}</div>
    <div className="life-split"><div><div className="life-list-heading"><h2>{guide.name} · {guide.focus}</h2><span>{completed} / {guide.checks.length} 项</span></div><progress className="life-progress" value={completed} max={guide.checks.length} /><ul className="life-list">{guide.checks.map((check) => { const id = `${guide.name}:${check}`; return <li key={id}><button type="button" className={`life-check ${checked[id] ? 'checked' : ''}`} onClick={() => setChecked((current) => ({ ...current, [id]: !current[id] }))} aria-label={`${checked[id] ? '取消' : '完成'}：${check}`}>{checked[id] && <Check size={15} />}</button><span>{check}</span></li> })}</ul></div><aside className="life-side"><h3>调整建议</h3><p>{guide.suggestion}</p><p className="life-muted">这是一份日常环境清单，具体调整以居住者的实际需求为准。</p></aside></div>
    <section className="life-tool-panel" aria-label="空间观察记录"><div className="life-list-heading"><h2>空间观察记录</h2><span>{guide.name}</span></div><label className="life-field"><span>光线、空气、噪声或动线</span><textarea value={notes[guide.name] || ''} onChange={(event) => setNotes((current) => ({ ...current, [guide.name]: event.target.value }))} rows={4} maxLength={600} placeholder="写下观察时间、问题位置和试过的调整" /></label></section>
    <LifeMaterials view="fengshui" />
  </section>
}

const moods = [{ name: '平静', color: '#5d8b80' }, { name: '振奋', color: '#d59b42' }, { name: '安慰', color: '#c77e75' }, { name: '专注', color: '#58748d' }]
const productTypes = ['卡片', '桌面物件', '香氛', '布艺', '数字产品', '其他']
type Concept = { id: string; title: string; mood: string; type: string; note: string }

function EmotionView() {
  const [concepts, setConcepts] = useLocalState<Concept[]>('xuanshu-emotion-concepts', [])
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState(moods[0].name)
  const [type, setType] = useState(productTypes[0])
  const [note, setNote] = useState('')
  const [palette, setPalette] = useLocalState('xuanshu-emotion-palette', { main: '#5d8b80', accent: '#d59b42' })
  const add = (event: FormEvent) => { event.preventDefault(); if (!title.trim()) return; setConcepts((current) => [{ id: crypto.randomUUID(), title: title.trim(), mood, type, note: note.trim() }, ...current]); setTitle(''); setNote('') }
  return <section className="life-view">
    <SectionHeading eyebrow="创意工作台" title="情绪周边设计" description="从想传递的感受出发，记录一件小物件的设计想法。" />
    <form className="emotion-form" onSubmit={add}><label className="life-field"><span>设计名称</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={60} placeholder="给想法起一个名字" required /></label><div className="life-field"><span>目标情绪</span><div className="mood-options">{moods.map((item) => <button key={item.name} type="button" className={mood === item.name ? 'active' : ''} onClick={() => setMood(item.name)}><i style={{ background: item.color }} />{item.name}</button>)}</div></div><label className="life-field"><span>载体</span><select value={type} onChange={(event) => setType(event.target.value)}>{productTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label className="life-field"><span>设计想法</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={500} placeholder="材料、触感、使用场景或想说的话" /></label><button type="submit" className="life-primary"><Plus size={18} />保存想法</button></form>
    <div className="life-list-heading"><h2>设计草稿</h2><span>{concepts.length} 个想法</span></div>
    {concepts.length ? <div className="concept-list">{concepts.map((item) => <article key={item.id}><div><span className="concept-mood"><i style={{ background: moods.find((entry) => entry.name === item.mood)?.color }} />{item.mood} · {item.type}</span><button type="button" className="life-icon" onClick={() => setConcepts((current) => current.filter((entry) => entry.id !== item.id))} aria-label={`删除：${item.title}`} title="删除"><Trash size={17} /></button></div><h3>{item.title}</h3>{item.note && <p>{item.note}</p>}</article>)}</div> : <p className="life-empty">还没有设计草稿。</p>}
    <section className="life-tool-panel" aria-label="配色试验"><div className="life-list-heading"><h2>配色试验</h2></div><div className="life-palette"><label><span>主色</span><input type="color" value={palette.main} onChange={(event) => setPalette((current) => ({ ...current, main: event.target.value }))} /><code>{palette.main}</code></label><label><span>辅助色</span><input type="color" value={palette.accent} onChange={(event) => setPalette((current) => ({ ...current, accent: event.target.value }))} /><code>{palette.accent}</code></label><div className="life-palette-preview" aria-label="配色预览"><i style={{ background: palette.main }} /><i style={{ background: palette.accent }} /></div></div></section>
    <LifeMaterials view="emotion" />
  </section>
}

const learningTopics = ['读一篇资料并核对来源', '实践一次专注练习', '整理一个生活空间', '记录一个设计想法']

function LearningView() {
  const [checked, setChecked] = useLocalState<Record<string, boolean>>('xuanshu-learning-checks', {})
  const [note, setNote] = useLocalState('xuanshu-learning-note', '')
  const [plan, setPlan] = useLocalState('xuanshu-learning-plan', { topic: '', date: '', next: '' })
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    const summary = `共同学习进步\n${learningTopics.map((topic) => `${checked[topic] ? '✓' : '○'} ${topic}`).join('\n')}\n本周记录：${note || '暂无'}\n下次主题：${plan.topic || '未定'}\n日期：${plan.date || '未定'}\n准备任务：${plan.next || '未定'}`
    try { await navigator.clipboard.writeText(summary); setCopied(true); window.setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) }
  }
  return <section className="life-view">
    <SectionHeading eyebrow="每周小步前进" title="共同学习进步" description="沿着共同主题学习，记录自己的实践，再把进度分享给同伴。" />
    <div className="life-split"><div><div className="life-list-heading"><h2>本周练习</h2><span>{learningTopics.filter((topic) => checked[topic]).length} / {learningTopics.length} 已完成</span></div><ul className="life-list">{learningTopics.map((topic) => <li key={topic}><button type="button" className={`life-check ${checked[topic] ? 'checked' : ''}`} onClick={() => setChecked((current) => ({ ...current, [topic]: !current[topic] }))} aria-label={`${checked[topic] ? '取消' : '完成'}：${topic}`}>{checked[topic] && <Check size={15} />}</button><span>{topic}</span></li>)}</ul></div><div className="life-side"><label className="life-field"><span>本周记录</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={7} maxLength={1000} placeholder="记录一个发现、问题或下一步" /></label><button type="button" className="life-secondary" onClick={copy}><Copy size={17} />{copied ? '已复制' : '复制学习进度'}</button><p className="life-muted">记录仅保存在当前浏览器，复制后可自行分享。</p></div></div>
    <section className="life-tool-panel" aria-label="下次共学计划"><div className="life-list-heading"><h2>下次共学计划</h2></div><div className="life-plan-fields"><label className="life-field"><span>讨论主题</span><input value={plan.topic} onChange={(event) => setPlan((current) => ({ ...current, topic: event.target.value }))} maxLength={100} placeholder="一个具体问题" /></label><label className="life-field"><span>日期</span><input type="date" value={plan.date} onChange={(event) => setPlan((current) => ({ ...current, date: event.target.value }))} /></label><label className="life-field"><span>会前准备</span><input value={plan.next} onChange={(event) => setPlan((current) => ({ ...current, next: event.target.value }))} maxLength={150} placeholder="每个人要带来什么" /></label></div></section>
    <LifeMaterials view="learning" />
  </section>
}

export default function WorkspaceViews({ view }: { view: LifeView }) {
  if (view === 'flow') return <FlowView />
  if (view === 'declutter') return <DeclutterView />
  if (view === 'fengshui') return <FengshuiView />
  if (view === 'emotion') return <EmotionView />
  return <LearningView />
}
