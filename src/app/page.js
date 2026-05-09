'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Splash() {
  const router = useRouter();
  const [rotation, setRotation] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }

    let angle = 0;
    const rotateInterval = setInterval(() => {
      angle += 1.2;
      setRotation(angle);
    }, 16);

    const timer = setTimeout(() => {
      const userName = localStorage.getItem('userName');
      const sanghaCode = localStorage.getItem('sanghaCode');
      if (userName && sanghaCode) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }, 4000);

    return () => {
      clearInterval(rotateInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1a0a00 0%, #2d1200 40%, #1a0800 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      overflow: 'hidden',
      position: 'relative'
    }}>

      <audio ref={audioRef} loop preload="auto">
        <source src="/flute.mp3" type="audio/mpeg" />
      </audio>

      <div style={{
        position: 'absolute',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,140,0,0.2) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -55%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '240px', height: '240px',
        position: 'relative',
        marginBottom: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <img
          src="/chakra.png"
          alt="Sudarshan Chakra"
          style={{
            width: '240px',
            height: '240px',
            objectFit: 'contain',
            transform: `rotate(${rotation}deg)`,
            filter: 'drop-shadow(0 0 20px rgba(255, 180, 0, 0.8))',
            position: 'absolute'
          }}
        />
      </div>

      <h1 style={{
        color: '#FFD700',
        fontSize: '26px',
        margin: '0 0 6px',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '0 0 20px rgba(255,180,0,0.8)',
        letterSpacing: '1px'
      }}>
        Growing Back Together
      </h1>
      <h2 style={{
        color: '#FF9933',
        fontSize: '16px',
        margin: '0 0 14px',
        fontWeight: 'normal',
        textAlign: 'center',
        letterSpacing: '2px'
      }}>
        TO GODHEAD
      </h2>
      <p style={{
        color: '#FFD700',
        fontSize: '13px',
        margin: 0,
        opacity: 0.8,
        textAlign: 'center',
        letterSpacing: '1px'
      }}>
        🙏 Hare Krishna 🙏
      </p>

      <div style={{ display: 'flex', gap: '8px', marginTop: '36px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#FFD700',
            animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite`
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}