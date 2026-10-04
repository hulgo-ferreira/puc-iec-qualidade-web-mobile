// src/pwa/badge.ts
//
// Badging API: número no ÍCONE do app instalado (como o contador de
// mensagens não lidas). Só existe com a PWA instalada (Chromium); fora disso
// a função não faz nada — progressive enhancement.

type BadgeNav = Navigator & {
  setAppBadge?: (n?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

export const badgeSupported = () => typeof navigator !== 'undefined' && 'setAppBadge' in navigator;

export async function setBadge(count: number): Promise<void> {
  const nav = navigator as BadgeNav;
  try {
    if (count > 0) await nav.setAppBadge?.(count);
    else await nav.clearAppBadge?.();
  } catch {
    /* sem permissão / não instalado: ignora */
  }
}
