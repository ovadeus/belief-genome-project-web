// Belief Genome login page — styled to match BGP Admin login aesthetic
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useGenomeAuth } from '../../components/genome/GenomeAuthContext';

// Logo dots matching the BGP Admin style (pink → blue → green molecular dots)
function BgpLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ marginRight: 10 }}>
      <circle cx="18" cy="6" r="4" fill="var(--accent-text)" />
      <circle cx="10" cy="22" r="4" fill="var(--accent-bright)" />
      <circle cx="26" cy="22" r="4" fill="#34d399" />
      <line x1="18" y1="10" x2="10" y2="18" stroke="var(--accent-bright)" strokeWidth="1.5" opacity="0.5" />
      <line x1="18" y1="10" x2="26" y2="18" stroke="#34d399" strokeWidth="1.5" opacity="0.5" />
      <line x1="10" y1="22" x2="26" y2="22" stroke="var(--accent-text)" strokeWidth="1.5" opacity="0.3" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useGenomeAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.ok) {
      let next = '/dashboard';
      try {
        const stored = sessionStorage.getItem('genome:redirectAfterLogin');
        if (stored && stored !== '/login' && stored !== '/register') next = stored;
        sessionStorage.removeItem('genome:redirectAfterLogin');
      } catch {}
      setLocation(next);
      return;
    }
    setLoading(false);
    setError(result.error || 'Login failed');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'hsl(var(--background))', padding: 20,
    }}>
      {/* Logo + Title */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 36,
      }}>
        <BgpLogo />
        <span style={{
          fontSize: 24, fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '0.01em',
        }}>
          Sign In
        </span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420, padding: 36, borderRadius: 16,
        background: 'var(--surface-1)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      }}>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
          textAlign: 'center', marginBottom: 6,
        }}>
          Secure Access
        </h2>
        <p style={{
          fontSize: 13, color: 'var(--text-muted)',
          textAlign: 'center', marginBottom: 28,
        }}>
          Access your Belief Genome
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(255,71,87,0.08)',
              border: '1px solid rgba(255,71,87,0.25)',
              color: '#ff6b7a', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{
              display: 'block', fontSize: 12, color: 'var(--accent-strong)',
              marginBottom: 8, fontWeight: 500,
            }}>
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'var(--border-subtle)', color: 'var(--text-primary)',
                fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-mid)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: 12, color: 'var(--accent-strong)',
              marginBottom: 8, fontWeight: 500,
            }}>
              Password
            </label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'var(--border-subtle)', color: 'var(--text-primary)',
                fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-mid)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: loading
              ? 'var(--accent-mid)'
              : 'linear-gradient(135deg, var(--accent-bright) 0%, var(--accent-text) 100%)',
            color: 'var(--text-primary)', fontSize: 15, fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
            transition: 'all 0.2s', marginTop: 4,
            boxShadow: loading ? 'none' : '0 4px 16px rgba(108,143,255,0.3)',
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Register link */}
      <div style={{
        textAlign: 'center', marginTop: 24,
        fontSize: 13, color: 'var(--text-faint)',
      }}>
        Don't have an account?{' '}
        <a
          href="/register"
          onClick={e => { e.preventDefault(); setLocation('/register'); }}
          style={{ color: 'var(--accent-bright)', textDecoration: 'none', fontWeight: 500 }}
        >
          Create one
        </a>
      </div>

      <a
        href="/"
        onClick={e => { e.preventDefault(); setLocation('/'); }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-faint)', fontSize: 13, fontWeight: 500,
          textDecoration: 'none', marginTop: 32,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-bright)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
      >
        &larr; Back to Belief Genome Project
      </a>
    </div>
  );
}
