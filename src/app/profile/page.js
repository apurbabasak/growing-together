'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [sanghaCode, setSanghaCode] = useState('');
  const [sanghaData, setSanghaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem('userId') || '';
    const code = localStorage.getItem('sanghaCode') || '';
    setUserId(uid);
    setSanghaCode(code);

    if (code) {
      const ref = doc(db, 'sanghas', code);
      const unsub = onSnapshot(ref, snap => {
        if (snap.exists()) {
          const data = snap.data();
          setSanghaData(data);
          const me = data.members?.[uid];
          if (me?.name) setUserName(me.name);
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLeaveSangha = async () => {
    if (!sanghaCode || !userId) return;
    setLeaving(true);
    try {
      const ref = doc(db, 'sanghas', sanghaCode);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const updatedMembers = { ...data.members };
        delete updatedMembers[userId];
        await setDoc(ref, { ...data, members: updatedMembers });
      }
      // Clear local storage
      localStorage.removeItem('userId');
      localStorage.removeItem('sanghaCode');
      localStorage.removeItem('userName');
      // Redirect to login/join page
      router.push('/');
    } catch (err) {
      console.error('Error leaving sangha:', err);
      setLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  const memberCount = sanghaData ? Object.keys(sanghaData.members || {}).length : 0;
  const myData = sanghaData?.members?.[userId] || {};
  const totalDays = Object.keys(myData.daily_entries || {}).length;

  // Calculate total score across all entries
  function calcScore(entry) {
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
    if (entry.jps_app?.read === true) total += 5;
    if (entry.chanting_time?.bonus === true) total += 3;
    return Math.round(total * 10) / 10;
  }

  const allEntries = Object.values(myData.daily_entries || {});
  const avgScore = allEntries.length > 0
    ? (allEntries.reduce((s, e) => s + calcScore(e), 0) / allEntries.length).toFixed(1)
    : '0.0';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '120px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)', padding: '24px 20px 30px', borderRadius: '0 0 24px 24px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
          {userName ? userName.charAt(0).toUpperCase() : '🙏'}
        </div>
        <h1 style={{ color: 'white', fontSize: '22px', margin: '0 0 4px', fontWeight: 'bold' }}>{userName || 'Devotee'}</h1>
        <p style={{ color: 'white', fontSize: '13px', margin: 0, opacity: 0.9 }}>Sadhana Profile</p>
      </div>

      <div style={{ padding: '0 20px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔄</div>
            <p style={{ color: '#FF9933' }}>Loading...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Days Logged', value: totalDays, icon: '📅' },
                { label: 'Avg Score', value: `${avgScore}`, icon: '🏆' },
                { label: 'Sangha Size', value: memberCount, icon: '🌸' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: '16px', padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 12px rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.15)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '22px' }}>{s.icon}</p>
                  <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: 'bold', color: '#FF9933' }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6B6B6B' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Sangha Info */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '18px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.15)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#2D2D2D' }}>🌸 My Sangha</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6B6B6B' }}>Sangha Code</span>
                <span style={{ fontSize: '13px', color: '#FF9933', fontWeight: 'bold', letterSpacing: '2px' }}>{sanghaCode || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6B6B6B' }}>Members</span>
                <span style={{ fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>{memberCount} devotees</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#6B6B6B' }}>My Name</span>
                <span style={{ fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>{userName || '—'}</span>
              </div>
            </div>

            {/* Members list */}
            {sanghaData && Object.keys(sanghaData.members || {}).length > 0 && (
              <div style={{ background: 'white', borderRadius: '20px', padding: '18px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.15)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#2D2D2D' }}>👥 All Members</h3>
                {Object.entries(sanghaData.members).map(([uid, m]) => (
                  <div key={uid} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,153,51,0.1)' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: uid === userId ? 'linear-gradient(135deg, #FF9933, #FFD700)' : '#FFF0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: uid === userId ? 'white' : '#FF9933' }}>
                      {m.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#2D2D2D' }}>{m.name}{uid === userId ? ' (You)' : ''}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#6B6B6B' }}>{Object.keys(m.daily_entries || {}).length} days logged</p>
                    </div>
                    {uid === userId && (
                      <span style={{ fontSize: '11px', background: '#FFF0E0', color: '#FF9933', padding: '2px 8px', borderRadius: '999px', fontWeight: 'bold' }}>You</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Danger Zone - Leave Sangha */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '18px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#ef4444' }}>⚠️ Leave Sangha</h3>
              <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#6B6B6B', lineHeight: 1.5 }}>
                Removing yourself from this sangha will permanently delete your name and all your sadhana data from the group. This cannot be undone. Everyone's dashboard will be updated immediately.
              </p>
              {!showLeaveConfirm ? (
                <button onClick={() => setShowLeaveConfirm(true)}
                  style={{ width: '100%', padding: '13px', borderRadius: '999px', background: 'white', border: '2px solid #ef4444', color: '#ef4444', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                  🚪 Leave This Sangha
                </button>
              ) : (
                <div style={{ background: '#fff5f5', borderRadius: '16px', padding: '16px' }}>
                  <p style={{ margin: '0 0 14px', fontSize: '14px', color: '#ef4444', fontWeight: 'bold', textAlign: 'center' }}>
                    Are you sure? All your data will be removed permanently.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowLeaveConfirm(false)}
                      style={{ flex: 1, padding: '12px', borderRadius: '999px', background: 'white', border: '2px solid #FF9933', color: '#FF9933', fontSize: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                      Cancel
                    </button>
                    <button onClick={handleLeaveSangha} disabled={leaving}
                      style={{ flex: 1, padding: '12px', borderRadius: '999px', background: leaving ? '#fca5a5' : '#ef4444', border: 'none', color: 'white', fontSize: '14px', cursor: leaving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                      {leaving ? '⏳ Removing...' : '✅ Yes, Leave'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}