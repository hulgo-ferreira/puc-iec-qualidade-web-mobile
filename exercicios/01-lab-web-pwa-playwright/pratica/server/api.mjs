// server/api.mjs — API de contas do CineFav (didática, zero dependências).
//
//   npm run api                       → http://localhost:3001
//   VITE_API_URL=http://localhost:3001 npm run dev      (o app passa a usar esta API)
//
// Banco: arquivo JSON (server/db.json — criado sozinho, fora do git).
// Senhas: scrypt com sal (nunca em texto puro). É um exemplo de AULA, não produção:
// sem rate limit, sem HTTPS, sem sessão/JWT.
import { createServer } from 'node:http';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3001);
const DB_FILE = fileURLToPath(new URL('./db.json', import.meta.url));

const load = () => (existsSync(DB_FILE) ? JSON.parse(readFileSync(DB_FILE, 'utf8')) : { users: [] });
const save = (db) => writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const hashPassword = (password, salt = randomBytes(16).toString('hex')) => ({
  salt,
  hash: scryptSync(password, salt, 32).toString('hex'),
});

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // o app (porta 5173/4173) chama de outra origem
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(body));
};

const readJson = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        resolve({});
      }
    });
  });

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/api/health') {
    return send(res, 200, { ok: true, users: load().users.length });
  }

  if (req.method === 'POST' && req.url === '/api/register') {
    const { name = '', email = '', password = '' } = await readJson(req);
    const clean = String(email).trim().toLowerCase();
    if (!String(name).trim()) return send(res, 400, { error: 'Informe seu nome' });
    if (!/^\S+@\S+\.\S+$/.test(clean)) return send(res, 400, { error: 'E-mail inválido' });
    if (String(password).length < 4) return send(res, 400, { error: 'A senha precisa de pelo menos 4 caracteres' });
    const db = load();
    if (db.users.some((u) => u.email === clean)) {
      return send(res, 409, { error: 'Já existe uma conta com esse e-mail' });
    }
    const { salt, hash } = hashPassword(String(password));
    db.users.push({ email: clean, name: String(name).trim(), salt, hash, createdAt: new Date().toISOString() });
    save(db);
    return send(res, 201, { user: { email: clean, name: String(name).trim() } });
  }

  if (req.method === 'POST' && req.url === '/api/login') {
    const { email = '', password = '' } = await readJson(req);
    const clean = String(email).trim().toLowerCase();
    const user = load().users.find((u) => u.email === clean);
    if (user) {
      const { hash } = hashPassword(String(password), user.salt);
      if (timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.hash, 'hex'))) {
        return send(res, 200, { user: { email: user.email, name: user.name } });
      }
    }
    return send(res, 401, { error: 'E-mail ou senha inválidos' });
  }

  send(res, 404, { error: 'rota não encontrada' });
}).listen(PORT, () => console.log(`CineFav API em http://localhost:${PORT}  (db: server/db.json)`));
