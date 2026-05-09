'use client';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

const BOOKS = [
  {
    id: 'bg', title: 'Bhagavad-gītā As It Is',
    chapters: 18,
    chapterVerses: [46,72,43,42,29,47,30,28,34,42,55,20,35,27,20,24,28,78],
    icon: '📘'
  },
  {
    id: 'sb', title: 'Śrīmad-Bhāgavatam',
    chapters: 335,
    cantos: 12,
    icon: '📙'
  },
  {
    id: 'cc', title: 'Śrī Caitanya-caritāmṛta',
    chapters: 87,
    icon: '📗'
  },
  {
    id: 'noi', title: 'Nectar of Instruction',
    chapters: 11, icon: '📒'
  },
  {
    id: 'nod', title: 'The Nectar of Devotion',
    chapters: 44, icon: '📕'
  },
  {
    id: 'iso', title: 'Śrī Īśopaniṣad',
    chapters: 18, icon: '📔'
  },
  {
    id: 'krishna', title: 'Kṛṣṇa, The Supreme Personality',
    chapters: 90, icon: '📓'
  },
  {
    id: 'ssr', title: 'The Science of Self-Realization',
    chapters: 8, icon: '📖'
  },
  {
    id: 'bs', title: 'Śrī Brahma-saṁhitā',
    chapters: 5, icon: '📜'
  },
  {
    id: 'tlc', title: 'Teachings of Lord Caitanya',
    chapters: 34, icon: '📃'
  },
];

function getDefaultVerses(bookId, chapter) {
  if (bookId === 'bg') {
    const verses = [46,72,43,42,29,47,30,28,34,42,55,20,35,27,20,24,28,78];
    return verses[chapter - 1] || 20;
  }
  return 20;
}

function generateSchedule(plan) {
  const { startChapter, startVerse, targetChapter, targetVerse, targetDate, bookId } = plan;
  const today = new Date();
  const end = new Date(targetDate);
  const totalDays = Math.max(1, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));

  // Estimate total verses remaining
  let totalVerses = 0;
  for (let ch = startChapter; ch <= targetChapter; ch++) {
    const maxV = getDefaultVerses(bookId, ch);
    const fromV = ch === startChapter ? startVerse : 1;
    const toV = ch === targetChapter ? targetVerse : maxV;
    totalVerses += Math.max(0, toV - fromV + 1);
  }

  const versesPerDay = Math.ceil(totalVerses / totalDays);
  const schedule = [];
  let currentChapter = startChapter;
  let currentVerse = startVerse;

  for (let day = 0; day < totalDays; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    let versesLeft = versesPerDay;
    const dayItems = [];

    while (versesLeft > 0 && (currentChapter < targetChapter || (currentChapter === targetChapter && currentVerse <= targetVerse))) {
      const maxV = getDefaultVerses(bookId, currentChapter);
      const endV = Math.min(currentVerse + versesLeft - 1, maxV, currentChapter === targetChapter ? targetVerse : maxV);
      dayItems.push({ chapter: currentChapter, fromVerse: currentVerse, toVerse: endV });
      versesLeft -= (endV - currentVerse + 1);
      if (endV >= maxV || (currentChapter === targetChapter && endV >= targetVerse)) {
        currentChapter++;
        currentVerse = 1;
      } else {
        currentVerse = endV + 1;
      }
    }
    if (dayItems.length > 0) schedule.push({ date: dateStr, items: dayItems, done: false });
    if (currentChapter > targetChapter) break;
  }
  return schedule;
}

export default function ReadingTogether() {
  const [userId, setUserId] = useState('');
  const [sanghaCode, setSanghaCode] = useState('');
  const [view, setView] = useState('home'); // home, selectBook, setupPlan, schedule, logReading
  const [selectedBook, setSelectedBook] = useState(null);
  const [plan, setPlan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState({});

  // Plan form state
  const [startChapter, setStartChapter] = useState(1);
  const [startVerse, setStartVerse] = useState(1);
  const [targetChapter, setTargetChapter] = useState(2);
  const [targetVerse, setTargetVerse] = useState(1);
  const [targetDate, setTargetDate] = useState('');

  // Log reading state
  const [logChapter, setLogChapter] = useState(1);
  const [logFromVerse, setLogFromVerse] = useState(1);
  const [logToVerse, setLogToVerse] = useState(1);
  const [todaySchedule, setTodaySchedule] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem('userId') || '';
    const code = localStorage.getItem('sanghaCode') || '';
    setUserId(uid);
    setSanghaCode(code);

    if (code) {
      const sanghaRef = doc(db, 'sanghas', code);
      const unsub = onSnapshot(sanghaRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setMembers(data.members || {});
          const myPlan = data.members?.[uid]?.reading_plan || null;
          if (myPlan) {
            setPlan(myPlan);
            setSchedule(myPlan.schedule || []);
            const todayStr = new Date().toISOString().split('T')[0];
            const todayItem = (myPlan.schedule || []).find(s => s.date === todayStr);
            setTodaySchedule(todayItem || null);
            const book = BOOKS.find(b => b.id === myPlan.bookId);
            setSelectedBook(book || null);
          }
        }
      });
      return () => unsub();
    }
  }, []);

  const savePlan = async () => {
    setSaving(true);
    const newPlan = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      startChapter, startVerse,
      targetChapter, targetVerse,
      targetDate,
      createdAt: new Date().toISOString(),
      schedule: generateSchedule({ startChapter, startVerse, targetChapter, targetVerse, targetDate, bookId: selectedBook.id })
    };
    const sanghaRef = doc(db, 'sanghas', sanghaCode);
    const snap = await getDoc(sanghaRef);
    const existing = snap.data();
    await setDoc(sanghaRef, {
      ...existing,
      members: {
        ...existing.members,
        [userId]: { ...existing.members[userId], reading_plan: newPlan }
      }
    });
    setSaving(false);
    setView('schedule');
  };

  const logTodayReading = async () => {
    setSaving(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const sanghaRef = doc(db, 'sanghas', sanghaCode);
    const snap = await getDoc(sanghaRef);
    const existing = snap.data();
    const currentPlan = existing.members?.[userId]?.reading_plan;

    // Check if matches schedule
    const todayItem = (currentPlan?.schedule || []).find(s => s.date === todayStr);
    let newSchedule = [...(currentPlan?.schedule || [])];

    // Mark today done
    newSchedule = newSchedule.map(s => {
      if (s.date === todayStr) return { ...s, done: true, logged: { chapter: logChapter, fromVerse: logFromVerse, toVerse: logToVerse } };
      return s;
    });

    // Check if off-track and recalculate remaining
    const scheduledEndVerse = todayItem?.items?.[todayItem.items.length - 1]?.toVerse || logToVerse;
    const scheduledEndChapter = todayItem?.items?.[todayItem.items.length - 1]?.chapter || logChapter;

    if (logChapter !== scheduledEndChapter || logToVerse !== scheduledEndVerse) {
      // Recalculate remaining schedule from tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const newSubPlan = generateSchedule({
        startChapter: logChapter,
        startVerse: logToVerse + 1 > getDefaultVerses(currentPlan.bookId, logChapter) ? logChapter + 1 : logChapter,
        startVerse: logToVerse + 1 > getDefaultVerses(currentPlan.bookId, logChapter) ? 1 : logToVerse + 1,
        targetChapter: currentPlan.targetChapter,
        targetVerse: currentPlan.targetVerse,
        targetDate: currentPlan.targetDate,
        bookId: currentPlan.bookId
      });
      // Replace future dates
      const pastSchedule = newSchedule.filter(s => s.date <= todayStr);
      newSchedule = [...pastSchedule, ...newSubPlan];
    }

    await setDoc(sanghaRef, {
      ...existing,
      members: {
        ...existing.members,
        [userId]: {
          ...existing.members[userId],
          reading_plan: { ...currentPlan, schedule: newSchedule }
        }
      }
    });
    setSaving(false);
    setView('schedule');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const completedDays = schedule.filter(s => s.done).length;
  const totalDays = schedule.length;
  const progressPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // ── HOME VIEW ──
  if (view === 'home') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      <div style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)', padding: '24px 20px 32px', borderRadius: '0 0 28px 28px' }}>
        <h1 style={{ color: 'white', fontSize: '22px', margin: '0 0 4px', fontWeight: 'bold' }}>📚 Reading Together</h1>
        <p style={{ color: 'white', fontSize: '13px', margin: 0, opacity: 0.9 }}>Study Srila Prabhupada's books as a Sangha</p>
      </div>

      <div style={{ padding: '20px' }}>
        {!plan ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <p style={{ fontSize: '56px', margin: '0 0 16px' }}>📖</p>
            <h2 style={{ color: '#2D2D2D', fontSize: '18px', margin: '0 0 8px' }}>No reading plan yet</h2>
            <p style={{ color: '#6B6B6B', fontSize: '14px', margin: '0 0 24px' }}>Select a book and set your target to get a personalised daily schedule</p>
            <button onClick={() => setView('selectBook')} style={{
              padding: '14px 32px', borderRadius: '999px',
              background: 'linear-gradient(135deg, #FF9933, #FFD700)',
              border: 'none', color: 'white', fontSize: '16px',
              cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold'
            }}>📚 Start Reading Plan</button>
          </div>
        ) : (
          <>
            {/* Current plan card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(255,153,51,0.1)', border: '1px solid rgba(255,153,51,0.15)' }}>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B6B6B' }}>Currently Reading</p>
              <h2 style={{ margin: '0 0 12px', fontSize: '17px', color: '#2D2D2D' }}>{selectedBook?.icon} {plan.bookTitle}</h2>
              <div style={{ background: '#FFF0E0', borderRadius: '999px', height: '8px', marginBottom: '6px' }}>
                <div style={{ background: 'linear-gradient(90deg, #FF9933, #FFD700)', borderRadius: '999px', height: '100%', width: `${progressPct}%`, transition: 'width 0.5s' }} />
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#6B6B6B' }}>{completedDays} of {totalDays} days completed · {progressPct}%</p>

              {/* Today's target */}
              {todaySchedule && !todaySchedule.done && (
                <div style={{ background: '#FFFAF0', borderRadius: '14px', padding: '14px', marginBottom: '12px', border: '1px solid #FFD700' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 'bold', color: '#FF9933' }}>📅 Today's Target</p>
                  {todaySchedule.items.map((item, i) => (
                    <p key={i} style={{ margin: '0 0 2px', fontSize: '13px', color: '#2D2D2D' }}>
                      Chapter {item.chapter} · Verses {item.fromVerse}–{item.toVerse}
                    </p>
                  ))}
                </div>
              )}
              {todaySchedule?.done && (
                <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '14px', marginBottom: '12px', border: '1px solid #86efac' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#22c55e', fontWeight: 'bold' }}>✅ Today's reading logged!</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setView('schedule')} style={{ flex: 1, padding: '12px', borderRadius: '999px', background: '#FFF0E0', border: 'none', color: '#FF9933', fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                  📅 Full Schedule
                </button>
                <button onClick={() => { setLogChapter(todaySchedule?.items?.[0]?.chapter || 1); setLogFromVerse(todaySchedule?.items?.[0]?.fromVerse || 1); setLogToVerse(todaySchedule?.items?.[0]?.toVerse || 1); setView('logReading'); }} style={{ flex: 1, padding: '12px', borderRadius: '999px', background: 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none', color: 'white', fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                  ✏️ Log Reading
                </button>
              </div>
            </div>

            {/* Sangha members progress */}
            <h2 style={{ color: '#2D2D2D', fontSize: '16px', margin: '0 0 12px' }}>🌸 Sangha Reading Progress</h2>
            {Object.entries(members).map(([uid, m]) => {
              const mPlan = m.reading_plan;
              if (!mPlan) return null;
              const mDone = (mPlan.schedule || []).filter(s => s.done).length;
              const mTotal = (mPlan.schedule || []).length;
              const mPct = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
              return (
                <div key={uid} style={{ background: 'white', borderRadius: '16px', padding: '14px', marginBottom: '10px', boxShadow: '0 2px 12px rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF9933, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#2D2D2D', fontWeight: 'bold' }}>{m.name} {uid === userId ? '(You)' : ''}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6B6B6B' }}>{BOOKS.find(b => b.id === mPlan.bookId)?.title || mPlan.bookTitle}</p>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#FF9933' }}>{mPct}%</span>
                  </div>
                  <div style={{ background: '#FFF0E0', borderRadius: '999px', height: '6px' }}>
                    <div style={{ background: 'linear-gradient(90deg, #FF9933, #FFD700)', borderRadius: '999px', height: '100%', width: `${mPct}%` }} />
                  </div>
                </div>
              );
            })}

            <button onClick={() => setView('selectBook')} style={{ width: '100%', marginTop: '12px', padding: '14px', borderRadius: '999px', background: 'white', border: '2px solid #FF9933', color: '#FF9933', fontSize: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
              🔄 Change Book / Reset Plan
            </button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );

  // ── SELECT BOOK VIEW ──
  if (view === 'selectBook') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      <div style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)', padding: '20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => setView('home')} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', fontSize: '18px', cursor: 'pointer' }}>←</button>
        <h1 style={{ color: 'white', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>Select a Book</h1>
      </div>
      <div style={{ padding: '20px' }}>
        <p style={{ color: '#6B6B6B', fontSize: '14px', margin: '0 0 16px' }}>Choose which book your Sangha will read together:</p>
        {BOOKS.map(book => (
          <button key={book.id} onClick={() => { setSelectedBook(book); setView('setupPlan'); }}
            style={{ width: '100%', background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '10px', border: '1px solid rgba(255,153,51,0.2)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: '0 2px 12px rgba(255,153,51,0.07)', textAlign: 'left' }}>
            <span style={{ fontSize: '28px' }}>{book.icon}</span>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '15px', color: '#2D2D2D', fontWeight: 'bold' }}>{book.title}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B6B6B' }}>{book.chapters} chapters</p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#FF9933', fontSize: '18px' }}>›</span>
          </button>
        ))}
      </div>
      <BottomNav />
    </div>
  );

  // ── SETUP PLAN VIEW ──
  if (view === 'setupPlan') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      <div style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)', padding: '20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => setView('selectBook')} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', fontSize: '18px', cursor: 'pointer' }}>←</button>
        <div>
          <p style={{ color: 'white', fontSize: '11px', margin: '0 0 2px', opacity: 0.9 }}>Setting up plan for</p>
          <h1 style={{ color: 'white', fontSize: '18px', margin: 0, fontWeight: 'bold' }}>{selectedBook?.icon} {selectedBook?.title}</h1>
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Where are you now */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '14px', boxShadow: '0 4px 16px rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.15)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#2D2D2D' }}>📍 Where are you now?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6B6B6B' }}>Current Chapter</p>
              <input type="number" min="1" max={selectedBook?.chapters || 99} value={startChapter}
                onChange={e => setStartChapter(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #FFD700', fontSize: '16px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box' }} />
            </div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6B6B6B' }}>Current Verse</p>
              <input type="number" min="1" value={startVerse}
                onChange={e => setStartVerse(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #FFD700', fontSize: '16px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        {/* Target */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '14px', boxShadow: '0 4px 16px rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.15)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#2D2D2D' }}>🎯 What is your target?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6B6B6B' }}>Target Chapter</p>
              <input type="number" min={startChapter} max={selectedBook?.chapters || 99} value={targetChapter}
                onChange={e => setTargetChapter(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #FFD700', fontSize: '16px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box' }} />
            </div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6B6B6B' }}>Target Verse</p>
              <input type="number" min="1" value={targetVerse}
                onChange={e => setTargetVerse(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #FFD700', fontSize: '16px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6B6B6B' }}>Target Completion Date</p>
            <input type="date" value={targetDate} min={new Date().toISOString().split('T')[0]}
              onChange={e => setTargetDate(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #FFD700', fontSize: '15px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box' }} />
          </div>
        </div>

        <button onClick={savePlan} disabled={saving || !targetDate}
          style={{ width: '100%', padding: '16px', borderRadius: '999px', background: saving ? '#ccc' : 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
          {saving ? 'Creating Schedule...' : '✨ Generate My Daily Schedule'}
        </button>
      </div>
      <BottomNav />
    </div>
  );

  // ── SCHEDULE VIEW ──
  if (view === 'schedule') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      <div style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)', padding: '20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <button onClick={() => setView('home')} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', fontSize: '18px', cursor: 'pointer' }}>←</button>
          <h1 style={{ color: 'white', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>📅 Daily Schedule</h1>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '14px', padding: '12px 16px' }}>
          <p style={{ color: 'white', fontSize: '13px', margin: '0 0 6px', opacity: 0.9 }}>{selectedBook?.title}</p>
          <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '999px', height: '6px' }}>
            <div style={{ background: 'white', borderRadius: '999px', height: '100%', width: `${progressPct}%` }} />
          </div>
          <p style={{ color: 'white', fontSize: '12px', margin: '6px 0 0', opacity: 0.9 }}>{completedDays}/{totalDays} days · {progressPct}% complete</p>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {schedule.map((day, i) => {
          const isToday = day.date === todayStr;
          const isPast = day.date < todayStr;
          return (
            <div key={i} style={{
              background: day.done ? '#f0fdf4' : isToday ? '#FFFAF0' : 'white',
              borderRadius: '16px', padding: '14px 16px', marginBottom: '10px',
              border: day.done ? '1px solid #86efac' : isToday ? '1px solid #FFD700' : '1px solid rgba(255,153,51,0.12)',
              opacity: isPast && !day.done ? 0.6 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 'bold', color: isToday ? '#FF9933' : '#2D2D2D' }}>
                    {isToday ? '📅 Today' : new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  {day.items.map((item, j) => (
                    <p key={j} style={{ margin: '0 0 2px', fontSize: '13px', color: '#6B6B6B' }}>
                      Ch {item.chapter} · Verses {item.fromVerse}–{item.toVerse}
                    </p>
                  ))}
                </div>
                <span style={{ fontSize: '20px' }}>
                  {day.done ? '✅' : isToday ? '📖' : isPast ? '⏭️' : '📿'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );

  // ── LOG READING VIEW ──
  if (view === 'logReading') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      <div style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)', padding: '20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => setView('home')} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', fontSize: '18px', cursor: 'pointer' }}>←</button>
        <h1 style={{ color: 'white', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>✏️ Log Today's Reading</h1>
      </div>

      <div style={{ padding: '20px' }}>
        {todaySchedule && (
          <div style={{ background: '#FFFAF0', borderRadius: '16px', padding: '14px', marginBottom: '16px', border: '1px solid #FFD700' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B6B6B' }}>Today's scheduled target</p>
            {todaySchedule.items.map((item, i) => (
              <p key={i} style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#FF9933' }}>
                Chapter {item.chapter} · Verses {item.fromVerse}–{item.toVerse}
              </p>
            ))}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '14px', boxShadow: '0 4px 16px rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.15)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#2D2D2D' }}>📖 What did you read today?</h3>
          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6B6B6B' }}>Chapter</p>
          <input type="number" min="1" value={logChapter}
            onChange={e => setLogChapter(parseInt(e.target.value) || 1)}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #FFD700', fontSize: '16px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box', marginBottom: '12px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6B6B6B' }}>From Verse</p>
              <input type="number" min="1" value={logFromVerse}
                onChange={e => setLogFromVerse(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #FFD700', fontSize: '16px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box' }} />
            </div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6B6B6B' }}>To Verse</p>
              <input type="number" min="1" value={logToVerse}
                onChange={e => setLogToVerse(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #FFD700', fontSize: '16px', fontFamily: 'Georgia, serif', outline: 'none', color: '#2D2D2D', background: '#FFFAF5', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        <p style={{ color: '#6B6B6B', fontSize: '12px', textAlign: 'center', margin: '0 0 16px' }}>
          💡 If you read differently from the schedule, it will automatically recalculate your remaining plan!
        </p>

        <button onClick={logTodayReading} disabled={saving}
          style={{ width: '100%', padding: '16px', borderRadius: '999px', background: saving ? '#ccc' : 'linear-gradient(135deg, #FF9933, #FFD700)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
          {saving ? 'Saving...' : '🙏 Save Today\'s Reading'}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}