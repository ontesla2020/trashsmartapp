// Small pill-shaped badges used in headers.
export function PointsBadge({ value }) {
  return (
    <span className="badge points">
      <i className="ti ti-coin" aria-hidden="true"></i>
      {Number(value || 0).toLocaleString()}
    </span>
  );
}

export function StreakBadge({ count }) {
  return (
    <span className="badge streak">
      <i className="ti ti-flame" aria-hidden="true"></i>
      {count}
    </span>
  );
}

export function StreamChip({ stream, label, icon, selected, onClick }) {
  return (
    <button type="button" className={`stream-chip stream-${stream}${selected ? ' selected' : ''}`} onClick={onClick}>
      {icon && <i className={`ti ${icon}`} aria-hidden="true"></i>}
      {label}
    </button>
  );
}
