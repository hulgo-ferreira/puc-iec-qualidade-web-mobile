import { applyUpdate, dismissUpdate, useUpdateStatus } from '@/pwa/update';
import { testIDs } from '@/utils/testIDs';

// Aparece quando um Service Worker novo está esperando (nova versão do app).
// Também confirma, uma vez, que o app já funciona offline.
export default function UpdateToast() {
  const { needRefresh, offlineReady } = useUpdateStatus();
  if (!needRefresh && !offlineReady) return null;
  return (
    <div className="update-toast" role="status" data-testid={testIDs.shell.updateToast}>
      <span>{needRefresh ? '✨ Nova versão do CineFav disponível.' : '✅ Pronto! O CineFav já funciona offline.'}</span>
      {needRefresh && (
        <button data-testid={testIDs.shell.updateButton} onClick={() => void applyUpdate()}>
          Atualizar
        </button>
      )}
      <button className="ghost" aria-label="Fechar aviso" onClick={dismissUpdate}>
        ✕
      </button>
    </div>
  );
}
