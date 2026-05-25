// XP, levels, streaks. Keep math here so screens stay declarative.

export const LEVEL_XP = 1000; // XP per level — linear for simplicity

export const TIERS = [
  { id: 'sprout',    label: 'Green Sprout',  minLevel: 1 },
  { id: 'sapling',   label: 'Sapling',       minLevel: 4 },
  { id: 'oak',       label: 'Oak',           minLevel: 7 },
  { id: 'oldgrowth', label: 'Old Growth',    minLevel: 10 }
];

export function levelFromXp(xp) {
  return Math.floor(xp / LEVEL_XP) + 1;
}

export function xpInLevel(xp) {
  return xp % LEVEL_XP;
}

export function tierForLevel(level) {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (level >= t.minLevel) current = t;
  }
  return current;
}

// Returns a fresh ISO date string (YYYY-MM-DD) in the user's local timezone.
export function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Streak tick: returns the next streak object given the previous lastDate.
// Daily compost streak is tracked separately from recycle streak.
export function tickStreak(streak, didToday) {
  if (!didToday) return streak;
  const t = today();
  if (streak.lastDate === t) return streak; // already counted today
  if (streak.lastDate === yesterday()) {
    return { count: streak.count + 1, lastDate: t };
  }
  // gap — restart
  return { count: 1, lastDate: t };
}

// Apply a combo multiplier if both rings are active today.
export function comboMultiplier(state) {
  const t = today();
  const ringRecycle = state.streaks.recycle.lastDate === t;
  const ringOrganic = state.streaks.organic.lastDate === t;
  return ringRecycle && ringOrganic ? 1.5 : 1;
}
