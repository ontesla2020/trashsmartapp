import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { STREAMS } from '../lib/catalog.js';
import { useGameState } from '../state/useGameState.js';

export default function ScanResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { actions } = useGameState();
  const result = location.state?.result;
  const photoBlob = location.state?.photoBlob;
  const recordedRef = useRef(false);
  const [verified, setVerified] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const fileRef = useRef(null);

  // Record the scan exactly once when this screen mounts.
  useEffect(() => {
    if (recordedRef.current || !result) return;
    recordedRef.current = true;
    actions.recordScan({
      itemId: result.item.id || 'unknown',
      stream: result.item.stream,
      baseXp: result.item.xp,
      verified: false,
      arm: result.arm,
      space: result.space,
      label: result.label,
      confidence: result.confidence
    });
  }, [result, actions]);

  // Build a fresh object URL for the captured photo and free it on unmount.
  useEffect(() => {
    if (!photoBlob) return undefined;
    const url = URL.createObjectURL(photoBlob);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoBlob]);

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
      verified: true,
      arm: result.arm,
      space: result.space,
      label: result.label,
      confidence: result.confidence
    });
  }

  return (
    <div className="screen scan-result">
      <div className="result-top-row">
        <span className="stream-pill" style={{ background: stream.soft, color: stream.dark }}>
          <i className={`ti ${stream.icon}`} aria-hidden="true"></i>
          {stream.label.toUpperCase()} STREAM
        </span>
        {result.arm && (
          <span className={`arm-pill${result.arm.startsWith('B') ? ' arm-b' : ''}`}>
            <i className="ti ti-flask" aria-hidden="true"></i>
            {result.arm}
          </span>
        )}
      </div>

      {photoUrl && (
        <div className="result-photo">
          <img src={photoUrl} alt="Your scan" />
          <span className="result-photo-corner tl"></span>
          <span className="result-photo-corner tr"></span>
          <span className="result-photo-corner bl"></span>
          <span className="result-photo-corner br"></span>
        </div>
      )}

      <div className="result-meta">
        <div className="kicker">{result.uncertain ? 'CLOSEST GUESS' : 'IDENTIFIED'}</div>
        <h1>{result.item.name}</h1>
        <div className="result-sub">
          {Math.round((result.confidence || 0) * 100)}% confidence
          {result.source === 'mock' && <span className="muted"> · mock model</span>}
          {result.source === 'huggingface-space' && <span className="muted"> · your HF model</span>}
        </div>
        {result.uncertain && (
          <div className="uncertain-note">
            <i className="ti ti-alert-triangle" aria-hidden="true"></i>
            Model isn't sure — try a tighter shot or better lighting. We're awarding partial XP either way.
          </div>
        )}
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
