import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { embeddedGamePreview, embeddedToolStatus, startEmbeddedTool, stopAllEmbeddedTools } from '../embedded-tools.mjs'

const sourceRoot = process.env.XJZ_EXTERNAL_TOOLS_ROOT || 'D:\\我的创业\\创业工具\\自己写的工具'
const hasSourceProjects = existsSync(join(sourceRoot, 'douyin-knowledge', 'dist', 'index.html'))

test('self-made web tools launch on isolated loopback ports and load in iframes', { skip: !hasSourceProjects }, async () => {
  try {
    const entries = await Promise.all(['douyin-knowledge', 'video-link-text', 'publishing-studio'].map(async (id) => {
      const { url } = await startEmbeddedTool(id)
      const page = await fetch(url)
      const health = await fetch(new URL('/api/health', url))
      assert.equal(page.status, 200, id)
      assert.match(await page.text(), /<div id="root">/)
      assert.equal((await health.json()).ok, true)
      assert.equal(embeddedToolStatus(id).url, url)
      return { id, url }
    }))
    assert.equal(new Set(entries.map((item) => item.url)).size, 3)
    const videoDemo = await fetch(new URL('/api/demo', entries.find((item) => item.id === 'video-link-text').url))
    assert.ok((await videoDemo.json()).report)
    const studio = await fetch(new URL('/api/state', entries.find((item) => item.id === 'publishing-studio').url))
    assert.ok((await studio.json()).posts)
    assert.ok((await embeddedGamePreview('midnight-dispatch')).length > 10_000)
    assert.ok((await embeddedGamePreview('star-lantern-trial')).length > 10_000)
  } finally {
    stopAllEmbeddedTools()
  }
})
