import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameStateProvider, useGameState } from './state/useGameState.js';
import BottomNav from './components/BottomNav.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Scan from './screens/Scan.jsx';
import ScanResult from './screens/ScanResult.jsx';
import Quests from './screens/Quests.jsx';
import Streak from './screens/Streak.jsx';
import Rewards from './screens/Rewards.jsx';

function RequireOnboarded({ children }) {
  const { state } = useGameState();
  if (!state.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <GameStateProvider>
      <HashRouter>
        <div className="app-shell">
          <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<RequireOnboarded><Home /></RequireOnboarded>} />
          <Route path="/scan" element={<RequireOnboarded><Scan /></RequireOnboarded>} />
          <Route path="/scan/result" element={<RequireOnboarded><ScanResult /></RequireOnboarded>} />
          <Route path="/quests" element={<RequireOnboarded><Quests /></RequireOnboarded>} />
          <Route path="/streak" element={<RequireOnboarded><Streak /></RequireOnboarded>} />
          <Route path="/rewards" element={<RequireOnboarded><Rewards /></RequireOnboarded>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </HashRouter>
    </GameStateProvider>
  );
}
