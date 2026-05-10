'use client';
import { useState } from 'react';
import BottomNav from '../components/BottomNav';

// URL type key:
// 'chapter_verse'  → /library/{prefix}/{chapter}/{verse}/   (BG, BS)
// 'canto_ch_verse' → /library/{prefix}/{canto}/{chapter}/{verse}/  (SB, CC handled separately)
// 'chapter_only'   → /library/{prefix}/{chapter}/            (NOD, KB)
// 'item_only'      → /library/{prefix}/{item}/               (NOI, ISO — "chapter" IS the item)

const BOOKS = [
  {
    id: 'bg', title: 'Bhagavad-gītā As It Is', icon: '📘',
    description: '18 Chapters · 700 Verses',
    type: 'simple', urlType: 'chapter_verse', urlPrefix: 'bg',
    chapters: {
      1:{title:'Observing the Armies on the Battlefield of Kurukṣetra',verses:46},
      2:{title:'Contents of the Gītā Summarized',verses:72},
      3:{title:'Karma-yoga',verses:43},
      4:{title:'Transcendental Knowledge',verses:42},
      5:{title:'Karma-yoga — Action in Kṛṣṇa Consciousness',verses:29},
      6:{title:'Dhyāna-yoga',verses:47},
      7:{title:'Knowledge of the Absolute',verses:30},
      8:{title:'Attaining the Supreme',verses:28},
      9:{title:'The Most Confidential Knowledge',verses:34},
      10:{title:'The Opulence of the Absolute',verses:42},
      11:{title:'The Universal Form',verses:55},
      12:{title:'Devotional Service',verses:20},
      13:{title:'Nature, the Enjoyer and Consciousness',verses:35},
      14:{title:'The Three Modes of Material Nature',verses:27},
      15:{title:'The Yoga of the Supreme Person',verses:20},
      16:{title:'The Divine and Demoniac Natures',verses:24},
      17:{title:'The Divisions of Faith',verses:28},
      18:{title:'Conclusion — The Perfection of Renunciation',verses:78},
    }
  },
  {
    id: 'sb', title: 'Śrīmad-Bhāgavatam', icon: '📙',
    description: '12 Cantos · 335 Chapters · 18,000 Verses',
    type: 'canto', urlType: 'canto_ch_verse', cantoLabel: 'Canto', urlPrefix: 'sb',
    cantos: {
      1:{title:'Creation',chapters:{1:{title:'Questions by the Sages',verses:23},2:{title:'Divinity and Divine Service',verses:34},3:{title:'Kṛṣṇa Is the Source of All Incarnations',verses:45},4:{title:'The Appearance of Śrī Nārada',verses:33},5:{title:"Nārada's Instructions on Śrīmad-Bhāgavatam",verses:40},6:{title:'Conversation Between Nārada and Vyāsadeva',verses:37},7:{title:'The Son of Droṇa Punished',verses:58},8:{title:'Prayers by Queen Kuntī and Parīkṣit Saved',verses:52},9:{title:'The Passing Away of Bhīṣmadeva in the Presence of Lord Kṛṣṇa',verses:49},10:{title:'Departure of Lord Kṛṣṇa for Dvārakā',verses:45},11:{title:"Lord Kṛṣṇa's Entrance into Dvārakā",verses:39},12:{title:'Birth of Emperor Parīkṣit',verses:35},13:{title:'Dhṛtarāṣṭra Quits Home',verses:60},14:{title:'The Disappearance of Lord Kṛṣṇa',verses:45},15:{title:'The Pāṇḍavas Retire Timely',verses:51},16:{title:'How Parīkṣit Received the Age of Kali',verses:36},17:{title:'Punishment and Reward of Kali',verses:45},18:{title:'Mahārāja Parīkṣit Cursed by a Brāhmaṇa Boy',verses:50},19:{title:'The Appearance of Śukadeva Gosvāmī',verses:40}}},
      2:{title:'The Cosmic Manifestation',chapters:{1:{title:'The First Step in God Realization',verses:37},2:{title:'The Lord in the Heart',verses:37},3:{title:'Pure Devotional Service: The Change in Heart',verses:25},4:{title:'The Process of Creation',verses:25},5:{title:'The Cause of All Causes',verses:42},6:{title:'Puruṣa-sūkta Confirmed',verses:46},7:{title:'Scheduled Incarnations with Specific Functions',verses:53},8:{title:'Questions by King Parīkṣit',verses:28},9:{title:"Answers by Citing the Lord's Version",verses:45},10:{title:'Bhāgavatam Is the Answer to All Questions',verses:51}}},
      3:{title:'The Status Quo',chapters:{1:{title:'Questions by Vidura',verses:45},2:{title:'Remembrance of Lord Kṛṣṇa',verses:34},3:{title:"The Lord's Pastimes Outside Vṛndāvana",verses:30},4:{title:'Vidura Approaches Maitreya',verses:35},5:{title:"Vidura's Talks with Maitreya",verses:50},6:{title:'Creation of the Universal Form',verses:40},7:{title:'Further Inquires by Vidura',verses:40},8:{title:'Manifestation of Brahmā from Garbhodakaśāyī Viṣṇu',verses:53},9:{title:"Brahmā's Prayers for Creative Energy",verses:45},10:{title:'Divisions of the Creation',verses:42},11:{title:'Calculation of Time, from the Atom',verses:41},12:{title:'Creation of the Kumāras and Others',verses:56},13:{title:'The Appearance of Lord Varāha',verses:49},14:{title:'Pregnancy of Diti in the Evening',verses:50},15:{title:'Description of the Kingdom of God',verses:49},16:{title:'The Two Doorkeepers of Vaikuṇṭha, Jaya and Vijaya, Cursed by the Sages',verses:37},17:{title:'Victory of Hiraṇyākṣa Over All the Directions of the Universe',verses:31},18:{title:'The Battle Between Lord Boar and the Demon Hiraṇyākṣa',verses:28},19:{title:'The Killing of the Demon Hiraṇyākṣa',verses:38},20:{title:'Dialogue Between Maitreya and Vidura',verses:53},21:{title:'Conversation Between Manu and Kardama',verses:56},22:{title:'The Marriage of Kardama Muni and Devahūti',verses:39},23:{title:"Devahūti's Lamentation",verses:57},24:{title:'Renunciation of Kardama Muni',verses:47},25:{title:'The Glories of Devotional Service',verses:44},26:{title:'Fundamental Principles of Material Nature',verses:72},27:{title:'Understanding Material Nature',verses:30},28:{title:"Kapila's Instructions on the Execution of Devotional Service",verses:44},29:{title:'Explanation of Devotional Service by Lord Kapila',verses:45},30:{title:'Description by Lord Kapila of Adverse Fruitive Activities',verses:34},31:{title:"Lord Kapila's Instructions on the Movements of the Living Entities",verses:48},32:{title:'Entanglement in Fruitive Activities',verses:43},33:{title:'Activities of Kapila',verses:37}}},
      4:{title:'The Creation of the Fourth Order',chapters:{1:{title:'Genealogical Table of the Daughters of Manu',verses:45},2:{title:'Dakṣa Curses Lord Śiva',verses:35},3:{title:'Talks Between Lord Śiva and Satī',verses:27},4:{title:'Satī Quits Her Body',verses:34},5:{title:'Frustration of the Sacrifice of Dakṣa',verses:26},6:{title:'Brahmā Satisfies Lord Śiva',verses:54},7:{title:'The Sacrifice Performed by Dakṣa',verses:61},8:{title:'Dhruva Mahārāja Leaves Home for the Forest',verses:82},9:{title:'Dhruva Mahārāja Returns Home',verses:66},10:{title:"Dhruva Mahārāja's Fight with the Yakṣas",verses:30},11:{title:'Svāyambhuva Manu Advises Dhruva Mahārāja to Stop Fighting',verses:35},12:{title:'Dhruva Mahārāja Goes Back to Godhead',verses:52},13:{title:'Description of the Descendants of Dhruva Mahārāja',verses:49},14:{title:'The Story of King Vena',verses:46},15:{title:"King Pṛthu's Appearance and Coronation",verses:26},16:{title:'Praise of King Pṛthu by the Sūtas',verses:27},17:{title:'Mahārāja Pṛthu Becomes Angry at the Earth',verses:36},18:{title:'Pṛthu Mahārāja Milks the Earth Planet',verses:32},19:{title:"King Pṛthu's One Hundred Horse Sacrifices",verses:42},20:{title:"Lord Viṣṇu's Appearance in the Sacrificial Arena of Mahārāja Pṛthu",verses:38},21:{title:'Instructions by Mahārāja Pṛthu',verses:52},22:{title:"Pṛthu Mahārāja's Meeting with the Four Kumāras",verses:63},23:{title:"Mahārāja Pṛthu's Going Back Home",verses:39},24:{title:'Chanting the Song Sung by Lord Śiva',verses:79},25:{title:'The Descriptions of the Characteristics of King Purañjana',verses:62},26:{title:'King Purañjana Goes to the Forest to Hunt',verses:26},27:{title:'Attack by Caṇḍavega on the City of King Purañjana',verses:30},28:{title:'The Talks Between Purañjana and His Friend Avijñāta',verses:65},29:{title:'Talks Between Nārada and King Prācīnabarhi',verses:85},30:{title:'The Activities of the Pracetās',verses:51},31:{title:'Nārada Instructs the Pracetās',verses:31}}},
      5:{title:'The Creative Impetus',chapters:{1:{title:'The Activities of Mahārāja Priyavrata',verses:40},2:{title:'The Activities of Mahārāja Āgnīdhra',verses:23},3:{title:"Ṛṣabhadeva's Appearance in the Womb of Merudevī",verses:20},4:{title:'The Characteristics of Ṛṣabhadeva',verses:20},5:{title:"Lord Ṛṣabhadeva's Teachings to His Sons",verses:35},6:{title:'The Activities of Lord Ṛṣabhadeva',verses:18},7:{title:'The Activities of King Bharata',verses:14},8:{title:'A Description of the Character of Bharata Mahārāja',verses:31},9:{title:'The Supreme Character of Jaḍa Bharata',verses:20},10:{title:'The Discussion Between Jaḍa Bharata and Mahārāja Rahūgaṇa',verses:25},11:{title:'Jaḍa Bharata Instructs King Rahūgaṇa',verses:17},12:{title:'Conversation Between Mahārāja Rahūgaṇa and Jaḍa Bharata',verses:16},13:{title:'Further Talks Between Jaḍa Bharata and Rahūgaṇa Mahārāja',verses:26},14:{title:'The Material World as the Great Forest of Enjoyment',verses:46},15:{title:'The Glories of the Descendants of King Priyavrata',verses:15},16:{title:'A Description of Jambūdvīpa',verses:29},17:{title:'The Descent of the River Ganges',verses:24},18:{title:'The Prayers of the Personified Vedas',verses:39},19:{title:'A Description of the Island of Jambū',verses:31},20:{title:'Studying the Structure of the Universe',verses:46},21:{title:'The Movements of the Sun',verses:19},22:{title:'The Orbits of the Planets',verses:17},23:{title:'The Śiśumāra Planetary System',verses:9},24:{title:'The Subterranean Heavenly Planets',verses:29},25:{title:'The Glories of Lord Ananta',verses:15},26:{title:'A Description of the Hellish Planets',verses:40}}},
      6:{title:'Prescribed Duties for Mankind',chapters:{1:{title:'The History of the Life of Ajāmila',verses:58},2:{title:'Ajāmila Delivered by the Viṣṇudūtas',verses:49},3:{title:'Yamarāja Instructs His Messengers',verses:35},4:{title:'The Hamsa-guhya Prayers',verses:54},5:{title:'Nārada Muni Cursed by Prajāpati Dakṣa',verses:44},6:{title:'The Progeny of the Daughters of Dakṣa',verses:50},7:{title:'Indra Offends His Spiritual Master, Bṛhaspati',verses:40},8:{title:'The Nārāyaṇa-kavaca Shield',verses:42},9:{title:'Appearance of the Demon Vṛtrāsura',verses:55},10:{title:'The Battle Between the Demigods and Vṛtrāsura',verses:32},11:{title:'The Transcendental Qualities of Vṛtrāsura',verses:27},12:{title:"Vṛtrāsura's Glorious Death",verses:35},13:{title:'King Indra Afflicted by Sinful Reaction',verses:23},14:{title:"King Citraketu's Lamentation",verses:62},15:{title:'The Method of Worshiping the Supreme Lord',verses:28},16:{title:'King Citraketu Meets the Supreme Lord',verses:57},17:{title:'Mother Pārvatī Curses Citraketu',verses:41},18:{title:'Diti Vows to Kill King Indra',verses:80},19:{title:'Performing the Puṁsavana Ritualistic Ceremony',verses:27}}},
      7:{title:'The Science of God',chapters:{1:{title:'The Supreme Lord Is Equal to Everyone',verses:50},2:{title:'Hiraṇyakaśipu, King of the Demons',verses:60},3:{title:"Hiraṇyakaśipu's Plan to Become Immortal",verses:38},4:{title:'Hiraṇyakaśipu Terrorizes the Universe',verses:46},5:{title:'Prahlāda Mahārāja, the Saintly Son of Hiraṇyakaśipu',verses:57},6:{title:'Prahlāda Instructs His Demoniac Schoolmates',verses:30},7:{title:'What Prahlāda Learned in the Womb',verses:58},8:{title:'Lord Nṛsiṁhadeva Slays the King of the Demons',verses:56},9:{title:'Prahlāda Pacifies Lord Nṛsiṁhadeva with Prayers',verses:55},10:{title:'Prahlāda, the Best Among Exalted Devotees',verses:69},11:{title:'The Perfect Society: Four Social Classes',verses:35},12:{title:'The Perfect Society: Four Spiritual Classes',verses:31},13:{title:'The Behavior of a Perfect Person',verses:49},14:{title:'Ideal Family Life',verses:43},15:{title:'Instructions for Civilized Human Beings',verses:81}}},
      8:{title:'Withdrawal of the Cosmic Creations',chapters:{1:{title:'The Manus, Administrators of the Universe',verses:45},2:{title:"The Elephant Gajendra's Crisis",verses:33},3:{title:"Gajendra's Prayers of Surrender",verses:34},4:{title:'Gajendra Returns to the Spiritual World',verses:26},5:{title:'The Demigods Appeal to the Lord for Protection',verses:48},6:{title:'The Demigods and Demons Declare a Truce',verses:39},7:{title:'Lord Śiva Saves the Universe by Drinking Poison',verses:44},8:{title:'The Churning of the Milk Ocean',verses:45},9:{title:'The Lord Incarnates as Mohinī-mūrti',verses:29},10:{title:'The Battle Between the Demigods and the Demons',verses:57},11:{title:"King Indra's Victory",verses:48},12:{title:'The Mohinī-mūrti Incarnation Bewilders Lord Śiva',verses:47},13:{title:'Description of Future Manus',verses:34},14:{title:'The System of Universal Management',verses:21},15:{title:'Bali Mahārāja Conquers the Heavenly Planets',verses:36},16:{title:'Aditi Worships the Lord',verses:65},17:{title:"The Supreme Lord Agrees to Become Aditi's Son",verses:28},18:{title:'Lord Vāmanadeva, the Dwarf Incarnation',verses:32},19:{title:'Lord Vāmanadeva Begs Charity from Bali Mahārāja',verses:45},20:{title:'Bali Mahārāja Surrenders the Universe',verses:34},21:{title:'Bali Mahārāja Arrested by the Lord',verses:34},22:{title:'Bali Mahārāja Surrenders His Life',verses:37},23:{title:'The Demigods Regain the Heavenly Planets',verses:32},24:{title:"Matsya, the Lord's Fish Incarnation",verses:58}}},
      9:{title:'Liberation',chapters:{1:{title:'King Sudyumna Becomes a Woman',verses:42},2:{title:'The Dynasties of the Sons of Manu',verses:34},3:{title:'The Marriage of Sukanyā and Cyavana Muni',verses:36},4:{title:'Ambarīṣa Mahārāja Offended by Durvāsā Muni',verses:57},5:{title:"Durvāsā Muni's Life Spared",verses:27},6:{title:'The Decline of Yayāti',verses:55},7:{title:"The Descendants of King Yayāti's Sons",verses:26},8:{title:'The Sons of Sagara Meet Lord Kapiladeva',verses:30},9:{title:'The Dynasty of Aṁśumān',verses:47},10:{title:'The Pastimes of the Supreme Lord, Rāmacandra',verses:57},11:{title:'Lord Rāmacandra Rules the World',verses:36},12:{title:'The Dynasty of Kuśa, Son of Lord Rāmacandra',verses:16},13:{title:'The Dynasty of Mahārāja Nimi',verses:27},14:{title:'King Purūravā Enchanted by Urvaśī',verses:48},15:{title:"Paraśurāma, the Lord's Warrior Incarnation",verses:41},16:{title:'Lord Paraśurāma Destroys the Ruling Class',verses:36},17:{title:'The Dynasties of the Sons of Purūravā',verses:17},18:{title:"King Yayāti Regains His Youth",verses:52},19:{title:"King Yayāti's History Summarized",verses:29},20:{title:'The Dynasty of Pūru',verses:39},21:{title:'The Dynasty of Bharata',verses:36},22:{title:'The Descendants of Ajāmīḍha',verses:57},23:{title:'The Dynasties of the Sons of Yayāti',verses:38},24:{title:'Kṛṣṇa, the Supreme Personality of Godhead',verses:68}}},
      10:{title:'The Summum Bonum',chapters:{1:{title:'The Advent of Lord Kṛṣṇa: Introduction',verses:69},2:{title:'Prayers by the Demigods for Lord Kṛṣṇa in the Womb',verses:42},3:{title:'The Birth of Lord Kṛṣṇa',verses:53},4:{title:'The Atrocities of King Kaṁsa',verses:46},5:{title:'The Meeting of Nanda Mahārāja and Vasudeva',verses:32},6:{title:'The Killing of the Demon Pūtanā',verses:44},7:{title:'The Killing of the Demon Ṭṛṇāvarta',verses:37},8:{title:"Lord Kṛṣṇa Shows the Universal Form Within His Mouth",verses:52},9:{title:'Mother Yaśodā Binds Lord Kṛṣṇa',verses:23},10:{title:'Deliverance of Nalakūvara and Maṇigrīva',verses:43},11:{title:'The Childhood Pastimes of Kṛṣṇa',verses:59},12:{title:'The Killing of the Demon Aghāsura',verses:44},13:{title:'The Stealing of the Boys and Calves by Brahmā',verses:64}}},
      11:{title:'General History',chapters:{1:{title:'The Disappearance of the Yadu Dynasty',verses:24},2:{title:'Mahārāja Nimi Meets the Nine Yogendras',verses:55},3:{title:'Liberation from the Illusory Energy',verses:55},4:{title:'Drumila Explains the Incarnations of Godhead to King Nimi',verses:23},5:{title:'Nārada Concludes His Teachings to Vasudeva',verses:52},6:{title:'The Yadu Dynasty Retires to Prabhāsa',verses:30},7:{title:'Kṛṣṇa Begins the Uddhava-gītā',verses:74},8:{title:'The Story of Piṅgalā',verses:44},9:{title:'Detachment from All That Is Material',verses:32},10:{title:'The Nature of Fruitive Activity',verses:37},11:{title:'The Symptoms of Conditioned and Liberated Living Entities',verses:23},12:{title:'Beyond Renunciation and Knowledge',verses:24},13:{title:"The Haṁsa-avatāra Answers Brahmā's Questions",verses:40},14:{title:"Lord Kṛṣṇa Explains the Yoga System to Śrī Uddhava",verses:46},15:{title:"Lord Kṛṣṇa's Description of Mystic Yoga Perfections",verses:36},16:{title:"The Lord's Opulence",verses:44},17:{title:"Lord Kṛṣṇa's Description of the Varṇāśrama System",verses:58},18:{title:'Description of Varṇāśrama-dharma',verses:48},19:{title:'The Perfection of Spiritual Knowledge',verses:45},20:{title:'Pure Devotional Service Surpasses Knowledge and Detachment',verses:37},21:{title:"Lord Kṛṣṇa's Explanation of the Vedic Path",verses:43},22:{title:'Enumeration of the Elements of Material Creation',verses:58},23:{title:'The Song of the Avantī Brāhmaṇa',verses:60},24:{title:'The Philosophy of Sāṅkhya',verses:29},25:{title:'The Three Modes of Nature and Beyond',verses:36},26:{title:'The Aila-gītā',verses:32},27:{title:"Lord Kṛṣṇa's Instructions on the Process of Deity Worship",verses:55},28:{title:'Jñāna-yoga',verses:44},29:{title:'Bhakti-yoga',verses:49},30:{title:'The Disappearance of the Yadu Dynasty',verses:49},31:{title:'The Disappearance of Lord Śrī Kṛṣṇa',verses:28}}},
      12:{title:'The Age of Deterioration',chapters:{1:{title:'The Degraded Dynasties of Kali-yuga',verses:40},2:{title:'The Symptoms of Kali-yuga',verses:44},3:{title:'The Bhūmi-gītā',verses:45},4:{title:'The Four Categories of Universal Annihilation',verses:45},5:{title:"Śukadeva Gosvāmī's Final Instructions",verses:14},6:{title:"Mahārāja Parīkṣit Insulted; Śukadeva Gosvāmī Begins",verses:79},7:{title:'The Purāṇic Literatures',verses:23},8:{title:"Mārkaṇḍeya's Prayers to Nara-Nārāyaṇa Ṛṣi",verses:55},9:{title:'Mārkaṇḍeya Ṛṣi Sees the Illusory Potency of the Lord',verses:35},10:{title:'Lord Śiva and Umā Glorify Mārkaṇḍeya Ṛṣi',verses:42},11:{title:'Summary Description of the Mahāpuruṣa',verses:49},12:{title:'The Topics of Śrīmad-Bhāgavatam Summarized',verses:69},13:{title:'The Glories of Śrīmad-Bhāgavatam',verses:23}}}
    }
  },
  {
    id: 'cc', title: 'Śrī Caitanya-caritāmṛta', icon: '📗',
    description: 'Ādi, Madhya & Antya-līlā · 17+25+20 Chapters',
    type: 'canto', urlType: 'cc_special', cantoLabel: 'Līlā', urlPrefix: 'cc',
    cantos: {
      1:{title:'Ādi-līlā',urlSlug:'adi',chapters:{1:{title:'The Spiritual Masters',verses:110},2:{title:'Śrī Caitanya Mahāprabhu Is the Supreme Personality of Godhead',verses:117},3:{title:"The External Reasons for Lord Caitanya's Appearance",verses:113},4:{title:"The Confidential Reasons for Lord Caitanya's Appearance",verses:231},5:{title:'The Glories of Lord Nityānanda Balarāma',verses:232},6:{title:'The Glories of Advaita Ācārya',verses:115},7:{title:'Lord Caitanya in Five Features',verses:172},8:{title:'The Author Receives the Orders of Kṛṣṇa and Guru',verses:79},9:{title:'The Tree of Devotional Service',verses:55},10:{title:'The Trunk, Branches and Sub-branches of the Caitanya Tree',verses:167},11:{title:'The Expansions of Lord Nityānanda Balarāma',verses:61},12:{title:'The Expansions of Advaita Ācārya and Gadādhara Paṇḍita',verses:73},13:{title:'The Advent of Lord Śrī Caitanya Mahāprabhu',verses:123},14:{title:"Lord Caitanya's Childhood Pastimes",verses:76},15:{title:"The Period Prior to Lord Śrī Caitanya's Acceptance of Sannyāsa",verses:31},16:{title:'The Pastimes of Lord Caitanya at Navadvīpa',verses:108},17:{title:'The Pastimes of Lord Caitanya in His Youth',verses:338}}},
      2:{title:'Madhya-līlā',urlSlug:'madhya',chapters:{1:{title:"The Later Pastimes of Lord Śrī Caitanya Mahāprabhu",verses:287},2:{title:'The Ecstatic Manifestations of Lord Śrī Caitanya Mahāprabhu',verses:93},3:{title:"Lord Śrī Caitanya Mahāprabhu's Stay at the House of Advaita Ācārya",verses:215},4:{title:"Śrī Mādhavendra Purī's Devotional Service",verses:197},5:{title:'The Activities of Sākṣi-gopāla',verses:159},6:{title:'The Liberation of Sārvabhauma Bhaṭṭācārya',verses:277},7:{title:"The Lord's Tour of South India",verses:162},8:{title:'Talks Between Śrī Caitanya Mahāprabhu and Rāmānanda Rāya',verses:312},9:{title:"Lord Śrī Caitanya Mahāprabhu's Travels to Holy Places",verses:361},10:{title:"The Lord's Return to Jagannātha Purī",verses:185},11:{title:'The Beḍā-kīrtana Pastimes of Śrī Caitanya Mahāprabhu',verses:239},12:{title:'The Cleansing of the Guṇḍicā Temple',verses:211},13:{title:'The Ecstatic Dancing of the Lord at Ratha-yātrā',verses:213},14:{title:'Performance of the Vṛndāvana Pastimes',verses:255},15:{title:'The Lord Accepts Prasāda at the House of Sārvabhauma Bhaṭṭācārya',verses:298},16:{title:"The Lord's Attempt to Go to Vṛndāvana",verses:287},17:{title:'The Lord Travels to Vṛndāvana',verses:228},18:{title:"Lord Śrī Caitanya Mahāprabhu's Visit to Śrī Vṛndāvana",verses:224},19:{title:'Lord Śrī Caitanya Mahāprabhu Instructs Śrīla Rūpa Gosvāmī',verses:260},20:{title:'Lord Śrī Caitanya Mahāprabhu Instructs Sanātana Gosvāmī in the Science of the Absolute Truth',verses:421},21:{title:'The Opulence and Sweetness of Lord Śrī Kṛṣṇa',verses:143},22:{title:'The Process of Devotional Service',verses:167},23:{title:"Life's Ultimate Goal — Love of Godhead",verses:134},24:{title:'The Sixty-four Devotional Qualities of Lord Śrī Kṛṣṇa',verses:351},25:{title:'How One Attains Love of Godhead',verses:290}}},
      3:{title:'Antya-līlā',urlSlug:'antya',chapters:{1:{title:"Śrīla Rūpa Gosvāmī's Second Meeting with the Lord",verses:212},2:{title:'The Chastisement of Junior Haridāsa',verses:171},3:{title:'The Glories of Śrīla Haridāsa Ṭhākura',verses:274},4:{title:'Sanātana Gosvāmī Visits the Lord at Jagannātha Purī',verses:231},5:{title:'How Pradyumna Miśra Received Instructions on Devotional Service',verses:160},6:{title:'The Meeting of Śrī Caitanya Mahāprabhu and Raghunātha dāsa Gosvāmī',verses:336},7:{title:'The Residents of Kūlīna-grāma and Khaṇḍa Visit the Lord',verses:168},8:{title:'Rāmacandra Purī Criticizes the Lord',verses:100},9:{title:'The Deliverance of Gopīnātha Paṭṭanāyaka',verses:149},10:{title:'Śrī Caitanya Mahāprabhu Accepts Prasāda from Śrī Vāsudeva Datta',verses:158},11:{title:'The Passing Away of Haridāsa Ṭhākura',verses:108},12:{title:'The Loving Dealings Between Lord Śrī Caitanya Mahāprabhu and Jagadānanda Paṇḍita',verses:153},13:{title:'Pastimes with Jagadānanda Paṇḍita and Raghunātha Bhaṭṭa Gosvāmī',verses:136},14:{title:"Śrī Caitanya Mahāprabhu's Feelings of Separation from Kṛṣṇa",verses:121},15:{title:'The Transcendental Pastimes of Lord Caitanya',verses:100},16:{title:'Lord Śrī Caitanya Mahāprabhu Tastes Nectar in the Verses of Rūpa Gosvāmī',verses:148},17:{title:'Nityānanda Sends a Letter to Śrī Caitanya Mahāprabhu',verses:69},18:{title:'Rescuing the Lord from Ecstatic Emotions',verses:115},19:{title:'The Inconceivable Behavior of Śrī Caitanya Mahāprabhu',verses:113},20:{title:'The Śikṣāṣṭaka Prayers',verses:155}}}
    }
  },
  {
    id: 'bs', title: 'Śrī Brahma-saṁhitā', icon: '📜',
    description: 'Chapter 5 · 62 Verses',
    type: 'simple', urlType: 'chapter_verse', urlPrefix: 'bs',
    chapters: { 5:{title:'Chapter Five',verses:62} }
  },
  // Chapter-only books (URL = /library/{prefix}/{chapter}/)
  {
    id: 'nod', title: 'The Nectar of Devotion', icon: '📕',
    description: '44 Chapters',
    type: 'simple', urlType: 'chapter_only', urlPrefix: 'nod',
    chapterUnit: 'Chapter',
    chapters: {
      1:{title:'Characteristics of Pure Devotional Service'},
      2:{title:'The First Stages of Devotion'},
      3:{title:'Eligibility of the Candidate for Accepting Devotional Service'},
      4:{title:'Devotional Service Surpasses All Liberation'},
      5:{title:'The Purity of Devotional Service'},
      6:{title:'How to Discharge Devotional Service'},
      7:{title:'Evidence Regarding Devotional Principles'},
      8:{title:'Offenses to Be Avoided'},
      9:{title:'Further Considerations of Devotional Principles'},
      10:{title:'Techniques of Hearing and Remembering'},
      11:{title:'Aspects of Transcendental Service'},
      12:{title:'Further Aspects of Transcendental Service'},
      13:{title:'Five Potent Forms of Devotional Service'},
      14:{title:'Devotional Qualifications'},
      15:{title:'Spontaneous Devotional Service'},
      16:{title:'Spontaneous Devotion Further Described'},
      17:{title:'Ecstatic Love'},
      18:{title:'Vyabhicāri-bhāva'},
      19:{title:'Further Analysis of Mixed Devotional Service'},
      20:{title:'The Marginal Line Between Devotional Service and Transcendental Emotion'},
      21:{title:'Râga-bhakti: Devotional Service in Transcendental Emotion'},
      22:{title:'Characteristics of Pure Devotional Service'},
      23:{title:'Competency to Receive Rasa'},
      24:{title:'Symptoms of Ecstatic Love'},
      25:{title:'Devotees of Kṛṣṇa'},
      26:{title:'Stimulation for Ecstatic Love'},
      27:{title:'Symptoms of Ecstatic Love'},
      28:{title:'Existential Ecstatic Love'},
      29:{title:'Expressions of Love for Kṛṣṇa'},
      30:{title:'Further Features of Ecstatic Love for Kṛṣṇa'},
      31:{title:'Additional Symptoms'},
      32:{title:'Symptoms of Continuous Ecstasy'},
      33:{title:'Indirect Expressions of Ecstatic Love'},
      34:{title:'The Nectar of Devotion'},
      35:{title:'Neutral Love of God'},
      36:{title:'Transcendental Affection (Servitude)'},
      37:{title:"Impetuses for Kṛṣṇa's Service"},
      38:{title:'Indifference and Separation'},
      39:{title:'Ways of Meeting Kṛṣṇa'},
      40:{title:'Reverential Devotion of Sons and Other Subordinates'},
      41:{title:'Fraternal Devotion'},
      42:{title:'Fraternal Loving Affairs'},
      43:{title:'Parenthood'},
      44:{title:'Devotional Service in Conjugal Love'},
    }
  },
  // Item-only books (URL = /library/{prefix}/{item}/) — NOI texts, ISO mantras
  {
    id: 'noi', title: 'Nectar of Instruction', icon: '📒',
    description: '11 Texts',
    type: 'simple', urlType: 'item_only', urlPrefix: 'noi',
    chapterUnit: 'Text',
    chapters: {
      1:{title:'Text One: Controlling the Urge to Speak'},
      2:{title:'Text Two: Six Activities That Ruin Devotional Service'},
      3:{title:'Text Three: Six Things Favorable for Devotional Service'},
      4:{title:'Text Four: Giving Gifts to Devotees'},
      5:{title:'Text Five: Worshiping Kṛṣṇa, the Supreme Lord'},
      6:{title:'Text Six: Loving Service to Śrī Rādhā and Kṛṣṇa'},
      7:{title:'Text Seven: Vraja and Those Who Live There'},
      8:{title:'Text Eight: Associating with Advanced Devotees'},
      9:{title:'Text Nine: Pure Love of Kṛṣṇa'},
      10:{title:'Text Ten: Love of Kṛṣṇa Is the Supreme Goal'},
      11:{title:'Text Eleven: The Gopīs as the Highest Devotees'},
    }
  },
  {
    id: 'iso', title: 'Śrī Īśopaniṣad', icon: '📔',
    description: '18 Mantras',
    type: 'simple', urlType: 'item_only', urlPrefix: 'iso',
    chapterUnit: 'Mantra',
    chapters: {
      1:{title:'Mantra One: Everything Is the Lord\'s Property'},
      2:{title:'Mantra Two: Acting Without Attachment to Results'},
      3:{title:'Mantra Three: Those Who Neglect the Lord'},
      4:{title:'Mantra Four: The Lord Is Everywhere'},
      5:{title:'Mantra Five: The Lord Is Far Away and Near'},
      6:{title:'Mantra Six: Seeing All Beings in the Lord'},
      7:{title:'Mantra Seven: Freedom from Illusion'},
      8:{title:'Mantra Eight: The Lord\'s Transcendental Form'},
      9:{title:'Mantra Nine: Worshiping Demigods Leads to Darkness'},
      10:{title:'Mantra Ten: The Interplay of Knowledge and Nescience'},
      11:{title:'Mantra Eleven: Using Both Simultaneously'},
      12:{title:'Mantra Twelve: Worshiping the Unmanifested'},
      13:{title:'Mantra Thirteen: Going Beyond Birth and Death'},
      14:{title:'Mantra Fourteen: The Secret of Death'},
      15:{title:'Mantra Fifteen: Removing the Covering'},
      16:{title:'Mantra Sixteen: Prayer to the Sun'},
      17:{title:'Mantra Seventeen: The Lord\'s Pastimes Are Eternal'},
      18:{title:'Mantra Eighteen: Fire-God Carries the Offering'},
    }
  },
  {
    id: 'kb', title: 'Kṛṣṇa, The Supreme Personality of Godhead', icon: '📓',
    description: '90 Chapters',
    type: 'simple', urlType: 'chapter_only', urlPrefix: 'kb',
    chapterUnit: 'Chapter',
    chapters: {
      1:{title:'Advent of Lord Kṛṣṇa'},2:{title:'Prayers by the Demigods'},3:{title:'Birth of Lord Kṛṣṇa'},
      4:{title:'Kaṁsa Begins His Persecutions'},5:{title:'Meeting of Nanda and Vasudeva'},
      6:{title:'Pūtanā Killed'},7:{title:'Salvation of Tṛṇāvarta'},8:{title:'Vision of the Universal Form'},
      9:{title:'Mother Yaśodā Binds Lord Kṛṣṇa'},10:{title:'Deliverance of Nalakūvara and Maṇigrīva'},
      11:{title:'Killing of Vatsāsura and Bakāsura'},12:{title:'Killing of the Aghāsura Demon'},
      13:{title:'Brahmā Steals the Boys and Calves'},14:{title:'Brahmā Glorifies Lord Kṛṣṇa'},
      15:{title:'Killing of Dhenukāsura'},16:{title:'Subduing Kāliya'},17:{title:'Extinguishing the Forest Fire'},
      18:{title:'Killing of the Pralambāsura Demon'},19:{title:'Devouring the Forest Fire'},
      20:{title:'Description of Autumn'},21:{title:'The Gopīs Attracted by the Flute'},
      22:{title:'Stealing the Garments of the Unmarried Gopī Girls'},23:{title:'Delivering the Wives of the Brāhmaṇas'},
      24:{title:'Worshiping Govardhana Hill'},25:{title:'Devastating Rainfall in Vṛndāvana'},
      26:{title:'Wonderful Kṛṣṇa'},27:{title:'Prayers by Indra and Surabhi'},
      28:{title:'Releasing Nanda Mahārāja from the Clutches of Varuṇa'},
      29:{title:'The Rāsa Dance: Introduction'},30:{title:'Kṛṣṇa Searches for the Gopīs'},
      31:{title:'Songs by the Gopīs'},32:{title:'Description of the Rāsa Dance'},
      33:{title:'Vidyādhara Liberated and the Demon Śaṅkhacūḍa Killed'},
      34:{title:'Nanda Mahārāja Saved and Śaṅkhacūḍa Killed'},35:{title:'Songs by the Gopīs'},
      36:{title:'Kaṁsa Sends Akrūra for Kṛṣṇa'},37:{title:'Killing of Keśī and Vyomāsura'},
      38:{title:'Akrūra\'s Arrival in Vṛndāvana'},39:{title:'Akrūra\'s Vision'},
      40:{title:'Prayers by Akrūra'},41:{title:'Kṛṣṇa and Balarāma Enter Mathurā'},
      42:{title:'The Killing of the Elephant Kuvalayāpīḍa'},43:{title:'The Killing of Kaṁsa'},
      44:{title:'Kṛṣṇa and Balarāma Meet Their Parents'},45:{title:'Kṛṣṇa Recovers the Son of His Teacher'},
      46:{title:'Uddhava Visits Vṛndāvana'},47:{title:'The Message of the Gopīs'},
      48:{title:'Kṛṣṇa Pleases His Devotees'},49:{title:'Ill-motivated Dhṛtarāṣṭra'},
      50:{title:'Kṛṣṇa Erects the Dvārakā Fort'},51:{title:'Talks Between Kṛṣṇa and Mucukunda'},
      52:{title:'Rukmī Rebuked'},53:{title:'Kṛṣṇa Kidnaps Rukmiṇī'},
      54:{title:'Kṛṣṇa Defeats All the Princes and Takes Rukmiṇī Home'},
      55:{title:'Pradyumna Born to Kṛṣṇa and Rukmiṇī'},56:{title:'The Story of the Syamantaka Jewel'},
      57:{title:'Satrājit Killed, Jewel Returned'},58:{title:'Five Queens Married'},
      59:{title:'Kṛṣṇa Kills the Demon Narakāsura'},60:{title:'Talks Between Kṛṣṇa and Rukmiṇī'},
      61:{title:'The Genealogy of the Family of Kṛṣṇa'},62:{title:'The Meeting of Ūṣā and Aniruddha'},
      63:{title:'Lord Kṛṣṇa Fights with Bāṇāsura'},64:{title:'Stealing of the Pārijāta Flower'},
      65:{title:'Lord Balarāma Visits Vṛndāvana'},66:{title:'The Killing of Pauṇḍraka'},
      67:{title:'Lord Balarāma Kills Rukmī'},68:{title:'The Marriage of Sāmba'},
      69:{title:'The Great Sage Nārada Visits the Different Homes of Lord Kṛṣṇa'},
      70:{title:'Lord Kṛṣṇa\'s Daily Activities'},71:{title:'Lord Kṛṣṇa Arrives at Indraprastha'},
      72:{title:'The Liberation of King Jarāsandha'},73:{title:'The Deliverance of King Śiśupāla'},
      74:{title:'Why Duryodhana Felt Insulted at the Rājasūya Sacrifice'},
      75:{title:'Draupadī Meets the Queens of Kṛṣṇa'},76:{title:'The Battle Between Śālva and the Vṛṣṇis'},
      77:{title:'The Killing of Śālva'},78:{title:'The Killing of Dantavakra, Videha and Romaharṣaṇa'},
      79:{title:'Lord Balarāma Visits the Holy Places'},80:{title:'The Meeting of Lord Kṛṣṇa with Sudāmā Brāhmaṇa'},
      81:{title:'The Brāhmaṇa Sudāmā Blessed by Lord Kṛṣṇa'},82:{title:'Kṛṣṇa and Balarāma Meet the Inhabitants of Vṛndāvana'},
      83:{title:'Draupadī Meets the Queens of Kṛṣṇa'},84:{title:'Sacrifices Performed by Vasudeva'},
      85:{title:'Spiritual Instruction for Vasudeva'},86:{title:'Arjuna Kidnaps Subhadrā'},
      87:{title:'Prayers by the Personified Vedas'},88:{title:'Kṛṣṇa Saves Bhīma'},
      89:{title:'Kṛṣṇa and Arjuna Retrieve an Old Brāhmaṇa\'s Sons'},90:{title:'Summary of Lord Kṛṣṇa\'s Glories'},
    }
  },
  // Additional books on Vedabase
  {
    id: 'tqk', title: 'Teachings of Queen Kuntī', icon: '📃',
    description: '30 Chapters',
    type: 'simple', urlType: 'chapter_only', urlPrefix: 'tqk',
    chapterUnit: 'Chapter',
    chapters: Object.fromEntries(Array.from({length:30},(_,i)=>[i+1,{title:`Chapter ${i+1}`}]))
  },
  {
    id: 'mw', title: 'Message of Godhead', icon: '📋',
    description: '8 Chapters',
    type: 'simple', urlType: 'chapter_only', urlPrefix: 'mw',
    chapterUnit: 'Chapter',
    chapters: Object.fromEntries(Array.from({length:8},(_,i)=>[i+1,{title:`Chapter ${i+1}`}]))
  },
  {
    id: 'sbs', title: 'Śrī Brahma-saṁhitā (Commentary)', icon: '🕉️',
    description: 'Vedabase Supplementary',
    type: 'simple', urlType: 'chapter_only', urlPrefix: 'sbs',
    chapterUnit: 'Chapter',
    chapters: { 1:{title:'Commentary on Brahma-saṁhitā'} }
  },
  {
    id: 'tpp', title: 'Teachings of Lord Prahlāda', icon: '🙏',
    description: 'Selected Teachings',
    type: 'simple', urlType: 'chapter_only', urlPrefix: 'tpp',
    chapterUnit: 'Chapter',
    chapters: Object.fromEntries(Array.from({length:10},(_,i)=>[i+1,{title:`Chapter ${i+1}`}]))
  },
];

// Generate the correct Vedabase URL based on book type
function getVedabaseUrl(book, cantoNum, chNum, itemNum) {
  const base = 'https://vedabase.io/en/library';
  switch (book.urlType) {
    case 'chapter_verse':
      // BG: /bg/{chapter}/{verse}/   BS: /bs/5/{verse}/
      return `${base}/${book.urlPrefix}/${chNum}/${itemNum}/`;
    case 'canto_ch_verse':
      // SB: /sb/{canto}/{chapter}/{verse}/
      return `${base}/${book.urlPrefix}/${cantoNum}/${chNum}/${itemNum}/`;
    case 'cc_special':
      // CC: /cc/{adi|madhya|antya}/{chapter}/{verse}/
      const slug = book.cantos[cantoNum]?.urlSlug || cantoNum;
      return `${base}/${book.urlPrefix}/${slug}/${chNum}/${itemNum}/`;
    case 'chapter_only':
      // NOD, KB: /nod/{chapter}/  — no verse sub-level
      return `${base}/${book.urlPrefix}/${chNum}/`;
    case 'item_only':
      // NOI, ISO: /noi/{text}/  /iso/{mantra}/  — "chapter" is the item itself
      return `${base}/${book.urlPrefix}/${chNum}/`;
    default:
      return `${base}/${book.urlPrefix}/`;
  }
}

// Whether a book has a verse-level navigation (true) or chapter IS the final item (false)
function hasVerseLevel(book) {
  return book.urlType === 'chapter_verse' || book.urlType === 'canto_ch_verse' || book.urlType === 'cc_special';
}

export default function BooksPage() {
  const [view, setView] = useState('home');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedCanto, setSelectedCanto] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState(null);

  const PageHeader = ({ title, subtitle, onBack }) => (
    <div style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)', padding: '20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      {onBack && <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', fontSize: '20px', cursor: 'pointer', flexShrink: 0 }}>←</button>}
      <div>
        <h1 style={{ color: 'white', fontSize: '19px', margin: '0 0 2px', fontWeight: 'bold' }}>{title}</h1>
        {subtitle && <p style={{ color: 'white', fontSize: '12px', margin: 0, opacity: 0.9 }}>{subtitle}</p>}
      </div>
    </div>
  );

  // ── HOME ──
  if (view === 'home') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      <PageHeader title="📚 Books" subtitle="Srila Prabhupada's Vedabase Library" />
      <div style={{ padding: '0 20px' }}>
        <p style={{ color: '#6B6B6B', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.6 }}>Browse any chapter or verse and open it directly on Vedabase.io with full translation and purport.</p>
        {BOOKS.map(book => (
          <button key={book.id} onClick={() => { setSelectedBook(book); setView(book.type === 'canto' ? 'cantoSelect' : 'chapterSelect'); }}
            style={{ width: '100%', background: 'white', borderRadius: '18px', padding: '16px', marginBottom: '10px', border: '1px solid rgba(255,153,51,0.2)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: '0 2px 12px rgba(255,153,51,0.07)', textAlign: 'left' }}>
            <span style={{ fontSize: '32px', flexShrink: 0 }}>{book.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: '15px', color: '#2D2D2D', fontWeight: 'bold' }}>{book.title}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#FF9933' }}>{book.description}</p>
            </div>
            <span style={{ color: '#FF9933', fontSize: '22px' }}>›</span>
          </button>
        ))}
      </div>
      <BottomNav />
    </div>
  );

  // ── CANTO SELECT ──
  if (view === 'cantoSelect') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
      <PageHeader title={`${selectedBook.icon} ${selectedBook.title}`} subtitle={`Select ${selectedBook.cantoLabel || 'Canto'}`} onBack={() => setView('home')} />
      <div style={{ padding: '0 20px' }}>
        {Object.entries(selectedBook.cantos).map(([num, canto]) => (
          <button key={num} onClick={() => { setSelectedCanto(Number(num)); setView('chapterSelect'); }}
            style={{ width: '100%', background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '10px', border: '1px solid rgba(255,153,51,0.2)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif', textAlign: 'left' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF9933, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>{num}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#2D2D2D', fontWeight: 'bold' }}>{selectedBook.cantoLabel || 'Canto'} {num}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#FF9933' }}>{canto.title}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B6B6B' }}>{Object.keys(canto.chapters).length} chapters</p>
            </div>
            <span style={{ color: '#FF9933', fontSize: '20px' }}>›</span>
          </button>
        ))}
      </div>
      <BottomNav />
    </div>
  );

  // ── CHAPTER SELECT ──
  if (view === 'chapterSelect') {
    const chapters = selectedBook.type === 'canto' ? selectedBook.cantos[selectedCanto].chapters : selectedBook.chapters;
    const unit = selectedBook.chapterUnit || 'Chapter';
    const isItemOnly = selectedBook.urlType === 'item_only' || selectedBook.urlType === 'chapter_only';

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
        <PageHeader
          title={selectedBook.type === 'canto' ? `${selectedBook.cantoLabel || 'Canto'} ${selectedCanto}: ${selectedBook.cantos[selectedCanto].title}` : selectedBook.title}
          subtitle={isItemOnly ? `Tap any ${unit.toLowerCase()} to open on Vedabase` : `Select ${unit}`}
          onBack={() => setView(selectedBook.type === 'canto' ? 'cantoSelect' : 'home')}
        />
        <div style={{ padding: '0 20px' }}>
          {isItemOnly && (
            <p style={{ color: '#6B6B6B', fontSize: '13px', margin: '0 0 14px', background: 'rgba(255,153,51,0.08)', padding: '10px 14px', borderRadius: '12px' }}>
              📖 This book opens directly on Vedabase — no verse sub-navigation needed.
            </p>
          )}
          {Object.entries(chapters).map(([num, ch]) => {
            const chTitle = typeof ch === 'object' ? (ch.title || `${unit} ${num}`) : `${unit} ${num}`;
            const url = isItemOnly
              ? getVedabaseUrl(selectedBook, selectedCanto, Number(num), null)
              : null;
            return (
              <button key={num}
                onClick={() => {
                  if (isItemOnly) {
                    // Open directly on Vedabase
                    window.open(url, '_blank', 'noopener,noreferrer');
                  } else {
                    setSelectedChapter(Number(num));
                    setView(hasVerseLevel(selectedBook) ? 'verseList' : 'readChapter');
                  }
                }}
                style={{ width: '100%', background: 'white', borderRadius: '14px', padding: '14px 16px', marginBottom: '8px', border: '1px solid rgba(255,153,51,0.15)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontFamily: 'Georgia, serif', textAlign: 'left' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFF0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9933', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>{num}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#2D2D2D' }}>{chTitle}</p>
                  {!isItemOnly && ch.verses && <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B6B6B' }}>{ch.verses} verses</p>}
                </div>
                <span style={{ color: '#FF9933', fontSize: '18px' }}>{isItemOnly ? '🌐' : '›'}</span>
              </button>
            );
          })}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── VERSE LIST (for books with verse-level: BG, SB, CC, BS) ──
  if (view === 'verseList') {
    const chapters = selectedBook.type === 'canto' ? selectedBook.cantos[selectedCanto].chapters : selectedBook.chapters;
    const chObj = chapters[selectedChapter];
    const verseCount = typeof chObj === 'object' ? chObj.verses : chObj;
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
        <PageHeader
          title={`Chapter ${selectedChapter}`}
          subtitle={typeof chObj === 'object' ? chObj.title : `Chapter ${selectedChapter}`}
          onBack={() => setView('chapterSelect')}
        />
        <div style={{ padding: '0 20px' }}>
          <p style={{ color: '#6B6B6B', fontSize: '13px', margin: '0 0 14px' }}>{verseCount} verses — tap any to open on Vedabase</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Array.from({ length: verseCount }, (_, i) => i + 1).map(v => (
              <button key={v} onClick={() => { setSelectedVerse(v); setView('readVerse'); }}
                style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'white', border: '1.5px solid rgba(255,153,51,0.3)', color: '#FF9933', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(255,153,51,0.08)' }}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── READ VERSE (BG, SB, CC, BS) ──
  if (view === 'readVerse') {
    const verseLabel = selectedBook.type === 'canto'
      ? `${selectedBook.id.toUpperCase()} ${selectedCanto}.${selectedChapter}.${selectedVerse}`
      : `${selectedBook.id.toUpperCase()} ${selectedChapter}.${selectedVerse}`;
    const url = getVedabaseUrl(selectedBook, selectedCanto, selectedChapter, selectedVerse);
    const chapters = selectedBook.type === 'canto' ? selectedBook.cantos[selectedCanto].chapters : selectedBook.chapters;
    const chObj = chapters[selectedChapter];
    const maxVerses = typeof chObj === 'object' ? chObj.verses : chObj;

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)', fontFamily: 'Georgia, serif', paddingBottom: '100px' }}>
        <PageHeader title={verseLabel} subtitle={selectedBook.title} onBack={() => setView('verseList')} />
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button onClick={() => { if (selectedVerse > 1) setSelectedVerse(v => v - 1); }} disabled={selectedVerse <= 1}
              style={{ padding: '10px 20px', borderRadius: '999px', background: selectedVerse <= 1 ? '#eee' : '#FFF0E0', border: 'none', color: selectedVerse <= 1 ? '#ccc' : '#FF9933', fontSize: '14px', cursor: selectedVerse <= 1 ? 'default' : 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
              ← Prev
            </button>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9933', alignSelf: 'center' }}>Verse {selectedVerse}</span>
            <button onClick={() => { if (selectedVerse < maxVerses) setSelectedVerse(v => v + 1); }} disabled={selectedVerse >= maxVerses}
              style={{ padding: '10px 20px', borderRadius: '999px', background: selectedVerse >= maxVerses ? '#eee' : '#FFF0E0', border: 'none', color: selectedVerse >= maxVerses ? '#ccc' : '#FF9933', fontSize: '14px', cursor: selectedVerse >= maxVerses ? 'default' : 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
              Next →
            </button>
          </div>
          <div style={{ background: 'white', borderRadius: '24px', padding: '36px 24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(255,153,51,0.12)', border: '1px solid rgba(255,153,51,0.15)', marginBottom: '16px' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>🕉️</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '24px', color: '#FF9933', fontWeight: 'bold' }}>{verseLabel}</h2>
            <p style={{ margin: '0 0 4px', fontSize: '15px', color: '#2D2D2D' }}>{selectedBook.title}</p>
            {selectedBook.type === 'canto' && (
              <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6B6B6B' }}>
                {selectedBook.cantoLabel || 'Canto'} {selectedCanto} · Chapter {selectedChapter} · Verse {selectedVerse}
              </p>
            )}
            {selectedBook.type !== 'canto' && <div style={{ marginBottom: '24px' }} />}
            <a href={url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '18px 36px', borderRadius: '999px', background: 'linear-gradient(135deg, #FF9933, #FFD700)', color: 'white', textDecoration: 'none', fontSize: '17px', fontFamily: 'Georgia, serif', fontWeight: 'bold', boxShadow: '0 6px 20px rgba(255,153,51,0.35)' }}>
              📖 Read on Vedabase
            </a>
            <p style={{ margin: '14px 0 0', fontSize: '12px', color: '#6B6B6B' }}>Opens vedabase.io · Full Sanskrit, synonyms, translation & purport by Srila Prabhupada</p>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(255,153,51,0.07)', border: '1px solid rgba(255,153,51,0.1)' }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6B6B6B', fontWeight: 'bold' }}>Jump to verse:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Array.from({ length: Math.min(maxVerses, 30) }, (_, i) => i + 1).map(v => (
                <button key={v} onClick={() => setSelectedVerse(v)}
                  style={{ width: '44px', height: '44px', borderRadius: '12px', background: v === selectedVerse ? 'linear-gradient(135deg, #FF9933, #FFD700)' : '#FFF0E0', border: 'none', color: v === selectedVerse ? 'white' : '#FF9933', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                  {v}
                </button>
              ))}
              {maxVerses > 30 && <span style={{ fontSize: '13px', color: '#6B6B6B', alignSelf: 'center' }}>· · · use Prev / Next for more</span>}
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
}