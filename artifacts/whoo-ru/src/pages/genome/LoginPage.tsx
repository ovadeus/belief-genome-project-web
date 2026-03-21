// Belief Genome login page
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useGenomeAuth } from '../../components/genome/GenomeAuthContext';

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 14, width: '100%',
};

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
    setLoading(false);
    if (result.ok) {
      setLocation('/genome/probe');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8, color: '#fff', textAlign: 'center' }}>Sign In</h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 32 }}>
        Access your Belief Genome
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: '#ff4757', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Email</label>
          <input type="email" required style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Password</label>
          <input type="password" required style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" />
        </div>

        <button type="submit" disabled={loading} style={{
          padding: '12px', borderRadius: 8, border: 'none',
          background: '#6c8fff', color: '#fff', fontSize: 14,
          cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
          marginTop: 8,
        }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
        Don't have an account?{' '}
        <a href="/genome/register" onClick={e => { e.preventDefault(); setLocation('/genome/register'); }}
          style={{ color: '#6c8fff', textDecoration: 'none' }}>
          Create one
        </a>
      </div>
    </div>
  );
}
