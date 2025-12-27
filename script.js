let allSurahs = [], currentSurahId = 1;
let isMuted = localStorage.getItem('isMuted') === 'true';
const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const seekSlider = document.getElementById('seekSlider');
const notifySound = document.getElementById('notificationSound');

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

function openSurah(id, name) {
    currentSurahId = id;
    // إغلاق القائمة الجانبية إذا كانت مفتوحة
    document.getElementById('sideMenu').classList.remove('open');
    
    // إخفاء قائمة السور والفهرس الموضوعي
    document.getElementById('full-quran-view').style.display = 'none';
    document.getElementById('topics-view').style.display = 'none';
    
    // إظهار واحة عرض السورة (الآيات والمشغل)
    document.getElementById('quran-view').style.display = 'block';
    document.getElementById('current-surah-title').innerText = name;
    
    updateAudioSource();
    
    // جلب الآيات من الرابط
    fetch(`https://api.alquran.cloud/v1/surah/${id}`).then(res => res.json()).then(data => {
        document.getElementById('ayahsContainer').innerHTML = data.data.ayahs.map(a => 
            `${a.text} <span style="color:var(--gold); font-size: 1.1rem;">(${a.numberInSurah})</span>`
        ).join(' ');
    });
// داخل دالة openSurah(id, name)
if (typeof checkKhatmaProgress === "function") {
    checkKhatmaProgress(id);
}
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
let sCount = parseInt(localStorage.getItem('sebhaCount')) || 0;
let sGoal = parseInt(localStorage.getItem('sebhaGoal')) || 100;

function updateGoal() {
    sGoal = parseInt(document.getElementById('sebhaGoal').value);
    localStorage.setItem('sebhaGoal', sGoal);
    updateProgress();

    // حفظ الهدف على Firebase لو المستخدم مسجل دخول
    if (typeof saveProgress === 'function') {
        saveProgress('sebha', { count: sCount, goal: sGoal });
    }
}

function incrementSebha() {
    sCount++;
    document.getElementById('sebhaCounter').innerText = sCount;
    localStorage.setItem('sebhaCount', sCount);
    updateProgress();
    
    // حفظ التقدم على Firebase لو المستخدم مسجل دخول
    if (typeof saveProgress === 'function') {
        saveProgress('sebha', { count: sCount, goal: sGoal });
    }

    if (sCount === sGoal) {
        document.querySelector('.sebha-circle').classList.add('goal-reached');
        playNotify(); 
    }
}

function updateProgress() {
    let percent = Math.min((sCount / sGoal) * 100, 100);
    const bar = document.getElementById('sebhaBar');
    if(bar) bar.style.width = percent + "%";
}

function resetSebha() {
    if(confirm("تصفير السبحة؟")) {
        sCount = 0;
        document.getElementById('sebhaCounter').innerText = 0;
        document.querySelector('.sebha-circle').classList.remove('goal-reached');
        localStorage.setItem('sebhaCount', 0);
        updateProgress();

        // حفظ التصفير على Firebase لو المستخدم مسجل دخول
        if (typeof saveProgress === 'function') {
            saveProgress('sebha', { count: sCount, goal: sGoal });
        }
    }
}

function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now;

    if (diff <= 0) { resetSebhaAutomated(); }

    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const timerDisplay = document.getElementById('countdown-timer');
    if(timerDisplay) {
        timerDisplay.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}

function resetSebhaAutomated() {
    sCount = 0;
    document.getElementById('sebhaCounter').innerText = 0;
    localStorage.setItem('sebhaCount', 0);
    updateProgress();
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
document.getElementById('sebhaCounter').innerText = sCount;
document.getElementById('sebhaGoal').value = sGoal;
document.getElementById('muteBtn').innerText = isMuted ? "🔇" : "🔊";
updateProgress();
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
    if(audio) audio.pause(); 
    if(playBtn) playBtn.innerText = "▷";
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
    });
}

// 4. إنهاء الجزء كاملاً
function markFullJuzDone() {
    if(confirm("هل أنهيت قراءة الجزء بالكامل؟ سيتم نقلك للجزء التالي.")) {
        khatmaData.currentJuz++;
        khatmaData.lastAyahIndex = 0;
        localStorage.setItem('khatmaProgress', JSON.stringify(khatmaData));
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

const namesData = [
    { name: "الله", desc: "الاسم الجامع لكل معاني الألوهية والكمال، المستحق للعبادة وحده.", count: "ورد 2702 مرة" },
    { name: "الرحمن", desc: "واسع الرحمة الذي شملت رحمته جميع الخلائق مؤمنهم وكافرهم.", count: "ورد 57 مرة" },
    { name: "الرحيم", desc: "المنعم على المؤمنين برحمة خاصة في الدنيا والآخرة.", count: "ورد 114 مرة" },
    { name: "الملك", desc: "صاحب السلطان المطلق والمتصرف في الأكوان بلا شريك.", count: "ورد 5 مرات" },
    { name: "القدوس", desc: "المنزه عن كل نقص، الطاهر من كل عيب لا يليق بجلاله.", count: "ورد مرتين" },
    { name: "السلام", desc: "ناشر السلام، والذي سلمت ذاته وصفاته وأفعاله من كل شر.", count: "ورد مرة واحدة" },
    { name: "المؤمن", desc: "الذي يصدق عباده وعوده، وأمن خلقه من ظلمه وجوره.", count: "ورد مرة واحدة" },
    { name: "المهيمن", desc: "الرقيب الحافظ لكل شيء، المطلع على خفايا الصدور.", count: "ورد مرة واحدة" },
    { name: "العزيز", desc: "القوي الغالب الذي لا يُغلب، صاحب العزة والمنعة.", count: "ورد 92 مرة" },
    { name: "الجبار", desc: "الذي يجبر كسر القلوب، وينفذ مشيئته في خلقه قسراً وعدلاً.", count: "ورد مرة واحدة" },
    { name: "المتكبر", desc: "المنفرد بصفات العظمة والكبرياء، المتعالي عن صفات الخلق.", count: "ورد مرة واحدة" },
    { name: "الخالق", desc: "المبدع الذي أوجد الأشياء من العدم على غير مثال سابق.", count: "ورد 8 مرات" },
    { name: "البارئ", desc: "الموجد للأشياء، والمميز لبعضها عن بعض بالخلق.", count: "ورد 3 مرات" },
    { name: "المصور", desc: "الذي أعطى لكل مخلوق صورته الخاصة وهيئته المميزة.", count: "ورد مرة واحدة" },
    { name: "الغفار", desc: "كثير المغفرة، الذي يستر الذنوب ويتجاوز عن الزلات.", count: "ورد 5 مرات" },
    { name: "القهار", desc: "الغالب الذي خضعت له الرقاب وذلت له الجبابرة.", count: "ورد 6 مرات" },
    { name: "الوهاب", desc: "كثير العطايا والهبات بلا عوض ولا غرض.", count: "ورد 3 مرات" },
    { name: "الرزاق", desc: "المتكفل بأرزاق الخلائق جميعهم، قويهِم وضعيفِهم.", count: "ورد مرة واحدة" },
    { name: "الفتاح", desc: "الذي يفتح خزائن رحمته، ويقضي بين عباده بالحق.", count: "ورد مرة واحدة" },
    { name: "العليم", desc: "الذي أحاط بكل شيء علماً، لا يخفى عليه مثقال ذرة.", count: "ورد 157 مرة" },
    { name: "القابض", desc: "الذي يمسك الرزق أو الأرواح بحكمته وعدله.", count: "ثابت في السنة" },
    { name: "الباسط", desc: "الذي يوسع الرزق لمن يشاء بجوده وكرمه.", count: "ثابت في السنة" },
    { name: "الخافض", desc: "الذي يخفض الكافرين والظلمة ويذلهم.", count: "ثابت بالمعنى" },
    { name: "الرافع", desc: "الذي يرفع أولياءه بالطاعات، ويرفع أقدار المؤمنين.", count: "ثابت بالمعنى" },
    { name: "المعز", desc: "الذي يهب العزة والرفعة لمن يشاء من عباده.", count: "ورد بصيغة الفعل" },
    { name: "المذل", desc: "الذي يذل من يشاء من الجبابرة وأعداء الدين.", count: "ورد بصيغة الفعل" },
    { name: "السميع", desc: "الذي يسمع كل الأصوات، السر والعلن عنده سواء.", count: "ورد 45 مرة" },
    { name: "البصير", desc: "الذي يرى كل الأشياء، دقيقها وجليلها، لا يحجبه شيء.", count: "ورد 42 مرة" },
    { name: "الحكم", desc: "الذي يفصل بين الخلائق بالعدل، ولا راد لقضائه.", count: "ثابت في السنة" },
    { name: "العدل", desc: "المنزه عن الظلم والجور في أفعاله وأحكامه وقضائه.", count: "ثابت بالمعنى" },
    { name: "اللطيف", desc: "البر بعباده، الذي يوصل الإحسان إليهم برفق.", count: "ورد 7 مرات" },
    { name: "الخبير", desc: "العالم ببواطن الأمور وخفايا الصدور ودقائق الأشياء.", count: "ورد 45 مرة" },
    { name: "الحليم", desc: "الذي لا يعجل بالعقوبة على عباده ليعطيهم فرصة للتوبة.", count: "ورد 11 مرة" },
    { name: "العظيم", desc: "المستحق لصفات الكبرياء والجلال، الذي لا تدركه العقول.", count: "ورد 9 مرات" },
    { name: "الغفور", desc: "كثير الغفران والستر لذنوب عباده مهما عظمت.", count: "ورد 91 مرة" },
    { name: "الشكور", desc: "الذي يعطي الجزيل من الثواب على القليل من العمل.", count: "ورد 4 مرات" },
    { name: "العلي", desc: "صاحب العلو المطلق في الذات والقدر والقهر.", count: "ورد 8 مرات" },
    { name: "الكبير", desc: "الذي لا أكبر منه، عظيم الشأن والكبرياء.", count: "ورد 6 مرات" },
    { name: "الحفيظ", desc: "الذي يحفظ الخلائق من الهلاك، ويحفظ أعمال عباده.", count: "ورد 3 مرات" },
    { name: "المقيت", desc: "المقتدر الذي يعطي كل مخلوق قوته ورزقه.", count: "ورد مرة واحدة" },
    { name: "الحسيب", desc: "الكافي لعباده، والمحاسب لهم على أعمالهم.", count: "ورد 3 مرات" },
    { name: "الجليل", desc: "المتصف بصفات الجلال والكمال والعظمة.", count: "ثابت بالمعنى" },
    { name: "الكريم", desc: "كثير الخير، الذي يعطي بلا سؤال ويصفح عن الزلل.", count: "ورد 3 مرات" },
    { name: "الرقيب", desc: "الحافظ الذي لا يغيب عنه شيء، المطلع على الضمائر.", count: "ورد 3 مرات" },
    { name: "المجيب", desc: "الذي يقابل الدعاء والسؤال بالاستجابة والعطاء.", count: "ورد مرة واحدة" },
    { name: "الواسع", desc: "الذي وسع علمه ورحمته ورزقه ومغفرته كل شيء.", count: "ورد 9 مرة" },
    { name: "الحكيم", desc: "الذي يضع الأشياء في مواضعها الصحيحة بحكمته.", count: "ورد 91 مرة" },
    { name: "الودود", desc: "الذي يحب أولياءه ويتحبب إلى عباده بالنعم.", count: "ورد مرتين" },
    { name: "المجيد", desc: "عظيم الذات والصفات، واسع الكرم والجود.", count: "ورد مرتين" },
    { name: "الباعث", desc: "الذي يحيي الموتى ويبعثهم من قبورهم للحساب.", count: "ثابت بالمعنى" },
    { name: "الشهيد", desc: "الذي لا يغيب عنه شيء، المطلع على كل غيب وشهادة.", count: "ورد 18 مرة" },
    { name: "الحق", desc: "الذي لا شك في وجوده ولا في ألوهيته، ووعده حق.", count: "ورد 10 مرة" },
    { name: "الوكيل", desc: "المتولي لأمور عباده، الكفيل بأرزاقهم ومصالحهم.", count: "ورد 13 مرة" },
    { name: "القوي", desc: "صاحب القدرة الكاملة التي لا يعتريها ضعف.", count: "ورد 9 مرات" },
    { name: "المتين", desc: "شديد القوة، الذي لا تنقطع قوته ولا يلحقه تعب.", count: "ورد مرة واحدة" },
    { name: "الولي", desc: "الناصر والمؤيد لأوليائه، المتولي لشؤونهم.", count: "ورد 15 مرة" },
    { name: "الحميد", desc: "المستحق لكل حمد وثناء بجميل صفاته وأفعاله.", count: "ورد 17 مرة" },
    { name: "المحصي", desc: "الذي أحصى كل شيء بعلمه، فلا يفوته شيء.", count: "ثابت بالمعنى" },
    { name: "المبدئ", desc: "الذي بدأ خلق الأشياء وأوجدها من العدم.", count: "ورد بصيغة الفعل" },
    { name: "المعيد", desc: "الذي يعيد الخلق بعد موتهم للحساب والجزاء.", count: "ورد بصيغة الفعل" },
    { name: "المحيي", desc: "الذي يحيي الأجسام بإيجاد الأرواح فيها.", count: "ورد بصيغة الفعل" },
    { name: "المميت", desc: "الذي كتب الموت على كل حي، وقهر به عباده.", count: "ورد بصيغة الفعل" },
    { name: "الحي", desc: "الذي له الحياة الكاملة الدائمة بلا بداية ولا نهاية.", count: "ورد 5 مرات" },
    { name: "القيوم", desc: "القائم بنفسه، الغني عن غيره، المقيم لغيره.", count: "ورد 3 مرات" },
    { name: "الواجد", desc: "الذي لا يعجزه شيء، ولا يفوته مراد.", count: "ثابت بالمعنى" },
    { name: "الماجد", desc: "كثير العطاء والجود، عظيم الشأن والقدر.", count: "ثابت بالمعنى" },
    { name: "الواحد", desc: "المنفرد في ذاته وصفاته وأفعاله، لا شريك له.", count: "ورد 22 مرة" },
    { name: "الأحد", desc: "المنفرد بالوحدانية، الذي لا يتجزأ ولا شبيه له.", count: "ورد مرة واحدة" },
    { name: "الصمد", desc: "الذي تقصده الخلائق في حاجاتها، المستغني عن كل أحد.", count: "ورد مرة واحدة" },
    { name: "القادر", desc: "الذي له القدرة الشاملة، لا يعجزه شيء أراده.", count: "ورد 7 مرات" },
    { name: "المقتدر", desc: "تام القدرة الذي لا يمتنع عليه شيء، المبالغ في القدرة.", count: "ورد 4 مرات" },
    { name: "المقدم", desc: "الذي يقدم الأشياء ويضعها في مواضعها بحكمته.", count: "ثابت في السنة" },
    { name: "المؤخر", desc: "الذي يؤخر الأشياء بتقديره وحكمته البالغة.", count: "ثابت في السنة" },
    { name: "الأول", desc: "الذي ليس قبله شيء، الأزلي القديم.", count: "ورد مرة واحدة" },
    { name: "الآخر", desc: "الذي ليس بعده شيء، الباقي بعد فناء خلقه.", count: "ورد مرة واحدة" },
    { name: "الظاهر", desc: "الذي علا فوق كل شيء، والظاهر بالأدلة والبراهين.", count: "ورد مرة واحدة" },
    { name: "الباطن", desc: "المحتجب عن أبصار الخلق، العالم بالسرائر.", count: "ورد مرة واحدة" },
    { name: "الوالي", desc: "المالك للأشياء، المتصرف فيها بمشيئته وحكمته.", count: "ورد مرة واحدة" },
    { name: "المتعالي", desc: "المتنزه عن صفات المخلوقين، العالي فوق كل شيء.", count: "ورد مرة واحدة" },
    { name: "البر", desc: "كثير الإحسان والعطاء، الصادق في وعده لعباده.", count: "ورد مرة واحدة" },
    { name: "التواب", desc: "الذي يوفق عباده للتوبة ويقبلها منهم دائماً.", count: "ورد 11 مرة" },
    { name: "المنتقم", desc: "الذي يسلط العقوبة على العصاة والمجرمين عدلاً.", count: "ورد بصيغة المبالغة" },
    { name: "العفو", desc: "الذي يمحو الذنوب ويتجاوز عن السيئات فضلاً.", count: "ورد 5 مرات" },
    { name: "الرؤوف", desc: "شديد الرحمة، والرأفة هي منتهى الرحمة.", count: "ورد 10 مرة" },
    { name: "مالك الملك", desc: "المتصرف في ملكه كيف يشاء، لا راد لحكمه.", count: "ورد مرة واحدة" },
    { name: "ذو الجلال والإكرام", desc: "المستحق للتعظيم، وصاحب السعة والجود.", count: "ورد مرتين" },
    { name: "المقسط", desc: "العادل في حكمه، المنصف للمظلوم من الظالم.", count: "ثابت بالمعنى" },
    { name: "الجامع", desc: "الذي يجمع الخلائق ليوم لا ريب فيه.", count: "ورد مرتين" },
    { name: "الغني", desc: "المستغني عن كل خلق، والكل محتاج إليه.", count: "ورد 18 مرة" },
    { name: "المغني", desc: "الذي يغني من يشاء من خلقه بكرمه.", count: "ثابت بالمعنى" },
    { name: "المانع", desc: "الذي يمنع العطاء عمن يشاء حماية أو ابتلاء.", count: "ثابت بالمعنى" },
    { name: "الضار", desc: "المقدر للضر لمن يشاء من خلقه بحكمته.", count: "ثابت بالمعنى" },
    { name: "النافع", desc: "المقدر للنفع لمن يشاء من عباده بفضله.", count: "ثابت بالمعنى" },
    { name: "النور", desc: "الذي ينور السماوات والأرض بنوره وهدايته.", count: "ورد مرة واحدة" },
    { name: "الهادي", desc: "الذي يهدي الخلائق لمصالحهم، ويهدي المؤمنين للحق.", count: "ورد مرتين" },
    { name: "البديع", desc: "الذي خلق الكون في أبهى صورة بلا مثال سابق.", count: "ورد مرتين" },
    { name: "الباقي", desc: "الدائم الوجود، الذي لا يلحقه فناء.", count: "ثابت بالمعنى" },
    { name: "الوارث", desc: "الذي يبقى بعد فناء الخلق، وإليه مرجع الأشياء.", count: "ورد 3 مرات" },
    { name: "الرشيد", desc: "الذي يرشد الخلق ويدبرهم بحكمته البالغة.", count: "ثابت بالمعنى" },
    { name: "الصبور", desc: "الذي لا يعاجل العصاة بالعقوبة صبراً عليهم ليتوبوا.", count: "ثابت في السنة" }
];
const namesContainer = document.getElementById('names');

namesData.forEach(item => {
    const btn = document.createElement('button');
    btn.textContent = item.name;
    btn.style.padding = "8px 15px";
    btn.style.borderRadius = "8px";
    btn.style.border = "1px solid var(--gold)";
    btn.style.background = "var(--dark-teal)";
    btn.style.color = "white";
    btn.style.cursor = "pointer";
    btn.onclick = () => {
        alert(`${item.name}\n\n${item.desc}\n\n${item.count}`);
    };
    namesContainer.appendChild(btn);    
});
}

// نفذ عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    initNamesSection();
});
function switchMainTab(tabName) {
    document.querySelectorAll('.main-tab').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';
}