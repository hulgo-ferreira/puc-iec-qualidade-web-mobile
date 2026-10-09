// Validator — Lab Web + PWA (Playwright + Lighthouse) · 15 pts
// NÚCLEO que vale nota (8 testes): 02 #4 e #7 · 03 #1 e #2 · 04 #1 e #2 · 05 #1 e #3. O resto é treino opcional.
// Rubrica: enunciado.md do lab. Nota AUTOMÁTICA = piso (estrutural, parse-only).
// Critérios manual:true (CI verde no fork, Lighthouse rodando) entram no Canvas.

import * as fs from 'fs'
import * as path from 'path'
import { Criterion, GradeResult, computeAuto, computeScore, buildBreakdowns } from './lib/compute-score'

const args = process.argv.slice(2)
const entregaIdx = args.indexOf('--entrega')
const entregaPath = path.resolve(entregaIdx >= 0 ? args[entregaIdx + 1] : '.')

const e2eDir = path.join(entregaPath, 'pratica', 'tests', 'e2e')

function read(file: string): string | null {
  const p = path.join(e2eDir, file)
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null
}

function pendingTodos(raw: string): number {
  return raw.split('\n').filter(l => /^\s*\/\/\s*TODO/.test(l)).length
}

/** Código sem linhas de comentário — evita casar padrão dentro de TODO/dica. */
function activeCode(raw: string): string {
  return raw.split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n')
}

/** Checa um spec: existe, sem TODOs pendentes, e contém todos os padrões pedidos. */
function checkSpec(
  file: string,
  patterns: { re: RegExp; what: string }[],
): { earnedRatio: number; note?: string } {
  const raw = read(file)
  if (raw === null) return { earnedRatio: 0, note: 'arquivo não encontrado' }

  const todos = pendingTodos(raw)
  const code = activeCode(raw)
  const missing = patterns.filter(p => !p.re.test(code)).map(p => p.what)

  if (todos === 0 && missing.length === 0) return { earnedRatio: 1 }

  const notes: string[] = []
  if (todos > 0) notes.push(`${todos} TODO(s) pendente(s)`)
  if (missing.length > 0) notes.push(`falta: ${missing.join(', ')}`)

  // crédito parcial: começou (menos TODOs que o scaffold) mas não fechou
  const ratio = missing.length === 0 ? 0.5 : todos === 0 ? 0.5 : 0
  return { earnedRatio: ratio, note: notes.join(' · ') }
}

const criteria: Criterion[] = []

// 1. Auth state reuse (3) — setup intacto + spec 04 completo
//    (o deep link logado do 04 só passa por causa do storageState)
{
  const setup = read('auth.setup.ts')
  const setupOk = setup !== null && /storageState\(\s*\{\s*path/.test(setup)
  const spa = checkSpec('04-spa.spec.ts', [
    { re: /data-app-ready/, what: 'espera pelo data-app-ready' },
    { re: /__spaMarker/, what: 'teste do marker SPA' },
  ])
  const earned = setupOk ? Math.round(1 + 1 * spa.earnedRatio) : 0
  criteria.push({
    key: 'storage-state',
    label: 'Auth state reuse (storageState) + specs SPA (04)',
    weight: 2,
    earned,
    note: !setupOk ? 'auth.setup.ts ausente/alterado' : spa.note,
  })
}

// 2. Network mocking (2) — spec 02 completo
{
  const r = checkSpec('02-busca-mock.spec.ts', [
    { re: /route\(/, what: 'page.route' },
    { re: /fulfill\(/, what: 'route.fulfill' },
    { re: /abort\(/, what: 'route.abort' },
    { re: /unroute\(/, what: 'page.unroute' },
    { re: /serviceWorkers:\s*'block'/, what: "serviceWorkers: 'block'" },
  ])
  criteria.push({
    key: 'network-mocking',
    label: 'Network mocking (route/fulfill/abort/unroute)',
    weight: 2,
    earned: Math.round(2 * r.earnedRatio),
    note: r.note,
  })
}

// 3. Visual regression em 3 viewports com baseline versionado (3)
{
  const r = checkSpec('03-visual.spec.ts', [
    { re: /toHaveScreenshot/, what: 'toHaveScreenshot' },
    { re: /setViewportSize/, what: 'setViewportSize (viewports)' },
  ])
  const snapsDir = path.join(e2eDir, '03-visual.spec.ts-snapshots')
  const snaps = fs.existsSync(snapsDir)
    ? fs.readdirSync(snapsDir).filter(f => f.endsWith('.png')).length
    : 0
  const baselineOk = snaps >= 4 // login + 3 viewports (+detail)
  const earned = Math.round(2 * r.earnedRatio) + (baselineOk ? 1 : 0)
  criteria.push({
    key: 'visual',
    label: 'Visual regression 3 viewports + baseline versionado',
    weight: 3,
    earned,
    note: [r.note, baselineOk ? undefined : `baselines commitados: ${snaps} (esperado ≥4)`]
      .filter(Boolean)
      .join(' · '),
  })
}

// 4. SW lifecycle testado (2) — spec 05 teste 1
{
  const raw0 = read('05-pwa-offline.spec.ts')
  const raw = raw0 === null ? null : activeCode(raw0)
  const ok = raw !== null && /toBe\(\s*['"]activated['"]\s*\)/.test(raw)
  criteria.push({
    key: 'sw-lifecycle',
    label: 'SW lifecycle (estado activated)',
    weight: 2,
    earned: ok ? 2 : 0,
    note: raw === null ? 'arquivo não encontrado'
      : !ok ? "falta asserção .toBe('activated')" : undefined,
  })
}

// 5. Offline mode test (3) — spec 05 teste 3
{
  const raw0 = read('05-pwa-offline.spec.ts')
  const raw = raw0 === null ? null : activeCode(raw0)
  const patterns = [
    { re: /setOffline\(\s*true\s*\)/, what: 'context.setOffline(true)' },
    { re: /serviceWorker\.controller/, what: 'espera pelo controller' },
    { re: /reload\(/, what: 'page.reload offline' },
    { re: /offline-banner/, what: 'asserção do offline-banner' },
  ]
  const missing = raw === null ? patterns : patterns.filter(p => !p.re.test(raw))
  const earned = raw === null ? 0 : missing.length === 0 ? 3 : missing.length <= 2 ? 1 : 0
  criteria.push({
    key: 'offline',
    label: 'Offline mode (setOffline + controller + reload)',
    weight: 3,
    earned,
    note: missing.length > 0 ? `falta: ${missing.map(p => p.what).join(', ')}` : undefined,
  })
}

// 6. Lighthouse CI com 3 budgets (3) — config auto (2) + run é manual (1)
{
  const lhPath = path.join(entregaPath, 'pratica', 'lighthouserc.json')
  let budgets = 0
  if (fs.existsSync(lhPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(lhPath, 'utf8'))
      const asserts = cfg?.ci?.assert?.assertions ?? {}
      budgets = Object.keys(asserts).filter(k =>
        /paint|blocking|shift|numericValue|first-|largest-|total-/.test(k) ||
        JSON.stringify(asserts[k]).includes('maxNumericValue'),
      ).length
    } catch { /* json inválido → 0 */ }
  }
  criteria.push({
    key: 'lighthouse-config',
    label: 'Lighthouse CI — 3+ budgets configurados',
    weight: 2,
    earned: budgets >= 3 ? 2 : budgets >= 1 ? 1 : 0,
    note: `budgets numéricos encontrados: ${budgets}`,
  })
  criteria.push({
    key: 'lighthouse-run',
    label: 'Lighthouse rodando (print/log no PR) + CI verde no fork',
    weight: 1,
    earned: 0,
    manual: true,
    note: 'avaliação manual (Canvas)',
  })
}

const { pub, priv } = buildBreakdowns(criteria)
const autoScore = computeAuto(criteria)
const totalScore = computeScore(criteria)
const maxAutoScore = criteria.filter(c => !c.manual).reduce((s, c) => s + c.weight, 0)
const maxTotalScore = criteria.reduce((s, c) => s + c.weight, 0)

const result: GradeResult = {
  autoScore,
  maxAutoScore,
  totalScore,
  maxTotalScore,
  criteria,
  breakdown: pub,
  privateBreakdown: priv,
}

fs.writeFileSync(path.join(__dirname, 'grade.json'), JSON.stringify(result, null, 2))

console.log(`\n=== GRADE RESULT — Lab Web + PWA ===`)
console.log(`autoScore: ${autoScore}/${maxAutoScore} (piso — nota final no Canvas)`)
console.log(`\nBreakdown:`)
console.log(priv)
