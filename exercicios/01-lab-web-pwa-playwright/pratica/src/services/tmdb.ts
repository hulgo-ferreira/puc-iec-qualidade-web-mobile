// src/services/tmdb.ts
//
// Ao contrário de services/api.ts (catálogo mockado local, usado em /qa),
// este serviço bate numa API EXTERNA de verdade: api.themoviedb.org — é o
// que alimenta a tela principal ("/"). Também serve pra praticar network
// mocking "real": interceptar um domínio de terceiro com page.route(), não
// um fetch same-origin. Precisa de VITE_TMDB_TOKEN (veja .env.example) pra
// uso manual; os specs (06-discover-tmdb.spec.ts) nunca dependem do token,
// pois mockam a chamada antes dela sair pra rede. Não faz parte da rubrica
// dos 20pts (que roda em /qa).

import type { Movie } from '@/types/movie';
import { dbGet, dbSet } from '@/services/db';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

// Tipo próprio (não o Movie mockado) — TMDB real traz poster_path, que
// vira a URL do pôster de verdade (/discover é a única tela com imagem
// real; o resto do app usa Poster.tsx por design — ver comentário lá).
export interface TMDBMovie extends Movie {
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
}

interface TMDBMoviesResponse {
  results: TMDBMovie[];
  page?: number;
  total_pages?: number;
}

export interface DiscoverPage {
  movies: TMDBMovie[];
  hasMore: boolean;
  /** Preenchido quando a resposta veio do banco offline (sem rede): quando foi salva. */
  cachedAt?: number;
}

export interface TMDBReview {
  id: string;
  author: string;
  content: string;
  author_details: { rating: number | null };
}

interface TMDBReviewsResponse {
  results: TMDBReview[];
}

export function posterUrl(path?: string | null): string | null {
  return path ? `${POSTER_BASE}${path}` : null;
}

export function backdropUrl(path?: string | null): string | null {
  return path ? `https://image.tmdb.org/t/p/w780${path}` : null;
}

// Gêneros do TMDB (ids estáveis) — evita uma chamada /genre/movie/list.
export const GENRES: Record<number, string> = {
  28: 'Ação', 12: 'Aventura', 16: 'Animação', 35: 'Comédia', 80: 'Crime', 99: 'Documentário',
  18: 'Drama', 10751: 'Família', 14: 'Fantasia', 36: 'História', 27: 'Terror', 10402: 'Música',
  9648: 'Mistério', 10749: 'Romance', 878: 'Ficção científica', 53: 'Thriller', 10752: 'Guerra',
  37: 'Faroeste',
};

// Sem VITE_TMDB_TOKEN: a chamada sai do mesmo jeito (sem auth) — em uso
// manual real, o TMDB responde 401 e cai no !res.ok de quem chama. Em
// teste, o page.route() intercepta ANTES disso (não depende do token).
//
// TMDB tem 2 formatos de credencial (a página de Settings → API mostra os
// dois): "API Read Access Token" (v4, JWT longo, começa com eyJ) vai no
// header Authorization; "API Key" (v3, 32 chars hex) vai como query param
// ?api_key=. Detecta automaticamente pra aceitar qualquer um que o aluno
// copiar.
async function tmdbFetch(path: string, page = 1, extra: Record<string, string> = {}): Promise<Response> {
  const token = import.meta.env.VITE_TMDB_TOKEN as string | undefined;
  const isV4 = !!token && token.startsWith('eyJ');

  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('page', String(page));
  for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);
  if (token && !isV4) url.searchParams.set('api_key', token);

  const res = await fetch(url.toString(), {
    headers: isV4 ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? 'Token TMDB ausente ou inválido — veja .env.example.'
        : `TMDB respondeu HTTP ${res.status}`,
    );
  }
  return res;
}

// ── Banco offline (IndexedDB) ────────────────────────────────────────────────
// Padrão "rede primeiro, banco como plano B":
//   • rede OK        → devolve o dado fresco e GRAVA no IndexedDB
//   • sem rede       → fetch rejeita com TypeError → devolve o último dado gravado
//   • erro HTTP/401  → NÃO cai no banco (é erro de verdade, o usuário precisa ver)
// A chave NÃO inclui o token (nunca grave segredo em storage).
interface Saved<T> {
  data: T;
  savedAt: number;
}

async function cachedJson<T>(
  path: string,
  page = 1,
  extra: Record<string, string> = {},
): Promise<{ data: T; cachedAt?: number }> {
  const key = `tmdb:${path}?${new URLSearchParams({ page: String(page), ...extra })}`;
  try {
    const res = await tmdbFetch(path, page, extra);
    const data = (await res.json()) as T;
    void dbSet<Saved<T>>(key, { data, savedAt: Date.now() });
    return { data };
  } catch (err) {
    if (err instanceof TypeError) {
      const hit = await dbGet<Saved<T>>(key);
      if (hit) return { data: hit.data, cachedAt: hit.savedAt };
    }
    throw err;
  }
}

export async function getDiscoverMovies(page = 1): Promise<DiscoverPage> {
  const { data, cachedAt } = await cachedJson<TMDBMoviesResponse>('/movie/popular', page);
  const totalPages = data.total_pages ?? 1;
  return { movies: data.results, hasMore: page < totalPages, cachedAt };
}

export async function searchTMDB(query: string, page = 1): Promise<DiscoverPage> {
  const { data, cachedAt } = await cachedJson<TMDBMoviesResponse>('/search/movie', page, { query });
  const totalPages = data.total_pages ?? 1;
  return { movies: data.results, hasMore: page < totalPages, cachedAt };
}

export async function getMovieReviews(id: number): Promise<TMDBReview[]> {
  const { data } = await cachedJson<TMDBReviewsResponse>(`/movie/${id}/reviews`);
  return data.results;
}

export async function getMovieDetail(id: number): Promise<TMDBMovie> {
  const { data } = await cachedJson<TMDBMovie>(`/movie/${id}`);
  return data;
}
