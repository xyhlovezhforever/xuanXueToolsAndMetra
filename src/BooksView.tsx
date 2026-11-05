import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowSquareOut, BookOpenText, CheckCircle, MagnifyingGlass, X } from '@phosphor-icons/react'

interface BookRecord {
  id: string
  title: string
  author: string
  era: string
  category: string
  summary: string
  sourceName: string
  sourceUrl: string
  license: string
  sourceTitle?: string
}

interface BookText {
  title: string
  text: string
  charCount: number
  attribution: string
  chapters: string[]
}

interface SourceResult {
  title: string
  wordCount: number
  sourceUrl: string
}

export default function BooksView() {
  const [books, setBooks] = useState<BookRecord[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const [selected, setSelected] = useState<BookRecord | null>(null)
  const [text, setText] = useState<BookText | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sourceResults, setSourceResults] = useState<SourceResult[]>([])
  const [sourceSearching, setSourceSearching] = useState(false)

  useEffect(() => {
    fetch('/api/books').then((response) => response.json()).then(setBooks).catch(() => setError('典籍目录载入失败，请检查本地服务。'))
  }, [])

  const categories = useMemo(() => ['全部', ...new Set(books.map((book) => book.category))], [books])
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return books.filter((book) => (category === '全部' || book.category === category)
      && (!needle || [book.title, book.author, book.era, book.category, book.summary].join(' ').toLowerCase().includes(needle)))
  }, [books, category, query])

  const loadBook = async (book: BookRecord, chapter = '') => {
    if (!chapter) setSelected(book)
    setText(null)
    setError('')
    setLoading(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
    try {
      const endpoint = book.sourceTitle
        ? `/api/books/source?title=${encodeURIComponent(chapter || book.sourceTitle)}`
        : `/api/books/${book.id}${chapter ? `?chapter=${encodeURIComponent(chapter)}` : ''}`
      const response = await fetch(endpoint)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || '全文读取失败')
      setText(payload)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '全文读取失败')
    } finally {
      setLoading(false)
    }
  }

  const searchPublicSource = async () => {
    if (query.trim().length < 2) {
      setError('至少输入两个字再搜索公开书库。')
      return
    }
    setSourceSearching(true)
    setError('')
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query.trim())}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || '公开书库检索失败')
      setSourceResults(payload)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '公开书库检索失败')
    } finally {
      setSourceSearching(false)
    }
  }

  const loadSourceResult = (result: SourceResult) => loadBook({
    id: `source-${result.title}`,
    title: result.title,
    author: '公开来源',
    era: '版本待考',
    category: '扩展检索',
    summary: '来自维基文库公开书库的公版页面。',
    sourceName: '维基文库',
    sourceUrl: result.sourceUrl,
    sourceTitle: result.title,
    license: '原始古籍公版；数字文本依维基文库许可使用，引用时请保留来源。',
  })

  if (selected) {
    return (
      <section className="book-reader">
        <div className="book-reader-actions">
          <button type="button" onClick={() => { setSelected(null); setText(null); setError('') }}><ArrowLeft size={18} />返回典籍库</button>
          <a href={selected.sourceUrl} target="_blank" rel="noreferrer">查看原始来源 <ArrowSquareOut size={16} /></a>
        </div>
        <header><p className="eyebrow">{selected.category} · {selected.era} · 公版典籍</p><h1>{selected.title}</h1><p>{selected.author} · {selected.summary}</p></header>
        <div className="book-license"><CheckCircle size={18} weight="fill" /><p><b>版权与来源</b>{selected.license}</p></div>
        {loading && <div className="book-loading" aria-live="polite"><span /><span /><span /><p>正在从公开来源载入正文</p></div>}
        {error && <div className="book-error" role="alert"><b>未能载入站内正文</b><p>{error}</p><a href={selected.sourceUrl} target="_blank" rel="noreferrer">前往公开来源阅读 <ArrowSquareOut size={16} /></a></div>}
        {text && <>
          {text.chapters?.length > 0 && <nav className="book-chapters" aria-label="典籍卷次"><b>目录 · {text.chapters.length} 卷</b><div>{text.chapters.map((chapter) => <button type="button" key={chapter} onClick={() => loadBook(selected, chapter)}>{chapter.replace(`${text.title}/`, '')}</button>)}</div></nav>}
          <article className="book-text"><div><span>{text.attribution}</span><span>{text.charCount.toLocaleString()} 字</span></div>{text.text ? text.text.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>此页仅作为目录，选择上方卷次读取正文。</p>}</article>
        </>}
      </section>
    )
  }

  return (
    <section className="books-view">
      <header className="books-intro"><div><p className="eyebrow">公版原典 · 合法来源</p><h1>典籍全文库</h1><p>古籍全文按需载入并缓存；现代版权书只建立书目和合法来源，不复制网络盗版。</p></div><div><b>{books.length || 26}</b><span>部核心典籍</span></div></header>
      <div className="books-toolbar">
        <div className="books-search-row"><label><MagnifyingGlass size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setSourceResults([]) }} placeholder="搜索书名、作者、朝代或内容主题" />{query && <button type="button" onClick={() => { setQuery(''); setSourceResults([]) }} aria-label="清除典籍搜索"><X size={16} /></button>}</label><button type="button" onClick={searchPublicSource} disabled={sourceSearching}>{sourceSearching ? '正在检索' : '搜索公开书库'}</button></div>
        <div className="books-categories">{categories.map((item) => <button type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
      </div>
      {error && <p className="books-catalog-error" role="alert">{error}</p>}
      <div className="books-result"><span>{filtered.length} 部</span><p>点击典籍可读取公开来源正文，并保留作者、时代与来源信息。</p></div>
      <div className="books-grid">
        {filtered.map((book) => <article key={book.id}><div className="book-spine"><BookOpenText size={20} /><span>{book.category}</span></div><div><p>{book.era} · {book.author}</p><h2>{book.title}</h2><p>{book.summary}</p><button type="button" onClick={() => loadBook(book)}>载入公版全文 <ArrowSquareOut size={16} /></button></div></article>)}
      </div>
      {sourceResults.length > 0 && <section className="source-results"><div><p className="eyebrow">维基文库</p><h2>公开书库检索结果</h2></div><div>{sourceResults.map((result) => <article key={result.title}><div><h3>{result.title}</h3><p>{result.wordCount?.toLocaleString() || '未知'} 字</p></div><button type="button" onClick={() => loadSourceResult(result)}>站内读取 <BookOpenText size={16} /></button></article>)}</div></section>}
    </section>
  )
}
