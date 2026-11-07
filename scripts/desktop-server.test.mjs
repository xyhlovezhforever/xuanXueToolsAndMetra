import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { join, resolve } from 'node:path'
import { test } from 'node:test'

const root = resolve(import.meta.dirname, '..')

test('staged desktop API serves the workbench and both data sources', async () => {
  const child = spawn(process.execPath, [join(root, 'desktop-server/server.mjs'), '--port', '0'], {
    env: {
      ...process.env,
      XJZ_DESKTOP: '1',
      XJZ_STATIC_DIR: join(root, 'dist'),
      XJZ_LLM_CONFIG: join(root, 'desktop-server/llm.example.toml'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  try {
    const port = await new Promise((resolvePort, reject) => {
      let output = ''
      let errors = ''
      const timeout = setTimeout(() => reject(new Error(`API startup timed out: ${errors}`)), 15_000)
      child.stdout.setEncoding('utf8')
      child.stderr.setEncoding('utf8')
      child.stderr.on('data', (chunk) => { errors += chunk })
      child.stdout.on('data', (chunk) => {
        output += chunk
        const match = output.match(/XJZ_READY:(\d+)/)
        if (match) {
          clearTimeout(timeout)
          resolvePort(Number(match[1]))
        }
      })
      child.once('exit', (code) => {
        clearTimeout(timeout)
        reject(new Error(`API exited with ${code}: ${errors}`))
      })
    })

    const base = `http://127.0.0.1:${port}`
    const [home, topic, health, tools, books] = await Promise.all([
      fetch(base), fetch(`${base}/xunlan/`), fetch(`${base}/api/health`),
      fetch(`${base}/api/tools`), fetch(`${base}/api/books`),
    ])
    assert.equal(home.status, 200)
    assert.match(await home.text(), /<div id="root">/)
    assert.equal(topic.status, 200)
    assert.match(await topic.text(), /<div id="root">/)
    assert.equal((await health.json()).ok, true)
    assert.ok((await tools.json()).length >= 10)
    assert.ok((await books.json()).length >= 20)
  } finally {
    child.kill()
  }
})
