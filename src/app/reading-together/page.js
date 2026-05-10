'use client';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

const SB_CANTOS = {
  1:{title:'Creation',chapters:{1:{title:'Questions by the Sages',verses:23},2:{title:'Divinity and Divine Service',verses:34},3:{title:'Kṛṣṇa Is the Source',verses:45},4:{title:'The Appearance of Śrī Nārada',verses:33},5:{title:"Nārada's Instructions",verses:40},6:{title:'Conversation Between Nārada and Vyāsadeva',verses:37},7:{title:'The Son of Droṇa Punished',verses:58},8:{title:'Prayers by Queen Kuntī',verses:52},9:{title:'The Passing Away of Bhīṣmadeva',verses:49},10:{title:'Departure of Lord Kṛṣṇa for Dvārakā',verses:45},11:{title:"Lord Kṛṣṇa's Entrance into Dvārakā",verses:39},12:{title:'Birth of Emperor Parīkṣit',verses:35},13:{title:'Dhṛtarāṣṭra Quits Home',verses:60},14:{title:'The Disappearance of Lord Kṛṣṇa',verses:45},15:{title:'The Pāṇḍavas Retire',verses:51},16:{title:'How Parīkṣit Received the Age of Kali',verses:36},17:{title:'Punishment and Reward of Kali',verses:45},18:{title:'Mahārāja Parīkṣit Cursed',verses:50},19:{title:'The Appearance of Śukadeva Gosvāmī',verses:40}}},
  2:{title:'The Cosmic Manifestation',chapters:{1:{title:'The First Step in God Realization',verses:37},2:{title:'The Lord in the Heart',verses:37},3:{title:'Pure Devotional Service',verses:25},4:{title:'The Process of Creation',verses:25},5:{title:'The Cause of All Causes',verses:42},6:{title:'Puruṣa-sūkta Confirmed',verses:46},7:{title:'Scheduled Incarnations',verses:53},8:{title:'Questions by King Parīkṣit',verses:28},9:{title:"Answers by Citing the Lord's Version",verses:45},10:{title:'Bhāgavatam Is the Answer to All Questions',verses:51}}},
  3:{title:'The Status Quo',chapters:{1:{title:'Questions by Vidura',verses:45},2:{title:'Remembrance of Lord Kṛṣṇa',verses:34},3:{title:"The Lord's Pastimes Outside Vṛndāvana",verses:30},4:{title:'Vidura Approaches Maitreya',verses:35},5:{title:"Vidura's Talks with Maitreya",verses:50},6:{title:'Creation of the Universal Form',verses:40},7:{title:'Further Inquires by Vidura',verses:40},8:{title:'Manifestation of Brahmā from Garbhodakaśāyī Viṣṇu',verses:53},9:{title:"Brahmā's Prayers for Creative Energy",verses:45},10:{title:'Divisions of the Creation',verses:42},11:{title:'Calculation of Time',verses:41},12:{title:'Creation of the Kumāras',verses:56},13:{title:'The Appearance of Lord Varāha',verses:49},14:{title:'Pregnancy of Diti',verses:50},15:{title:'Description of the Kingdom of God',verses:49},16:{title:'The Two Doorkeepers of Vaikuṇṭha',verses:37},17:{title:'Victory of Hiraṇyākṣa Over the Directions',verses:31},18:{title:'The Battle Between Lord Boar and Hiraṇyākṣa',verses:28},19:{title:'The Killing of the Demon Hiraṇyākṣa',verses:38},20:{title:'Dialogue Between Maitreya and Vidura',verses:53},21:{title:'Conversation Between Manu and Kardama',verses:56},22:{title:'The Marriage of Kardama Muni',verses:39},23:{title:"Devahūti's Lamentation",verses:57},24:{title:'Renunciation of Kardama Muni',verses:47},25:{title:'The Glories of Devotional Service',verses:44},26:{title:'Fundamental Principles of Material Nature',verses:72},27:{title:'Understanding Prakṛti and Puruṣa',verses:30},28:{title:"Kapila's Instructions on Devotional Service",verses:44},29:{title:'Explanation of Devotional Service',verses:45},30:{title:'Description of the Hellish Planets',verses:34},31:{title:"Lord Kapila's Instructions",verses:48},32:{title:'Entanglement in Fruitive Activities',verses:43},33:{title:'Activities of Kardama',verses:37}}},
  4:{title:'The Creation of the Fourth Order',chapters:{1:{title:'Genealogical Table of the Daughters of Manu',verses:45},2:{title:'Dakṣa Curses Lord Śiva',verses:35},3:{title:'Talks Between Lord Śiva and Satī',verses:27},4:{title:'Satī Quits Her Body',verses:34},5:{title:'Frustration of the Sacrifice of Dakṣa',verses:26},6:{title:'Brahmā Satisfies Lord Śiva',verses:54},7:{title:'The Sacrifice Performed by Dakṣa',verses:61},8:{title:'Dhruva Mahārāja Leaves Home',verses:82},9:{title:'Dhruva Mahārāja Returns Home',verses:66},10:{title:"Dhruva Mahārāja's Fight with the Yakṣas",verses:30},11:{title:'Svāyambhuva Manu Advises Dhruva',verses:35},12:{title:'Dhruva Mahārāja Goes Back to Godhead',verses:52},13:{title:'Description of the Descendants of Dhruva',verses:49},14:{title:'The Story of King Vena',verses:46},15:{title:"King Pṛthu's Appearance and Coronation",verses:26},16:{title:'Praise of King Pṛthu by the Sūtas',verses:27},17:{title:'Mahārāja Pṛthu Becomes Angry',verses:36},18:{title:'Pṛthu Mahārāja Milks the Earth',verses:32},19:{title:"King Pṛthu's One Hundred Horse Sacrifices",verses:42},20:{title:"Lord Viṣṇu's Appearance",verses:38},21:{title:'Instructions by Mahārāja Pṛthu',verses:52},22:{title:"Pṛthu Mahārāja's Meeting with the Kumāras",verses:63},23:{title:'Mahārāja Pṛthu\'s Going Back Home',verses:39},24:{title:'Chanting the Song Sung by Lord Śiva',verses:79},25:{title:'The Descriptions of the Characteristics of King Purañjana',verses:62},26:{title:'King Purañjana Goes to the Forest',verses:26},27:{title:'Attack by Caṇḍavega',verses:30},28:{title:'The Talks Between Purañjana and His Friend Avijñāta',verses:65},29:{title:'Talks Between Nārada and King Prācīnabarhi',verses:85},30:{title:'The Activities of the Pracetās',verses:51},31:{title:'Nārada Instructs the Pracetās',verses:31}}},
  5:{title:'The Creative Impetus',chapters:{1:{title:'The Activities of Mahārāja Priyavrata',verses:40},2:{title:'The Activities of Mahārāja Āgnīdhra',verses:23},3:{title:"Ṛṣabhadeva's Appearance",verses:20},4:{title:'The Characteristics of Ṛṣabhadeva',verses:20},5:{title:"Lord Ṛṣabhadeva's Teachings",verses:35},6:{title:'The Activities of Lord Ṛṣabhadeva',verses:18},7:{title:'The Activities of King Bharata',verses:14},8:{title:'A Description of the Character of Bharata Mahārāja',verses:31},9:{title:'The Supreme Character of Jaḍa Bharata',verses:20},10:{title:'The Discussion Between Jaḍa Bharata and Mahārāja Rahūgaṇa',verses:25},11:{title:'Jaḍa Bharata Instructs King Rahūgaṇa',verses:17},12:{title:'Conversation Between Mahārāja Rahūgaṇa and Jaḍa Bharata',verses:16},13:{title:'Further Talks Between Jaḍa Bharata and Rahūgaṇa',verses:26},14:{title:'The Material World as the Great Forest of Enjoyment',verses:46},15:{title:'The Glories of the Descendants of King Priyavrata',verses:15},16:{title:'A Description of Jambūdvīpa',verses:29},17:{title:'The Descent of the River Ganges',verses:24},18:{title:'The Prayers of the Personified Vedas',verses:39},19:{title:'A Description of the Island of Jambū',verses:31},20:{title:'Studying the Structure of the Universe',verses:46},21:{title:'The Movements of the Sun',verses:19},22:{title:'The Orbits of the Planets',verses:17},23:{title:'The Śiśumāra Planetary System',verses:9},24:{title:'The Subterranean Heavenly Planets',verses:29},25:{title:'The Glories of Lord Ananta',verses:15},26:{title:'A Description of the Hellish Planets',verses:40}}},
  6:{title:'Prescribed Duties for Mankind',chapters:{1:{title:'The History of the Life of Ajāmila',verses:58},2:{title:'Ajāmila Delivered by the Viṣṇudūtas',verses:49},3:{title:'Yamarāja Instructs His Messengers',verses:35},4:{title:'The Hamsa-guhya Prayers',verses:54},5:{title:'Nārada Muni Cursed by Prajāpati Dakṣa',verses:44},6:{title:'The Progeny of the Daughters of Dakṣa',verses:50},7:{title:'Indra Offends His Spiritual Master',verses:40},8:{title:'The Nārāyaṇa-kavaca Shield',verses:42},9:{title:'Appearance of the Demon Vṛtrāsura',verses:55},10:{title:'The Battle Between the Demigods and Vṛtrāsura',verses:32},11:{title:'The Transcendental Qualities of Vṛtrāsura',verses:27},12:{title:"Vṛtrāsura's Glorious Death",verses:35},13:{title:'King Indra Afflicted by Sinful Reaction',verses:23},14:{title:"King Citraketu's Lamentation",verses:62},15:{title:'The Method of Worshiping the Supreme Lord',verses:28},16:{title:'King Citraketu Meets the Supreme Lord',verses:57},17:{title:'Mother Pārvatī Curses Citraketu',verses:41},18:{title:'Diti Vows to Kill Indra',verses:80},19:{title:'Performing the Puṁsavana Ritualistic Ceremony',verses:27}}},
  7:{title:'The Science of God',chapters:{1:{title:'The Supreme Lord Is Equal to Everyone',verses:50},2:{title:'Hiraṇyakaśipu, King of the Demons',verses:60},3:{title:"Hiraṇyakaśipu's Plan to Become Immortal",verses:38},4:{title:'Hiraṇyakaśipu Terrorizes the Universe',verses:46},5:{title:'Prahlāda Mahārāja, the Saintly Son of Hiraṇyakaśipu',verses:57},6:{title:'Prahlāda Instructs His Demoniac Schoolmates',verses:30},7:{title:'What Prahlāda Learned in the Womb',verses:58},8:{title:'Lord Nṛsiṁhadeva Slays the King of the Demons',verses:56},9:{title:'Prahlāda Pacifies Lord Nṛsiṁhadeva',verses:55},10:{title:'Prahlāda, the Best Among Exalted Devotees',verses:69},11:{title:'The Perfect Society: Four Social Classes',verses:35},12:{title:'The Perfect Society: Four Spiritual Classes',verses:31},13:{title:'The Behavior of a Perfect Person',verses:49},14:{title:'Ideal Family Life',verses:43},15:{title:'Instructions for Civilized Human Beings',verses:81}}},
  8:{title:'Withdrawal of the Cosmic Creations',chapters:{1:{title:'The Manus, Administrators of the Universe',verses:45},2:{title:"The Elephant Gajendra's Crisis",verses:33},3:{title:'Gajendra\'s Prayers of Surrender',verses:34},4:{title:'Gajendra Returns to the Spiritual World',verses:26},5:{title:'The Demigods Appeal to the Lord',verses:48},6:{title:'The Demigods and Demons Declare a Truce',verses:39},7:{title:'Lord Śiva Saves the Universe',verses:44},8:{title:'The Churning of the Milk Ocean',verses:45},9:{title:'The Lord Incarnates as Mohinī-mūrti',verses:29},10:{title:'The Battle Between the Demigods and the Demons',verses:57},11:{title:"King Indra's Victory",verses:48},12:{title:'The Mohinī-mūrti Incarnation Bewilders Lord Śiva',verses:47},13:{title:'Description of Future Manus',verses:34},14:{title:'The System of Universal Management',verses:21},15:{title:'Bali Mahārāja Conquers the Heavenly Planets',verses:36},16:{title:'Aditi Worships the Lord',verses:65},17:{title:"The Supreme Lord Agrees to Become Aditi's Son",verses:28},18:{title:'Lord Vāmanadeva, the Dwarf Incarnation',verses:32},19:{title:'Lord Vāmanadeva Begs Charity from Bali Mahārāja',verses:45},20:{title:'Bali Mahārāja Surrenders the Universe',verses:34},21:{title:'Bali Mahārāja Arrested by the Lord',verses:34},22:{title:'Bali Mahārāja Surrenders His Life',verses:37},23:{title:'The Demigods Regain the Heavenly Planets',verses:32},24:{title:"Matsya, the Lord's Fish Incarnation",verses:58}}},
  9:{title:'Liberation',chapters:{1:{title:'King Sudyumna Becomes a Woman',verses:42},2:{title:'The Dynasties of the Sons of Manu',verses:34},3:{title:'The Marriage of Sukanyā and Cyavana',verses:36},4:{title:'Ambarīṣa Mahārāja Offended by Durvāsā Muni',verses:57},5:{title:"Durvāsā Muni's Life Spared",verses:27},6:{title:'The Decline of Yayāti',verses:55},7:{title:"The Descendants of King Yayāti's Sons",verses:26},8:{title:'The Sons of Sagara Meet Lord Kapiladeva',verses:30},9:{title:'The Dynasty of Aṁśumān',verses:47},10:{title:'The Pastimes of the Supreme Lord, Rāmacandra',verses:57},11:{title:'Lord Rāmacandra Rules the World',verses:36},12:{title:'The Dynasty of Kuśa',verses:16},13:{title:'The Dynasty of Mahārāja Nimi',verses:27},14:{title:'King Purūravā Enchanted by Urvaśī',verses:48},15:{title:"Paraśurāma, the Lord's Warrior Incarnation",verses:41},16:{title:'Lord Paraśurāma Destroys the Ruling Class',verses:36},17:{title:'The Dynasties of the Sons of Purūravā',verses:17},18:{title:"King Yayāti Regains His Youth",verses:52},19:{title:"King Yayāti's History Summarized",verses:29},20:{title:'The Dynasty of Pūru',verses:39},21:{title:'The Dynasty of Bharata',verses:36},22:{title:'The Descendants of Ajāmīḍha',verses:57},23:{title:'The Dynasties of the Sons of Yayāti',verses:38},24:{title:'Kṛṣṇa, the Supreme Personality of Godhead',verses:68}}},
  10:{title:'The Summum Bonum',chapters:{1:{title:'The Advent of Lord Kṛṣṇa',verses:69},2:{title:'Prayers by the Demigods',verses:42},3:{title:'The Birth of Lord Kṛṣṇa',verses:53},4:{title:'The Atrocities of King Kaṁsa',verses:46},5:{title:'The Meeting of Nanda and Vasudeva',verses:32},6:{title:'The Killing of the Demon Pūtanā',verses:44},7:{title:'The Killing of the Demon Ṭṛṇāvarta',verses:37},8:{title:"Lord Kṛṣṇa Shows the Universe Within His Mouth",verses:52},9:{title:'Mother Yaśodā Binds Lord Kṛṣṇa',verses:23},10:{title:'Deliverance of Nalakūvara and Maṇigrīva',verses:43},11:{title:'The Childhood Pastimes of Kṛṣṇa',verses:59},12:{title:'The Killing of the Demon Aghāsura',verses:44},13:{title:'The Stealing of the Boys and Calves by Brahmā',verses:64}}},
  11:{title:'General History',chapters:{1:{title:'The Disappearance of the Yadu Dynasty',verses:24},2:{title:'Mahārāja Nimi Meets the Nine Yogendras',verses:55},3:{title:'Liberation from the Illusory Energy',verses:55},4:{title:'Drumila Explains the Incarnations of Godhead',verses:23},5:{title:'Nārada Concludes His Teachings',verses:52},6:{title:'The Yadu Dynasty Retires to Prabhāsa',verses:30},7:{title:'Kṛṣṇa Begins the Uddhava-gītā',verses:74},8:{title:'The Story of Piṅgalā',verses:44},9:{title:'Detachment from All That Is Material',verses:32},10:{title:'The Nature of Fruitive Activity',verses:37},11:{title:'The Symptoms of Conditioned and Liberated Beings',verses:23},12:{title:'The Path of Pure Devotion',verses:24},13:{title:"The Haṁsa-avatāra Answers Brahmā's Questions",verses:40},14:{title:"Lord Kṛṣṇa Explains the Yoga System",verses:46},15:{title:"Lord Kṛṣṇa's Description of Mystic Yoga",verses:36},16:{title:"The Lord's Opulence",verses:44},17:{title:"Lord Kṛṣṇa's Description of the Varṇāśrama System",verses:58},18:{title:'Description of Varṇāśrama-dharma',verses:48},19:{title:'The Perfection of Spiritual Knowledge',verses:45},20:{title:'Pure Devotional Service Surpasses Knowledge',verses:37},21:{title:"Lord Kṛṣṇa's Explanation of the Vedic Path",verses:43},22:{title:'Enumeration of the Elements of Material Creation',verses:58},23:{title:'The Song of the Avantī Brāhmaṇa',verses:60},24:{title:'The Philosophy of Sāṅkhya',verses:29},25:{title:'The Three Modes of Nature',verses:36},26:{title:'The Aila-gītā',verses:32},27:{title:"Lord Kṛṣṇa's Instructions on the Process of Deity Worship",verses:55},28:{title:'Jñāna-yoga',verses:44},29:{title:'Bhakti-yoga',verses:49},30:{title:'The Disappearance of the Yadu Dynasty',verses:49},31:{title:'The Disappearance of Lord Śrī Kṛṣṇa',verses:28}}},
  12:{title:'The Age of Deterioration',chapters:{1:{title:'The Degraded Dynasties of Kali-yuga',verses:40},2:{title:'The Symptoms of Kali-yuga',verses:44},3:{title:'The Bhūmi-gītā',verses:45},4:{title:'The Four Categories of Universal Annihilation',verses:45},5:{title:"Śukadeva Gosvāmī's Final Instructions",verses:14},6:{title:"Mahārāja Parīkṣit's Passing",verses:79},7:{title:'The Purāṇic Literatures',verses:23},8:{title:"Mārkaṇḍeya's Prayers",verses:55},9:{title:'Mārkaṇḍeya Ṛṣi Sees the Illusory Potency of the Lord',verses:35},10:{title:'Lord Śiva Blesses Mārkaṇḍeya',verses:42},11:{title:'Summary Description of the Mahāpuruṣa',verses:49},12:{title:'The Topics of Śrīmad-Bhāgavatam Summarized',verses:69},13:{title:'The Glories of Śrīmad-Bhāgavatam',verses:23}}}
};

const CC_LILAS = {
  1:{title:'Ādi-līlā',chapters:{1:{title:'The Spiritual Masters',verses:110},2:{title:'Śrī Caitanya Mahāprabhu Is the Supreme Personality of Godhead',verses:117},3:{title:"The External Reasons for Lord Caitanya's Appearance",verses:113},4:{title:"The Confidential Reasons for Lord Caitanya's Appearance",verses:231},5:{title:'The Glories of Lord Nityānanda Balarāma',verses:232},6:{title:'The Glories of Advaita Ācārya',verses:115},7:{title:'Lord Caitanya in Five Features',verses:172},8:{title:'The Author Receives the Orders of Kṛṣṇa and Guru',verses:79},9:{title:'The Tree of Devotional Service',verses:55},10:{title:'The Trunk, Branches and Sub-branches of the Caitanya Tree',verses:167},11:{title:'The Expansions of Lord Nityānanda',verses:61},12:{title:'The Expansions of Advaita Ācārya and Gadādhara',verses:73},13:{title:'The Advent of Lord Śrī Caitanya Mahāprabhu',verses:123},14:{title:"Lord Caitanya's Childhood Pastimes",verses:76},15:{title:"The Period Prior to Lord Śrī Caitanya's Acceptance of Sannyāsa",verses:31},16:{title:'The Pastimes of Lord Caitanya at Navadvīpa',verses:108},17:{title:'The Pastimes of Lord Caitanya in His Youth',verses:338}}},
  2:{title:'Madhya-līlā',chapters:{1:{title:"The Later Pastimes of Lord Śrī Caitanya Mahāprabhu",verses:287},2:{title:'The Ecstatic Manifestations of Lord Śrī Caitanya Mahāprabhu',verses:93},3:{title:"Lord Śrī Caitanya Mahāprabhu's Stay at the House of Advaita Ācārya",verses:215},4:{title:"Śrī Mādhavendra Purī's Devotional Service",verses:197},5:{title:'The Activities of Sākṣi-gopāla',verses:159},6:{title:'The Liberation of Sārvabhauma Bhaṭṭācārya',verses:277},7:{title:"The Lord's Tour of South India",verses:162},8:{title:'Talks Between Śrī Caitanya Mahāprabhu and Rāmānanda Rāya',verses:312},9:{title:"Lord Śrī Caitanya Mahāprabhu's Travels to Holy Places",verses:361},10:{title:"The Lord's Return to Jagannātha Purī",verses:185},11:{title:'The Beḍā-kīrtana Pastimes of Śrī Caitanya Mahāprabhu',verses:239},12:{title:'The Cleansing of the Guṇḍicā Temple',verses:211},13:{title:'The Ecstatic Dancing of the Lord at Ratha-yātrā',verses:213},14:{title:'Performance of the Vṛndāvana Pastimes',verses:255},15:{title:'The Lord Accepts Prasāda at the House of Sārvabhauma Bhaṭṭācārya',verses:298},16:{title:"The Lord's Attempt to Go to Vṛndāvana",verses:287},17:{title:'The Lord Travels to Vṛndāvana',verses:228},18:{title:"Lord Śrī Caitanya Mahāprabhu's Visit to Śrī Vṛndāvana",verses:224},19:{title:'Lord Śrī Caitanya Mahāprabhu Instructs Śrīla Rūpa Gosvāmī',verses:260},20:{title:'Lord Śrī Caitanya Mahāprabhu Instructs Sanātana Gosvāmī',verses:421},21:{title:'The Opulence and Sweetness of Lord Śrī Kṛṣṇa',verses:143},22:{title:'The Process of Devotional Service',verses:167},23:{title:"Life's Ultimate Goal — Love of Godhead",verses:134},24:{title:'The Sixty-four Devotional Qualities of Lord Śrī Kṛṣṇa',verses:351},25:{title:'How One Attains Love of Godhead',verses:290}}},
  3:{title:'Antya-līlā',chapters:{1:{title:"Śrīla Rūpa Gosvāmī's Second Meeting",verses:212},2:{title:'The Chastisement of Junior Haridāsa',verses:171},3:{title:'The Glories of Śrīla Haridāsa Ṭhākura',verses:274},4:{title:'Sanātana Gosvāmī Visits the Lord at Jagannātha Purī',verses:231},5:{title:'How Pradyumna Miśra Received Instructions on Devotional Service',verses:160},6:{title:'The Meeting of Śrī Caitanya Mahāprabhu and Raghunātha dāsa Gosvāmī',verses:336},7:{title:'The Residents of Kūlīna-grāma and Khaṇḍa Visit the Lord',verses:168},8:{title:'Rāmacandra Purī Criticizes the Lord',verses:100},9:{title:'The Deliverance of Gopīnātha Paṭṭanāyaka',verses:149},10:{title:'Śrī Caitanya Mahāprabhu Accepts Prasāda from Śrī Vāsudeva Datta',verses:158},11:{title:'The Passing Away of Haridāsa Ṭhākura',verses:108},12:{title:'The Loving Dealings Between Lord Śrī Caitanya Mahāprabhu and Jagadānanda Paṇḍita',verses:153},13:{title:'Pastimes with Jagadānanda Paṇḍita and Raghunātha Bhaṭṭa Gosvāmī',verses:136},14:{title:"Śrī Caitanya Mahāprabhu's Feelings of Separation from Kṛṣṇa",verses:121},15:{title:'The Transcendental Pastimes of Lord Caitanya',verses:100},16:{title:'Lord Śrī Caitanya Mahāprabhu Tastes Nectar in the Verses of Rūpa Gosvāmī',verses:148},17:{title:'Nityānanda Sends a Letter to Śrī Caitanya Mahāprabhu',verses:69},18:{title:'Rescuing the Lord from Ecstatic Emotions',verses:115},19:{title:'The Inconceivable Behavior of Śrī Caitanya Mahāprabhu',verses:113},20:{title:'The Śikṣāṣṭaka Prayers',verses:155}}}
};

const BOOKS = [
  {
    id:'bg', title:'Bhagavad-gītā As It Is', icon:'📘', type:'simple',
    description:'18 Chapters · 700 Verses',
    chapters:{1:{title:'Observing the Armies',verses:46},2:{title:'Contents of the Gītā Summarized',verses:72},3:{title:'Karma-yoga',verses:43},4:{title:'Transcendental Knowledge',verses:42},5:{title:'Karma-yoga — Action in Kṛṣṇa Consciousness',verses:29},6:{title:'Dhyāna-yoga',verses:47},7:{title:'Knowledge of the Absolute',verses:30},8:{title:'Attaining the Supreme',verses:28},9:{title:'The Most Confidential Knowledge',verses:34},10:{title:'The Opulence of the Absolute',verses:42},11:{title:'The Universal Form',verses:55},12:{title:'Devotional Service',verses:20},13:{title:'Nature, the Enjoyer and Consciousness',verses:35},14:{title:'The Three Modes of Material Nature',verses:27},15:{title:'The Yoga of the Supreme Person',verses:20},16:{title:'The Divine and Demoniac Natures',verses:24},17:{title:'The Divisions of Faith',verses:28},18:{title:'Conclusion — The Perfection of Renunciation',verses:78}}
  },
  {
    id:'sb', title:'Śrīmad-Bhāgavatam', icon:'📙', type:'canto',
    description:'12 Cantos · 335 Chapters · 18,000 Verses',
    cantoLabel:'Canto', cantos: SB_CANTOS
  },
  {
    id:'cc', title:'Śrī Caitanya-caritāmṛta', icon:'📗', type:'canto',
    description:'Ādi, Madhya & Antya-līlā',
    cantoLabel:'Līlā', cantos: CC_LILAS
  },
  {
    id:'noi', title:'Nectar of Instruction', icon:'📒', type:'simple',
    description:'11 Texts',
    chapters:{1:{title:'Text 1',verses:1},2:{title:'Text 2',verses:1},3:{title:'Text 3',verses:1},4:{title:'Text 4',verses:1},5:{title:'Text 5',verses:1},6:{title:'Text 6',verses:1},7:{title:'Text 7',verses:1},8:{title:'Text 8',verses:1},9:{title:'Text 9',verses:1},10:{title:'Text 10',verses:1},11:{title:'Text 11',verses:1}}
  },
  {
    id:'nod', title:'The Nectar of Devotion', icon:'📕', type:'simple',
    description:'44 Chapters',
    chapters: Object.fromEntries(Array.from({length:44},(_,i)=>[i+1,{title:`Chapter ${i+1}`,verses:20}]))
  },
  {
    id:'iso', title:'Śrī Īśopaniṣad', icon:'📔', type:'simple',
    description:'18 Mantras',
    chapters: Object.fromEntries(Array.from({length:18},(_,i)=>[i+1,{title:`Mantra ${i+1}`,verses:1}]))
  },
  {
    id:'bs', title:'Śrī Brahma-saṁhitā', icon:'📜', type:'simple',
    description:'Chapter 5 · 62 Verses',
    chapters:{5:{title:'Chapter 5',verses:62}}
  },
  {
    id:'krishna', title:'Kṛṣṇa, The Supreme Personality', icon:'📓', type:'simple',
    description:'90 Chapters',
    chapters: Object.fromEntries(Array.from({length:90},(_,i)=>[i+1,{title:`Chapter ${i+1}`,verses:20}]))
  },
];

// ── helpers ──────────────────────────────────────────────
function getVerses(book, canto, ch) {
  if (book.type === 'canto') return book.cantos[canto]?.chapters[ch]?.verses || 1;
  return book.chapters[ch]?.verses || 1;
}

function posLabel(book, pos) {
  if (!pos) return '';
  if (book?.type === 'canto') {
    const cl = book.cantoLabel || 'Canto';
    const ct = book.cantos[pos.canto]?.title || '';
    return `${cl} ${pos.canto} (${ct}) · Ch.${pos.chapter} · v.${pos.verse}`;
  }
  return `Ch.${pos.chapter} · v.${pos.verse}`;
}

function generateSchedule(book, start, target, targetDate) {
  const today = new Date(); today.setHours(0,0,0,0);
  const end   = new Date(targetDate); end.setHours(0,0,0,0);
  const totalDays = Math.max(1, Math.ceil((end-today)/(864e5))+1);

  const all = [];
  if (book.type === 'canto') {
    for (const canto of Object.keys(book.cantos).map(Number).sort((a,b)=>a-b)) {
      for (const ch of Object.keys(book.cantos[canto].chapters).map(Number).sort((a,b)=>a-b)) {
        const max = book.cantos[canto].chapters[ch].verses;
        for (let v=1;v<=max;v++) all.push({canto,chapter:ch,verse:v});
      }
    }
  } else {
    for (const ch of Object.keys(book.chapters).map(Number).sort((a,b)=>a-b)) {
      for (let v=1;v<=book.chapters[ch].verses;v++) all.push({chapter:ch,verse:v});
    }
  }

  const si = all.findIndex(x => book.type==='canto'
    ? x.canto===start.canto && x.chapter===start.chapter && x.verse===start.verse
    : x.chapter===start.chapter && x.verse===start.verse);
  const ei = all.findIndex(x => book.type==='canto'
    ? x.canto===target.canto && x.chapter===target.chapter && x.verse===target.verse
    : x.chapter===target.chapter && x.verse===target.verse);

  const slice = all.slice(Math.max(0,si), Math.min(all.length-1,ei<0?all.length-1:ei)+1);
  const vpd   = Math.max(1, Math.ceil(slice.length/totalDays));
  const sched = [];
  for (let d=0; d*vpd<slice.length; d++) {
    const chunk = slice.slice(d*vpd,(d+1)*vpd);
    if (!chunk.length) break;
    const date = new Date(today); date.setDate(today.getDate()+d);
    sched.push({ date:date.toISOString().split('T')[0], from:chunk[0], to:chunk[chunk.length-1], done:false });
  }
  return sched;
}

// ── Component ──────────────────────────────────────────────
export default function ReadingTogether() {
  const [userId,      setUserId]      = useState('');
  const [sanghaCode,  setSanghaCode]  = useState('');
  const [members,     setMembers]     = useState({});
  const [myPlan,      setMyPlan]      = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [view,        setView]        = useState('home');
  const [selBook,     setSelBook]     = useState(null);

  // position selectors
  const [sCanto, setSCanto] = useState(1);
  const [sCh,    setSCh]    = useState(1);
  const [sV,     setSV]     = useState(1);
  const [tCanto, setTCanto] = useState(1);
  const [tCh,    setTCh]    = useState(1);
  const [tV,     setTV]     = useState(1);
  const [tDate,  setTDate]  = useState('');

  // log reading
  const [lCanto,  setLCanto]  = useState(1);
  const [lCh,     setLCh]     = useState(1);
  const [lFromV,  setLFromV]  = useState(1);
  const [lToV,    setLToV]    = useState(1);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(()=>{
    const uid  = localStorage.getItem('userId')||'';
    const code = localStorage.getItem('sanghaCode')||'';
    setUserId(uid); setSanghaCode(code);
    if (code) {
      const ref = doc(db,'sanghas',code);
      const unsub = onSnapshot(ref, snap=>{
        if (snap.exists()) {
          const data = snap.data();
          setMembers(data.members||{});
          const plan = data.members?.[uid]?.reading_plan||null;
          setMyPlan(plan);
          if (plan) setSelBook(BOOKS.find(b=>b.id===plan.bookId)||null);
        }
      });
      return ()=>unsub();
    }
  },[]);

  const initBook = (book) => {
    setSelBook(book);
    if (book.type==='canto') {
      const fc = Number(Object.keys(book.cantos)[0]);
      const fch = Number(Object.keys(book.cantos[fc].chapters)[0]);
      setSCanto(fc); setSCh(fch); setSV(1);
      setTCanto(fc); setTCh(fch); setTV(1);
    } else {
      const fch = Number(Object.keys(book.chapters)[0]);
      setSCh(fch); setSV(1); setTCh(fch); setTV(1);
    }
    setView('setup');
  };

  const getStart  = () => selBook?.type==='canto' ? {canto:sCanto,chapter:sCh,verse:sV} : {chapter:sCh,verse:sV};
  const getTarget = () => selBook?.type==='canto' ? {canto:tCanto,chapter:tCh,verse:tV} : {chapter:tCh,verse:tV};

  const savePlan = async () => {
    if (!tDate||!selBook) return;
    setSaving(true);
    const sched = generateSchedule(selBook, getStart(), getTarget(), tDate);
    const plan = { bookId:selBook.id, bookTitle:selBook.title, bookIcon:selBook.icon, bookType:selBook.type,
      start:getStart(), target:getTarget(), targetDate:tDate, createdAt:new Date().toISOString(), schedule:sched };
    const ref = doc(db,'sanghas',sanghaCode);
    const snap = await getDoc(ref); const ex = snap.data();
    await setDoc(ref,{...ex,members:{...ex.members,[userId]:{...ex.members[userId],reading_plan:plan}}});
    setSaving(false); setView('home');
  };

  const logReading = async () => {
    setSaving(true);
    const ref = doc(db,'sanghas',sanghaCode);
    const snap = await getDoc(ref); const ex = snap.data();
    const plan = ex.members?.[userId]?.reading_plan;
    if (!plan){setSaving(false);return;}
    const lf = selBook?.type==='canto' ? {canto:lCanto,chapter:lCh,verse:lFromV} : {chapter:lCh,verse:lFromV};
    const lt = selBook?.type==='canto' ? {canto:lCanto,chapter:lCh,verse:lToV}   : {chapter:lCh,verse:lToV};
    let sched = (plan.schedule||[]).map(s=>s.date===todayStr?{...s,done:true,loggedFrom:lf,loggedTo:lt}:s);
    if (!plan.schedule?.find(s=>s.date===todayStr)) sched.push({date:todayStr,done:true,from:lf,to:lt,loggedFrom:lf,loggedTo:lt});
    const book = BOOKS.find(b=>b.id===plan.bookId);
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    const tStr = tomorrow.toISOString().split('T')[0];
    const future = book ? generateSchedule(book,lt,plan.target,plan.targetDate).filter(s=>s.date>=tStr) : [];
    const finalSched = [...sched.filter(s=>s.date<=todayStr),...future];
    await setDoc(ref,{...ex,members:{...ex.members,[userId]:{...ex.members[userId],reading_plan:{...plan,schedule:finalSched}}}});
    setSaving(false); setView('home');
  };

  const deletePlan = async () => {
    if (!confirm('Delete your reading plan?')) return;
    setSaving(true);
    const ref = doc(db,'sanghas',sanghaCode);
    const snap = await getDoc(ref); const ex = snap.data();
    const m = {...ex.members[userId]}; delete m.reading_plan;
    await setDoc(ref,{...ex,members:{...ex.members,[userId]:m}});
    setMyPlan(null); setSelBook(null); setSaving(false); setView('home');
  };

  const todaySched  = myPlan?.schedule?.find(s=>s.date===todayStr);
  const doneDays    = myPlan?.schedule?.filter(s=>s.done).length||0;
  const totalDays   = myPlan?.schedule?.length||0;
  const pct         = totalDays>0 ? Math.round((doneDays/totalDays)*100) : 0;

  // ── styles ──
  const card  = {background:'white',borderRadius:'20px',padding:'18px',marginBottom:'12px',boxShadow:'0 4px 20px rgba(255,153,51,0.1)',border:'1px solid rgba(255,153,51,0.15)'};
  const inp   = {width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1.5px solid #FFD700',fontSize:'14px',fontFamily:'Georgia, serif',outline:'none',color:'#2D2D2D',background:'#FFFAF5',boxSizing:'border-box',marginBottom:'10px'};
  const btnP  = {width:'100%',padding:'15px',borderRadius:'999px',background:'linear-gradient(135deg,#FF9933,#FFD700)',border:'none',color:'white',fontSize:'16px',cursor:'pointer',fontFamily:'Georgia, serif',fontWeight:'bold',marginBottom:'10px'};
  const btnS  = {width:'100%',padding:'13px',borderRadius:'999px',background:'white',border:'2px solid #FF9933',color:'#FF9933',fontSize:'15px',cursor:'pointer',fontFamily:'Georgia, serif',fontWeight:'bold',marginBottom:'10px'};
  const lbl   = (t) => <p style={{margin:'0 0 5px',fontSize:'13px',color:'#2D2D2D',fontWeight:'bold'}}>{t}</p>;

  const Header = ({title,sub,back}) => (
    <div style={{background:'linear-gradient(135deg,#FF9933,#FFD700)',padding:'20px',borderRadius:'0 0 24px 24px',display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
      {back && <button onClick={back} style={{background:'rgba(255,255,255,0.25)',border:'none',borderRadius:'50%',width:'40px',height:'40px',color:'white',fontSize:'20px',cursor:'pointer',flexShrink:0}}>←</button>}
      <div>
        <h1 style={{color:'white',fontSize:'19px',margin:'0 0 2px',fontWeight:'bold'}}>{title}</h1>
        {sub && <p style={{color:'white',fontSize:'12px',margin:0,opacity:0.9}}>{sub}</p>}
      </div>
    </div>
  );

  // ── Canto → Chapter → Verse selectors ──
  const CantoSelector = ({book,canto,setCanto,ch,setCh,verse,setVerse,prefix}) => {
    const cantos   = Object.keys(book.cantos).map(Number).sort((a,b)=>a-b);
    const chapters = Object.keys(book.cantos[canto]?.chapters||{}).map(Number).sort((a,b)=>a-b);
    const maxV     = book.cantos[canto]?.chapters[ch]?.verses||1;
    return(<>
      {lbl(`${prefix} ${book.cantoLabel||'Canto'}`)}
      <select value={canto} style={inp} onChange={e=>{const c=Number(e.target.value);setCanto(c);const fc=Number(Object.keys(book.cantos[c].chapters)[0]);setCh(fc);setVerse(1);}}>
        {cantos.map(c=><option key={c} value={c}>{book.cantoLabel||'Canto'} {c} — {book.cantos[c].title}</option>)}
      </select>
      {lbl(`${prefix} Chapter`)}
      <select value={ch} style={inp} onChange={e=>{setCh(Number(e.target.value));setVerse(1);}}>
        {chapters.map(c=><option key={c} value={c}>Chapter {c} — {book.cantos[canto].chapters[c].title}</option>)}
      </select>
      {lbl(`${prefix} Verse / Śloka`)}
      <select value={verse} style={inp} onChange={e=>setVerse(Number(e.target.value))}>
        {Array.from({length:maxV},(_,i)=>i+1).map(v=><option key={v} value={v}>Verse {v}</option>)}
      </select>
    </>);
  };

  const SimpleSelector = ({book,ch,setCh,verse,setVerse,prefix}) => {
    const chapters = Object.keys(book.chapters).map(Number).sort((a,b)=>a-b);
    const maxV     = book.chapters[ch]?.verses||1;
    return(<>
      {lbl(`${prefix} Chapter`)}
      <select value={ch} style={inp} onChange={e=>{setCh(Number(e.target.value));setVerse(1);}}>
        {chapters.map(c=><option key={c} value={c}>Chapter {c} — {book.chapters[c].title}</option>)}
      </select>
      {lbl(`${prefix} Verse / Śloka`)}
      <select value={verse} style={inp} onChange={e=>setVerse(Number(e.target.value))}>
        {Array.from({length:maxV},(_,i)=>i+1).map(v=><option key={v} value={v}>Verse {v}</option>)}
      </select>
    </>);
  };

  const wrap = (children) => (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#FFF8F0,#FFF0E0)',fontFamily:'Georgia, serif',paddingBottom:'100px'}}>
      {children}
      <BottomNav/>
    </div>
  );

  // ════════════════ HOME ════════════════
  if (view==='home') return wrap(<>
    <Header title="📚 Reading Together" sub="Study Srila Prabhupada's books as a Sangha"/>
    <div style={{padding:'0 20px'}}>
      {!myPlan ? (
        <div style={{textAlign:'center',marginTop:'30px'}}>
          <div style={{fontSize:'72px',marginBottom:'16px'}}>📖</div>
          <h2 style={{color:'#2D2D2D',fontSize:'20px',margin:'0 0 10px'}}>No Reading Plan Yet</h2>
          <p style={{color:'#6B6B6B',fontSize:'14px',margin:'0 0 30px',lineHeight:1.6}}>Select a book, set your position and target, and get a personalised daily reading schedule!</p>
          <button onClick={()=>setView('selectBook')} style={btnP}>📚 Start a Reading Plan</button>
        </div>
      ) : (<>
        <div style={{...card,background:'linear-gradient(135deg,#FFFAF0,#FFF5E0)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
            <span style={{fontSize:'28px'}}>{selBook?.icon}</span>
            <div style={{flex:1}}>
              <p style={{margin:0,fontSize:'11px',color:'#6B6B6B'}}>Currently Reading</p>
              <h2 style={{margin:0,fontSize:'16px',color:'#2D2D2D',fontWeight:'bold'}}>{myPlan.bookTitle}</h2>
            </div>
            <button onClick={()=>setView('edit')} style={{background:'#FFF0E0',border:'1px solid #FFD700',borderRadius:'999px',color:'#FF9933',padding:'6px 12px',fontSize:'12px',cursor:'pointer',fontFamily:'Georgia, serif'}}>✏️ Edit</button>
          </div>
          <div style={{background:'#FFE0B0',borderRadius:'999px',height:'10px',marginBottom:'6px'}}>
            <div style={{background:'linear-gradient(90deg,#FF9933,#FFD700)',borderRadius:'999px',height:'100%',width:`${pct}%`,transition:'width 0.5s'}}/>
          </div>
          <p style={{margin:'0 0 12px',fontSize:'12px',color:'#6B6B6B'}}>{doneDays} of {totalDays} days done · {pct}%</p>
          <div style={{background:'rgba(255,153,51,0.1)',borderRadius:'12px',padding:'10px 14px',marginBottom:'12px'}}>
            <p style={{margin:'0 0 3px',fontSize:'12px',color:'#6B6B6B'}}>Your Target</p>
            <p style={{margin:'0 0 2px',fontSize:'13px',color:'#2D2D2D'}}>From: {posLabel(selBook,myPlan.start)}</p>
            <p style={{margin:'0 0 2px',fontSize:'13px',color:'#2D2D2D'}}>To: {posLabel(selBook,myPlan.target)}</p>
            <p style={{margin:'2px 0 0',fontSize:'12px',color:'#FF9933'}}>📅 {new Date(myPlan.targetDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
          </div>
          {todaySched && !todaySched.done && (
            <div style={{background:'#f0fdf4',borderRadius:'12px',padding:'12px 14px',marginBottom:'12px',border:'1px solid #86efac'}}>
              <p style={{margin:'0 0 4px',fontSize:'12px',fontWeight:'bold',color:'#22c55e'}}>📅 Today's Target</p>
              <p style={{margin:0,fontSize:'13px',color:'#2D2D2D'}}>{posLabel(selBook,todaySched.from)} → {posLabel(selBook,todaySched.to)}</p>
            </div>
          )}
          {todaySched?.done && (
            <div style={{background:'#f0fdf4',borderRadius:'12px',padding:'12px 14px',marginBottom:'12px',border:'1px solid #86efac'}}>
              <p style={{margin:0,fontSize:'13px',color:'#22c55e',fontWeight:'bold'}}>✅ Today's reading logged!</p>
            </div>
          )}
          <div style={{display:'flex',gap:'10px'}}>
            <button onClick={()=>setView('schedule')} style={{flex:1,padding:'12px',borderRadius:'999px',background:'#FFF0E0',border:'none',color:'#FF9933',fontSize:'13px',cursor:'pointer',fontFamily:'Georgia, serif',fontWeight:'bold'}}>📅 Schedule</button>
            <button onClick={()=>{
              if(selBook?.type==='canto'){setLCanto(todaySched?.from?.canto||1);setLCh(todaySched?.from?.chapter||1);setLFromV(todaySched?.from?.verse||1);setLToV(todaySched?.to?.verse||1);}
              else{setLCh(todaySched?.from?.chapter||1);setLFromV(todaySched?.from?.verse||1);setLToV(todaySched?.to?.verse||1);}
              setView('log');
            }} style={{flex:1,padding:'12px',borderRadius:'999px',background:'linear-gradient(135deg,#FF9933,#FFD700)',border:'none',color:'white',fontSize:'13px',cursor:'pointer',fontFamily:'Georgia, serif',fontWeight:'bold'}}>✏️ Log Reading</button>
          </div>
        </div>

        <h2 style={{color:'#2D2D2D',fontSize:'16px',margin:'16px 0 12px'}}>🌸 Sangha Reading Progress</h2>
        {Object.entries(members).map(([uid,m])=>{
          const mp=m.reading_plan; if(!mp) return null;
          const md=(mp.schedule||[]).filter(s=>s.done).length;
          const mt=(mp.schedule||[]).length;
          const mpct=mt>0?Math.round((md/mt)*100):0;
          return(
            <div key={uid} style={card}>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#FF9933,#FFD700)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'bold',fontSize:'15px'}}>{m.name.charAt(0).toUpperCase()}</div>
                <div style={{flex:1}}>
                  <p style={{margin:0,fontSize:'14px',color:'#2D2D2D',fontWeight:'bold'}}>{m.name}{uid===userId?' (You)':''}</p>
                  <p style={{margin:0,fontSize:'12px',color:'#6B6B6B'}}>{mp.bookIcon} {mp.bookTitle}</p>
                </div>
                <span style={{fontSize:'14px',fontWeight:'bold',color:'#FF9933'}}>{mpct}%</span>
              </div>
              <div style={{background:'#FFF0E0',borderRadius:'999px',height:'6px'}}>
                <div style={{background:'linear-gradient(90deg,#FF9933,#FFD700)',borderRadius:'999px',height:'100%',width:`${mpct}%`}}/>
              </div>
            </div>
          );
        })}
        <button onClick={()=>setView('selectBook')} style={{...btnS,marginTop:'8px'}}>🔄 Change Book / New Plan</button>
        <button onClick={deletePlan} style={{...btnS,borderColor:'#ef4444',color:'#ef4444'}}>🗑️ Delete Plan</button>
      </>)}
    </div>
  </>);

  // ════════════════ SELECT BOOK ════════════════
  if (view==='selectBook') return wrap(<>
    <Header title="Select a Book" sub="All books from Vedabase.io" back={()=>setView('home')}/>
    <div style={{padding:'0 20px'}}>
      {BOOKS.map(book=>(
        <button key={book.id} onClick={()=>initBook(book)}
          style={{width:'100%',background:'white',borderRadius:'18px',padding:'16px',marginBottom:'10px',border:'1px solid rgba(255,153,51,0.2)',display:'flex',alignItems:'center',gap:'14px',cursor:'pointer',fontFamily:'Georgia, serif',boxShadow:'0 2px 12px rgba(255,153,51,0.07)',textAlign:'left'}}>
          <span style={{fontSize:'30px',flexShrink:0}}>{book.icon}</span>
          <div style={{flex:1}}>
            <p style={{margin:'0 0 3px',fontSize:'15px',color:'#2D2D2D',fontWeight:'bold'}}>{book.title}</p>
            <p style={{margin:0,fontSize:'12px',color:'#FF9933'}}>{book.description}</p>
            {book.type==='canto' && <p style={{margin:'3px 0 0',fontSize:'11px',color:'#6B6B6B'}}>Has {book.cantoLabel||'Canto'} → Chapter → Verse structure</p>}
          </div>
          <span style={{color:'#FF9933',fontSize:'20px',flexShrink:0}}>›</span>
        </button>
      ))}
    </div>
  </>);

  // ════════════════ SETUP PLAN ════════════════
  if (view==='setup') return wrap(<>
    <Header title={`${selBook?.icon} ${selBook?.title}`} sub="Set your reading plan" back={()=>setView('selectBook')}/>
    <div style={{padding:'0 20px'}}>
      <div style={card}>
        <h3 style={{margin:'0 0 4px',fontSize:'16px',color:'#FF9933'}}>📍 Where are you now?</h3>
        <p style={{margin:'0 0 14px',fontSize:'13px',color:'#6B6B6B'}}>Select your current position in the book</p>
        {selBook?.type==='canto'
          ? <CantoSelector book={selBook} canto={sCanto} setCanto={setSCanto} ch={sCh} setCh={setSCh} verse={sV} setVerse={setSV} prefix="Current"/>
          : <SimpleSelector book={selBook} ch={sCh} setCh={setSCh} verse={sV} setVerse={setSV} prefix="Current"/>
        }
      </div>
      <div style={card}>
        <h3 style={{margin:'0 0 4px',fontSize:'16px',color:'#FF9933'}}>🎯 What is your target?</h3>
        <p style={{margin:'0 0 14px',fontSize:'13px',color:'#6B6B6B'}}>Where do you want to reach?</p>
        {selBook?.type==='canto'
          ? <CantoSelector book={selBook} canto={tCanto} setCanto={setTCanto} ch={tCh} setCh={setTCh} verse={tV} setVerse={setTV} prefix="Target"/>
          : <SimpleSelector book={selBook} ch={tCh} setCh={setTCh} verse={tV} setVerse={setTV} prefix="Target"/>
        }
        {lbl('Target Completion Date')}
        <input type="date" value={tDate} min={new Date().toISOString().split('T')[0]} onChange={e=>setTDate(e.target.value)} style={inp}/>
      </div>
      <button onClick={savePlan} disabled={saving||!tDate} style={{...btnP,background:saving||!tDate?'#ccc':'linear-gradient(135deg,#FF9933,#FFD700)'}}>
        {saving?'⏳ Creating Schedule...':'✨ Generate My Daily Schedule'}
      </button>
    </div>
  </>);

  // ════════════════ EDIT PLAN ════════════════
  if (view==='edit') return wrap(<>
    <Header title="✏️ Edit Reading Plan" sub="Update your target" back={()=>setView('home')}/>
    <div style={{padding:'0 20px'}}>
      <div style={card}>
        <h3 style={{margin:'0 0 14px',fontSize:'16px',color:'#FF9933'}}>Update Target</h3>
        {selBook?.type==='canto'
          ? <CantoSelector book={selBook} canto={tCanto} setCanto={setTCanto} ch={tCh} setCh={setTCh} verse={tV} setVerse={setTV} prefix="New Target"/>
          : <SimpleSelector book={selBook} ch={tCh} setCh={setTCh} verse={tV} setVerse={setTV} prefix="New Target"/>
        }
        {lbl('New Target Date')}
        <input type="date" value={tDate||myPlan?.targetDate} min={new Date().toISOString().split('T')[0]} onChange={e=>setTDate(e.target.value)} style={inp}/>
      </div>
      <button onClick={savePlan} disabled={saving} style={{...btnP,background:saving?'#ccc':'linear-gradient(135deg,#FF9933,#FFD700)'}}>
        {saving?'⏳ Saving...':'✅ Update Plan'}
      </button>
      <button onClick={()=>setView('selectBook')} style={btnS}>📚 Change Book Instead</button>
      <button onClick={deletePlan} style={{...btnS,borderColor:'#ef4444',color:'#ef4444'}}>🗑️ Delete Plan</button>
    </div>
  </>);

  // ════════════════ SCHEDULE ════════════════
  if (view==='schedule') return wrap(<>
    <Header title="📅 Daily Schedule" sub={myPlan?.bookTitle} back={()=>setView('home')}/>
    <div style={{padding:'0 20px'}}>
      <div style={{...card,background:'linear-gradient(135deg,#FFFAF0,#FFF5E0)'}}>
        <div style={{background:'#FFE0B0',borderRadius:'999px',height:'10px',marginBottom:'8px'}}>
          <div style={{background:'linear-gradient(90deg,#FF9933,#FFD700)',borderRadius:'999px',height:'100%',width:`${pct}%`}}/>
        </div>
        <p style={{margin:0,fontSize:'13px',color:'#6B6B6B'}}>{doneDays}/{totalDays} days · {pct}% · Target: {myPlan?.targetDate}</p>
      </div>
      {myPlan?.schedule?.map((day,i)=>{
        const isToday=day.date===todayStr, isPast=day.date<todayStr;
        return(
          <div key={i} style={{background:day.done?'#f0fdf4':isToday?'#FFFAF0':'white',borderRadius:'16px',padding:'14px 16px',marginBottom:'8px',border:day.done?'1px solid #86efac':isToday?'2px solid #FFD700':'1px solid rgba(255,153,51,0.12)',opacity:isPast&&!day.done?0.6:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{flex:1}}>
                <p style={{margin:'0 0 4px',fontSize:'13px',fontWeight:'bold',color:isToday?'#FF9933':'#2D2D2D'}}>
                  {isToday?'📅 Today':new Date(day.date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}
                </p>
                <p style={{margin:0,fontSize:'12px',color:'#6B6B6B'}}>{posLabel(selBook,day.from)} → {posLabel(selBook,day.to)}</p>
                {day.done&&day.loggedFrom&&<p style={{margin:'3px 0 0',fontSize:'11px',color:'#22c55e'}}>✅ Read: {posLabel(selBook,day.loggedFrom)} → {posLabel(selBook,day.loggedTo)}</p>}
              </div>
              <span style={{fontSize:'20px',marginLeft:'8px'}}>{day.done?'✅':isToday?'📖':isPast?'⏭️':'📿'}</span>
            </div>
          </div>
        );
      })}
    </div>
  </>);

  // ════════════════ LOG READING ════════════════
  if (view==='log') return wrap(<>
    <Header title="✏️ Log Today's Reading" sub={selBook?.title} back={()=>setView('home')}/>
    <div style={{padding:'0 20px'}}>
      {todaySched&&!todaySched.done&&(
        <div style={{background:'#FFFAF0',borderRadius:'16px',padding:'14px',marginBottom:'16px',border:'1px solid #FFD700'}}>
          <p style={{margin:'0 0 4px',fontSize:'12px',color:'#6B6B6B'}}>📅 Today's scheduled target:</p>
          <p style={{margin:0,fontSize:'14px',fontWeight:'bold',color:'#FF9933'}}>{posLabel(selBook,todaySched.from)} → {posLabel(selBook,todaySched.to)}</p>
        </div>
      )}
      <div style={card}>
        <h3 style={{margin:'0 0 14px',fontSize:'16px',color:'#2D2D2D'}}>📖 What did you actually read?</h3>
        {selBook?.type==='canto' ? (<>
          {lbl(`${selBook.cantoLabel||'Canto'}`)}
          <select value={lCanto} style={inp} onChange={e=>{const c=Number(e.target.value);setLCanto(c);const fc=Number(Object.keys(selBook.cantos[c].chapters)[0]);setLCh(fc);setLFromV(1);setLToV(1);}}>
            {Object.keys(selBook.cantos).map(Number).sort((a,b)=>a-b).map(c=><option key={c} value={c}>{selBook.cantoLabel||'Canto'} {c} — {selBook.cantos[c].title}</option>)}
          </select>
          {lbl('Chapter')}
          <select value={lCh} style={inp} onChange={e=>{setLCh(Number(e.target.value));setLFromV(1);setLToV(1);}}>
            {Object.keys(selBook.cantos[lCanto]?.chapters||{}).map(Number).sort((a,b)=>a-b).map(c=><option key={c} value={c}>Chapter {c} — {selBook.cantos[lCanto].chapters[c].title}</option>)}
          </select>
          {lbl('From Verse')}
          <select value={lFromV} style={inp} onChange={e=>setLFromV(Number(e.target.value))}>
            {Array.from({length:selBook.cantos[lCanto]?.chapters[lCh]?.verses||1},(_,i)=>i+1).map(v=><option key={v} value={v}>Verse {v}</option>)}
          </select>
          {lbl('To Verse')}
          <select value={lToV} style={inp} onChange={e=>setLToV(Number(e.target.value))}>
            {Array.from({length:selBook.cantos[lCanto]?.chapters[lCh]?.verses||1},(_,i)=>i+1).filter(v=>v>=lFromV).map(v=><option key={v} value={v}>Verse {v}</option>)}
          </select>
        </>) : (<>
          {lbl('Chapter')}
          <select value={lCh} style={inp} onChange={e=>{setLCh(Number(e.target.value));setLFromV(1);setLToV(1);}}>
            {Object.keys(selBook?.chapters||{}).map(Number).sort((a,b)=>a-b).map(c=><option key={c} value={c}>Chapter {c} — {selBook.chapters[c].title}</option>)}
          </select>
          {lbl('From Verse')}
          <select value={lFromV} style={inp} onChange={e=>setLFromV(Number(e.target.value))}>
            {Array.from({length:selBook?.chapters[lCh]?.verses||1},(_,i)=>i+1).map(v=><option key={v} value={v}>Verse {v}</option>)}
          </select>
          {lbl('To Verse')}
          <select value={lToV} style={inp} onChange={e=>setLToV(Number(e.target.value))}>
            {Array.from({length:selBook?.chapters[lCh]?.verses||1},(_,i)=>i+1).filter(v=>v>=lFromV).map(v=><option key={v} value={v}>Verse {v}</option>)}
          </select>
        </>)}
      </div>
      <div style={{background:'rgba(255,153,51,0.08)',borderRadius:'14px',padding:'12px 16px',marginBottom:'16px'}}>
        <p style={{margin:0,fontSize:'12px',color:'#6B6B6B',lineHeight:1.6}}>💡 If you read differently from your schedule, it will <strong>auto-recalculate</strong> your remaining targets!</p>
      </div>
      <button onClick={logReading} disabled={saving} style={{...btnP,background:saving?'#ccc':'linear-gradient(135deg,#FF9933,#FFD700)'}}>
        {saving?'⏳ Saving...':'🙏 Save Today\'s Reading'}
      </button>
    </div>
  </>);
}