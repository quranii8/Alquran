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
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('quran-view').style.display = 'block';
    document.getElementById('current-surah-title').innerText = name;
    updateAudioSource();
    fetch(`https://api.alquran.cloud/v1/surah/${id}`).then(res => res.json()).then(data => {
        document.getElementById('ayahsContainer').innerHTML = data.data.ayahs.map(a => `${a.text} <span style="color:var(--gold); font-size: 1.1rem;">(${a.numberInSurah})</span>`).join(' ');
    });
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
        { id: "m1", text: "أعوذ بالله من الشيطان الرجيم: {اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحيطُونَ بِشَيْءٍ مِنْ عليمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ}", count: 1 },
        { id: "m2", text: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ: {قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ}", count: 3 },
        { id: "m3", text: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ: {قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ * مِنْ شَرِّ مَا خَلَقَ * وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ * وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ * وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ}", count: 3 },
        { id: "m4", text: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ: {قُلْ أَعُوذُ بِرَبِّ النَّاسِ * مَلِكِ النَّاسِ * إِلَهِ النَّاسِ * مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ * الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ * مِنَ الْجِنَّةِ وَالنَّاسِ}", count: 3 },
        { id: "m5", text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
        { id: "m5_2", text: "رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.", count: 1 },
        { id: "m5_3", text: "رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابِ فِي النَّارِ وَعَذَابِ فِي الْقَبْرِ.", count: 1 },
        { id: "m6", text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أنتَ.", count: 1 },
        { id: "m7", text: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.", count: 4 },
        { id: "m8", text: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.", count: 1 },
        { id: "m9", text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.", count: 3 },
        { id: "m10", text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.", count: 3 },
        { id: "m11", text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.", count: 1 },
        { id: "m16", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.", count: 100 },
        { id: "m17", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 10 }
    ],
    evening: [
        { id: "e1", text: "أعوذ بالله من الشيطان الرجيم (آية الكرسي)", count: 1 },
        { id: "e2", text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
        { id: "e3", text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.", count: 1 },
        { id: "e4", text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", count: 3 },
        { id: "e5", text: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.", count: 1 },
        { id: "e6", text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.", count: 7 }
    ],
    sleep: [
        { id: "s1", text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.", count: 1 },
        { id: "s2", text: "اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا.", count: 1 },
        { id: "s3", text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.", count: 1 },
        { id: "s4_1", text: "سُبْحَانَ اللَّهِ", count: 33 },
        { id: "s4_2", text: "الْحَمْدُ لِلَّهِ", count: 33 },
        { id: "s4_3", text: "اللَّهُ أَكْبَرُ", count: 34 },
        { id: "s5", text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.", count: 3 }
    ],
    afterPrayer: [
        { id: "p1", text: "أَسْتَغْفِرُ اللَّهَ", count: 3 },
        { id: "p2", text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.", count: 1 },
        { id: "p3", text: "سُبْحَانَ اللَّهِ", count: 33 },
        { id: "p4", text: "الْحَمْدُ لِلَّهِ", count: 33 },
        { id: "p5", text: "اللَّهُ أَكْبَرُ", count: 33 },
        { id: "p6", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
        { id: "p7", text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ.", count: 1 }
    ],
    generalDuas: [
        { id: "d1", text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.", count: 1 },
        { id: "d2", text: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ.", count: 1 },
        { id: "d3", text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.", count: 1 },
        { id: "d4", text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى.", count: 1 },
        { id: "d5", text: "اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي، وَارْزُقْنِي.", count: 1 },
        { id: "d6", text: "لا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.", count: 1 },
        { id: "d7", text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.", count: 10 }
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
}

function incrementSebha() {
    sCount++;
    document.getElementById('sebhaCounter').innerText = sCount;
    localStorage.setItem('sebhaCount', sCount);
    updateProgress();
    
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