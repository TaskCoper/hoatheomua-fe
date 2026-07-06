import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = path.resolve(__dirname, '..', 'public', 'images')

const TARGETS = new Set([
  'banner.png',
  'banner-one.png',
  'sale-banner.png',
  'slogan.png',
  '2.png',
  '3.png',
  '5.png',
  '6.png',
  '7.png',
  '8.png',
  '9.png',
  '10.png',
  '11.png'
])

const QUALITY = 78

async function optimize(fileName) {
  const src = path.join(IMAGES_DIR, fileName)
  const dest = path.join(IMAGES_DIR, fileName.replace(/\.png$/, '.webp'))
  const info = await sharp(src).webp({ quality: QUALITY, effort: 6 }).toFile(dest)
  const before = (await stat(src)).size
  const after = info.size
  const ratio = ((1 - after / before) * 100).toFixed(1)
  return { fileName, before, after, ratio }
}

const files = await readdir(IMAGES_DIR)
const results = []

for (const file of files) {
  if (!TARGETS.has(file)) continue
  const result = await optimize(file)
  results.push(result)
  console.log(
    `${result.fileName.padEnd(18)}${(result.before / 1024).toFixed(0).padStart(6)} KB -> ${(result.after / 1024)
      .toFixed(0)
      .padStart(6)} KB  (-${result.ratio}%)`
  )
}

const beforeTotal = results.reduce((sum, r) => sum + r.before, 0)
const afterTotal = results.reduce((sum, r) => sum + r.after, 0)
console.log('---')
console.log(
  `${'TOTAL'.padEnd(18)}${(beforeTotal / 1024).toFixed(0).padStart(6)} KB -> ${(afterTotal / 1024)
    .toFixed(0)
    .padStart(6)} KB  (-${((1 - afterTotal / beforeTotal) * 100).toFixed(1)}%)`
)
