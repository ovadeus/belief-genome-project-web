// Sync Data page — shows sync status with Chrome extension and desktop app
import { useState, useEffect } from 'react';
import { genomeApi } from '../../components/genome/GenomeAuthContext';

interface SyncStatus {
  lastSync: string | null;
  totalResponses: number;
  sources: { extension: number; web: number; desktop: number };
}

export default function SyncPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const loadStatus = async () => {
    try {
      const res = await genomeApi('/sync/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {}
  };

  useEffect(() => { loadStatus(); }, []);

  const triggerSync = async () => {
    setSyncing(true);
    setMessage('');
    try {
      const res = await genomeApi('/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Sync complete. ${data.merged || 0} new responses merged.`);
        loadStatus();
      } else {
        setMessage('Sync failed. Try again later.');
      }
    } catch {
      setMessage('Could not reach sync service.');
    }
    setSyncing(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        Sync Data
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 32, lineHeight: 1.6 }}>
        Your belief data syncs across the Chrome extension, website, and desktop app.
        Use this page to check sync status and trigger a manual sync.
      </p>

      {/* Sync sources */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16,
        marginBottom: 24,
      }}>
        {/* Chrome Extension */}
        <div style={{
          padding: 20, borderRadius: 12,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>&#x1F310;</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
            Chrome Extension
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            {status?.sources?.extension || 0} responses
          </div>
        </div>

        {/* Website */}
        <div style={{
          padding: 20, borderRadius: 12,
          background: 'rgba(108,143,255,0.04)',
          border: '1px solid rgba(108,143,255,0.15)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>&#x1F4BB;</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6c8fff', marginBottom: 4 }}>
            Website
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            {status?.sources?.web || 0} responses
          </div>
        </div>

        {/* Desktop App */}
        <div style={{
          padding: 20, borderRadius: 12,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>&#x1F5A5;</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
            Desktop App
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            {status?.sources?.desktop || 0} responses
          </div>
        </div>
      </div>

      {/* Sync action */}
      <div style={{
        padding: 24, borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
              Manual Sync
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              Last sync: {status?.lastSync
                ? new Date(status.lastSync).toLocaleString()
                : 'Never'}
            </div>
          </div>
          <button
            onClick={triggerSync}
            disabled={syncing}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: syncing ? 'rgba(108,143,255,0.3)' : '#6c8fff',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: syncing ? 'wait' : 'pointer',
            }}
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
        {message && (
          <div style={{
            marginTop: 12, padding: 10, borderRadius: 6,
            background: message.includes('fail') || message.includes('Could not')
              ? 'rgba(255,71,87,0.08)' : 'rgba(46,213,115,0.08)',
            color: message.includes('fail') || message.includes('Could not')
              ? '#ff4757' : '#2ed573',
            fontSize: 12,
          }}>
            {message}
          </div>
        )}
      </div>

      {/* How sync works */}
      <div style={{
        padding: 20, borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h3 style={{
          fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
          color: 'rgba(255,255,255,0.4)', marginBottom: 14,
          fontFamily: "'Space Mono', monospace",
        }}>
          How Sync Works
        </h3>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Chrome Extension</strong> — Answers probes while browsing. Syncs to the website automatically every 15 minutes and on each response.
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Desktop App</strong> — Pairs via a local token (localhost:7337). The extension pushes responses to the desktop and pulls any desktop-only responses back.
          </p>
          <p>
            <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Deduplication</strong> — All sync is idempotent. Duplicate responses (same probe + timestamp + value) are automatically skipped.
          </p>
        </div>
      </div>

      {/* Total */}
      {status && (
        <div style={{
          marginTop: 20, padding: 16, borderRadius: 10,
          background: 'rgba(108,143,255,0.04)',
          border: '1px solid rgba(108,143,255,0.1)',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            Total responses across all sources:{' '}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#6c8fff' }}>
            {status.totalResponses}
          </span>
        </div>
      )}
    </div>
  );
}
