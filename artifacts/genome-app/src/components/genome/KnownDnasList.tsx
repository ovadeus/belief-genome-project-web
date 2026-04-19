// Library list — newest-first, with preview button (opens compare mode) and
// a delete button. Empty state nudges toward the dropzone. Server is the
// source of truth for ordering; this is a pure render of useKnownDnas().

import { Eye, EyeOff } from 'lucide-react';
import { useKnownDnas, useDeleteKnownDna, type KnownDnaEntry } from '../../hooks/use-known-dnas';
import { FormatBadge } from './ImportBgpDropzone';

interface Props {
  selectedId: number | null;
  onSelect: (entry: KnownDnaEntry) => void;
}

export default function KnownDnasList({ selectedId, onSelect }: Props) {
  const q = useKnownDnas();
  const delM = useDeleteKnownDna();

  if (q.isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
        Loading library…
      </div>
    );
  }

  if (q.isError) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
        Couldn't load your library.{' '}
        <button onClick={() => q.refetch()} style={{ background: 'none', border: 'none', color: '#6c8fff', cursor: 'pointer', textDecoration: 'underline' }}>
          Retry
        </button>
      </div>
    );
  }

  const entries = q.data?.entries ?? [];

  if (entries.length === 0) {
    return (
      <div style={{
        padding: 24, borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.08)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>
          Your library is empty.
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          Import a .bgp file or paste a signature to start comparing.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {entries.map(entry => {
        const isSelected = entry.id === selectedId;
        return (
          <div
            key={entry.id}
            style={{
              padding: '12px 14px', borderRadius: 10,
              background: isSelected ? 'rgba(108,143,255,0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isSelected ? 'rgba(108,143,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                  {entry.shareableName || 'Anonymous DNA'}
                </span>
                <FormatBadge format={entry.format} />
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.signature}
              </div>
              {entry.note && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.note}
                </div>
              )}
            </div>
            <button
              onClick={() => onSelect(entry)}
              title={isSelected ? 'Close comparison' : 'Preview comparison'}
              aria-label={
                isSelected
                  ? `Close comparison with ${entry.shareableName || 'this entry'}`
                  : `Compare with ${entry.shareableName || 'this entry'}`
              }
              aria-pressed={isSelected}
              style={{
                padding: '6px 10px', borderRadius: 6,
                background: isSelected ? 'rgba(108,143,255,0.28)' : 'rgba(108,143,255,0.15)',
                border: `1px solid ${isSelected ? 'rgba(108,143,255,0.6)' : 'rgba(108,143,255,0.3)'}`,
                color: '#a8c0ff', cursor: 'pointer',
                lineHeight: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {isSelected ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={() => {
                if (delM.isPending) return;
                if (window.confirm(`Remove "${entry.shareableName || 'this entry'}" from your library?`)) {
                  delM.mutate(entry.id);
                }
              }}
              title="Remove from library"
              aria-label={`Remove ${entry.shareableName || 'entry'}`}
              style={{
                padding: '6px 10px', borderRadius: 6,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14, cursor: delM.isPending ? 'wait' : 'pointer',
                lineHeight: 1,
              }}
            >
              🗑
            </button>
          </div>
        );
      })}
    </div>
  );
}
