// Erzeugt public/licenses.html mit den Lizenzen aller Produktions-Abhängigkeiten.
// Läuft automatisch via "predev" und "prebuild". Fällt bei Fehlern auf eine
// Minimal-Seite zurück, damit dev/build niemals daran scheitern.
import { createRequire } from 'node:module'
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const outDir = join(rootDir, 'public')
const outFile = join(outDir, 'licenses.html')

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const page = (bodyHtml, count) => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Open-Source-Lizenzen</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; padding:20px; background:#0f172a; color:#e2e8f0;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; font-size:14px; line-height:1.55; }
  header.top { margin-bottom:18px; }
  header.top h1 { font-size:18px; margin:0 0 4px; }
  header.top p { margin:0; color:#94a3b8; font-size:13px; }
  section { border:1px solid #1e293b; border-radius:10px; padding:12px 14px; margin-bottom:14px; background:#111a2e; }
  section h2 { font-size:15px; margin:0 0 6px; color:#7dd3fc; word-break:break-all; }
  .meta { margin:2px 0; color:#94a3b8; font-size:12.5px; }
  .muted { color:#64748b; }
  a { color:#38bdf8; }
  pre { white-space:pre-wrap; word-wrap:break-word; background:#0b1424; border:1px solid #1e293b;
    border-radius:8px; padding:10px; font-size:12px; color:#cbd5e1; max-height:320px; overflow:auto; }
</style>
</head>
<body>
<header class="top">
  <h1>Open-Source-Lizenzen</h1>
  <p>Winddreieck-Trainer nutzt die folgenden Open-Source-Pakete (${count}). Vielen Dank an alle Autorinnen und Autoren.</p>
</header>
${bodyHtml}
</body>
</html>
`

function writeFallback(message) {
  mkdirSync(outDir, { recursive: true })
  writeFileSync(
    outFile,
    page(`<section><p class="muted">${escapeHtml(message)}</p></section>`, 0),
    'utf8',
  )
}

try {
  const checker = require('license-checker-rseidelsohn')
  const packages = await new Promise((resolve, reject) => {
    checker.init(
      { start: rootDir, production: true, excludePrivatePackages: true },
      (err, res) => (err ? reject(err) : resolve(res)),
    )
  })

  const entries = Object.keys(packages)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((key) => {
      const p = packages[key]
      let text = ''
      if (p.licenseFile) {
        try {
          text = readFileSync(p.licenseFile, 'utf8')
        } catch {
          text = ''
        }
      }
      return { key, licenses: p.licenses, repository: p.repository, publisher: p.publisher, text }
    })

  const body = entries
    .map((e) => {
      const repo = e.repository
        ? `<p class="meta"><a href="${escapeHtml(e.repository)}" target="_blank" rel="noopener noreferrer">${escapeHtml(e.repository)}</a></p>`
        : ''
      const publisher = e.publisher ? `<p class="meta">© ${escapeHtml(e.publisher)}</p>` : ''
      const licenseText = e.text
        ? `<pre>${escapeHtml(e.text)}</pre>`
        : `<p class="muted">Kein Lizenztext im Paket gefunden.</p>`
      return `<section>
  <h2>${escapeHtml(e.key)}</h2>
  <p class="meta">Lizenz: <strong>${escapeHtml(String(e.licenses || 'UNKNOWN'))}</strong></p>
  ${publisher}${repo}
  ${licenseText}
</section>`
    })
    .join('\n')

  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, page(body, entries.length), 'utf8')
  console.log(`[licenses] ${outFile} (${entries.length} Pakete)`)
} catch (err) {
  console.warn('[licenses] Konnte Lizenzen nicht erzeugen:', err?.message || err)
  writeFallback('Lizenzliste konnte beim Build nicht erzeugt werden.')
}
