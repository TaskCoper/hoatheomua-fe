// `output: 'standalone'` emits a server bundle without the assets Next serves
// from disk at runtime - `.next/static` and `public` are left behind on purpose
// so deploys can put them on a CDN. We run the whole thing off one box, so copy
// them in and keep `node .next/standalone/server.js` self-contained.
import { cp, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const STANDALONE = path.join(ROOT, '.next', 'standalone')

const ASSETS = [
  { from: path.join(ROOT, '.next', 'static'), to: path.join(STANDALONE, '.next', 'static') },
  { from: path.join(ROOT, 'public'), to: path.join(STANDALONE, 'public') }
]

async function exists(target) {
  try {
    await stat(target)
    return true
  } catch {
    return false
  }
}

if (!(await exists(STANDALONE))) {
  console.log('copy-standalone-assets: no .next/standalone directory, skipping')
  process.exit(0)
}

for (const { from, to } of ASSETS) {
  if (!(await exists(from))) {
    console.log(`copy-standalone-assets: ${path.relative(ROOT, from)} missing, skipping`)
    continue
  }
  await cp(from, to, { recursive: true, force: true })
  console.log(`copy-standalone-assets: ${path.relative(ROOT, from)} -> ${path.relative(ROOT, to)}`)
}
