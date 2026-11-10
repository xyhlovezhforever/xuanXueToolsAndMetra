import { copyFile, mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { basename, dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const target = execFileSync('rustc', ['--print', 'host-tuple'], { encoding: 'utf8' }).trim()
const runtime = join(root, 'src-tauri', 'binaries', `node-${target}${process.platform === 'win32' ? '.exe' : ''}`)

await mkdir(dirname(runtime), { recursive: true })
await copyFile(process.execPath, runtime)
console.log(`Desktop Node runtime: ${basename(runtime)}`)

if (!process.argv.includes('--runtime-only')) {
  for (const file of [
    'server.mjs',
    'embedded-tools.mjs',
    'book-catalog.mjs',
    'discovered-books.mjs',
    'xunlan/server/hexagram-analysis.js',
    'xunlan/src/hexagram-calculator.js',
    'xunlan/src/xiaoliuren-calculator.js',
    'xunlan/data.js',
  ]) {
    const destination = join(root, 'desktop-server', file)
    await mkdir(dirname(destination), { recursive: true })
    await copyFile(join(root, file), destination)
  }
  console.log('Desktop API files staged')
}
