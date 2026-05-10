'use client';
import { useState, useEffect } from 'react';
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
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    if (userId && userName) {
      router.replace('/dashboard');
    } else {
      setCheckingSession(false);
    }
  }, []);

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
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logoEmoji}>🕉️</div>
          <div style={styles.logoTitle}>Sādhana Tracker</div>
          <div style={styles.logoSub}>Hare Krishna Study Group</div>
        </div>

        <div style={styles.toggleRow}>
          <button
            style={{ ...styles.toggleBtn, background: mode === 'login' ? '#ff6b35' : 'transparent', color: mode === 'login' ? '#fff' : '#888' }}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          >Log In</button>
          <button
            style={{ ...styles.toggleBtn, background: mode === 'register' ? '#ff6b35' : 'transparent', color: mode === 'register' ? '#fff' : '#888' }}
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
            style={{ ...styles.input, letterSpacing: '0.3em', fontSize: 22 }}
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
                style={{ ...styles.input, letterSpacing: '0.3em', fontSize: 22 }}
              />
            </>
          )}

          <div style={styles.pinDots}>
            {[0,1,2,3].map((i) => (
              <div key={i} style={{ ...styles.dot, background: pin.length > i ? '#ff6b35' : '#e0d8d0' }} />
            ))}
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          <button
            style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
            onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In 🙏' : 'Create Account 🙏'}
          </button>
        </div>

        <p style={styles.helperText}>
          {mode === 'login'
            ? "Don't have an account? Switch to 'New Account' above."
            : 'Remember your name exactly as entered — it is used to find your account.'}
        </p>
        {mode === 'login' && (
          <p style={styles.forgotNote}>Forgot your PIN? Contact your group admin to reset your account.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #fdf9f4 0%, #fef3e8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Georgia', serif" },
  card: { background: '#fff', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.10)' },
  centered: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 36, height: 36, border: '3px solid #f0e8e0', borderTop: '3px solid #ff6b35', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  logoArea: { textAlign: 'center', marginBottom: 24 },
  logoEmoji: { fontSize: 44, marginBottom: 6 },
  logoTitle: { fontWeight: 700, fontSize: 22, color: '#222' },
  logoSub: { fontSize: 13, color: '#888', marginTop: 2 },
  toggleRow: { display: 'flex', background: '#f5f0eb', borderRadius: 10, padding: 4, marginBottom: 24 },
  toggleBtn: { flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' },
  form: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 12, marginBottom: 4 },
  input: { padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0d8d0', fontSize: 16, outline: 'none', width: '100%', boxSizing: 'border-box', background: '#fdf9f4', color: '#222', fontFamily: "'Georgia', serif" },
  pinDots: { display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8, marginBottom: 4 },
  dot: { width: 12, height: 12, borderRadius: '50%', transition: 'background 0.2s' },
  errorBox: { background: '#fff0ee', border: '1px solid #ffccc0', borderRadius: 8, padding: '10px 14px', color: '#c0392b', fontSize: 13, marginTop: 8 },
  successBox: { background: '#f0fff4', border: '1px solid #b2f5c8', borderRadius: 8, padding: '10px 14px', color: '#27ae60', fontSize: 13, marginTop: 8 },
  submitBtn: { marginTop: 16, padding: '14px', background: 'linear-gradient(135deg, #ff6b35, #ff8c42)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,107,53,0.3)', transition: 'opacity 0.2s', fontFamily: "'Georgia', serif" },
  helperText: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 16, lineHeight: 1.5 },
  forgotNote: { fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 8 },
};