// src/services/remoteConfig.ts
//
// Firebase Remote Config via REST — SEM SDK, só um fetch. O banner do topo vem do
// parâmetro `banner_message` configurado no console do Firebase (muda sem novo deploy).
//
// Só roda se as 3 variáveis VITE_FIREBASE_* estiverem no .env (ver .env.example).
// Sem credencial, o app se comporta como sempre (nenhuma chamada de rede extra).

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

export const remoteConfigEnabled = Boolean(projectId && apiKey && appId);

export async function fetchBannerMessage(): Promise<string | null> {
  if (!remoteConfigEnabled) return null;
  try {
    const res = await fetch(
      `https://firebaseremoteconfig.googleapis.com/v1/projects/${projectId}/namespaces/firebase:fetch?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, appInstanceId: 'cinefav-web' }),
      },
    );
    if (!res.ok) return null; // rede/credencial ruim → app segue sem banner
    const data = (await res.json()) as { entries?: Record<string, string> };
    return data.entries?.banner_message ?? null;
  } catch {
    return null;
  }
}
