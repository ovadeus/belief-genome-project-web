import { useRef, useEffect } from 'react';

interface NeuromapProps {
  dnaString: string;
  totalResponses: number;
  dimensionsCovered: number;
  overallConfidence: number;
}

export default function Neuromap({ dnaString, totalResponses, dimensionsCovered, overallConfidence }: NeuromapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sentRef = useRef(false);

  useEffect(() => {
    sentRef.current = false;
  }, [dnaString, totalResponses, dimensionsCovered, overallConfidence]);

  const sendData = () => {
    if (!iframeRef.current?.contentWindow || sentRef.current || !dnaString) return;
    const iframeSrc = iframeRef.current.src;
    let targetOrigin: string;
    try {
      targetOrigin = new URL(iframeSrc).origin;
    } catch {
      targetOrigin = window.location.origin;
    }
    iframeRef.current.contentWindow.postMessage({
      type: 'BGP_DNA_UPDATE',
      dnaString: String(dnaString).replace(/[^0-9a-zA-Z·.]/g, ''),
      totalResponses: Number(totalResponses) || 0,
      dimensionsCovered: Number(dimensionsCovered) || 0,
      overallConfidence: Number(overallConfidence) || 0,
    }, targetOrigin);
    sentRef.current = true;
  };

  return (
    <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: '#080810' }}>
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
  );
}
