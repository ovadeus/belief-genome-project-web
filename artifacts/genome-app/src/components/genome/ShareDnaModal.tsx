import { useEffect, useState } from 'react';
import { encodeAnonymous, encodeSigned } from '@belief-genome/engine';
import { toast } from 'sonner';

type Mode = 'anonymous' | 'signed';

interface ShareDnaModalProps {
  open: boolean;
  onClose: () => void;
  dnaString: string;
}

/**
 * Privacy-first share modal. Defaults to anonymous mode. Signed mode (which
 * embeds demographics into the URL) requires an explicit checkbox confirm
 * AND shows a destructive-style warning. We never auto-select signed mode.
 */
export default function ShareDnaModal({ open, onClose, dnaString }: ShareDnaModalProps) {
  const [mode, setMode] = useState<Mode>('anonymous');
  const [signedAcknowledged, setSignedAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset state every time the modal reopens — defense in depth so the
  // signed-mode checkbox can't survive across opens.
  useEffect(() => {
    if (open) {
      setMode('anonymous');
      setSignedAcknowledged(false);
      setCopied(false);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canShare = mode === 'anonymous' || (mode === 'signed' && signedAcknowledged);
  let signature = '';
  try {
    signature = mode === 'anonymous' ? encodeAnonymous(dnaString) : encodeSigned(dnaString);
  } catch {
    signature = '';
  }
  const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL}dna/${signature}`;
  const shareUrl = canShare && signature ? baseUrl : '';

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — please copy manually");
    }
  };

  const shareToX = () => {
    if (!shareUrl) return;
    const text = encodeURIComponent('I mapped my Belief Genome — 124 belief dimensions visualized.');
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520, width: '100%',
          background: 'rgba(15,15,25,0.98)',
          border: '1px solid rgba(108,143,255,0.25)',
          borderRadius: 16, padding: 28,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <h2 id="share-modal-title" style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
          Share your Belief DNA
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 20px' }}>
          Choose how much to reveal. Anonymous is recommended.
        </p>

        {/* Mode selector */}
        <div role="radiogroup" aria-label="Share mode" style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
          <ModeOption
            id="mode-anon"
            checked={mode === 'anonymous'}
            onChange={() => setMode('anonymous')}
            label="Anonymous"
            description="Shares only your 124 belief scores. No age, sex, country, or zip code."
            recommended
          />
          <ModeOption
            id="mode-signed"
            checked={mode === 'signed'}
            onChange={() => setMode('signed')}
            label="Signed"
            description="Includes your demographic metadata (century, year, sex, country, zip). Anyone with the link sees this."
          />
        </div>

        {/* Signed-mode warning + acknowledgement */}
        {mode === 'signed' && (
          <div style={{
            padding: 12, borderRadius: 8,
            background: 'rgba(245,166,35,0.08)',
            border: '1px solid rgba(245,166,35,0.3)',
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 12, color: '#f5a623', margin: '0 0 10px', lineHeight: 1.5 }}>
              <strong>Heads up:</strong> Signed links permanently encode your demographics into the URL. Once you share it, anyone who has the link can see them — even if you delete your account.
            </p>
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={signedAcknowledged}
                onChange={(e) => setSignedAcknowledged(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>I understand and want to share my demographics in the link.</span>
            </label>
          </div>
        )}

        {/* Link box */}
        <div style={{
          padding: '10px 12px', borderRadius: 8,
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 16,
          fontFamily: "'Space Mono', monospace", fontSize: 11,
          color: shareUrl ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
          wordBreak: 'break-all',
          minHeight: 38,
        }}>
          {shareUrl || (mode === 'signed' ? 'Confirm above to generate a signed link' : 'Generating…')}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={copyLink}
            disabled={!shareUrl}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 8,
              background: copied ? 'rgba(46,213,115,0.18)' : 'rgba(108,143,255,0.18)',
              border: `1px solid ${copied ? 'rgba(46,213,115,0.4)' : 'rgba(108,143,255,0.4)'}`,
              color: copied ? '#22c55e' : '#a8c0ff',
              fontSize: 13, fontWeight: 600, cursor: shareUrl ? 'pointer' : 'not-allowed',
              opacity: shareUrl ? 1 : 0.4,
            }}
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            onClick={shareToX}
            disabled={!shareUrl}
            style={{
              padding: '10px 16px', borderRadius: 8,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.8)',
              fontSize: 13, fontWeight: 600, cursor: shareUrl ? 'pointer' : 'not-allowed',
              opacity: shareUrl ? 1 : 0.4,
            }}
          >
            Share to X
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Close
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
        background: props.checked ? 'rgba(108,143,255,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${props.checked ? 'rgba(108,143,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
        cursor: 'pointer',
      }}
    >
      <input
        id={props.id} type="radio" name="share-mode"
        checked={props.checked} onChange={props.onChange}
        style={{ marginTop: 4 }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{props.label}</span>
          {props.recommended && (
            <span style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 4,
              background: 'rgba(46,213,115,0.15)', color: '#22c55e',
              textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700,
            }}>Recommended</span>
          )}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', lineHeight: 1.5 }}>
          {props.description}
        </p>
      </div>
    </label>
  );
}
