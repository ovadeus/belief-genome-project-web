// Belief Genome registration page — styled to match BGP Admin login aesthetic
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

export default function RegisterPage() {
  const { register } = useGenomeAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.ok) {
      let next = '/dashboard';
      try {
        const stored = sessionStorage.getItem('genome:redirectAfterLogin');
        if (stored && stored !== '/login' && stored !== '/register') next = stored;
        sessionStorage.removeItem('genome:redirectAfterLogin');
      } catch {}
      setLocation(next);
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid var(--border-soft)',
    background: 'var(--border-subtle)', color: 'var(--text-primary)',
    fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'hsl(var(--background))', padding: 20,
    }}>
      {/* Scoped responsive styles for the two-column layout */}
      <style>{`
        .bgp-signup-row {
          display: flex;
          gap: 32px;
          align-items: stretch;
          width: 100%;
          max-width: 920px;
        }
        .bgp-signup-info,
        .bgp-signup-card {
          flex: 1 1 0;
          min-width: 0;
        }
        @media (max-width: 760px) {
          .bgp-signup-row {
            flex-direction: column;
            max-width: 460px;
            gap: 24px;
          }
        }
      `}</style>

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
          Join the Belief Genome Project
        </span>
      </div>

      {/* Two-column row: info left, form right */}
      <div className="bgp-signup-row">
        {/* LEFT: What you get + How it works */}
        <div className="bgp-signup-info" style={{
          padding: 36, borderRadius: 16,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          color: 'var(--text-primary)',
          display: 'flex', flexDirection: 'column', gap: 28,
        }}>
          <div>
            <h3 style={{
              fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 12,
              color: 'var(--text-primary)', letterSpacing: '0.01em',
            }}>
              What you get
            </h3>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column', gap: 10,
              fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)',
            }}>
              <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent-bright)', flexShrink: 0, fontWeight: 700 }}>✓</span>
                <span>Your <strong style={{ color: 'var(--text-primary)' }}>Belief Genome Dashboard</strong> with personal analytics</span>
              </li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent-bright)', flexShrink: 0, fontWeight: 700 }}>✓</span>
                <span>A growing map of your <strong style={{ color: 'var(--text-primary)' }}>Belief DNA</strong> across dimensions</span>
              </li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent-bright)', flexShrink: 0, fontWeight: 700 }}>✓</span>
                <span>Patterns and insights drawn from your own responses</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 style={{
              fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 12,
              color: 'var(--text-primary)', letterSpacing: '0.01em',
            }}>
              How it works
            </h3>
            <ol style={{
              listStyle: 'none', padding: 0, margin: 0, counterReset: 'step',
              display: 'flex', flexDirection: 'column', gap: 12,
              fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)',
            }}>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--border-subtle)', color: 'var(--accent-bright)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>1</span>
                <span>Create your account &mdash; takes a few seconds.</span>
              </li>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--border-subtle)', color: 'var(--accent-bright)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>2</span>
                <span>Engage with prompts to populate your genome &mdash; the more you respond, the richer it gets.</span>
              </li>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--border-subtle)', color: 'var(--accent-bright)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>3</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>Flexibility:</strong> respond on the web, in the browser extension, or via the desktop app.</span>
              </li>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--border-subtle)', color: 'var(--accent-bright)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>4</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>Control:</strong> set how often prompts arrive in Settings &mdash; daily, weekly, or paused.</span>
              </li>
            </ol>
          </div>
        </div>

        {/* RIGHT: Sign-up Card */}
        <div className="bgp-signup-card" style={{
          padding: 36, borderRadius: 16,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{
            fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
            textAlign: 'center', marginBottom: 6,
          }}>
            Join the Project
          </h2>
          <p style={{
            fontSize: 13, color: 'var(--text-muted)',
            textAlign: 'center', marginBottom: 28,
          }}>
            Begin mapping your Belief DNA
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
                Name
              </label>
              <input
                type="text" required value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-mid)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
              />
            </div>

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
                style={inputStyle}
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
                placeholder="Min. 8 characters"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-mid)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: 12, color: 'var(--accent-strong)',
                marginBottom: 8, fontWeight: 500,
              }}>
                Confirm Password
              </label>
              <input
                type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                style={inputStyle}
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
              boxShadow: loading ? 'none' : '0 4px 16px var(--accent-mid)',
            }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>

      {/* Login link */}
      <div style={{
        textAlign: 'center', marginTop: 24,
        fontSize: 13, color: 'var(--text-faint)',
      }}>
        Already have an account?{' '}
        <a
          href="/login"
          onClick={e => { e.preventDefault(); setLocation('/login'); }}
          style={{ color: 'var(--accent-bright)', textDecoration: 'none', fontWeight: 500 }}
        >
          Sign in
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
