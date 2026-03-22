// Auth context for Belief Genome users (separate from admin auth)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GenomeUser {
  id: number;
  name: string;
  email: string;
}

interface GenomeAuthContextType {
  user: GenomeUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const FALLBACK: GenomeAuthContextType = {
  user: null, token: null, loading: true,
  login: async () => ({ ok: false, error: 'Not initialized' }),
  register: async () => ({ ok: false, error: 'Not initialized' }),
  logout: () => {},
};

const GenomeAuthContext = createContext<GenomeAuthContextType>(FALLBACK);

export function useGenomeAuth() {
  return useContext(GenomeAuthContext);
}

// API helper that includes auth token
export function genomeApi(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('genome_token');
  return fetch(`/api/genome${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export function GenomeAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GenomeUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('genome_token'));
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    genomeApi('/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => { setToken(null); localStorage.removeItem('genome_token'); setLoading(false); });
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/genome/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    localStorage.setItem('genome_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return { ok: true };
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/genome/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    localStorage.setItem('genome_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem('genome_token');
    setToken(null);
    setUser(null);
    fetch('/api/genome/logout', { method: 'POST' }).catch(() => {});
  };

  return (
    <GenomeAuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </GenomeAuthContext.Provider>
  );
}
