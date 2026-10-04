// src/services/db.ts
//
// "Banco offline" do navegador: IndexedDB via idb-keyval (~1 KB, API de
// chave → valor). Guarda o que NÃO cabe bem no Cache Storage do Service
// Worker: dados que o app lê/escreve (respostas da API TMDB, comentários).
//
//   Cache Storage (SW) → arquivos e respostas HTTP "prontas" (shell, posters)
//   IndexedDB (app)    → dados estruturados que o app controla
//
// Tudo com try/catch: modo privado / quota cheia não pode derrubar o app.

import { createStore, del, get, keys, set, clear, type UseStore } from 'idb-keyval';

let store: UseStore | undefined;

function getStore(): UseStore | undefined {
  if (store) return store;
  try {
    if (typeof indexedDB === 'undefined') return undefined;
    store = createStore('cinefav', 'kv');
    return store;
  } catch {
    return undefined;
  }
}

export async function dbGet<T>(key: string): Promise<T | undefined> {
  try {
    const s = getStore();
    return s ? await get<T>(key, s) : undefined;
  } catch {
    return undefined;
  }
}

export async function dbSet<T>(key: string, value: T): Promise<void> {
  try {
    const s = getStore();
    if (s) await set(key, value, s);
  } catch {
    /* quota / modo privado: segue sem persistir */
  }
}

export async function dbDel(key: string): Promise<void> {
  try {
    const s = getStore();
    if (s) await del(key, s);
  } catch {
    /* noop */
  }
}

export async function dbKeys(): Promise<string[]> {
  try {
    const s = getStore();
    return s ? ((await keys(s)) as string[]) : [];
  } catch {
    return [];
  }
}

export async function dbClear(): Promise<void> {
  try {
    const s = getStore();
    if (s) await clear(s);
  } catch {
    /* noop */
  }
}
