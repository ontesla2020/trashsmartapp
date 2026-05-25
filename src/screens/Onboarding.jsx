import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STREAMS } from '../lib/catalog.js';
import { useGameState } from '../state/useGameState.js';

export default function Onboarding() {
  const navigate = useNavigate();
  const { actions } = useGameState();
  const [streams, setStreams] = useState({ recycle: true, organic: true, ewaste: false });

  function toggle(key) {
    setStreams((s) => ({ ...s, [key]: !s[key] }));
  }

  function finish() {
    actions.setOnboarded(streams);
    navigate('/', { replace: true });
  }

  return (
    <div className="screen onboarding dark">
      <div className="hero">
        <div className="kicker">WELCOME TO TRASHSMART</div>
        <h1>Pick your<br />impact streams</h1>
        <p className="hero-sub">Earn separately. Stack together.</p>
      </div>

      <div className="stream-options">
        {[
          { id: 'recycle', desc: 'Plastics · paper · glass · metal' },
          { id: 'organic', desc: 'Food scraps · yard · compost' },
          { id: 'ewaste',  desc: 'Batteries · electronics' }
        ].map(({ id, desc }) => {
          const s = STREAMS[id];
          const on = streams[id];
          return (
            <button
              key={id}
              type="button"
              className={`stream-option${on ? ' on' : ''}`}
              onClick={() => toggle(id)}
              style={{ borderColor: on ? s.accent : 'rgba(255,255,255,0.15)' }}
            >
              <div className="stream-icon" style={{ background: s.color }}>
                <i className={`ti ${s.icon}`} aria-hidden="true"></i>
              </div>
              <div className="stream-text">
                <div className="stream-label">{s.label}</div>
                <div className="stream-desc" style={{ color: on ? s.accent : 'rgba(255,255,255,0.5)' }}>{desc}</div>
              </div>
              <i className={`ti ${on ? 'ti-check' : 'ti-plus'}`} aria-hidden="true" style={{ color: on ? s.accent : 'rgba(255,255,255,0.3)' }}></i>
            </button>
          );
        })}
      </div>

      <button className="btn primary pill" onClick={finish}>Start playing</button>
    </div>
  );
}
