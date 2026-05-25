import { useState } from 'react';
import { REWARDS } from '../lib/catalog.js';
import { useGameState } from '../state/useGameState.js';
import { PointsBadge } from '../components/Badges.jsx';

export default function Rewards() {
  const { state, actions } = useGameState();
  const [filter, setFilter] = useState('all');
  const [confirmId, setConfirmId] = useState(null);

  const filtered = REWARDS.filter((r) => filter === 'all' || r.category === filter);
  const featured = REWARDS.find((r) => r.featured);
  const others = filtered.filter((r) => !r.featured);

  function redeem(reward) {
    actions.redeemReward(reward);
    setConfirmId(reward.id);
    setTimeout(() => setConfirmId(null), 2500);
  }

  return (
    <div className="screen rewards">
      <header className="screen-head row">
        <h1>Shop</h1>
        <PointsBadge value={state.xp} />
      </header>

      {featured && (
        <article className="reward-feature">
          <span className="badge featured-pill">FEATURED</span>
          <i className={`ti ${featured.icon}`} aria-hidden="true"></i>
          <div className="reward-feature-title">{featured.name}</div>
          <div className="reward-feature-detail">{featured.detail}</div>
          <div className="reward-feature-foot">
            <div className="reward-cost">{featured.cost} pts</div>
            <button
              className="btn primary pill sm"
              onClick={() => redeem(featured)}
              disabled={state.xp < featured.cost || confirmId === featured.id}
            >
              {confirmId === featured.id ? 'Redeemed' : 'Redeem'}
            </button>
          </div>
        </article>
      )}

      <div className="filter-row">
        {['all', 'cafe', 'shop', 'in-app'].map((f) => (
          <button
            key={f}
            type="button"
            className={`stream-chip${filter === f ? ' selected' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="reward-grid">
        {others.map((r) => (
          <article key={r.id} className="reward-card">
            <div className="reward-icon"><i className={`ti ${r.icon}`} aria-hidden="true"></i></div>
            <div className="reward-name">{r.name}</div>
            <div className="reward-detail">{r.detail}</div>
            <button
              className="reward-cost-btn"
              onClick={() => redeem(r)}
              disabled={state.xp < r.cost || confirmId === r.id}
            >
              {confirmId === r.id ? 'Redeemed' : `${r.cost} pts`}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
