'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();

  const tabs = [
    { label: 'Home', icon: '🏠', route: '/dashboard' },
    { label: 'Books', icon: '📚', route: '/books' },
    { label: 'Reading', icon: '📖', route: '/reading-together' },
    { label: 'Progress', icon: '📊', route: '/progress' },
    { label: 'Profile', icon: '👤', route: '/profile' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white',
      borderTop: '1px solid rgba(255,153,51,0.2)',
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 14px',
      boxShadow: '0 -4px 20px rgba(255,153,51,0.1)',
      zIndex: 50
    }}>
      {tabs.map(tab => {
        const active = path === tab.route;
        return (
          <button key={tab.route} onClick={() => router.push(tab.route)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 8px'
            }}>
            <span style={{ fontSize: '20px', filter: active ? 'none' : 'grayscale(60%)', transition: 'filter 0.2s' }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', color: active ? '#FF9933' : '#6B6B6B', fontFamily: 'Georgia, serif', fontWeight: active ? 'bold' : 'normal' }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}