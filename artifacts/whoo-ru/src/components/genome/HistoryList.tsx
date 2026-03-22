// Belief history — searchable, filterable, paginated response list
// Matches desktop: same labels, same colors, same filters
import { useState, useMemo } from 'react';
import { CAT_SHORT, beliefLabel as _beliefLabel, beliefColor as _beliefColor } from './genome-utils';

function beliefLabel(v: number): string {
  return _beliefLabel(Math.round(v * 100));
}

function beliefColor(v: number): string {
  return _beliefColor(Math.round(v * 100));
}

interface HistoryEntry {
  id: number;
  probeText: string;
  probeCategory: string;
  probeSource?: string;
  value: number;
  confidence: number | null;
  createdAt: string;
}

interface Props {
  history: HistoryEntry[];
}

const PAGE_SIZE = 10;

export default function HistoryList({ history }: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return history.filter(h => {
      if (s && !(h.probeText || '').toLowerCase().includes(s)) return false;
      if (catFilter && h.probeCategory !== catFilter) return false;
      if (sourceFilter) {
        const src = (h.probeSource || '').toLowerCase();
        if (sourceFilter === 'news' && !src.startsWith('news:')) return false;
        if (sourceFilter === 'ai' && src !== 'ai') return false;
        if (sourceFilter === 'bank' && src !== 'bank') return false;
      }
      if (sentimentFilter) {
        const v = h.value;
        if (sentimentFilter === 'true' && v <= 0.55) return false;
        if (sentimentFilter === 'false' && v >= 0.45) return false;
        if (sentimentFilter === 'uncertain' && (v < 0.45 || v > 0.55)) return false;
      }
      return true;
    });
  }, [history, search, catFilter, sentimentFilter, sourceFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 40 }}>
        No belief responses yet. Answer probes to start building your Belief Genome.
      </div>
    );
  }

  const allCats = [...new Set(history.map(h => h.probeCategory).filter(Boolean))].sort();

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search probes..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={inputStyle}
        />
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">All Categories</option>
          {allCats.map(c => <option key={c} value={c}>{CAT_SHORT[c] || c}</option>)}
        </select>
        <select value={sentimentFilter} onChange={e => { setSentimentFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">All Sentiments</option>
          <option value="true">True / Agree</option>
          <option value="false">False / Disagree</option>
          <option value="uncertain">Uncertain</option>
        </select>
        <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">All Sources</option>
          <option value="bank">Bank</option>
          <option value="news">News</option>
          <option value="ai">AI</option>
        </select>
        <span style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace",
          color: 'rgba(255,255,255,0.35)', marginLeft: 'auto',
        }}>
          {filtered.length} response{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 40 }}>
          No results match your filters.
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pageItems.map(entry => {
          const col = beliefColor(entry.value);
          const lbl = beliefLabel(entry.value);
          const pct = Math.round(entry.value * 100);

          return (
            <div key={entry.id} style={{
              padding: '12px 16px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>
                "{entry.probeText}"
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 4,
                    background: 'rgba(108,143,255,0.15)', color: '#6c8fff',
                    fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                  }}>
                    {CAT_SHORT[entry.probeCategory] || entry.probeCategory}
                  </span>
                  {entry.probeSource && entry.probeSource !== 'bank' && (
                    <span style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 3,
                      background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)',
                    }}>
                      {entry.probeSource.startsWith('news:') ? 'NEWS' : entry.probeSource.toUpperCase()}
                    </span>
                  )}
                  <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: col }}>
                    {lbl}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                    ({pct}/100)
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
          marginTop: 16, fontSize: 12,
        }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            style={{ ...pageBtnStyle, opacity: safePage <= 1 ? 0.3 : 1 }}
          >
            &#8592; Prev
          </button>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            style={{ ...pageBtnStyle, opacity: safePage >= totalPages ? 0.3 : 1 }}
          >
            Next &#8594;
          </button>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 6,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', fontSize: 12, minWidth: 150,
};

const selectStyle: React.CSSProperties = {
  padding: '6px 8px', borderRadius: 6,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', fontSize: 11,
};

const pageBtnStyle: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 6,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.6)', fontSize: 11, cursor: 'pointer',
  fontFamily: "'Space Mono', monospace",
};
