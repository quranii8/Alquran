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
    memberSince: null
};

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
    
    // جلب الآيات
    fetch(`https://api.alquran.cloud/v1/surah/${id}`).then(res => res.json()).then(data => {
        const ayahs = data.data.ayahs;
        
        // عرض الآيات بشكل طبيعي
        const ayahsHTML = ayahs.map((a, index) => {
            return `<span class="ayah-item" data-index="${index}">${a.text}</span> <span style="color:var(--gold); font-size: 1.1rem;">(${a.numberInSurah})</span> `;
        }).join('');
        
        document.getElementById('ayahsContainer').innerHTML = ayahsHTML;
        
        // جلب توقيت الآيات للقارئ الحالي
        fetchAyahTimings(id);
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
        
        // إضافة للإنجازات (كل ضغطة = +1)
        achievements.azkar++;
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
        Object.keys(localStorage).forEach(k => { if (k.startsWith('zekr_')) localStorage.removeItem(k); }); 
        location.reload(); 
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
    saveAchievements();
    
    saveSebhaData();
    updateSebhaProgress();
    
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
    const searchBox = document.querySelector('.search-box'); // تحديد مربع البحث

    if (option === 'quran') {
        fullView.style.display = 'block';
        topicsView.style.display = 'none';
        quranView.style.display = 'none';
        if (searchBox) searchBox.style.display = 'block'; // إظهار البحث في المصحف الكامل
        displaySurahs(allSurahs); 
        document.getElementById('searchInput').value = '';
    } else if (option === 'topics') {
        fullView.style.display = 'none';
        topicsView.style.display = 'block';
        quranView.style.display = 'none';
        if (searchBox) searchBox.style.display = 'none'; // إخفاء البحث في الفهرس
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
        
        // إضافة للإنجازات (ورد واحد = جزء واحد)
        achievements.awrad++;
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
    
    // حفظ في السحابة
    if (typeof window.saveToCloud === 'function') {
        window.saveToCloud('achievements', achievements);
    }
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
function updateAchievementsUI() {
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