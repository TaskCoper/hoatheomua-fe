#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const MESSAGES_DIR = join(ROOT, 'lib', 'i18n', 'messages')
const SOURCE_DIRS = ['app', 'components', 'features', 'guards', 'hooks', 'lib', 'shared', 'stores'].map((dir) =>
  join(ROOT, dir)
)
const PRIMARY_LOCALE = 'en'
const SCAN_EXTS = new Set(['.ts', '.tsx'])
const SKIP_DIRS = new Set(['.git', '.next', 'node_modules'])

const args = new Set(process.argv.slice(2))
const runLint = args.size === 0 || args.has('--lint') || args.has('--check')
const runUndefined = args.size === 0 || args.has('--check')
const runUnused = args.has('--unused')
const runFill = args.has('--fill')
const runDupes = args.has('--dupes')
const fix = args.has('--fix')

function walk(dir, out = []) {
  if (!existsSync(dir)) return out

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue

    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, out)
    } else if (SCAN_EXTS.has(extname(entry.name)) && !fullPath.startsWith(MESSAGES_DIR)) {
      out.push(fullPath)
    }
  }

  return out
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function flattenMessages(value, prefix = '') {
  const messages = new Map()

  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (child && typeof child === 'object' && !Array.isArray(child)) {
      for (const [nestedKey, nestedValue] of flattenMessages(child, path)) {
        messages.set(nestedKey, nestedValue)
      }
    } else {
      messages.set(path, child)
    }
  }

  return messages
}

function setKey(obj, path, value) {
  const parts = path.split('.')
  let node = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (typeof node[part] !== 'object' || node[part] === null || Array.isArray(node[part])) {
      node[part] = {}
    }
    node = node[part]
  }

  const leaf = parts[parts.length - 1]
  if (!(leaf in node)) node[leaf] = value
}

function deleteKey(obj, path) {
  const parts = path.split('.')
  const stack = [obj]
  let node = obj

  for (let i = 0; i < parts.length - 1; i++) {
    node = node?.[parts[i]]
    if (!node || typeof node !== 'object') return
    stack.push(node)
  }

  delete node[parts[parts.length - 1]]

  for (let i = stack.length - 1; i > 0; i--) {
    if (Object.keys(stack[i]).length === 0) {
      delete stack[i - 1][parts[i - 1]]
    } else {
      break
    }
  }
}

function getIcuArgs(message) {
  if (typeof message !== 'string') return []

  const args = new Set()
  const regex = /\{([A-Za-z_][\w-]*)[,}]/g
  for (const match of message.matchAll(regex)) {
    args.add(match[1])
  }

  return [...args].sort()
}

function sameArray(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function findTranslatorBindings(source) {
  const bindings = new Map()
  const patterns = [
    /\b(?:const|let|var)\s+\{\s*t\s*(?::\s*([A-Za-z_$][\w$]*))?[\s\S]*?\}\s*=\s*useTranslation\(\s*\)/g,
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*\{[\s\S]*?namespace\s*:\s*['"`]([^'"`]+)['"`][\s\S]*?\}\s*\)/g,
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*\)/g
  ]

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      bindings.set(match[1] ?? 't', match[2] ?? '')
    }
  }

  return bindings
}

function findDictionaryBindings(source) {
  const bindings = new Set()
  const pattern = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?getDictionary\s*\(/g
  for (const match of source.matchAll(pattern)) {
    bindings.add(match[1])
  }
  return bindings
}

function findReferencedKeys(sourceFiles) {
  const keys = new Set()
  const dynamicNamespaces = new Set()
  const templatePrefixes = new Set()

  for (const file of sourceFiles) {
    const source = readFileSync(file, 'utf8')
    const bindings = findTranslatorBindings(source)

    for (const [name, namespace] of bindings) {
      const callRegex = new RegExp(`\\b${name}(?:\\.(?:rich|markup|raw|has))?\\(\\s*['"\`]([^'"\`]+)['"\`]`, 'g')

      for (const match of source.matchAll(callRegex)) {
        const key = namespace ? `${namespace}.${match[1]}` : match[1]
        if (key.includes('${')) {
          const prefix = key.slice(0, key.indexOf('${'))
          if (prefix.includes('.')) templatePrefixes.add(prefix)
        } else {
          keys.add(key)
        }
      }

      const dynamicCallRegex = new RegExp(`\\b${name}(?:\\.(?:rich|markup|raw|has))?\\(\\s*(?!['"\`])`, 'g')
      const passedTranslatorRegex = new RegExp(`[,(]\\s*${name}\\s*[,)]`, 'g')
      if (namespace && (dynamicCallRegex.test(source) || passedTranslatorRegex.test(source))) {
        dynamicNamespaces.add(namespace)
      }
    }

    // Detect property-chain access for getDictionary bindings: dict.home.heading
    for (const name of findDictionaryBindings(source)) {
      const accessRegex = new RegExp(`\\b${name}\\.([A-Za-z_][\\w]*(?:\\.[A-Za-z_][\\w]*)*)`, 'g')
      for (const match of source.matchAll(accessRegex)) {
        keys.add(match[1])
      }
    }

    const templateRegex = /`([A-Za-z_][\w.]*)\$\{/g
    for (const match of source.matchAll(templateRegex)) {
      if (match[1].includes('.')) templatePrefixes.add(match[1])
    }
  }

  return { dynamicNamespaces, keys, templatePrefixes }
}

function literalIncludes(sourceText, key) {
  return sourceText.includes(`'${key}'`) || sourceText.includes(`"${key}"`) || sourceText.includes(`\`${key}\``)
}

const localeFiles = readdirSync(MESSAGES_DIR)
  .filter((file) => file.endsWith('.json'))
  .sort()

const locales = new Map(
  localeFiles.map((file) => {
    const locale = file.replace(/\.json$/, '')
    const json = readJson(join(MESSAGES_DIR, file))
    return [locale, { file, json, messages: flattenMessages(json) }]
  })
)

if (!locales.has(PRIMARY_LOCALE)) {
  console.error(`Missing primary locale: ${PRIMARY_LOCALE}.json`)
  process.exit(1)
}

const sourceFiles = SOURCE_DIRS.flatMap((dir) => walk(dir))
const sourceText = sourceFiles.map((file) => readFileSync(file, 'utf8')).join('\n')
const primary = locales.get(PRIMARY_LOCALE)
const primaryKeys = [...primary.messages.keys()].sort()
const { dynamicNamespaces, keys: referencedKeys, templatePrefixes } = findReferencedKeys(sourceFiles)

let failed = false

function report(title, items) {
  if (items.length === 0) return

  failed = true
  console.error(`\n${title}`)
  for (const item of items) console.error(`  ${item}`)
}

if (runLint) {
  for (const [locale, { messages }] of locales) {
    if (locale === PRIMARY_LOCALE) continue

    const keys = new Set(messages.keys())
    report(
      `${locale}.json is missing keys:`,
      primaryKeys.filter((key) => !keys.has(key))
    )
    report(
      `${locale}.json has extra keys:`,
      [...keys].sort().filter((key) => !primary.messages.has(key))
    )

    const invalidIcu = []
    for (const key of primaryKeys) {
      if (!messages.has(key)) continue

      const sourceArgs = getIcuArgs(primary.messages.get(key))
      const targetArgs = getIcuArgs(messages.get(key))
      if (!sameArray(sourceArgs, targetArgs)) {
        invalidIcu.push(`${key} (${sourceArgs.join(', ') || 'none'} -> ${targetArgs.join(', ') || 'none'})`)
      }
    }

    report(`${locale}.json has invalid ICU arguments:`, invalidIcu)
  }

  const emptyValues = []
  for (const [locale, { messages }] of locales) {
    for (const [key, value] of messages) {
      if (typeof value !== 'string' || value.trim() === '') {
        emptyValues.push(`${locale}.${key}`)
      }
    }
  }

  report('Empty or non-string messages:', emptyValues)
}

if (runUndefined) {
  report(
    'Undefined translation keys referenced in source:',
    [...referencedKeys].sort().filter((key) => !primary.messages.has(key))
  )
}

if (runUnused) {
  const unusedKeys = primaryKeys.filter((key) => {
    if (referencedKeys.has(key) || literalIncludes(sourceText, key)) return false

    for (const namespace of dynamicNamespaces) {
      if (key.startsWith(`${namespace}.`)) return false
    }

    for (const prefix of templatePrefixes) {
      if (key.startsWith(prefix)) return false
    }

    return true
  })

  console.log(`Scanned ${sourceFiles.length} source files.`)
  console.log(`Total keys in ${PRIMARY_LOCALE}.json: ${primaryKeys.length}`)
  console.log(`Dynamic namespaces detected: ${dynamicNamespaces.size}`)
  console.log(`Template-literal prefixes detected: ${templatePrefixes.size}`)
  console.log(`Unused keys: ${unusedKeys.length}`)

  if (unusedKeys.length > 0) {
    for (const key of unusedKeys) console.log(key)

    if (fix) {
      for (const { file, json } of locales.values()) {
        for (const key of unusedKeys) deleteKey(json, key)
        const path = join(MESSAGES_DIR, file)
        writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`)
        console.log(`Updated ${relative(ROOT, path)}`)
      }
    } else {
      console.log('\nRun again with --fix to delete these keys from all locale files.')
      failed = true
    }
  }
}

if (runFill) {
  const missingInPrimary = [...referencedKeys].sort().filter((key) => !primary.messages.has(key))

  for (const key of missingInPrimary) {
    const leaf = key.split('.').pop()
    setKey(primary.json, key, leaf)
  }

  const primaryAfterFill = flattenMessages(primary.json)

  for (const [locale, { json }] of locales) {
    if (locale === PRIMARY_LOCALE) continue

    for (const [key, value] of primaryAfterFill) {
      setKey(json, key, value)
    }
  }

  for (const { file, json } of locales.values()) {
    const path = join(MESSAGES_DIR, file)
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`)
    console.log(`Wrote ${relative(ROOT, path)}`)
  }

  console.log(`\nAdded ${missingInPrimary.length} missing keys to ${PRIMARY_LOCALE}.json.`)
  if (missingInPrimary.length > 0) {
    console.log('Stubbed values (review and translate):')
    for (const key of missingInPrimary) console.log(`  ${key}`)
  }
}

if (runDupes) {
  for (const [locale, { messages }] of locales) {
    const byValue = new Map()
    for (const [key, value] of messages) {
      if (typeof value !== 'string') continue
      if (!byValue.has(value)) byValue.set(value, [])
      byValue.get(value).push(key)
    }

    const groups = [...byValue.entries()].filter(([, keys]) => keys.length > 1)
    if (groups.length === 0) {
      console.log(`${locale}.json: no duplicate values.`)
      continue
    }

    console.log(`\n${locale}.json duplicate values (${groups.length} groups):`)
    for (const [value, keys] of groups) {
      console.log(`  "${value}"`)
      for (const key of keys) console.log(`    - ${key}`)
    }
  }
}

if (!failed) {
  if (runLint || runUndefined) {
    console.log(`Checked ${localeFiles.length} locale files and ${sourceFiles.length} source files.`)
  }

  process.exit(0)
}

process.exit(1)
