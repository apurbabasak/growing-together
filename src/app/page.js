'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Splash() {
  const router = useRouter();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let angle = 0;
    const rotateInterval = setInterval(() => {
      angle += 1.5;
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
    }, 3500);

    return () => {
      clearInterval(rotateInterval);
      clearTimeout(timer);
    };
  }, []);

  const spokes = Array.from({ length: 32 });
  const innerSpokes = Array.from({ length: 32 });
  const flames = Array.from({ length: 32 });

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

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,140,0,0.25) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -60%)'
      }} />

      {/* Chakra Container */}
      <div style={{
        position: 'relative',
        width: '260px',
        height: '260px',
        marginBottom: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>

        {/* Rotating Chakra */}
        <div style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          transform: `rotate(${rotation}deg)`,
        }}>
          <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" width="260" height="260">
            <defs>
              <radialGradient id="goldGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF0A0" />
                <stop offset="40%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#B8860B" />
              </radialGradient>
              <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF8DC" />
                <stop offset="60%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF8C00" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outermost flame ring - 32 flames */}
            {flames.map((_, i) => {
              const angle = (i * 360) / 32;
              const rad = (angle * Math.PI) / 180;
              const radL = ((angle - 4) * Math.PI) / 180;
              const radR = ((angle + 4) * Math.PI) / 180;
              const tipX = 150 + 145 * Math.cos(rad);
              const tipY = 150 + 145 * Math.sin(rad);
              const baseL = 150 + 125 * Math.cos(radL);
              const baseY_L = 150 + 125 * Math.sin(radL);
              const baseR = 150 + 125 * Math.cos(radR);
              const baseY_R = 150 + 125 * Math.sin(radR);
              return (
                <polygon key={i}
                  points={`${tipX},${tipY} ${baseL},${baseY_L} ${baseR},${baseY_R}`}
                  fill="url(#goldGrad)" filter="url(#glow)" opacity="0.95" />
              );
            })}

            {/* Outer rim circles */}
            <circle cx="150" cy="150" r="122" fill="none" stroke="#FFD700" strokeWidth="3.5" filter="url(#glow)" />
            <circle cx="150" cy="150" r="115" fill="none" stroke="#B8860B" strokeWidth="1.5" />
            <circle cx="150" cy="150" r="108" fill="none" stroke="#FFD700" strokeWidth="2" />

            {/* 32 main spokes */}
            {spokes.map((_, i) => {
              const angle = (i * 360) / 32;
              const rad = (angle * Math.PI) / 180;
              const x1 = 150 + 42 * Math.cos(rad);
              const y1 = 150 + 42 * Math.sin(rad);
              const x2 = 150 + 106 * Math.cos(rad);
              const y2 = 150 + 106 * Math.sin(rad);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="url(#goldGrad)" strokeWidth="3.5"
                  strokeLinecap="round" filter="url(#glow)" />
              );
            })}

            {/* 32 secondary thin spokes between main spokes */}
            {innerSpokes.map((_, i) => {
              const angle = (i * 360) / 32 + 5.625;
              const rad = (angle * Math.PI) / 180;
              const x1 = 150 + 48 * Math.cos(rad);
              const y1 = 150 + 48 * Math.sin(rad);
              const x2 = 150 + 100 * Math.cos(rad);
              const y2 = 150 + 100 * Math.sin(rad);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#FFD700" strokeWidth="1.2"
                  strokeLinecap="round" opacity="0.6" />
              );
            })}

            {/* Inner decorative ring */}
            <circle cx="150" cy="150" r="50" fill="none" stroke="#FFD700" strokeWidth="2.5" filter="url(#glow)" />
            <circle cx="150" cy="150" r="44" fill="none" stroke="#B8860B" strokeWidth="1" />

            {/* Hub - 8 petal lotus */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 360) / 8;
              const rad = (angle * Math.PI) / 180;
              const radL = ((angle - 18) * Math.PI) / 180;
              const radR = ((angle + 18) * Math.PI) / 180;
              const tipX = 150 + 40 * Math.cos(rad);
              const tipY = 150 + 40 * Math.sin(rad);
              const baseL = 150 + 20 * Math.cos(radL);
              const baseYL = 150 + 20 * Math.sin(radL);
              const baseR = 150 + 20 * Math.cos(radR);
              const baseYR = 150 + 20 * Math.sin(radR);
              return (
                <polygon key={i}
                  points={`${tipX},${tipY} ${baseL},${baseYL} ${baseR},${baseYR}`}
                  fill="url(#goldGrad)" opacity="0.9" />
              );
            })}

            {/* Center hub circle */}
            <circle cx="150" cy="150" r="22" fill="url(#centerGrad)" filter="url(#glow)" />
            <circle cx="150" cy="150" r="22" fill="none" stroke="#FFF0A0" strokeWidth="1.5" />
            <circle cx="150" cy="150" r="14" fill="#FF8C00" opacity="0.5" />
            <circle cx="150" cy="150" r="8" fill="#FFF8DC" />

          </svg>
        </div>

        {/* Center Om - fixed, not rotating */}
        <div style={{
          position: 'absolute',
          fontSize: '26px',
          zIndex: 10,
          filter: 'drop-shadow(0 0 8px rgba(255,200,0,0.9))'
        }}>
          🕉️
        </div>
      </div>

      {/* App Name */}
      <h1 style={{
        color: '#FFD700',
        fontSize: '26px',
        margin: '0 0 6px',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '0 0 20px rgba(255,180,0,0.8)',
        letterSpacing: '1px'
      }}>
        Growing Together
      </h1>
      <h2 style={{
        color: '#FF9933',
        fontSize: '15px',
        margin: '0 0 14px',
        fontWeight: 'normal',
        textAlign: 'center',
        letterSpacing: '2px'
      }}>
        TO ETERNITY
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

      {/* Animated dots */}
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