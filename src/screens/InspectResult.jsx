import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { STREAMS } from '../lib/catalog.js';

// Same color logic the Space uses for the contamination card.
function scoreColor(purity) {
  if (purity >= 0.8) return '#22c55e';
  if (purity >= 0.5) return '#f59e0b';
  return '#ef4444';
}

function streamLabel(id) {
  if (id === 'recycle') return 'Recycling';
  if (id === 'organic') return 'Compost';
  if (id === 'ewaste')  return 'E-waste';
  return 'Landfill';
}

function streamIcon(id) {
  const s = STREAMS[id];
  return s?.icon || 'ti-trash';
}

export default function InspectResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;
  const photoBlob = location.state?.photoBlob;
  const targetStream = location.state?.targetStream || report?.target || 'recycle';
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (!photoBlob) return undefined;
    const url = URL.createObjectURL(photoBlob);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoBlob]);

  if (!report) return <Navigate to="/scan" replace />;

  const purity = report.purity ?? 0;
  const contamination = report.contamination ?? 1 - purity;
  const grade = report.grade ?? '—';
  const items = report.items ?? [];
  const counts = report.counts ?? { clean: 0, contaminated: 0 };
  const headerColor = scoreColor(purity);
  const target = STREAMS[targetStream] || STREAMS.trash;

  return (
    <div className="screen scan-result">
      <div className="result-top-row">
        <span className="stream-pill" style={{ background: target.soft, color: target.dark }}>
          <i className={`ti ${target.icon}`} aria-hidden="true"></i>
          {streamLabel(targetStream).toUpperCase()} BIN
        </span>
        {report.arm && (
          <span className={`arm-pill${report.arm.startsWith('B') ? ' arm-b' : ''}`}>
            <i className="ti ti-flask" aria-hidden="true"></i>
            {report.arm}
          </span>
        )}
      </div>

      {photoUrl && (
        <div className="result-photo">
          <img src={photoUrl} alt="Your inspection" />
          <span className="result-photo-corner tl"></span>
          <span className="result-photo-corner tr"></span>
          <span className="result-photo-corner bl"></span>
          <span className="result-photo-corner br"></span>
        </div>
      )}

      <div className="contamination-card" style={{ background: headerColor }}>
        <div className="kicker">CONTAMINATION</div>
        <div className="contamination-big">{Math.round(contamination * 100)}%</div>
        <div className="contamination-sub">
          Grade {grade} · {counts.clean} correct · {counts.contaminated} misplaced
        </div>
      </div>

      <div className="items-list">
        <div className="items-list-head">
          <span>Detected items</span>
          <span className="muted">{items.length} total</span>
        </div>
        {items.length === 0 ? (
          <p className="muted small">No items detected. Try a wider shot of the bin.</p>
        ) : (
          <ul>
            {items.map((it, idx) => {
              const isClean = it.clean ?? (it.stream === targetStream);
              const itemStream = STREAMS[it.stream] || STREAMS.trash;
              return (
                <li key={idx} className={`item-row${isClean ? '' : ' bad'}`}>
                  <div className="item-row-left">
                    <span
                      className="item-stream-dot"
                      style={{ background: itemStream.color }}
                      aria-hidden="true"
                    />
                    <div className="item-row-text">
                      <div className="item-name">
                        {String(it.label || 'unknown').replace(/_/g, ' ')}
                      </div>
                      <div className="item-sub muted">
                        <i className={`ti ${streamIcon(it.stream)}`} aria-hidden="true"></i>
                        {streamLabel(it.stream)} · {Math.round((it.conf || 0) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className={`item-tag${isClean ? ' good' : ' bad'}`}>
                    {isClean ? (
                      <>
                        <i className="ti ti-check" aria-hidden="true"></i>
                        OK
                      </>
                    ) : (
                      <>
                        <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                        Wrong bin
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="result-actions">
        <button type="button" className="btn outline pill" onClick={() => navigate('/', { replace: true })}>
          Done
        </button>
        <button type="button" className="btn primary pill" onClick={() => navigate('/scan', { replace: true })}>
          Inspect again
        </button>
      </div>
    </div>
  );
}
