// Validator — Lab IA Pipeline Test Generation · 15 pts
// Rubrica: enunciado.md do lab. Nota AUTOMÁTICA = piso (estrutural, parse-only).
// NUNCA executa código da entrega (chamaria a API com chave de quem?).

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

function pendingTodos(raw: string): number {
  return raw.split('\n').filter(l => /^\s*\/\/\s*TODO/.test(l)).length
}

const criteria: Criterion[] = []

// 1. Pipeline funcional (6): gerador intacto (1) + story própria (1) +
//    spec gerado commitado (2) + visual-diff completo (2)
{
  const gen = read('src', '01-gen-test.ts')
  const genOk = gen !== null && /extractCode/.test(gen) && /playwright test/.test(gen)
  criteria.push({
    key: 'gen-intacto',
    label: 'Gerador (01-gen-test.ts) intacto e funcional',
    weight: 1,
    earned: genOk ? 1 : 0,
    note: genOk ? undefined : 'arquivo ausente ou descaracterizado',
  })

  const storiesDir = path.join(praticaDir, 'stories')
  const stories = fs.existsSync(storiesDir)
    ? fs.readdirSync(storiesDir).filter(f => f.endsWith('.story.md'))
    : []
  const ownStories = stories.filter(f => f !== 'favoritar.story.md')
  criteria.push({
    key: 'story-propria',
    label: 'User story própria em stories/ (além da de exemplo)',
    weight: 1,
    earned: ownStories.length >= 1 ? 1 : 0,
    note: ownStories.length >= 1 ? ownStories.join(', ') : 'só a story de exemplo',
  })

  const genDir = path.join(praticaDir, 'generated')
  const specs = fs.existsSync(genDir)
    ? fs.readdirSync(genDir).filter(f => f.endsWith('.spec.ts'))
    : []
  const specsOk =
    specs.length >= 1 &&
    specs.some(f => {
      const raw = read('generated', f) ?? ''
      return /getByTestId/.test(raw) && /expect\(/.test(raw)
    })
  criteria.push({
    key: 'spec-gerado',
    label: 'Spec gerado commitado em generated/ (com asserções reais)',
    weight: 2,
    earned: specsOk ? 2 : specs.length >= 1 ? 1 : 0,
    note: specs.length === 0 ? 'generated/ vazio' : specsOk ? undefined : 'spec sem getByTestId/expect',
  })

  const vd = read('src', '03-visual-diff.ts')
  const vdTodos = vd === null ? 99 : pendingTodos(vd)
  const vdOk = vd !== null && vdTodos === 0 && /pixelmatch\(/.test(vd) && /exitCode/.test(vd)
  criteria.push({
    key: 'visual-diff',
    label: 'Visual diff (03) completo — pixelmatch + gate',
    weight: 2,
    earned: vdOk ? 2 : vd !== null && vdTodos < 4 ? 1 : 0,
    note: vd === null ? 'arquivo não encontrado' : vdOk ? undefined : `${vdTodos} TODO(s) pendente(s)`,
  })
}

// 2. Healing loop (4): completo (3) + evidência de execução (1, manual via log no PR)
{
  const heal = read('src', '02-healing-loop.ts')
  const todos = heal === null ? 99 : pendingTodos(heal)
  const patterns = [
    { re: /MAX_ATTEMPTS/, what: 'limite de tentativas' },
    { re: /ask\(/, what: 're-prompt (ask)' },
    { re: /extractCode\(/, what: 'extração do código' },
    { re: /writeFileSync\(/, what: 'gravação do spec corrigido' },
    { re: /exitCode|exit\(1\)/, what: 'falha ao esgotar tentativas' },
  ]
  const missing = heal === null ? patterns : patterns.filter(p => !p.re.test(heal))
  const complete = todos === 0 && missing.length === 0
  criteria.push({
    key: 'healing-loop',
    label: 'Healing loop completo (máx 3 tentativas, auditável)',
    weight: 3,
    earned: complete ? 3 : heal !== null && missing.length <= 2 && todos === 0 ? 1 : 0,
    note: heal === null ? 'arquivo não encontrado'
      : complete ? undefined
      : [todos > 0 ? `${todos} TODO(s)` : null, missing.length ? `falta: ${missing.map(m => m.what).join(', ')}` : null]
          .filter(Boolean).join(' · '),
  })
  criteria.push({
    key: 'healing-evidencia',
    label: 'Evidência do healing rodando (log no PR)',
    weight: 1,
    earned: 0,
    manual: true,
    note: 'avaliação manual (Canvas)',
  })
}

// 3. Relatório crítico (5): existe com seções mínimas (1 auto) + qualidade (4 manual)
{
  const candidates = ['RELATORIO.md', 'relatorio.md', 'docs/RELATORIO.md']
  let rel: string | null = null
  for (const c of candidates) {
    rel = read(...c.split('/'))
    if (rel) break
  }
  const sections = [/oracle/i, /custo|token/i, /compara/i]
  const found = rel === null ? 0 : sections.filter(re => re!.test(rel!)).length
  criteria.push({
    key: 'relatorio-estrutura',
    label: 'Relatório presente com seções (oracle, custo, comparação)',
    weight: 1,
    earned: rel === null ? 0 : found >= 3 ? 1 : 0,
    note: rel === null ? 'RELATORIO.md não encontrado' : `seções detectadas: ${found}/3`,
  })
  criteria.push({
    key: 'relatorio-qualidade',
    label: 'Qualidade do relatório crítico',
    weight: 4,
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

console.log(`\n=== GRADE RESULT — Lab IA ===`)
console.log(`autoScore: ${autoScore}/${maxAutoScore} (piso — nota final no Canvas)`)
console.log(`\nBreakdown:`)
console.log(priv)
