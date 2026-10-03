import { useEffect, useState } from 'react';
import { fetchBannerMessage } from '@/services/remoteConfig';
import { testIDs } from '@/utils/testIDs';

// Banner controlado pelo Firebase Remote Config (parâmetro `banner_message`).
export default function RemoteBanner() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchBannerMessage().then((m) => alive && setMessage(m));
    return () => {
      alive = false;
    };
  }, []);

  if (!message) return null;
  return (
    <div className="remote-banner" data-testid={testIDs.shell.remoteBanner} role="status">
      {message}
    </div>
  );
}
