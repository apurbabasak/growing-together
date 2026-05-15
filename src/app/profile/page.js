'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [sangha, setSangha] = useState('');
  const [userData, setUserData] = useState(null);
  const [sanghaData, setSanghaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    const sg = localStorage.getItem('sanghaCode') || localStorage.getItem('sangha') || '';
    if (!id || !name) { router.replace('/'); return; }
    setUserId(id);
    setUserName(name);
    setSangha(sg);
    if (sg && !localStorage.getItem('sanghaCode')) {
      localStorage.setItem('sanghaCode', sg);
    }
    fetchUserData(id, sg);
  }, []);

  const fetchUserData = async (id, sg) => {
    try {
      const userRef = doc(db, 'users', id);
      const snap = await getDoc(userRef);
      if (snap.exists()) setUserData(snap.data());

      if (sg) {
        const sanghaRef = doc(db, 'sanghas', sg);
        const unsub = onSnapshot(sanghaRef, (sanghaSnap) => {
          if (sanghaSnap.exists()) setSanghaData(sanghaSnap.data());
        });
        // store unsub — cleaned up on unmount via return below
        return unsub;
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('sanghaCode');
    localStorage.removeItem('sangha');
    router.replace('/');
  };

  const handleLeaveSangha = async () => {
    if (!sangha) return;
    setLeaving(true);
    try {
      const sanghaRef = doc(db, 'sanghas', sangha);
      const sanghaSnap = await getDoc(sanghaRef);
      if (sanghaSnap.exists()) {
        const members = { ...sanghaSnap.data().members };
        delete members[userId];
        await updateDoc(sanghaRef, { members });
      }
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { sangha: null });
      localStorage.removeItem('sanghaCode');
      localStorage.removeItem('sangha');
      setSangha('');
      setSanghaData(null);
      setShowLeaveConfirm(false);
      alert('You have left the sangha. Your account is still active.');
    } catch (err) {
      console.error('Error leaving sangha:', err);
      alert('Something went wrong. Please try again.');
    }
    setLeaving(false);
  };

  const handleRemoveMember = async (memberIdToRemove) => {
    if (!sangha || !memberIdToRemove) return;
    setRemovingMember(memberIdToRemove);
    try {
      const sanghaRef = doc(db, 'sanghas', sangha);
      const sanghaSnap = await getDoc(sanghaRef);
      if (sanghaSnap.exists()) {
        const members = { ...sanghaSnap.data().members };
        delete members[memberIdToRemove];
        await updateDoc(sanghaRef, { members });
      }
      // Also update the removed user's sangha field
      const removedUserRef = doc(db, 'users', memberIdToRemove);
      const removedUserSnap = await getDoc(removedUserRef);
      if (removedUserSnap.exists()) {
        await updateDoc(removedUserRef, { sangha: null });
      }
      setConfirmRemoveId(null);
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Something went wrong. Please try again.');
    }
    setRemovingMember(null);
  };

  const isAdmin = sanghaData?.adminId === userId;
  const membersList = sanghaData
    ? Object.entries(sanghaData.members || {}).map(([id, m]) => ({ id, ...m }))
    : [];

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>{(userName || 'D').charAt(0).toUpperCase()}</div>
        <div>
          <div style={styles.name}>{userName}</div>
          <div style={styles.sub}>{sangha ? `Sangha: ${sangha}` : 'No sangha joined'}</div>
          {isAdmin && <div style={{ ...styles.sub, color: '#FF9933', fontWeight: 700 }}>👑 Sangha Admin</div>}
          {userData?.createdAt && (
            <div style={styles.sub}>
              Member since {new Date(userData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Info card */}
      <div style={styles.infoCard}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Account ID</span>
          <span style={styles.infoValue}>{userId}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Login Method</span>
          <span style={styles.infoValue}>Name + 4-digit PIN</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Sangha Code</span>
          <span style={styles.infoValue}>{sangha || '—'}</span>
        </div>
        {sanghaData?.name && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Sangha Name</span>
            <span style={styles.infoValue}>{sanghaData.name}</span>
          </div>
        )}
      </div>

      {/* ── ADMIN PANEL ── */}
      {isAdmin && sanghaData && (
        <div style={{ ...styles.section, borderColor: '#FFD700', background: '#FFFAF0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>👑</span>
            <div style={{ ...styles.sectionTitle, color: '#FF9933' }}>Admin Panel</div>
          </div>

          {/* Sangha code to share */}
          <div style={{ background: 'rgba(255,153,51,0.1)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, border: '1px solid rgba(255,153,51,0.3)' }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#FF9933', fontWeight: 700 }}>📣 Share this code with devotees to join:</p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#2D2D2D', letterSpacing: '0.1em' }}>{sangha}</p>
          </div>

          <p style={{ ...styles.sectionDesc, marginBottom: 12 }}>
            {membersList.length} member{membersList.length !== 1 ? 's' : ''} in your sangha. You can remove any member except yourself.
          </p>

          {membersList.map((member) => {
            const isYou = member.id === userId;
            const isConfirming = confirmRemoveId === member.id;
            return (
              <div key={member.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, marginBottom: 8,
                background: 'white', border: '1px solid #FFE0B0',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: isYou ? 'linear-gradient(135deg, #FF9933, #FFD700)' : '#f0e8e0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isYou ? 'white' : '#888', fontWeight: 700, fontSize: 15, flexShrink: 0,
                }}>
                  {(member.name || 'D').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#2D2D2D' }}>
                    {member.name || 'Devotee'} {isYou ? '(You)' : ''}
                    {member.isAdmin && <span style={{ fontSize: 11, color: '#FF9933', marginLeft: 6 }}>👑 Admin</span>}
                  </p>
                  {member.joinedAt && (
                    <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
                      Joined {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </p>
                  )}
                </div>
                {!isYou && (
                  isConfirming ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setConfirmRemoveId(null)}
                        style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#f0e8e0', color: '#888', fontSize: 12, cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={removingMember === member.id}
                        style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                        {removingMember === member.id ? '...' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemoveId(member.id)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ffccc0', background: '#fff5f0', color: '#e67e22', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                      Remove
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Logout section */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Account</div>
        <p style={styles.sectionDesc}>
          Logging out will end your session on this device. Your account, progress, and PIN are saved — you can log back in any time with your name and PIN.
        </p>
        {!showLogoutConfirm ? (
          <button style={styles.logoutBtn} onClick={() => setShowLogoutConfirm(true)}>🔓 Log Out</button>
        ) : (
          <div style={styles.confirmBox}>
            <p style={styles.confirmText}>Are you sure you want to log out?</p>
            <div style={styles.confirmRow}>
              <button style={styles.cancelBtn} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button style={styles.confirmLogoutBtn} onClick={handleLogout}>Yes, Log Out</button>
            </div>
          </div>
        )}
      </div>

      {/* Leave Sangha section */}
      {sangha && !isAdmin && (
        <div style={{ ...styles.section, borderColor: '#ffe0cc' }}>
          <div style={{ ...styles.sectionTitle, color: '#e67e22' }}>Leave Sangha</div>
          <p style={styles.sectionDesc}>
            Leaving the sangha will remove your name from <strong>{sangha}</strong>. Your account and progress are NOT deleted.
          </p>
          {!showLeaveConfirm ? (
            <button style={styles.leaveBtn} onClick={() => setShowLeaveConfirm(true)}>⚠️ Leave Sangha</button>
          ) : (
            <div style={{ ...styles.confirmBox, borderColor: '#ffe0cc' }}>
              <p style={styles.confirmText}>Are you sure you want to leave <strong>{sangha}</strong>?</p>
              <div style={styles.confirmRow}>
                <button style={styles.cancelBtn} onClick={() => setShowLeaveConfirm(false)}>Cancel</button>
                <button style={styles.confirmLeaveBtn} onClick={handleLeaveSangha} disabled={leaving}>
                  {leaving ? 'Leaving…' : 'Yes, Leave'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PIN reminder */}
      <div style={styles.pinReminder}>
        <div style={styles.pinReminderIcon}>🔐</div>
        <div>
          <div style={styles.pinReminderTitle}>Remember your PIN</div>
          <div style={styles.pinReminderText}>
            Your 4-digit PIN is required to log back in. Please remember it or note it down safely. If forgotten, contact your group admin.
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  page: { padding: '20px 16px 100px', maxWidth: 500, margin: '0 auto', fontFamily: "'Georgia', serif", minHeight: '100vh', background: '#fdf9f4' },
  centered: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 36, height: 36, border: '3px solid #f0e8e0', borderTop: '3px solid #ff6b35', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  header: { display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  avatar: { width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b35, #ff8c42)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, flexShrink: 0 },
  name: { fontWeight: 700, fontSize: 20, color: '#222' },
  sub: { fontSize: 13, color: '#888', marginTop: 2 },
  infoCard: { background: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f0eb' },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, color: '#333', fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' },
  section: { background: '#fff', border: '1.5px solid #e8e0d8', borderRadius: 14, padding: '18px 20px', marginBottom: 16 },
  sectionTitle: { fontWeight: 700, fontSize: 16, color: '#333', marginBottom: 6 },
  sectionDesc: { fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 14 },
  logoutBtn: { width: '100%', padding: '13px', background: '#f5f0eb', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#333' },
  leaveBtn: { width: '100%', padding: '13px', background: '#fff5f0', border: '1.5px solid #ffccc0', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#e67e22' },
  confirmBox: { background: '#fdf9f4', border: '1.5px solid #e8e0d8', borderRadius: 10, padding: '14px' },
  confirmText: { fontSize: 13, color: '#555', marginBottom: 12, lineHeight: 1.5 },
  confirmRow: { display: 'flex', gap: 10 },
  cancelBtn: { flex: 1, padding: '10px', background: '#f5f0eb', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#555' },
  confirmLogoutBtn: { flex: 1, padding: '10px', background: '#555', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  confirmLeaveBtn: { flex: 1, padding: '10px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  pinReminder: { display: 'flex', gap: 12, alignItems: 'flex-start', background: '#fffbf0', border: '1.5px solid #fde8a0', borderRadius: 12, padding: '14px 16px', marginTop: 8 },
  pinReminderIcon: { fontSize: 22, flexShrink: 0 },
  pinReminderTitle: { fontWeight: 700, fontSize: 14, color: '#8a6200', marginBottom: 4 },
  pinReminderText: { fontSize: 12, color: '#a07800', lineHeight: 1.5 },
};