import { useEffect, useState } from 'react'
import { ArrowSquareOut, ArrowClockwise } from '@phosphor-icons/react'

type ToolId = 'douyin-knowledge' | 'video-link-text' | 'publishing-studio' | 'midnight-dispatch' | 'star-lantern-trial'

const tools: Array<{ id: ToolId; name: string; group: string }> = [
  { id: 'douyin-knowledge', name: '视评台 · 抖音知识库', group: '内容研究' },
  { id: 'video-link-text', name: '视评台 · 视频链接', group: '内容研究' },
  { id: 'publishing-studio', name: '发稿台', group: '内容发布' },
  { id: 'midnight-dispatch', name: '午夜分拣台', group: '独立游戏' },
  { id: 'star-lantern-trial', name: '星灯试炼', group: '独立游戏' },
]

function isGame(id: ToolId) {
  return id === 'midnight-dispatch' || id === 'star-lantern-trial'
}

export default function EmbeddedToolsView() {
  const [selected, setSelected] = useState<ToolId>('douyin-knowledge')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const item = tools.find((tool) => tool.id === selected)!

  useEffect(() => {
    if (isGame(selected)) return
    let active = true
    fetch(`/api/embedded-tools/${selected}/start`, { method: 'POST' })
      .then(async (response) => {
        const result = await response.json().catch(() => null)
        if (!response.ok) throw new Error(result?.error || '工具启动失败')
        if (!result?.url) throw new Error('工具服务尚未就绪，请重试')
        if (active) setUrl(result.url)
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : '工具启动失败') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [selected, attempt])

  const select = (id: ToolId) => {
    setSelected(id)
    setUrl('')
    setError('')
    setLoading(!isGame(id))
  }

  const retry = () => {
    setError('')
    setLoading(true)
    setAttempt((value) => value + 1)
  }

  return <section className="embedded-tools-view" aria-label="自制工具">
    <header className="embedded-tools-header">
      <h1>自制工具</h1>
      <div className="embedded-tool-actions">
        {!isGame(selected) && url && <a href={url} target="_blank" rel="noreferrer" title="在新窗口打开"><ArrowSquareOut size={18} /><span>独立打开</span></a>}
        {!isGame(selected) && <button type="button" onClick={retry} disabled={loading} title="重新连接工具"><ArrowClockwise size={18} /><span>重试</span></button>}
      </div>
    </header>
    <nav className="embedded-tool-tabs" aria-label="自制工具列表">
      {tools.map((tool) => <button key={tool.id} type="button" className={selected === tool.id ? 'active' : ''} aria-current={selected === tool.id ? 'page' : undefined} onClick={() => select(tool.id)}><small>{tool.group}</small><span>{tool.name}</span></button>)}
    </nav>
    <div className="embedded-tool-stage">
      {isGame(selected) ? <iframe key={selected} title={item.name} src={`/embedded-game.html?tool=${selected}`} />
        : url ? <iframe key={selected} title={item.name} src={url} referrerPolicy="no-referrer" />
          : <div className="embedded-tool-state" role="status">{error ? <><p>{error}</p><button type="button" onClick={retry}><ArrowClockwise size={18} />重试</button></> : <p>正在启动{item.name}…</p>}</div>}
    </div>
  </section>
}
