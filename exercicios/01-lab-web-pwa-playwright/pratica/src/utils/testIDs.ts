// src/utils/testIDs.ts
//
// Convenção centralizada de data-testid do CineFav Web.
//
// Padrão: `<tela>-<elemento>-<acao?>`
//   login-email-input · movie-card-603 · movie-card-heart-603 · favorites-count
//
// São os MESMOS ids do CineFav mobile (Lab Maestro) — um produto, duas
// plataformas, uma convenção de seletores.
//
// Uso no app:   <button data-testid={testIDs.movieCard.heart(movie.id)} />
// Uso no spec:  page.getByTestId('movie-card-heart-603')

export const testIDs = {
  login: {
    screen: 'login-screen',
    emailInput: 'login-email-input',
    passwordInput: 'login-password-input',
    submit: 'login-submit-button',
    error: 'login-error-message',
  },

  movieList: {
    screen: 'movielist-screen',
    searchButton: 'movielist-search-button',
    favoritesButton: 'movielist-favorites-button',
    loading: 'movielist-loading',
    list: 'movielist-grid',
    error: 'movielist-error',
    retry: 'movielist-retry-button',
    loadMore: 'movielist-load-more-button',
  },

  movieCard: {
    card: (id: number) => `movie-card-${id}`,
    title: (id: number) => `movie-card-title-${id}`,
    heart: (id: number) => `movie-card-heart-${id}`,
  },

  movieDetail: {
    screen: 'detail-screen',
    back: 'detail-back-button',
    title: 'detail-title',
    favoriteButton: 'detail-favorite-button',
  },

  search: {
    screen: 'search-screen',
    input: 'search-input',
    clear: 'search-clear-button',
    result: (id: number) => `search-result-${id}`,
    empty: 'search-empty',
  },

  favorites: {
    screen: 'favorites-screen',
    count: 'favorites-count',
    item: (id: number) => `favorites-item-${id}`,
    removeItem: (id: number) => `favorites-item-${id}-remove`,
    empty: 'favorites-empty',
  },

  discover: {
    screen: 'discover-screen',
    loading: 'discover-loading',
    error: 'discover-error',
    retry: 'discover-retry-button',
    grid: 'discover-grid',
    card: (id: number) => `discover-card-${id}`,
    title: (id: number) => `discover-title-${id}`,
    loadMore: 'discover-load-more-button',
  },

  discoverDetail: {
    screen: 'discover-detail-screen',
    back: 'discover-detail-back-button',
    loading: 'discover-detail-loading',
    title: 'discover-detail-title',
    notFound: 'discover-detail-not-found',
    reviewsButton: 'discover-reviews-button',
    reviewsList: 'discover-reviews-list',
    reviewsEmpty: 'discover-reviews-empty',
    reviewItem: (reviewId: string) => `discover-review-${reviewId}`,
  },

  shell: {
    offlineBanner: 'offline-banner',
    remoteBanner: 'remote-banner',
    routeLoading: 'route-loading',
    errorBoundary: 'error-boundary',
  },
} as const;

export type TestIDs = typeof testIDs;
