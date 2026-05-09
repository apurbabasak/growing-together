'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Splash() {
  const router = useRouter();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Rotate the Sudarshan Chakra
    const rotateInterval = setInterval(() => {
      setRotation(prev => prev + 2);
    }, 16);

    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      const userName = localStorage.getItem('userName');
      const sanghaCode = localStorage.getItem('sanghaCode');
      if (userName && sanghaCode) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }, 3000);

    return () => {
      clearInterval(rotateInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      overflow: 'hidden'
    }}>

      {/* Sudarshan Chakra */}
      <div style={{
        position: 'relative',
        width: '180px',
        height: '180px',
        marginBottom: '32px'
      }}>

        {/* Outer glow ring */}
        <div style={{
          position: 'absolute',
          inset: '-10px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,153,51,0.3) 0%, transparent 70%)',
        }} />

        {/* Rotating Chakra SVG */}
        <div style={{
          width: '180px',
          height: '180px',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.016s linear'
        }}>
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="180" height="180">
            {/* Outer circle */}
            <circle cx="100" cy="100" r="95" fill="none" stroke="#FF9933" strokeWidth="4" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="#FFD700" strokeWidth="2" />

            {/* 16 spokes */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              const rad = (angle * Math.PI) / 180;
              const x1 = 100 + 30 * Math.cos(rad);
              const y1 = 100 + 30 * Math.sin(rad);
              const x2 = 100 + 82 * Math.cos(rad);
              const y2 = 100 + 82 * Math.sin(rad);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#FF9933" strokeWidth="3" strokeLinecap="round" />
              );
            })}

            {/* 16 triangular tips */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              const rad = (angle * Math.PI) / 180;
              const radL = ((angle - 5) * Math.PI) / 180;
              const radR = ((angle + 5) * Math.PI) / 180;
              const tipX = 100 + 95 * Math.cos(rad);
              const tipY = 100 + 95 * Math.sin(rad);
              const leftX = 100 + 82 * Math.cos(radL);
              const leftY = 100 + 82 * Math.sin(radL);
              const rightX = 100 + 82 * Math.cos(radR);
              const rightY = 100 + 82 * Math.sin(radR);
              return (
                <polygon key={i}
                  points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
                  fill="#FF9933" opacity="0.9" />
              );
            })}

            {/* Inner hub circle */}
            <circle cx="100" cy="100" r="28" fill="#FF9933" opacity="0.15" />
            <circle cx="100" cy="100" r="28" fill="none" stroke="#FF9933" strokeWidth="3" />
            <circle cx="100" cy="100" r="18" fill="#FF9933" opacity="0.3" />
            <circle cx="100" cy="100" r="10" fill="#FF9933" />
          </svg>
        </div>

        {/* Center Om symbol (not rotating) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '28px',
          lineHeight: 1
        }}>
          🕉️
        </div>
      </div>

      {/* App name */}
      <h1 style={{
        color: '#FF9933',
        fontSize: '26px',
        margin: '0 0 8px',
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: '0.5px'
      }}>
        Growing Together
      </h1>
      <h2 style={{
        color: '#FFD700',
        fontSize: '16px',
        margin: '0 0 16px',
        fontWeight: 'normal',
        textAlign: 'center'
      }}>
        to Eternity
      </h2>
      <p style={{
        color: '#6B6B6B',
        fontSize: '14px',
        margin: 0,
        textAlign: 'center'
      }}>
        Hare Krishna 🙏
      </p>

      {/* Loading dots */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '40px'
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#FF9933',
            opacity: 0.4,
            animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite`
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}