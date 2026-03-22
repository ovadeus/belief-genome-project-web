// Layout wrapper for all Belief Genome pages (adds nav + auth guard)
import { ReactNode } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useGenomeAuth } from './GenomeAuthContext';
import GenomeNav from './GenomeNav';

interface Props {
  children: ReactNode;
}

export default function GenomeLayout({ children }: Props) {
  const { user, loading } = useGenomeAuth();
  const [location] = useLocation();

  // Public pages don't need auth
  const isPublicPage = location === '/genome/login' || location === '/genome/register';

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: 'rgba(255,255,255,0.3)', fontSize: 14,
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated (except on public pages)
  if (!user && !isPublicPage) {
    return <Redirect to="/genome/login" />;
  }

  // Don't show nav on login/register
  if (isPublicPage) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>{children}</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <GenomeNav />
      <main style={{ padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  );
}
