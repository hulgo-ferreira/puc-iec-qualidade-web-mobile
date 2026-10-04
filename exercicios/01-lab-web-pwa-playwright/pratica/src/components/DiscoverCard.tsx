// src/components/DiscoverCard.tsx
//
// Card da listagem /  — só exibe, não busca comentários (isso mora no
// detalhe, DiscoverDetail.tsx — mesmo padrão do MovieCard.tsx/MovieDetail.tsx).

import { Link } from 'react-router-dom';
import type { TMDBMovie } from '@/services/tmdb';
import { posterUrl } from '@/services/tmdb';
import { testIDs } from '@/utils/testIDs';
import Poster from './Poster';

interface Props {
  movie: TMDBMovie;
}

export default function DiscoverCard({ movie }: Props) {
  const url = posterUrl(movie.poster_path);

  return (
    <article className="movie-card" data-testid={testIDs.discover.card(movie.id)}>
      <Link to={`/discover/${movie.id}`} aria-label={`Detalhes de ${movie.title}`}>
        {url ? (
          <img className="poster" src={url} alt={`Pôster de ${movie.title}`} loading="lazy" />
        ) : (
          <Poster title={movie.title} />
        )}
      </Link>
      <div className="movie-card-body">
        <h3 className="movie-card-title" data-testid={testIDs.discover.title(movie.id)}>
          {movie.title}
        </h3>
        <div className="movie-card-meta">
          <span className="rating">⭐ {movie.vote_average.toFixed(1)}</span>
          <span>{(movie.release_date || '').slice(0, 4)}</span>
        </div>
      </div>
    </article>
  );
}
