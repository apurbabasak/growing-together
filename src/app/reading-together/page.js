'use client';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

// Complete Vedabase book data with chapters and verses
const BOOKS = [
  {
    id: 'bg',
    title: 'Bhagavad-gītā As It Is',
    icon: '📘',
    description: 'The song of God spoken by Krishna to Arjuna',
    chapters: [
      { num: 1, title: 'Observing the Armies', verses: 46 },
      { num: 2, title: 'Contents of the Gita Summarized', verses: 72 },
      { num: 3, title: 'Karma-yoga', verses: 43 },
      { num: 4, title: 'Transcendental Knowledge', verses: 42 },
      { num: 5, title: 'Karma-yoga — Action in Krishna Consciousness', verses: 29 },
      { num: 6, title: 'Dhyana-yoga', verses: 47 },
      { num: 7, title: 'Knowledge of the Absolute', verses: 30 },
      { num: 8, title: 'Attaining the Supreme', verses: 28 },
      { num: 9, title: 'The Most Confidential Knowledge', verses: 34 },
      { num: 10, title: 'The Opulence of the Absolute', verses: 42 },
      { num: 11, title: 'The Universal Form', verses: 55 },
      { num: 12, title: 'Devotional Service', verses: 20 },
      { num: 13, title: 'Nature, the Enjoyer, and Consciousness', verses: 35 },
      { num: 14, title: 'The Three Modes of Material Nature', verses: 27 },
      { num: 15, title: 'The Yoga of the Supreme Person', verses: 20 },
      { num: 16, title: 'The Divine and Demoniac Natures', verses: 24 },
      { num: 17, title: 'The Divisions of Faith', verses: 28 },
      { num: 18, title: 'Conclusion — The Perfection of Renunciation', verses: 78 },
    ]
  },
  {
    id: 'sb',
    title: 'Śrīmad-Bhāgavatam',
    icon: '📙',
    description: 'The ripened fruit of the tree of Vedic knowledge',
    chapters: [
      { num: 1, title: 'Canto 1: Creation', verses: 220 },
      { num: 2, title: 'Canto 2: The Cosmic Manifestation', verses: 175 },
      { num: 3, title: 'Canto 3: The Status Quo', verses: 340 },
      { num: 4, title: 'Canto 4: The Creation of the Fourth Order', verses: 312 },
      { num: 5, title: 'Canto 5: The Creative Impetus', verses: 198 },
      { num: 6, title: 'Canto 6: Prescribed Duties for Mankind', verses: 243 },
      { num: 7, title: 'Canto 7: The Science of God', verses: 210 },
      { num: 8, title: 'Canto 8: Withdrawal of the Cosmic Creations', verses: 248 },
      { num: 9, title: 'Canto 9: Liberation', verses: 312 },
      { num: 10, title: 'Canto 10: The Summum Bonum', verses: 1400 },
      { num: 11, title: 'Canto 11: General History', verses: 348 },
      { num: 12, title: 'Canto 12: The Age of Deterioration', verses: 210 },
    ]
  },
  {
    id: 'cc',
    title: 'Śrī Caitanya-caritāmṛta',
    icon: '📗',
    description: 'The life and teachings of Sri Caitanya Mahaprabhu',
    chapters: [
      { num: 1, title: 'Adi-lila Chapter 1', verses: 110 },
      { num: 2, title: 'Adi-lila Chapter 2', verses: 117 },
      { num: 3, title: 'Adi-lila Chapter 3', verses: 113 },
      { num: 4, title: 'Adi-lila Chapter 4', verses: 231 },
      { num: 5, title: 'Adi-lila Chapter 5', verses: 232 },
      { num: 6, title: 'Adi-lila Chapter 6', verses: 115 },
      { num: 7, title: 'Adi-lila Chapter 7', verses: 172 },
      { num: 8, title: 'Adi-lila Chapter 8', verses: 79 },
      { num: 9, title: 'Adi-lila Chapter 9', verses: 55 },
      { num: 10, title: 'Adi-lila Chapter 10', verses: 167 },
      { num: 11, title: 'Adi-lila Chapter 11', verses: 61 },
      { num: 12, title: 'Adi-lila Chapter 12', verses: 73 },
      { num: 13, title: 'Adi-lila Chapter 13', verses: 123 },
      { num: 14, title: 'Adi-lila Chapter 14', verses: 76 },
      { num: 15, title: 'Adi-lila Chapter 15', verses: 31 },
      { num: 16, title: 'Adi-lila Chapter 16', verses: 108 },
      { num: 17, title: 'Adi-lila Chapter 17', verses: 338 },
      { num: 18, title: 'Madhya-lila Chapter 1', verses: 287 },
      { num: 19, title: 'Madhya-lila Chapter 2', verses: 93 },
      { num: 20, title: 'Madhya-lila Chapter 3', verses: 215 },
    ]
  },
  {
    id: 'noi',
    title: 'Nectar of Instruction',
    icon: '📒',
    description: 'Essential instructions for spiritual practice',
    chapters: [
      { num: 1, title: 'Text 1', verses: 1 },
      { num: 2, title: 'Text 2', verses: 1 },
      { num: 3, title: 'Text 3', verses: 1 },
      { num: 4, title: 'Text 4', verses: 1 },
      { num: 5, title: 'Text 5', verses: 1 },
      { num: 6, title: 'Text 6', verses: 1 },
      { num: 7, title: 'Text 7', verses: 1 },
      { num: 8, title: 'Text 8', verses: 1 },
      { num: 9, title: 'Text 9', verses: 1 },
      { num: 10, title: 'Text 10', verses: 1 },
      { num: 11, title: 'Text 11', verses: 1 },
    ]
  },
  {
    id: 'nod',
    title: 'The Nectar of Devotion',
    icon: '📕',
    description: 'A summary study of Bhakti-rasamrita-sindhu',
    chapters: Array.from({ length: 44 }, (_, i) => ({
      num: i + 1, title: `Chapter ${i + 1}`, verses: 15
    }))
  },
  {
    id: 'iso',
    title: 'Śrī Īśopaniṣad',
    icon: '📔',
    description: 'Knowledge that brings one closer to the Supreme',
    chapters: Array.from({ length: 18 }, (_, i) => ({
      num: i + 1, title: `Mantra ${i + 1}`, verses: 1
    }))
  },
  {
    id: 'ssr',
    title: 'The Science of Self-Realization',
    icon: '📖',
    description: 'Conversations and writings of Srila Prabhupada',
    chapters: Array.from({ length: 8 }, (_, i) => ({
      num: i + 1, title: `Chapter ${i + 1}`, verses: 20
    }))
  },
  {
    id: 'tlc',
    title: 'Teachings of Lord Caitanya',
    icon: '📃',
    description: 'A summary study of Caitanya-caritamrita',
    chapters: Array.from({ length: 34 }, (_, i) => ({
      num: i + 1, title: `Chapter ${i + 1}`, verses: 20
    }))
  },
  {
    id: 'bs',
    title: 'Śrī Brahma-saṁhitā',
    icon: '📜',
    description: 'Prayers of Lord Brahma',
    chapters: [
      { num: 1, title: 'Chapter 5', verses: 62 },
    ]
  },
  {
    id: 'krishna',
    title: 'Kṛṣṇa, The Supreme Personality of Godhead',
    icon: '📓',
    description: 'A summary study of the Tenth Canto of Srimad-Bhagavatam',
    chapters: Array.from({ length: 90 }, (_, i) => ({
      num: i + 1, title: `Chapter ${i + 1}`, verses: 20
    }))
  },
];

function getVerseCount(book, chapterNum) {
  const ch = book.chapters.find(c => c.num === chapterNum);
  return ch ? ch.verses : 20;
}

function generateSchedule(book, startCh, startV, targetCh, targetV, targetDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(0, 0, 0, 0);
  const totalDays = Math.max(1, Math.ceil((end - today) / (1000 * 60 * 60 * 24)) + 1);

  // Calculate total verses
  let totalVerses = 0;
  for (let ch = startCh; ch <= targetCh; ch++) {
    const maxV = getVerseCount(book, ch);
    const fromV = ch === startCh ? startV : 1;
    const toV = ch === targetCh ? Math.min(targetV, maxV) : maxV;
    if (toV >= fromV) totalVerses += toV - fromV + 1;
  }

  const versesPerDay = Math.max(1, Math.ceil(totalVerses / totalDays));
  const schedule = [];
  let curCh = startCh;
  let curV = startV;

  for (let day = 0; day < totalDays; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    let remaining = versesPerDay;
    const items = [];

    while (remaining > 0) {
      if (curCh > targetCh) break;
      if (curCh === targetCh && curV > targetV) break;
      const maxV = getVerseCount(book, curCh);
      const limitV = curCh === targetCh ? Math.min(targetV, maxV) : maxV;
      const endV = Math.min(curV + remaining - 1, limitV);
      items.push({ chapter: curCh, fromVerse: curV, toVerse: endV });
      remaining -= (endV - curV + 1);
      if (endV >= limitV) {
        curCh++;
        curV = 1;
      } else {
        curV = endV + 1;
      }
    }

    if (items.length > 0) {
      schedule.push({ date: dateStr, items, done: false });
    }
    if (curCh > targetCh || (curCh === targetCh && curV > targetV)) break;
  }

  return schedule;
}

export default function ReadingTogether() {
  const [userId, setUserId] = useState('');
  const [sanghaCode, setSanghaCode] = useState('');
  const [members, setMembers] = useState({});
  const [myPlan, setMyPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  // Views: home | selectBook | setupPlan | schedule | logReading | editPlan
  const [view, setView] = useState('home');
  const [selectedBook, setSelectedBook] = useState(null);

  // Setup form
  const [startCh, setStartCh] = useState(1);
  const [startV, setStartV] = useState(1);
  const [targetCh, setTargetCh] = useState(1);
  const [targetV, setTargetV] = useState(1);
  const [targetDate, setTargetDate] = useState('');

  // Log reading form
  const [logCh, setLogCh] = useState(1);
  const [logFromV, setLogFromV] = useState(1);
  const [logToV, setLogToV] = useState(1);

  const todayStr = new Date().toISOString().split('T')[0];

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
          setMembers(data.members || {});
          const plan = data.members?.[uid]?.reading_plan || null;
          setMyPlan(plan);
          if (plan) {
            const book = BOOKS.find(b => b.id === plan.bookId);
            setSelectedBook(book || null);
          }
        }
      });
      return () => unsub();
    }
  }, []);

  const savePlan = async () => {
    if (!targetDate || !selectedBook) return;
    setSaving(true);
    const schedule = generateSchedule(selectedBook, startCh, startV, targetCh, targetV, targetDate);
    const newPlan = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      bookIcon: selectedBook.icon,
      startCh, startV, targetCh, targetV, targetDate,
      createdAt: new Date().toISOString(),
      schedule,
    };
    const ref = doc(db, 'sanghas', sanghaCode);
    const snap = await getDoc(ref);
    const existing = snap.data();
    await setDoc(ref, {
      ...existing,
      members: {
        ...existing.members,
        [userId]: { ...existing.members[userId], reading_plan: newPlan }
      }
    });
    setSaving(false);
    setView('schedule');
  };

  const logReading = async () => {
    setSaving(true);
    const ref = doc(db, 'sanghas', sanghaCode);
    const snap = await getDoc(ref);
    const existing = snap.data();
    const plan = existing.members?.[userId]?.reading_plan;
    if (!plan) { setSaving(false); return; }

    let newSchedule = (plan.schedule || []).map(s => {
      if (s.date === todayStr) {
        return { ...s, done: true, logged: { chapter: logCh, fromVerse: logFromV, toVerse: logToV } };
      }
      return s;
    });

    // Check if today was in schedule
    const todayInSchedule = plan.schedule?.find(s => s.date === todayStr);
    if (!todayInSchedule) {
      newSchedule.push({ date: todayStr, done: true, items: [], logged: { chapter: logCh, fromVerse: logFromV, toVerse: logToV } });
    }

    // Recalculate from tomorrow with new position
    const book = BOOKS.find(b => b.id === plan.bookId);
    let nextCh = logCh;
    let nextV = logToV + 1;
    if (book && nextV > getVerseCount(book, nextCh)) {
      nextCh++;
      nextV = 1;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const pastSchedule = newSchedule.filter(s => s.date <= todayStr);

    let futureSchedule = [];
    if (nextCh <= plan.targetCh && book) {
      futureSchedule = generateSchedule(book, nextCh, nextV, plan.targetCh, plan.targetV, plan.targetDate)
        .filter(s => s.date >= tomorrowStr);
    }

    const finalSchedule = [...pastSchedule, ...futureSchedule];

    await setDoc(ref, {
      ...existing,
      members: {
        ...existing.members,
        [userId]: {
          ...existing.members[userId],
          reading_plan: { ...plan, schedule: finalSchedule }
        }
      }
    });
    setSaving(false);
    setView('home');
  };

  const deletePlan = async () => {
    if (!confirm('Are you sure you want to delete your reading plan?')) return;
    setSaving(true);
    const ref = doc(db, 'sanghas', sanghaCode);
    const snap = await getDoc(ref);
    const existing = snap.data();
    const memberData = { ...existing.members[userId] };
    delete memberData.reading_plan;
    await setDoc(ref, {
      ...existing,
      members: { ...existing.members, [userId]: memberData }
    });
    setMyPlan(null);
    setSelectedBook(null);
    setSaving(false);
    setView('home');
  };

  const todaySchedule = myPlan?.schedule?.find(s => s.date === todayStr);
  const completedDays = myPlan?.schedule?.filter(s => s.done).length || 0;
  const totalDays = myPlan?.schedule?.length || 0;
  const progressPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const cardStyle = {
    background: 'white', borderRadius: '20px', padding: '18px',
    marginBottom: '12px', boxShadow: '0 4px 20px rgba(255,153,51,0.1)',
    border: '1px solid rgba(255,153,51,0.15)'
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '12px',
    border: '1.5px solid #FFD700', fontSize: '15px',
    fontFamily: 'Georgia, serif', outline: 'none',
    color: '#2D2D2D', background: '#FFFAF5',
    boxSizing: 'border-box', marginBottom: '12px'
  };

  const btnPrimary = {
    width: '100%', padding: '15px', borderRadius: '999px',
    background: 'linear-gradient(135deg, #FF9933, #FFD700)',
    border: 'none', color: 'white', fontSize: '16px',
    cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold',
    marginBottom: '10px'
  };

  const btnSecondary = {
    width: '100%', padding: '13px', borderRadius: '999px',
    background: 'white', border: '2px solid #FF9933',
    color: '#FF9933', fontSize: '15px',
    cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold',
    marginBottom: '10px'
  };

  const header = (title, subtitle, onBack) => (
    <div style={{
      background: 'linear-gradient(135deg, #FF9933, #FFD700)',
      padding: '20px', borderRadius: '0 0 24px 24px',
      display: 'flex', alignItems: 'center', gap: '12px',
      marginBottom: '20px'
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.25)', border: 'none',
          borderRadius: '50%', width: '40px', height: '40px',
          color: 'white', fontSize: '20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>←</button>
      )}
      <div>
        <h1 style={{ color: 'white', fontSize: '20px', margin: '0 0 2px', fontWeight: 'bold' }}>{title}</h1>
        {subtitle && <p style={{ color: 'white', fontSize: '12px', margin: 0, opacity: 0.9 }}>{subtitle}</p>}
      </div>
    </div>
  );

  // ── HOME ──
  if (view === 'home') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      {header('📚 Reading Together', 'Study Srila Prabhupada\'s books as a Sangha')}

      <div style={{ padding: '0 20px' }}>
        {!myPlan ? (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📖</div>
            <h2 style={{ color: '#2D2D2D', fontSize: '20px', margin: '0 0 10px' }}>No Reading Plan Yet</h2>
            <p style={{ color: '#6B6B6B', fontSize: '14px', margin: '0 0 30px', lineHeight: 1.6 }}>
              Select a book, set your starting point and target, and get a personalised daily reading schedule!
            </p>
            <button onClick={() => setView('selectBook')} style={btnPrimary}>
              📚 Start a Reading Plan
            </button>
          </div>
        ) : (
          <>
            {/* My Plan Card */}
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #FFFAF0, #FFF5E0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px' }}>{selectedBook?.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6B6B6B' }}>Currently Reading</p>
                  <h2 style={{ margin: 0, fontSize: '16px', color: '#2D2D2D', fontWeight: 'bold' }}>{myPlan.bookTitle}</h2>
                </div>
                <button onClick={() => setView('editPlan')} style={{
                  background: '#FFF0E0', border: '1px solid #FFD700', borderRadius: '999px',
                  color: '#FF9933', padding: '6px 12px', fontSize: '12px',
                  cursor: 'pointer', fontFamily: 'Georgia, serif'
                }}>✏️ Edit</button>
              </div>

              {/* Progress bar */}
              <div style={{ background: '#FFE0B0', borderRadius: '999px', height: '10px', marginBottom: '6px' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #FF9933, #FFD700)',
                  borderRadius: '999px', height: '100%',
                  width: `${progressPct}%`, transition: 'width 0.5s'
                }} />
              </div>
              <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#6B6B6B' }}>
                {completedDays} of {totalDays} days done · {progressPct}% complete
              </p>

              {/* Target info */}
              <div style={{ background: 'rgba(255,153,51,0.1)', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B6B6B' }}>Your Target</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#2D2D2D' }}>
                  From Ch.{myPlan.startCh} v.{myPlan.startV} → Ch.{myPlan.targetCh} v.{myPlan.targetV}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#FF9933' }}>
                  📅 Target date: {new Date(myPlan.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Today's target */}
              {todaySchedule && !todaySchedule.done && (
                <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', border: '1px solid #86efac' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 'bold', color: '#22c55e' }}>📅 Today's Reading Target</p>
                  {todaySchedule.items.map((item, i) => (
                    <p key={i} style={{ margin: '0 0 2px', fontSize: '13px', color: '#2D2D2D' }}>
                      Chapter {item.chapter} · Verses {item.fromVerse}–{item.toVerse}
                    </p>
                  ))}
                </div>
              )}
              {todaySchedule?.done && (
                <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', border: '1px solid #86efac' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#22c55e', fontWeight: 'bold' }}>✅ Today's reading is logged!</p>
                  {todaySchedule.logged && (
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B6B6B' }}>
                      You read Ch.{todaySchedule.logged.chapter} v.{todaySchedule.logged.fromVerse}–{todaySchedule.logged.toVerse}
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setView('schedule')} style={{
                  flex: 1, padding: '12px', borderRadius: '999px',
                  background: '#FFF0E0', border: 'none', color: '#FF9933',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold'
                }}>📅 Full Schedule</button>
                <button onClick={() => {
                  const t = todaySchedule?.items?.[0];
                  setLogCh(t?.chapter || myPlan.startCh);
                  setLogFromV(t?.fromVerse || 1);
                  setLogToV(t?.toVerse || 1);
                  setView('logReading');
                }} style={{
                  flex: 1, padding: '12px', borderRadius: '999px',
                  background: 'linear-gradient(135deg, #FF9933, #FFD700)',
                  border: 'none', color: 'white',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold'
                }}>✏️ Log Reading</button>
              </div>
            </div>

            {/* Sangha Members Reading Progress */}
            <h2 style={{ color: '#2D2D2D', fontSize: '16px', margin: '20px 0 12px' }}>🌸 Sangha Reading Progress</h2>
            {Object.entries(members).map(([uid, m]) => {
              const mPlan = m.reading_plan;
              if (!mPlan) return null;
              const mDone = (mPlan.schedule || []).filter(s => s.done).length;
              const mTotal = (mPlan.schedule || []).length;
              const mPct = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
              const mBook = BOOKS.find(b => b.id === mPlan.bookId);
              const mToday = mPlan.schedule?.find(s => s.date === todayStr);
              return (
                <div key={uid} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF9933, #FFD700)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 'bold', fontSize: '16px', flexShrink: 0
                    }}>{m.name.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#2D2D2D', fontWeight: 'bold' }}>
                        {m.name} {uid === userId ? '(You)' : ''}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6B6B6B' }}>
                        {mBook?.icon} {mPlan.bookTitle}
                      </p>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#FF9933' }}>{mPct}%</span>
                  </div>
                  <div style={{ background: '#FFF0E0', borderRadius: '999px', height: '6px', marginBottom: '6px' }}>
                    <div style={{ background: 'linear-gradient(90deg, #FF9933, #FFD700)', borderRadius: '999px', height: '100%', width: `${mPct}%` }} />
                  </div>
                  {mToday?.done && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#22c55e' }}>✅ Read today</p>
                  )}
                </div>
              );
            })}

            <button onClick={() => setView('selectBook')} style={{ ...btnSecondary, marginTop: '8px' }}>
              🔄 Change Book / New Plan
            </button>
            <button onClick={deletePlan} style={{
              ...btnSecondary, borderColor: '#ef4444', color: '#ef4444', marginTop: '4px'
            }}>
              🗑️ Delete Plan
            </button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );

  // ── SELECT BOOK ──
  if (view === 'selectBook') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      {header('Select a Book', 'Choose which book to read together', () => setView('home'))}
      <div style={{ padding: '0 20px' }}>
        <p style={{ color: '#6B6B6B', fontSize: '14px', margin: '0 0 16px' }}>
          All books from Vedabase.io by Srila Prabhupada:
        </p>
        {BOOKS.map(book => (
          <button key={book.id}
            onClick={() => {
              setSelectedBook(book);
              setStartCh(1); setStartV(1);
              setTargetCh(book.chapters.length); setTargetV(book.chapters[book.chapters.length - 1].verses);
              setView('setupPlan');
            }}
            style={{
              width: '100%', background: 'white', borderRadius: '18px',
              padding: '16px', marginBottom: '10px',
              border: '1px solid rgba(255,153,51,0.2)',
              display: 'flex', alignItems: 'center', gap: '14px',
              cursor: 'pointer', fontFamily: 'Georgia, serif',
              boxShadow: '0 2px 12px rgba(255,153,51,0.07)', textAlign: 'left'
            }}>
            <span style={{ fontSize: '30px', flexShrink: 0 }}>{book.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: '15px', color: '#2D2D2D', fontWeight: 'bold' }}>{book.title}</p>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#6B6B6B' }}>{book.description}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#FF9933' }}>{book.chapters.length} chapters</p>
            </div>
            <span style={{ color: '#FF9933', fontSize: '20px', flexShrink: 0 }}>›</span>
          </button>
        ))}
      </div>
      <BottomNav />
    </div>
  );

  // ── SETUP PLAN ──
  if (view === 'setupPlan') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      {header(
        `${selectedBook?.icon} ${selectedBook?.title}`,
        'Set your reading plan',
        () => setView('selectBook')
      )}
      <div style={{ padding: '0 20px' }}>

        {/* Where are you now */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#FF9933' }}>📍 Where are you now?</h3>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#6B6B6B' }}>Select your current position in the book</p>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>Current Chapter</p>
          <select value={startCh} onChange={e => { setStartCh(parseInt(e.target.value)); setStartV(1); }}
            style={{ ...inputStyle }}>
            {selectedBook?.chapters.map(ch => (
              <option key={ch.num} value={ch.num}>Ch.{ch.num} — {ch.title}</option>
            ))}
          </select>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>Current Verse / Śloka</p>
          <select value={startV} onChange={e => setStartV(parseInt(e.target.value))}
            style={{ ...inputStyle }}>
            {Array.from({ length: getVerseCount(selectedBook, startCh) }, (_, i) => i + 1).map(v => (
              <option key={v} value={v}>Verse {v}</option>
            ))}
          </select>
        </div>

        {/* Target */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#FF9933' }}>🎯 What is your target?</h3>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#6B6B6B' }}>Where do you want to reach?</p>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>Target Chapter</p>
          <select value={targetCh} onChange={e => { setTargetCh(parseInt(e.target.value)); setTargetV(1); }}
            style={{ ...inputStyle }}>
            {selectedBook?.chapters.filter(ch => ch.num >= startCh).map(ch => (
              <option key={ch.num} value={ch.num}>Ch.{ch.num} — {ch.title}</option>
            ))}
          </select>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>Target Verse / Śloka</p>
          <select value={targetV} onChange={e => setTargetV(parseInt(e.target.value))}
            style={{ ...inputStyle }}>
            {Array.from({ length: getVerseCount(selectedBook, targetCh) }, (_, i) => i + 1).map(v => (
              <option key={v} value={v}>Verse {v}</option>
            ))}
          </select>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>Target Completion Date</p>
          <input type="date" value={targetDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setTargetDate(e.target.value)}
            style={{ ...inputStyle }} />
        </div>

        {targetDate && (
          <div style={{ background: 'rgba(255,153,51,0.1)', borderRadius: '14px', padding: '14px', marginBottom: '16px', border: '1px solid rgba(255,153,51,0.3)' }}>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#FF9933', fontWeight: 'bold' }}>📊 Your Plan Preview</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#2D2D2D' }}>
              From Ch.{startCh} v.{startV} → Ch.{targetCh} v.{targetV}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B6B6B' }}>
              Completing by {new Date(targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}

        <button onClick={savePlan} disabled={saving || !targetDate}
          style={{ ...btnPrimary, background: saving || !targetDate ? '#ccc' : 'linear-gradient(135deg, #FF9933, #FFD700)' }}>
          {saving ? '⏳ Creating Schedule...' : '✨ Generate My Daily Schedule'}
        </button>
      </div>
      <BottomNav />
    </div>
  );

  // ── EDIT PLAN ──
  if (view === 'editPlan') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      {header('✏️ Edit Reading Plan', 'Update your target or book', () => setView('home'))}
      <div style={{ padding: '0 20px' }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#FF9933' }}>Update Target Chapter & Verse</h3>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>New Target Chapter</p>
          <select value={targetCh} onChange={e => { setTargetCh(parseInt(e.target.value)); setTargetV(1); }}
            style={{ ...inputStyle }}>
            {selectedBook?.chapters.map(ch => (
              <option key={ch.num} value={ch.num}>Ch.{ch.num} — {ch.title}</option>
            ))}
          </select>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>New Target Verse</p>
          <select value={targetV} onChange={e => setTargetV(parseInt(e.target.value))}
            style={{ ...inputStyle }}>
            {Array.from({ length: getVerseCount(selectedBook, targetCh) }, (_, i) => i + 1).map(v => (
              <option key={v} value={v}>Verse {v}</option>
            ))}
          </select>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>New Target Date</p>
          <input type="date" value={targetDate || myPlan?.targetDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setTargetDate(e.target.value)}
            style={{ ...inputStyle }} />
        </div>

        <button onClick={savePlan} disabled={saving}
          style={{ ...btnPrimary, background: saving ? '#ccc' : 'linear-gradient(135deg, #FF9933, #FFD700)' }}>
          {saving ? '⏳ Saving...' : '✅ Update Plan'}
        </button>
        <button onClick={() => setView('selectBook')} style={btnSecondary}>
          📚 Change Book Instead
        </button>
        <button onClick={deletePlan} style={{ ...btnSecondary, borderColor: '#ef4444', color: '#ef4444' }}>
          🗑️ Delete Plan
        </button>
      </div>
      <BottomNav />
    </div>
  );

  // ── FULL SCHEDULE ──
  if (view === 'schedule') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      {header('📅 Daily Schedule', `${selectedBook?.icon} ${myPlan?.bookTitle}`, () => setView('home'))}
      <div style={{ padding: '0 20px' }}>

        {/* Progress summary */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #FFFAF0, #FFF5E0)' }}>
          <div style={{ background: '#FFE0B0', borderRadius: '999px', height: '10px', marginBottom: '8px' }}>
            <div style={{ background: 'linear-gradient(90deg, #FF9933, #FFD700)', borderRadius: '999px', height: '100%', width: `${progressPct}%` }} />
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B6B6B' }}>
            {completedDays}/{totalDays} days completed · {progressPct}% · Target: {myPlan?.targetDate}
          </p>
        </div>

        {myPlan?.schedule?.map((day, i) => {
          const isToday = day.date === todayStr;
          const isPast = day.date < todayStr;
          return (
            <div key={i} style={{
              background: day.done ? '#f0fdf4' : isToday ? '#FFFAF0' : 'white',
              borderRadius: '16px', padding: '14px 16px', marginBottom: '8px',
              border: day.done ? '1px solid #86efac' : isToday ? '2px solid #FFD700' : '1px solid rgba(255,153,51,0.12)',
              opacity: isPast && !day.done ? 0.6 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 'bold', color: isToday ? '#FF9933' : '#2D2D2D' }}>
                    {isToday ? '📅 Today' : new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  {day.items.map((item, j) => (
                    <p key={j} style={{ margin: '0 0 2px', fontSize: '13px', color: '#6B6B6B' }}>
                      Ch.{item.chapter} · Verses {item.fromVerse}–{item.toVerse}
                    </p>
                  ))}
                  {day.done && day.logged && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#22c55e' }}>
                      ✅ Read: Ch.{day.logged.chapter} v.{day.logged.fromVerse}–{day.logged.toVerse}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: '22px', marginLeft: '10px' }}>
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

  // ── LOG READING ──
  if (view === 'logReading') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      {header('✏️ Log Today\'s Reading', selectedBook?.title, () => setView('home'))}
      <div style={{ padding: '0 20px' }}>

        {todaySchedule && !todaySchedule.done && (
          <div style={{ background: '#FFFAF0', borderRadius: '16px', padding: '14px', marginBottom: '16px', border: '1px solid #FFD700' }}>
            <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#6B6B6B' }}>📅 Today's scheduled target:</p>
            {todaySchedule.items.map((item, i) => (
              <p key={i} style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#FF9933' }}>
                Chapter {item.chapter} · Verses {item.fromVerse}–{item.toVerse}
              </p>
            ))}
          </div>
        )}

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#2D2D2D' }}>📖 What did you read today?</h3>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>Chapter you read</p>
          <select value={logCh} onChange={e => { setLogCh(parseInt(e.target.value)); setLogFromV(1); setLogToV(1); }}
            style={{ ...inputStyle }}>
            {selectedBook?.chapters.map(ch => (
              <option key={ch.num} value={ch.num}>Ch.{ch.num} — {ch.title}</option>
            ))}
          </select>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>From Verse</p>
          <select value={logFromV} onChange={e => setLogFromV(parseInt(e.target.value))}
            style={{ ...inputStyle }}>
            {Array.from({ length: getVerseCount(selectedBook, logCh) }, (_, i) => i + 1).map(v => (
              <option key={v} value={v}>Verse {v}</option>
            ))}
          </select>

          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2D2D2D', fontWeight: 'bold' }}>To Verse</p>
          <select value={logToV} onChange={e => setLogToV(parseInt(e.target.value))}
            style={{ ...inputStyle }}>
            {Array.from({ length: getVerseCount(selectedBook, logCh) }, (_, i) => i + 1)
              .filter(v => v >= logFromV).map(v => (
                <option key={v} value={v}>Verse {v}</option>
              ))}
          </select>
        </div>

        <div style={{ background: 'rgba(255,153,51,0.08)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6B6B6B', lineHeight: 1.6 }}>
            💡 If you read differently from your schedule, the app will <strong>automatically recalculate</strong> your remaining daily targets!
          </p>
        </div>

        <button onClick={logReading} disabled={saving} style={{
          ...btnPrimary,
          background: saving ? '#ccc' : 'linear-gradient(135deg, #FF9933, #FFD700)'
        }}>
          {saving ? '⏳ Saving...' : '🙏 Save Today\'s Reading'}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}