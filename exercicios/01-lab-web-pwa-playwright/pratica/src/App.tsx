import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { currentUser } from '@/store/auth';
import { testIDs } from '@/utils/testIDs';
import ErrorBoundary from '@/components/ErrorBoundary';
import OfflineBanner from '@/components/OfflineBanner';
import RemoteBanner from '@/components/RemoteBanner';
import UpdateToast from '@/components/UpdateToast';
import { setBadge } from '@/pwa/badge';
import { useFavorites } from '@/store/favorites';
import Login from '@/screens/Login';
import Discover from '@/screens/Discover';
import MovieList from '@/screens/MovieList';

// Rotas secundárias em chunks separados (lazy loading — assunto da aula de SPA).
// Na primeira navegação o chunk é baixado e o fallback `route-loading` aparece.
const Search = lazy(() => import('@/screens/Search'));
const Favorites = lazy(() => import('@/screens/Favorites'));
const MovieDetail = lazy(() => import('@/screens/MovieDetail'));
const DiscoverDetail = lazy(() => import('@/screens/DiscoverDetail'));
const PwaPanel = lazy(() => import('@/screens/PwaPanel'));

function RequireAuth({ children }: { children: JSX.Element }) {
  if (!currentUser()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const favorites = useFavorites();

  // Badging API: contador de favoritos no ícone do app instalado.
  useEffect(() => {
    void setBadge(favorites.length);
  }, [favorites.length]);

  // Sinal de "app interativo": os testes esperam por este atributo em vez de
  // sleep arbitrário (estratégia de waiting — aula de SPA).
  useEffect(() => {
    document.documentElement.dataset.appReady = 'true';
  }, []);

  return (
    <ErrorBoundary>
      <OfflineBanner />
      <RemoteBanner />
      <UpdateToast />
      <Suspense
        fallback={
          <div className="route-loading" data-testid={testIDs.shell.routeLoading}>
            Carregando…
          </div>
        }
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Discover />
              </RequireAuth>
            }
          />
          {/* /discover = alias de '/' (compat com o spec 06 e link antigo) */}
          <Route
            path="/discover"
            element={
              <RequireAuth>
                <Discover />
              </RequireAuth>
            }
          />
          {/* /qa = o app estático/determinístico original (era '/') — usado
              pelos specs 01-05 (dado fixo, funciona offline, sem token). */}
          <Route
            path="/qa"
            element={
              <RequireAuth>
                <MovieList />
              </RequireAuth>
            }
          />
          <Route
            path="/search"
            element={
              <RequireAuth>
                <Search />
              </RequireAuth>
            }
          />
          <Route
            path="/favorites"
            element={
              <RequireAuth>
                <Favorites />
              </RequireAuth>
            }
          />
          <Route
            path="/movie/:id"
            element={
              <RequireAuth>
                <MovieDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/discover/:id"
            element={
              <RequireAuth>
                <DiscoverDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/pwa"
            element={
              <RequireAuth>
                <PwaPanel />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
