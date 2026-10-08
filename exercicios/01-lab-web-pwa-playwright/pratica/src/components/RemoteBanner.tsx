import { useEffect, useState } from 'react';
import { fetchBannerMessage } from '@/services/remoteConfig';
import { testIDs } from '@/utils/testIDs';

// Banner controlado pelo Firebase Remote Config (parâmetro `banner_message`).
// Consulta de novo a cada 15 s (e quando a aba volta ao foco): o professor muda
// o texto no console do Firebase e TODOS os apps abertos atualizam, sem F5 e sem novo deploy.
const POLL_MS = 15_000;

export default function RemoteBanner() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => fetchBannerMessage().then((m) => alive && setMessage(m));
    load();
    const timer = setInterval(load, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!message) return null;
  return (
    <div className="remote-banner" data-testid={testIDs.shell.remoteBanner} role="status">
      {message}
    </div>
  );
}
