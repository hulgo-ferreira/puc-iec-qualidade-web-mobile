// Esqueleto de carregamento: mantém o layout no lugar enquanto a API responde
// (sem "pulo" de tela — melhora o CLS que o Lighthouse mede).
export default function Skeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="skeleton-grid" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}
