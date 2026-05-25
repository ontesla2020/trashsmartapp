import { DAILY_QUESTS, STREAMS } from '../lib/catalog.js';
import { useGameState } from '../state/useGameState.js';

export default function Quests() {
  const { state, actions } = useGameState();

  const grouped = DAILY_QUESTS.reduce((acc, q) => {
    (acc[q.stream] = acc[q.stream] || []).push(q);
    return acc;
  }, {});

  return (
    <div className="screen quests">
      <header className="screen-head">
        <h1>Today</h1>
        <p className="muted">Complete both streams for a 1.5× bonus on next scan.</p>
      </header>

      {Object.entries(grouped).map(([streamId, defs]) => {
        const s = STREAMS[streamId];
        return (
          <section key={streamId} className="quest-group" style={{ background: s.soft }}>
            <div className="quest-group-head" style={{ color: s.dark }}>
              <i className={`ti ${s.icon}`} aria-hidden="true"></i>
              <span>{s.label.toUpperCase()}</span>
            </div>
            {defs.map((q) => {
              const p = state.quests[q.id] || { progress: 0, claimed: false };
              const done = p.progress >= q.target;
              const ratio = Math.min(1, p.progress / q.target);
              return (
                <div key={q.id} className="quest-row">
                  <div className="quest-row-top">
                    <div className="quest-title">{q.title}</div>
                    <div className="quest-bonus" style={{ color: s.color }}>+{q.bonus}</div>
                  </div>
                  <div className="quest-bar-wrap">
                    <div className="quest-bar-fill" style={{ width: `${ratio * 100}%`, background: s.color }}></div>
                  </div>
                  <div className="quest-row-bottom">
                    <span className="muted">{p.progress} / {q.target}</span>
                    {done && !p.claimed && (
                      <button className="btn-link" style={{ color: s.color }} onClick={() => actions.claimQuest(q.id)}>Claim</button>
                    )}
                    {p.claimed && <span className="claimed" style={{ color: s.color }}>Claimed</span>}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
