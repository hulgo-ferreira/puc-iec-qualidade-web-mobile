import { useState, type FormEvent } from 'react';
import { currentUser } from '@/store/auth';
import { addComment, useComments } from '@/store/comments';
import { testIDs } from '@/utils/testIDs';

interface Props {
  /** Chave única do filme: "qa-603" (catálogo fixo) ou "tmdb-603" (TMDB). */
  movieKey: string;
}

// Comentários do usuário — guardados no IndexedDB, com fila offline
// (veja store/comments.ts). Escreva sem rede: fica ⏳ e sincroniza sozinho.
export default function CommentsBox({ movieKey }: Props) {
  const comments = useComments(movieKey);
  const [text, setText] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const author = currentUser()?.email.split('@')[0] ?? 'você';
    setText('');
    await addComment(movieKey, text, author);
  }

  return (
    <section className="comments-box" data-testid={testIDs.comments.box} aria-label="Seus comentários">
      <h3>Seus comentários</h3>
      <form onSubmit={submit} className="comment-form">
        <input
          data-testid={testIDs.comments.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="O que você achou do filme?"
          aria-label="Escrever comentário"
          maxLength={280}
        />
        <button type="submit" data-testid={testIDs.comments.submit} disabled={!text.trim()}>
          Publicar
        </button>
      </form>
      {comments.length === 0 && (
        <p className="muted" data-testid={testIDs.comments.empty}>
          Nenhum comentário seu ainda. Funciona até sem internet — fica na fila e sincroniza depois.
        </p>
      )}
      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id} data-testid={testIDs.comments.item(c.id)}>
            <div className="comment-head">
              <strong>{c.author}</strong>
              <span
                className={`comment-status ${c.status}`}
                data-testid={testIDs.comments.status(c.id)}
                data-status={c.status}
              >
                {c.status === 'pending' ? '⏳ na fila (offline)' : '✓ enviado'}
              </span>
            </div>
            <p>{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
