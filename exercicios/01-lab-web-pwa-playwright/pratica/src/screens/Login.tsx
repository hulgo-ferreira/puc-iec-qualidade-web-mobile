import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '@/store/auth';
import { testIDs } from '@/utils/testIDs';

// Duas telas no mesmo cartão: entrar (padrão, usada pelos specs) e criar conta.
type Mode = 'login' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const user = await login(email, password);
    setBusy(false);
    if (!user) {
      setError('E-mail ou senha inválidos');
      return;
    }
    navigate('/', { replace: true });
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await register(name, email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate('/', { replace: true });
  }

  if (mode === 'register') {
    return (
      <main className="login-screen" data-testid={testIDs.login.screen}>
        <form className="login-card" onSubmit={handleRegister}>
          <h1>
            <span className="logo-mark">★</span> Criar conta
          </h1>
          <label>
            Nome
            <input
              data-testid={testIDs.register.nameInput}
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              data-testid={testIDs.register.emailInput}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              data-testid={testIDs.register.passwordInput}
              placeholder="mínimo 4 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          {error && (
            <p className="login-error" data-testid={testIDs.register.error} role="alert">
              {error}
            </p>
          )}
          <button type="submit" data-testid={testIDs.register.submit} disabled={busy}>
            Criar conta e entrar
          </button>
          <button
            type="button"
            className="link-button"
            data-testid={testIDs.register.toggle}
            onClick={() => switchMode('login')}
          >
            Já tenho conta · entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="login-screen" data-testid={testIDs.login.screen}>
      <form className="login-card" onSubmit={handleLogin}>
        <h1>
          <span className="logo-mark">★</span> CineFav
        </h1>
        <label>
          E-mail
          <input
            type="email"
            data-testid={testIDs.login.emailInput}
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            data-testid={testIDs.login.passwordInput}
            placeholder="••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p className="login-error" data-testid={testIDs.login.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" data-testid={testIDs.login.submit} disabled={busy}>
          Entrar
        </button>
        <p className="login-hint">dica: aluno@puc.br / 1234</p>
        <button
          type="button"
          className="link-button"
          data-testid={testIDs.register.toggle}
          onClick={() => switchMode('register')}
        >
          Não tem conta? Criar conta
        </button>
      </form>
    </main>
  );
}
