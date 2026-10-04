// src/store/comments.ts
//
// Comentários do usuário, guardados no IndexedDB (src/services/db.ts) com
// FILA OFFLINE: escrever sem rede não perde nada.
//
//   online  → status "synced"  (✓ enviado)
//   offline → status "pending" (⏳ na fila) — vira "synced" quando a rede volta
//
// Não existe backend neste lab: o "servidor" é SIMULADO (um delay), igual à
// fonte remota simulada do lab Flutter. O que interessa é o PADRÃO:
// gravar local primeiro, sincronizar depois (outbox / offline-first).

import { useEffect, useSyncExternalStore } from 'react';
import { dbGet, dbSet } from '@/services/db';

export interface LocalComment {
  id: string;
  text: string;
  author: string;
  createdAt: number;
  status: 'pending' | 'synced';
}

const KEY = (movieKey: string) => `comments:${movieKey}`;
const EMPTY: LocalComment[] = [];

const cache = new Map<string, LocalComment[]>();
const loading = new Set<string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function load(movieKey: string) {
  if (cache.has(movieKey) || loading.has(movieKey)) return;
  loading.add(movieKey);
  cache.set(movieKey, (await dbGet<LocalComment[]>(KEY(movieKey))) ?? EMPTY);
  loading.delete(movieKey);
  emit();
}

// Grava no IndexedDB ANTES de mostrar na tela: o que o usuário vê já está
// durável (se fechar a aba agora, nada se perde).
async function persist(movieKey: string, list: LocalComment[]) {
  await dbSet(KEY(movieKey), list);
  cache.set(movieKey, list);
  emit();
}

// "Servidor" simulado — troque por fetch() de verdade quando houver backend.
const fakeServer = () => new Promise<void>((resolve) => setTimeout(resolve, 400));

/** Envia os pendentes de UM filme (chamado ao voltar a rede). */
async function flush(movieKey: string) {
  const list = cache.get(movieKey) ?? (await dbGet<LocalComment[]>(KEY(movieKey))) ?? EMPTY;
  if (!list.some((c) => c.status === 'pending')) return;
  await fakeServer();
  const current = cache.get(movieKey) ?? list;
  await persist(
    movieKey,
    current.map((c) => (c.status === 'pending' ? { ...c, status: 'synced' as const } : c)),
  );
}

export async function addComment(movieKey: string, text: string, author: string) {
  await load(movieKey);
  const comment: LocalComment = {
    id: `c${Date.now()}${Math.floor(Math.random() * 1000)}`,
    text: text.trim(),
    author,
    createdAt: Date.now(),
    status: 'pending',
  };
  await persist(movieKey, [comment, ...(cache.get(movieKey) ?? EMPTY)]);
  if (navigator.onLine) await flush(movieKey);
}

export function useComments(movieKey: string): LocalComment[] {
  useEffect(() => {
    void load(movieKey);
    // Rede voltou → esvazia a fila deste filme.
    const onOnline = () => void flush(movieKey);
    window.addEventListener('online', onOnline);
    if (navigator.onLine) void flush(movieKey);
    return () => window.removeEventListener('online', onOnline);
  }, [movieKey]);

  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => cache.get(movieKey) ?? EMPTY,
    () => EMPTY,
  );
}
