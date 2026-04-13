import { User } from './user.model';

const STORAGE_TOKEN_KEY = 'auth_token';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

interface TokenPayload extends User {
  iat: number;
}

export function generateToken(user: User): string {
  const payload: TokenPayload = { ...user, iat: Date.now() };
  return btoa(JSON.stringify(payload));
}

export function parseToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token)) as TokenPayload;
    const { iat: _iat, ...user } = payload;
    return { ...user, id: String(user.id) };
  } catch {
    return null;
  }
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.substring(name.length + 1));
}

export function loadTokenFromBrowser(): string | null {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

export function loadTokenFromRequest(request: Request | null): string | null {
  if (!request) return null;
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  return parseCookie(cookieHeader, STORAGE_TOKEN_KEY);
}

export function persistToken(token: string): void {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  document.cookie = `${STORAGE_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  document.cookie = `${STORAGE_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}
