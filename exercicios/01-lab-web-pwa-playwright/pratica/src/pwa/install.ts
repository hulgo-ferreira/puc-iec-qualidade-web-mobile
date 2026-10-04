// src/pwa/install.ts
//
// Instalação da PWA. O navegador dispara `beforeinstallprompt` quando o app
// é "instalável" (manifest válido + Service Worker + HTTPS). Guardamos o
// evento e chamamos .prompt() quando o USUÁRIO clica no nosso botão —
// é isso que diferencia um site de um app instalado: ícone na tela inicial,
// janela própria (display: standalone), sem barra de endereço.
//
// Só Chromium (Chrome/Edge/Android) dispara o evento. No Safari/iOS a
// instalação é manual (Compartilhar → Adicionar à Tela de Início) —
// por isso o botão é detectado por recurso, nunca por user-agent.

import { useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
let snapshot = { canInstall: false, installed: false };
const refresh = () => {
  snapshot = { canInstall: deferred !== null, installed };
  emit();
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // segura o mini-infobar: quem decide quando mostrar somos nós
    deferred = e as BeforeInstallPromptEvent;
    refresh();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    refresh();
  });
}

/** Rodando como app instalado (janela standalone) e não numa aba do navegador? */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable';
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  refresh();
  return outcome;
}

export function useInstall() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => snapshot,
  );
}
