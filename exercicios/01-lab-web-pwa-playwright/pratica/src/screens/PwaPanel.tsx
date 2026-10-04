// src/screens/PwaPanel.tsx  (rota /pwa)
//
// "Raio-X" da PWA: mostra AO VIVO o que torna este app diferente de um site
// comum — e deixa o aluno mexer em cada recurso. Cada linha tem um
// data-testid pra virar asserção de Playwright (tests/e2e-bonus/09-*.spec.ts).

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbClear, dbKeys } from '@/services/db';
import { useFavorites } from '@/store/favorites';
import { badgeSupported, setBadge } from '@/pwa/badge';
import { isStandalone, promptInstall, useInstall } from '@/pwa/install';
import { canShare, shareMovie } from '@/pwa/share';
import { testIDs } from '@/utils/testIDs';

type Check = { name: string; label: string; ok: boolean; detail: string };

const fmtMB = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;

async function collect(): Promise<{ checks: Check[]; storage: string }> {
  const secure = window.isSecureContext;
  const manifestHref = document.querySelector('link[rel="manifest"]')?.getAttribute('href');
  let manifestOk = false;
  if (manifestHref) {
    try {
      manifestOk = (await fetch(manifestHref)).ok;
    } catch {
      manifestOk = false;
    }
  }
  const hasSW = 'serviceWorker' in navigator;
  const reg = hasSW ? await navigator.serviceWorker.getRegistration() : undefined;
  const controlled = hasSW && navigator.serviceWorker.controller !== null;
  const cacheNames = 'caches' in window ? await caches.keys() : [];
  let cachedFiles = 0;
  for (const n of cacheNames) cachedFiles += (await (await caches.open(n)).keys()).length;
  const dbKeysList = await dbKeys();
  const est = navigator.storage?.estimate ? await navigator.storage.estimate() : undefined;
  const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : false;

  const checks: Check[] = [
    { name: 'https', label: 'Contexto seguro (HTTPS)', ok: secure, detail: secure ? location.protocol + '//' + location.host : 'sem HTTPS não há Service Worker' },
    { name: 'manifest', label: 'Manifest do app', ok: manifestOk, detail: manifestOk ? 'nome, ícones e cores válidos' : 'não encontrado' },
    { name: 'sw', label: 'Service Worker', ok: !!reg?.active, detail: reg?.active ? `estado: ${reg.active.state}` : 'não registrado (use o build: npm run preview)' },
    { name: 'controller', label: 'SW controlando esta página', ok: controlled, detail: controlled ? 'sim — intercepta as requisições' : 'ainda não (recarregue a página)' },
    { name: 'cache', label: 'Cache Storage (arquivos offline)', ok: cachedFiles > 0, detail: `${cacheNames.length} cache(s) · ${cachedFiles} arquivo(s)` },
    { name: 'db', label: 'Banco local (IndexedDB)', ok: dbKeysList.length > 0, detail: `${dbKeysList.length} registro(s) salvo(s)` },
    { name: 'network', label: 'Rede', ok: navigator.onLine, detail: navigator.onLine ? 'online' : 'offline — o app segue funcionando' },
    { name: 'standalone', label: 'Rodando como app instalado', ok: isStandalone(), detail: isStandalone() ? 'janela própria (standalone)' : 'em uma aba do navegador' },
  ];
  const storage = est
    ? `${fmtMB(est.usage ?? 0)} de ${fmtMB(est.quota ?? 0)} · ${persisted ? 'armazenamento persistente 🔒' : 'pode ser limpo pelo navegador'}`
    : 'API de storage indisponível';
  return { checks, storage };
}

export default function PwaPanel() {
  const navigate = useNavigate();
  const { canInstall, installed } = useInstall();
  const favorites = useFavorites();
  const [checks, setChecks] = useState<Check[]>([]);
  const [storage, setStorage] = useState('…');
  const [result, setResult] = useState('');

  const refresh = useCallback(() => {
    void collect().then(({ checks: c, storage: s }) => {
      setChecks(c);
      setStorage(s);
    });
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    navigator.serviceWorker?.addEventListener('controllerchange', refresh);
    return () => {
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
      navigator.serviceWorker?.removeEventListener('controllerchange', refresh);
    };
  }, [refresh, installed]);

  async function install() {
    const r = await promptInstall();
    setResult(r === 'unavailable' ? 'Instalação indisponível agora (já instalado, ou o navegador não oferece).' : `Instalação: ${r}`);
    refresh();
  }

  async function share() {
    const r = await shareMovie('CineFav', location.origin);
    setResult(r === 'shared' ? 'Menu de compartilhar aberto ✓' : r === 'copied' ? 'Link copiado (sem Web Share neste navegador) ✓' : 'Compartilhamento cancelado');
  }

  async function badge() {
    if (!badgeSupported()) {
      setResult('Badging API indisponível (só no app instalado, Chromium).');
      return;
    }
    await setBadge(favorites.length || 1);
    setResult(`Badge no ícone do app: ${favorites.length || 1} ✓`);
  }

  async function persist() {
    const ok = (await navigator.storage?.persist?.()) ?? false;
    setResult(ok ? 'Armazenamento persistente concedido 🔒' : 'O navegador negou (ele decide pelo engajamento do usuário).');
    refresh();
  }

  async function reset() {
    for (const n of await caches.keys()) await caches.delete(n);
    for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
    await dbClear();
    setResult('Caches, banco local e Service Worker removidos. Recarregue a página.');
    refresh();
  }

  return (
    <main data-testid={testIDs.pwa.screen}>
      <header className="app-header">
        <button className="icon-button" data-testid={testIDs.pwa.back} onClick={() => navigate('/')}>
          ← Voltar
        </button>
        <h1>Raio-X da PWA</h1>
      </header>

      <div className="screen-body pwa-panel">
        <p className="muted">
          Este app é uma <strong>Progressive Web App</strong>: o mesmo site, mas instalável, com cache offline,
          banco local e recursos do dispositivo. Tudo abaixo é lido ao vivo do navegador.
        </p>

        <ul className="check-list">
          {checks.map((c) => (
            <li key={c.name} data-testid={testIDs.pwa.check(c.name)} data-ok={c.ok}>
              <span className={`dot ${c.ok ? 'ok' : 'off'}`} aria-hidden />
              <div>
                <strong>{c.label}</strong>
                <small>{c.detail}</small>
              </div>
            </li>
          ))}
        </ul>

        <p className="storage-line" data-testid={testIDs.pwa.storage}>
          💾 Armazenamento: {storage}
        </p>

        <h2>Recursos do dispositivo</h2>
        <div className="action-grid">
          <button data-testid={testIDs.pwa.installButton} onClick={() => void install()} disabled={!canInstall}>
            📲 {installed ? 'App instalado' : canInstall ? 'Instalar o CineFav' : 'Instalar (indisponível agora)'}
          </button>
          <button data-testid={testIDs.pwa.shareButton} onClick={() => void share()}>
            🔗 Compartilhar {canShare() ? '' : '(copia o link)'}
          </button>
          <button data-testid={testIDs.pwa.badgeButton} onClick={() => void badge()}>
            🔴 Badge no ícone ({favorites.length} favorito{favorites.length === 1 ? '' : 's'})
          </button>
          <button data-testid={testIDs.pwa.persistButton} onClick={() => void persist()}>
            🔒 Pedir armazenamento persistente
          </button>
          <button className="danger" data-testid={testIDs.pwa.resetButton} onClick={() => void reset()}>
            🧹 Limpar cache, banco e SW
          </button>
        </div>
        {result && (
          <p className="action-result" role="status" data-testid={testIDs.pwa.result}>
            {result}
          </p>
        )}

        <h2>Site comum × PWA</h2>
        <table className="compare">
          <thead>
            <tr>
              <th>Recurso</th>
              <th>Site comum</th>
              <th>PWA</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Abre sem internet</td><td>❌ erro do navegador</td><td>✅ Service Worker serve do cache</td></tr>
            <tr><td>Ícone na tela inicial</td><td>❌ só favorito</td><td>✅ instalável (manifest)</td></tr>
            <tr><td>Janela própria</td><td>❌ aba com barra de endereço</td><td>✅ standalone</td></tr>
            <tr><td>Dados locais</td><td>⚠️ some ao limpar</td><td>✅ IndexedDB + storage persistente</td></tr>
            <tr><td>Atualização</td><td>🔄 a cada visita</td><td>✅ controlada (toast “nova versão”)</td></tr>
            <tr><td>Atalhos / badge / compartilhar</td><td>❌</td><td>✅ shortcuts, Badging, Web Share</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
