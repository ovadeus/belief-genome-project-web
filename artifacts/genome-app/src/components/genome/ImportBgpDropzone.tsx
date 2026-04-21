// Three-entry-points import pipeline: drop a .bgp file, pick one, or paste a
// signature / share URL. All three funnel through the same /known-dnas/parse
// endpoint, then the user confirms on a small preview card before /add.

import { useState, useRef, useCallback } from 'react';
import { useParseSignature, useAddKnownDna, type ParsedSignaturePreview } from '../../hooks/use-known-dnas';
import { toast } from 'sonner';

type Source = 'file' | 'paste' | 'url';

interface PendingImport {
  parsed: ParsedSignaturePreview;
  source: Source;
  rawText: string;
}

export default function ImportBgpDropzone() {
  const [pasteText, setPasteText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const parseM = useParseSignature();
  const addM = useAddKnownDna();

  const tryParse = useCallback(async (text: string, source: Source) => {
    if (!text.trim()) return;
    try {
      const result = await parseM.mutateAsync(text);
      if (!result.valid || !result.parsed) {
        toast.error("That doesn't look like a Belief DNA signature.");
        return;
      }
      setPending({ parsed: result.parsed, source, rawText: text });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [parseM]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 100_000) {
      toast.error('File too large (max 100KB).');
      return;
    }
    try {
      const text = await file.text();
      tryParse(text, 'file');
    } catch {
      toast.error("Couldn't read that file.");
    }
  }, [tryParse]);

  const handlePasteSubmit = useCallback(() => {
    const text = pasteText.trim();
    if (!text) return;
    // Heuristic: detect URL vs raw signature for the 'source' tag.
    const looksLikeUrl = /^https?:\/\//i.test(text);
    tryParse(text, looksLikeUrl ? 'url' : 'paste');
  }, [pasteText, tryParse]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const confirmAdd = useCallback(async () => {
    if (!pending) return;
    try {
      await addM.mutateAsync({
        signature: pending.parsed.signature,
        shareableName: pending.parsed.shareableName ?? null,
        note: pending.parsed.note ?? null,
        exportedAt: pending.parsed.exportedAt ?? null,
        exportedFrom: pending.parsed.exportedFrom ?? null,
        source: pending.source,
      });
      setPending(null);
      setPasteText('');
    } catch {
      // toast handled in mutation onError
    }
  }, [pending, addM]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        style={{
          padding: 24, borderRadius: 12,
          border: `1.5px dashed ${dragOver ? 'var(--accent-strong)' : 'var(--accent-mid)'}`,
          background: dragOver ? 'var(--accent-soft)' : 'var(--surface-1)',
          textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '0 0 4px', fontWeight: 600 }}>
          Drop a .bgp file here
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          or click to choose a file
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".bgp,application/json,text/plain"
          style={{ display: 'none' }}
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* OR divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
        <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: 1.5 }}>
          or paste
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
      </div>

      {/* Paste textarea */}
      <div>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste a signature (a:... or s:...) or a share URL"
          rows={2}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 12px', borderRadius: 8,
            background: 'var(--surface-overlay)', color: 'var(--text-primary)',
            border: '1px solid var(--border-soft)',
            fontSize: 12, fontFamily: "'Space Mono', monospace",
            resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={handlePasteSubmit}
            disabled={!pasteText.trim() || parseM.isPending}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: pasteText.trim() ? 'var(--accent-mid)' : 'transparent',
              border: '1px solid var(--accent-strong)',
              color: pasteText.trim() ? 'var(--accent-text)' : 'var(--text-faint)',
              fontSize: 12, fontWeight: 600,
              cursor: pasteText.trim() ? 'pointer' : 'not-allowed',
              opacity: parseM.isPending ? 0.6 : 1,
            }}
          >
            {parseM.isPending ? 'Parsing…' : 'Parse'}
          </button>
        </div>
      </div>

      {/* Preview confirm card */}
      {pending && (
        <div style={{
          padding: 16, borderRadius: 12,
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-mid)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {pending.parsed.shareableName || 'Anonymous DNA'}
                </span>
                <FormatBadge format={pending.parsed.format} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", wordBreak: 'break-all' }}>
                {pending.parsed.signature.slice(0, 56)}{pending.parsed.signature.length > 56 ? '…' : ''}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                {pending.parsed.dimensionsCovered}/124 dimensions covered
                {pending.parsed.exportedFrom ? ` · from ${pending.parsed.exportedFrom}` : ''}
              </div>
              {pending.parsed.note && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8, fontStyle: 'italic' }}>
                  "{pending.parsed.note}"
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={confirmAdd}
              disabled={addM.isPending}
              style={{
                flex: 1, padding: '8px 14px', borderRadius: 8,
                background: 'rgba(34,197,94,0.18)',
                border: '1px solid rgba(34,197,94,0.4)',
                color: '#4ade80', fontSize: 12, fontWeight: 600,
                cursor: addM.isPending ? 'wait' : 'pointer',
                opacity: addM.isPending ? 0.6 : 1,
              }}
            >
              {addM.isPending ? 'Adding…' : 'Add to library'}
            </button>
            <button
              onClick={() => setPending(null)}
              style={{
                padding: '8px 14px', borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--border-soft)',
                color: 'var(--text-muted)',
                fontSize: 12, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FormatBadge({ format }: { format: 'anonymous' | 'signed' }) {
  const isAnon = format === 'anonymous';
  return (
    <span style={{
      fontSize: 9, padding: '2px 8px', borderRadius: 4,
      background: isAnon ? 'rgba(34,197,94,0.15)' : 'rgba(245,166,35,0.15)',
      color: isAnon ? '#22c55e' : '#f5a623',
      textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700,
    }}>
      {isAnon ? 'Anonymous' : 'Signed'}
    </span>
  );
}
