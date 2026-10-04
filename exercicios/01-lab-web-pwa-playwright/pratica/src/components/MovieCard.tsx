import { Link } from 'react-router-dom';
import type { Movie } from '@/types/movie';
import { testIDs } from '@/utils/testIDs';
import { toggleFavorite, useFavorites } from '@/store/favorites';
import Poster from './Poster';

interface Props {
  movie: Movie;
}

export default function MovieCard({ movie }: Props) {
  const favorites = useFavorites();
  const favorite = favorites.includes(movie.id);

  return (
    <article className="movie-card" data-testid={testIDs.movieCard.card(movie.id)}>
      <Link to={`/movie/${movie.id}`} aria-label={`Detalhes de ${movie.title}`}>
        <Poster title={movie.title} />
      </Link>
      <div className="movie-card-body">
        <h3 className="movie-card-title" data-testid={testIDs.movieCard.title(movie.id)}>
          {movie.title}
        </h3>
        <div className="movie-card-meta">
          <span className="rating">⭐ {movie.vote_average.toFixed(1)}</span>
          <button
            className="heart-button"
            data-testid={testIDs.movieCard.heart(movie.id)}
            aria-label={favorite ? `Remover ${movie.title} dos favoritos` : `Favoritar ${movie.title}`}
            aria-pressed={favorite}
            onClick={() => toggleFavorite(movie.id)}
          >
            {favorite ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </article>
  );
}
