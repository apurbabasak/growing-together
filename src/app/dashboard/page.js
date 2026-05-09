'use client';
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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
  if (entry.jps_app?.read === true) { total += 5; }
  return Math.round(total * 10) / 10;
}

const today = new Date().toISOString().split('T')[0];

const SERVICES = [
  { id: 'yatra', label: '🚶 Yatra' },
  { id: 'cooking', label: '🍳 Cooking' },
  { id: 'cutting', label: '🥬 Cutting Fruits & Vegetables' },
  { id: 'seva_of_guru', label: '🙏 Seva of Guru Maharaj' },
  { id: 'deity_worship', label: '🪷 Deity Worship' },
  { id: 'temple_visit', label: '🛕 Temple Visit' },
  { id: 'fasting', label: '⚡ Fasting' },
  { id: 'vaisnava_seva', label: '🌸 Vaisnava Seva' },
  { id: 'donation', label: '💛 Donation' },
  { id: 'family_service', label: '👨‍👩‍👧 Service to Family' },
  { id: 'others', label: '✨ Others' },
];

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [sanghaCode, setSanghaCode] = useState('');
  const [members, setMembers] = useState({});
  const [todayEntry, setTodayEntry] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [jpsSaving, setJpsSaving] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Devotee';
    const uid = localStorage.getItem('userId') || '';
    const code = localStorage.getItem('sanghaCode') || '';
    setUserName(name);
    setUserId(uid);
    setSanghaCode(code);

    if (code) {
      const sanghaRef = doc(db, 'sanghas', code);
      const unsub = onSnapshot(sanghaRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setMembers(data.members || {});
          const myEntry = data.members?.[uid]?.daily_entries?.[today] || null;
          setTodayEntry(myEntry);
        }
      });
      return () => unsub();
    }
  }, []);

  const saveEntry = async (type, data) => {
    setSaving(true);
    const sanghaRef = doc(db, 'sanghas', sanghaCode);
    const snap = await getDoc(sanghaRef);
    const existing = snap.data();
    const currentEntry = existing?.members?.[userId]?.daily_entries?.[today] || {};
    const updatedEntry = { ...currentEntry, [type]: data };
    updatedEntry.aggregate_score = calculateScore(updatedEntry);
    await setDoc(sanghaRef, {
      ...existing,
      members: {
        ...existing.members,
        [userId]: {
          ...existing.members[userId],
          daily_entries: {
            ...(existing.members[userId]?.daily_entries || {}),
            [today]: updatedEntry
          }
        }
      }
    });
    setSaving(false);
    setActiveModal(null);
  };

  const saveJpsApp = async (value) => {
    setJpsSaving(true);
    const sanghaRef = doc(db, 'sanghas', sanghaCode);
    const snap = await getDoc(sanghaRef);
    const existing = snap.data();
    const currentEntry = existing?.members?.[userId]?.daily_entries?.[today] || {};
    const updatedEntry = { ...currentEntry, jps_app: { read: value } };
    updatedEntry.aggregate_score = calculateScore(updatedEntry);
    await setDoc(sanghaRef, {
      ...existing,
      members: {
        ...existing.members,
        [userId]: {
          ...existing.members[userId],
          daily_entries: {
            ...(existing.members[userId]?.daily_entries || {}),
            [today]: updatedEntry
          }
        }
      }
    });
    setJpsSaving(false);
  };

  const myScore = todayEntry ? calculateScore(todayEntry) : 0;
  const jpsRead = todayEntry?.jps_app?.read;

  const sortedMembers = Object.entries(members)
    .map(([uid, m]) => ({
      uid,
      name: m.name,
      score: calculateScore(m.daily_entries?.[today] || {}),
      jpsRead: m.daily_entries?.[today]?.jps_app?.read || false,
    }))
    .sort((a, b) => b.score - a.score);

  const rankEmojis = ['🥇', '🥈', '🥉'];
  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%)',
      fontFamily: 'Georgia, serif',
      paddingBottom: '100px'
    }}>

      <audio ref={audioRef} loop preload="auto">
        <source src="/flute.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FF9933, #FFD700)',
        padding: '20px 20px 28px',
        borderRadius: '0 0 28px 28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'white', fontSize: '12px', margin: '0 0 2px', opacity: 0.9 }}>
              🕉️ Sadhana Sangha
            </p>
            <h1 style={{ color: 'white', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>
              Hare Krishna, {userName}!
            </h1>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.25)', borderRadius: '50%',
            width: '48px', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
          }}>🪷</div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.2)', borderRadius: '16px',
          padding: '14px 18px', marginTop: '16px'
        }}>
          <p style={{ color: 'white', fontSize: '12px', margin: '0 0 4px', opacity: 0.9 }}>
            Today's Sadhana Score
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ color: 'white', fontSize: '42px', fontWeight: 'bold', lineHeight: 1 }}>
              {myScore}
            </span>
            <span style={{ color: 'white', fontSize: '16px', opacity: 0.8 }}>/ 105</span>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.3)', borderRadius: '999px',
            height: '6px', marginTop: '10px'
          }}>
            <div style={{
              background: 'white', borderRadius: '999px', height: '100%',
              width: `${Math.min((myScore / 105) * 100, 100)}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
          <p style={{ color: 'white', fontSize: '10px', opacity: 0.8, margin: '6px 0 0' }}>
            Chanting 70% | Reading 10% | Hearing 10% | Service 10% | JPS App +5
          </p>
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Leaderboard */}
        <h2 style={{ color: '#2D2D2D', fontSize: '16px', margin: '0 0 12px' }}>
          🏆 Sangha Leaderboard
        </h2>
        <div style={{
          background: 'white', borderRadius: '20px', padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(255,153,51,0.1)',
          border: '1px solid rgba(255,153,51,0.15)'
        }}>
          {sortedMembers.length === 0 && (
            <p style={{ color: '#6B6B6B', fontSize: '13px', textAlign: 'center', margin: '8px 0' }}>
              No members yet. Share your Sangha code: <strong>{sanghaCode}</strong>
            </p>
          )}
          {sortedMembers.map((member, index) => (
            <div key={member.uid} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0',
              borderBottom: index < sortedMembers.length - 1 ? '1px solid #FFF0E0' : 'none'
            }}>
              <span style={{ fontSize: '20px', minWidth: '28px' }}>
                {index < 3 ? rankEmojis[index] : `${index + 1}.`}
              </span>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${rankColors[index] || '#FF9933'}, #FFD700)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'bold', fontSize: '14px'
              }}>
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#2D2D2D', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                  {member.name} {member.uid === userId ? '(You)' : ''}
                </p>
                {member.jpsRead && (
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#22c55e' }}>
                    📱 JPS App ✓
                  </p>
                )}
              </div>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: index === 0 ? '#FF9933' : '#2D2D2D' }}>
                {member.score}
              </span>
            </div>
          ))}
        </div>

        {/* Sadhana Cards */}
        <h2 style={{ color: '#2D2D2D', fontSize: '16px', margin: '0 0 12px' }}>
          📿 Today's Sadhana
        </h2>

        {/* Chanting */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '18px',
          marginBottom: '12px', boxShadow: '0 4px 20px rgba(255,153,51,0.1)',
          border: '1px solid rgba(255,153,51,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#2D2D2D' }}>🕉️ Chanting</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B6B6B' }}>
                {todayEntry?.chanting?.rounds_completed || 0} / 16 rounds
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9933' }}>
                {todayEntry ? Math.min(70 + Math.max(0, (todayEntry.chanting?.rounds_completed || 0) - 16) * 0.5, 999).toFixed(1) : '0'} pts
              </span>
              <button onClick={() => { setFormData({ rounds: todayEntry?.chanting?.rounds_completed || 0 }); setActiveModal('chanting'); }}
                style={{
                  background: 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none',
                  borderRadius: '999px', color: 'white', padding: '8px 16px',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif'
                }}>✏️ Edit</button>
            </div>
          </div>
          <div style={{ background: '#FFF0E0', borderRadius: '999px', height: '8px', marginTop: '12px' }}>
            <div style={{
              background: 'linear-gradient(90deg, #FF9933, #FFD700)', borderRadius: '999px',
              height: '100%', width: `${Math.min(((todayEntry?.chanting?.rounds_completed || 0) / 16) * 100, 100)}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        {/* Reading */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '18px',
          marginBottom: '12px', boxShadow: '0 4px 20px rgba(255,153,51,0.1)',
          border: '1px solid rgba(255,153,51,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#2D2D2D' }}>📖 Reading</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B6B6B' }}>
                {todayEntry?.reading?.topic || 'Not logged yet'} · {todayEntry?.reading?.minutes || 0} mins
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9933' }}>
                {todayEntry?.reading ? (todayEntry.reading.minutes >= 10 ? (10 + (todayEntry.reading.minutes - 10) * 0.1).toFixed(1) : ((todayEntry.reading.minutes / 10) * 10).toFixed(1)) : '0'} pts
              </span>
              <button onClick={() => { setFormData({ topic: todayEntry?.reading?.topic || '', minutes: todayEntry?.reading?.minutes || 0 }); setActiveModal('reading'); }}
                style={{
                  background: 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none',
                  borderRadius: '999px', color: 'white', padding: '8px 16px',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif'
                }}>✏️ Edit</button>
            </div>
          </div>
        </div>

        {/* Hearing */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '18px',
          marginBottom: '12px', boxShadow: '0 4px 20px rgba(255,153,51,0.1)',
          border: '1px solid rgba(255,153,51,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#2D2D2D' }}>🎧 Hearing</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B6B6B' }}>
                {todayEntry?.hearing?.description || 'Not logged yet'} · {todayEntry?.hearing?.minutes || 0} mins
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9933' }}>
                {todayEntry?.hearing ? (todayEntry.hearing.minutes >= 10 ? (10 + (todayEntry.hearing.minutes - 10) * 0.1).toFixed(1) : ((todayEntry.hearing.minutes / 10) * 10).toFixed(1)) : '0'} pts
              </span>
              <button onClick={() => { setFormData({ description: todayEntry?.hearing?.description || '', minutes: todayEntry?.hearing?.minutes || 0 }); setActiveModal('hearing'); }}
                style={{
                  background: 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none',
                  borderRadius: '999px', color: 'white', padding: '8px 16px',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif'
                }}>✏️ Edit</button>
            </div>
          </div>
        </div>

        {/* Devotional Service */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '18px',
          marginBottom: '12px', boxShadow: '0 4px 20px rgba(255,153,51,0.1)',
          border: '1px solid rgba(255,153,51,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#2D2D2D' }}>🪷 Devotional Service</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B6B6B' }}>
                {todayEntry?.devotional_service?.activities?.length > 0
                  ? todayEntry.devotional_service.activities.join(', ')
                  : 'Not logged yet'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9933' }}>
                {todayEntry?.devotional_service?.activities?.length > 0
                  ? (10 + (todayEntry.devotional_service.activities.includes('fasting') ? 5 : 0) + (todayEntry.devotional_service.activities.includes('seva_of_guru') ? 5 : 0))
                  : '0'} pts
              </span>
              <button onClick={() => { setFormData({ activities: todayEntry?.devotional_service?.activities || [], other_text: todayEntry?.devotional_service?.other_text || '' }); setActiveModal('service'); }}
                style={{
                  background: 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none',
                  borderRadius: '999px', color: 'white', padding: '8px 16px',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif'
                }}>✏️ Edit</button>
            </div>
          </div>
        </div>

        {/* JPS App Card */}
        <div style={{
          background: jpsRead === true
            ? 'linear-gradient(135deg, #f0fff4, #dcfce7)'
            : jpsRead === false
            ? 'linear-gradient(135deg, #fff5f5, #fee2e2)'
            : 'white',
          borderRadius: '20px', padding: '18px',
          marginBottom: '12px', boxShadow: '0 4px 20px rgba(255,153,51,0.1)',
          border: jpsRead === true
            ? '1px solid #86efac'
            : jpsRead === false
            ? '1px solid #fca5a5'
            : '1px solid rgba(255,153,51,0.15)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#2D2D2D' }}>📱 JPS App</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B6B6B' }}>
                {jpsRead === true ? '✅ Read today — +5 bonus points!' : jpsRead === false ? '❌ Not read today' : 'Did you read JPS App today?'}
              </p>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#22c55e' }}>
              {jpsRead === true ? '+5 pts' : '0 pts'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
            <button onClick={() => saveJpsApp(true)} disabled={jpsSaving}
              style={{
                flex: 1, padding: '12px', borderRadius: '999px',
                background: jpsRead === true ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#f0fdf4',
                border: jpsRead === true ? 'none' : '2px solid #22c55e',
                color: jpsRead === true ? 'white' : '#22c55e',
                fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold'
              }}>✅ Yes</button>
            <button onClick={() => saveJpsApp(false)} disabled={jpsSaving}
              style={{
                flex: 1, padding: '12px', borderRadius: '999px',
                background: jpsRead === false ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#fff5f5',
                border: jpsRead === false ? 'none' : '2px solid #ef4444',
                color: jpsRead === false ? 'white' : '#ef4444',
                fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold'
              }}>❌ No</button>
          </div>
        </div>

        {/* Sangha Code */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '14px 18px',
          marginTop: '12px', border: '1px dashed #FFD700', textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B6B6B' }}>Your Sangha Code</p>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#FF9933', letterSpacing: '2px' }}>
            {sanghaCode}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6B6B6B' }}>
            Share this with devotees to join your group
          </p>
        </div>
      </div>

      {/* Chanting Modal */}
      {activeModal === 'chanting' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '28px 24px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 20px', color: '#2D2D2D', fontSize: '18px' }}>🕉️ Log Chanting</h3>
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6B6B6B' }}>Rounds completed today</p>
            <input type="number" min="0" value={formData.rounds}
              onChange={(e) => setFormData({ ...formData, rounds: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #FFD700', fontSize: '18px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box', marginBottom: '8px' }} />
            <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#6B6B6B' }}>Target: 16 rounds = 70 points. Extra rounds give bonus!</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '14px', borderRadius: '999px', background: '#FFF0E0', border: 'none', color: '#FF9933', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
              <button onClick={() => saveEntry('chanting', { rounds_completed: formData.rounds, target_rounds: 16 })} disabled={saving}
                style={{ flex: 2, padding: '14px', borderRadius: '999px', background: 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none', color: 'white', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                {saving ? 'Saving...' : 'Save 🙏'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reading Modal */}
      {activeModal === 'reading' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '28px 24px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 20px', color: '#2D2D2D', fontSize: '18px' }}>📖 Log Reading</h3>
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6B6B6B' }}>What did you read?</p>
            <input type="text" placeholder="e.g. Bhagavad Gita Chapter 2" value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #FFD700', fontSize: '15px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box', marginBottom: '12px' }} />
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6B6B6B' }}>Minutes read</p>
            <input type="number" min="0" value={formData.minutes}
              onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #FFD700', fontSize: '18px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box', marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '14px', borderRadius: '999px', background: '#FFF0E0', border: 'none', color: '#FF9933', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
              <button onClick={() => saveEntry('reading', { topic: formData.topic, minutes: formData.minutes })} disabled={saving}
                style={{ flex: 2, padding: '14px', borderRadius: '999px', background: 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none', color: 'white', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                {saving ? 'Saving...' : 'Save 🙏'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hearing Modal */}
      {activeModal === 'hearing' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '28px 24px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 20px', color: '#2D2D2D', fontSize: '18px' }}>🎧 Log Hearing</h3>
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6B6B6B' }}>What did you hear?</p>
            <textarea placeholder="e.g. Srila Prabhupada lecture on BG 2.13" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #FFD700', fontSize: '15px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box', marginBottom: '12px', resize: 'none' }} />
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6B6B6B' }}>Minutes heard</p>
            <input type="number" min="0" value={formData.minutes}
              onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #FFD700', fontSize: '18px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box', marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '14px', borderRadius: '999px', background: '#FFF0E0', border: 'none', color: '#FF9933', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
              <button onClick={() => saveEntry('hearing', { description: formData.description, minutes: formData.minutes })} disabled={saving}
                style={{ flex: 2, padding: '14px', borderRadius: '999px', background: 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none', color: 'white', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                {saving ? 'Saving...' : 'Save 🙏'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {activeModal === 'service' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '28px 24px', width: '100%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 8px', color: '#2D2D2D', fontSize: '18px' }}>🪷 Devotional Service</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B6B6B' }}>Select all that apply today</p>
            {SERVICES.map((service) => {
              const selected = (formData.activities || []).includes(service.id);
              return (
                <button key={service.id}
                  onClick={() => {
                    const acts = formData.activities || [];
                    const updated = selected ? acts.filter(a => a !== service.id) : [...acts, service.id];
                    setFormData({ ...formData, activities: updated });
                  }}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', marginBottom: '8px', background: selected ? 'linear-gradient(135deg, #FF9933, #FFD700)' : '#FFFAF5', border: `1.5px solid ${selected ? '#FF9933' : '#FFE0B0'}`, color: selected ? 'white' : '#2D2D2D', fontSize: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif', textAlign: 'left', transition: 'all 0.2s ease' }}>
                  {service.label}
                  {service.id === 'fasting' && <span style={{ fontSize: '11px', marginLeft: '8px', opacity: 0.8 }}>+5 bonus</span>}
                  {service.id === 'seva_of_guru' && <span style={{ fontSize: '11px', marginLeft: '8px', opacity: 0.8 }}>+5 bonus</span>}
                </button>
              );
            })}
            {(formData.activities || []).includes('others') && (
              <input type="text" placeholder="Describe your service..." value={formData.other_text || ''}
                onChange={(e) => setFormData({ ...formData, other_text: e.target.value })}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #FFD700', fontSize: '14px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box', marginBottom: '12px' }} />
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '14px', borderRadius: '999px', background: '#FFF0E0', border: 'none', color: '#FF9933', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
              <button onClick={() => saveEntry('devotional_service', { activities: formData.activities || [], other_text: formData.other_text || '' })} disabled={saving}
                style={{ flex: 2, padding: '14px', borderRadius: '999px', background: 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none', color: 'white', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                {saving ? 'Saving...' : 'Save 🙏'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}