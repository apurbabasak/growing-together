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
  if (entry.jps_app?.read === true) total += 5;
  if (entry.chanting_time?.bonus === true) total += 3;
  return Math.round(total * 10) / 10;
}

// Build CSV content for a member's progress report
function buildCSV(name, memberEntries, allDates) {
  const memberDates = allDates.filter(d => memberEntries[d]);
  const headers = ['Date', 'Day', 'Chanting Rounds', 'Reading (min)', 'Reading Topic', 'Hearing (min)', 'Devotional Service', 'JPS App', 'Chanting Time', 'Chanting Bonus', 'Score /108'];
  const rows = memberDates.map(date => {
    const e = memberEntries[date] || {};
    const score = calculateScore(e);
    const rounds = e.chanting?.rounds_completed || 0;
    const readMins = e.reading?.minutes || 0;
    const readTopic = e.reading?.topic || '';
    const hearMins = e.hearing?.minutes || 0;
    const services = (e.devotional_service?.activities || []).join('; ');
    const jps = e.jps_app?.read === true ? 'Yes' : e.jps_app?.read === false ? 'No' : '';
    const chTime = e.chanting_time?.time || '';
    const chBonus = e.chanting_time?.bonus === true ? 'Yes' : 'No';
    const dateObj = new Date(date + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
    return [date, dayName, rounds, readMins, readTopic, hearMins, services, jps, chTime, chBonus, score];
  });

  // Summary row
  const doneFull = memberDates.filter(d => (memberEntries[d]?.chanting?.rounds_completed || 0) >= 16).length;
  const doneRead = memberDates.filter(d => memberEntries[d]?.reading?.minutes > 0).length;
  const doneHear = memberDates.filter(d => memberEntries[d]?.hearing?.minutes > 0).length;
  const doneServ = memberDates.filter(d => (memberEntries[d]?.devotional_service?.activities || []).length > 0).length;
  const doneJps = memberDates.filter(d => memberEntries[d]?.jps_app?.read === true).length;
  const doneBonus = memberDates.filter(d => memberEntries[d]?.chanting_time?.bonus === true).length;
  const totalScore = memberDates.reduce((s, d) => s + calculateScore(memberEntries[d]), 0);
  const avgScore = memberDates.length > 0 ? (totalScore / memberDates.length).toFixed(1) : '0.0';

  const allRows = [
    [`SADHANA PROGRESS REPORT — ${name}`],
    [`Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`],
    [`Total Days Logged: ${memberDates.length}`],
    [],
    headers,
    ...rows,
    [],
    ['SUMMARY'],
    ['Total days logged', memberDates.length],
    ['Full rounds days (≥16)', doneFull],
    ['Reading days', doneRead],
    ['Hearing days', doneHear],
    ['Devotional service days', doneServ],
    ['JPS App read days', doneJps],
    ['Early chanting bonus days', doneBonus],
    ['Average score /108', avgScore],
  ];

  return allRows.map(row => row.map(cell => {
    const str = String(cell ?? '');
    // Escape cells with commas, quotes, or newlines
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(',')).join('\n');
}

function downloadCSV(csvContent, filename) {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ProgressPage() {
  const [members, setMembers] = useState({});
  const [userId, setUserId] = useState('');
  const [sanghaCode, setSanghaCode] = useState('');
  const [allDates, setAllDates] = useState([]);
  const [selectedMember, setSelectedMember] = useState('all');
  const [loading, setLoading] = useState(true);

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
          const m = data.members || {};
          setMembers(m);
          const dates = new Set();
          Object.values(m).forEach(member => {
            Object.keys(member.daily_entries || {}).forEach(d => dates.add(d));
          });
          const sorted = Array.from(dates).sort((a, b) => b.localeCompare(a));
          setAllDates(sorted);
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, []);

  const memberList = Object.entries(members).map(([uid, m]) => ({ uid, name: m.name }));
  const filteredMembers = selectedMember === 'all' ? memberList : memberList.filter(m => m.uid === selectedMember);

  const handleDownload = (uid, name) => {
    const memberEntries = members[uid]?.daily_entries || {};
    const csv = buildCSV(name, memberEntries, allDates);
    const safeDate = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `sadhana_report_${name.replace(/\s+/g,'_')}_${safeDate}.csv`);
  };

  const handleDownloadAll = () => {
    // Download all members in one file
    let combined = `ALL MEMBERS SADHANA REPORT\nGenerated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n`;
    memberList.forEach(({ uid, name }) => {
      const memberEntries = members[uid]?.daily_entries || {};
      combined += buildCSV(name, memberEntries, allDates);
      combined += '\n\n\n';
    });
    const safeDate = new Date().toISOString().split('T')[0];
    downloadCSV(combined, `sadhana_all_members_${safeDate}.csv`);
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #FF9933, #FFD700)',
    color: 'white', fontSize: '11px', fontWeight: 'bold',
    padding: '10px 8px', textAlign: 'center',
    whiteSpace: 'nowrap', letterSpacing: '0.3px',
    borderRight: '1px solid rgba(255,255,255,0.2)',
  };

  const cellStyle = (highlight) => ({
    padding: '9px 8px', fontSize: '12px', textAlign: 'center',
    borderRight: '1px solid #FFE0B0', borderBottom: '1px solid #FFF0E0',
    background: highlight ? 'rgba(255,153,51,0.06)' : 'white',
    color: '#2D2D2D', whiteSpace: 'nowrap',
  });

  const badgeStyle = (color, bg) => ({
    display: 'inline-block', padding: '2px 7px', borderRadius: '999px',
    background: bg, color: color, fontSize: '11px', fontWeight: 'bold',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)', padding: '20px 20px 24px', borderRadius: '0 0 24px 24px', marginBottom: '16px' }}>
        <h1 style={{ color: 'white', fontSize: '20px', margin: '0 0 4px', fontWeight: 'bold' }}>📊 Sangha Progress</h1>
        <p style={{ color: 'white', fontSize: '12px', margin: 0, opacity: 0.9 }}>Complete sadhana history for all devotees</p>
      </div>

      <div style={{ padding: '0 12px' }}>

        {/* Filter tabs */}
        <div style={{ marginBottom: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setSelectedMember('all')}
            style={{ padding: '7px 14px', borderRadius: '999px', border: 'none', background: selectedMember === 'all' ? 'linear-gradient(135deg, #FF9933, #FFD700)' : 'white', color: selectedMember === 'all' ? 'white' : '#FF9933', fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(255,153,51,0.1)' }}>
            🌸 All
          </button>
          {memberList.map(m => (
            <button key={m.uid} onClick={() => setSelectedMember(m.uid)}
              style={{ padding: '7px 14px', borderRadius: '999px', border: 'none', background: selectedMember === m.uid ? 'linear-gradient(135deg, #FF9933, #FFD700)' : 'white', color: selectedMember === m.uid ? 'white' : '#FF9933', fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(255,153,51,0.1)' }}>
              {m.name}{m.uid === userId ? ' (You)' : ''}
            </button>
          ))}
        </div>

        {/* Download buttons */}
        {!loading && allDates.length > 0 && (
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selectedMember !== 'all' ? (
              <button onClick={() => {
                const m = memberList.find(x => x.uid === selectedMember);
                if (m) handleDownload(m.uid, m.name);
              }}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                ⬇️ Download My Report (Excel/CSV)
              </button>
            ) : (
              <>
                <button onClick={() => {
                  const me = memberList.find(x => x.uid === userId);
                  if (me) handleDownload(me.uid, me.name);
                }}
                  style={{ flex: 1, padding: '12px 10px', borderRadius: '999px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: 'white', fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(34,197,94,0.2)' }}>
                  ⬇️ My Report
                </button>
                <button onClick={handleDownloadAll}
                  style={{ flex: 1, padding: '12px 10px', borderRadius: '999px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: 'white', fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
                  ⬇️ All Members
                </button>
              </>
            )}
          </div>
        )}

        {/* Info about download format */}
        {!loading && allDates.length > 0 && (
          <div style={{ background: 'rgba(34,197,94,0.08)', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#16a34a', lineHeight: 1.5 }}>
              📊 Downloads as .CSV file — open directly in Microsoft Excel, Google Sheets, or Numbers. Contains all columns shown in the table below plus a summary section.
            </p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔄</div>
            <p style={{ color: '#FF9933', fontSize: '14px' }}>Loading progress...</p>
          </div>
        )}

        {!loading && allDates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📿</div>
            <h2 style={{ color: '#2D2D2D', fontSize: '18px', margin: '0 0 8px' }}>No data yet</h2>
            <p style={{ color: '#6B6B6B', fontSize: '14px' }}>Start logging your sadhana on the dashboard!</p>
          </div>
        )}

        {!loading && allDates.length > 0 && filteredMembers.map(({ uid, name }) => {
          const memberEntries = members[uid]?.daily_entries || {};
          const memberDates = allDates.filter(d => memberEntries[d]);
          if (memberDates.length === 0) return null;

          const totalScore = memberDates.reduce((sum, d) => sum + calculateScore(memberEntries[d]), 0);
          const avgScore = memberDates.length > 0 ? (totalScore / memberDates.length).toFixed(1) : 0;
          const completeDays = memberDates.filter(d => calculateScore(memberEntries[d]) >= 90).length;

          return (
            <div key={uid} style={{ marginBottom: '24px' }}>

              {/* Member summary card */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', marginBottom: '10px', boxShadow: '0 2px 12px rgba(255,153,51,0.1)', border: '1px solid rgba(255,153,51,0.15)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF9933, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '15px', color: '#2D2D2D', fontWeight: 'bold' }}>{name}{uid === userId ? ' (You)' : ''}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B6B6B' }}>{memberDates.length} days logged · Avg {avgScore}/108 · {completeDays} excellent days</p>
                </div>
                {/* Per-member download button */}
                <button onClick={() => handleDownload(uid, name)}
                  style={{ padding: '8px 12px', borderRadius: '999px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  ⬇️ Excel
                </button>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', borderRadius: '16px', boxShadow: '0 2px 12px rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.15)' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '700px' }}>
                  <thead>
                    <tr>
                      <th style={{ ...headerStyle, textAlign: 'left', padding: '10px 12px', position: 'sticky', left: 0, background: 'linear-gradient(135deg, #FF9933, #FFD700)', zIndex: 2 }}>📅 Date</th>
                      <th style={headerStyle}>🕉️ Rounds</th>
                      <th style={headerStyle}>📖 Reading</th>
                      <th style={headerStyle}>🎧 Hearing</th>
                      <th style={headerStyle}>🪷 Service</th>
                      <th style={headerStyle}>📱 JPS App</th>
                      <th style={headerStyle}>⏰ Chant Time</th>
                      <th style={{ ...headerStyle, borderRight: 'none' }}>🏆 Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberDates.map((date, idx) => {
                      const e = memberEntries[date] || {};
                      const score = calculateScore(e);
                      const isToday = date === new Date().toISOString().split('T')[0];
                      const alt = idx % 2 === 0;
                      const rounds = e.chanting?.rounds_completed || 0;
                      const readMins = e.reading?.minutes || 0;
                      const hearMins = e.hearing?.minutes || 0;
                      const services = e.devotional_service?.activities || [];
                      const jps = e.jps_app?.read;
                      const chTime = e.chanting_time?.time;
                      const chBonus = e.chanting_time?.bonus;

                      const scoreColor = score >= 100 ? '#16a34a' : score >= 80 ? '#FF9933' : score >= 50 ? '#f59e0b' : '#ef4444';
                      const scoreBg = score >= 100 ? '#f0fdf4' : score >= 80 ? '#FFF5E0' : score >= 50 ? '#fffbeb' : '#fff5f5';

                      return (
                        <tr key={date}>
                          <td style={{ ...cellStyle(alt), textAlign: 'left', padding: '9px 12px', position: 'sticky', left: 0, background: isToday ? '#FFFAF0' : alt ? 'rgba(255,153,51,0.04)' : 'white', zIndex: 1, borderRight: '2px solid #FFD700' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: isToday ? 'bold' : 'normal', color: isToday ? '#FF9933' : '#2D2D2D' }}>
                              {isToday ? '⭐ Today' : new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </p>
                            <p style={{ margin: 0, fontSize: '10px', color: '#6B6B6B' }}>
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}
                            </p>
                          </td>
                          <td style={cellStyle(alt)}>
                            {rounds > 0 ? (
                              <span style={badgeStyle(rounds >= 16 ? '#16a34a' : '#FF9933', rounds >= 16 ? '#f0fdf4' : '#FFF5E0')}>
                                {rounds} rds
                              </span>
                            ) : <span style={{ color: '#ccc', fontSize: '14px' }}>—</span>}
                          </td>
                          <td style={cellStyle(alt)}>
                            {readMins > 0 ? (
                              <div>
                                <span style={badgeStyle('#FF9933', '#FFF5E0')}>{readMins} min</span>
                                {e.reading?.topic && <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#6B6B6B', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.reading.topic}</p>}
                              </div>
                            ) : <span style={{ color: '#ccc', fontSize: '14px' }}>—</span>}
                          </td>
                          <td style={cellStyle(alt)}>
                            {hearMins > 0 ? (
                              <span style={badgeStyle('#FF9933', '#FFF5E0')}>{hearMins} min</span>
                            ) : <span style={{ color: '#ccc', fontSize: '14px' }}>—</span>}
                          </td>
                          <td style={cellStyle(alt)}>
                            {services.length > 0 ? (
                              <div>
                                <span style={badgeStyle('#7c3aed', '#f5f3ff')}>{services.length} seva{services.length > 1 ? 's' : ''}</span>
                                {(services.includes('fasting') || services.includes('seva_of_guru')) && (
                                  <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#7c3aed' }}>+bonus</p>
                                )}
                              </div>
                            ) : <span style={{ color: '#ccc', fontSize: '14px' }}>—</span>}
                          </td>
                          <td style={cellStyle(alt)}>
                            {jps === true ? <span style={badgeStyle('#16a34a', '#f0fdf4')}>✅ Yes</span>
                              : jps === false ? <span style={badgeStyle('#ef4444', '#fff5f5')}>❌ No</span>
                              : <span style={{ color: '#ccc', fontSize: '14px' }}>—</span>}
                          </td>
                          <td style={cellStyle(alt)}>
                            {chTime ? (
                              <div>
                                <span style={badgeStyle(chBonus ? '#16a34a' : '#6B6B6B', chBonus ? '#f0fdf4' : '#f5f5f5')}>{chTime}</span>
                                {chBonus && <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#16a34a' }}>⭐ +3 pts</p>}
                              </div>
                            ) : <span style={{ color: '#ccc', fontSize: '14px' }}>—</span>}
                          </td>
                          <td style={{ ...cellStyle(alt), borderRight: 'none' }}>
                            <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: scoreBg, color: scoreColor, fontSize: '13px', fontWeight: 'bold' }}>
                              {score}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'linear-gradient(135deg, #FFF5E0, #FFF0D0)' }}>
                      <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 'bold', color: '#FF9933', borderTop: '2px solid #FFD700', position: 'sticky', left: 0, background: 'linear-gradient(135deg, #FFF5E0, #FFF0D0)', zIndex: 1 }}>📊 Summary</td>
                      <td style={{ padding: '10px 8px', fontSize: '11px', color: '#6B6B6B', textAlign: 'center', borderTop: '2px solid #FFD700' }}>
                        {memberDates.filter(d => (memberEntries[d]?.chanting?.rounds_completed || 0) >= 16).length}d full
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '11px', color: '#6B6B6B', textAlign: 'center', borderTop: '2px solid #FFD700' }}>
                        {memberDates.filter(d => memberEntries[d]?.reading?.minutes > 0).length}d logged
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '11px', color: '#6B6B6B', textAlign: 'center', borderTop: '2px solid #FFD700' }}>
                        {memberDates.filter(d => memberEntries[d]?.hearing?.minutes > 0).length}d logged
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '11px', color: '#6B6B6B', textAlign: 'center', borderTop: '2px solid #FFD700' }}>
                        {memberDates.filter(d => (memberEntries[d]?.devotional_service?.activities || []).length > 0).length}d logged
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '11px', color: '#6B6B6B', textAlign: 'center', borderTop: '2px solid #FFD700' }}>
                        {memberDates.filter(d => memberEntries[d]?.jps_app?.read === true).length}d read
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '11px', color: '#6B6B6B', textAlign: 'center', borderTop: '2px solid #FFD700' }}>
                        {memberDates.filter(d => memberEntries[d]?.chanting_time?.bonus === true).length}d bonus
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '12px', fontWeight: 'bold', color: '#FF9933', textAlign: 'center', borderTop: '2px solid #FFD700', borderRight: 'none' }}>
                        avg {avgScore}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}