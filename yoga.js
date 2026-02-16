// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

body.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    tone();
});

// Audio Context
let actx;
let soundEnabled = true;

function tone(frequency = 220, duration = 200) {
    if (!soundEnabled) return;

    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = actx.createOscillator();
    oscillator.frequency.value = frequency;

    const gainNode = actx.createGain();
    gainNode.gain.value = 0.05;

    oscillator.connect(gainNode);
    gainNode.connect(actx.destination);

    oscillator.start();
    setTimeout(() => oscillator.stop(), duration);
}

// Timer
let tInt;
function startTimer(min) {
    clearInterval(tInt);
    let s = min * 60;
    upd(s);
    tInt = setInterval(() => {
        s--;
        upd(s);
        if (s <= 0) {
            clearInterval(tInt);
            tone(330, 500);
        }
    }, 1000);
}

function upd(s) {
    let m = Math.floor(s / 60);
    let r = s % 60;
    document.getElementById('timer').innerText = `${m}:${r < 10 ? '0' : ''}${r}`;
}

function stopTimer() {
    clearInterval(tInt);
    document.getElementById('timer').innerText = "00:00";
    tone(110, 100);
}

// Breath
let bInt, bOn = false;
function toggleBreath() {
    const btn = document.getElementById('breathBtn');
    const txt = document.getElementById('breathText');
    const circ = document.getElementById('breathCircle');

    if (bOn) {
        clearInterval(bInt);
        bOn = false;
        btn.innerText = "Begin";
        circ.innerHTML = "";
        txt.innerText = "4";
        return;
    }

    bOn = true;
    btn.innerText = "Stop";

    circ.innerHTML = '<div class="breath-dot"></div>';
    circ.firstElementChild.classList.add('breath-anim');

    let c = 4, ph = 0;
    const tick = () => {
        txt.innerText = ph === 0 ? "In" : "Out";
        c--;
        if (c < 0) {
            ph = 1 - ph;
            c = 4;
            tone(ph === 0 ? 220 : 180);
        }
    };
    tick();
    bInt = setInterval(tick, 1000);
}

function resetBreath() {
    if (bOn) toggleBreath();
    const txt = document.getElementById('breathText');
    const circ = document.getElementById('breathCircle');
    const btn = document.getElementById('breathBtn');

    txt.innerText = "4";
    circ.innerHTML = "";
    btn.innerText = "Begin";
    tone(110, 100);
}

// Pose Checkboxes
document.querySelectorAll('.pose-check').forEach(cb => {
    cb.addEventListener('change', (e) => {
        e.target.closest('.pose-card').classList.toggle('done', e.target.checked);
        updateProg();
        if (e.target.checked) tone(260, 150);
    });
});

function updateProg() {
    const tot = document.querySelectorAll('.pose-check').length;
    const chk = document.querySelectorAll('.pose-check:checked').length;
    const progFill = document.getElementById('progFill');
    const goalText = document.getElementById('goalText');

    progFill.style.width = (chk / tot * 100) + "%";
    goalText.innerText = chk === tot ?
        "Harmony Achieved 🌿 Complete your practice!" :
        `Daily Goal: ${chk}/${tot} poses`;

    if (chk === tot && tot > 0) {
        setTimeout(() => tone(440, 300), 100);
        setTimeout(() => tone(550, 300), 400);
        setTimeout(() => tone(660, 500), 700);
    }
}

// Initialize progress
updateProg();

// Add image loading error handling
document.querySelectorAll('.pose-thumb').forEach(img => {
    img.addEventListener('error', function () {
        this.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        this.alt = 'Yoga pose image';
    });
});

// Toggle Video Function
function toggleVideo(id) {
    const videoContainer = document.getElementById(id);
    const btn = videoContainer.previousElementSibling;

    if (videoContainer.classList.contains('show')) {
        videoContainer.classList.remove('show');
        btn.innerHTML = '<i class="fas fa-play"></i> Watch Demo';
        // Stop video when closing (reload iframe)
        const iframe = videoContainer.querySelector('iframe');
        iframe.src = iframe.src;
    } else {
        // Close other videos? Optional. Let's keep it simple.
        videoContainer.classList.add('show');
        btn.innerHTML = '<i class="fas fa-times"></i> Close Demo';
    }
}
