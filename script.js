let allSurahs = [], currentSurahId = 1;
let isMuted = localStorage.getItem('isMuted') === 'true';
const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const seekSlider = document.getElementById('seekSlider');
const notifySound = document.getElementById('notificationSound');
// بيانات السبحة المتعددة
let currentSebhaType = 'tasbih';
let sebhaCounters = JSON.parse(localStorage.getItem('sebhaCounters')) || {
    tasbih: { count: 0, goal: 100 },
    istighfar: { count: 0, goal: 100 },
    tahmid: { count: 0, goal: 100 },
    takbir: { count: 0, goal: 100 },
    salah: { count: 0, goal: 100 }
};
const sebhaTexts = {
    tasbih: { title: 'التسبيح', text: 'سُبْحَانَ اللَّهِ', emoji: '📿' },
    istighfar: { title: 'الاستغفار', text: 'أَسْتَغْفِرُ اللَّهَ', emoji: '🤲' },
    tahmid: { title: 'التحميد', text: 'الْحَمْدُ لِلَّهِ', emoji: '❤️' },
    takbir: { title: 'التكبير', text: 'اللَّهُ أَكْبَرُ', emoji: '☝️' },
    salah: { title: 'الصلاة على النبي', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', emoji: '🕌' }
};
// بيانات الإنجازات
let achievements = JSON.parse(localStorage.getItem('achievements')) || {
    tasbih: 0,
    istighfar: 0,
    tahmid: 0,
    takbir: 0,
    salah: 0,
    awrad: 0,
    azkar: 0,
    memberSince: null,
    
    // ✨ جديد: نظام الشارات
    badges: [],
    
    // ✨ جديد: نظام المستويات
    level: 1,
    xp: 0,
    
    // ✨ جديد: السلسلة اليومية
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    
    // ✨ جديد: إحصائيات يومية
    dailyStats: {}
};
// 🏆 قاعدة بيانات الشارات
const BADGES = {
    // شارات التسبيح
    tasbih_100: { 
        id: 'tasbih_100', 
        name: 'مسبّح مبتدئ', 
        emoji: '🥉', 
        desc: 'أكملت 100 تسبيحة', 
        requirement: 100, 
        type: 'tasbih' 
    },
    tasbih_1000: { 
        id: 'tasbih_1000', 
        name: 'مسبّح ملتزم', 
        emoji: '🥈', 
        desc: 'أكملت 1000 تسبيحة', 
        requirement: 1000, 
        type: 'tasbih' 
    },
    tasbih_10000: { 
        id: 'tasbih_10000', 
        name: 'مسبّح محترف', 
        emoji: '🥇', 
        desc: 'أكملت 10000 تسبيحة', 
        requirement: 10000, 
        type: 'tasbih' 
    },
    
    // شارات الاستغفار
    istighfar_100: { 
        id: 'istighfar_100', 
        name: 'مستغفر مبتدئ', 
        emoji: '🤲', 
        desc: 'أكملت 100 استغفار', 
        requirement: 100, 
        type: 'istighfar' 
    },
    istighfar_1000: { 
        id: 'istighfar_1000', 
        name: 'مستغفر ملتزم', 
        emoji: '💚', 
        desc: 'أكملت 1000 استغفار', 
        requirement: 1000, 
        type: 'istighfar' 
    },
    
    // شارات الختمة
    khatma_1: { 
        id: 'khatma_1', 
        name: 'ختمة أولى', 
        emoji: '📗', 
        desc: 'أكملت ختمة واحدة', 
        requirement: 30, 
        type: 'awrad' 
    },
    khatma_3: { 
        id: 'khatma_3', 
        name: 'قارئ متقن', 
        emoji: '📘', 
        desc: 'أكملت 3 ختمات', 
        requirement: 90, 
        type: 'awrad' 
    },
    khatma_10: { 
        id: 'khatma_10', 
        name: 'حافظ للقرآن', 
        emoji: '📙', 
        desc: 'أكملت 10 ختمات', 
        requirement: 300, 
        type: 'awrad' 
    },
    
    // شارات السلسلة اليومية
    streak_7: { 
        id: 'streak_7', 
        name: 'أسبوع ملتزم', 
        emoji: '🔥', 
        desc: '7 أيام متواصلة', 
        requirement: 7, 
        type: 'streak' 
    },
    streak_30: { 
        id: 'streak_30', 
        name: 'شهر كامل', 
        emoji: '⭐', 
        desc: '30 يوم متواصل', 
        requirement: 30, 
        type: 'streak' 
    },
    streak_100: { 
        id: 'streak_100', 
        name: 'أسطورة الالتزام', 
        emoji: '👑', 
        desc: '100 يوم متواصل', 
        requirement: 100, 
        type: 'streak' 
    }
};

// 📊 نظام المستويات والخبرة
const LEVELS = [
    { level: 1, xpNeeded: 0, title: 'مبتدئ' },
    { level: 2, xpNeeded: 100, title: 'طالب علم' },
    { level: 3, xpNeeded: 300, title: 'عابد' },
    { level: 4, xpNeeded: 600, title: 'ملتزم' },
    { level: 5, xpNeeded: 1000, title: 'متقن' },
    { level: 6, xpNeeded: 1500, title: 'محسن' },
    { level: 7, xpNeeded: 2500, title: 'متفوق' },
    { level: 8, xpNeeded: 4000, title: 'قدوة' },
    { level: 9, xpNeeded: 6000, title: 'مميز' },
    { level: 10, xpNeeded: 10000, title: 'أسطورة' }
];


// --- 1. القائمة الجانبية والإعدادات ---
function toggleMenu() { document.getElementById('sideMenu').classList.toggle('open'); }
function toggleMute() { 
    isMuted = !isMuted; 
    localStorage.setItem('isMuted', isMuted); 
    document.getElementById('muteBtn').innerText = isMuted ? "🔇" : "🔊"; 
}
function playNotify() { 
    if (!isMuted) { 
        notifySound.currentTime = 0; 
        notifySound.play().catch(e => console.log("Audio play failed")); 
    } 
}

// --- 2. القرآن الكريم ---
fetch('https://api.alquran.cloud/v1/surah').then(res => res.json()).then(data => { 
    allSurahs = data.data; 
    displaySurahs(allSurahs); 
});

function displaySurahs(surahs) { 
    const list = document.getElementById('surahList');
    list.innerHTML = surahs.map(s => `<div class="surah-card" onclick="openSurah(${s.number}, '${s.name}')">${s.number}. ${s.name}</div>`).join(''); 
}

function filterSurahs() { 
    const term = document.getElementById('searchInput').value; 
    displaySurahs(allSurahs.filter(s => s.name.includes(term))); 
}

let ayahTimings = []; // متغير عام لحفظ توقيت الآيات

function openSurah(id, name) {
    currentSurahId = id;
    document.getElementById('sideMenu').classList.remove('open');
    
    document.getElementById('full-quran-view').style.display = 'none';
    document.getElementById('topics-view').style.display = 'none';
    document.getElementById('quran-view').style.display = 'block';
    document.getElementById('current-surah-title').innerText = name;
    
    updateAudioSource();
    
    fetch(`https://api.alquran.cloud/v1/surah/${id}`).then(res => res.json()).then(data => {
        const ayahs = data.data.ayahs;
        
        let ayahsHTML = '';
        
        if (id !== 9 && id !== 1) {
            ayahsHTML = '<div class="basmala-separate">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>';
        }
        
        for (let i = 0; i < ayahs.length; i++) {
            let text = ayahs[i].text;
            text = text.replace(/بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ/g, '');
            text = text.replace(/بسم الله الرحمن الرحيم/g, '');
            text = text.trim();
            
            if (text.length > 0) {
                ayahsHTML += '<span class="ayah-item" data-index="' + i + '">' + text + '</span> <span style="color:var(--gold); font-size: 1.1rem;">(' + ayahs[i].numberInSurah + ')</span> ';
            }
        }
        
        document.getElementById('ayahsContainer').innerHTML = ayahsHTML;
        setupAyahHighlighting(ayahs.length);
    });

    if (typeof checkKhatmaProgress === "function") {
        checkKhatmaProgress(id);
    }
}


// دالة تمييز الآيات أثناء القراءة// دالة تمييز الآيات أثناء القراءة - نسخة بسيطة
function setupAyahHighlighting(totalAyahs) {
    const audio = document.getElementById('audioPlayer');
    let currentAyahIndex = 0;
    
    audio.ontimeupdate = () => {
        if (audio.duration) {
            // حساب تقدم الصوت
            const progress = audio.currentTime / audio.duration;
            const newAyahIndex = Math.floor(progress * totalAyahs);
            
            // لو انتقلنا لآية جديدة
            if (newAyahIndex !== currentAyahIndex && newAyahIndex < totalAyahs) {
                // إزالة التمييز من الآية السابقة
                const allAyahs = document.querySelectorAll('.ayah-item');
                if (allAyahs[currentAyahIndex]) {
                    allAyahs[currentAyahIndex].classList.remove('ayah-active');
                }
                
                // تمييز الآية الجديدة
                if (allAyahs[newAyahIndex]) {
                    allAyahs[newAyahIndex].classList.add('ayah-active');
                }
                
                currentAyahIndex = newAyahIndex;
            }
            
            // تحديث شريط التقدم
            seekSlider.value = (audio.currentTime / audio.duration) * 100;
            document.getElementById('currentTime').innerText = formatTime(audio.currentTime);
            document.getElementById('durationTime').innerText = formatTime(audio.duration);
        }
    };
    
    // إزالة التمييز عند انتهاء السورة
    audio.onended = () => {
        document.querySelectorAll('.ayah-item').forEach(el => el.classList.remove('ayah-active'));
        currentAyahIndex = 0;
    };
}



function showMain() { 
    document.getElementById('main-view').style.display = 'block'; 
    document.getElementById('quran-view').style.display = 'none'; 
    audio.pause(); 
    if(playBtn) playBtn.innerText = "▷";
}

function updateAudioSource() {
    const r = document.getElementById('reciterSelect').value;
    const srv = { 'afs': '8', 'minsh': '10', 'basit': '7', 'husr': '13', 'maher': '12', 'qtm': '11', 'yasser': '11' };
    audio.src = `https://server${srv[r]}.mp3quran.net/${r}/${currentSurahId.toString().padStart(3, '0')}.mp3`;
    if (!audio.paused) audio.play();
}

function toggleAudio() { 
    if (audio.paused) { audio.play(); playBtn.innerText = "||"; } 
    else { audio.pause(); playBtn.innerText = "▷"; } 
}

audio.ontimeupdate = () => { 
    if (audio.duration) { 
        seekSlider.value = (audio.currentTime / audio.duration) * 100; 
        document.getElementById('currentTime').innerText = formatTime(audio.currentTime); 
        document.getElementById('durationTime').innerText = formatTime(audio.duration); 
    } 
};

function seekAudio() { audio.currentTime = (seekSlider.value / 100) * audio.duration; }
function formatTime(s) { const m = Math.floor(s/60); const sc = Math.floor(s%60); return `${m}:${sc<10?'0'+sc:sc}`; }

// --- 3. قاعدة بيانات الأذكار والأدعية (موسعة ومفصلة) ---
const azkarData = {
    morning: [
        { id: "m1", text: "أعوذ بالله من الشيطان الرجيم: {اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحيطُونَ بِشَيْءٍ مِنْ عليمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ}", count: 1 },
        { id: "m2", text: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ: {قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ}", count: 3 },
        { id: "m3", text: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ: {قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ * مِنْ شَرِّ مَا خَلَقَ * وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ * وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ * وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ}", count: 3 },
        { id: "m4", text: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ: {قُلْ أَعُوذُ بِرَبِّ النَّاسِ * مَلِكِ النَّاسِ * إِلَهِ النَّاسِ * مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ * الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ * مِنَ الْجِنَّةِ وَالنَّاسِ}", count: 3 },
        { id: "m5", text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
        { id: "m5_2", text: "رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.", count: 1 },
        { id: "m5_3", text: "رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابِ فِي النَّارِ وَعَذَابِ فِي الْقَبْرِ.", count: 1 },
        { id: "m6", text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أنتَ.", count: 1 },
        { id: "m7", text: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.", count: 4 },
        { id: "m8", text: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.", count: 1 },
        { id: "m9", text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.", count: 3 },
        { id: "m10", text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.", count: 3 },
        { id: "m11", text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.", count: 1 },
        { id: "m16", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.", count: 100 },
        { id: "m17", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 10 }
    ],
    evening: [
        { id: "e1", text: "أعوذ بالله من الشيطان الرجيم (آية الكرسي)", count: 1 },
        { id: "e2", text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
        { id: "e3", text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.", count: 1 },
        { id: "e4", text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", count: 3 },
        { id: "e5", text: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.", count: 1 },
        { id: "e6", text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.", count: 7 }
    ],
    sleep: [
        { id: "s1", text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.", count: 1 },
        { id: "s2", text: "اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا.", count: 1 },
        { id: "s3", text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.", count: 1 },
        { id: "s4_1", text: "سُبْحَانَ اللَّهِ", count: 33 },
        { id: "s4_2", text: "الْحَمْدُ لِلَّهِ", count: 33 },
        { id: "s4_3", text: "اللَّهُ أَكْبَرُ", count: 34 },
        { id: "s5", text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.", count: 3 }
    ],
    afterPrayer: [
        { id: "p1", text: "أَسْتَغْفِرُ اللَّهَ", count: 3 },
        { id: "p2", text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.", count: 1 },
        { id: "p3", text: "سُبْحَانَ اللَّهِ", count: 33 },
        { id: "p4", text: "الْحَمْدُ لِلَّهِ", count: 33 },
        { id: "p5", text: "اللَّهُ أَكْبَرُ", count: 33 },
        { id: "p6", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
        { id: "p7", text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ.", count: 1 }
    ],
    generalDuas: [
        { id: "d1", text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.", count: 1 },
        { id: "d2", text: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ.", count: 1 },
        { id: "d3", text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.", count: 1 },
        { id: "d4", text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى.", count: 1 },
        { id: "d5", text: "اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي، وَارْزُقْنِي.", count: 1 },
        { id: "d6", text: "لا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.", count: 1 },
        { id: "d7", text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.", count: 10 }
    ]
};

// --- 4. وظائف الأذكار ---
function loadAzkar(cat) {
    document.getElementById('azkarCats').style.display = 'none';
    document.getElementById('azkar-content').style.display = 'block';
    const list = document.getElementById('azkarList');
    
    const titles = { 
        morning: 'أذكار الصباح', evening: 'أذكار المساء', 
        sleep: 'أذكار النوم', afterPrayer: 'بعد الصلاة',
        generalDuas: 'أدعية عامة' 
    };
    
    document.getElementById('azkar-title').innerText = titles[cat] || 'الأذكار';

    list.innerHTML = azkarData[cat].map(z => {
        let saved = localStorage.getItem(`zekr_${z.id}`);
        let cur = saved !== null ? parseInt(saved) : z.count;
        return `
            <div class="zekr-card ${cur === 0 ? 'completed' : ''}" onclick="countZekr('${z.id}')">
                <div class="zekr-text">${z.text}</div>
                <div class="zekr-counter">المتبقي: <span id="num-${z.id}">${cur}</span></div>
            </div>`;
    }).join('');
}

function countZekr(id) {
    const el = document.getElementById(`num-${id}`);
    if (!el) return;
    let c = parseInt(el.innerText);
    if (c > 0) {
        c--; el.innerText = c;
        
        // إضافة للإنجازات
        achievements.azkar++;
        
        // ✨ جديد: إضافة XP
        addXP(2); // كل ذكر من الأذكار = 2 XP
        
        // ✨ جديد: تحديث السلسلة اليومية
        updateDailyStreak();
        
        saveAchievements();
        localStorage.setItem(`zekr_${id}`, c);
        localStorage.setItem('lastAzkarUpdate', new Date().toISOString());
        if (c === 0) {
            el.closest('.zekr-card').classList.add('completed');
            playNotify(); 
        }
    }
}
function backToAzkarCats() { 
    document.getElementById('azkarCats').style.display = 'grid'; 
    document.getElementById('azkar-content').style.display = 'none'; 
}
function resetAzkarProgress() { 
    if (confirm("تصفير عدادات الأذكار؟")) { 
        // مسح عدادات الأذكار فقط
        Object.keys(localStorage).forEach(k => { 
            if (k.startsWith('zekr_')) {
                localStorage.removeItem(k); 
            }
        }); 
        
        // إعادة تحميل بدون reload
        const list = document.getElementById('azkarList');
        if(list) {
            list.innerHTML = '';
            backToAzkarCats();
        }
        
        playNotify();
        alert("✅ تم التصفير بنجاح");
    } 
}


// --- 5. السبحة والعداد التلقائي ---
// --- 5. السبحة المتعددة ---

// دالة إظهار/إخفاء القائمة المنسدلة
function toggleSebhaDropdown(event) {
    event.stopPropagation();
    document.getElementById("sebhaDropdown").classList.toggle("show-dropdown");
}

// دالة اختيار نوع السبحة
function selectSebhaType(type) {
    document.getElementById("sebhaDropdown").classList.remove("show-dropdown");
    currentSebhaType = type;
    switchMainTab('sebha');
    
    document.getElementById('sebha-categories').style.display = 'none';
    document.getElementById('sebha-main-view').style.display = 'block';
    
    updateSebhaUI();
}

// تحديث واجهة السبحة
function updateSebhaUI() {
    const data = sebhaCounters[currentSebhaType];
    const info = sebhaTexts[currentSebhaType];
    
    document.getElementById('sebha-type-title').innerText = info.emoji + ' ' + info.title;
    document.getElementById('sebha-type-text').innerText = info.text;
    document.getElementById('sebhaCounter').innerText = data.count;
    document.getElementById('sebhaGoal').value = data.goal;
    
    updateSebhaProgress();
}

// تحديث الهدف
function updateGoal() {
    const newGoal = parseInt(document.getElementById('sebhaGoal').value);
    sebhaCounters[currentSebhaType].goal = newGoal;
    saveSebhaData();
    updateSebhaProgress();
}

// زيادة العداد
function incrementSebha() {
    sebhaCounters[currentSebhaType].count++;
    document.getElementById('sebhaCounter').innerText = sebhaCounters[currentSebhaType].count;
    
    // إضافة للإنجازات
    achievements[currentSebhaType]++;
    
    // ✨ جديد: إضافة XP
    addXP(1);
    
    // ✨ جديد: تحديث السلسلة اليومية
    updateDailyStreak();
    
    saveAchievements();
    saveSebhaData();
    updateSebhaProgress();
    
    // فحص الوصول للهدف
    if (sebhaCounters[currentSebhaType].count === sebhaCounters[currentSebhaType].goal) {
        document.querySelector('.sebha-circle').classList.add('goal-reached');
        playNotify();
    }
}

// تحديث البار
function updateSebhaProgress() {
    const data = sebhaCounters[currentSebhaType];
    let percent = Math.min((data.count / data.goal) * 100, 100);
    const bar = document.getElementById('sebhaBar');
    if(bar) bar.style.width = percent + "%";
}

// تصفير السبحة الحالية
function resetSebha() {
    if(confirm("تصفير " + sebhaTexts[currentSebhaType].title + "؟")) {
        sebhaCounters[currentSebhaType].count = 0;
        document.getElementById('sebhaCounter').innerText = 0;
        document.querySelector('.sebha-circle').classList.remove('goal-reached');
        saveSebhaData();
        updateSebhaProgress();
    }
}

// حفظ بيانات السبحة
function saveSebhaData() {
    localStorage.setItem('sebhaCounters', JSON.stringify(sebhaCounters));
    
    // حفظ في السحابة
    if (typeof window.saveToCloud === 'function') {
        window.saveToCloud('sebha', sebhaCounters);
    }
}


// العودة لقائمة الأقسام
function backToSebhaCategories() {
    document.getElementById('sebha-categories').style.display = 'grid';
    document.getElementById('sebha-main-view').style.display = 'none';
}

// العداد التنازلي
function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now;

    if (diff <= 0) { resetAllSebhaAutomated(); }

    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const timerDisplay = document.getElementById('countdown-timer');
    if(timerDisplay) {
        timerDisplay.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}

// تصفير تلقائي لكل الأقسام
function resetAllSebhaAutomated() {
    Object.keys(sebhaCounters).forEach(key => {
        sebhaCounters[key].count = 0;
    });
    saveSebhaData();
}

setInterval(updateCountdown, 1000);
function switchMainTab(t) {
    // 1. تحديث الأزرار
    document.querySelectorAll('.main-nav button').forEach(b => b.classList.remove('active'));
    const activeTab = document.getElementById(t + 'Tab');
    if (activeTab) activeTab.classList.add('active');

    // 2. قائمة كل الأقسام (مع قسم الإنجازات)
    const allSections = [
        'quran-section', 
        'azkar-section', 
        'sebha-section', 
        'prayer-section', 
        'qibla-section', 
        'khatma-section',
        'achievements-section'  // ✨ مهم جداً
    ];

    // 3. إخفاء كل الأقسام وإظهار المطلوب فقط
    allSections.forEach(s => {
        const el = document.getElementById(s);
        if (el) {
            el.style.display = s.startsWith(t) ? 'block' : 'none';
        }
    });

    // 4. دوال خاصة لبعض الأقسام
    if (t === 'qibla' && typeof getQibla === 'function') getQibla();
    if (t === 'prayer' && typeof fetchPrayers === 'function') fetchPrayers();
    if (t === 'khatma' && typeof updateKhatmaUI === 'function') updateKhatmaUI();
    
    // 5. إعدادات خاصة بالقرآن
    if (t === 'quran') {
        const fullView = document.getElementById('full-quran-view');
        const topicsView = document.getElementById('topics-view');
        const quranView = document.getElementById('quran-view');

        if (fullView) fullView.style.display = 'block';
        if (topicsView) topicsView.style.display = 'none';
        if (quranView) quranView.style.display = 'none';
    }
    
    // 6. إعدادات خاصة بالسبحة
    if (t === 'sebha') {
        document.getElementById('sebha-categories').style.display = 'grid';
        document.getElementById('sebha-main-view').style.display = 'none';
    }
}

// --- 6. الوضع الداكن والخط والتبديل ---
function switchMainTab(t) {
    document.querySelectorAll('.main-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + 'Tab').classList.add('active');
    ['quran-section', 'azkar-section', 'sebha-section'].forEach(s => { 
        document.getElementById(s).style.display = s.startsWith(t) ? 'block' : 'none'; 
    });
}

function toggleDarkMode() { document.body.classList.toggle('dark-mode'); }
function changeFontSize(d) { 
    const el = document.getElementById('ayahsContainer'); 
    let s = window.getComputedStyle(el).fontSize; 
    el.style.fontSize = (parseFloat(s) + d) + 'px'; 
}

// --- تهيئة التشغيل ---
document.getElementById('muteBtn').innerText = isMuted ? "🔇" : "🔊";

updateCountdown();
let prayerTimesData = null;

// 1. جلب المواقيت بناءً على موقع المستخدم
function fetchPrayers() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const url = `https://api.aladhan.com/v1/timings?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&method=4`;
            fetch(url).then(res => res.json()).then(data => {
                prayerTimesData = data.data.timings;
                updatePrayerUI();
                startPrayerCountdown();
            });
        });
    }
}

// 2. تحديث جدول الأوقات
function updatePrayerUI() {
    if(!prayerTimesData) return;
    document.getElementById('fajr-time').innerText = prayerTimesData.Fajr;
    document.getElementById('dhuhr-time').innerText = prayerTimesData.Dhuhr;
    document.getElementById('asr-time').innerText = prayerTimesData.Asr;
    document.getElementById('maghrib-time').innerText = prayerTimesData.Maghrib;
    document.getElementById('isha-time').innerText = prayerTimesData.Isha;
}

// 3. العداد التنازلي للصلاة القادمة
function startPrayerCountdown() {
    setInterval(() => {
        if (!prayerTimesData) return;
        const now = new Date();
        const prayers = [
            {n: "الفجر", t: prayerTimesData.Fajr},
            {n: "الظهر", t: prayerTimesData.Dhuhr},
            {n: "العصر", t: prayerTimesData.Asr},
            {n: "المغرب", t: prayerTimesData.Maghrib},
            {n: "العشاء", t: prayerTimesData.Isha}
        ];

        let next = null;
        for (let p of prayers) {
            const [h, m] = p.t.split(':');
            const d = new Date(); d.setHours(h, m, 0);
            if (d > now) { next = {n: p.n, d: d}; break; }
        }

        if (!next) { // لو انتهت صلوات اليوم، الصلاة القادمة فجر الغد
            const [h, m] = prayers[0].t.split(':');
            const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(h, m, 0);
            next = {n: "الفجر", d: d};
        }

        const diff = next.d - now;
        const hh = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const mm = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const ss = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

        document.getElementById('next-prayer-name').innerText = `الصلاة القادمة: ${next.n}`;
        document.getElementById('next-prayer-timer').innerText = `${hh}:${mm}:${ss}`;
    }, 1000);
}
// --- 7. وظائف القبلة (نسخة السرعة القصوى) ---

// --- 7. وظائف القبلة (نسخة السرعة والحركة الحية) ---
let finalQiblaAngle = 0;

function getQibla() {
    if (navigator.geolocation) {
        document.getElementById('qibla-status').innerText = "جاري تحديد موقعك...";

        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // حساب زاوية مكة
            const phiK = 21.4225 * Math.PI / 180;
            const lambdaK = 39.8262 * Math.PI / 180;
            const phi = lat * Math.PI / 180;
            const lambda = lng * Math.PI / 180;
            let qDeg = Math.atan2(Math.sin(lambdaK - lambda), Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda));
            finalQiblaAngle = (qDeg * 180 / Math.PI + 360) % 360;
            
            document.getElementById('qibla-deg').innerText = Math.round(finalQiblaAngle);
            
            // تحديث الرسالة لطلب تفعيل الحساس
            document.getElementById('qibla-status').innerHTML = `
                <button onclick="askCompassPermission()" style="background:var(--gold); color:var(--dark-teal); border:none; padding:8px 15px; border-radius:10px; font-weight:bold; cursor:pointer; font-family:inherit;">
                    تفعيل حركة البوصلة 🧭
                </button>`;
        }, (err) => {
            document.getElementById('qibla-status').innerText = "يرجى تفعيل الموقع";
        }, { enableHighAccuracy: false, timeout: 5000 });
    }
}

// دالة طلب الإذن للحساسات (ضرورية لـ iOS)
function askCompassPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(state => {
                if (state === 'granted') {
                    window.addEventListener('deviceorientation', handleCompass, true);
                }
            }).catch(e => console.error(e));
    } else {
        window.addEventListener('deviceorientationabsolute', handleCompass, true);
        window.addEventListener('deviceorientation', handleCompass, true);
    }
}

function handleCompass(e) {
    let compass = e.webkitCompassHeading || (360 - e.alpha);
    if (compass === undefined) return;

    const rotateDeg = finalQiblaAngle - compass;
    const pointer = document.getElementById('compass-pointer');
    const statusText = document.getElementById('qibla-status');

    if (pointer) {
        pointer.style.transform = `translate(-50%, -100%) rotate(${rotateDeg}deg)`;

        // التحقق من الاتجاه الصحيح (فرق 5 درجات)
        const isCorrect = Math.abs(rotateDeg % 360) < 5 || Math.abs(rotateDeg % 360) > 355;
        
        if (isCorrect) {
            pointer.style.backgroundColor = "#27ae60"; 
            pointer.style.boxShadow = "0 0 15px #27ae60";
            statusText.innerHTML = "<span style='color:#27ae60; font-weight:bold;'>أنت باتجاه القبلة الآن ✅</span>";
        } else {
            pointer.style.backgroundColor = "var(--gold)";
            pointer.style.boxShadow = "none";
            statusText.innerHTML = "<span style='color:var(--gold);'>دوّر الجوال لضبط الاتجاه</span>";
        }
    }
}

// دالة التبديل الشاملة (تأكد أنها الوحيدة في الملف)
function switchMainTab(t) {
    document.querySelectorAll('.main-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + 'Tab')?.classList.add('active');

    const allSections = ['quran-section', 'azkar-section', 'sebha-section', 'prayer-section', 'qibla-section'];
    allSections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = s.startsWith(t) ? 'block' : 'none';
    });
    
    if(t === 'qibla') getQibla();
    if(t === 'prayer') fetchPrayers();
}
// دالة جلب آية اليوم بناءً على تاريخ اليوم
async function loadDailyAyah() {
    try {
        const now = new Date();
        // استخدام رقم اليوم في السنة للحصول على آية متجددة يومياً
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${dayOfYear}/ar.alafasy`);
        const data = await response.json();
        
        if(data.code === 200) {
            document.getElementById('daily-text').innerText = data.data.text;
            document.getElementById('daily-ref').innerText = `[سورة ${data.data.surah.name} - آية ${data.data.numberInSurah}]`;
        }
    } catch (error) {
        document.getElementById('daily-text').innerText = "فذكر بالقرآن من يخاف وعيد";
    }
}

// دالة نسخ الآية
function copyDailyAyah() {
    const text = document.getElementById('daily-text').innerText;
    const ref = document.getElementById('daily-ref').innerText;
    navigator.clipboard.writeText(text + " " + ref);
    alert("تم نسخ الآية بنجاح");
}

// تشغيل الدالة تلقائياً عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', loadDailyAyah);

// 1. طلب إذن الإشعارات من المستخدم
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("عذراً، متصفحك لا يدعم الإشعارات");
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            document.getElementById('notifBtn').classList.add('enabled');
            alert("تم تفعيل تنبيهات الأذان بنجاح ✅ (سيصلك الإشعار عند وقت الصلاة)");
        } else {
            alert("يجب السماح بالإشعارات لكي يعمل المنبه");
        }
    });
}

// 2. دالة إرسال الإشعار وتشغيل صوت الأذان
function triggerAzanNotification(prayerName) {
    if (Notification.permission === "granted") {
        // إرسال الإشعار المرئي
        new Notification("حقيبة المؤمن", {
            body: `حان الآن موعد أذان ${prayerName}`,
            icon: "https://cdn-icons-png.flaticon.com/512/2972/2972331.png" // أيقونة إسلامية
        });

        // تشغيل صوت الأذان
        const azan = document.getElementById('azanSound');
        if (azan) {
            azan.currentTime = 0; // البدء من أول الملف الصوتي
            azan.play().catch(e => {
                console.log("تنبيه: المتصفح يتطلب ضغطة واحدة من المستخدم في الموقع لتفعيل الصوت تلقائياً.");
            });
            
            // إيقاف الأذان تلقائياً بعد دقيقة واحدة (60000 مللي ثانية)
            setTimeout(() => {
                azan.pause();
                azan.currentTime = 0;
            }, 60000);
        }
    }
}

// 3. المحرك (يفحص كل 60 ثانية إذا كان الوقت الحالي يطابق وقت الصلاة)
setInterval(() => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                        now.getMinutes().toString().padStart(2, '0');

    // جلب أوقات الصلاة من العناصر الموجودة في صفحتك
    const prayerTimes = {
        "الفجر": document.getElementById('fajr-time')?.innerText,
        "الظهر": document.getElementById('dhuhr-time')?.innerText,
        "العصر": document.getElementById('asr-time')?.innerText,
        "المغرب": document.getElementById('maghrib-time')?.innerText,
        "العشاء": document.getElementById('isha-time')?.innerText
    };

    for (let name in prayerTimes) {
        if (prayerTimes[name] === currentTime) {
            // التحقق لمنع تكرار الإشعار في نفس الدقيقة
            if (window.lastNotifiedPrayer !== name + currentTime) {
                triggerAzanNotification(name);
                window.lastNotifiedPrayer = name + currentTime;
            }
        }
    }
}, 60000);
// دالة فتح وإغلاق القائمة المنسدلة
function toggleQuranDropdown(event) {
    event.stopPropagation();
    document.getElementById("quranDropdown").classList.toggle("show-dropdown");
}

// دالة اختيار الخيار المطلوب
// 1. تعديل دالة اختيار خيار القرآن
function selectQuranOption(option) {
    document.getElementById("quranDropdown").classList.remove("show-dropdown");
    switchMainTab('quran'); 

    const fullView = document.getElementById('full-quran-view');
    const topicsView = document.getElementById('topics-view');
    const quranView = document.getElementById('quran-view');
    const paperMushafView = document.getElementById('paper-mushaf-view');
    const searchBox = document.querySelector('.search-box');

    if (option === 'quran') {
        fullView.style.display = 'block';
        topicsView.style.display = 'none';
        quranView.style.display = 'none';
        if (paperMushafView) paperMushafView.style.display = 'none';
        if (searchBox) searchBox.style.display = 'block';
        displaySurahs(allSurahs); 
        document.getElementById('searchInput').value = '';
    } else if (option === 'paper-mushaf') {
        fullView.style.display = 'none';
        topicsView.style.display = 'none';
        quranView.style.display = 'none';
        if (searchBox) searchBox.style.display = 'none';
        openPaperMushaf();
    } else if (option === 'topics') {
        fullView.style.display = 'none';
        topicsView.style.display = 'block';
        quranView.style.display = 'none';
        if (paperMushafView) paperMushafView.style.display = 'none';
        if (searchBox) searchBox.style.display = 'none';
    }
}


// 2. إضافة دالة عرض سور القسم المختار
function showTopicSurahs(title, surahNumbers) {
    document.getElementById('full-quran-view').style.display = 'block';
    document.getElementById('topics-view').style.display = 'none';
    
    // إخفاء مربع البحث عند الدخول لقسم معين
    const searchBox = document.querySelector('.search-box');
    if (searchBox) searchBox.style.display = 'none';
    
    // إظهار زر العودة للأقسام
    let backBtn = document.getElementById('backToTopicsContainer');
    if (!backBtn) {
        // إذا لم يكن الزر موجوداً، نقوم بإنشائه برمجياً ووضعه مكان البحث
        const container = document.createElement('div');
        container.id = 'backToTopicsContainer';
        container.style.textAlign = 'center';
        container.style.margin = '20px 0';
        container.innerHTML = `<button class="modern-back-btn" onclick="returnToAllTopics()">↩ العودة لجميع الأقسام</button>`;
        searchBox.parentNode.insertBefore(container, searchBox.nextSibling);
    } else {
        backBtn.style.display = 'block';
    }
    
    const filtered = allSurahs.filter(s => surahNumbers.includes(parseInt(s.number)));
    displaySurahs(filtered);
}

// دالة العودة التي تعيد إظهار البحث وإخفاء الزر
function returnToAllTopics() {
    document.getElementById('full-quran-view').style.display = 'none';
    document.getElementById('topics-view').style.display = 'block';
    document.getElementById('backToTopicsContainer').style.display = 'none';
    document.querySelector('.search-box').style.display = 'block';
}


// 3. تعديل دالة العودية (showMain)
function showMain() { 
    document.getElementById('full-quran-view').style.display = 'block'; 
    document.getElementById('quran-view').style.display = 'none'; 
    document.getElementById('topics-view').style.display = 'none';
    
    if(audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    
    if(playBtn) playBtn.innerText = "▷";
    
    // مسح التمييزات
    document.querySelectorAll('.ayah-active').forEach(el => el.classList.remove('ayah-active'));
}

function switchMainTab(t) {
    // 1. تحديث شكل الأزرار في القائمة العلوية
    document.querySelectorAll('.main-nav button').forEach(b => {
        b.classList.remove('active');
    });
    
    // تأكد أن الـ ID الخاص بالزر يطابق (اسم القسم + Tab)
    const activeTab = document.getElementById(t + 'Tab');
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // 2. مصفوفة بكل الأقسام الرئيسية لضمان إخفاء غير المطلوب
    const allSections = [
        'quran-section', 
        'azkar-section', 
        'sebha-section', 
        'prayer-section', 
        'qibla-section'
    ];

    allSections.forEach(s => {
        const el = document.getElementById(s);
        if (el) {
            // إظهار القسم إذا كان يبدأ بنفس اسم التاب المختار، وإخفاء الباقي
            el.style.display = s.startsWith(t) ? 'block' : 'none';
        }
    });

    // 3. تشغيل الدوال الخاصة بالأقسام التي تحتاج تحديث لحظي عند الفتح
    if (t === 'qibla') {
        if (typeof getQibla === 'function') {
            getQibla(); // جلب إحداثيات القبلة
        }
    }
    
    if (t === 'prayer') {
        if (typeof fetchPrayers === 'function') {
            fetchPrayers(); // تحديث مواقيت الصلاة والعداد التنازلي
        }
    }

    // 4. ملاحظة هامة للفهرس: عند الانتقال لقسم القرآن من زر خارجي
    // نضمن دائماً ظهور المصحف الكامل وإخفاء الفهرس والقارئ كحالة افتراضية
    if (t === 'quran') {
        const fullView = document.getElementById('full-quran-view');
        const topicsView = document.getElementById('topics-view');
        const quranView = document.getElementById('quran-view');

        if (fullView) fullView.style.display = 'block';
        if (topicsView) topicsView.style.display = 'none';
        if (quranView) quranView.style.display = 'none';
    }
        // للسبحة: نعرض قائمة الاختيار
    if(t === 'sebha') {
        document.getElementById('sebha-categories').style.display = 'grid';
        document.getElementById('sebha-main-view').style.display = 'none';
    }
}
function switchMainTab(t) {
    // 1. تغيير حالة الأزرار العلوية
    document.querySelectorAll('.main-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + 'Tab')?.classList.add('active');

    // 2. قائمة الأقسام مع إضافة قسم الختمة الجديد
    const allSections = ['quran-section', 'azkar-section', 'sebha-section', 'prayer-section', 'qibla-section', 'khatma-section'];

    // 3. التبديل بين الأقسام
    allSections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = s.startsWith(t) ? 'block' : 'none';
    });

    // 4. تشغيل وظائف الأقسام الخاصة
    if (t === 'qibla') getQibla();
    if (t === 'prayer') fetchPrayers();
    if (t === 'khatma' && typeof updateKhatmaUI === 'function') updateKhatmaUI();
    
    // 5. تصفير واجهة القرآن عند العودة لها
    if (t === 'quran') {
        document.getElementById('full-quran-view').style.display = 'block';
        document.getElementById('topics-view').style.display = 'none';
        document.getElementById('quran-view').style.display = 'none';
    }
}
// بيانات الختمة
// 1. إدارة بيانات الختمة في الذاكرة
let khatmaData = JSON.parse(localStorage.getItem('khatmaProgress')) || {
    currentJuz: 1,
    lastAyahIndex: 0,
    lastUpdate: new Date().toDateString()
};

let currentJuzAyahs = [];

// 2. دالة بدء القراءة وجلب الجزء
async function startKhatmaReading() {
    document.getElementById('khatma-intro').style.display = 'none';
    document.getElementById('khatma-reading-area').style.display = 'block';
    
    const juzId = khatmaData.currentJuz;
    const displayArea = document.getElementById('khatma-ayahs-display');
    displayArea.innerHTML = "<p style='text-align:center;'>جاري جلب وردك اليومي...</p>";

    try {
        const res = await fetch(`https://api.alquran.cloud/v1/juz/${juzId}/quran-simple`);
        const data = await res.json();
        currentJuzAyahs = data.data.ayahs;
        
        displayArea.innerHTML = currentJuzAyahs.map((a, index) => {
            return `${a.text} <span class="ayah-mark" id="mark-${index}" onclick="saveCheckpoint(${index})" style="color:var(--gold); cursor:pointer; font-weight:bold; border:1px solid #ddd; padding:2px 5px; border-radius:5px; margin:0 5px; display:inline-block;">(${a.numberInSurah})</span>`;
        }).join(' ');

        // استعادة آخر نقطة توقف
        if(khatmaData.lastAyahIndex > 0) {
            saveCheckpoint(khatmaData.lastAyahIndex);
            // تمرير التصفح تلقائياً لآخر آية
            setTimeout(() => {
                const lastMark = document.getElementById(`mark-${khatmaData.lastAyahIndex}`);
                if(lastMark) lastMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    } catch (e) {
        displayArea.innerText = "تعذر تحميل الورد، تأكد من الإنترنت.";
    }
}

// 3. حفظ "علامة الوصول" وتحديث البار الداخلي
function saveCheckpoint(index) {
    const totalAyahs = currentJuzAyahs.length;
    const progress = Math.round(((index + 1) / totalAyahs) * 100);
    
    document.getElementById('juzInnerBar').style.width = progress + "%";
    document.getElementById('juz-progress-text').innerText = `تقدمك في هذا الجزء: ${progress}%`;
    
    khatmaData.lastAyahIndex = index;
    localStorage.setItem('khatmaProgress', JSON.stringify(khatmaData));

    // تمييز الأرقام (تلوين ما تم قراءته)
    const marks = document.querySelectorAll('.ayah-mark');
    marks.forEach((m, i) => {
        if(i <= index) {
            m.style.background = "var(--gold)";
            m.style.color = "white";
        } else {
            m.style.background = "transparent";
            m.style.color = "var(--gold)";
        }
        // حفظ في السحابة
if (typeof window.saveToCloud === 'function') {
    window.saveToCloud('khatma', khatmaData);
}

    });
}

// 4. إنهاء الجزء كاملاً
function markFullJuzDone() {
    if(confirm("هل أنهيت قراءة الجزء بالكامل؟ سيتم نقلك للجزء التالي.")) {
        khatmaData.currentJuz++;
        khatmaData.lastAyahIndex = 0;
        
        // إضافة للإنجازات
        achievements.awrad++;
        
        // ✨ جديد: إضافة XP (جزء كامل = 50 XP)
        addXP(50);
        
        // ✨ جديد: تحديث السلسلة اليومية
        updateDailyStreak();
        
        saveAchievements();

        
        localStorage.setItem('khatmaProgress', JSON.stringify(khatmaData));
// أضف هذا السطر
if (typeof window.saveToCloud === 'function') {
    window.saveToCloud('khatma', khatmaData);
}

        updateKhatmaUI();
        closeKhatmaReading();
    }
}


function closeKhatmaReading() {
    document.getElementById('khatma-intro').style.display = 'block';
    document.getElementById('khatma-reading-area').style.display = 'none';
}

// 5. تحديث الواجهة الرئيسية (البار الكلي)
function updateKhatmaUI() {
    const totalPercent = Math.round(((khatmaData.currentJuz - 1) / 30) * 100);
    document.getElementById('totalKhatmaBar').style.width = totalPercent + "%";
    document.getElementById('total-percent-text').innerText = `التقدم الكلي: ${totalPercent}%`;
    document.getElementById('daily-task-title').innerText = `ورد اليوم (الجزء ${khatmaData.currentJuz})`;
}
function resetAzkarAutomated() {
    Object.keys(localStorage).forEach(k => {
        if(k.startsWith('zekr_')) localStorage.removeItem(k);
    });
    loadAzkar(document.getElementById('azkar-title').dataset.cat || 'morning');
}
function checkDailyAzkarReset() {
    const last = localStorage.getItem('lastAzkarUpdate');
    const today = new Date().toDateString();
    if (!last || new Date(last).toDateString() !== today) {
        resetAzkarAutomated();
    }
}
setInterval(checkDailyAzkarReset, 60000); // كل دقيقة
checkDailyAzkarReset(); // عند التحميل
// ================= دوال قسم الإنجازات =================// ================= دوال قسم الإنجازات =================

// حفظ الإنجازات
function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(achievements));
    
    // فحص الشارات والمستويات
    checkForNewBadges();
    checkLevelUp();
    
    if (typeof window.saveToCloud === 'function') {
        window.saveToCloud('achievements', achievements);
    }
}

// ✨ دالة فحص الشارات الجديدة
function checkForNewBadges() {
    // ✨ تأكد إن المصفوفة موجودة أول
    if (!achievements.badges) {
        achievements.badges = [];
    }
    
    Object.values(BADGES).forEach(badge => {
        // تأكد إن الشارة ما حصل عليها قبل
        if (!achievements.badges.includes(badge.id)) {
 
            let earned = false;
            
            // فحص حسب النوع
            if (badge.type === 'tasbih' && achievements.tasbih >= badge.requirement) {
                earned = true;
            } else if (badge.type === 'istighfar' && achievements.istighfar >= badge.requirement) {
                earned = true;
            } else if (badge.type === 'tahmid' && achievements.tahmid >= badge.requirement) {
                earned = true;
            } else if (badge.type === 'takbir' && achievements.takbir >= badge.requirement) {
                earned = true;
            } else if (badge.type === 'salah' && achievements.salah >= badge.requirement) {
                earned = true;
            } else if (badge.type === 'awrad' && achievements.awrad >= badge.requirement) {
                earned = true;
            } else if (badge.type === 'streak' && achievements.currentStreak >= badge.requirement) {
                earned = true;
            }
            
            // إذا حصل على الشارة
            if (earned) {
                achievements.badges.push(badge.id);
                showBadgeNotification(badge);
                playNotify();
            }
        }
    });
}

// ✨ دالة فحص الترقية في المستوى
function checkLevelUp() {
    const currentLevel = achievements.level;
    
    // حساب المستوى الجديد بناءً على الخبرة
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (achievements.xp >= LEVELS[i].xpNeeded) {
            const newLevel = LEVELS[i].level;
            
            // إذا ارتفع المستوى
            if (newLevel > currentLevel) {
                achievements.level = newLevel;
                showLevelUpNotification(newLevel, LEVELS[i].title);
                playNotify();
            }
            break;
        }
    }
}

// 🎉 إشعار الشارة الجديدة
function showBadgeNotification(badge) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
        <div class="badge-popup">
            <div class="badge-emoji">${badge.emoji}</div>
            <div class="badge-title">شارة جديدة!</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-desc">${badge.desc}</div>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 4000);
}

// 🎉 إشعار الترقية
function showLevelUpNotification(level, title) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
        <div class="badge-popup level-up">
            <div class="badge-emoji">⬆️</div>
            <div class="badge-title">ترقية!</div>
            <div class="badge-name">المستوى ${level}</div>
            <div class="badge-desc">${title}</div>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 4000);
}

// ✨ إضافة خبرة (XP)
function addXP(amount) {
    achievements.xp += amount;
    saveAchievements();
}




// فتح قسم الإنجازات
function openAchievements() {
    document.getElementById('sideMenu').classList.remove('open');
    
    // إخفاء كل الأقسام
    const allSections = ['quran-section', 'azkar-section', 'sebha-section', 'prayer-section', 'qibla-section', 'khatma-section'];
    allSections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });
    
    // إظهار قسم الإنجازات
    document.getElementById('achievements-section').style.display = 'block';
    
    // تحديث البيانات
    updateAchievementsUI();
}

// إغلاق قسم الإنجازات
function closeAchievements() {
    document.getElementById('achievements-section').style.display = 'none';
    switchMainTab('quran');
}

// تحديث واجهة الإنجازات
// تحديث واجهة الإنجازات
function updateAchievementsUI() {
    // ✨ جديد: عرض المستوى والـ XP
    const currentLevelData = LEVELS.find(l => l.level === achievements.level) || LEVELS[0];
    const nextLevelData = LEVELS.find(l => l.level === achievements.level + 1);
    
    document.getElementById('current-level-title').innerText = `${currentLevelData.title} - المستوى ${achievements.level}`;
    document.getElementById('current-level-xp').innerText = `${achievements.xp.toLocaleString()} XP`;
    
    // حساب تقدم المستوى
    if (nextLevelData) {
        const currentXP = achievements.xp - currentLevelData.xpNeeded;
        const neededXP = nextLevelData.xpNeeded - currentLevelData.xpNeeded;
        const progress = (currentXP / neededXP) * 100;
        
        document.getElementById('level-progress-bar').style.width = Math.min(progress, 100) + '%';
        document.getElementById('next-level-text').innerText = `${nextLevelData.xpNeeded - achievements.xp} XP للمستوى التالي`;
    } else {
        document.getElementById('level-progress-bar').style.width = '100%';
        document.getElementById('next-level-text').innerText = 'وصلت للمستوى الأعلى! 👑';
    }
    
    // ✨ جديد: عرض السلسلة اليومية
    document.getElementById('current-streak-display').innerText = achievements.currentStreak;
    document.getElementById('longest-streak-display').innerText = achievements.longestStreak;
    
    // ✨ جديد: عرض الشارات
    const badgesContainer = document.getElementById('badges-display');
    if (achievements.badges && achievements.badges.length > 0) {
        badgesContainer.innerHTML = achievements.badges.map(badgeId => {
            const badge = BADGES[badgeId];
            if (!badge) return '';
            return `
                <div style="background: white; border: 2px solid var(--gold); border-radius: 12px; padding: 15px; text-align: center; min-width: 120px;">
                    <div style="font-size: 2.5rem;">${badge.emoji}</div>
                    <div style="font-size: 0.9rem; font-weight: bold; color: var(--dark-teal); margin-top: 5px;">${badge.name}</div>
                    <div style="font-size: 0.75rem; color: #666; margin-top: 3px;">${badge.desc}</div>
                </div>
            `;
        }).join('');
    } else {
        badgesContainer.innerHTML = '<p style="color: #999; width: 100%; text-align: center;">لم تحصل على أي شارة بعد</p>';
    }
    
    // عرض الإحصائيات
    document.getElementById('total-tasbih').innerText = achievements.tasbih.toLocaleString();
    document.getElementById('total-istighfar').innerText = achievements.istighfar.toLocaleString();
    document.getElementById('total-tahmid').innerText = achievements.tahmid.toLocaleString();
    document.getElementById('total-takbir').innerText = achievements.takbir.toLocaleString();
    document.getElementById('total-salah').innerText = achievements.salah.toLocaleString();
    document.getElementById('total-awrad').innerText = achievements.awrad.toLocaleString();
    document.getElementById('total-azkar').innerText = achievements.azkar.toLocaleString();
    
    // عرض تاريخ التسجيل
    if (achievements.memberSince) {
        const memberDate = new Date(achievements.memberSince);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('member-since').innerText = memberDate.toLocaleDateString('ar-SA', options);
        
        // حساب عدد الأيام
        const now = new Date();
        const diffTime = Math.abs(now - memberDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        document.getElementById('days-count').innerText = diffDays.toLocaleString();
    } else {
        document.getElementById('member-since').innerText = 'غير مسجل';
        document.getElementById('days-count').innerText = '0';
    }
}

// ✨ تحديث السلسلة اليومية
function updateDailyStreak() {
    const today = new Date().toDateString();
    const lastDate = achievements.lastActiveDate;
    
    // أول مرة
    if (!lastDate) {
        achievements.currentStreak = 1;
        achievements.longestStreak = 1;
        achievements.lastActiveDate = today;
        
        // تسجيل في الإحصائيات اليومية
        if (!achievements.dailyStats[today]) {
            achievements.dailyStats[today] = {
                tasbih: 0,
                istighfar: 0,
                azkar: 0,
                awrad: 0
            };
        }
        return;
    }
    
    // إذا آخر نشاط كان اليوم، ما نزيد الـ streak
    if (lastDate === today) {
        return;
    }
    
    // حساب الفرق بالأيام
    const lastDateObj = new Date(lastDate);
    const todayObj = new Date(today);
    const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        // يوم متواصل
        achievements.currentStreak++;
        
        // تحديث أطول سلسلة
        if (achievements.currentStreak > achievements.longestStreak) {
            achievements.longestStreak = achievements.currentStreak;
        }
    } else {
        // انقطعت السلسلة
        achievements.currentStreak = 1;
    }
    
    // تحديث آخر يوم نشط
    achievements.lastActiveDate = today;
    
    // تسجيل في الإحصائيات اليومية
    if (!achievements.dailyStats[today]) {
        achievements.dailyStats[today] = {
            tasbih: 0,
            istighfar: 0,
            azkar: 0,
            awrad: 0
        };
    }
}
// ==========================================
// المصحف الورقي - Paper Mushaf
// ==========================================

let currentMushafPage = 1;
let mushafZoomLevel = 1;

function openPaperMushaf() {
    document.getElementById('sideMenu').classList.remove('open');
    
    // إخفاء كل الأقسام
    const allSections = ['quran-section', 'azkar-section', 'sebha-section', 'prayer-section', 'qibla-section', 'khatma-section', 'achievements-section'];
    allSections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });
    
    // إظهار قسم المصحف الورقي
    const paperSection = document.getElementById('paper-mushaf-section');
    if (paperSection) paperSection.style.display = 'block';
    
    const savedPage = localStorage.getItem('lastMushafPage');
    if (savedPage && savedPage >= 1 && savedPage <= 569) {
        currentMushafPage = parseInt(savedPage);
    } else {
        currentMushafPage = 1;
    }
    
    loadMushafPage(currentMushafPage);
}

function closePaperMushaf() {
    document.getElementById('paper-mushaf-section').style.display = 'none';
    switchMainTab('quran');
}


function loadMushafPage(pageNum) {
    if (pageNum < 1 || pageNum > 569) return;
    
    currentMushafPage = pageNum;
    const img = document.getElementById('mushaf-page-img');
    const loader = document.getElementById('mushaf-loader');
    
    if (loader) loader.style.display = 'flex';
    if (img) img.style.opacity = '0.3';
    
    // حساب رقم الصورة
   const imageNumber = pageNum + 274;  // 1 + 274 = 275
    const imageName = 'IMG_' + imageNumber.toString().padStart(4, '0') + '.JPG';
    
    // المسار الصحيح (بدون نقطة، بدون سلاش في البداية)
    const newSrc = 'mushaf-pages/' + imageName;
    
    const tempImg = new Image();
    tempImg.onload = function() {
        if (img) {
            img.src = newSrc;
            img.style.opacity = '1';
        }
        if (loader) loader.style.display = 'none';
    };
    tempImg.onerror = function() {
        // لو فشل، جرّب المسار الكامل
        const fullPath = 'https://quranii8.github.io/Quran.github.io/mushaf-pages/' + imageName;
        if (img) {
            img.src = fullPath;
            img.style.opacity = '1';
        }
        if (loader) loader.style.display = 'none';
    };
    tempImg.src = newSrc;
    
    const pageNumEl = document.getElementById('mushaf-current-page');
    if (pageNumEl) pageNumEl.innerText = pageNum;
    
    localStorage.setItem('lastMushafPage', pageNum);
    resetZoomMushaf();
}



function nextMushafPage() {
    if (currentMushafPage < 569) {
        loadMushafPage(currentMushafPage + 1);
    }
}

function prevMushafPage() {
    if (currentMushafPage > 1) {
        loadMushafPage(currentMushafPage - 1);
    }
}

function jumpToMushafPage() {
    const input = document.getElementById('mushaf-page-input');
    if (input) {
        const pageNum = parseInt(input.value);
    if (pageNum >= 1 && pageNum <= 569) {
            loadMushafPage(pageNum);
            input.value = '';
        } else {
            alert('⚠️ رقم الصفحة يجب أن يكون بين 1 و569');
        }
    }
}

function zoomInMushaf() {
    if (mushafZoomLevel < 3) {
        mushafZoomLevel += 0.25;
        applyMushafZoom();
    }
}

function zoomOutMushaf() {
    if (mushafZoomLevel > 0.5) {
        mushafZoomLevel -= 0.25;
        applyMushafZoom();
    }
}

function resetZoomMushaf() {
    mushafZoomLevel = 1;
    applyMushafZoom();
}

function applyMushafZoom() {
    const img = document.getElementById('mushaf-page-img');
    if (img) {
        img.style.transform = 'scale(' + mushafZoomLevel + ')';
    }
}

function saveMushafBookmark() {
    localStorage.setItem('mushafBookmark', currentMushafPage);
    alert('✅ تم حفظ العلامة في صفحة ' + currentMushafPage);
}

function loadMushafBookmark() {
    const bookmark = localStorage.getItem('mushafBookmark');
    if (bookmark) {
        loadMushafPage(parseInt(bookmark));
    } else {
        alert('📌 لا توجد علامة محفوظة');
    }
}

function toggleMushafFullscreen() {
    const elem = document.getElementById('paper-mushaf-view');
    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}
// فتح شاشة ملء الشاشة
function openFullscreenMushaf() {
    const fullscreenView = document.getElementById('mushaf-fullscreen-view');
    const fullscreenImg = document.getElementById('mushaf-fullscreen-img');
    const normalImg = document.getElementById('mushaf-page-img');
    
    fullscreenImg.src = normalImg.src;
    fullscreenView.style.display = 'block';
    
    // منع التمرير في الخلفية
    document.body.style.overflow = 'hidden';
    
    // تفعيل السحب
    setupSwipeGestures();
}

// إغلاق شاشة ملء الشاشة
function closeFullscreenMushaf() {
    document.getElementById('mushaf-fullscreen-view').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// إعداد السحب للتنقل// إعداد السحب للت// إعداد السحب للتنقل
function setupSwipeGestures() {
    const container = document.getElementById('mushaf-fullscreen-container');
    const img = document.getElementById('mushaf-fullscreen-img');
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    let hasNavigated = false; // 🔥 جديد: لمنع التنقل المتعدد
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = true;
        hasNavigated = false; // إعادة ضبط
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
        if (!isSwiping || hasNavigated) return; // 🔥 إيقاف لو تم التنقل
        
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        
        // تأثير بصري للسحب
        img.style.transform = `translateX(${diff * 0.3}px)`;
        img.style.transition = 'none';
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        if (!isSwiping || hasNavigated) return;
        
        touchEndX = e.changedTouches[0].screenX;
        isSwiping = false;
        
        // إعادة الصورة لمكانها
        img.style.transform = 'translateX(0)';
        img.style.transition = 'transform 0.3s ease';
        
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        if (hasNavigated) return; // 🔥 منع التنقل المتكرر
        
        const swipeThreshold = 80; // 🔥 زيادة الحد الأدنى للسحب
        const diff = touchEndX - touchStartX;
        
        if (diff > swipeThreshold) {
            // سحب لليمين = الصفحة التالية
            hasNavigated = true; // 🔥 تسجيل أن التنقل تم
            nextMushafPageFullscreen();
        }
        else if (diff < -swipeThreshold) {
            // سحب لليسار = الصفحة السابقة
            hasNavigated = true; // 🔥 تسجيل أن التنقل تم
            prevMushafPageFullscreen();
        }
    }
}

// التنقل في وضع ملء الشاشة - صفحة واحدة فقط
function nextMushafPageFullscreen() {
    if (currentMushafPage < 569) {
        currentMushafPage++; // 🔥 زيادة صفحة واحدة فقط
        updateFullscreenImage();
        showPageTransition('→');
    }
}

function prevMushafPageFullscreen() {
    if (currentMushafPage > 1) {
        currentMushafPage--; // 🔥 تقليل صفحة واحدة فقط
        updateFullscreenImage();
        showPageTransition('←');
    }
}


function updateFullscreenImage() {
    const imageNumber = currentMushafPage + 274;
    const imageName = 'IMG_' + imageNumber.toString().padStart(4, '0') + '.JPG';
    const newSrc = 'mushaf-pages/' + imageName;
    
    const fullscreenImg = document.getElementById('mushaf-fullscreen-img');
    const normalImg = document.getElementById('mushaf-page-img');
    
    // تأثير fade للتنقل السلس
    fullscreenImg.style.opacity = '0.5';
    
    const tempImg = new Image();
    tempImg.onload = function() {
        fullscreenImg.src = newSrc;
        normalImg.src = newSrc;
        fullscreenImg.style.opacity = '1';
    };
    tempImg.src = newSrc;
    
    document.getElementById('mushaf-current-page').innerText = currentMushafPage;
    localStorage.setItem('lastMushafPage', currentMushafPage);
}

// إظهار رقم الصفحة عند التنقل
function showPageTransition(arrow) {
    const fullscreenView = document.getElementById('mushaf-fullscreen-view');
    
    // إزالة العنصر القديم لو موجود
    const oldIndicator = document.getElementById('page-indicator');
    if (oldIndicator) oldIndicator.remove();
    
    // إنشاء مؤشر الصفحة
    const indicator = document.createElement('div');
    indicator.id = 'page-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        font-size: 1.5rem;
        font-weight: bold;
        font-family: 'Amiri', serif;
        z-index: 100001;
        pointer-events: none;
        animation: fadeInOut 0.8s ease;
    `;
    indicator.innerText = `${arrow} ${currentMushafPage} / 569`;
    
    fullscreenView.appendChild(indicator);
    
    // إزالة بعد ثانية
    setTimeout(() => indicator.remove(), 800);
}
// ==========================================
// قسم حفظ القرآن - Hifz System
// ==========================================

// بيانات الحفظ
let hifzData = JSON.parse(localStorage.getItem('hifzData')) || {
    plan: null,
    startDate: null,
    currentPage: 1,
    completedPages: [],
    reviewedPages: {}, // 🔥 جديد: {pageNumber: lastReviewDate}
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    totalAyat: 0,
    totalReviews: 0 // 🔥 جديد
    testScores: [], // 🔥 جديد: [{date, page, score, totalWords}]
    totalTests: 0,  // 🔥 جديد
    averageScore: 0 // 🔥 جديد
};


// جدول الصفحات والآيات (مبسط - أول 10 صفحات كمثال)
// جلب معلومات الصفحة من API
async function getPageInfo(pageNumber) {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
        const data = await response.json();
        
        if (data.code === 200 && data.data.ayahs.length > 0) {
            const ayahs = data.data.ayahs;
            const firstAyah = ayahs[0];
            const lastAyah = ayahs[ayahs.length - 1];
            
            return {
                surah: firstAyah.surah.number,
                surahName: firstAyah.surah.name,
                surahEnglishName: firstAyah.surah.englishName,
                ayahStart: firstAyah.numberInSurah,
                ayahEnd: lastAyah.numberInSurah,
                totalAyahs: ayahs.length,
                ayahs: ayahs
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching page info:', error);
        return null;
    }
}


// اختيار خطة الحفظ
function selectHifzPlan(plan) {
    // تمييز الخطة المختارة
    document.querySelectorAll('.hifz-plan-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // حفظ الخطة
    hifzData.plan = plan;
    hifzData.startDate = new Date().toISOString();
    hifzData.currentPage = 1;
    saveHifzData();
    
    // الانتقال للواجهة الرئيسية بعد ثانية
    setTimeout(() => {
        document.getElementById('hifz-setup').style.display = 'none';
        document.getElementById('hifz-main').style.display = 'block';
        loadTodayHifz();
        updateHifzStats();
    }, 500);
}

// تحميل ورد اليوم
// تحميل ورد اليوم
async function loadTodayHifz() {
    if (!hifzData.plan) {
        document.getElementById('hifz-setup').style.display = 'block';
        document.getElementById('hifz-main').style.display = 'none';
        return;
    }
    
    // حساب الصفحة الحالية حسب الخطة
    const currentPage = Math.ceil(hifzData.currentPage);
    
    if (currentPage > 604) {
        document.getElementById('hifz-today-range').innerText = 'مبروك! أتممت حفظ القرآن كاملاً 🎉';
        document.getElementById('hifz-ayahs-display').innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <div style="font-size: 5rem; margin-bottom: 20px;">🎊</div>
                <h2 style="color:var(--gold); margin-bottom: 15px;">ما شاء الله!</h2>
                <p style="color:var(--dark-teal); font-size: 1.3rem;">أتممت حفظ القرآن الكريم كاملاً</p>
                <p style="color:#666; font-size: 1rem; margin-top: 20px;">بارك الله في حفظك وثبتك عليه 💚</p>
            </div>
        `;
        return;
    }
    
    // عرض loader
    const display = document.getElementById('hifz-ayahs-display');
    display.innerHTML = '<p style="text-align:center; color:#999;">⏳ جاري تحميل ورد اليوم...</p>';
    
    // جلب معلومات الصفحة
    const pageInfo = await getPageInfo(currentPage);
    
    if (!pageInfo) {
        display.innerHTML = '<p style="text-align:center; color:#e74c3c;">تعذر تحميل الورد. تأكد من الاتصال بالإنترنت.</p>';
        return;
    }
    
    // حساب عدد الآيات حسب الخطة
    let ayahsToShow = pageInfo.ayahs;
    if (hifzData.plan === 'quarter') {
        ayahsToShow = pageInfo.ayahs.slice(0, Math.ceil(pageInfo.totalAyahs / 4));
    } else if (hifzData.plan === 'half') {
        ayahsToShow = pageInfo.ayahs.slice(0, Math.ceil(pageInfo.totalAyahs / 2));
    }
    
    // عرض معلومات الورد
    document.getElementById('hifz-today-range').innerText = `صفحة ${currentPage} - ${pageInfo.surahName}`;
    document.getElementById('hifz-today-ayat-count').innerText = ayahsToShow.length;
    
    // عرض الآيات
    let html = '';
    
    // إضافة البسملة إذا كانت بداية السورة (ما عدا التوبة)
    if (pageInfo.ayahStart === 1 && pageInfo.surah !== 1 && pageInfo.surah !== 9) {
        html += `<div style="text-align:center; color:var(--gold); font-size:2rem; margin:20px 0; font-weight:bold;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>`;
    }
    
    ayahsToShow.forEach((ayah) => {
        // إزالة البسملة من النص إذا كانت موجودة
        let text = ayah.text.replace(/بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ/g, '').trim();
        
        html += `<span class="hifz-ayah">${text}</span> <span style="color:var(--gold); font-weight:bold; font-size:1.2rem; margin:0 8px;">﴿${ayah.numberInSurah}﴾</span> `;
    });
    
    display.innerHTML = html;
}


// جلب اسم السورة
async function getSurahName(surahNumber) {
    const surahNames = {
        1: 'سورة الفاتحة',
        2: 'سورة البقرة',
        3: 'سورة آل عمران',
        // سنضيف الباقي لاحقاً
    };
    return surahNames[surahNumber] || `سورة ${surahNumber}`;
}

// جلب الآيات من API
async function loadHifzAyahs(surah, start, end) {
    const display = document.getElementById('hifz-ayahs-display');
    display.innerHTML = '<p style="text-align:center; color:#999;">جاري التحميل...</p>';
    
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah}`);
        const data = await response.json();
        const ayahs = data.data.ayahs.slice(start - 1, end);
        
        let html = '';
        ayahs.forEach((ayah, index) => {
            const ayahNumber = start + index;
            html += `<span class="hifz-ayah">${ayah.text}</span> <span style="color:var(--gold); font-size:1.1rem; margin:0 10px;">(${ayahNumber})</span> `;
        });
        
        display.innerHTML = html;
        
    } catch (error) {
        display.innerHTML = '<p style="text-align:center; color:#e74c3c;">تعذر تحميل الآيات. تأكد من الاتصال بالإنترنت.</p>';
    }
}

// إتمام ورد اليوم
// إتمام ورد اليوم
async function markTodayComplete() {
    const today = new Date().toDateString();
    const currentPage = Math.ceil(hifzData.currentPage);
    
    // التحقق من عدم التكرار
    if (hifzData.lastCompletedDate === today) {
        alert('✅ لقد أتممت ورد اليوم بالفعل!\nبارك الله فيك 🌟');
        return;
    }
    
    // جلب معلومات الصفحة الحالية
    const pageInfo = await getPageInfo(currentPage);
    if (!pageInfo) {
        alert('❌ حدث خطأ، حاول مرة أخرى');
        return;
    }
    
    // حساب عدد الآيات حسب الخطة
    let ayahsCompleted = pageInfo.totalAyahs;
    if (hifzData.plan === 'quarter') {
        ayahsCompleted = Math.ceil(pageInfo.totalAyahs / 4);
    } else if (hifzData.plan === 'half') {
        ayahsCompleted = Math.ceil(pageInfo.totalAyahs / 2);
    }
    
    // تحديث البيانات
    if (!hifzData.completedPages.includes(currentPage)) {
        hifzData.completedPages.push(currentPage);
    }
    hifzData.lastCompletedDate = today;
    hifzData.totalAyat += ayahsCompleted;
    
    // حساب السلسلة
    updateStreak();
    
    // الانتقال للصفحة التالية حسب الخطة
    if (hifzData.plan === 'quarter') {
        hifzData.currentPage += 0.25;
    } else if (hifzData.plan === 'half') {
        hifzData.currentPage += 0.5;
    } else {
        hifzData.currentPage += 1;
    }
    
    saveHifzData();
    
    // إظهار تهنئة
    showHifzCelebration();
    
    // تحديث الإحصائيات
    updateHifzStats();
    
    // تحميل الورد الجديد
    setTimeout(() => {
        loadTodayHifz();
    }, 2500);
    // فحص الشارات الجديدة
    checkHifzBadges();
}
}

// تحديث السلسلة اليومية
function updateStreak() {
    const today = new Date();
    const lastDate = hifzData.lastCompletedDate ? new Date(hifzData.lastCompletedDate) : null;
    
    if (!lastDate) {
        hifzData.currentStreak = 1;
        hifzData.longestStreak = 1;
        return;
    }
    
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        hifzData.currentStreak++;
        if (hifzData.currentStreak > hifzData.longestStreak) {
            hifzData.longestStreak = hifzData.currentStreak;
        }
    } else if (diffDays > 1) {
        hifzData.currentStreak = 1;
    }
}

// تحديث الإحصائيات
// تحديث الإحصائيات
function updateHifzStats() {
    const completedPages = hifzData.completedPages.length;
    const totalPages = 604;
    const progress = Math.min((completedPages / totalPages) * 100, 100);
    
    const progressBar = document.getElementById('hifz-total-progress');
    if (progressBar) {
        progressBar.style.width = progress.toFixed(1) + '%';
        if (progress > 5) {
            progressBar.innerText = progress.toFixed(1) + '%';
        }
    }
    
    const pagesCount = document.getElementById('hifz-pages-count');
    if (pagesCount) pagesCount.innerText = completedPages;
    
    const daysCount = document.getElementById('hifz-days-count');
    if (daysCount) daysCount.innerText = hifzData.currentStreak;
    
    const ayatCount = document.getElementById('hifz-ayat-count');
    if (ayatCount) ayatCount.innerText = hifzData.totalAyat;
    
    const reviewsCount = document.getElementById('hifz-reviews-count');
    if (reviewsCount) reviewsCount.innerText = hifzData.totalReviews;
    
    const avgScore = document.getElementById('hifz-average-score');
    if (avgScore) avgScore.innerText = hifzData.averageScore + '%';
    
        const badgesCount = document.getElementById('hifz-badges-count');
    if (badgesCount && hifzData.earnedBadges) {
        badgesCount.innerText = hifzData.earnedBadges.length;
    }



// إظهار احتفالية
function showHifzCelebration() {
    const celebration = document.createElement('div');
    celebration.className = 'badge-notification';
    celebration.innerHTML = `
        <div class="badge-popup" style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white;">
            <div class="badge-emoji">🎉</div>
            <div class="badge-title">أحسنت!</div>
            <div class="badge-name">أتممت ورد اليوم</div>
            <div class="badge-desc">بارك الله في حفظك 💚</div>
        </div>
    `;
    document.body.appendChild(celebration);
    
    playNotify();
    
    setTimeout(() => celebration.remove(), 3000);
}

// حفظ البيانات
function saveHifzData() {
    localStorage.setItem('hifzData', JSON.stringify(hifzData));
    
    // حفظ في السحابة
    if (typeof window.saveToCloud === 'function') {
        window.saveToCloud('hifz', hifzData);
    }
}

// فتح الإعدادات
// فتح صفحة الإعدادات الكاملة
function openHifzSettings() {
    // إخفاء الواجهة الرئيسية
    document.getElementById('hifz-main').style.display = 'none';
    
    // إنشاء صفحة الإعدادات
    let settingsSection = document.getElementById('hifz-settings');
    if (!settingsSection) {
        settingsSection = createSettingsSection();
        document.getElementById('hifz-section').appendChild(settingsSection);
    }
    
    settingsSection.style.display = 'block';
    loadSettingsData();
}

// إنشاء صفحة الإعدادات
function createSettingsSection() {
    const section = document.createElement('div');
    section.id = 'hifz-settings';
    section.style.display = 'none';
    section.innerHTML = `
        <div class="daily-card" style="max-width: 700px; margin: 20px auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="color: var(--gold); margin: 0;">⚙️ إعدادات الحفظ</h3>
                <button onclick="closeHifzSettings()" class="modern-back-btn">↩ رجوع</button>
            </div>
            
            <!-- تغيير الخطة -->
            <div style="background: rgba(201, 176, 122, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
                <h4 style="color: var(--dark-teal); margin-bottom: 15px;">📖 خطة الحفظ</h4>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 15px;">الخطة الحالية: <strong id="current-plan-text">-</strong></p>
                
                <select id="plan-select" style="width: 100%; padding: 12px; border: 2px solid var(--gold); border-radius: 10px; font-family: 'Amiri', serif; font-size: 1rem; margin-bottom: 15px;">
                    <option value="quarter">🌱 ربع صفحة يومياً (≈ 3 آيات)</option>
                    <option value="half">🌿 نصف صفحة يومياً (≈ 6 آيات)</option>
                    <option value="full">🌳 صفحة كاملة يومياً (≈ 12 آية)</option>
                </select>
                
                <button onclick="changePlan()" style="background: var(--dark-teal); color: var(--gold); border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-family: 'Amiri', serif; font-weight: bold; width: 100%;">
                    تحديث الخطة
                </button>
            </div>
            
            <!-- إحصائيات تفصيلية -->
            <div style="background: rgba(201, 176, 122, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
                <h4 style="color: var(--dark-teal); margin-bottom: 15px;">📊 الإحصائيات التفصيلية</h4>
                
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">تاريخ البداية:</span>
                        <strong id="stats-start-date" style="color: var(--dark-teal);">-</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">مدة الحفظ:</span>
                        <strong id="stats-duration" style="color: var(--dark-teal);">-</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">أطول سلسلة:</span>
                        <strong id="stats-longest-streak" style="color: var(--dark-teal);">-</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">إجمالي الاختبارات:</span>
                        <strong id="stats-total-tests" style="color: var(--dark-teal);">-</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">أعلى درجة:</span>
                        <strong id="stats-best-score" style="color: var(--gold);">-</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                        <span style="color: #666;">الشارات المكتسبة:</span>
                        <strong id="stats-badges" style="color: var(--gold);">-</strong>
                    </div>
                </div>
            </div>
            
            <!-- تصدير البيانات -->
            <div style="background: rgba(201, 176, 122, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
                <h4 style="color: var(--dark-teal); margin-bottom: 15px;">💾 النسخ الاحتياطي</h4>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 15px;">احفظ تقدمك أو استعد بيانات سابقة</p>
                
                <div style="display: grid; gap: 10px;">
                    <button onclick="exportHifzData()" style="background: #27ae60; color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-family: 'Amiri', serif; font-weight: bold;">
                        📥 تصدير البيانات
                    </button>
                    <button onclick="importHifzData()" style="background: #3498db; color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-family: 'Amiri', serif; font-weight: bold;">
                        📤 استيراد البيانات
                    </button>
                </div>
            </div>
            
            <!-- إعادة تعيين -->
            <div style="background: rgba(231, 76, 60, 0.1); padding: 20px; border-radius: 15px; border: 2px solid #e74c3c;">
                <h4 style="color: #e74c3c; margin-bottom: 15px;">⚠️ منطقة الخطر</h4>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 15px;">إعادة تعيين كل البيانات (لا يمكن التراجع)</p>
                
                <button onclick="resetHifzData()" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-family: 'Amiri', serif; font-weight: bold; width: 100%;">
                    🗑️ مسح كل البيانات
                </button>
            </div>
            
        </div>
    `;
    return section;
}

// تحميل بيانات الإعدادات
function loadSettingsData() {
    // الخطة الحالية
    const planText = {
        'quarter': '🌱 ربع صفحة يومياً',
        'half': '🌿 نصف صفحة يومياً',
        'full': '🌳 صفحة كاملة يومياً'
    };
    document.getElementById('current-plan-text').innerText = planText[hifzData.plan] || '-';
    document.getElementById('plan-select').value = hifzData.plan;
    
    // تاريخ البداية
    if (hifzData.startDate) {
        const startDate = new Date(hifzData.startDate);
        document.getElementById('stats-start-date').innerText = startDate.toLocaleDateString('ar-SA');
        
        // مدة الحفظ
        const days = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
        document.getElementById('stats-duration').innerText = days + ' يوم';
    }
    
    // أطول سلسلة
    document.getElementById('stats-longest-streak').innerText = (hifzData.longestStreak || 0) + ' يوم 🔥';
    
    // الاختبارات
    document.getElementById('stats-total-tests').innerText = (hifzData.totalTests || 0);
    
    // أعلى درجة
    const bestScore = hifzData.testScores && hifzData.testScores.length > 0 
        ? Math.max(...hifzData.testScores.map(t => t.score))
        : 0;
    document.getElementById('stats-best-score').innerText = bestScore + '%';
    
    // الشارات
    const badgesCount = hifzData.earnedBadges ? hifzData.earnedBadges.length : 0;
    document.getElementById('stats-badges').innerText = badgesCount + ' 🏆';
}

// تغيير الخطة
function changePlan() {
    const newPlan = document.getElementById('plan-select').value;
    
    if (confirm('هل أنت متأكد من تغيير الخطة؟\n\n⚠️ سيتم الاحتفاظ بتقدمك الحالي')) {
        hifzData.plan = newPlan;
        saveHifzData();
        
        alert('✅ تم تحديث الخطة بنجاح!');
        loadSettingsData();
    }
}

// تصدير البيانات
function exportHifzData() {
    const dataStr = JSON.stringify(hifzData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `hifz-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    alert('✅ تم تصدير البيانات بنجاح!\nاحفظ الملف في مكان آمن');
}

// استيراد البيانات
function importHifzData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                if (confirm('⚠️ سيتم استبدال بياناتك الحالية\nهل أنت متأكد؟')) {
                    hifzData = importedData;
                    saveHifzData();
                    
                    alert('✅ تم استيراد البيانات بنجاح!');
                    closeHifzSettings();
                    initHifzSection();
                }
            } catch (error) {
                alert('❌ خطأ في قراءة الملف!\nتأكد من أن الملف صحيح');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// إعادة تعيين كل البيانات
function resetHifzData() {
    if (confirm('⚠️ تحذير!\n\nسيتم مسح كل بيانات الحفظ:\n- الصفحات المحفوظة\n- السلسلة اليومية\n- الاختبارات والمراجعات\n- الشارات المكتسبة\n\nهل أنت متأكد تماماً؟')) {
        if (confirm('⚠️ تأكيد نهائي!\n\nلا يمكن التراجع عن هذا الإجراء\nهل تريد المتابعة؟')) {
            // إعادة تعيين البيانات
            hifzData = {
                plan: null,
                startDate: null,
                currentPage: 1,
                completedPages: [],
                reviewedPages: {},
                currentStreak: 0,
                longestStreak: 0,
                lastCompletedDate: null,
                totalAyat: 0,
                totalReviews: 0,
                testScores: [],
                totalTests: 0,
                averageScore: 0,
                earnedBadges: []
            };
            
            saveHifzData();
            
            alert('✅ تم مسح كل البيانات\nيمكنك البدء من جديد');
            
            closeHifzSettings();
            document.getElementById('hifz-main').style.display = 'none';
            document.getElementById('hifz-setup').style.display = 'block';
        }
    }
}

// إغلاق الإعدادات
function closeHifzSettings() {
    document.getElementById('hifz-settings').style.display = 'none';
    document.getElementById('hifz-main').style.display = 'block';
    updateHifzStats();
}

// تحميل البيانات عند فتح القسم
function initHifzSection() {
    if (hifzData.plan) {
        document.getElementById('hifz-setup').style.display = 'none';
        document.getElementById('hifz-main').style.display = 'block';
        loadTodayHifz();
        updateHifzStats();
    } else {
        document.getElementById('hifz-setup').style.display = 'block';
        document.getElementById('hifz-main').style.display = 'none';
    }
}
// ==========================================
// دالة التبديل الخاصة بقسم حفظ القرآن فقط
// ==========================================

function switchToHifzSection() {
    // 1. تحديث زر حفظ القرآن
    document.querySelectorAll('.main-nav button').forEach(b => b.classList.remove('active'));
    const hifzBtn = document.getElementById('hifzTab');
    if (hifzBtn) hifzBtn.classList.add('active');

    // 2. إخفاء كل الأقسام الأخرى
    const allSections = [
        'quran-section', 
        'azkar-section', 
        'sebha-section', 
        'prayer-section', 
        'qibla-section', 
        'khatma-section',
        'achievements-section',
        'paper-mushaf-section'
    ];
    
    allSections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });

    // 3. إظهار قسم الحفظ
    const hifzSection = document.getElementById('hifz-section');
    if (hifzSection) hifzSection.style.display = 'block';

    // 4. تهيئة قسم الحفظ
    initHifzSection();
}
// ==========================================
// نظام المراجعة الذكية
// ==========================================

// حساب الصفحات التي تحتاج مراجعة
function getPagesNeedingReview() {
    const today = new Date();
    const needReview = [];
    
    hifzData.completedPages.forEach(pageNum => {
        const lastReview = hifzData.reviewedPages[pageNum];
        
        if (!lastReview) {
            // لم تتم مراجعتها أبداً
            needReview.push({ page: pageNum, priority: 10 });
        } else {
            const reviewDate = new Date(lastReview);
            const daysSinceReview = Math.floor((today - reviewDate) / (1000 * 60 * 60 * 24));
            
            // نظام Spaced Repetition
            if (daysSinceReview >= 7) {
                needReview.push({ page: pageNum, priority: 5 });
            } else if (daysSinceReview >= 3) {
                needReview.push({ page: pageNum, priority: 3 });
            } else if (daysSinceReview >= 1) {
                needReview.push({ page: pageNum, priority: 1 });
            }
        }
    });
    
    // ترتيب حسب الأولوية
    needReview.sort((a, b) => b.priority - a.priority);
    
    return needReview;
}

// اختيار صفحات للمراجعة اليومية
function selectReviewPages(count = 3) {
    const needReview = getPagesNeedingReview();
    return needReview.slice(0, count);
}

// فتح وضع المراجعة
async function startReviewMode() {
    const reviewPages = selectReviewPages(3);
    
    if (reviewPages.length === 0) {
        alert('🎉 ممتاز!\nلا توجد صفحات تحتاج مراجعة حالياً');
        return;
    }
    
    // إخفاء الواجهة الرئيسية وإظهار واجهة المراجعة
    document.getElementById('hifz-main').style.display = 'none';
    
    let reviewSection = document.getElementById('hifz-review');
    if (!reviewSection) {
        // إنشاء قسم المراجعة إذا لم يكن موجوداً
        reviewSection = createReviewSection();
        document.getElementById('hifz-section').appendChild(reviewSection);
    }
    
    reviewSection.style.display = 'block';
    
    // عرض الصفحات للمراجعة
    displayReviewPages(reviewPages);
}

// إنشاء واجهة المراجعة
function createReviewSection() {
    const section = document.createElement('div');
    section.id = 'hifz-review';
    section.style.display = 'none';
    section.innerHTML = `
        <div class="daily-card" style="max-width: 800px; margin: 20px auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: var(--gold); margin: 0;">🔁 المراجعة اليومية</h3>
                <button onclick="closeReviewMode()" class="modern-back-btn">↩ رجوع</button>
            </div>
            
            <div id="review-info" style="background: rgba(201, 176, 122, 0.1); padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                <p style="color: var(--dark-teal); font-weight: bold; margin: 5px 0;">مراجعة <span id="review-count">0</span> صفحات</p>
                <small style="color: #666;">راجع الآيات وتأكد من حفظها</small>
            </div>
            
            <div id="review-pages-container">
                <!-- الصفحات تظهر هنا -->
            </div>
        </div>
    `;
    return section;
}

// عرض الصفحات للمراجعة
async function displayReviewPages(reviewPages) {
    const container = document.getElementById('review-pages-container');
    document.getElementById('review-count').innerText = reviewPages.length;
    
    container.innerHTML = '<p style="text-align:center; color:#999;">⏳ جاري التحميل...</p>';
    
    let html = '';
    
    for (let i = 0; i < reviewPages.length; i++) {
        const item = reviewPages[i];
        const pageInfo = await getPageInfo(item.page);
        
        if (pageInfo) {
            const lastReview = hifzData.reviewedPages[item.page];
            const daysSince = lastReview ? 
                Math.floor((new Date() - new Date(lastReview)) / (1000 * 60 * 60 * 24)) : 
                'لم تتم المراجعة';
            
            html += `
                <div class="review-page-card" style="background: white; border: 2px solid var(--gold); border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h4 style="color: var(--dark-teal); margin: 0 0 5px 0;">صفحة ${item.page}</h4>
                            <small style="color: #666;">${pageInfo.surahName} - ${pageInfo.totalAyahs} آيات</small>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-size: 0.85rem; color: #999;">آخر مراجعة:</div>
                            <div style="font-size: 0.9rem; color: var(--gold); font-weight: bold;">${daysSince === 'لم تتم المراجعة' ? daysSince : daysSince + ' يوم'}</div>
                        </div>
                    </div>
                    
                    <div class="review-ayahs" style="background: #f9f9f9; padding: 20px; border-radius: 12px; font-size: 1.5rem; line-height: 2.3; text-align: justify; max-height: 300px; overflow-y: auto; font-family: 'Amiri', serif; margin-bottom: 15px;">
                        ${generateAyahsHTML(pageInfo.ayahs, pageInfo)}
                    </div>
                    
                    <div style="text-align: center;">
                        <button onclick="markPageReviewed(${item.page})" style="background: var(--dark-teal); color: var(--gold); border: none; padding: 10px 25px; border-radius: 20px; cursor: pointer; font-family: 'Amiri', serif; font-weight: bold;">
                            ✅ راجعت هذه الصفحة
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    container.innerHTML = html;
}

// توليد HTML للآيات
function generateAyahsHTML(ayahs, pageInfo) {
    let html = '';
    
    // البسملة
    if (pageInfo.ayahStart === 1 && pageInfo.surah !== 1 && pageInfo.surah !== 9) {
        html += `<div style="text-align:center; color:var(--gold); font-size:1.8rem; margin:15px 0; font-weight:bold;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>`;
    }
    
    ayahs.forEach((ayah) => {
        let text = ayah.text.replace(/بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ/g, '').trim();
        html += `<span>${text}</span> <span style="color:var(--gold); font-weight:bold; font-size:1.1rem; margin:0 8px;">﴿${ayah.numberInSurah}﴾</span> `;
    });
    
    return html;
}

// تسجيل مراجعة الصفحة
function markPageReviewed(pageNumber) {
    hifzData.reviewedPages[pageNumber] = new Date().toISOString();
    hifzData.totalReviews++;
    saveHifzData();
    
    // إزالة الكارد من القائمة
    event.target.closest('.review-page-card').style.opacity = '0.3';
    event.target.disabled = true;
    event.target.innerText = '✅ تمت المراجعة';
    
    playNotify();
    
    // التحقق من إتمام كل المراجعات
    setTimeout(() => {
        const remaining = document.querySelectorAll('.review-page-card button:not(:disabled)').length;
        if (remaining === 0) {
            showReviewCompleteCelebration();
        }
    }, 500);
}

// احتفالية إتمام المراجعة
function showReviewCompleteCelebration() {
    const celebration = document.createElement('div');
    celebration.className = 'badge-notification';
    celebration.innerHTML = `
        <div class="badge-popup" style="background: linear-gradient(135deg, #3498db, #2980b9); color: white;">
            <div class="badge-emoji">🎊</div>
            <div class="badge-title">ممتاز!</div>
            <div class="badge-name">أتممت المراجعة اليومية</div>
            <div class="badge-desc">ثبّت الله حفظك 💙</div>
        </div>
    `;
    document.body.appendChild(celebration);
    
    playNotify();
    
    setTimeout(() => {
        celebration.remove();
        closeReviewMode();
    }, 3000);
        // فحص الشارات
    checkHifzBadges();
}

// إغلاق وضع المراجعة
function closeReviewMode() {
    document.getElementById('hifz-review').style.display = 'none';
    document.getElementById('hifz-main').style.display = 'block';
    updateHifzStats();
}
// ==========================================
// نظام التسميع الذكي - Test Mode
// ==========================================

let currentTest = null; // بيانات الاختبار الحالي

// بدء وضع التسميع
async function startTestMode() {
    if (hifzData.completedPages.length === 0) {
        alert('⚠️ لا توجد صفحات محفوظة للتسميع!\nاحفظ صفحات أولاً ثم جرّب التسميع');
        return;
    }
    
    // اختيار صفحة عشوائية من المحفوظ
    const randomPage = hifzData.completedPages[Math.floor(Math.random() * hifzData.completedPages.length)];
    
    // عرض نافذة اختيار المستوى
    showDifficultySelection(randomPage);
}

// عرض نافذة اختيار الصعوبة
function showDifficultySelection(pageNumber) {
    const modal = document.createElement('div');
    modal.id = 'difficulty-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 20px; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <h3 style="color: var(--dark-teal); text-align: center; margin-bottom: 25px;">🎯 اختر مستوى الصعوبة</h3>
            
            <div style="display: grid; gap: 15px;">
                <div onclick="startTestWithDifficulty(${pageNumber}, 'easy')" style="background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; padding: 20px; border-radius: 15px; cursor: pointer; text-align: center; transition: 0.3s;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">🌱</div>
                    <h4 style="margin: 5px 0;">سهل</h4>
                    <p style="margin: 5px 0; font-size: 0.9rem; opacity: 0.9;">إخفاء 20% من الكلمات</p>
                </div>
                
                <div onclick="startTestWithDifficulty(${pageNumber}, 'medium')" style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 20px; border-radius: 15px; cursor: pointer; text-align: center; transition: 0.3s;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">⚡</div>
                    <h4 style="margin: 5px 0;">متوسط</h4>
                    <p style="margin: 5px 0; font-size: 0.9rem; opacity: 0.9;">إخفاء 50% من الكلمات</p>
                </div>
                
                <div onclick="startTestWithDifficulty(${pageNumber}, 'hard')" style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 20px; border-radius: 15px; cursor: pointer; text-align: center; transition: 0.3s;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">🔥</div>
                    <h4 style="margin: 5px 0;">صعب</h4>
                    <p style="margin: 5px 0; font-size: 0.9rem; opacity: 0.9;">إخفاء 80% من الكلمات</p>
                </div>
            </div>
            
            <button onclick="document.getElementById('difficulty-modal').remove()" style="background: #95a5a6; color: white; border: none; padding: 12px; border-radius: 10px; width: 100%; margin-top: 20px; cursor: pointer; font-family: 'Amiri', serif; font-weight: bold;">
                إلغاء
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// بدء الاختبار بمستوى معين
async function startTestWithDifficulty(pageNumber, difficulty) {
    // إغلاق النافذة
    const modal = document.getElementById('difficulty-modal');
    if (modal) modal.remove();
    
    // جلب بيانات الصفحة
    const pageInfo = await getPageInfo(pageNumber);
    if (!pageInfo) {
        alert('❌ حدث خطأ في تحميل الصفحة');
        return;
    }
    
    // إخفاء الواجهة الرئيسية
    document.getElementById('hifz-main').style.display = 'none';
    
    // إنشاء واجهة الاختبار
    let testSection = document.getElementById('hifz-test');
    if (!testSection) {
        testSection = createTestSection();
        document.getElementById('hifz-section').appendChild(testSection);
    }
    
    testSection.style.display = 'block';
    
    // إعداد الاختبار
    setupTest(pageInfo, difficulty);
}

// إنشاء واجهة الاختبار
function createTestSection() {
    const section = document.createElement('div');
    section.id = 'hifz-test';
    section.style.display = 'none';
    section.innerHTML = `
        <div class="daily-card" style="max-width: 900px; margin: 20px auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                <h3 style="color: var(--gold); margin: 0;">✍️ وضع التسميع</h3>
                <button onclick="cancelTest()" class="modern-back-btn">↩ إلغاء</button>
            </div>
            
            <div id="test-info" style="background: rgba(201, 176, 122, 0.1); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <div style="color: #666; font-size: 0.85rem;">الصفحة</div>
                        <div id="test-page-num" style="color: var(--dark-teal); font-weight: bold; font-size: 1.2rem;">-</div>
                    </div>
                    <div>
                        <div style="color: #666; font-size: 0.85rem;">المستوى</div>
                        <div id="test-difficulty" style="color: var(--gold); font-weight: bold; font-size: 1.2rem;">-</div>
                    </div>
                    <div>
                        <div style="color: #666; font-size: 0.85rem;">الكلمات المخفية</div>
                        <div id="test-hidden-count" style="color: var(--dark-teal); font-weight: bold; font-size: 1.2rem;">-</div>
                    </div>
                </div>
            </div>
            
            <div id="test-ayahs-display" style="background: white; padding: 25px; border-radius: 15px; border: 2px solid var(--gold); font-size: 1.6rem; line-height: 2.8; text-align: justify; max-height: 500px; overflow-y: auto; font-family: 'Amiri', serif;">
                <!-- الآيات تظهر هنا -->
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="checkTestAnswers()" style="background: var(--dark-teal); color: var(--gold); border: none; padding: 15px 40px; border-radius: 30px; font-size: 1.1rem; font-weight: bold; cursor: pointer; font-family: 'Amiri', serif; box-shadow: 0 4px 15px rgba(47, 95, 99, 0.3);">
                    ✅ تحقق من الإجابات
                </button>
            </div>
        </div>
    `;
    return section;
}

// إعداد الاختبار
function setupTest(pageInfo, difficulty) {
    // نسبة الإخفاء
    const hidePercentage = difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.5 : 0.8;
    
    // عرض معلومات الاختبار
    document.getElementById('test-page-num').innerText = `صفحة ${Math.ceil(hifzData.currentPage)}`;
    
    const difficultyText = difficulty === 'easy' ? '🌱 سهل' : difficulty === 'medium' ? '⚡ متوسط' : '🔥 صعب';
    document.getElementById('test-difficulty').innerText = difficultyText;
    
    // معالجة الآيات وإخفاء الكلمات
    const { html, hiddenWords } = processAyahsForTest(pageInfo, hidePercentage);
    
    document.getElementById('test-hidden-count').innerText = hiddenWords.length;
    document.getElementById('test-ayahs-display').innerHTML = html;
    
    // حفظ بيانات الاختبار
    currentTest = {
        page: Math.ceil(hifzData.currentPage),
        difficulty: difficulty,
        hiddenWords: hiddenWords,
        pageInfo: pageInfo
    };
}

// معالجة الآيات وإخفاء كلمات
function processAyahsForTest(pageInfo, hidePercentage) {
    let html = '';
    const hiddenWords = [];
    let wordIndex = 0;
    
    // البسملة
    if (pageInfo.ayahStart === 1 && pageInfo.surah !== 1 && pageInfo.surah !== 9) {
        html += `<div style="text-align:center; color:var(--gold); font-size:1.8rem; margin:15px 0; font-weight:bold;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>`;
    }
    
    pageInfo.ayahs.forEach((ayah) => {
        let text = ayah.text.replace(/بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ/g, '').trim();
        const words = text.split(' ');
        
        words.forEach(word => {
            if (word.trim().length > 0) {
                // تحديد هل نخفي الكلمة أم لا
                if (Math.random() < hidePercentage && word.length > 2) {
                    const id = `word-${wordIndex}`;
                    hiddenWords.push({ id: id, word: word.trim() });
                    html += `<input type="text" id="${id}" class="test-input" style="width: ${word.length * 20}px; min-width: 80px; max-width: 200px; border: none; border-bottom: 2px dashed var(--gold); background: rgba(201, 176, 122, 0.1); padding: 2px 8px; margin: 0 3px; text-align: center; font-family: 'Amiri', serif; font-size: 1.6rem;" placeholder="..." /> `;
                } else {
                    html += `<span>${word}</span> `;
                }
                wordIndex++;
            }
        });
        
        html += `<span style="color:var(--gold); font-weight:bold; font-size:1.2rem; margin:0 8px;">﴿${ayah.numberInSurah}﴾</span> `;
    });
    
    return { html, hiddenWords };
}

// التحقق من الإجابات
function checkTestAnswers() {
    if (!currentTest) return;
    
    let correct = 0;
    let wrong = 0;
    
    currentTest.hiddenWords.forEach(item => {
        const input = document.getElementById(item.id);
        const userAnswer = input.value.trim();
        const correctAnswer = item.word.trim();
        
        // مقارنة بسيطة (يمكن تحسينها)
        if (userAnswer === correctAnswer || removeArabicDiacritics(userAnswer) === removeArabicDiacritics(correctAnswer)) {
            input.style.background = 'rgba(46, 204, 113, 0.2)';
            input.style.borderBottom = '2px solid #27ae60';
            correct++;
        } else {
            input.style.background = 'rgba(231, 76, 60, 0.2)';
            input.style.borderBottom = '2px solid #e74c3c';
            input.value = correctAnswer; // عرض الإجابة الصحيحة
            wrong++;
        }
        input.disabled = true;
    });
    
    // حساب النتيجة
    const total = currentTest.hiddenWords.length;
    const score = Math.round((correct / total) * 100);
    
    // حفظ النتيجة
    hifzData.testScores.push({
        date: new Date().toISOString(),
        page: currentTest.page,
        score: score,
        correct: correct,
        wrong: wrong,
        total: total,
        difficulty: currentTest.difficulty
    });
    hifzData.totalTests++;
    
    // حساب المتوسط
    const totalScore = hifzData.testScores.reduce((sum, test) => sum + test.score, 0);
    hifzData.averageScore = Math.round(totalScore / hifzData.testScores.length);
    
    saveHifzData();
    
    // عرض النتيجة
    showTestResult(score, correct, wrong, total);
        // فحص الشارات
    checkHifzBadges();
}

// إزالة التشكيل للمقارنة
function removeArabicDiacritics(text) {
    return text.replace(/[\u064B-\u0652\u0670]/g, '');
}

// عرض نتيجة الاختبار
function showTestResult(score, correct, wrong, total) {
    const resultModal = document.createElement('div');
    resultModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    const emoji = score >= 90 ? '🌟' : score >= 70 ? '👍' : score >= 50 ? '💪' : '📖';
    const message = score >= 90 ? 'ممتاز!' : score >= 70 ? 'جيد جداً!' : score >= 50 ? 'جيد!' : 'راجع أكثر';
    const color = score >= 70 ? '#27ae60' : score >= 50 ? '#f39c12' : '#e74c3c';
    
    resultModal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.4);">
            <div style="font-size: 5rem; margin-bottom: 20px;">${emoji}</div>
            <h2 style="color: ${color}; margin-bottom: 15px;">${message}</h2>
            <div style="font-size: 3rem; font-weight: bold; color: var(--dark-teal); margin: 20px 0;">${score}%</div>
            
            <div style="display: flex; justify-content: space-around; margin: 25px 0; padding: 20px; background: #f9f9f9; border-radius: 12px;">
                <div>
                    <div style="color: #27ae60; font-size: 2rem; font-weight: bold;">${correct}</div>
                    <div style="color: #666; font-size: 0.9rem;">صحيح</div>
                </div>
                <div>
                    <div style="color: #e74c3c; font-size: 2rem; font-weight: bold;">${wrong}</div>
                    <div style="color: #666; font-size: 0.9rem;">خطأ</div>
                </div>
                <div>
                    <div style="color: var(--gold); font-size: 2rem; font-weight: bold;">${total}</div>
                    <div style="color: #666; font-size: 0.9rem;">المجموع</div>
                </div>
            </div>
            
            <button onclick="closeTestResult()" style="background: var(--dark-teal); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-family: 'Amiri', serif; font-weight: bold; font-size: 1.1rem; width: 100%;">
                حسناً
            </button>
        </div>
    `;
    
    resultModal.id = 'test-result-modal';
    document.body.appendChild(resultModal);
    
    playNotify();
}

// إغلاق نتيجة الاختبار
function closeTestResult() {
    const modal = document.getElementById('test-result-modal');
    if (modal) modal.remove();
    
    cancelTest();
}

// إلغاء الاختبار
function cancelTest() {
    document.getElementById('hifz-test').style.display = 'none';
    document.getElementById('hifz-main').style.display = 'block';
    currentTest = null;
    updateHifzStats();
}
// ==========================================
// شارات وإنجازات الحفظ
// ==========================================

const hifzBadges = {
    first_page: {
        id: 'first_page',
        name: 'البداية المباركة',
        emoji: '🌱',
        description: 'حفظ أول صفحة من القرآن',
        condition: (data) => data.completedPages.length >= 1
    },
    juz_30: {
        id: 'juz_30',
        name: 'حافظ جزء عم',
        emoji: '📖',
        description: 'إتمام حفظ الجزء الثلاثين',
        condition: (data) => data.completedPages.filter(p => p >= 582).length >= 22
    },
    streak_7: {
        id: 'streak_7',
        name: 'النار المشتعلة',
        emoji: '🔥',
        description: '7 أيام متواصلة في الحفظ',
        condition: (data) => data.currentStreak >= 7
    },
    streak_30: {
        id: 'streak_30',
        name: 'المثابر',
        emoji: '⚡',
        description: '30 يوم متواصل في الحفظ',
        condition: (data) => data.currentStreak >= 30
    },
    streak_100: {
        id: 'streak_100',
        name: 'الصامد',
        emoji: '💪',
        description: '100 يوم متواصل - إنجاز نادر!',
        condition: (data) => data.currentStreak >= 100
    },
    pages_50: {
        id: 'pages_50',
        name: 'الطالب المجتهد',
        emoji: '📚',
        description: 'حفظ 50 صفحة من القرآن',
        condition: (data) => data.completedPages.length >= 50
    },
    pages_100: {
        id: 'pages_100',
        name: 'النجم الساطع',
        emoji: '🌟',
        description: 'حفظ 100 صفحة من القرآن',
        condition: (data) => data.completedPages.length >= 100
    },
    pages_300: {
        id: 'pages_300',
        name: 'الماسة النفيسة',
        emoji: '💎',
        description: 'حفظ 300 صفحة - نصف القرآن!',
        condition: (data) => data.completedPages.length >= 300
    },
    full_quran: {
        id: 'full_quran',
        name: 'حافظ القرآن',
        emoji: '👑',
        description: 'إتمام حفظ القرآن الكريم كاملاً',
        condition: (data) => data.completedPages.length >= 604
    },
    perfect_test: {
        id: 'perfect_test',
        name: 'الدقة المثالية',
        emoji: '🎯',
        description: 'الحصول على 100% في التسميع',
        condition: (data) => data.testScores.some(t => t.score === 100)
    },
    reviews_50: {
        id: 'reviews_50',
        name: 'المراجع النشط',
        emoji: '🔁',
        description: 'إتمام 50 مراجعة',
        condition: (data) => data.totalReviews >= 50
    },
    hard_test: {
        id: 'hard_test',
        name: 'المتحدي الشجاع',
        emoji: '🦁',
        description: 'اجتياز اختبار صعب بنجاح (70%+)',
        condition: (data) => data.testScores.some(t => t.difficulty === 'hard' && t.score >= 70)
    }
};

// التحقق من الشارات الجديدة
function checkHifzBadges() {
    if (!hifzData.earnedBadges) {
        hifzData.earnedBadges = [];
    }
    
    const newBadges = [];
    
    Object.values(hifzBadges).forEach(badge => {
        // التحقق من عدم الحصول عليها مسبقاً
        if (!hifzData.earnedBadges.includes(badge.id)) {
            // التحقق من الشرط
            if (badge.condition(hifzData)) {
                hifzData.earnedBadges.push(badge.id);
                newBadges.push(badge);
            }
        }
    });
    
    // عرض الشارات الجديدة
    newBadges.forEach((badge, index) => {
        setTimeout(() => {
            showBadgeNotification(badge);
        }, index * 2000);
    });
    
    if (newBadges.length > 0) {
        saveHifzData();
    }
}

// عرض إشعار الشارة
function showBadgeNotification(badge) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
        <div class="badge-popup" style="background: linear-gradient(135deg, var(--dark-teal), #1a3f42); color: white; animation: slideInBounce 0.6s ease;">
            <div class="badge-emoji" style="font-size: 4rem; margin-bottom: 15px;">${badge.emoji}</div>
            <div class="badge-title" style="font-size: 1.3rem; color: var(--gold); font-weight: bold; margin-bottom: 10px;">شارة جديدة!</div>
            <div class="badge-name" style="font-size: 1.5rem; font-weight: bold; margin-bottom: 10px;">${badge.name}</div>
            <div class="badge-desc" style="font-size: 0.95rem; opacity: 0.9;">${badge.description}</div>
        </div>
    `;
    document.body.appendChild(notification);
    
    playNotify();
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// عرض كل الشارات المكتسبة
function showMyHifzBadges() {
    if (!hifzData.earnedBadges || hifzData.earnedBadges.length === 0) {
        alert('🎯 لم تكتسب أي شارات بعد!\nاستمر في الحفظ والمراجعة لكسب الشارات');
        return;
    }
    
    let badgesHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000; overflow-y: auto; padding: 20px;" onclick="this.remove()">
            <div onclick="event.stopPropagation()" style="background: white; padding: 30px; border-radius: 20px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto;">
                <h2 style="color: var(--dark-teal); text-align: center; margin-bottom: 25px;">🏆 شاراتي في الحفظ</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
    `;
    
    hifzData.earnedBadges.forEach(badgeId => {
        const badge = hifzBadges[badgeId];
        if (badge) {
            badgesHTML += `
                <div style="background: linear-gradient(135deg, var(--dark-teal), #1a3f42); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size: 3rem; margin-bottom: 10px;">${badge.emoji}</div>
                    <div style="font-weight: bold; margin-bottom: 5px; color: var(--gold);">${badge.name}</div>
                    <small style="font-size: 0.8rem; opacity: 0.9;">${badge.description}</small>
                </div>
            `;
        }
    });
    
    badgesHTML += `
                </div>
                <button onclick="this.closest('div').parentElement.remove()" style="background: var(--dark-teal); color: white; border: none; padding: 12px; border-radius: 10px; width: 100%; margin-top: 25px; cursor: pointer; font-family: 'Amiri', serif; font-weight: bold;">
                    إغلاق
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', badgesHTML);
}
