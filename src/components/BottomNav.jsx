import { NavLink, useLocation } from 'react-router-dom';

const items = [
  { to: '/', icon: 'ti-home', label: 'Home' },
  { to: '/quests', icon: 'ti-target-arrow', label: 'Quests' },
  { to: '/scan', icon: 'ti-camera', label: 'Scan', center: true },
  { to: '/streak', icon: 'ti-flame', label: 'Streak' },
  { to: '/rewards', icon: 'ti-gift', label: 'Rewards' }
];

export default function BottomNav() {
  const location = useLocation();
  // Hide nav on onboarding and scan camera
  if (location.pathname === '/onboarding' || location.pathname === '/scan') return null;

  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}${it.center ? ' center' : ''}`}>
          <i className={`ti ${it.icon}`} aria-hidden="true"></i>
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
