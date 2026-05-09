'use client';
import { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';

function generateCode() {
  const words = ['KRISHNA', 'RADHA', 'GOVINDA', 'MADHAVA', 'MURARI'];
  const num = Math.floor(Math.random() * 900) + 100;
  const word = words[Math.floor(Math.random() * words.length)];
  return `${num}-${word}`;
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [choice, setChoice] = useState('');
  const [code, setCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameSubmit = () => {
    if (name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCreateSangha = async () => {
    setLoading(true);
    setError('');
    const newCode = generateCode();
    const sanghaRef = doc(db, 'sanghas', newCode);
    const userId = name.trim().toLowerCase().replace(/\s/g, '_') + '_' + Date.now();
    await setDoc(sanghaRef, {
      code: newCode,
      createdAt: new Date().toISOString(),
      members: {
        [userId]: {
          name: name.trim(),
          isOwner: true,
          joinedAt: new Date().toISOString(),
        }
      }
    });
    localStorage.setItem('sanghaCode', newCode);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', name.trim());
    setCode(newCode);
    setStep(3);
    setLoading(false);
  };

  const handleJoinSangha = async () => {
    if (joinCode.trim().length < 3) {
      setError('Please enter a valid code');
      return;
    }
    setLoading(true);
    setError('');
    const sanghaRef = doc(db, 'sanghas', joinCode.trim().toUpperCase());
    const sanghaSnap = await getDoc(sanghaRef);
    if (!sanghaSnap.exists()) {
      setError('Sangha not found. Please check the code.');
      setLoading(false);
      return;
    }
    const userId = name.trim().toLowerCase().replace(/\s/g, '_') + '_' + Date.now();
    const data = sanghaSnap.data();
    const memberCount = Object.keys(data.members || {}).length;
    if (memberCount >= 10) {
      setError('This Sangha is full (max 10 members).');
      setLoading(false);
      return;
    }
    await setDoc(sanghaRef, {
      ...data,
      members: {
        ...data.members,
        [userId]: {
          name: name.trim(),
          isOwner: false,
          joinedAt: new Date().toISOString(),
        }
      }
    });
    localStorage.setItem('sanghaCode', joinCode.trim().toUpperCase());
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', name.trim());
    window.location.href = '/dashboard';
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      padding: '20px'
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontSize: '36px', margin: 0 }}>🕉️</p>
        <h1 style={{
          color: '#FF9933',
          fontSize: '22px',
          margin: '8px 0 4px',
          letterSpacing: '0.5px'
        }}>
          Growing Together to Eternity
        </h1>
        <p style={{ color: '#6B6B6B', fontSize: '13px', margin: 0 }}>
          Sadhana Sangha
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px 28px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 40px rgba(255,153,51,0.15)',
        border: '1px solid rgba(255,153,51,0.2)'
      }}>

        {/* Step 1 - Enter Name */}
        {step === 1 && (
          <div>
            <h2 style={{ color: '#2D2D2D', fontSize: '20px', margin: '0 0 8px' }}>
              🙏 Welcome, dear devotee
            </h2>
            <p style={{ color: '#6B6B6B', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.6' }}>
              What is your spiritual name or name?
            </p>
            <input
              type="text"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1.5px solid #FFD700',
                fontSize: '16px',
                fontFamily: 'Georgia, serif',
                outline: 'none',
                color: '#2D2D2D',
                background: '#FFFAF5',
                boxSizing: 'border-box',
                marginBottom: '16px'
              }}
            />
            {error && <p style={{ color: '#e53e3e', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}
            <button
              onClick={handleNameSubmit}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #FF9933, #FFD700)',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
                fontWeight: 'bold',
                letterSpacing: '0.5px'
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 - Create or Join */}
        {step === 2 && (
          <div>
            <h2 style={{ color: '#2D2D2D', fontSize: '20px', margin: '0 0 8px' }}>
              Hare Krishna, {name}! 🪷
            </h2>
            <p style={{ color: '#6B6B6B', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.6' }}>
              Would you like to create a new Sangha or join an existing one?
            </p>

            {/* Create button */}
            <button
              onClick={() => setChoice('create')}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: choice === 'create' ? 'linear-gradient(135deg, #FF9933, #FFD700)' : '#FFFAF5',
                border: `2px solid ${choice === 'create' ? '#FF9933' : '#FFE0B0'}`,
                color: choice === 'create' ? 'white' : '#2D2D2D',
                fontSize: '15px',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
                marginBottom: '12px',
                textAlign: 'left',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🌸 Create a new Sangha</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Start a group and invite up to 9 others</div>
            </button>

            {/* Join button */}
            <button
              onClick={() => setChoice('join')}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: choice === 'join' ? 'linear-gradient(135deg, #FF9933, #FFD700)' : '#FFFAF5',
                border: `2px solid ${choice === 'join' ? '#FF9933' : '#FFE0B0'}`,
                color: choice === 'join' ? 'white' : '#2D2D2D',
                fontSize: '15px',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
                marginBottom: '20px',
                textAlign: 'left',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔱 Join an existing Sangha</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Enter the code shared by your group</div>
            </button>

            {/* Join code input */}
            {choice === 'join' && (
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Enter Sangha code (e.g. 108-KRISHNA)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #FFD700',
                    fontSize: '15px',
                    fontFamily: 'Georgia, serif',
                    outline: 'none',
                    color: '#2D2D2D',
                    background: '#FFFAF5',
                    boxSizing: 'border-box',
                    letterSpacing: '1px'
                  }}
                />
              </div>
            )}

            {error && <p style={{ color: '#e53e3e', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}

            {choice && (
              <button
                onClick={choice === 'create' ? handleCreateSangha : handleJoinSangha}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '999px',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #FF9933, #FFD700)',
                  border: 'none',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'Georgia, serif',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Please wait...' : choice === 'create' ? 'Create Sangha 🌸' : 'Join Sangha 🔱'}
              </button>
            )}
          </div>
        )}

        {/* Step 3 - Sangha Created Successfully */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🎉</p>
            <h2 style={{ color: '#2D2D2D', fontSize: '20px', margin: '0 0 8px' }}>
              Sangha Created!
            </h2>
            <p style={{ color: '#6B6B6B', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.6' }}>
              Share this divine code with your devotees so they can join:
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #FF9933, #FFD700)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <p style={{ color: 'white', fontSize: '26px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>
                {code}
              </p>
            </div>
            <p style={{ color: '#6B6B6B', fontSize: '12px', margin: '0 0 24px' }}>
              Write this code down or screenshot it!
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #FF9933, #FFD700)',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Enter the Sangha 🕉️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}