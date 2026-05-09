'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const userName = localStorage.getItem('userName');
      const sanghaCode = localStorage.getItem('sanghaCode');
      if (userName && sanghaCode) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif'
    }}>
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>🕉️</div>
      <h1 style={{ color: '#FF9933', fontSize: '28px', margin: '0 0 10px', fontWeight: 'bold' }}>
        Growing Together to Eternity
      </h1>
      <p style={{ color: '#6B6B6B', fontSize: '15px', margin: 0 }}>
        Hare Krishna 🙏
      </p>
    </div>
  );
}