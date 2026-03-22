// Global navigation bar for signed-in Belief Genome users
// Shows: Probe | Genome Analytics | Belief DNA | Profile | Sign Out
import { useLocation } from 'wouter';
import { useGenomeAuth } from './GenomeAuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/genome/probe',     label: 'Probe',            icon: '\u{1F9EC}' }, // 🧬
  { path: '/genome/dashboard', label: 'Genome Analytics',  icon: '\u{1F4CA}' }, // 📊
  { path: '/genome/dna',       label: 'Belief DNA',       icon: '\u{1F9EA}' }, // 🧪
  { path: '/genome/profile',   label: 'Profile',          icon: '\u{1F464}' }, // 👤
];

export default function GenomeNav() {
  const { user, logout } = useGenomeAuth();
  const [location, setLocation] = useLocation();

  if (!user) return null;

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'rgba(10, 10, 15, 0.95)',
      borderBottom: '1px solid rgba(108, 143, 255, 0.12)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Logo / brand */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        onClick={() => setLocation('/genome/dashboard')}
      >
        <span style={{ fontSize: 20 }}>&#x1F9EC;</span>
        <span style={{
          fontSize: 15, fontWeight: 700, color: '#fff',
          letterSpacing: '0.02em',
        }}>
          Belief Genome
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {NAV_ITEMS.map(item => {
          const active = location === item.path ||
            (item.path === '/genome/dashboard' && location.startsWith('/genome/dashboard'));
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: active ? 'rgba(108, 143, 255, 0.15)' : 'transparent',
                color: active ? '#6c8fff' : 'rgba(255, 255, 255, 0.5)',
                fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                fontWeight: active ? 600 : 400,
              }}
              onMouseEnter={e => {
                if (!active) (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.8)';
              }}
              onMouseLeave={e => {
                if (!active) (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* User + Sign Out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{
          fontSize: 12, color: 'rgba(255, 255, 255, 0.35)',
          fontFamily: "'Space Mono', monospace",
        }}>
          {user.name || user.email}
        </span>
        <button
          onClick={() => { logout(); setLocation('/genome/login'); }}
          style={{
            padding: '6px 14px', borderRadius: 6,
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: 12, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.borderColor = 'rgba(255,71,87,0.4)';
            (e.target as HTMLElement).style.color = '#ff4757';
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
            (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
