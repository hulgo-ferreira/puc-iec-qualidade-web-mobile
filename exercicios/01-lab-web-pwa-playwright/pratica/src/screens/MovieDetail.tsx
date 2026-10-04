import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Movie } from '@/types/movie';
import { getMovieById } from '@/services/api';
import { toggleFavorite, useFavorites } from '@/store/favorites';
import { testIDs } from '@/utils/testIDs';
import Poster from '@/components/Poster';
import CommentsBox from '@/components/CommentsBox';
import { shareMovie } from '@/pwa/share';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const favorites = useFavorites();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getMovieById(Number(id))
      .then((m) => (m ? setMovie(m) : setNotFound(true)))
      .catch(() => setNotFound(true));
  }, [id]);

  const favorite = movie ? favorites.includes(movie.id) : false;

  return (
    <main data-testid={testIDs.movieDetail.screen}>
      <header className="app-header">
        <button
          className="icon-button"
          data-testid={testIDs.movieDetail.back}
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>
        <h1>Detalhes</h1>
      </header>

      <div className="screen-body">
        {notFound && <div className="state-block">Filme não encontrado.</div>}

        {movie && (
          <div className="detail-hero">
            <Poster title={movie.title} />
            <div className="detail-info">
              <h2 data-testid={testIDs.movieDetail.title}>{movie.title}</h2>
              <p className="detail-meta">
                {movie.release_date.slice(0, 4)} · ⭐ {movie.vote_average.toFixed(1)}
              </p>
              <p>{movie.overview}</p>
              <div className="detail-actions">
                <button
                  className={favorite ? 'detail-favorite active' : 'detail-favorite'}
                  data-testid={testIDs.movieDetail.favoriteButton}
                  aria-pressed={favorite}
                  onClick={() => toggleFavorite(movie.id)}
                >
                  {favorite ? '❤️ Nos favoritos' : '🤍 Favoritar'}
                </button>
                <button className="icon-button" onClick={() => void shareMovie(movie.title)}>
                  🔗 Compartilhar
                </button>
              </div>
            </div>
          </div>
        )}

        {movie && <CommentsBox movieKey={`qa-${movie.id}`} />}
      </div>
    </main>
  );
}
