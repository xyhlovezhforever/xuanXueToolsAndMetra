import express from 'express'
import { executeTool, listToolDefinitions } from 'taibu-core/mcp'
import { GUA_CI, HEXAGRAMS, XIANG_CI } from 'taibu-core/data/hexagrams'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import https from 'node:https'
import { bookCatalog } from './book-catalog.mjs'
import { hexagramAnalysisMiddleware, xiaoliurenAnalysisMiddleware } from './xunlan/server/hexagram-analysis.js'

const app = express()
const portArgument = process.argv.indexOf('--port')
const port = Number(portArgument < 0 ? (process.env.PORT ?? 8787) : process.argv[portArgument + 1])
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('Invalid API port')
}
const root = dirname(fileURLToPath(import.meta.url))
const supportedTools = new Set([
  'astrology',
  'bazi',
  'bazi_pillars_resolve',
  'ziwei',
  'ziwei_horoscope',
  'ziwei_flying_star',
  'liuyao',
  'meihua',
  'tarot',
  'taiyi',
  'almanac',
  'bazi_dayun',
  'qimen',
  'daliuren',
  'xiaoliuren',
])
const bookCache = new Map()

function requestJson(url, family = 6) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      family,
      headers: { 'User-Agent': 'XiaojianzhiniStudio/0.1 (public-domain study reader)' },
    }, (upstream) => {
      if (upstream.statusCode !== 200) {
        upstream.resume()
        reject(new Error(`公开来源返回 ${upstream.statusCode}`))
        return
      }
      let body = ''
      upstream.setEncoding('utf8')
      upstream.on('data', (chunk) => {
        body += chunk
        if (body.length > 10_000_000) request.destroy(new Error('公开来源正文超过读取上限'))
      })
      upstream.on('end', () => {
        try { resolve(JSON.parse(body)) } catch { reject(new Error('公开来源数据格式异常')) }
      })
    })
    request.setTimeout(20_000, () => request.destroy(new Error('公开来源连接超时')))
    request.on('error', reject)
  })
}

async function fetchPublicText(url) {
  try {
    return await requestJson(url, 6)
  } catch (ipv6Error) {
    try {
      return await requestJson(url, 4)
    } catch {
      throw ipv6Error
    }
  }
}

app.use('/api/hexagram-analysis', hexagramAnalysisMiddleware)
app.use('/api/xiaoliuren-analysis', xiaoliurenAnalysisMiddleware)
app.use(express.json({ limit: '256kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, engine: 'taibu-core', version: '4.0.0' })
})

app.get('/api/tools', (_request, response) => {
  response.json(
    listToolDefinitions()
      .filter((tool) => supportedTools.has(tool.name))
      .map(({ name, title, description, inputSchema }) => ({
        name,
        title,
        description: description.split('\n')[0],
        inputSchema,
      })),
  )
})

app.get('/api/reference/hexagrams', (_request, response) => {
  response.json(HEXAGRAMS.map((hexagram, index) => ({
    number: index + 1,
    ...hexagram,
    judgment: GUA_CI[hexagram.name],
    image: XIANG_CI[hexagram.name],
  })))
})

app.get('/api/books', (_request, response) => {
  response.json(bookCatalog)
})

app.get('/api/books/search', async (request, response) => {
  const query = typeof request.query.q === 'string' ? request.query.q.trim() : ''
  if (query.length < 2) return response.status(400).json({ error: '至少输入两个字再搜索公开书库。' })
  try {
    const params = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2', list: 'search',
      srsearch: query, srnamespace: '0', srlimit: '20', srprop: 'wordcount|timestamp',
    })
    const payload = await fetchPublicText(`https://zh.wikisource.org/w/api.php?${params}`)
    return response.json((payload?.query?.search || []).map((item) => ({
      title: item.title,
      wordCount: item.wordcount,
      updatedAt: item.timestamp,
      sourceUrl: `https://zh.wikisource.org/wiki/${encodeURIComponent(item.title)}`,
    })))
  } catch (error) {
    const message = error instanceof Error ? error.message : '公开书库检索失败'
    return response.status(502).json({ error: message })
  }
})

app.get('/api/books/source', async (request, response) => {
  const title = typeof request.query.title === 'string' ? request.query.title.trim() : ''
  if (!title || title.length > 120) return response.status(400).json({ error: '公开书库页面标题无效。' })
  const cacheKey = `source:${title}`
  if (bookCache.has(cacheKey)) return response.json(bookCache.get(cacheKey))
  try {
    const params = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', redirects: '1', prop: 'extracts', explaintext: '1', titles: title })
    const payload = await fetchPublicText(`https://zh.wikisource.org/w/api.php?${params}`)
    const page = payload?.query?.pages?.[0]
    if (!page || page.missing) throw new Error('公开来源暂无对应页面')
    const chapterParams = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', list: 'allpages', apprefix: `${page.title}/`, apnamespace: '0', aplimit: '500' })
    const chapterPayload = await fetchPublicText(`https://zh.wikisource.org/w/api.php?${chapterParams}`)
    const result = {
      title: page.title,
      text: String(page.extract || '').trim(),
      charCount: String(page.extract || '').replace(/\s/g, '').length,
      chapters: (chapterPayload?.query?.allpages || []).map((chapter) => chapter.title),
      attribution: `维基文库《${page.title}》`,
    }
    bookCache.set(cacheKey, result)
    return response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : '公开来源正文读取失败'
    return response.status(502).json({ error: message })
  }
})

app.get('/api/books/:id', async (request, response) => {
  const book = bookCatalog.find((item) => item.id === request.params.id)
  if (!book) return response.status(404).json({ error: '未找到这部典籍。' })
  const requestedChapter = typeof request.query.chapter === 'string' ? request.query.chapter : ''
  if (requestedChapter && requestedChapter !== book.sourceTitle && !requestedChapter.startsWith(`${book.sourceTitle}/`)) {
    return response.status(400).json({ error: '章节不属于这部典籍。' })
  }
  const pageTitle = requestedChapter || book.sourceTitle
  const cacheKey = `${book.id}:${pageTitle}`
  if (bookCache.has(cacheKey)) return response.json(bookCache.get(cacheKey))

  try {
    const params = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2', redirects: '1',
      prop: 'extracts', explaintext: '1', titles: pageTitle,
    })
    const payload = await fetchPublicText(`https://zh.wikisource.org/w/api.php?${params}`)
    const page = payload?.query?.pages?.[0]
    if (!page || page.missing) throw new Error('公开来源暂无对应页面')

    let chapters = []
    if (!requestedChapter) {
      const chapterParams = new URLSearchParams({
        action: 'query', format: 'json', formatversion: '2', list: 'allpages',
        apprefix: `${page.title}/`, apnamespace: '0', aplimit: '500',
      })
      const chapterPayload = await fetchPublicText(`https://zh.wikisource.org/w/api.php?${chapterParams}`)
      chapters = (chapterPayload?.query?.allpages || []).map((chapter) => chapter.title)
    }

    const result = {
      book,
      title: page.title,
      text: String(page.extract || '').trim(),
      charCount: String(page.extract || '').replace(/\s/g, '').length,
      chapters,
      fetchedAt: new Date().toISOString(),
      attribution: `${book.sourceName}《${page.title}》`,
    }
    bookCache.set(cacheKey, result)
    return response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : '公版全文读取失败'
    return response.status(502).json({ error: `${message}。可以使用原始来源链接继续阅读。`, sourceUrl: book.sourceUrl })
  }
})

app.post('/api/divination/:tool', async (request, response) => {
  const { tool } = request.params

  if (!supportedTools.has(tool)) {
    return response.status(400).json({ error: '未知术式，或该工具尚未纳入经过校验的核心引擎列表。' })
  }

  try {
    const result = await executeTool(tool, request.body ?? {})
    return response.json({ tool, result, calculatedAt: new Date().toISOString() })
  } catch (error) {
    const message = error instanceof Error ? error.message : '排盘失败，请检查输入。'
    return response.status(400).json({ error: message })
  }
})

const dist = process.env.XJZ_STATIC_DIR || join(root, 'dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*splat', (_request, response) => response.sendFile(join(dist, 'index.html')))
}

const server = app.listen(port, '127.0.0.1', () => {
  const address = server.address()
  const actualPort = typeof address === 'object' && address ? address.port : port
  console.log(`Xiaojianzhini API listening on http://127.0.0.1:${actualPort}`)
  if (process.env.XJZ_DESKTOP === '1') console.log(`XJZ_READY:${actualPort}`)
})
