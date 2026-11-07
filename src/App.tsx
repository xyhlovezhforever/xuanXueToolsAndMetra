import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  BookmarkSimple,
  BookOpenText,
  CalendarBlank,
  CaretDown,
  CheckCircle,
  ClockCounterClockwise,
  Compass,
  Database,
  List,
  MagnifyingGlass,
  Moon,
  SlidersHorizontal,
  Sun,
  Wrench,
  X,
  Timer,
  Broom,
  House,
  Palette,
  UsersThree,
} from '@phosphor-icons/react'
import { categories, references, toolCatalog, type CategoryId, type ReferenceEntry } from './data'
import { knowledgePacks, type KnowledgeBlock } from './knowledgePacks'
import TablesView from './TablesView'
import KnowledgeAtlas from './KnowledgeAtlas'
import BooksView from './BooksView'
import WorkspaceViews, { type LifeView } from './WorkspaceViews'
import ToolForm, { type ToolDefinition } from './ToolForm'

type XunlanView = 'xunlan-bagua' | 'xunlan-hexagrams' | 'xunlan-xiaoliuren' | 'xunlan-xiaoliuren-tool' | 'xunlan-tarot' | 'xunlan-casting'
type View = 'library' | 'atlas' | 'books' | 'tables' | 'tools' | XunlanView | LifeView
type PrimaryTab = 'reference' | 'tool' | LifeView
type LegalDocument = 'privacy' | 'terms' | null
type ToolId = string

interface AlmanacData {
  date: string
  dayInfo: { ganZhi: string }
  almanac: {
    lunarDate: string
    zodiac: string
    suitable: string[]
    avoid: string[]
    chongSha: string
    dayOfficer: string
    tianShen: string
    tianShenType: string
    directions?: Record<string, string>
  }
}

interface ApiResponse {
  tool: string
  result: unknown
  calculatedAt: string
}

const levelOptions = ['全部', '入门', '进阶', '查表'] as const
const referenceTabs: Array<{ view: View; label: string }> = [
  { view: 'library', label: '资料库' }, { view: 'atlas', label: '全典总纲' },
  { view: 'books', label: '典籍全文' }, { view: 'tables', label: '术数查表' },
  { view: 'xunlan-bagua', label: '图解专题' },
]
const diagramTabs: Array<{ view: View; label: string }> = [
  { view: 'xunlan-bagua', label: '先天八卦' }, { view: 'xunlan-hexagrams', label: '周易卦辞' },
  { view: 'xunlan-xiaoliuren', label: '小六壬' }, { view: 'xunlan-tarot', label: '塔罗全牌' },
]
const categoryGroups: Array<{ id: string; label: string; ids: CategoryId[] }> = [
  { id: 'sources', label: '基础与文献', ids: ['foundation', 'classics', 'practice'] },
  { id: 'methods', label: '命理与占测', ids: ['bazi', 'ziwei', 'divination', 'sanshi', 'western'] },
  { id: 'applications', label: '环境与应用', ids: ['fengshui', 'zeri', 'xiangfa', 'naming'] },
]
const categoryOrder = categoryGroups.flatMap((group) => group.ids)
const isDiagramView = (view: View) => diagramTabs.some((item) => item.view === view)
const toolTabs: Array<{ view: View; label: string }> = [
  { view: 'tools', label: '排盘工具' }, { view: 'xunlan-casting', label: '数字起卦' },
  { view: 'xunlan-xiaoliuren-tool', label: '小六壬速起' },
]
const lifeViews: LifeView[] = ['flow', 'declutter', 'fengshui', 'emotion', 'learning']

function primaryTab(view: View): PrimaryTab {
  if (lifeViews.includes(view as LifeView)) return view as LifeView
  return view === 'tools' || view === 'xunlan-casting' || view === 'xunlan-xiaoliuren-tool' ? 'tool' : 'reference'
}

function todayInShanghai() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

function useStoredList(key: string) {
  const [items, setItems] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => localStorage.setItem(key, JSON.stringify(items)), [items, key])
  return [items, setItems] as const
}

function App() {
  const [view, setView] = useState<View>('library')
  const [category, setCategory] = useState<CategoryId>('all')
  const [level, setLevel] = useState<(typeof levelOptions)[number]>('全部')
  const [query, setQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<ReferenceEntry | null>(() => {
    const match = window.location.hash.match(/^#\/article\/([^/]+)$/)
    return match ? references.find((entry) => entry.id === decodeURIComponent(match[1])) ?? null : null
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [legal, setLegal] = useState<LegalDocument>(null)
  const [bookmarks, setBookmarks] = useStoredList('xuanshu-bookmarks')
  const [recent, setRecent] = useStoredList('xuanshu-recent')
  const searchRef = useRef<HTMLInputElement>(null)
  const currentPrimary = primaryTab(view)
  const showClassicLayout = view === 'library'

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  useEffect(() => {
    const syncArticleFromUrl = () => {
      const match = window.location.hash.match(/^#\/article\/([^/]+)$/)
      const entry = match ? references.find((item) => item.id === decodeURIComponent(match[1])) ?? null : null
      setSelectedEntry(entry)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('popstate', syncArticleFromUrl)
    window.addEventListener('hashchange', syncArticleFromUrl)
    return () => {
      window.removeEventListener('popstate', syncArticleFromUrl)
      window.removeEventListener('hashchange', syncArticleFromUrl)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setLegal(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = references.filter((entry) => {
      const inCategory = category === 'all' || entry.category === category
      const atLevel = level === '全部' || entry.level === level
      const haystack = [entry.title, entry.summary, entry.source, entry.school, ...entry.tags, ...entry.sections.flatMap((section) => [section.heading, section.body])].join(' ').toLowerCase()
      return inCategory && atLevel && (!needle || haystack.includes(needle))
    })
    return category === 'all' && !needle
      ? matches.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
      : matches
  }, [category, level, query])

  const openEntry = (entry: ReferenceEntry) => {
    setSelectedEntry(entry)
    setRecent((current) => [entry.id, ...current.filter((id) => id !== entry.id)].slice(0, 6))
    window.history.pushState({ ...window.history.state, xuanshuArticle: true }, '', `#/article/${encodeURIComponent(entry.id)}`)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const closeEntry = () => {
    if (window.history.state?.xuanshuArticle) {
      window.history.back()
      return
    }
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`)
    setSelectedEntry(null)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const changeView = (nextView: View) => {
    if (selectedEntry) {
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`)
      setSelectedEntry(null)
    }
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const toggleBookmark = (entryId: string) => {
    setBookmarks((current) => current.includes(entryId) ? current.filter((id) => id !== entryId) : [entryId, ...current])
  }

  const selectCategory = (id: CategoryId) => {
    setCategory(id)
    setMobileOpen(false)
    setView('library')
  }

  const exploreCategory = (id: CategoryId) => {
    setCategory(id)
    changeView('library')
  }

  return (
    <div className="app-shell">
      <Header
        view={view}
        setView={changeView}
        query={query}
        setQuery={setQuery}
        searchRef={searchRef}
        dark={dark}
        setDark={setDark}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        bookmarkCount={bookmarks.length}
      />
      <nav className="primary-tabs" aria-label="主要板块">
        {([
          ['reference', '资料', BookOpenText, 'library'],
          ['tool', '工具', Wrench, 'tools'],
          ['flow', '心流', Timer, 'flow'],
          ['declutter', '断舍离', Broom, 'declutter'],
          ['fengshui', '现代风水', House, 'fengshui'],
          ['emotion', '情绪周边设计', Palette, 'emotion'],
          ['learning', '共同学习进步', UsersThree, 'learning'],
        ] as const).map(([id, label, Icon, target]) => <button key={id} type="button" className={currentPrimary === id ? 'active' : ''} aria-current={currentPrimary === id ? 'page' : undefined} onClick={() => changeView(target)}><Icon size={18} />{label}</button>)}
      </nav>
      {(currentPrimary === 'reference' || currentPrimary === 'tool') && <nav className="secondary-tabs" aria-label={currentPrimary === 'reference' ? '资料形式' : '工具分类'}>
        {(currentPrimary === 'reference' ? referenceTabs : toolTabs).map((item) => <button key={item.view} type="button" className={view === item.view || (item.view === 'xunlan-bagua' && isDiagramView(view)) ? 'active' : ''} aria-current={view === item.view || (item.view === 'xunlan-bagua' && isDiagramView(view)) ? 'page' : undefined} onClick={() => changeView(item.view)}>{item.label}</button>)}
      </nav>}
      {isDiagramView(view) && <nav className="diagram-tabs" aria-label="图解专题">
        <span>专题</span>
        {diagramTabs.map((item) => <button key={item.view} type="button" className={view === item.view ? 'active' : ''} aria-current={view === item.view ? 'page' : undefined} onClick={() => changeView(item.view)}>{item.label}</button>)}
      </nav>}

      {selectedEntry ? (
        <ArticlePage
          entry={selectedEntry}
          bookmarked={bookmarks.includes(selectedEntry.id)}
          onBookmark={() => toggleBookmark(selectedEntry.id)}
          onClose={closeEntry}
        />
      ) : (
        <div className={`workspace ${showClassicLayout ? '' : 'workspace-wide'}`}>
          {showClassicLayout && <Sidebar category={category} onSelect={selectCategory} recent={recent} onOpen={openEntry} />}

          <main id="main-content" className="main-content">
            {view === 'library' ? (
              <LibraryView
                category={category}
                level={level}
                setLevel={setLevel}
                setQuery={setQuery}
                entries={filtered}
                bookmarks={bookmarks}
                onOpen={openEntry}
                onBookmark={toggleBookmark}
              />
            ) : view === 'atlas' ? (
              <KnowledgeAtlas onExplore={exploreCategory} />
            ) : view === 'books' ? (
              <BooksView />
            ) : view === 'tables' ? (
              <TablesView />
            ) : view === 'tools' ? (
              <ToolsView />
            ) : view.startsWith('xunlan-') ? (
              <XunlanFrame section={view === 'xunlan-xiaoliuren-tool' ? 'xiaoliuren' : view.slice(7)} toolFocus={view === 'xunlan-xiaoliuren-tool'} />
            ) : (
              <WorkspaceViews view={view as LifeView} />
            )}
          </main>

          {showClassicLayout && <aside className="right-rail" aria-label="今日历法">
            <AlmanacCard />
            <QuickReference />
          </aside>}
        </div>
      )}

      <footer className="site-footer">
        <span>小渐知你 · 资料、工具与成长工作台</span>
        <span>传统文化学习与咨询记录工具，不替代法律、医疗或财务意见</span>
        <div>
          <button type="button" onClick={() => setLegal('privacy')}>隐私说明</button>
          <button type="button" onClick={() => setLegal('terms')}>使用边界</button>
        </div>
      </footer>

      {mobileOpen && (
        <MobileMenu
          category={category}
          onSelect={selectCategory}
          close={() => setMobileOpen(false)}
          view={view}
          setView={(next) => { changeView(next); setMobileOpen(false) }}
        />
      )}
      {legal && <LegalDialog type={legal} onClose={() => setLegal(null)} />}
    </div>
  )
}

function Header({ view, setView, query, setQuery, searchRef, dark, setDark, mobileOpen, setMobileOpen, bookmarkCount }: {
  view: View
  setView: (view: View) => void
  query: string
  setQuery: (query: string) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  dark: boolean
  setDark: (dark: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  bookmarkCount: number
}) {
  return (
    <header className="topbar">
      <button className="mobile-trigger icon-button" type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="打开导航">
        {mobileOpen ? <X size={20} /> : <List size={20} />}
      </button>
      <div className="brand" aria-label="小渐知你首页">
        <span className="brand-mark"><Compass size={20} weight="duotone" /></span>
        <span className="brand-name">小渐知你</span>
        <span className="brand-subtitle">资料 · 工具 · 成长</span>
      </div>

      <label className="global-search">
        <MagnifyingGlass size={18} aria-hidden="true" />
        <input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); if (view !== 'library') setView('library') }} placeholder="搜索流派、口诀、经典或术式" />
        {query && <button type="button" onClick={() => setQuery('')} aria-label="清除搜索"><X size={16} /></button>}
      </label>

      <div className="header-actions">
        <span className="bookmark-counter" title="已收藏资料"><BookmarkSimple size={19} weight={bookmarkCount ? 'fill' : 'regular'} />{bookmarkCount}</span>
        <button className="icon-button" type="button" onClick={() => setDark(!dark)} aria-label={dark ? '切换浅色主题' : '切换深色主题'}>
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </header>
  )
}

function Sidebar({ category, onSelect, recent, onOpen }: {
  category: CategoryId
  onSelect: (id: CategoryId) => void
  recent: string[]
  onOpen: (entry: ReferenceEntry) => void
}) {
  const recentEntries = recent.map((id) => references.find((entry) => entry.id === id)).filter(Boolean) as ReferenceEntry[]
  const [expandedGroup, setExpandedGroup] = useState(() => categoryGroups.find((group) => group.ids.includes(category))?.id ?? 'sources')
  const renderCategory = (item: (typeof categories)[number]) => {
    const Icon = item.icon
    return (
      <button key={item.id} type="button" className={category === item.id ? 'active' : ''} onClick={() => onSelect(item.id)}>
        <Icon size={19} weight={category === item.id ? 'duotone' : 'regular'} />
        <span><strong>{item.label}</strong><small>{item.description}</small></span>
        <b>{item.id === 'all' ? references.length : references.filter((entry) => entry.category === item.id).length}</b>
      </button>
    )
  }
  return (
    <aside className="sidebar" aria-label="资料分类">
      <div className="sidebar-heading">资料门类</div>
      <nav aria-label="资料门类">
        {renderCategory(categories[0])}
        {categoryGroups.map((group) => (
          <div className="category-group" key={group.id}>
            <button className="category-group-toggle" type="button" aria-expanded={expandedGroup === group.id} onClick={() => setExpandedGroup(expandedGroup === group.id ? '' : group.id)}>
              <span>{group.label}</span><small>{group.ids.length} 类</small><CaretDown size={16} />
            </button>
            {expandedGroup === group.id && <div className="category-group-items">
              {group.ids.map((id) => renderCategory(categories.find((item) => item.id === id)!))}
            </div>}
          </div>
        ))}
      </nav>
      <div className="sidebar-heading recent-heading"><ClockCounterClockwise size={16} />最近阅读</div>
      <div className="recent-list">
        {recentEntries.length ? recentEntries.map((entry) => (
          <button type="button" key={entry.id} onClick={() => onOpen(entry)}>{entry.title}</button>
        )) : <p>打开资料后会保留最近阅读记录。</p>}
      </div>
    </aside>
  )
}

function LibraryView({ category, level, setLevel, setQuery, entries, bookmarks, onOpen, onBookmark }: {
  category: CategoryId
  level: (typeof levelOptions)[number]
  setLevel: (level: (typeof levelOptions)[number]) => void
  setQuery: (query: string) => void
  entries: ReferenceEntry[]
  bookmarks: string[]
  onOpen: (entry: ReferenceEntry) => void
  onBookmark: (id: string) => void
}) {
  const currentCategory = categories.find((item) => item.id === category) ?? categories[0]
  return (
    <>
      <section className="library-intro">
        <div>
          <p className="eyebrow">知识索引 · 可核查资料</p>
          <h1>{currentCategory.label}</h1>
          <p>先区分流派与适用范围，再把典籍、口诀和盘面证据放到同一条推理链中。</p>
          <div className="library-coverage" aria-label="知识库覆盖范围">
            <span><b>{references.length}</b> 个专题</span>
            <span><b>{categories.length - 1}</b> 个门类</span>
            <span><b>全文</b> 可检索</span>
          </div>
        </div>
        <img src="/cosmos-map.svg" alt="九宫与八卦参考图" />
      </section>

      <section className="filter-row" aria-label="资料筛选">
        <div className="filter-label"><SlidersHorizontal size={17} />难度</div>
        <div className="segmented-control">
          {levelOptions.map((option) => (
            <button key={option} className={level === option ? 'active' : ''} type="button" onClick={() => setLevel(option)}>{option}</button>
          ))}
        </div>
        <span className="result-count">{entries.length} 条资料</span>
      </section>

      {entries.length ? (
        <section className="reference-grid" aria-live="polite">
          {entries.map((entry) => (
            <article className="reference-card" key={entry.id}>
              <div className="card-meta"><span>{categories.find((item) => item.id === entry.category)?.label}</span><span>{entry.readTime} 分钟</span></div>
              <button className="card-open" type="button" onClick={() => onOpen(entry)}>
                <h2>{entry.title}</h2>
                <p>{entry.summary}</p>
              </button>
              <div className="tag-row">{entry.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="card-footer">
                <span><i>{entry.level}</i>{entry.school}</span>
                <button className="bookmark-button" type="button" onClick={() => onBookmark(entry.id)} aria-label={bookmarks.includes(entry.id) ? `取消收藏${entry.title}` : `收藏${entry.title}`}>
                  <BookmarkSimple size={19} weight={bookmarks.includes(entry.id) ? 'fill' : 'regular'} />
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <MagnifyingGlass size={30} />
          <h2>没有匹配的资料</h2>
          <p>换一个关键词，或清除难度与门类筛选。</p>
          <button type="button" onClick={() => { setQuery(''); setLevel('全部') }}>清除筛选</button>
        </section>
      )}

      <TaglineReveal />
    </>
  )
}

function TaglineReveal() {
  const ref = useRef<HTMLParagraphElement>(null)
  const words = '先辨体系 再核盘面 最后让每一个判断 回到真实的空间与人生'.split(' ')
  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) return
    const spans = Array.from(ref.current.querySelectorAll('span'))
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        spans.forEach((span, index) => window.setTimeout(() => span.classList.add('visible'), index * 70))
        observer.disconnect()
      }
    }, { threshold: 0.35 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return <section className="tagline-section"><p ref={ref}>{words.map((word, index) => <span key={`${word}-${index}`}>{word}</span>)}</p></section>
}

function AlmanacCard() {
  const [date, setDate] = useState(todayInShanghai)
  const [data, setData] = useState<AlmanacData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    fetch('/api/divination/almanac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, timezone: 'Asia/Shanghai' }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || '黄历载入失败')
        return payload as ApiResponse
      })
      .then((payload) => setData(payload.result as AlmanacData))
      .catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [date])

  return (
    <section className="almanac-card">
      <div className="rail-heading"><span><CalendarBlank size={18} />历法坐标</span><span className="engine-status">引擎计算</span></div>
      <input className="date-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="选择黄历日期" />
      {loading ? <AlmanacSkeleton /> : error ? (
        <div className="inline-error"><p>{error}</p><button type="button" onClick={() => setDate(todayInShanghai())}>返回今天</button></div>
      ) : data ? (
        <>
          <div className="almanac-date"><strong>{data.dayInfo.ganZhi}</strong><span>{data.almanac.lunarDate}</span><small>生肖{data.almanac.zodiac} · {data.almanac.dayOfficer}日</small></div>
          <div className="yi-ji-grid">
            <div><b>宜</b><p>{data.almanac.suitable.slice(0, 5).join(' · ')}</p></div>
            <div><b>忌</b><p>{data.almanac.avoid.slice(0, 5).join(' · ')}</p></div>
          </div>
          <dl className="almanac-facts">
            <div><dt>值神</dt><dd>{data.almanac.tianShen} · {data.almanac.tianShenType}</dd></div>
            <div><dt>冲煞</dt><dd>{data.almanac.chongSha}</dd></div>
          </dl>
        </>
      ) : null}
      <p className="rail-note">公共黄历仅作传统日期参考，重要事项需结合实际条件。</p>
    </section>
  )
}

function AlmanacSkeleton() {
  return <div className="skeleton" aria-label="正在计算黄历"><i /><i /><i /><i /></div>
}

function QuickReference() {
  return (
    <section className="quick-reference">
      <div className="rail-heading"><span><Database size={18} />五行速查</span></div>
      <div className="wuxing-row"><span className="wood">木</span><b>生</b><span className="fire">火</span><b>生</b><span className="earth">土</span></div>
      <div className="wuxing-row"><span className="earth">土</span><b>生</b><span className="metal">金</span><b>生</b><span className="water">水</span></div>
      <div className="branch-grid">
        {['子 水', '丑 土', '寅 木', '卯 木', '辰 土', '巳 火', '午 火', '未 土', '申 金', '酉 金', '戌 土', '亥 水'].map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  )
}

function XunlanFrame({ section, toolFocus = false }: { section: string; toolFocus?: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(900)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return
      if (event.data?.type === 'xunlan:height' && Number.isFinite(event.data.height)) {
        setHeight(Math.max(500, event.data.height))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return <iframe ref={frame} className="xunlan-frame" title={`玄览 · ${section}`} src={`/xunlan/index.html?embed=1${toolFocus ? '&focus=tool' : ''}#${section}`} style={{ height }} />
}

function ToolsView() {
  const [tool, setTool] = useState<ToolId>('almanac')
  const [definitions, setDefinitions] = useState<ToolDefinition[]>([])
  const [result, setResult] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef<AbortController | null>(null)

  useEffect(() => {
    fetch('/api/tools')
      .then(async (response) => {
        if (!response.ok) throw new Error('工具参数模式载入失败')
        return response.json()
      })
      .then((items: ToolDefinition[]) => setDefinitions(items))
      .catch((reason) => setError(reason.message))
  }, [])

  useEffect(() => () => pending.current?.abort(), [])

  const selectedDefinition = definitions.find((item) => item.name === tool)
  const selectTool = (nextTool: ToolId) => {
    pending.current?.abort()
    pending.current = null
    setTool(nextTool)
    setResult(null)
    setError('')
    setLoading(false)
  }

  const submit = async (body: Record<string, unknown>) => {
    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch(`/api/divination/${tool}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal,
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || '计算失败，请检查输入。')
      if (pending.current === controller) setResult(payload.result)
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '计算失败，请检查输入。')
    } finally {
      if (pending.current === controller) { pending.current = null; setLoading(false) }
    }
  }

  return (
    <section className="tools-view">
      <div className="tools-intro">
        <p className="eyebrow">本地计算 · 结果可复现</p>
        <h1>排盘工具</h1>
        <p>涵盖历法、命理、占卜、三式与星盘。盘面是分析依据，不自动等同于结论。</p>
      </div>
      <div className="tool-layout">
        <label className="mobile-tool-picker"><span>选择术式</span><select value={tool} onChange={(event) => selectTool(event.target.value)}>{[...new Set(toolCatalog.map((item) => item.group))].map((group) => <optgroup label={group} key={group}>{toolCatalog.filter((item) => item.group === group).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>)}</select></label>
        <div className="tool-catalog">
          <h2>术式目录</h2>
          {toolCatalog.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tool === item.id ? 'active' : ''}
              onClick={() => selectTool(item.id)}
            >
              <span><b>{item.name}</b><small>{item.description}</small></span>
              <em>{item.active ? '可用' : item.group}</em>
            </button>
          ))}
        </div>
        <div className="calculator-panel">
          <div className="calculator-heading"><div><p>{toolCatalog.find((item) => item.id === tool)?.group ?? '专业排盘'}</p><h2>{toolCatalog.find((item) => item.id === tool)?.name ?? '参数校验'}</h2></div><span><CheckCircle size={16} weight="fill" />太卜引擎</span></div>
          {selectedDefinition ? <ToolForm key={tool} definition={selectedDefinition} displayName={toolCatalog.find((item) => item.id === tool)?.name ?? selectedDefinition.title} loading={loading} onRun={submit} /> : !error && <div className="result-loading" aria-label="正在加载工具参数"><i /><i /><i /></div>}
          {error && <div className="calculation-error" role="alert">{error}</div>}
          {loading && <div className="result-loading"><i /><i /><i /></div>}
          {!loading && result !== null && <ResultPanel value={result} />}
          {!loading && !result && !error && <div className="result-empty"><Compass size={32} /><h3>尚无计算结果</h3></div>}
        </div>
      </div>
    </section>
  )
}

function ResultPanel({ value }: { value: unknown }) {
  return (
    <section className="result-panel" aria-live="polite">
      <div className="result-title"><h3>计算结果</h3><span>仅显示盘面事实</span></div>
      <JsonTree value={value} depth={0} />
    </section>
  )
}

function JsonTree({ value, depth }: { value: unknown; depth: number }): ReactNode {
  if (value === null || value === undefined) return <span className="json-empty">无</span>
  if (typeof value !== 'object') return <span className="json-value">{String(value)}</span>
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item !== 'object')) return <div className="json-tags">{value.map((item, index) => <span key={`${String(item)}-${index}`}>{String(item)}</span>)}</div>
    const visible = value.slice(0, 12)
    const remaining = value.slice(12)
    return <div className="json-array">{visible.map((item, index) => <div key={index}><b>{index + 1}</b><JsonTree value={item} depth={depth + 1} /></div>)}{remaining.length > 0 && <details className="json-more"><summary>展开其余 {remaining.length} 项</summary>{remaining.map((item, index) => <div key={index}><b>{index + 13}</b><JsonTree value={item} depth={depth + 1} /></div>)}</details>}</div>
  }
  return (
    <dl className={`json-object depth-${Math.min(depth, 2)}`}>
      {Object.entries(value as Record<string, unknown>).map(([key, nested]) => (
        <div key={key}><dt>{humanizeKey(key)}</dt><dd><JsonTree value={nested} depth={depth + 1} /></dd></div>
      ))}
    </dl>
  )
}

function humanizeKey(key: string) {
  const labels: Record<string, string> = {
    date: '日期', dayInfo: '日柱', ganZhi: '干支', almanac: '黄历', lunarDate: '农历', lunarMonth: '农历月', lunarDay: '农历日', zodiac: '生肖', suitable: '宜', avoid: '忌', chongSha: '冲煞', pengZuBaiJi: '彭祖百忌', jishen: '吉神', xiongsha: '凶煞', directions: '方位', dayOfficer: '建除', tianShen: '值神', tianShenType: '黄黑道', lunarMansion: '星宿', nayin: '纳音', taiShen: '胎神', pillars: '四柱', year: '年柱', month: '月柱', day: '日柱', hour: '时柱', heavenlyStem: '天干', earthlyBranch: '地支', hiddenStems: '藏干', tenGod: '十神', relations: '干支关系', rules: '计算规则', timezone: '时区', ruleVersion: '规则版本', basicInfo: '基本信息', fourPillars: '四柱', dayMaster: '日主', gender: '性别', birthDate: '出生日期', calendarType: '历法',
  }
  return labels[key] || key.replace(/([a-z])([A-Z])/g, '$1 $2')
}

function ArticlePage({ entry, bookmarked, onBookmark, onClose }: {
  entry: ReferenceEntry
  bookmarked: boolean
  onBookmark: () => void
  onClose: () => void
}) {
  const pack = knowledgePacks[entry.category]
  const sectionCount = entry.sections.length + pack.blocks.length + 2
  const detailedReadTime = entry.readTime + pack.blocks.length * 3
  const jumpToSection = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <main id="main-content" className="article-page">
      <section className="article-hero" aria-labelledby="entry-title">
        <div className="article-page-inner">
          <div className="article-actions">
          <button className="back-button" type="button" onClick={onClose}><ArrowLeft size={18} />返回资料库</button>
          <button className="icon-button" type="button" onClick={onBookmark} aria-label={bookmarked ? '取消收藏' : '收藏资料'}><BookmarkSimple size={20} weight={bookmarked ? 'fill' : 'regular'} /></button>
          </div>
          <header>
          <p className="eyebrow">{entry.school} · {entry.level} · 深度资料</p>
          <h1 id="entry-title">{entry.title}</h1>
          <p>{entry.summary}</p>
          <div className="tag-row">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="article-metrics"><span>{sectionCount} 个章节</span><span>约 {detailedReadTime} 分钟</span><span>{pack.references.length + 1} 组参考来源</span></div>
          </header>
        </div>
      </section>

      <div className="article-layout">
        <aside className="article-toc">
          <nav className="article-index" aria-label="文章目录">
          <b>本页目录</b>
          <div>
            {entry.sections.map((section, index) => <a key={section.heading} href={`#entry-section-${index}`} onClick={(event) => jumpToSection(event, `entry-section-${index}`)}>{String(index + 1).padStart(2, '0')} {section.heading}</a>)}
            <a href="#entry-terms" onClick={(event) => jumpToSection(event, 'entry-terms')}>{String(entry.sections.length + 1).padStart(2, '0')} 核心术语</a>
            {pack.blocks.map((block, index) => <a key={block.heading} href={`#knowledge-section-${index}`} onClick={(event) => jumpToSection(event, `knowledge-section-${index}`)}>{String(entry.sections.length + index + 2).padStart(2, '0')} {block.heading}</a>)}
            <a href="#entry-references" onClick={(event) => jumpToSection(event, 'entry-references')}>{String(sectionCount).padStart(2, '0')} 参考书目</a>
          </div>
          </nav>
        </aside>

        <article className="article-content">
          <div className="source-box"><b>条目来源</b><span>{entry.source}</span><small>不同版本与传承可能存在术语差异，引用时请核对原文。</small></div>

          <section className="knowledge-overview">
            <p className="eyebrow">{pack.label}</p>
            <h2>先建立完整坐标，再进入单项判断</h2>
            <p>{pack.overview}</p>
          </section>

          <div className="entry-sections">
          {entry.sections.map((section, index) => <section id={`entry-section-${index}`} key={section.heading}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{section.heading}</h2><p>{section.body}</p></div></section>)}
          </div>

        <section className="terms-section" id="entry-terms">
          <div className="article-section-heading"><span>{String(entry.sections.length + 1).padStart(2, '0')}</span><div><p className="eyebrow">术语表</p><h2>先把关键词说清楚</h2></div></div>
          <dl>{pack.terms.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}</dl>
        </section>

        <div className="deep-sections">
          {pack.blocks.map((block, index) => <KnowledgeBlockView key={block.heading} block={block} index={entry.sections.length + index + 2} id={`knowledge-section-${index}`} />)}
        </div>

        <section className="reference-list" id="entry-references">
          <div className="article-section-heading"><span>{String(sectionCount).padStart(2, '0')}</span><div><p className="eyebrow">延伸阅读</p><h2>参考书目与资料来源</h2></div></div>
          <ol><li>{entry.source}</li>{pack.references.map((reference) => <li key={reference}>{reference}</li>)}</ol>
          <p>书名只提供检索线索。正式引用时应补充版本、卷次、页码或稳定链接。</p>
        </section>
          <aside className="entry-boundary"><b>使用边界</b><p>本条目用于学习、检索和咨询记录，不构成确定性预测。涉及健康、安全、法律与重大财务决策时，应优先采用相应专业意见。</p></aside>
        </article>
      </div>
    </main>
  )
}

function KnowledgeBlockView({ block, index, id }: { block: KnowledgeBlock; index: number; id: string }) {
  return (
    <section className="deep-section" id={id}>
      <div className="article-section-heading"><span>{String(index).padStart(2, '0')}</span><div><p className="eyebrow">体系详解</p><h2>{block.heading}</h2></div></div>
      {block.paragraphs && <div className="deep-copy">{block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
      {block.bullets && <ul className="knowledge-list">{block.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
      {block.table && <div className="knowledge-table-wrap"><table className="knowledge-table"><thead><tr>{block.table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{block.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div>}
      {block.example && <aside className="knowledge-example"><b>{block.example.title}</b><p>{block.example.body}</p></aside>}
      {block.caution && <aside className="knowledge-caution"><b>校验提醒</b><p>{block.caution}</p></aside>}
    </section>
  )
}

function MobileMenu({ category, onSelect, close, view, setView }: {
  category: CategoryId
  onSelect: (id: CategoryId) => void
  close: () => void
  view: View
  setView: (view: View) => void
}) {
  const renderCategory = (item: (typeof categories)[number]) => {
    const Icon = item.icon
    return <button key={item.id} className={category === item.id ? 'active' : ''} type="button" onClick={() => onSelect(item.id)}><Icon size={20} /><span>{item.label}<small>{item.description}</small></span></button>
  }
  return (
    <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="移动导航">
      <div className="mobile-menu-header"><span>小渐知你导航</span><button className="icon-button" type="button" onClick={close} aria-label="关闭导航"><X size={20} /></button></div>
      <div className="mobile-menu-section-title">资料形式</div>
      <div className="mobile-view-switch">
        {referenceTabs.map((item) => <button key={item.view} className={view === item.view || (item.view === 'xunlan-bagua' && isDiagramView(view)) ? 'active' : ''} onClick={() => setView(item.view)} type="button">{item.label}</button>)}
      </div>
      <div className="mobile-menu-section-title">图解专题</div>
      <div className="mobile-view-switch">
        {diagramTabs.map((item) => <button key={item.view} className={view === item.view ? 'active' : ''} onClick={() => setView(item.view)} type="button">{item.label}</button>)}
      </div>
      <div className="mobile-menu-section-title">工具</div>
      <div className="mobile-view-switch">
        {toolTabs.map((item) => <button key={item.view} className={view === item.view ? 'active' : ''} onClick={() => setView(item.view)} type="button">{item.label}</button>)}
      </div>
      <div className="mobile-menu-section-title">资料门类</div>
      <nav aria-label="资料门类">
        {renderCategory(categories[0])}
        {categoryGroups.map((group) => <details className="mobile-category-group" key={group.id} open={group.ids.includes(category)}>
          <summary>{group.label}<small>{group.ids.length} 类</small></summary>
          {group.ids.map((id) => renderCategory(categories.find((item) => item.id === id)!))}
        </details>)}
      </nav>
    </div>
  )
}

function LegalDialog({ type, onClose }: { type: Exclude<LegalDocument, null>; onClose: () => void }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-title">
        <div className="dialog-heading"><h2 id="legal-title">{type === 'privacy' ? '隐私说明' : '使用边界'}</h2><button className="icon-button" type="button" onClick={onClose} aria-label="关闭"><X size={20} /></button></div>
        {type === 'privacy' ? (
          <><p>收藏与最近阅读仅保存在当前浏览器。黄历日期与排盘输入会发送到本机运行的计算服务，不会在本项目中持久化。</p><p>正式部署时，应补充访问日志、数据保留周期与用户删除机制，并使用 HTTPS。</p></>
        ) : (
          <><p>本网站用于传统文化学习、资料检索与咨询记录。术数结果不构成医疗诊断、法律意见、投资建议或安全保证。</p><p>排盘结果由计算引擎生成，解读仍需说明流派、证据与不确定性。不得利用结果制造恐惧或替代当事人的现实判断。</p></>
        )}
      </section>
    </div>
  )
}

export default App
