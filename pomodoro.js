// POMODORO LOGIC
const modes = { pomo: 25, short: 5, long: 15, kaizen: 1 };
let currentMode = 'pomo';
let timeLeft = modes.pomo * 60;
let timerId = null;
let isRunning = false;
let sessionData = JSON.parse(localStorage.getItem('pomoUlt')) || {
    totalMinutes: 0,
    daysAccessed: 1,
    streak: 0,
    lastDate: new Date().toISOString().split('T')[0],
    daily: {},
    logs: [],
    todos: []
};

const timerEl = document.getElementById('timer');
const mainBtn = document.getElementById('mainBtn');
const treeIcon = document.getElementById('tree-icon');
const playIcon = document.getElementById('playIcon');

// Load saved background
const savedBg = localStorage.getItem('pomoBg');
if (savedBg) {
    document.body.style.backgroundImage = `url(${savedBg})`;
}

function updateDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerEl.innerText = `${m}:${s}`;
    document.title = isRunning ? `${m}:${s} - Focus` : 'Focus Timer';

    const totalTime = modes[currentMode] * 60;
    const progress = 1 - (timeLeft / totalTime);

    if (progress < 0.1) {
        treeIcon.innerText = '🌱';
    } else if (progress < 0.5) {
        treeIcon.innerText = '🌿';
    } else if (progress < 0.9) {
        treeIcon.innerText = '🌳';
    } else {
        treeIcon.innerText = '🌲';
    }
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        mainBtn.innerText = 'Resume';
        mainBtn.classList.remove('running');
    } else {
        if (timeLeft === 0) {
            timeLeft = modes[currentMode] * 60;
        }

        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                completeSession();
            }
        }, 1000);

        isRunning = true;
        mainBtn.innerText = 'Pause';
        mainBtn.classList.add('running');
    }
}

function completeSession() {
    clearInterval(timerId);
    isRunning = false;

    const alarmSound = document.getElementById('alarm-sound');
    alarmSound.play().catch(e => console.log('Audio play failed:', e));

    mainBtn.innerText = 'Start';
    mainBtn.classList.remove('running');

    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });

    if (currentMode === 'pomo') {
        logSession(modes.pomo);
    }

    alert('🎉 Session Complete! Great Focus!');
    timeLeft = modes[currentMode] * 60;
    updateDisplay();
}

function switchMode(mode) {
    if (isRunning) {
        if (!confirm('Timer is running. Switch mode anyway?')) {
            return;
        }
        toggleTimer();
    }

    currentMode = mode;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    if (mode !== 'kaizen') {
        document.getElementById(`btn-${mode}`).classList.add('active');
    }

    timeLeft = modes[mode] * 60;
    updateDisplay();
}

function activateKaizen() {
    switchMode('kaizen');
    document.getElementById('mainTaskInput').value = '⚡ Kaizen - Just 1 minute start';
    setTimeout(() => toggleTimer(), 100);
}

function activateShinrin() {
    changeBg('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1920');

    const forest = document.getElementById('nature-forest');
    const rain = document.getElementById('nature-rain');

    if (forest.paused) {
        forest.play().catch(e => console.log('Forest audio failed:', e));
        document.querySelector('.nature-btn:nth-child(1)').classList.add('active');
    }
    if (rain.paused) {
        rain.play().catch(e => console.log('Rain audio failed:', e));
        document.querySelector('.nature-btn:nth-child(1)').parentElement.previousElementSibling.querySelector('.nature-btn').classList.add('active');
    }

    switchMode('long');
    document.getElementById('mainTaskInput').value = '🍃 Shinrin-yoku - Forest Bathing';
}

function changeBg(url) {
    document.body.style.backgroundImage = `url(${url})`;
    localStorage.setItem('pomoBg', url);
}

function logSession(mins) {
    const today = new Date().toISOString().split('T')[0];

    if (!sessionData.daily[today]) {
        sessionData.daily[today] = 0;
    }
    sessionData.daily[today] += mins;
    sessionData.totalMinutes += mins;

    const taskName = document.getElementById('mainTaskInput').value || 'Focus Session';
    sessionData.logs.unshift({
        name: taskName,
        date: new Date().toLocaleString(),
        duration: mins
    });

    localStorage.setItem('pomoUlt', JSON.stringify(sessionData));
}

// UI & AUDIO FUNCTIONS
function openTodo() {
    document.getElementById('todoModal').style.display = 'flex';
    renderTodos();
}

function addTodo() {
    const input = document.getElementById('newTodoInput');
    const text = input.value.trim();

    if (!text) return;

    sessionData.todos.push({ text: text, done: false });
    input.value = '';
    saveAndRenderTodos();
}

function toggleTodo(index) {
    sessionData.todos[index].done = !sessionData.todos[index].done;
    saveAndRenderTodos();
}

function deleteTodo(index) {
    if (confirm('Delete this task?')) {
        sessionData.todos.splice(index, 1);
        saveAndRenderTodos();
    }
}

function saveAndRenderTodos() {
    localStorage.setItem('pomoUlt', JSON.stringify(sessionData));
    renderTodos();
}

function renderTodos() {
    const list = document.getElementById('todoListUI');

    if (sessionData.todos.length === 0) {
        list.innerHTML = '<li style="text-align:center; color:#aaa; padding:40px;">No tasks yet. Add one above!</li>';
        return;
    }

    list.innerHTML = sessionData.todos.map((todo, i) => `
        <li class="todo-item ${todo.done ? 'done' : ''}">
            <input type="checkbox" class="todo-check" ${todo.done ? 'checked' : ''} onclick="toggleTodo(${i})">
            <span class="todo-text">${todo.text}</span>
            <i class="fas fa-trash todo-del" onclick="deleteTodo(${i})"></i>
        </li>
    `).join('');
}

let chart = null;

function openReport() {
    document.getElementById('reportModal').style.display = 'flex';
    document.getElementById('disp-hours').innerText = (sessionData.totalMinutes / 60).toFixed(1);
    document.getElementById('disp-days').innerText = sessionData.daysAccessed;
    document.getElementById('disp-streak').innerText = sessionData.streak;

    const ctx = document.getElementById('activityChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const str = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        data.push((sessionData.daily[str] || 0) / 60);
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: '#f472b6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: {
                    grid: { color: '#f0f0f0' },
                    beginAtZero: true
                }
            }
        }
    });

    const logList = document.getElementById('logList');

    if (sessionData.logs.length === 0) {
        logList.innerHTML = '<li style="text-align:center; color:#aaa; padding:40px;">No sessions logged yet.</li>';
    } else {
        logList.innerHTML = sessionData.logs.map(l => `
            <li style="padding:10px 0; border-bottom:1px solid #eee;">
                <b>${l.name}</b> 
                <span style="float:right; color:#999;">${l.duration}m</span>
                <div style="font-size:0.8rem; color:#ccc;">${l.date}</div>
            </li>
        `).join('');
    }
}

function switchView(view, el) {
    document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');

    document.getElementById('view-summary').style.display = view === 'summary' ? 'block' : 'none';
    document.getElementById('view-detail').style.display = view === 'detail' ? 'block' : 'none';
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
}

let currentTrack = null;

function changeTrack() {
    const val = document.getElementById('trackSelect').value;

    if (currentTrack) {
        currentTrack.pause();
        currentTrack.currentTime = 0;
    }

    if (val !== 'none') {
        currentTrack = document.getElementById(`music-${val}`);
        currentTrack.volume = 0.5;
        currentTrack.play().catch(e => console.log('Music play failed:', e));
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
    } else {
        currentTrack = null;
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    }
}

function toggleMusic() {
    if (!currentTrack) {
        document.getElementById('trackSelect').value = 'lofi1';
        changeTrack();
        return;
    }

    if (currentTrack.paused) {
        currentTrack.play().catch(e => console.log('Music play failed:', e));
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
    } else {
        currentTrack.pause();
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    }
}

function toggleNature(type, btn) {
    const audio = document.getElementById(`nature-${type}`);

    if (audio.paused) {
        audio.play().catch(e => console.log(`${type} audio failed:`, e));
        btn.classList.add('active');
    } else {
        audio.pause();
        btn.classList.remove('active');
    }
}

function setVolume(type, val) {
    const audio = document.getElementById(`nature-${type}`);
    audio.volume = val;

    if (audio.paused && val > 0) {
        audio.play().catch(e => console.log(`${type} audio failed:`, e));
    }
}

// Close modals when clicking outside
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', function (e) {
        if (e.target === this) {
            closeModals();
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleTimer();
    }
});

// Initialize
updateDisplay();
