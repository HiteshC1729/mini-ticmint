import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role, Session } from './types/api';

const STORAGE_KEY = 'mini-ticmint-session';
type AuthContextValue = { session: Session | null; login: (token: string) => Session; logout: () => void };
const AuthContext = createContext<AuthContextValue | null>(null);

function decodeSession(token: string): Session {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Invalid login token');
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = atob(normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '='));
  const data = JSON.parse(json) as { sub: number; email: string; role: Role };
  if (!data.sub || !data.role) throw new Error('Invalid login token');
  return { token, userId: data.sub, email: data.email, role: data.role };
}

function readStoredSession(): Session | null {
  const token = localStorage.getItem(STORAGE_KEY);
  try { return token ? decodeSession(token) : null; } catch { localStorage.removeItem(STORAGE_KEY); return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readStoredSession);
  const value = useMemo(() => ({
    session,
    login: (token: string) => { const next = decodeSession(token); localStorage.setItem(STORAGE_KEY, token); setSession(next); return next; },
    logout: () => { localStorage.removeItem(STORAGE_KEY); setSession(null); },
  }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
