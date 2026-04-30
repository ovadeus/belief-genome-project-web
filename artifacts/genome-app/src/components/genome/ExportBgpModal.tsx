import { useEffect, useState } from 'react';
import { encodeAnonymous, encodeSigned, buildBgpFile } from '@belief-genome/engine';
import { toast } from 'sonner';

type Mode = 'anonymous' | 'signed';

interface ExportBgpModalProps {
  open: boolean;
  onClose: () => void;
  dnaString: string;
  defaultName?: string | null;
}

/**
 * Privacy-first .bgp file export modal — sibling of ShareDnaModal.
 *
 * Identical privacy posture: defaults to anonymous, signed mode requires an
 * explicit acknowledgement. Anonymous .bgp files NEVER contain demographics
 * because the engine slices them out at encode time — there is no path
 * through this UI that can include demographics in an anonymous file.
 *
 * Output: belief-dna-YYYY-MM-DD[-signed].bgp downloaded via Blob + an
 * ephemeral object URL. No new dependencies needed.
 */
export default function ExportBgpModal({ open, onClose, dnaString, defaultName }: ExportBgpModalProps) {
  const [mode, setMode] = useState<Mode>('anonymous');
  const [signedAcknowledged, setSignedAcknowledged] = useState(false);
  const [shareableName, setShareableName] = useState('');
  const [note, setNote] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Reset every time the modal reopens — prevents stale signed-acknowledgement
  // from carrying across opens. Pre-fills name from the user's profile.
  useEffect(() => {
    if (open) {
      setMode('anonymous');
      setSignedAcknowledged(false);
      setShareableName(defaultName || '');
      setNote('');
      setDownloading(false);
    }
  }, [open, defaultName]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canExport = mode === 'anonymous' || (mode === 'signed' && signedAcknowledged);

  const doExport = async () => {
    if (!canExport || !dnaString || downloading) return;
    setDownloading(true);
    try {
      const signature = mode === 'anonymous'
        ? await encodeAnonymous(dnaString)
        : await encodeSigned(dnaString);
      const file = await buildBgpFile({
        signature,
        shareableName: shareableName.trim() || null,
        note: note.trim() || null,
        exportedFrom: 'web',
      });
      const json = JSON.stringify(file, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      const datePart = new Date().toISOString().slice(0, 10);
      const suffix = mode === 'signed' ? '-signed' : '';
      link.href = url;
      link.download = `belief-dna-${datePart}${suffix}.bgp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Revoke after a tick so the browser has time to start the download.
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success(`Exported belief-dna-${datePart}${suffix}.bgp`);
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('.bgp export failed:', err);
      toast.error("Couldn't generate file");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-bgp-title"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--surface-overlay)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520, width: '100%',
          background: 'hsl(var(--popover))',
          border: '1px solid var(--accent-mid)',
          borderRadius: 16, padding: 28,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <h2 id="export-bgp-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Export Belief DNA file
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 20px' }}>
          A portable .bgp file you can share via email, AirDrop, or USB. Anyone with the file can import it.
        </p>

        {/* Mode selector */}
        <div role="radiogroup" aria-label="Export mode" style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
          <ModeOption
            id="bgp-mode-anon"
            checked={mode === 'anonymous'}
            onChange={() => setMode('anonymous')}
            label="Anonymous"
            description="124 belief scores only. No demographics in the file."
            recommended
          />
          <ModeOption
            id="bgp-mode-signed"
            checked={mode === 'signed'}
            onChange={() => setMode('signed')}
            label="Signed"
            description="Includes century, year, sex, country, zip. Anyone who opens the file sees them."
          />
        </div>

        {/* Signed-mode warning */}
        {mode === 'signed' && (
          <div style={{
            padding: 12, borderRadius: 8,
            background: 'rgba(245,166,35,0.08)',
            border: '1px solid rgba(245,166,35,0.3)',
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 12, color: '#f5a623', margin: '0 0 10px', lineHeight: 1.5 }}>
              <strong>Heads up:</strong> Signed files permanently encode your demographics. Once the file is out, you can't take it back.
            </p>
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={signedAcknowledged}
                onChange={(e) => setSignedAcknowledged(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>I understand and want to include my demographics in the file.</span>
            </label>
          </div>
        )}

        {/* Optional metadata */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: 1 }}>
            Shareable name <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <input
            type="text"
            value={shareableName}
            onChange={(e) => setShareableName(e.target.value.slice(0, 80))}
            placeholder="e.g. David, Team Workshop #3"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 10px', borderRadius: 6,
              background: 'var(--surface-overlay)', color: 'var(--text-primary)',
              border: '1px solid var(--border-soft)',
              fontSize: 13, fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: 1 }}>
            Note <span style={{ opacity: 0.5 }}>(optional, max 500 chars)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            placeholder="Context for whoever opens this file"
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 10px', borderRadius: 6,
              background: 'var(--surface-overlay)', color: 'var(--text-primary)',
              border: '1px solid var(--border-soft)',
              fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={doExport}
            disabled={!canExport || downloading}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 8,
              background: 'var(--accent-mid)',
              border: '1px solid var(--accent-strong)',
              color: 'var(--accent-text)',
              fontSize: 13, fontWeight: 600,
              cursor: (canExport && !downloading) ? 'pointer' : 'not-allowed',
              opacity: (canExport && !downloading) ? 1 : 0.4,
            }}
          >
            {downloading ? 'Generating…' : 'Download .bgp file'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--border-soft)',
              color: 'var(--text-muted)',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeOption(props: {
  id: string; checked: boolean; onChange: () => void;
  label: string; description: string; recommended?: boolean;
}) {
  return (
    <label
      htmlFor={props.id}
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: 12, borderRadius: 10,
        background: props.checked ? 'var(--accent-soft)' : 'var(--surface-1)',
        border: `1px solid ${props.checked ? 'var(--accent-mid)' : 'var(--border-soft)'}`,
        cursor: 'pointer',
      }}
    >
      <input
        id={props.id} type="radio" name="export-bgp-mode"
        checked={props.checked} onChange={props.onChange}
        style={{ marginTop: 4 }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{props.label}</span>
          {props.recommended && (
            <span style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 4,
              background: 'rgba(46,213,115,0.15)', color: '#22c55e',
              textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700,
            }}>Recommended</span>
          )}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
          {props.description}
        </p>
      </div>
    </label>
  );
}
