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

  // Play flute on first user interaction
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
      {/* Flute audio */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/flute.mp3" type="audio/mpeg" />
      </audio>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes chakraSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 12px rgba(255,153,51,0.5), 0 0 24px rgba(255,215,0,0.3); }
          50% { text-shadow: 0 0 20px rgba(255,153,51,0.9), 0 0 40px rgba(255,215,0,0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .sudarshan-chakra {
          animation: chakraSpin 8s linear infinite;
          display: inline-block;
          font-size: 72px;
          filter: drop-shadow(0 0 16px rgba(255,215,0,0.7));
        }
        .title-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .fade-in-down {
          animation: fadeInDown 0.7s ease forwards;
        }
        .fade-in-up {
          animation: fadeInUp 0.7s ease forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }
      `}</style>

      <div style={styles.card}>
        {/* Hero section — Sudarshan Chakra + Title */}
        <div style={styles.heroArea} className="fade-in-down">
          <div className="sudarshan-chakra">🕉️</div>

          <div style={styles.titleBlock}>
            <h1 style={styles.mainTitle} className="title-glow">
              Growing Back to Godhead
            </h1>
            <p style={styles.subTitle}>Hare Krishna Sādhana Sangha</p>
            <div style={styles.mantraText}>
              हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerDot}>🪷</span>
        </div>

        {/* Login / Register Card */}
        <div className="fade-in-up">
          <div style={styles.toggleRow}>
            <button
              style={{
                ...styles.toggleBtn,
                background: mode === 'login' ? 'linear-gradient(135deg, #FF9933, #FFD700)' : 'transparent',
                color: mode === 'login' ? '#fff' : '#888',
                boxShadow: mode === 'login' ? '0 4px 12px rgba(255,153,51,0.3)' : 'none',
              }}
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            >Log In</button>
            <button
              style={{
                ...styles.toggleBtn,
                background: mode === 'register' ? 'linear-gradient(135deg, #FF9933, #FFD700)' : 'transparent',
                color: mode === 'register' ? '#fff' : '#888',
                boxShadow: mode === 'register' ? '0 4px 12px rgba(255,153,51,0.3)' : 'none',
              }}
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            >New Account</button>
          </div>

          <div style={styles.form}>
            <label style={styles.label}>Your Name</label>
            <input
              type="text"
              placeholder="e.g. Radha Devi Dasi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>4-Digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="••••"
              maxLength={4}
              value={pin}
              onChange={(e) => handlePinInput(e.target.value, setPin)}
              style={{ ...styles.input, letterSpacing: '0.4em', fontSize: 24, textAlign: 'center' }}
            />

            {mode === 'register' && (
              <>
                <label style={styles.label}>Confirm PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
                  style={{ ...styles.input, letterSpacing: '0.4em', fontSize: 24, textAlign: 'center' }}
                />
              </>
            )}

            {/* PIN dots indicator */}
            <div style={styles.pinDots}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    ...styles.dot,
                    background: pin.length > i
                      ? 'linear-gradient(135deg, #FF9933, #FFD700)'
                      : '#e0d8d0',
                    transform: pin.length > i ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>

            {error && <div style={styles.errorBox}>⚠️ {error}</div>}
            {success && <div style={styles.successBox}>✅ {success}</div>}

            <button
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading
                ? 'Please wait…'
                : mode === 'login'
                  ? '🙏 Log In'
                  : '🙏 Create Account'}
            </button>
          </div>

          <p style={styles.helperText}>
            {mode === 'login'
              ? "Don't have an account? Switch to 'New Account' above."
              : 'Remember your name exactly as entered — it is used to find your account.'}
          </p>
          {mode === 'login' && (
            <p style={styles.forgotNote}>
              Forgot your PIN? Contact your group admin to reset your account.
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>🎵 Tap anywhere to hear the flute</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #1a0a00 0%, #2d1200 30%, #3d1f00 60%, #1a0a00 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Georgia', serif",
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    background: 'rgba(255,248,235,0.97)',
    borderRadius: 28,
    padding: '32px 28px 24px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.2)',
    position: 'relative',
    zIndex: 1,
  },
  centered: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a0a00',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(255,215,0,0.2)',
    borderTop: '3px solid #FFD700',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  heroArea: {
    textAlign: 'center',
    marginBottom: 8,
    paddingBottom: 4,
  },
  titleBlock: {
    marginTop: 12,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#b35000',
    margin: '0 0 4px',
    letterSpacing: '0.01em',
    lineHeight: 1.2,
  },
  subTitle: {
    fontSize: 13,
    color: '#8B5E00',
    margin: '0 0 8px',
    fontStyle: 'italic',
  },
  mantraText: {
    fontSize: 12,
    color: '#c47a00',
    letterSpacing: '0.04em',
    fontWeight: 600,
    opacity: 0.85,
  },
  divider: {
    textAlign: 'center',
    margin: '12px 0',
    position: 'relative',
  },
  dividerDot: {
    fontSize: 18,
    background: 'rgba(255,248,235,0.97)',
    padding: '0 8px',
    position: 'relative',
    zIndex: 1,
  },
  toggleRow: {
    display: 'flex',
    background: '#f5ece0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    padding: '10px 0',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
    transition: 'all 0.25s',
    fontFamily: "'Georgia', serif",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#a06020',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    padding: '12px 14px',
    borderRadius: 12,
    border: '1.5px solid #e8d5b0',
    fontSize: 16,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    background: '#fffaf3',
    color: '#2D2D2D',
    fontFamily: "'Georgia', serif",
    transition: 'border-color 0.2s',
  },
  pinDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: '50%',
  },
  errorBox: {
    background: '#fff0ee',
    border: '1px solid #ffccc0',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#c0392b',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 1.4,
  },
  successBox: {
    background: '#f0fff4',
    border: '1px solid #b2f5c8',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#27ae60',
    fontSize: 13,
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 18,
    padding: '15px',
    background: 'linear-gradient(135deg, #FF9933, #FFD700)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(255,153,51,0.4)',
    transition: 'opacity 0.2s, transform 0.1s',
    fontFamily: "'Georgia', serif",
    letterSpacing: '0.02em',
  },
  helperText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 1.5,
  },
  forgotNote: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 6,
  },
  footer: {
    textAlign: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTop: '1px solid #f0e0c8',
  },
  footerText: {
    fontSize: 11,
    color: '#c8a060',
    margin: 0,
    fontStyle: 'italic',
  },
};