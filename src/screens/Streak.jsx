import Ring from '../components/Ring.jsx';
import { useGameState } from '../state/useGameState.js';
import { STREAMS } from '../lib/catalog.js';
import { today } from '../lib/points.js';

const DAILY_TARGET = 5;

export default function Streak() {
  const { state } = useGameState();
  const t = today();

  const recycleToday = state.scansToday.recycle || 0;
  const organicToday = state.scansToday.organic || 0;
  const recycleRatio = Math.min(1, recycleToday / DAILY_TARGET);
  const organicRatio = Math.min(1, organicToday / DAILY_TARGET);

  const recycleStreak = state.streaks.recycle.count;
  const organicStreak = state.streaks.organic.count;

  return (
    <div className="screen streak-screen dark">
      <header className="screen-head">
        <h1>Today's rings</h1>
        <p className="muted">Close both to keep your dual streak alive.</p>
      </header>

      <div className="rings-wrap">
        <Ring
          size={180}
          strokeWidth={5}
          outer={{ value: recycleRatio, color: STREAMS.recycle.accent, bg: 'rgba(151,196,89,0.15)' }}
          inner={{ value: organicRatio, color: STREAMS.organic.accent, bg: 'rgba(239,159,39,0.15)' }}
        />
      </div>

      <div className="ring-stats">
        <div className="ring-stat" style={{ background: 'rgba(151,196,89,0.15)' }}>
          <div className="dot" style={{ background: STREAMS.recycle.accent }}></div>
          <div className="ring-stat-label" style={{ color: STREAMS.recycle.accent }}>RECYCLE</div>
          <div className="ring-stat-value">{Math.round(recycleRatio * 100)}%</div>
          <div className="ring-stat-sub">{recycleToday} / {DAILY_TARGET} items</div>
        </div>
        <div className="ring-stat" style={{ background: 'rgba(239,159,39,0.15)' }}>
          <div className="dot" style={{ background: STREAMS.organic.accent }}></div>
          <div className="ring-stat-label" style={{ color: STREAMS.organic.accent }}>ORGANIC</div>
          <div className="ring-stat-value">{Math.round(organicRatio * 100)}%</div>
          <div className="ring-stat-sub">{organicToday} / {DAILY_TARGET} items</div>
        </div>
      </div>

      <div className="streak-row">
        <div className="streak-row-left">
          <i className="ti ti-flame" aria-hidden="true"></i>
          <div>
            <div className="streak-count">{Math.max(recycleStreak, organicStreak)} day</div>
            <div className="muted small">recycle {recycleStreak} · organic {organicStreak}</div>
          </div>
        </div>
        <div className="streak-row-right">14 days → +500 XP</div>
      </div>
    </div>
  );
}
