import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import ReflectionsForm from './ReflectionsForm';

interface ReflectionsModalCtx {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const Ctx = createContext<ReflectionsModalCtx | null>(null);

export function useReflectionsModal() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useReflectionsModal must be used within ReflectionsModalProvider');
  return v;
}

export function ReflectionsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close]);

  return (
    <Ctx.Provider value={{ isOpen, open, close }}>
      {children}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reflections"
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--surface-overlay)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '60px 20px 40px',
            overflowY: 'auto',
            animation: 'reflectionsFadeIn 0.18s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 680,
              background: 'hsl(var(--popover))',
              border: '1px solid var(--border-strong)',
              borderRadius: 16,
              padding: '28px 28px 32px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
              animation: 'reflectionsSlideIn 0.22s ease',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <h2 style={{
                margin: 0,
                fontSize: 22,
                color: 'var(--text-primary)',
                fontWeight: 600,
              }}>
                Reflections
              </h2>
              <button
                onClick={close}
                aria-label="Close reflections"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-soft)',
                  color: 'var(--text-muted)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-soft)';
                }}
              >
                <X size={14} /> Close
              </button>
            </div>

            <ReflectionsForm showHeading={false} />
          </div>
          <style>{`
            @keyframes reflectionsFadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes reflectionsSlideIn {
              from { opacity: 0; transform: translateY(-8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </Ctx.Provider>
  );
}
