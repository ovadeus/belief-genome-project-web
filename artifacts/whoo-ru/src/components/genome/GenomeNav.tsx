// Global navigation bar for signed-in Belief Genome users
// Design: "Belief Genome Project" left | Dashboard | DNA | Analyze | Sync Data | Profile | [Name] | Sign Out
import { useLocation } from 'wouter';
import { useGenomeAuth } from './GenomeAuthContext';

interface NavItem {
  path: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/genome/probe',     label: 'Probe' },
  { path: '/genome/dashboard', label: 'Dashboard' },
  { path: '/genome/dna',       label: 'DNA' },
  { path: '/genome/analyze',   label: 'Analyze' },
  { path: '/genome/sync',      label: 'Sync Data' },
  { path: '/genome/profile',   label: 'Profile' },
];

export default function GenomeNav() {
  const { user, logout } = useGenomeAuth();
  const [location, setLocation] = useLocation();

  if (!user) return null;

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px',
      background: 'rgba(10, 10, 15, 0.95)',
      borderBottom: '1px solid rgba(108, 143, 255, 0.12)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Brand */}
      <div
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setLocation('/genome/dashboard')}
      >
        <span style={{
          fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.01em',
        }}>
          Belief Genome Project
        </span>
      </div>

      {/* Nav links + user + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {NAV_ITEMS.map((item, i) => {
          const active = location === item.path ||
            (item.path === '/genome/dashboard' && (
              location === '/genome/dashboard' || location === '/genome/probe'
            ));

          return (
            <div key={item.path} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Pipe separator before each item */}
              {i > 0 && (
                <span style={{
                  color: 'rgba(255,255,255,0.15)', fontSize: 14,
                  margin: '0 2px', userSelect: 'none',
                }}>|</span>
              )}
              <button
                onClick={() => setLocation(item.path)}
                style={{
                  padding: '6px 12px', border: 'none',
                  background: 'transparent',
                  color: active ? '#fff' : 'rgba(255, 255, 255, 0.45)',
                  fontSize: 13, cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                  borderBottom: active ? '2px solid #6c8fff' : '2px solid transparent',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget).style.color = 'rgba(255,255,255,0.8)';
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget).style.color = 'rgba(255,255,255,0.45)';
                }}
              >
                {item.label}
              </button>
            </div>
          );
        })}

        {/* Separator before user */}
        <span style={{
          color: 'rgba(255,255,255,0.15)', fontSize: 14,
          margin: '0 8px 0 6px', userSelect: 'none',
        }}>|</span>

        {/* User name */}
        <span style={{
          fontSize: 13, color: 'rgba(255, 255, 255, 0.55)',
          marginRight: 12, fontWeight: 500,
        }}>
          {user.name || user.email}
        </span>

        {/* Sign Out button */}
        <button
          onClick={() => { logout(); setLocation('/genome/login'); }}
          style={{
            padding: '6px 16px', borderRadius: 6,
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: 12, cursor: 'pointer',
            transition: 'all 0.15s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(255,71,87,0.4)';
            e.currentTarget.style.color = '#ff4757';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
