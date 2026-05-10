'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + '_vedabase_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function nameToId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40);
}

export default function LoginPage() {
  const router = useRouter();
  const audioRef = useRef(null);
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    if (userId && userName) {
      router.replace('/dashboard');
    } else {
      setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    const tryPlay = () => {
      if (audioRef.current && !audioReady) {
        audioRef.current.volume = 0.35;
        audioRef.current.play().then(() => setAudioReady(true)).catch(() => {});
      }
    };
    document.addEventListener('click', tryPlay, { once: true });
    document.addEventListener('keydown', tryPlay, { once: true });
    return () => {
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('keydown', tryPlay);
    };
  }, [audioReady]);

  const handleLogin = async () => {
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (pin.length < 4) return setError('PIN must be 4 digits.');
    setLoading(true);
    try {
      const userId = nameToId(name.trim());
      const pinHash = await hashPin(pin);
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        setError('No account found with this name. Please register first or check your spelling.');
        setLoading(false);
        return;
      }
      const userData = userSnap.data();
      if (userData.pinHash !== pinHash) {
        setError('Incorrect PIN. Please try again.');
        setLoading(false);
        return;
      }
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userData.name);
      if (userData.sangha) localStorage.setItem('sangha', userData.sangha);
      setSuccess(`Welcome back, ${userData.name}! 🙏`);
      setTimeout(() => router.replace('/dashboard'), 1000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || name.trim().length < 2)
      return setError('Please enter your full name (at least 2 characters).');
    if (pin.length < 4) return setError('PIN must be exactly 4 digits.');
    if (pin !== confirmPin) return setError('PINs do not match.');
    setLoading(true);
    try {
      const userId = nameToId(name.trim());
      const pinHash = await hashPin(pin);
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setError('An account with this name already exists. Please log in instead.');
        setLoading(false);
        return;
      }
      await setDoc(userRef, {
        name: name.trim(),
        pinHash,
        createdAt: new Date().toISOString(),
        sangha: null,
      });
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name.trim());
      setSuccess(`Account created! Welcome, ${name.trim()}! 🙏`);
      setTimeout(() => router.replace('/dashboard'), 1000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handlePinInput = (val, setter) => {
    setter(val.replace(/\D/g, '').substring(0, 4));
  };

  if (checkingSession) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.page}>

      <audio ref={audioRef} loop preload="auto">
        <source src="/flute.mp3" type="audio/mpeg" />
      </audio>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes goldPulse {
          0%, 100% { opacity: 0.25; transform: translate(-50%,-50%) scale(1); }
          50%       { opacity: 0.45; transform: translate(-50%,-50%) scale(1.07); }
        }
        @keyframes textShimmer {
          0%   { background-position: -400% center; }
          100% { background-position: 400% center; }
        }
        .anim-down { animation: fadeInDown 0.85s cubic-bezier(0.22,1,0.36,1) forwards; }
        .anim-up   { animation: fadeInUp  0.85s cubic-bezier(0.22,1,0.36,1) 0.18s forwards; opacity: 0; }
        .shimmer-title {
          background: linear-gradient(90deg, #b36800 0%, #FFD700 30%, #fff5a0 50%, #FFD700 70%, #b36800 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShimmer 5s linear infinite;
        }
        .glow-halo {
          position: absolute;
          width: 240px; height: 240px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,200,0,0.28) 0%, transparent 68%);
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          animation: goldPulse 3.8s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        .login-input:focus {
          border-color: #c8860a !important;
          box-shadow: 0 0 0 3px rgba(200,134,10,0.2) !important;
          outline: none;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(200,134,10,0.55) !important;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div style={styles.card}>

        {/* ── Hero section ── */}
        <div style={{ textAlign: 'center', marginBottom: 6 }} className="anim-down">

          {/* Chakra with glow halo */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <div className="glow-halo" />
            <img
              src="/chakra.png"
              alt="Sudarshan Chakra"
              style={{
                width: 164,
                height: 164,
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1,
                filter:
                  'drop-shadow(0 0 20px rgba(255,210,0,0.75)) drop-shadow(0 0 50px rgba(255,140,0,0.45))',
              }}
            />
          </div>

          {/* Title */}
          <h1
            className="shimmer-title"
            style={{
              fontSize: 23,
              fontWeight: 800,
              margin: '0 0 7px',
              letterSpacing: '0.01em',
              lineHeight: 1.18,
              fontFamily: "'Georgia', serif",
            }}
          >
            Growing Back to Godhead
          </h1>

          <p style={{
            fontSize: 13, color: '#c8a060', margin: '0 0 7px',
            fontStyle: 'italic', letterSpacing: '0.03em',
            fontFamily: "'Georgia', serif",
          }}>
            Hare Krishna Sādhana Sangha
          </p>

          <p style={{
            fontSize: 12, color: '#a07030', margin: 0,
            letterSpacing: '0.06em', fontWeight: 600,
            fontFamily: "'Georgia', serif",
          }}>
            हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे
          </p>
        </div>

        {/* Ornamental divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(200,134,10,0.4))' }} />
          <span style={{ fontSize: 15, color: '#c8860a' }}>🪷</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(200,134,10,0.4))' }} />
        </div>

        {/* ── Login form ── */}
        <div className="anim-up">

          {/* Tab toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 12, padding: 4, marginBottom: 20, gap: 4,
            border: '1px solid rgba(200,134,10,0.2)',
          }}>
            {[
              { id: 'login', label: 'Log In' },
              { id: 'register', label: 'New Account' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setMode(id); setError(''); setSuccess(''); }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 9, border: 'none',
                  cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  fontFamily: "'Georgia', serif",
                  transition: 'all 0.25s',
                  background: mode === id
                    ? 'linear-gradient(135deg, #b36800, #FFD700)'
                    : 'transparent',
                  color: mode === id ? '#1a0800' : '#c8a060',
                  boxShadow: mode === id ? '0 3px 12px rgba(200,134,10,0.35)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            <label style={styles.label}>Your Name</label>
            <input
              className="login-input"
              type="text"
              placeholder="e.g. Radha Devi Dasi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>4-Digit PIN</label>
            <input
              className="login-input"
              type="password"
              inputMode="numeric"
              placeholder="••••"
              maxLength={4}
              value={pin}
              onChange={(e) => handlePinInput(e.target.value, setPin)}
              style={{ ...styles.input, letterSpacing: '0.5em', fontSize: 24, textAlign: 'center' }}
            />

            {mode === 'register' && (
              <>
                <label style={styles.label}>Confirm PIN</label>
                <input
                  className="login-input"
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
                  style={{ ...styles.input, letterSpacing: '0.5em', fontSize: 24, textAlign: 'center' }}
                />
              </>
            )}

            {/* PIN dot indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10, marginBottom: 4 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  width: 12, height: 12, borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  background: pin.length > i
                    ? 'linear-gradient(135deg, #b36800, #FFD700)'
                    : 'rgba(255,255,255,0.1)',
                  border: pin.length > i ? 'none' : '1.5px solid rgba(200,134,10,0.3)',
                  transform: pin.length > i ? 'scale(1.3)' : 'scale(1)',
                  boxShadow: pin.length > i ? '0 0 10px rgba(255,215,0,0.55)' : 'none',
                }} />
              ))}
            </div>

            {error && (
              <div style={{
                background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.4)',
                borderRadius: 10, padding: '10px 14px', color: '#ff8b7a',
                fontSize: 13, marginTop: 8, lineHeight: 1.4,
              }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{
                background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)',
                borderRadius: 10, padding: '10px 14px', color: '#6ee7a0',
                fontSize: 13, marginTop: 8,
              }}>
                ✅ {success}
              </div>
            )}

            <button
              className="submit-btn"
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              style={{
                marginTop: 18, padding: '15px',
                background: 'linear-gradient(135deg, #b36800 0%, #FFD700 50%, #b36800 100%)',
                backgroundSize: '200% auto',
                color: '#1a0800', border: 'none', borderRadius: 14,
                fontSize: 16, fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.65 : 1,
                boxShadow: '0 6px 22px rgba(180,120,0,0.4)',
                transition: 'all 0.2s ease',
                fontFamily: "'Georgia', serif",
                letterSpacing: '0.02em',
              }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? '🙏 Log In' : '🙏 Create Account'}
            </button>
          </div>

          <p style={{
            fontSize: 12, color: 'rgba(200,160,96,0.6)',
            textAlign: 'center', marginTop: 16, lineHeight: 1.5,
            fontFamily: "'Georgia', serif",
          }}>
            {mode === 'login'
              ? "Don't have an account? Switch to 'New Account' above."
              : 'Remember your name exactly as entered — it is used to find your account.'}
          </p>

          {mode === 'login' && (
            <p style={{
              fontSize: 11, color: 'rgba(200,160,96,0.35)',
              textAlign: 'center', marginTop: 6,
              fontFamily: "'Georgia', serif",
            }}>
              Forgot your PIN? Contact your group admin to reset your account.
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', marginTop: 20, paddingTop: 14,
          borderTop: '1px solid rgba(200,134,10,0.12)',
        }}>
          <p style={{
            fontSize: 11, color: 'rgba(200,160,96,0.4)',
            margin: 0, fontStyle: 'italic',
            fontFamily: "'Georgia', serif",
          }}>
            🎵 Tap anywhere to hear the flute
          </p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% 15%, #261000 0%, #0e0500 45%, #000000 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'Georgia', serif",
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    background: 'linear-gradient(160deg, rgba(28,12,0,0.98) 0%, rgba(16,6,0,0.99) 100%)',
    borderRadius: 28,
    padding: '32px 26px 24px',
    width: '100%',
    maxWidth: 420,
    boxShadow: [
      '0 0 0 1px rgba(200,134,10,0.22)',
      '0 32px 90px rgba(0,0,0,0.75)',
      'inset 0 1px 0 rgba(255,215,0,0.07)',
    ].join(', '),
    position: 'relative',
    zIndex: 1,
  },
  centered: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
  },
  spinner: {
    width: 40, height: 40,
    border: '3px solid rgba(200,134,10,0.2)',
    borderTop: '3px solid #FFD700',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#906820',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginTop: 12,
    marginBottom: 5,
    fontFamily: "'Georgia', serif",
  },
  input: {
    padding: '13px 15px',
    borderRadius: 12,
    border: '1.5px solid rgba(200,134,10,0.28)',
    fontSize: 16,
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    color: '#f0ddb0',
    fontFamily: "'Georgia', serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
};