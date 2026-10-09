// src/store/auth.ts
//
// Autenticação do CineFav (didática — NÃO é segurança de produção).
//
// Duas fontes de contas, escolhidas por variável de ambiente:
//   • sem VITE_API_URL  → contas ficam no localStorage do navegador (padrão, zero setup)
//   • com VITE_API_URL  → contas ficam numa API de verdade (`npm run api`, banco em arquivo)
//
// A sessão ("quem está logado") é sempre o localStorage `cinefav-auth` — é
// exatamente o que o storageState do Playwright captura e reinjeta (auth.setup).
//
// A conta de demonstração `aluno@puc.br` / `1234` SEMPRE existe (os specs dependem dela).

const SESSION_KEY = 'cinefav-auth';
const USERS_KEY = 'cinefav-users';
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

export const VALID_EMAIL = 'aluno@puc.br';
export const VALID_PASSWORD = '1234';

export interface AuthUser {
  email: string;
  name?: string;
}

export type AuthResult = { ok: true; user: AuthUser } | { ok: false; error: string };

interface StoredUser {
  email: string;
  name: string;
  hash: string; // SHA-256 de "email:senha" — nunca guardamos a senha em texto puro
}

const normalize = (email: string) => email.trim().toLowerCase();

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as StoredUser[];
  } catch {
    return [];
  }
}

function startSession(user: AuthUser): AuthUser {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

// ── modo API ────────────────────────────────────────────────────────────────
async function callApi(path: string, body: unknown): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { user?: AuthUser; error?: string };
    if (res.ok && data.user) return { ok: true, user: startSession(data.user) };
    return { ok: false, error: data.error ?? 'Não foi possível concluir' };
  } catch {
    return { ok: false, error: 'API indisponível — rode `npm run api` (ou remova VITE_API_URL)' };
  }
}

// ── API pública ─────────────────────────────────────────────────────────────
export async function register(name: string, email: string, password: string): Promise<AuthResult> {
  const cleanName = name.trim();
  const cleanEmail = normalize(email);
  if (!cleanName) return { ok: false, error: 'Informe seu nome' };
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return { ok: false, error: 'E-mail inválido' };
  if (password.length < 4) return { ok: false, error: 'A senha precisa de pelo menos 4 caracteres' };

  if (API_URL) return callApi('/api/register', { name: cleanName, email: cleanEmail, password });

  if (cleanEmail === VALID_EMAIL || readUsers().some((u) => u.email === cleanEmail)) {
    return { ok: false, error: 'Já existe uma conta com esse e-mail' };
  }
  const hash = await sha256(`${cleanEmail}:${password}`);
  localStorage.setItem(USERS_KEY, JSON.stringify([...readUsers(), { email: cleanEmail, name: cleanName, hash }]));
  return { ok: true, user: startSession({ email: cleanEmail, name: cleanName }) };
}

export async function login(email: string, password: string): Promise<AuthUser | null> {
  const cleanEmail = normalize(email);

  if (API_URL && cleanEmail !== VALID_EMAIL) {
    const r = await callApi('/api/login', { email: cleanEmail, password });
    return r.ok ? r.user : null;
  }

  // conta de demonstração (sempre válida, inclusive no modo API)
  if (cleanEmail === VALID_EMAIL) {
    return password === VALID_PASSWORD ? startSession({ email: VALID_EMAIL, name: 'Aluno' }) : null;
  }

  const hash = await sha256(`${cleanEmail}:${password}`);
  const found = readUsers().find((u) => u.email === cleanEmail && u.hash === hash);
  return found ? startSession({ email: found.email, name: found.name }) : null;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function currentUser(): AuthUser | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
