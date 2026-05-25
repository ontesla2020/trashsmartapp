import { Link } from 'react-router-dom';
import Ring from '../components/Ring.jsx';
import { StreakBadge } from '../components/Badges.jsx';
import { useGameState } from '../state/useGameState.js';
import { DAILY_QUESTS, STREAMS } from '../lib/catalog.js';
import { LEVEL_XP } from '../lib/points.js';

const DAILY_TARGET = 5;

export default function Home() {
  const { state, derived } = useGameState();
  const { level, levelXp, tier } = derived;

  const recycleProgress = Math.min(1, (state.scansToday.recycle || 0) / DAILY_TARGET);
  const organicProgress = Math.min(1, (state.scansToday.organic || 0) / DAILY_TARGET);

  const completed = DAILY_QUESTS.filter((q) => {
    const p = state.quests[q.id];
    return p && p.progress >= q.target;
  }).length;

  return (
    <div className="screen home dark">
      <header className="home-header">
        <div className="greeting">Hi, Vipul</div>
        <StreakBadge count={Math.max(state.streaks.recycle.count, state.streaks.organic.count)} />
      </header>

      <section className="hero-card">
        <Ring
          size={84}
          outer={{ value: recycleProgress, color: STREAMS.recycle.accent, bg: 'rgba(151,196,89,0.15)' }}
          inner={{ value: organicProgress, color: STREAMS.organic.accent, bg: 'rgba(239,159,39,0.15)' }}
        />
        <div className="hero-meta">
          <div className="kicker green">LEVEL {level}</div>
          <div className="hero-title">{tier.label}</div>
          <div className="hero-sub">{Math.round(levelXp)} / {LEVEL_XP} XP</div>
        </div>
      </section>

      <section className="stat-grid">
        <div className="stat stat-recycle">
          <div className="stat-head"><i className="ti ti-recycle" aria-hidden="true"></i><span>RECYCLE</span></div>
          <div className="stat-value">{state.byStream.recycle.toLocaleString()}</div>
          <div className="stat-sub">+{calcToday(state, 'recycle')} today</div>
        </div>
        <div className="stat stat-organic">
          <div className="stat-head"><i className="ti ti-leaf" aria-hidden="true"></i><span>ORGANIC</span></div>
          <div className="stat-value">{state.byStream.organic.toLocaleString()}</div>
          <div className="stat-sub">+{calcToday(state, 'organic')} today</div>
        </div>
      </section>

      <section className="quests-strip">
        <div className="quests-head">
          <span>Today's quests</span>
          <span className="muted">{completed} / {DAILY_QUESTS.length}</span>
        </div>
        <div className="quests-bars">
          {DAILY_QUESTS.map((q) => {
            const p = state.quests[q.id] || { progress: 0 };
            const ratio = Math.min(1, p.progress / q.target);
            const color = STREAMS[q.stream]?.accent || '#888';
            return <div key={q.id} className="quest-bar" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div style={{ width: `${ratio * 100}%`, height: '100%', background: color, borderRadius: '999px' }}></div>
            </div>;
          })}
        </div>
      </section>

      <Link to="/scan" className="btn primary pill jumbo">
        <i className="ti ti-camera" aria-hidden="true"></i> Quick scan
      </Link>
    </div>
  );
}

function calcToday(state, stream) {
  const today = new Date().toLocaleDateString('en-CA');
  return state.history
    .filter((h) => h.stream === stream && new Date(h.at).toLocaleDateString('en-CA') === today)
    .reduce((sum, h) => sum + h.xp, 0);
}
