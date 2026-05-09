'use client';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: '/dashboard', icon: '🏠', label: 'Home' },
    { href: '/reading-together', icon: '📚', label: 'Reading' },
    { href: '/history', icon: '📜', label: 'History' },
    { href: '/profile', icon: '🪷', label: 'Profile' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white',
      borderTop: '1px solid rgba(255,153,51,0.2)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 0 18px',
      boxShadow: '0 -4px 20px rgba(255,153,51,0.1)',
      zIndex: 999
    }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <button key={tab.href} onClick={() => window.location.href = tab.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px', border: 'none', cursor: 'pointer', padding: '6px 14px',
              borderRadius: '16px', background: isActive ? '#FFF0E0' : 'none',
            }}>
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', fontFamily: 'Georgia, serif', color: isActive ? '#FF9933' : '#6B6B6B', fontWeight: isActive ? 'bold' : 'normal' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}