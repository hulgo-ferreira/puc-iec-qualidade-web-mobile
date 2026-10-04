// src/pwa/update.ts
//
// Ciclo de vida do Service Worker. Com `registerType: 'prompt'` o SW novo
// FICA ESPERANDO (waiting) em vez de trocar sozinho no meio do uso — o app
// avisa "nova versão disponível" e o usuário escolhe quando atualizar.
//
//   instalou o 1º SW   → onOfflineReady  ("pronto pra usar offline")
//   achou versão nova  → onNeedRefresh   (mostra o toast "Atualizar")

import { useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';

type Status = { needRefresh: boolean; offlineReady: boolean };
let status: Status = { needRefresh: false, offlineReady: false };
const listeners = new Set<() => void>();
const set = (next: Partial<Status>) => {
  status = { ...status, ...next };
  listeners.forEach((l) => l());
};

let updateSW: ((reload?: boolean) => Promise<void>) | undefined;

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  updateSW = registerSW({
    onNeedRefresh: () => set({ needRefresh: true }),
    onOfflineReady: () => set({ offlineReady: true }),
    // Procura versão nova a cada hora (app instalado pode ficar dias aberto).
    onRegisteredSW(_url, reg) {
      if (reg) setInterval(() => void reg.update(), 60 * 60 * 1000);
    },
  });
}

export const applyUpdate = () => updateSW?.(true);
export const dismissUpdate = () => set({ needRefresh: false, offlineReady: false });

export function useUpdateStatus(): Status {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => status,
    () => status,
  );
}
