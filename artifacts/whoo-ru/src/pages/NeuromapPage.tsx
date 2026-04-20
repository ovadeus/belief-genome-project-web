import { useState, useEffect, useRef } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useRoute } from 'wouter';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function NeuromapPage() {
  const [, params] = useRoute('/neuromap/:key');
  const anonymousKey = params?.key || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genome, setGenome] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sentRef = useRef(false);

  useEffect(() => {
    if (!anonymousKey) {
      setError('No genome key provided.');
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/genome/lookup/${anonymousKey}`)
      .then(r => {
        if (!r.ok) throw new Error('Genome not found');
        return r.json();
      })
      .then(data => {
        setGenome(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Genome not found or invalid key.');
        setLoading(false);
      });
  }, [anonymousKey]);

  const sendData = () => {
    if (!iframeRef.current?.contentWindow || sentRef.current || !genome) return;
    iframeRef.current.contentWindow.postMessage({
      type: 'BGP_DNA_UPDATE',
      dnaString: genome.dnaString,
      totalResponses: genome.totalResponses || 0,
      dimensionsCovered: genome.dimensionsCovered || 0,
      overallConfidence: genome.overallConfidence || 0,
    }, '*');
    sentRef.current = true;
  };

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Neural <span className="text-primary">Belief Map</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            3D brain visualization mapping belief dimensions to neural regions
          </p>
        </div>

        {loading && (
          <div className="text-center text-muted-foreground py-20">Loading genome data...</div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-muted-foreground text-sm">
              Make sure you have a valid genome key in the URL: /neuromap/your-key-here
            </p>
          </div>
        )}

        {genome && !error && (
          <div style={{ borderRadius: 12, overflow: 'hidden', background: '#080810' }}>
            <iframe
              ref={iframeRef}
              src={`${import.meta.env.BASE_URL}assets/bgp_brain_3d.html`}
              onLoad={sendData}
              style={{
                width: '100%',
                height: 700,
                border: 'none',
                borderRadius: 12,
                display: 'block',
              }}
              title="Neural Belief Map"
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
