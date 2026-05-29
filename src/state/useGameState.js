import { createContext, createElement, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { load, save } from '../lib/storage.js';
import { DAILY_QUESTS } from '../lib/catalog.js';
import { today, tickStreak, comboMultiplier, levelFromXp, xpInLevel, tierForLevel } from '../lib/points.js';

const INITIAL_STATE = {
  onboarded: false,
  streams: { recycle: true, organic: true, ewaste: false },
  xp: 0,
  byStream: { recycle: 0, organic: 0, ewaste: 0 },
  scansToday: { recycle: 0, organic: 0, ewaste: 0, date: today() },
  streaks: {
    recycle: { count: 0, lastDate: null },
    organic: { count: 0, lastDate: null }
  },
  questsDate: today(),
  quests: {},
  rewardsRedeemed: [],
  history: []
};

function initQuests() {
  const q = {};
  for (const def of DAILY_QUESTS) q[def.id] = { progress: 0, claimed: false };
  return q;
}

function freshState() {
  return {
    ...INITIAL_STATE,
    quests: initQuests(),
    scansToday: { recycle: 0, organic: 0, ewaste: 0, date: today() },
    questsDate: today()
  };
}

function migrate(loaded) {
  if (!loaded) return freshState();
  const t = today();
  let next = loaded;
  if (loaded.scansToday?.date !== t) {
    next = { ...next, scansToday: { recycle: 0, organic: 0, ewaste: 0, date: t } };
  }
  if (loaded.questsDate !== t) {
    next = { ...next, questsDate: t, quests: initQuests() };
  }
  // Ensure new quest ids appear after a catalog change.
  const merged = { ...initQuests(), ...(next.quests || {}) };
  return { ...next, quests: merged };
}

const GameStateContext = createContext(null);

export function GameStateProvider({ children }) {
  const [state, setState] = useState(() => migrate(load('state', freshState())));

  useEffect(() => {
    save('state', state);
  }, [state]);

  const setOnboarded = useCallback((streams) => {
    setState((s) => ({ ...s, onboarded: true, streams: { ...s.streams, ...streams } }));
  }, []);

  // Records a scan. baseXp is the literal XP to add (caller controls amount).
  // verified: true is used for the bonus call after the user snaps a proof photo.
  // Verify-required quests only tick when verified is true.
  const recordScan = useCallback(({ itemId, stream, baseXp, verified, arm, space, label, confidence }) => {
    setState((s) => {
      const combo = comboMultiplier(s);
      const earned = Math.round(baseXp * combo);

      const newStreaks = { ...s.streaks };
      if (newStreaks[stream]) {
        newStreaks[stream] = tickStreak(newStreaks[stream], true);
      }

      const scansToday = { ...s.scansToday };
      // Only count the base scan toward the daily counter, not verify bonuses.
      if (!verified) {
        scansToday[stream] = (scansToday[stream] || 0) + 1;
      }

      const quests = { ...s.quests };
      for (const def of DAILY_QUESTS) {
        const q = quests[def.id] || { progress: 0, claimed: false };
        if (q.claimed) continue;
        if (def.stream !== stream) continue;
        if (def.requiresVerify && !verified) continue;
        if (!def.requiresVerify && verified) continue;
        const progress = Math.min(def.target, q.progress + 1);
        quests[def.id] = { ...q, progress };
      }

      const history = [
        {
          at: Date.now(),
          itemId,
          stream,
          xp: earned,
          verified: !!verified,
          combo,
          arm: arm || null,
          space: space || null,
          label: label || null,
          confidence: typeof confidence === 'number' ? confidence : null
        },
        ...s.history
      ].slice(0, 200);

      return {
        ...s,
        xp: s.xp + earned,
        byStream: { ...s.byStream, [stream]: (s.byStream[stream] || 0) + earned },
        scansToday,
        streaks: newStreaks,
        quests,
        history
      };
    });
  }, []);

  const claimQuest = useCallback((questId) => {
    setState((s) => {
      const def = DAILY_QUESTS.find((d) => d.id === questId);
      const q = s.quests[questId];
      if (!def || !q || q.claimed || q.progress < def.target) return s;
      return {
        ...s,
        xp: s.xp + def.bonus,
        byStream: { ...s.byStream, [def.stream]: (s.byStream[def.stream] || 0) + def.bonus },
        quests: { ...s.quests, [questId]: { ...q, claimed: true } }
      };
    });
  }, []);

  const redeemReward = useCallback((reward) => {
    setState((s) => {
      if (s.xp < reward.cost) return s;
      return {
        ...s,
        xp: s.xp - reward.cost,
        rewardsRedeemed: [
          { id: reward.id, name: reward.name, at: Date.now() },
          ...s.rewardsRedeemed
        ]
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    setState(freshState());
  }, []);

  const level = useMemo(() => levelFromXp(state.xp), [state.xp]);
  const levelXp = useMemo(() => xpInLevel(state.xp), [state.xp]);
  const tier = useMemo(() => tierForLevel(level), [level]);

  const value = useMemo(
    () => ({
      state,
      derived: { level, levelXp, tier },
      actions: { setOnboarded, recordScan, claimQuest, redeemReward, resetAll }
    }),
    [state, level, levelXp, tier, setOnboarded, recordScan, claimQuest, redeemReward, resetAll]
  );

  return createElement(GameStateContext.Provider, { value }, children);
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error('useGameState must be used inside <GameStateProvider>');
  }
  return ctx;
}
