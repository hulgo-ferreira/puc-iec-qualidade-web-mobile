// Validator — Lab Mobile (Maestro + Jest) · 15 pts
// Rubrica: enunciado.md do lab. Nota AUTOMÁTICA = piso (estrutural, parse-only).
// Execução real (vídeos iOS/Android) e CI verde são manuais (Canvas).

import * as fs from 'fs'
import * as path from 'path'
import { Criterion, GradeResult, computeAuto, computeScore, buildBreakdowns } from './lib/compute-score'

const args = process.argv.slice(2)
const entregaIdx = args.indexOf('--entrega')
const entregaPath = path.resolve(entregaIdx >= 0 ? args[entregaIdx + 1] : '.')

const praticaDir = path.join(entregaPath, 'pratica')

function read(...parts: string[]): string | null {
  const p = path.join(praticaDir, ...parts)
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null
}

function pendingTodos(raw: string, comment: string): number {
  const re = new RegExp(`^\\s*${comment}\\s*TODO`)
  return raw.split('\n').filter(l => re.test(l)).length
}

/** Código sem linhas de comentário — evita contar expect( dentro de TODO. */
function activeCode(raw: string): string {
  return raw
    .split('\n')
    .filter(l => !/^\s*\/\//.test(l) && !/^\s*#/.test(l))
    .join('\n')
}

const criteria: Criterion[] = []

// 1. Unit Jest (5) — 02-authStore completo
{
  const raw = read('__tests__', 'unit', '02-authStore.test.ts')
  const todos = raw === null ? 99 : pendingTodos(raw, '//')
  const expects = raw === null ? 0 : (activeCode(raw).match(/expect\(/g) ?? []).length
  const complete = todos === 0 && expects >= 8 // 5 testes × ~2 asserções
  criteria.push({
    key: 'unit-jest',
    label: 'Testes unitários Jest (02-authStore, 5 testes)',
    weight: 4,
    earned: complete ? 4 : raw !== null && expects >= 4 ? 2 : 0,
    note: raw === null ? 'arquivo não encontrado'
      : complete ? undefined
      : `${todos} TODO(s) pendente(s) · ${expects} expect(s) (esperado ≥8)`,
  })
}

// 2. Integração RNTL (4) — 01-login-favoritar completo
{
  const raw = read('__tests__', 'integration', '01-login-favoritar.test.tsx')
  const todos = raw === null ? 99 : pendingTodos(raw, '//')
  const patterns = [
    { re: /isFavorite\(603\)/, what: 'asserção no store (teste 2)' },
    { re: /queryByTestId/, what: 'queryByTestId no teste 3' },
  ]
  const code = raw === null ? '' : activeCode(raw)
  const missing = raw === null ? patterns : patterns.filter(p => !p.re.test(code))
  const complete = todos === 0 && missing.length === 0
  criteria.push({
    key: 'integration',
    label: 'Integração RNTL (navegação + estado real)',
    weight: 4,
    earned: complete ? 4 : raw !== null && missing.length <= 1 ? 2 : 0,
    note: raw === null ? 'arquivo não encontrado'
      : complete ? undefined
      : [todos ? `${todos} TODO(s)` : null, missing.length ? `falta: ${missing.map(m => m.what).join(', ')}` : null]
          .filter(Boolean).join(' · '),
  })
}

// 3. Flows Maestro completos (3) — 5 flows sem TODOs, com asserções
{
  const REQUIRED = ['01-launch.yaml', '02-search.yaml', '03-favorite.yaml', '04-detail.yaml', '05-js-dynamic.yaml']
  let complete = 0
  const notes: string[] = []
  for (const f of REQUIRED) {
    const raw = read('flows', f)
    if (raw === null) { notes.push(`${f}: ausente`); continue }
    const todos = pendingTodos(raw, '#')
    const ok = todos === 0 && raw.includes('appId:') && raw.includes('assertVisible')
    if (ok) complete++
    else notes.push(`${f}: ${todos > 0 ? `${todos} TODO(s)` : 'sem assertVisible'}`)
  }
  const earned = complete >= 5 ? 3 : complete >= 3 ? 2 : complete >= 1 ? 1 : 0
  criteria.push({
    key: 'flows',
    label: `5 flows Maestro completos (${complete}/5)`,
    weight: 3,
    earned,
    note: notes.length ? notes.join(' · ') : undefined,
  })
}

// 4-6. Manuais — vídeos + CI
criteria.push({
  key: 'exec-android',
  label: 'Execução real Android Emulator (vídeo)',
  weight: 1,
  earned: 0,
  manual: true,
  note: 'avaliação manual (Canvas)',
})
criteria.push({
  key: 'exec-ios',
  label: 'Execução real iOS Simulator (vídeo)',
  weight: 1,
  earned: 0,
  manual: true,
  note: 'avaliação manual (Canvas)',
})
criteria.push({
  key: 'ci-verde',
  label: 'CI verde no fork (Jest no Actions)',
  weight: 2,
  earned: 0,
  manual: true,
  note: 'avaliação manual (Canvas)',
})

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

console.log(`\n=== GRADE RESULT — Lab Mobile ===`)
console.log(`autoScore: ${autoScore}/${maxAutoScore} (piso — nota final no Canvas)`)
console.log(`\nBreakdown:`)
console.log(priv)
