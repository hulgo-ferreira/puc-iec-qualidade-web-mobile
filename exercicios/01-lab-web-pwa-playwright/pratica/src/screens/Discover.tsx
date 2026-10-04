// src/screens/Discover.tsx
//
// Tela PRINCIPAL do app (rota "/") — busca da API real do TMDB
// (src/services/tmdb.ts), com pôster e comentários reais. O catálogo
// mockado/offline original foi pra "/qa" (MovieList.tsx) — é lá que os
// specs 01-05 (avaliativos, deterministicos) continuam rodando.
//
// Extras (não mudam o contrato dos specs): busca no TMDB com debounce,
// filtro por gênero, ordenação, scroll infinito (além do botão "Carregar
// mais") e aviso quando os dados vêm do banco offline (IndexedDB).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GENRES, getDiscoverMovies, searchTMDB, type DiscoverPage, type TMDBMovie } from '@/services/tmdb';
import { testIDs } from '@/utils/testIDs';
import DiscoverCard from '@/components/DiscoverCard';
import Skeleton from '@/components/Skeleton';

type Status = 'loading' | 'ready' | 'error';
type SortKey = 'popular' | 'rating' | 'newest' | 'az';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Populares' },
  { key: 'rating', label: 'Melhor nota' },
  { key: 'newest', label: 'Mais novos' },
  { key: 'az', label: 'A–Z' },
];

export default function Discover() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cachedAt, setCachedAt] = useState<number | undefined>();

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState<SortKey>('popular');
  const [genre, setGenre] = useState<number | 'all'>('all');

  // debounce da busca: dispara depois de 350 ms sem digitar (sem flood de fetch)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const fetchPage = useCallback(
    (p: number): Promise<DiscoverPage> => (debounced ? searchTMDB(debounced, p) : getDiscoverMovies(p)),
    [debounced],
  );

  const load = useCallback(() => {
    setStatus('loading');
    setPage(1);
    setGenre('all');
    fetchPage(1)
      .then(({ movies: data, hasMore: more, cachedAt: saved }) => {
        setMovies(data);
        setHasMore(more);
        setCachedAt(saved);
        setStatus('ready');
      })
      .catch((err: Error) => {
        setErrorMessage(err.message);
        setStatus('error');
      });
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    const next = page + 1;
    setLoadingMore(true);
    fetchPage(next)
      .then(({ movies: data, hasMore: more }) => {
        setMovies((prev) => [...prev, ...data]);
        setHasMore(more);
        setPage(next);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  }, [page, fetchPage]);

  useEffect(() => {
    load();
  }, [load]);

  // Scroll infinito: quando a "sentinela" abaixo do grid entra na tela, carrega a próxima página.
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loadingMore || status !== 'ready' || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadingMore, status, loadMore]);

  // chips de gênero: só os que existem nos filmes já carregados
  const genreChips = useMemo(() => {
    const ids = new Set<number>();
    movies.forEach((m) => m.genre_ids?.forEach((g) => GENRES[g] && ids.add(g)));
    return [...ids].sort((a, b) => GENRES[a].localeCompare(GENRES[b]));
  }, [movies]);

  const visible = useMemo(() => {
    const list = genre === 'all' ? movies : movies.filter((m) => m.genre_ids?.includes(genre));
    const sorted = [...list];
    if (sort === 'rating') sorted.sort((a, b) => b.vote_average - a.vote_average);
    if (sort === 'newest') sorted.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
    if (sort === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [movies, genre, sort]);

  return (
    <main data-testid={testIDs.discover.screen}>
      <header className="app-header">
        <h1>
          <span className="logo-mark">★</span> CineFav
        </h1>
        <button className="icon-button" onClick={() => navigate('/pwa')}>
          📲 Raio-X PWA
        </button>
        <button className="icon-button" onClick={() => navigate('/qa')}>
          🧪 Ambiente QA (busca, favoritos, testes)
        </button>
      </header>

      <div className="screen-body">
        <div className="toolbar">
          <input
            data-testid={testIDs.discoverTools.search}
            type="search"
            placeholder="Buscar no TMDB…"
            aria-label="Buscar filmes no TMDB"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="chips" role="group" aria-label="Ordenar">
            {SORTS.map((s) => (
              <button
                key={s.key}
                className="chip"
                aria-pressed={sort === s.key}
                data-testid={testIDs.discoverTools.sort(s.key)}
                onClick={() => setSort(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
          {genreChips.length > 0 && (
            <div className="chips" role="group" aria-label="Gênero">
              <button
                className="chip"
                aria-pressed={genre === 'all'}
                data-testid={testIDs.discoverTools.genre('all')}
                onClick={() => setGenre('all')}
              >
                Todos
              </button>
              {genreChips.map((g) => (
                <button
                  key={g}
                  className="chip"
                  aria-pressed={genre === g}
                  data-testid={testIDs.discoverTools.genre(g)}
                  onClick={() => setGenre(g)}
                >
                  {GENRES[g]}
                </button>
              ))}
            </div>
          )}
        </div>

        {status === 'ready' && cachedAt && (
          <p className="cache-note" role="status" data-testid={testIDs.discoverTools.fromCache}>
            📦 Sem conexão — mostrando dados salvos no aparelho às{' '}
            {new Date(cachedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
          </p>
        )}

        {status === 'loading' && (
          <div className="state-block" data-testid={testIDs.discover.loading}>
            Buscando no TMDB…
            <Skeleton />
          </div>
        )}

        {status === 'error' && (
          <div className="state-block" data-testid={testIDs.discover.error}>
            <p>{errorMessage}</p>
            <button data-testid={testIDs.discover.retry} onClick={load}>
              Tentar de novo
            </button>
          </div>
        )}

        {status === 'ready' && (
          <>
            {visible.length === 0 && (
              <div className="state-block" data-testid={testIDs.discoverTools.empty}>
                Nenhum filme encontrado{debounced ? ` pra “${debounced}”` : ''}.
              </div>
            )}
            <div className="movie-grid" data-testid={testIDs.discover.grid}>
              {visible.map((movie) => (
                <DiscoverCard key={movie.id} movie={movie} />
              ))}
            </div>
            {hasMore && (
              <>
                <div ref={sentinel} data-testid={testIDs.discoverTools.sentinel} aria-hidden style={{ height: 1 }} />
                <button
                  className="load-more-button"
                  data-testid={testIDs.discover.loadMore}
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Carregando…' : 'Carregar mais'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
