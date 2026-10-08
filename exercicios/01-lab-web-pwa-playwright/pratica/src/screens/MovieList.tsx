import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '@/types/movie';
import { getPopularMovies } from '@/services/api';
import { testIDs } from '@/utils/testIDs';
import MovieCard from '@/components/MovieCard';
import LogoutButton from '@/components/LogoutButton';

type Status = 'loading' | 'ready' | 'error';

export default function MovieList() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Carrega a página 1 (reset). Usado no mount e no "Tentar de novo".
  const load = useCallback(() => {
    setStatus('loading');
    setPage(1);
    getPopularMovies(1)
      .then(({ movies: data, hasMore: more }) => {
        setMovies(data);
        setHasMore(more);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  // "Carregar mais" — soma a próxima página na lista já carregada.
  const loadMore = useCallback(() => {
    const next = page + 1;
    setLoadingMore(true);
    getPopularMovies(next)
      .then(({ movies: data, hasMore: more }) => {
        setMovies((prev) => [...prev, ...data]);
        setHasMore(more);
        setPage(next);
      })
      .finally(() => setLoadingMore(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main data-testid={testIDs.movieList.screen}>
      <header className="app-header">
        <h1>
          <span className="logo-mark">★</span> CineFav <small>— Ambiente QA</small>
        </h1>
        <button
          className="icon-button"
          data-testid={testIDs.movieList.searchButton}
          onClick={() => navigate('/search')}
        >
          🔍 Buscar
        </button>
        <button
          className="icon-button"
          data-testid={testIDs.movieList.favoritesButton}
          onClick={() => navigate('/favorites')}
        >
          ❤️ Favoritos
        </button>
        <button className="icon-button" onClick={() => navigate('/')}>
          ← Tela principal
        </button>
        <LogoutButton />
      </header>

      <p className="qa-note">
        Ambiente de QA: catálogo fixo, 100% offline, sem token — é aqui que os specs 01-05 rodam.
      </p>

      <div className="screen-body">
        {status === 'loading' && (
          <div className="state-block" data-testid={testIDs.movieList.loading}>
            Carregando filmes…
          </div>
        )}

        {status === 'error' && (
          <div className="state-block" data-testid={testIDs.movieList.error}>
            <p>Não foi possível carregar o catálogo.</p>
            <button data-testid={testIDs.movieList.retry} onClick={load}>
              Tentar de novo
            </button>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="movie-grid" data-testid={testIDs.movieList.list}>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            {hasMore && (
              <button
                className="load-more-button"
                data-testid={testIDs.movieList.loadMore}
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Carregando…' : 'Carregar mais'}
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
