// src/pwa/share.ts
//
// Web Share API: abre o menu NATIVO de compartilhar do sistema (WhatsApp,
// e-mail, AirDrop…). Disponível em mobile e em alguns desktops; onde não
// existe, copiamos o link (fallback) — sempre feature-detect.

export const canShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export async function shareMovie(title: string, url = location.href): Promise<'shared' | 'copied' | 'failed'> {
  const text = `Olha esse filme que achei no CineFav: ${title}`;
  try {
    if (canShare()) {
      await navigator.share({ title, text, url });
      return 'shared';
    }
    await navigator.clipboard.writeText(`${text} — ${url}`);
    return 'copied';
  } catch {
    return 'failed'; // usuário cancelou o menu ou clipboard bloqueado
  }
}
