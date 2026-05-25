// SVG progress ring. Two concentric rings supported (recycle + organic).
export default function Ring({
  size = 110,
  outer = { value: 0.6, color: '#97C459', bg: 'rgba(151,196,89,0.15)' },
  inner = { value: 0.4, color: '#EF9F27', bg: 'rgba(239,159,39,0.15)' },
  strokeWidth = 5
}) {
  const r1 = 26;
  const r2 = 18;
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  return (
    <svg viewBox="0 0 60 60" width={size} height={size}>
      <circle cx="30" cy="30" r={r1} fill="none" stroke={outer.bg} strokeWidth={strokeWidth} />
      <circle
        cx="30"
        cy="30"
        r={r1}
        fill="none"
        stroke={outer.color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${(c1 * outer.value).toFixed(2)} ${c1.toFixed(2)}`}
        strokeLinecap="round"
        transform="rotate(-90 30 30)"
      />
      <circle cx="30" cy="30" r={r2} fill="none" stroke={inner.bg} strokeWidth={strokeWidth} />
      <circle
        cx="30"
        cy="30"
        r={r2}
        fill="none"
        stroke={inner.color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${(c2 * inner.value).toFixed(2)} ${c2.toFixed(2)}`}
        strokeLinecap="round"
        transform="rotate(-90 30 30)"
      />
    </svg>
  );
}
