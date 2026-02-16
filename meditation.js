// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('mh_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggle = document.getElementById('themeToggle');
    const icon = toggle.querySelector('i');
    const text = toggle.querySelector('span');
    if (savedTheme === 'dark') {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark';
    }
}

document.getElementById('themeToggle').addEventListener('click', function () {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('mh_theme', next);
    const icon = this.querySelector('i');
    const text = this.querySelector('span');
    if (next === 'dark') {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark';
    } else {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light';
    }
});

initTheme();

// --- Daily Wisdom ---
const quotes = [
    { text: "The mind is like water. When it's turbulent, it's difficult to see. When it's calm, everything becomes clear.", author: "Prasad Madura" },
    { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
    { text: "The soul always knows what to do to heal itself. The challenge is to silence the mind.", author: "Caroline Myss" },
    { text: "Meditation is not evasion; it is a serene encounter with reality.", author: "Thich Nhat Hanh" },
    { text: "You should sit in meditation for twenty minutes every day — unless you're too busy; then you should sit for an hour.", author: "Zen Proverb" },
    { text: "Quiet the mind, and the soul will speak.", author: "Ma Jaya Sati Bhagavati" },
    { text: "The feeling that any task is a nuisance will soon disappear if it is done in mindfulness.", author: "D.T. Suzuki" }
];

function generateQuote() {
    const display = document.getElementById('quoteDisplay');
    const author = document.getElementById('quoteAuthor');
    if (!display || !author) return;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    display.style.opacity = 0;
    setTimeout(() => {
        display.textContent = `"${quote.text}"`;
        author.textContent = `— ${quote.author}`;
        display.style.opacity = 1;
    }, 300);
}

// --- Meditation Tracker ---
let stats = {
    totalMins: 0,
    sessions: 0,
    streak: 0,
    lastDate: null
};

function initStats() {
    const savedStats = localStorage.getItem('mh_meditation_stats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
        updateStatsUI();
    }
}

function updateStatsUI() {
    const minsEl = document.getElementById('statMins');
    const sessionsEl = document.getElementById('statSessions');
    const streakEl = document.getElementById('statStreak');

    if (minsEl) minsEl.textContent = Math.round(stats.totalMins);
    if (sessionsEl) sessionsEl.textContent = stats.sessions;
    if (streakEl) streakEl.textContent = stats.streak;
}

function logMeditation(mins) {
    stats.totalMins += mins;
    stats.sessions += 1;

    const today = new Date().toDateString();
    if (stats.lastDate) {
        const last = new Date(stats.lastDate);
        const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));

        if (diff === 1) stats.streak += 1;
        else if (diff > 1) stats.streak = 1;
    } else {
        stats.streak = 1;
    }

    stats.lastDate = today;
    localStorage.setItem('mh_meditation_stats', JSON.stringify(stats));
    updateStatsUI();
}



// Box Breathing
let breathingInterval;
let breathingPhase = 0;

function startBreathing() {
    const circle = document.getElementById('breathingCircle');
    const span = circle.querySelector('span');
    document.getElementById('startBreathing').style.display = 'none';
    document.getElementById('stopBreathing').style.display = 'inline-block';

    const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
    const classes = ['inhale', 'inhale', 'exhale', 'exhale'];

    breathingInterval = setInterval(() => {
        span.textContent = phases[breathingPhase];
        circle.className = 'breathing-circle ' + classes[breathingPhase];
        breathingPhase = (breathingPhase + 1) % 4;
    }, 4000);
}

function stopBreathing() {
    clearInterval(breathingInterval);
    const circle = document.getElementById('breathingCircle');
    circle.querySelector('span').textContent = 'Inhale';
    circle.className = 'breathing-circle';
    breathingPhase = 0;
    document.getElementById('startBreathing').style.display = 'inline-block';
    document.getElementById('stopBreathing').style.display = 'none';
}

// --- Timer Logic (Updated) ---
let timerSeconds = 600;
let initialSeconds = 600;
let timerInterval;
let timerRunning = false;

function setTimer(minutes, event) {
    if (timerRunning) return;
    timerSeconds = minutes * 60;
    initialSeconds = timerSeconds;
    updateTimerDisplay();
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        if (event.target.classList.contains('preset-btn')) {
            event.target.classList.add('active');
        } else {
            event.target.closest('.preset-btn').classList.add('active');
        }
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timerDisplay').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    document.getElementById('startTimer').style.display = 'none';
    document.getElementById('pauseTimer').style.display = 'inline-block';

    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
        } else {
            pauseTimer();
            const meditationMins = initialSeconds / 60;
            logMeditation(meditationMins);
            alert(`🔔 Meditation complete! You've added ${meditationMins} minutes to your journey.`);
            resetTimer();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('startTimer').style.display = 'inline-block';
    document.getElementById('pauseTimer').style.display = 'none';
}

function resetTimer() {
    pauseTimer();
    const activeBtn = document.querySelector('.preset-btn.active');
    const minutes = activeBtn ? parseInt(activeBtn.textContent) : 10;
    timerSeconds = minutes * 60;
    initialSeconds = timerSeconds;
    updateTimerDisplay();
}

// --- Floating Leaves ---
function initFloatingLeaves() {
    const container = document.createElement('div');
    container.className = 'leaves-visual-container';
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.zIndex = '-1';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    const icons = ['🍂', '🍃', '🌱'];

    setInterval(() => {
        const leaf = document.createElement('div');
        leaf.className = 'floating-leaf';
        leaf.innerHTML = icons[Math.floor(Math.random() * icons.length)];
        leaf.style.left = Math.random() * 100 + 'vw';
        leaf.style.animationDuration = (Math.random() * 10 + 10) + 's';
        leaf.style.fontSize = (Math.random() * 20 + 15) + 'px';
        container.appendChild(leaf);

        setTimeout(() => leaf.remove(), 20000);
    }, 3000);
}

// --- Background Music ---
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let isMusicPlaying = false;

function updateMusicUI(playing) {
    if (playing) {
        musicToggle.classList.add('playing');
        musicToggle.querySelector('i').className = 'fas fa-pause';
        musicToggle.querySelector('span').textContent = 'Pause Music';
        isMusicPlaying = true;
    } else {
        musicToggle.classList.remove('playing');
        musicToggle.querySelector('i').className = 'fas fa-music';
        musicToggle.querySelector('span').textContent = 'Calm Music';
        isMusicPlaying = false;
    }
}

function initMusic() {
    // Default volume
    bgMusic.volume = 0.5;

    // Check saved preference
    const savedMusicState = localStorage.getItem('mh_music_playing');

    if (savedMusicState === 'true') {
        // Attempt to auto-play
        const playPromise = bgMusic.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Auto-play started!
                updateMusicUI(true);
            })
                .catch(error => {
                    // Auto-play was prevented
                    console.log("Auto-play prevented (normal browser behavior):", error);
                    // Revert state to paused so user can click to start
                    localStorage.setItem('mh_music_playing', 'false');
                    updateMusicUI(false);
                });
        }
    }
}

musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        localStorage.setItem('mh_music_playing', 'false');
        updateMusicUI(false);
    } else {
        bgMusic.play().then(() => {
            localStorage.setItem('mh_music_playing', 'true');
            updateMusicUI(true);
        }).catch(err => {
            console.error("Play failed:", err);
            alert("Could not play audio. Please check your connection.");
        });
    }
});

// --- Initialize ---
initStats();
generateQuote();
initFloatingLeaves();
initMusic();
