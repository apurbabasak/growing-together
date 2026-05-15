'use client';
export const dynamic = 'force-dynamic';
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

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function History() {
  const [entries, setEntries] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Devotee';
    const uid = localStorage.getItem('userId') || '';
    const code = localStorage.getItem('sanghaCode') || '';
    setUserName(name);

    if (code && uid) {
      const sanghaRef = doc(db, 'sanghas', code);
      const unsub = onSnapshot(sanghaRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const dailyEntries = data.members?.[uid]?.daily_entries || {};
          const sorted = Object.entries(dailyEntries)
            .sort((a, b) => b[0].localeCompare(a[0]));
          setEntries(sorted);
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, []);

  const getScoreColor = (score) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#FF9933';
    if (score >= 40) return '#FFD700';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 100) return '🌟 Perfect!';
    if (score >= 90) return '✨ Excellent';
    if (score >= 70) return '🙏 Good';
    if (score >= 40) return '📿 Keep Going';
    return '🌱 Just Started';
  };

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
        padding: '20px 20px 28px',
        borderRadius: '0 0 28px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <p style={{ color: 'white', fontSize: '12px', margin: '0 0 2px', opacity: 0.9 }}>
              {userName}'s Journey
            </p>
            <h1 style={{ color: 'white', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>
              📜 Sadhana History
            </h1>
          </div>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.2)',
            borderRadius: '14px', padding: '12px', textAlign: 'center'
          }}>
            <p style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
              {entries.length}
            </p>
            <p style={{ color: 'white', fontSize: '11px', margin: '2px 0 0', opacity: 0.9 }}>
              Days Logged
            </p>
          </div>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.2)',
            borderRadius: '14px', padding: '12px', textAlign: 'center'
          }}>
            <p style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
              {entries.length > 0
                ? Math.round(entries.reduce((sum, [, e]) => sum + calculateScore(e), 0) / entries.length)
                : 0}
            </p>
            <p style={{ color: 'white', fontSize: '11px', margin: '2px 0 0', opacity: 0.9 }}>
              Avg Score
            </p>
          </div>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.2)',
            borderRadius: '14px', padding: '12px', textAlign: 'center'
          }}>
            <p style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
              {entries.filter(([, e]) => calculateScore(e) >= 70).length}
            </p>
            <p style={{ color: 'white', fontSize: '11px', margin: '2px 0 0', opacity: 0.9 }}>
              Good Days
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        {loading && (
          <p style={{ textAlign: 'center', color: '#6B6B6B', marginTop: '40px' }}>
            Loading your sadhana history...
          </p>
        )}

        {!loading && entries.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <p style={{ fontSize: '48px' }}>📿</p>
            <p style={{ color: '#6B6B6B', fontSize: '15px' }}>No entries yet.</p>
            <p style={{ color: '#6B6B6B', fontSize: '13px' }}>
              Start logging your sadhana on the dashboard!
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                marginTop: '16px', padding: '12px 28px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #FF9933, #FFD700)',
                border: 'none', color: 'white', fontSize: '15px',
                cursor: 'pointer', fontFamily: 'Georgia, serif'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {entries.map(([date, entry]) => {
          const score = calculateScore(entry);
          const isOpen = expanded === date;
          return (
            <div key={date} style={{
              background: 'white', borderRadius: '20px',
              marginBottom: '12px',
              boxShadow: '0 4px 20px rgba(255,153,51,0.08)',
              border: '1px solid rgba(255,153,51,0.15)',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => setExpanded(isOpen ? null : date)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  padding: '16px 18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  fontFamily: 'Georgia, serif'
                }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, #FFF0E0 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, position: 'relative'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'white', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 'bold', color: getScoreColor(score)
                  }}>
                    {score}
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ margin: '0 0 3px', fontSize: '15px', color: '#2D2D2D', fontWeight: 'bold' }}>
                    {formatDate(date)}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B6B6B' }}>
                    {getScoreLabel(score)}
                  </p>
                </div>
                <span style={{ color: '#FF9933', fontSize: '16px' }}>{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid #FFF0E0' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '10px', marginTop: '14px'
                  }}>
                    <div style={{ background: '#FFFAF5', borderRadius: '12px', padding: '12px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B6B6B' }}>🕉️ Chanting</p>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2D2D2D' }}>
                        {entry.chanting?.rounds_completed || 0} rounds
                      </p>
                    </div>
                    <div style={{ background: '#FFFAF5', borderRadius: '12px', padding: '12px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B6B6B' }}>📖 Reading</p>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2D2D2D' }}>
                        {entry.reading?.minutes || 0} mins
                      </p>
                      {entry.reading?.topic && (
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B6B6B' }}>
                          {entry.reading.topic}
                        </p>
                      )}
                    </div>
                    <div style={{ background: '#FFFAF5', borderRadius: '12px', padding: '12px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B6B6B' }}>🎧 Hearing</p>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2D2D2D' }}>
                        {entry.hearing?.minutes || 0} mins
                      </p>
                      {entry.hearing?.description && (
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B6B6B' }}>
                          {entry.hearing.description}
                        </p>
                      )}
                    </div>
                    <div style={{ background: '#FFFAF5', borderRadius: '12px', padding: '12px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B6B6B' }}>🪷 Service</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#2D2D2D' }}>
                        {entry.devotional_service?.activities?.length > 0
                          ? entry.devotional_service.activities.length + ' activities'
                          : 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
