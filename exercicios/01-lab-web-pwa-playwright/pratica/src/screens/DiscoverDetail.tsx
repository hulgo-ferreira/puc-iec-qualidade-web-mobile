// src/screens/DiscoverDetail.tsx
//
// Detalhe de um filme do TMDB real (espelha MovieDetail.tsx, mas busca
// api.themoviedb.org em vez do catálogo mockado). "Ver comentários" mora
// AQUI, não no card da listagem — mesmo padrão do /qa (lista enxuta,
// detalhe tem o resto).

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backdropUrl, getMovieDetail, getMovieReviews, posterUrl, type TMDBMovie, type TMDBReview } from '@/services/tmdb';
import { shareMovie } from '@/pwa/share';
import CommentsBox from '@/components/CommentsBox';
import { testIDs } from '@/utils/testIDs';
import Poster from '@/components/Poster';

type ReviewsState = 'closed' | 'loading' | 'open' | 'error';

export default function DiscoverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [reviewsState, setReviewsState] = useState<ReviewsState>('closed');
  const [reviews, setReviews] = useState<TMDBReview[]>([]);

  useEffect(() => {
    setMovie(null);
    setNotFound(false);
    setReviewsState('closed');
    getMovieDetail(Number(id))
      .then(setMovie)
      .catch(() => setNotFound(true));
  }, [id]);

  const toggleReviews = useCallback(() => {
    if (reviewsState === 'open') {
      setReviewsState('closed');
      return;
    }
    setReviewsState('loading');
    getMovieReviews(Number(id))
      .then((data) => {
        setReviews(data);
        setReviewsState('open');
      })
      .catch(() => setReviewsState('error'));
  }, [id, reviewsState]);

  const url = movie ? posterUrl(movie.poster_path) : null;
  const backdrop = movie ? backdropUrl(movie.backdrop_path) : null;
  const [shareMsg, setShareMsg] = useState('');

  return (
    <main data-testid={testIDs.discoverDetail.screen}>
      <header className="app-header">
        <button
          className="icon-button"
          data-testid={testIDs.discoverDetail.back}
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>
        <h1>Detalhes</h1>
      </header>

      <div className="screen-body">
        {!movie && !notFound && (
          <div className="state-block" data-testid={testIDs.discoverDetail.loading}>
            Carregando…
          </div>
        )}

        {notFound && (
          <div className="state-block" data-testid={testIDs.discoverDetail.notFound}>
            Filme não encontrado.
          </div>
        )}

        {movie && backdrop && (
          <div className="detail-backdrop" style={{ backgroundImage: `url(${backdrop})` }} aria-hidden />
        )}

        {movie && (
          <div className="detail-hero">
            {url ? (
              <img className="poster" src={url} alt={`Pôster de ${movie.title}`} />
            ) : (
              <Poster title={movie.title} />
            )}
            <div className="detail-info">
              <h2 data-testid={testIDs.discoverDetail.title}>{movie.title}</h2>
              <p className="detail-meta">
                {(movie.release_date || '').slice(0, 4)} · ⭐ {movie.vote_average.toFixed(1)}
              </p>
              {movie.genres && movie.genres.length > 0 && (
                <ul className="genre-tags" data-testid={testIDs.detailExtras.genres}>
                  {movie.genres.map((g) => (
                    <li key={g.id}>{g.name}</li>
                  ))}
                </ul>
              )}
              <p>{movie.overview}</p>

              <div className="detail-actions">
                <button
                  className="icon-button"
                  data-testid={testIDs.detailExtras.share}
                  onClick={() => void shareMovie(movie.title).then((r) => setShareMsg(r === 'copied' ? 'Link copiado ✓' : ''))}
                >
                  🔗 Compartilhar
                </button>
                {shareMsg && <span className="muted" role="status">{shareMsg}</span>}
              </div>

              <button
                className="icon-button reviews-toggle"
                data-testid={testIDs.discoverDetail.reviewsButton}
                onClick={toggleReviews}
              >
                {reviewsState === 'open' ? '▲ Fechar comentários' : '💬 Ver comentários'}
              </button>

              {reviewsState === 'loading' && <p>Carregando comentários…</p>}
              {reviewsState === 'error' && <p>Não foi possível carregar os comentários.</p>}

              {reviewsState === 'open' && reviews.length === 0 && (
                <p data-testid={testIDs.discoverDetail.reviewsEmpty}>Sem comentários ainda nesse filme.</p>
              )}

              {reviewsState === 'open' && reviews.length > 0 && (
                <ul className="reviews-list" data-testid={testIDs.discoverDetail.reviewsList}>
                  {reviews.slice(0, 5).map((r) => (
                    <li key={r.id} data-testid={testIDs.discoverDetail.reviewItem(r.id)}>
                      <strong>{r.author}</strong>
                      {r.author_details.rating ? ` — ⭐ ${r.author_details.rating}` : ''}
                      <p>{r.content.length > 400 ? `${r.content.slice(0, 400)}…` : r.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {movie && <CommentsBox movieKey={`tmdb-${movie.id}`} />}
      </div>
    </main>
  );
}
