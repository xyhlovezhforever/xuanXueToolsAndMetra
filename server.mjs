import express from 'express'
import { executeTool, listToolDefinitions } from 'taibu-core/mcp'
import { GUA_CI, HEXAGRAMS, XIANG_CI } from 'taibu-core/data/hexagrams'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const app = express()
const port = Number(process.env.PORT || 8787)
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

const dist = join(root, 'dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*splat', (_request, response) => response.sendFile(join(dist, 'index.html')))
}

app.listen(port, '127.0.0.1', () => {
  console.log(`Xuanshu API listening on http://127.0.0.1:${port}`)
})
