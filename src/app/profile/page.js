'use client';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

function calculateScore(entry) {
  if (!entry) return 0;
  let total = 0;
  const rounds = entry.chanting?.rounds_completed || 0;
  if (rounds >= 16) { total += 70 + (rounds - 16) * 0.5; }
  else { total += (rounds / 16) * 70; }
  const readMins = entry.reading?.minutes || 0;
  if (readMins >= 10) { total += 10 + (readMins - 10) * 0.1; }
  else { total += (readMins / 10) * 10; }
  const hearMins = entry.hearing?.minutes || 0;
  if (hearMins >= 10) { total += 10 + (hearMins - 10) * 0.1; }
  else { total += (hearMins / 10) * 10; }
  const activities = entry.devotional_service?.activities || [];
  if (activities.length > 0) {
    total += 10;
    if (activities.includes('fasting')) total += 5;
    if (activities.includes('seva_of_guru')) total += 5;
  }
  return Math.round(total * 10) / 10;
}

function calculateStreak(entries) {
  if (!entries || Object.keys(entries).length === 0) return 0;
  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (entries[dateStr] && calculateScore(entries[dateStr]) > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function Profile() {
  const [userName, setUserName] = useState('');
  const [sanghaCode, setSanghaCode] = useState('');
  const [userId, setUserId] = useState('');
  const [entries, setEntries] = useState({});
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Devotee';
    const uid = localStorage.getItem('userId') || '';
    const code = localStorage.getItem('sanghaCode') || '';
    setUserName(name);
    setUserId(uid);
    setSanghaCode(code);

    if (code && uid) {
      const sanghaRef = doc(db, 'sanghas', code);
      const unsub = onSnapshot(sanghaRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const dailyEntries = data.members?.[uid]?.daily_entries || {};
          setEntries(dailyEntries);
          setMembers(data.members || {});
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, []);

  const allScores = Object.values(entries).map(calculateScore);
  const totalDays = allScores.length;
  const avgScore = totalDays > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / totalDays)
    : 0;
  const bestScore = totalDays > 0 ? Math.max(...allScores) : 0;
  const streak = calculateStreak(entries);
  const totalRounds = Object.values(entries).reduce(
    (sum, e) => sum + (e.chanting?.rounds_completed || 0), 0
  );
  const perfectDays = allScores.filter(s => s >= 100).length;

  const myRank = Object.entries(members)
    .map(([uid, m]) => {
      const todayStr = new Date().toISOString().split('T')[0];
      return { uid, score: calculateScore(m.daily_entries?.[todayStr] || {}) };
    })
    .sort((a, b) => b.score - a.score)
    .findIndex(m => m.uid === userId) + 1;

  const copyCode = () => {
    navigator.clipboard.writeText(sanghaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/onboarding';
  };

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%)',
      fontFamily: 'Georgia, serif',
      paddingBottom: '100px'
    }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FF9933, #FFD700)',
        padding: '20px 20px 40px',
        borderRadius: '0 0 32px 32px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Avatar */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          border: '3px solid white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: '32px', color: 'white', fontWeight: 'bold'
        }}>
          {initial}
        </div>

        <h1 style={{ color: 'white', fontSize: '22px', margin: '0 0 4px', fontWeight: 'bold' }}>
          {userName}
        </h1>
        <p style={{ color: 'white', fontSize: '13px', margin: 0, opacity: 0.9 }}>
          🪷 Devotee · Sadhana Sangha
        </p>

        {streak > 0 && (
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.25)',
            borderRadius: '999px',
            padding: '6px 16px', marginTop: '12px'
          }}>
            <span style={{ color: 'white', fontSize: '14px' }}>
              🔥 {streak} day streak!
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '20px' }}>

        {/* Stats Grid */}
        <h2 style={{ color: '#2D2D2D', fontSize: '16px', margin: '0 0 12px' }}>
          📊 My Stats
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', marginBottom: '24px'
        }}>
          {[
            { label: 'Days Logged', value: totalDays, icon: '📅' },
            { label: 'Avg Score', value: avgScore, icon: '⭐' },
            { label: 'Best Score', value: bestScore, icon: '🏆' },
            { label: 'Perfect Days', value: perfectDays, icon: '🌟' },
            { label: 'Total Rounds', value: totalRounds, icon: '📿' },
            { label: "Today's Rank", value: myRank > 0 ? `#${myRank}` : '-', icon: '🥇' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'white', borderRadius: '16px', padding: '16px',
              boxShadow: '0 4px 16px rgba(255,153,51,0.08)',
              border: '1px solid rgba(255,153,51,0.15)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '24px', margin: '0 0 6px' }}>{stat.icon}</p>
              <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#FF9933', margin: '0 0 4px' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '11px', color: '#6B6B6B', margin: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Sangha Info */}
        <h2 style={{ color: '#2D2D2D', fontSize: '16px', margin: '0 0 12px' }}>
          🌸 My Sangha
        </h2>
        <div style={{
          background: 'white', borderRadius: '20px', padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(255,153,51,0.08)',
          border: '1px solid rgba(255,153,51,0.15)'
        }}>
          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6B6B6B' }}>Sangha Code</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <p style={{
              fontSize: '22px', fontWeight: 'bold',
              color: '#FF9933', letterSpacing: '2px', margin: 0, flex: 1
            }}>
              {sanghaCode}
            </p>
            <button
              onClick={copyCode}
              style={{
                background: copied
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : 'linear-gradient(135deg, #FF9933, #FFD700)',
                border: 'none', borderRadius: '999px',
                color: 'white', padding: '8px 18px',
                fontSize: '13px', cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                transition: 'all 0.3s ease'
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#6B6B6B' }}>
            {Object.keys(members).length} / 10 members in your Sangha
          </p>

          <div style={{ marginTop: '14px' }}>
            {Object.entries(members).map(([uid, m]) => (
              <div key={uid} style={{
                display: 'flex', alignItems: 'center',
                gap: '10px', padding: '8px 0',
                borderTop: '1px solid #FFF0E0'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF9933, #FFD700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 'bold', fontSize: '13px'
                }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#2D2D2D', flex: 1 }}>
                  {m.name} {uid === userId ? '(You)' : ''}
                </p>
                {m.isOwner && (
                  <span style={{
                    fontSize: '11px', color: '#FF9933',
                    background: '#FFF0E0', padding: '2px 8px', borderRadius: '999px'
                  }}>Owner</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '16px', borderRadius: '999px',
            background: 'white', border: '2px solid #FF9933',
            color: '#FF9933', fontSize: '15px',
            cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold'
          }}
        >
          🚪 Leave & Switch Sangha
        </button>

        <p style={{
          textAlign: 'center', color: '#6B6B6B',
          fontSize: '11px', marginTop: '16px'
        }}>
          Hare Krishna 🙏 Growing Together to Eternity
        </p>
      </div>

      <BottomNav />
    </div>
  );
}