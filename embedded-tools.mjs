import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import http from 'node:http'
import net from 'node:net'
import { dirname, extname, join, resolve, sep } from 'node:path'

const sourceRoot = process.env.XJZ_EXTERNAL_TOOLS_ROOT || 'D:\\我的创业\\创业工具\\自己写的工具'

const tools = {
  'douyin-knowledge': { name: '视评台 · 抖音知识库', folder: 'douyin-knowledge', kind: 'web' },
  'video-link-text': { name: '视评台 · 视频链接', folder: 'video_link_text', kind: 'web' },
  'publishing-studio': { name: '发稿台', folder: 'Publishing-Studio', kind: 'web' },
  'midnight-dispatch': { name: '午夜分拣台', folder: 'midnight-dispatch', kind: 'game', executable: 'MidnightDispatch.exe', preview: 'preview.png' },
  'star-lantern-trial': { name: '星灯试炼', folder: 'star-lantern-trial', kind: 'game', executable: 'StarLanternTrial.exe', preview: 'action-preview.png' },
}

const running = new Map()
const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon' }

async function freePort() {
  const socket = net.createServer()
  await new Promise((done, reject) => socket.once('error', reject).listen(0, '127.0.0.1', done))
  const port = socket.address().port
  await new Promise((done) => socket.close(done))
  return port
}

async function waitForHealth(port, child, getStartupError) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (getStartupError()) throw getStartupError()
    if (child.exitCode !== null) throw new Error('工具服务启动失败')
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(500) })
      if (response.ok) return
    } catch { /* The process is still starting. */ }
    await new Promise((done) => setTimeout(done, 250))
  }
  throw new Error('工具服务启动超时')
}

function serveFiles(dist, apiPort) {
  return http.createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://127.0.0.1').pathname
      if (pathname.startsWith('/api/')) {
        const upstream = http.request({
          hostname: '127.0.0.1', port: apiPort, path: request.url, method: request.method,
          headers: { ...request.headers, host: `127.0.0.1:${apiPort}` },
        }, (result) => {
          response.writeHead(result.statusCode || 502, result.headers)
          result.pipe(response)
        })
        upstream.on('error', () => {
          if (!response.headersSent) response.writeHead(502)
          response.end('工具服务暂时不可用')
        })
        request.pipe(upstream)
        return
      }
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405).end()
        return
      }
      const relative = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html'
      const target = resolve(dist, relative)
      if (target !== resolve(dist) && !target.startsWith(`${resolve(dist)}${sep}`)) {
        response.writeHead(403).end()
        return
      }
      let content
      try { content = await readFile(target) } catch { content = await readFile(join(dist, 'index.html')) }
      response.writeHead(200, { 'Content-Type': `${mimeTypes[extname(target)] || 'text/html'}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff' })
      response.end(request.method === 'HEAD' ? undefined : content)
    } catch {
      response.writeHead(404).end()
    }
  })
}

async function startWeb(id, folder) {
  if (!existsSync(join(folder, 'node_modules')) || !existsSync(join(folder, 'dist', 'index.html'))) {
    throw new Error('工具尚未安装或构建，请在源项目目录运行 npm ci 和 npm run build')
  }
  const apiPort = await freePort()
  const script = id === 'publishing-studio'
    ? join(folder, 'server', 'index.mjs')
    : join(folder, 'node_modules', 'tsx', 'dist', 'cli.mjs')
  const args = id === 'publishing-studio' ? [script] : [script, join(folder, 'server', 'index.ts')]
  const child = spawn(process.execPath, args, {
    cwd: folder, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(apiPort), ...(id === 'publishing-studio' ? { NODE_ENV: 'production' } : {}) },
  })
  let errorOutput = ''
  let startupError = null
  child.once('error', (error) => { startupError = error })
  child.stderr.on('data', (part) => { errorOutput = `${errorOutput}${part}`.slice(-1500) })
  child.stdout.on('data', () => {})

  try {
    await waitForHealth(apiPort, child, () => startupError)
    if (id === 'publishing-studio') {
      return { child, url: `http://127.0.0.1:${apiPort}/` }
    }
    const gateway = serveFiles(join(folder, 'dist'), apiPort)
    await new Promise((done, reject) => gateway.once('error', reject).listen(0, '127.0.0.1', done))
    return { child, gateway, url: `http://127.0.0.1:${gateway.address().port}/` }
  } catch (error) {
    child.kill()
    throw new Error(`${error.message}${errorOutput ? `: ${errorOutput.trim().slice(-300)}` : ''}`)
  }
}

function stopAll() {
  for (const item of running.values()) {
    if (!item || typeof item.then === 'function') continue
    item.gateway?.close()
    if (item.child?.pid && process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(item.child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
    } else {
      item.child?.kill()
    }
  }
  running.clear()
}

export const stopAllEmbeddedTools = stopAll

export function embeddedToolStatus(id) {
  const tool = tools[id]
  if (!tool) return null
  const folder = join(sourceRoot, tool.folder)
  const available = tool.kind === 'game'
    ? existsSync(join(folder, 'build', tool.executable))
    : existsSync(join(folder, 'package.json'))
  const item = running.get(id)
  return { id, name: tool.name, kind: tool.kind, available, running: Boolean(item), url: item && typeof item.then !== 'function' ? item.url : null }
}

export async function startEmbeddedTool(id) {
  const tool = tools[id]
  if (!tool) throw new Error('未知工具')
  const folder = join(sourceRoot, tool.folder)
  if (tool.kind === 'game') {
    const executable = join(folder, 'build', tool.executable)
    if (!existsSync(executable)) throw new Error('未找到游戏程序')
    const child = spawn(executable, [], { cwd: dirname(executable), stdio: 'ignore' })
    await new Promise((done, reject) => {
      child.once('spawn', done)
      child.once('error', reject)
    })
    child.unref()
    return { launched: true }
  }
  let item = running.get(id)
  if (item && typeof item.then !== 'function' && item.child.exitCode !== null) {
    item.gateway?.close()
    running.delete(id)
    item = null
  }
  if (!item) {
    item = startWeb(id, folder)
    running.set(id, item)
    try { running.set(id, await item) } catch (error) { running.delete(id); throw error }
  }
  return { url: (await item).url }
}

export async function embeddedGamePreview(id) {
  const tool = tools[id]
  if (!tool || tool.kind !== 'game') return null
  return readFile(join(sourceRoot, tool.folder, tool.preview))
}

process.once('exit', stopAll)
process.once('SIGINT', () => { stopAll(); process.exit(0) })
process.once('SIGTERM', () => { stopAll(); process.exit(0) })
