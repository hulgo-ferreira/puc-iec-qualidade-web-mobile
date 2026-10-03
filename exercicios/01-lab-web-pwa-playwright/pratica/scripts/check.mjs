// npm run check — roda a suíte e mostra o placar por aula/spec, mesmo com testes
// incompletos ou quebrados (não aborta). Não revela gabarito: só diz o que passou.
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';

const OUT = 'check-results.json';
const AULAS = {
  '01-login': 'Aula 2',
  '02-busca-mock': 'Aula 2',
  '03-visual': 'Aula 3',
  '04-spa': 'Aula 3',
  '05-pwa-offline': 'Aula 3',
};

const run = spawnSync(
  'npx',
  ['playwright', 'test', '--project=chromium', '--reporter=json'],
  { encoding: 'utf8', env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: OUT }, shell: process.platform === 'win32' },
);

let report;
try {
  report = JSON.parse(readFileSync(OUT, 'utf8'));
} catch {
  console.error('Não consegui ler o resultado. Rode `npm run test:e2e` pra ver o erro.');
  console.error((run.stderr || '').split('\n').slice(-12).join('\n'));
  process.exit(1);
} finally {
  rmSync(OUT, { force: true });
}

// Testes que passam "vazios" (TODO sem asserção) NÃO contam: cruza com o lint.
const lint = spawnSync('npx', ['eslint', 'tests', '--format', 'json'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
const empty = {}; // arquivo -> nº de testes sem asserção
const lintErrors = {}; // arquivo -> nº de erros (await/matcher faltando)
try {
  for (const f of JSON.parse(lint.stdout)) {
    const name = f.filePath.replace(/^.*[\\/]/, '').replace(/\.(spec\.)?ts$/, '');
    for (const m of f.messages) {
      if (m.ruleId === 'playwright/expect-expect') empty[name] = (empty[name] ?? 0) + 1;
      else if (m.severity === 2) lintErrors[name] = (lintErrors[name] ?? 0) + 1;
    }
  }
} catch {
  /* sem lint: segue só com o resultado do Playwright */
}

const bySpec = {};
const walk = (suite) => {
  for (const s of suite.suites ?? []) walk(s);
  for (const spec of suite.specs ?? []) {
    const file = spec.file.replace(/^.*\//, '').replace(/\.spec\.ts$/, '');
    const ok = spec.tests.every((t) => t.status === 'expected' || t.status === 'skipped');
    (bySpec[file] ??= []).push({ title: spec.title, ok });
  }
};
report.suites.forEach(walk);

let pass = 0;
let total = 0;
for (const [file, tests] of Object.entries(bySpec).sort()) {
  if (file.startsWith('auth.setup') || file.startsWith('06-')) continue;
  const green = tests.filter((t) => t.ok).length;
  const todo = Math.min(empty[file] ?? 0, green);
  const p = green - todo;
  pass += p;
  total += tests.length;
  const aula = AULAS[file] ?? '—';
  const notes = [];
  if (todo) notes.push(`${todo} sem asserção (TODO)`);
  if (lintErrors[file]) notes.push(`${lintErrors[file]} erro(s) de lint — rode npm run lint`);
  console.log(`${p === tests.length ? '✓' : '✗'} ${aula} · ${file}: ${p}/${tests.length}${notes.length ? ' — ' + notes.join(' · ') : ''}`);
  for (const t of tests.filter((t) => !t.ok)) console.log(`    ✗ ${t.title}`);
}
console.log(`\nTotal: ${pass}/${total} testes concluídos (verde e com asserção)`);
console.log('Dica: spec 03 (visual) falha na 1ª vez — rode `npm run test:visual:update` pra gerar os baselines.');
