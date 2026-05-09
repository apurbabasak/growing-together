'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [phase, setPhase] = useState('splash');
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setTextVisible(true), 800);
    setTimeout(() => setPhase('main'), 5000);
  }, []);

  if (phase === 'splash') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Georgia, serif',
        overflow: 'hidden',
        position: 'relative'
      }}>

        {/* Deep cosmic background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, #1a0800 0%, #08001a 50%, #000000 100%)',
        }} />

        {/* Stars */}
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            borderRadius: '50%',
            background: '#FFD700',
            left: `${5 + i * 4.5}%`,
            top: `${10 + (i * 37) % 80}%`,
            opacity: 0.4 + (i % 5) * 0.1,
            zIndex: 1,
            animation: `twinkle ${2 + i * 0.3}s ease-in-out infinite alternate`
          }} />
        ))}

        {/* Golden glow behind chakra */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,180,0,0.35) 0%, rgba(255,100,0,0.15) 50%, transparent 75%)',
          animation: 'pulse 2s ease-in-out infinite alternate',
          zIndex: 1
        }} />

        {/* Chakra image - no rotation */}
        <div style={{
          width: '260px',
          height: '260px',
          marginBottom: '40px',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundImage: 'url(https://donations.iskconsouthbengaluru.com/wp-content/uploads/sites/6/2022/05/Sudarshana-Chakra.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'drop-shadow(0 0 25px rgba(255,200,0,0.95)) brightness(1.1) contrast(1.2)',
          }} />
        </div>

        {/* Welcome text */}
        <div style={{
          textAlign: 'center',
          padding: '0 30px',
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1.5s ease',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 2
        }}>
          <p style={{
            color: '#FFD700',
            fontSize: '17px',
            lineHeight: '1.9',
            textShadow: '0 0 20px rgba(255,215,0,0.9)',
            margin: 0,
            letterSpacing: '0.5px'
          }}>
            Hare Krishna, welcome to the divine environment to track your progress to go back to Godhead
          </p>
          <p style={{
            color: '#FF9933',
            fontSize: '13px',
            marginTop: '16px',
            opacity: 0.85,
            letterSpacing: '1px'
          }}>
            🪷 Sadhana Sangha — Tracking our progress back to Godhead 🪷
          </p>
        </div>

        <style>{`
          @keyframes pulse {
            from { transform: scale(1); opacity: 0.6; }
            to { transform: scale(1.15); opacity: 1; }
          }
          @keyframes twinkle {
            from { opacity: 0.2; }
            to { opacity: 0.9; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '40px' }}>🕉️</p>
        <h1 style={{ color: '#FF9933', fontSize: '24px' }}>Growing Together to Eternity</h1>
        <p style={{ color: '#6B6B6B' }}>Dashboard coming next...</p>
      </div>
    </div>
  );
}