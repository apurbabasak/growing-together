'use client';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// ALL BOOKS FROM VEDABASE.IO – verified URL codes & structure
// URL patterns:
//   SB  → /sb/{canto}/{chapter}/{verse}/    (3 levels)
//   CC  → /cc/{part}/{chapter}/{verse}/     (3 levels)
//   BG  → /bg/{chapter}/{verse}/            (2 levels)
//   BS  → /bs/5/{verse}/                    (fixed chapter 5, then verse)
//   NOI → /noi/{text}/                      (1 level – text IS the item)
//   ISO → /iso/{mantra}/                    (1 level – mantra IS the item)
//   NOD → /nod/{chapter}/                   (1 level – chapter IS the item)
//   KB  → /kb/{chapter}/                    (1 level)
//   TLC → /tlc/{chapter}/                   (1 level)
//   SSR → /ssr/{chapter}/                   (1 level)
//   RV  → /rv/{chapter}/                    (1 level)
//   TQK → /tqk/{chapter}/                   (1 level)
//   LOB → /lob/{verse}/                     (1 level)
//   BBD → /bbd/{chapter}/                   (1 level)
//   OWK → /owk/{chapter}/                   (1 level)
//   POY → /poy/{chapter}/                   (1 level)
//   PQPA→ /pqpa/{chapter}/                  (1 level)
//   KRP → /krp/                             (single essay – no sub-pages)
//   LON → /lon/                             (root only – not fully imported)
//   EJOP→ /ejop/                            (root only – not fully imported)
//   MOG → /mog/                             (root only – not fully imported)
//   CT  → /ct/                              (root only – not fully imported)
//   MMS → /mms/                             (root only – not fully imported)
//   NBS → /nbs/                             (root only – not fully imported)
//   CB  → /cb/                              (root only – not fully imported)
//   SPL → /spl/                             (root only – not fully imported)
// ─────────────────────────────────────────────────────────────────────────────

// SB chapter verse counts per canto
const SB_CHAPTER_VERSES = {
  1:  [23,34,45,33,40,37,58,52,49,45,39,35,60,45,51,36,45,50,40],
  2:  [37,37,25,25,42,46,53,28,45,51],
  3:  [45,34,30,35,50,40,40,53,45,42,41,56,49,50,49,37,31,28,38,53,56,39,57,47,44,72,30,44,45,34,48,43,37],
  4:  [45,35,27,34,26,54,61,82,66,30,35,52,49,46,26,27,36,32,42,38,52,63,39,79,62,26,30,65,85,51,31],
  5:  [40,23,20,20,35,18,14,31,20,25,17,16,26,46,15,29,24,39,31,46,19,17,9,29,15,40],
  6:  [58,49,35,54,44,50,40,42,55,32,27,35,23,62,28,57,41,80,27],
  7:  [50,60,38,46,57,30,58,56,55,69,35,31,49,43,81],
  8:  [45,33,34,26,48,39,44,45,29,57,48,47,34,21,36,65,28,32,45,34,34,37,32,58],
  9:  [42,34,36,57,27,55,26,30,47,57,36,16,27,48,41,36,17,52,29,39,36,57,38,68],
  10: [69,42,53,46,32,44,37,52,23,43,59,44,64,76,84,65,26,78,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],
  11: [24,55,55,23,52,30,74,44,32,37,23,24,40,46,36,44,58,48,45,37,43,58,60,29,36,32,55,44,49,49,28],
  12: [40,44,45,45,14,79,23,55,35,42,49,69,23],
};

// CC chapter verse counts
const CC_CHAPTER_VERSES = {
  adi:    [110,117,113,231,232,115,172,79,55,167,61,73,123,76,31,108,338],
  madhya: [287,93,215,197,159,277,162,312,361,185,239,211,213,255,298,287,228,224,260,421,143,167,134,351,290],
  antya:  [212,171,274,231,160,336,168,100,149,158,108,153,136,121,100,148,69,115,113,155],
};

const BOOKS = [
  // ── MAJOR SCRIPTURES ────────────────────────────────────────────────────────
  {
    id: 'bg',
    title: 'Bhagavad-gītā As It Is',
    shortTitle: 'BG',
    emoji: '📖',
    category: 'Major Scriptures',
    urlType: 'chapter-verse',
    chapters: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      title: [
        'Observing the Armies',
        'Contents of the Gītā Summarized',
        'Karma-yoga',
        'Transcendental Knowledge',
        'Karma-yoga—Action in Kṛṣṇa Consciousness',
        'Sāṅkhya-yoga',
        'Knowledge of the Absolute',
        'Attaining the Supreme',
        'The Most Confidential Knowledge',
        'The Opulence of the Absolute',
        'The Universal Form',
        'Devotional Service',
        'Nature, the Enjoyer, and Consciousness',
        'The Three Modes of Material Nature',
        'The Yoga of the Supreme Person',
        'The Divine and Demoniac Natures',
        'The Divisions of Faith',
        'Conclusion—The Perfection of Renunciation',
      ][i],
      verses: [47,72,43,42,29,47,30,28,34,42,55,20,35,27,20,24,28,78][i],
    })),
  },

  {
    id: 'sb',
    title: 'Śrīmad-Bhāgavatam',
    shortTitle: 'SB',
    emoji: '📚',
    category: 'Major Scriptures',
    urlType: 'canto-chapter-verse',
    cantos: [
      { number: 1, title: 'Creation', chapters: 19 },
      { number: 2, title: 'The Cosmic Manifestation', chapters: 10 },
      { number: 3, title: 'The Status Quo', chapters: 33 },
      { number: 4, title: 'The Creation of the Fourth Order', chapters: 31 },
      { number: 5, title: 'The Creative Impetus', chapters: 26 },
      { number: 6, title: 'Prescribed Duties for Mankind', chapters: 19 },
      { number: 7, title: 'The Science of God', chapters: 15 },
      { number: 8, title: 'Withdrawal of the Cosmic Creations', chapters: 24 },
      { number: 9, title: 'Liberation', chapters: 24 },
      { number: 10, title: 'The Summum Bonum', chapters: 90 },
      { number: 11, title: 'General History', chapters: 31 },
      { number: 12, title: 'The Age of Deterioration', chapters: 13 },
    ],
  },

  {
    id: 'cc',
    title: 'Śrī Caitanya-caritāmṛta',
    shortTitle: 'CC',
    emoji: '🌸',
    category: 'Major Scriptures',
    urlType: 'part-chapter-verse',
    parts: [
      { slug: 'adi', title: 'Ādi-līlā', chapters: 17 },
      { slug: 'madhya', title: 'Madhya-līlā', chapters: 25 },
      { slug: 'antya', title: 'Antya-līlā', chapters: 20 },
    ],
  },

  {
    id: 'bs',
    title: 'Brahma-saṁhitā',
    shortTitle: 'BS',
    emoji: '📱',
    category: 'Major Scriptures',
    urlType: 'bs-verse',
    verses: 62,
  },

  // ── NECTAR SERIES ────────────────────────────────────────────────────────────
  {
    id: 'noi',
    title: 'Nectar of Instruction',
    shortTitle: 'NOI',
    emoji: '💧',
    category: 'Nectar Series',
    urlType: 'single',
    items: Array.from({ length: 11 }, (_, i) => ({
      number: i + 1,
      title: i === 0 ? 'Introduction' : `Text ${i}`,
    })),
  },

  {
    id: 'nod',
    title: 'Nectar of Devotion',
    shortTitle: 'NOD',
    emoji: '🍯',
    category: 'Nectar Series',
    urlType: 'single',
    items: Array.from({ length: 46 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
    })),
  },

  // ── YOGA & PHILOSOPHY ────────────────────────────────────────────────────────
  {
    id: 'iso',
    title: 'Śrī Īśopaniṣad',
    shortTitle: 'ISO',
    emoji: '🕉️',
    category: 'Yoga & Philosophy',
    urlType: 'single',
    items: [
      { number: 'introduction', title: 'Introduction' },
      ...Array.from({ length: 18 }, (_, i) => ({
        number: i + 1,
        title: `Mantra ${i + 1}`,
      })),
    ],
  },

  {
    id: 'poy',
    title: 'The Perfection of Yoga',
    shortTitle: 'POY',
    emoji: '🧘',
    category: 'Yoga & Philosophy',
    urlType: 'single',
    items: Array.from({ length: 9 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
    })),
  },

  {
    id: 'owk',
    title: 'On the Way to Kṛṣṇa',
    shortTitle: 'OWK',
    emoji: '🛤️',
    category: 'Yoga & Philosophy',
    urlType: 'single',
    items: Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
    })),
  },

  {
    id: 'rv',
    title: 'Rāja-vidyā: The King of Knowledge',
    shortTitle: 'RV',
    emoji: '👑',
    category: 'Yoga & Philosophy',
    urlType: 'single',
    items: Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
    })),
  },

  {
    id: 'bbd',
    title: 'Beyond Birth and Death',
    shortTitle: 'BBD',
    emoji: '♾️',
    category: 'Yoga & Philosophy',
    urlType: 'single',
    items: Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
    })),
  },

  // ── KRISHNA CONSCIOUSNESS ─────────────────────────────────────────────────
  {
    id: 'kb',
    title: 'Kṛṣṇa, the Supreme Personality of Godhead',
    shortTitle: 'KB',
    emoji: '🦚',
    category: 'Krishna Consciousness',
    urlType: 'single',
    items: Array.from({ length: 90 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
    })),
  },

  {
    id: 'krp',
    title: 'Kṛṣṇa, the Reservoir of Pleasure',
    shortTitle: 'KRP',
    emoji: '🌊',
    category: 'Krishna Consciousness',
    urlType: 'root-only',
  },

  {
    id: 'tqk',
    title: 'Teachings of Queen Kuntī',
    shortTitle: 'TQK',
    emoji: '👸',
    category: 'Krishna Consciousness',
    urlType: 'single',
    items: Array.from({ length: 26 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
    })),
  },

  {
    id: 'tlc',
    title: 'Teachings of Lord Caitanya',
    shortTitle: 'TLC',
    emoji: '🌼',
    category: 'Krishna Consciousness',
    urlType: 'single',
    items: Array.from({ length: 34 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
    })),
  },

  {
    id: 'ssr',
    title: 'The Science of Self-Realization',
    shortTitle: 'SSR',
    emoji: '🔬',
    category: 'Krishna Consciousness',
    urlType: 'single',
    items: Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
    })),
  },

  {
    id: 'pqpa',
    title: 'Perfect Questions, Perfect Answers',
    shortTitle: 'PQPA',
    emoji: '❓',
    category: 'Krishna Consciousness',
    urlType: 'single',
    items: Array.from({ length: 9 }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
    })),
  },

  // ── LIGHT & NATURE ────────────────────────────────────────────────────────
  {
    id: 'lob',
    title: 'Light of the Bhāgavata',
    shortTitle: 'LOB',
    emoji: '🌅',
    category: 'Light & Nature',
    urlType: 'single',
    items: Array.from({ length: 48 }, (_, i) => ({
      number: i + 1,
      title: `Verse ${i + 1}`,
    })),
  },

  {
    id: 'lon',
    title: 'Laws of Nature',
    shortTitle: 'LON',
    emoji: '🌿',
    category: 'Light & Nature',
    urlType: 'root-only',
  },

  {
    id: 'ejop',
    title: 'Easy Journey to Other Planets',
    shortTitle: 'EJOP',
    emoji: '🚀',
    category: 'Light & Nature',
    urlType: 'root-only',
  },

  // ── DEVOTIONAL TEXTS ──────────────────────────────────────────────────────
  {
    id: 'mog',
    title: 'Message of Godhead',
    shortTitle: 'MOG',
    emoji: '📜',
    category: 'Devotional Texts',
    urlType: 'root-only',
  },

  {
    id: 'ct',
    title: 'Civilization and Transcendence',
    shortTitle: 'CT',
    emoji: '🏛️',
    category: 'Devotional Texts',
    urlType: 'root-only',
  },

  {
    id: 'mms',
    title: 'Mukunda-mālā-stotra',
    shortTitle: 'MMS',
    emoji: '🌺',
    category: 'Devotional Texts',
    urlType: 'root-only',
  },

  {
    id: 'nbs',
    title: 'Nārada-bhakti-sūtra',
    shortTitle: 'NBS',
    emoji: '🎵',
    category: 'Devotional Texts',
    urlType: 'root-only',
  },

  {
    id: 'cb',
    title: 'Coming Back',
    shortTitle: 'CB',
    emoji: '🔄',
    category: 'Devotional Texts',
    urlType: 'root-only',
  },

  // ── BIOGRAPHY ─────────────────────────────────────────────────────────────
  {
    id: 'spl',
    title: 'Śrīla Prabhupāda-līlāmṛta',
    shortTitle: 'SPL',
    emoji: '📿',
    category: 'Biography',
    urlType: 'root-only',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// URL GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function buildUrl(book, item, subItem, subSubItem) {
  const base = 'https://vedabase.io/en/library';
  switch (book.urlType) {
    case 'chapter-verse':
      if (subItem) return `${base}/${book.id}/${item}/${subItem}/`;
      return `${base}/${book.id}/${item}/`;
    case 'canto-chapter-verse':
      if (subSubItem) return `${base}/${book.id}/${item}/${subItem}/${subSubItem}/`;
      if (subItem) return `${base}/${book.id}/${item}/${subItem}/`;
      return `${base}/${book.id}/${item}/`;
    case 'part-chapter-verse':
      if (subSubItem) return `${base}/${book.id}/${item}/${subItem}/${subSubItem}/`;
      if (subItem) return `${base}/${book.id}/${item}/${subItem}/`;
      return `${base}/${book.id}/${item}/`;
    case 'bs-verse':
      return `${base}/${book.id}/5/${item}/`;
    case 'root-only':
      return `${base}/${book.id}/`;
    case 'single':
    default:
      return `${base}/${book.id}/${item}/`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BooksPage() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedCanto, setSelectedCanto] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(BOOKS.map((b) => b.category))];

  const filteredBooks = BOOKS.filter((book) => {
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.shortTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ── VERSE LIST (BG) ──────────────────────────────────────────────────────
  const renderVerseList = (book, chapter) => {
    const chData = book.chapters.find((c) => c.number === chapter);
    if (!chData) return null;
    return (
      <div style={styles.verseGrid}>
        {Array.from({ length: chData.verses }, (_, i) => {
          const verseNum = i + 1;
          const url = buildUrl(book, chapter, verseNum);
          return (
            <a key={verseNum} href={url} target="_blank" rel="noopener noreferrer" style={styles.verseBtn}>
              {verseNum}
            </a>
          );
        })}
      </div>
    );
  };

  // ── SB CHAPTER LIST with verses ─────────────────────────────────────────
  const renderSbChapters = (canto) => {
    const verseCountsForCanto = SB_CHAPTER_VERSES[canto.number] || [];
    return (
      <div style={styles.chapterList}>
        {Array.from({ length: canto.chapters }, (_, i) => {
          const chNum = i + 1;
          const verseCount = verseCountsForCanto[i] || 30;
          return (
            <div key={chNum}>
              <button
                style={{
                  ...styles.chapterBtn,
                  background: selectedChapter === chNum ? '#ff6b35' : undefined,
                  color: selectedChapter === chNum ? '#fff' : undefined,
                }}
                onClick={() => setSelectedChapter(selectedChapter === chNum ? null : chNum)}
              >
                Chapter {chNum}
                <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 8 }}>({verseCount} verses)</span>
              </button>
              {selectedChapter === chNum && (
                <div style={{ ...styles.verseGrid, marginLeft: 12, marginTop: 6, marginBottom: 8 }}>
                  {Array.from({ length: verseCount }, (_, v) => {
                    const verseNum = v + 1;
                    const url = buildUrl(selectedBook, canto.number, chNum, verseNum);
                    return (
                      <a key={verseNum} href={url} target="_blank" rel="noopener noreferrer" style={styles.verseBtn}>
                        {verseNum}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── CC CHAPTER LIST with verses ─────────────────────────────────────────
  const renderCcChapters = (part) => {
    const verseCountsForPart = CC_CHAPTER_VERSES[part.slug] || [];
    return (
      <div style={styles.chapterList}>
        {Array.from({ length: part.chapters }, (_, i) => {
          const chNum = i + 1;
          const verseCount = verseCountsForPart[i] || 100;
          return (
            <div key={chNum}>
              <button
                style={{
                  ...styles.chapterBtn,
                  background: selectedChapter === chNum ? '#ff6b35' : undefined,
                  color: selectedChapter === chNum ? '#fff' : undefined,
                }}
                onClick={() => setSelectedChapter(selectedChapter === chNum ? null : chNum)}
              >
                Chapter {chNum}
                <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 8 }}>({verseCount} verses)</span>
              </button>
              {selectedChapter === chNum && (
                <div style={{ ...styles.verseGrid, marginLeft: 12, marginTop: 6, marginBottom: 8 }}>
                  {Array.from({ length: verseCount }, (_, v) => {
                    const verseNum = v + 1;
                    const url = buildUrl(selectedBook, part.slug, chNum, verseNum);
                    return (
                      <a key={verseNum} href={url} target="_blank" rel="noopener noreferrer" style={styles.verseBtn}>
                        {verseNum}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── SIMPLE SINGLE-LEVEL ITEMS ─────────────────────────────────────────────
  const renderSingleItems = (book) => {
    const items = book.urlType === 'bs-verse'
      ? Array.from({ length: book.verses }, (_, i) => ({ number: i + 1, title: `Verse ${i + 1}` }))
      : book.items;
    return (
      <div style={styles.chapterList}>
        {items.map((item) => {
          const url = buildUrl(book, item.number);
          return (
            <a key={item.number} href={url} target="_blank" rel="noopener noreferrer" style={styles.chapterBtn}>
              {item.title}
            </a>
          );
        })}
      </div>
    );
  };

  // ── ROOT-ONLY BOOKS ───────────────────────────────────────────────────────
  const renderRootOnly = (book) => {
    const url = buildUrl(book);
    return (
      <div style={styles.chapterList}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...styles.chapterBtn,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fff8f0, #fff3e6)',
            border: '1.5px solid #f0c080',
            fontWeight: 600,
            color: '#b85c00',
            padding: '14px 20px',
          }}
        >
          📖 Open {book.shortTitle} on Vedabase
        </a>
        <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
          This book opens directly on vedabase.io.{'\n'}
          Chapter navigation is available on the Vedabase website.
        </p>
      </div>
    );
  };

  // ── BOOK DETAIL ───────────────────────────────────────────────────────────
  const renderBookDetail = () => {
    if (!selectedBook) return null;
    const book = selectedBook;

    return (
      <div style={styles.detailPanel}>
        <div style={styles.detailHeader}>
          <button
            style={styles.backBtn}
            onClick={() => {
              setSelectedBook(null);
              setSelectedCanto(null);
              setSelectedPart(null);
              setSelectedChapter(null);
            }}
          >
            ← Back
          </button>
          <div>
            <div style={styles.detailEmoji}>{book.emoji}</div>
            <div style={styles.detailTitle}>{book.title}</div>
            <div style={styles.detailShort}>{book.shortTitle}</div>
          </div>
        </div>

        {/* BG */}
        {book.urlType === 'chapter-verse' && (
          <div>
            <p style={styles.sectionLabel}>Select Chapter</p>
            <div style={styles.chapterList}>
              {book.chapters.map((ch) => (
                <button
                  key={ch.number}
                  style={{
                    ...styles.chapterBtn,
                    background: selectedChapter === ch.number ? '#ff6b35' : undefined,
                    color: selectedChapter === ch.number ? '#fff' : undefined,
                  }}
                  onClick={() => setSelectedChapter(selectedChapter === ch.number ? null : ch.number)}
                >
                  Chapter {ch.number}: {ch.title}
                </button>
              ))}
            </div>
            {selectedChapter && (
              <>
                <p style={styles.sectionLabel}>Select Verse</p>
                {renderVerseList(book, selectedChapter)}
              </>
            )}
          </div>
        )}

        {/* SB */}
        {book.urlType === 'canto-chapter-verse' && (
          <div>
            <p style={styles.sectionLabel}>Select Canto</p>
            <div style={styles.chapterList}>
              {book.cantos.map((canto) => (
                <button
                  key={canto.number}
                  style={{
                    ...styles.chapterBtn,
                    background: selectedCanto?.number === canto.number ? '#ff6b35' : undefined,
                    color: selectedCanto?.number === canto.number ? '#fff' : undefined,
                  }}
                  onClick={() => {
                    setSelectedCanto(selectedCanto?.number === canto.number ? null : canto);
                    setSelectedChapter(null);
                  }}
                >
                  Canto {canto.number}: {canto.title} ({canto.chapters} chapters)
                </button>
              ))}
            </div>
            {selectedCanto && (
              <>
                <p style={styles.sectionLabel}>Select Chapter → then tap a verse</p>
                {renderSbChapters(selectedCanto)}
              </>
            )}
          </div>
        )}

        {/* CC */}
        {book.urlType === 'part-chapter-verse' && (
          <div>
            <p style={styles.sectionLabel}>Select Part</p>
            <div style={styles.chapterList}>
              {book.parts.map((part) => (
                <button
                  key={part.slug}
                  style={{
                    ...styles.chapterBtn,
                    background: selectedPart?.slug === part.slug ? '#ff6b35' : undefined,
                    color: selectedPart?.slug === part.slug ? '#fff' : undefined,
                  }}
                  onClick={() => {
                    setSelectedPart(selectedPart?.slug === part.slug ? null : part);
                    setSelectedChapter(null);
                  }}
                >
                  {part.title} ({part.chapters} chapters)
                </button>
              ))}
            </div>
            {selectedPart && (
              <>
                <p style={styles.sectionLabel}>Select Chapter → then tap a verse</p>
                {renderCcChapters(selectedPart)}
              </>
            )}
          </div>
        )}

        {/* BS */}
        {book.urlType === 'bs-verse' && (
          <>
            <p style={styles.sectionLabel}>Select Verse (Chapter 5)</p>
            {renderSingleItems(book)}
          </>
        )}

        {/* Single-level books */}
        {book.urlType === 'single' && (
          <>
            <p style={styles.sectionLabel}>Select</p>
            {renderSingleItems(book)}
          </>
        )}

        {/* Root-only books */}
        {book.urlType === 'root-only' && (
          <>
            <p style={styles.sectionLabel}>Read on Vedabase</p>
            {renderRootOnly(book)}
          </>
        )}
      </div>
    );
  };

  // ── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {selectedBook ? (
        renderBookDetail()
      ) : (
        <>
          <div style={styles.searchRow}>
            <input
              type="text"
              placeholder="Search books…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.catRow}>
            {categories.map((cat) => (
              <button
                key={cat}
                style={{
                  ...styles.catBtn,
                  background: selectedCategory === cat ? '#ff6b35' : 'transparent',
                  color: selectedCategory === cat ? '#fff' : '#555',
                  borderColor: selectedCategory === cat ? '#ff6b35' : '#ddd',
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={styles.bookGrid}>
            {filteredBooks.map((book) => (
              <button
                key={book.id}
                style={styles.bookCard}
                onClick={() => {
                  setSelectedBook(book);
                  setSelectedCanto(null);
                  setSelectedPart(null);
                  setSelectedChapter(null);
                }}
              >
                <div style={styles.bookEmoji}>{book.emoji}</div>
                <div style={styles.bookShort}>{book.shortTitle}</div>
                <div style={styles.bookTitle}>{book.title}</div>
                <div style={styles.bookCat}>{book.category}</div>
              </button>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <p style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No books found.</p>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = {
  container: {
    padding: '16px',
    maxWidth: 800,
    margin: '0 auto',
    fontFamily: "'Georgia', serif",
    minHeight: '100vh',
    background: '#fdf9f4',
  },
  searchRow: { marginBottom: 12 },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid #ddd',
    fontSize: 15,
    background: '#fff',
    boxSizing: 'border-box',
    outline: 'none',
  },
  catRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catBtn: {
    padding: '6px 12px',
    borderRadius: 20,
    border: '1.5px solid #ddd',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  bookGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 14,
  },
  bookCard: {
    background: '#fff',
    border: '1.5px solid #e8e0d8',
    borderRadius: 12,
    padding: '16px 12px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  bookEmoji: { fontSize: 28, marginBottom: 6 },
  bookShort: { fontWeight: 700, color: '#ff6b35', fontSize: 13, marginBottom: 4 },
  bookTitle: { fontSize: 12, color: '#333', lineHeight: 1.3, marginBottom: 4 },
  bookCat: { fontSize: 11, color: '#999' },
  detailPanel: {
    background: '#fff',
    borderRadius: 14,
    padding: 20,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  backBtn: {
    background: '#f5f0eb',
    border: 'none',
    borderRadius: 8,
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: 14,
    color: '#555',
  },
  detailEmoji: { fontSize: 36 },
  detailTitle: { fontWeight: 700, fontSize: 18, color: '#222' },
  detailShort: { fontSize: 13, color: '#888', marginTop: 2 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 10,
    marginTop: 16,
  },
  chapterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    maxHeight: 400,
    overflowY: 'auto',
  },
  chapterBtn: {
    background: '#f8f4ef',
    border: '1px solid #e8e0d8',
    borderRadius: 8,
    padding: '10px 14px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 14,
    color: '#333',
    textDecoration: 'none',
    display: 'block',
    transition: 'background 0.15s',
  },
  verseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
    gap: 6,
    marginTop: 8,
  },
  verseBtn: {
    background: '#f8f4ef',
    border: '1px solid #e8e0d8',
    borderRadius: 6,
    padding: '8px 4px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: 13,
    color: '#333',
    textDecoration: 'none',
    display: 'block',
    transition: 'background 0.15s',
  },
};