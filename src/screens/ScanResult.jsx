import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { STREAMS } from '../lib/catalog.js';
import { useGameState } from '../state/useGameState.js';

export default function ScanResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { actions } = useGameState();
  const result = location.state?.result;
  const recordedRef = useRef(false);
  const [verified, setVerified] = useState(false);
  const fileRef = useRef(null);

  // Record the scan exactly once when this screen mounts.
  useEffect(() => {
    if (recordedRef.current || !result) return;
    recordedRef.current = true;
    actions.recordScan({
      itemId: result.item.id || 'unknown',
      stream: result.item.stream,
      baseXp: result.item.xp,
      verified: false
    });
  }, [result, actions]);

  if (!result) return <Navigate to="/scan" replace />;

  const stream = STREAMS[result.item.stream] || STREAMS.trash;

  function claimVerify(e) {
    const file = e.target.files?.[0];
    if (!file || verified) return;
    // Trust-based: any second photo unlocks the bonus.
    setVerified(true);
    actions.recordScan({
      itemId: result.item.id + ':verify',
      stream: result.item.stream,
      baseXp: Math.round(result.item.xp * 0.5),
      verified: true
    });
  }

  return (
    <div className="screen scan-result">
      <span className="stream-pill" style={{ background: stream.soft, color: stream.dark }}>
        <i className={`ti ${stream.icon}`} aria-hidden="true"></i>
        {stream.label.toUpperCase()} STREAM
      </span>

      <div className="result-meta">
        <div className="kicker">IDENTIFIED</div>
        <h1>{result.item.name}</h1>
        <div className="result-sub">
          {Math.round((result.confidence || 0) * 100)}% confidence
          {result.source === 'mock' && <span className="muted"> · mock model</span>}
        </div>
      </div>

      <div className="xp-card" style={{ background: stream.color }}>
        <div className="kicker">XP EARNED</div>
        <div className="xp-big">+{result.item.xp}</div>
        <div className="xp-sub">{result.item.xp} base · combos and verify add more</div>
      </div>

      <div className="tip-card">
        <div className="tip-head">
          <i className="ti ti-info-circle" aria-hidden="true"></i>
          <span>Best practice</span>
        </div>
        <p>{result.item.tip}</p>
        <p className="tip-bin">Drop point: <strong>{result.item.bin}</strong></p>
      </div>

      <button
        type="button"
        className={`btn verify${verified ? ' done' : ''}`}
        onClick={() => fileRef.current?.click()}
        disabled={verified}
      >
        <i className={`ti ${verified ? 'ti-check' : 'ti-camera-plus'}`} aria-hidden="true"></i>
        {verified ? `Verified — +${Math.round(result.item.xp * 0.5)} bonus XP claimed` : `Snap proof for +${Math.round(result.item.xp * 0.5)} bonus XP`}
      </button>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={claimVerify} hidden />

      <div className="result-actions">
        <button type="button" className="btn outline pill" onClick={() => navigate('/', { replace: true })}>Done</button>
        <button type="button" className="btn primary pill" onClick={() => navigate('/scan', { replace: true })}>Scan again</button>
      </div>
    </div>
  );
}
