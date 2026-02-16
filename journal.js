// ===== THEME MANAGEMENT =====
function initTheme() {
    const savedTheme = localStorage.getItem('mh_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const toggle = document.getElementById('themeToggle');
    const icon = toggle.querySelector('i');
    const text = toggle.querySelector('span');

    if (savedTheme === 'dark') {
        toggle.classList.add('active');
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark';
    }
}

document.getElementById('themeToggle').addEventListener('click', function () {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('mh_theme', newTheme);

    const icon = this.querySelector('i');
    const text = this.querySelector('span');

    if (newTheme === 'dark') {
        this.classList.add('active');
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark';
    } else {
        this.classList.remove('active');
        icon.className = 'fas fa-sun';
        text.textContent = 'Light';
    }
});

// ===== UTILITY FUNCTIONS =====
function getUserKey(k) {
    // Check both storages for the current user
    const user = localStorage.getItem('mh_user') || sessionStorage.getItem('mh_user');
    return user ? `${user}_${k}` : k;
}

function safeRead(k) {
    try {
        const key = getUserKey(k);
        return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;
    } catch {
        return null;
    }
}

function safeReadArray(k) {
    try {
        const key = getUserKey(k);
        return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
    } catch {
        return [];
    }
}

function saveData(k, v) {
    const key = getUserKey(k);
    localStorage.setItem(key, JSON.stringify(v));
}

// ===== JOURNAL FUNCTIONALITY =====
let selectedMood = null;
const elements = {
    journalMoodScale: document.getElementById("journalMoodScale"),
    journalText: document.getElementById("journalText"),
    saveEntryBtn: document.getElementById("saveEntry"),
    burnEntryBtn: document.getElementById("burnEntry"),
    entriesHistory: document.getElementById("entriesHistory"),
    todayPrompt: document.getElementById("todayPrompt"),
    totalEntries: document.getElementById("totalEntries"),
    streakDays: document.getElementById("streakDays"),
    avgMood: document.getElementById("avgMood"),
    wordsToday: document.getElementById("wordsToday"),
    worryCount: document.getElementById("worryCount")
};

// Mood selector functionality
elements.journalMoodScale.addEventListener("click", (e) => {
    if (e.target.classList.contains("mood-btn")) {
        document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
        e.target.classList.add("selected");
        selectedMood = parseInt(e.target.dataset.mood, 10);
    }
});

// Personalized prompts based on stress level
const stress = safeRead("mh_stress_assessment") || {};
const level = stress.level || "low";
const prompts = {
    low: [
        "What are three things you're grateful for today?",
        "What's one small win you had this week?",
        "What energizes you and brings you joy?",
        "What's something you're looking forward to?",
        "How can you build on what's already working well?",
        "Write about a place where you feel safe.",
        "Who is someone you appreciate and why?"
    ],
    moderate: [
        "What feels hardest right now, and why?",
        "What's one thing you can control today?",
        "What support do you need that you haven't asked for?",
        "What patterns do you notice in your stress?",
        "If you could let go of one worry, what would it be?",
        "What is a challenge you overcame recently?",
        "How are you feeling right now, really?"
    ],
    high: [
        "What do you need to feel safe right now?",
        "Name one thing that helped you get through today.",
        "What would you tell a friend feeling like you do?",
        "What's the smallest step you could take right now?",
        "Who can you reach out to for support?",
        "What is one goal you want to focus on tomorrow?",
        "What made you smile today, even if just a little?"
    ]
};

let currentPrompt = "";

function newPrompt() {
    const promptList = prompts[level];
    currentPrompt = promptList[Math.floor(Math.random() * promptList.length)];
    elements.todayPrompt.textContent = currentPrompt;
}

// Save entry
elements.saveEntryBtn.addEventListener("click", () => {
    const text = elements.journalText.value.trim();
    if (!text) {
        alert("Please share your thoughts! 💭");
        return;
    }
    if (!selectedMood) {
        alert("Please select your mood for today! 😊");
        return;
    }

    const entries = safeReadArray("mh_journal");
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const entry = {
        date: new Date().toISOString(),
        prompt: currentPrompt,
        text: text,
        mood: selectedMood,
        wordCount: wordCount,
        stressLevel: level
    };

    entries.push(entry);
    saveData("mh_journal", entries);

    alert("✨ Reflection saved! Your words matter.");
    elements.journalText.value = "";
    selectedMood = null;
    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
    updateStats();
    renderEntries();
});

// Burn entry with confetti
elements.burnEntryBtn.addEventListener("click", () => {
    const text = elements.journalText.value.trim();
    if (!text) {
        alert("Nothing to burn! Write something first.");
        return;
    }

    if (confirm('Burn this entry? This deletes it permanently and can help you let go.')) {
        // Confetti effect (only if loaded)
        if (typeof confetti === 'function') {
            const duration = 2 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#ef4444', '#f97316', '#fb923c']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ef4444', '#f97316', '#fb923c']
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            })();
        }

        const area = elements.journalText;
        area.style.transition = '0.5s';
        area.style.opacity = 0;
        setTimeout(() => {
            area.value = '';
            area.style.opacity = 1;
            selectedMood = null;
            document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
        }, 500);
    }
});

// Enhanced stats calculation
function updateStats() {
    const entries = safeReadArray("mh_journal");
    const total = entries.length;
    elements.totalEntries.textContent = total || 0;

    // Streak calculation
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let streak = 0;
    for (let i = 0; i < entries.length; i++) {
        const entryDate = new Date(entries[i].date).toISOString().split('T')[0];
        if (entryDate === today || entryDate === yesterday) {
            streak = Math.max(streak, 1);
        }
    }
    elements.streakDays.textContent = streak || 0;

    // Average mood
    if (entries.length > 0) {
        const avgMood = Math.round(entries.reduce((sum, e) => sum + e.mood, 0) / entries.length);
        const moodEmojis = ["", "😢", "😟", "😐", "🙂", "😊"];
        elements.avgMood.textContent = moodEmojis[avgMood] || "😐";
    }

    // Words today
    const todayEntries = entries.filter(e =>
        new Date(e.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
    );
    const todayWords = todayEntries.reduce((sum, e) => sum + e.wordCount, 0);
    elements.wordsToday.textContent = todayWords || 0;

    // Worry count
    const worries = safeReadArray("mh_worries");
    elements.worryCount.textContent = worries.length;
}

// Render entries
function renderEntries() {
    const entries = safeReadArray("mh_journal");
    const recent = entries.slice(-10).reverse();

    if (recent.length === 0) {
        elements.entriesHistory.innerHTML = "<div class='empty-state'><i class='fas fa-book-open'></i><p>No entries yet.<br>Your first reflection will appear here! ✨</p></div>";
        return;
    }

    elements.entriesHistory.innerHTML = "";
    const moodEmojis = ["", "😢", "😟", "😐", "🙂", "😊"];

    recent.forEach((e, idx) => {
        const div = document.createElement("div");
        div.className = "journal-entry";
        const date = new Date(e.date);
        div.innerHTML = `
      <div class="entry-header">
        <span class="entry-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        <div style="display:flex;gap:8px;">
          <span class="entry-mood">
            <span class="mood-badge">${moodEmojis[e.mood] || '😐'}</span>
            <span style="font-size:0.75rem;color:var(--text-muted);">${e.wordCount} words</span>
          </span>
          <button class="btn-secondary" onclick="deleteEntry(${entries.length - 1 - idx})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="entry-prompt">"${e.prompt}"</div>
      <div class="entry-text">${e.text}</div>
    `;
        elements.entriesHistory.appendChild(div);
    });
}

window.deleteEntry = function (idx) {
    if (!confirm("Delete this reflection? Your words are safe but this can't be undone.")) return;
    const entries = safeReadArray("mh_journal");
    entries.splice(idx, 1);
    saveData("mh_journal", entries);
    updateStats();
    renderEntries();
};

// ===== WORRY JAR FUNCTIONALITY =====
let worries = safeReadArray("mh_worries");

function renderFireflies() {
    const zone = document.getElementById("firefly-zone");
    zone.innerHTML = "";

    // Limit fireflies to prevent overcrowding
    const visibleWorries = worries.slice(0, 15);

    visibleWorries.forEach(w => {
        const f = document.createElement("div");
        f.className = "firefly";
        const x = Math.random() * 80 + 10;
        const y = Math.random() * 80 + 10;
        f.style.left = x + "%";
        f.style.top = y + "%";
        f.style.setProperty("--mx", (Math.random() * 40 - 20) + "px");
        f.style.setProperty("--my", (Math.random() * 40 - 20) + "px");
        f.style.animationDelay = Math.random() + "s";
        zone.appendChild(f);
    });
}

function addWorry() {
    const input = document.getElementById("worryInput");
    const txt = input.value.trim();
    if (!txt) {
        alert("Please write down your worry first");
        return;
    }

    worries.push({
        text: txt,
        date: Date.now()
    });
    saveData("mh_worries", worries);
    input.value = "";
    renderFireflies();
    updateStats();

    // Show quick feedback
    input.style.borderColor = "var(--forest-green)";
    setTimeout(() => {
        input.style.borderColor = "";
    }, 1000);
}

// Allow Enter key to add worry
document.getElementById("worryInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addWorry();
    }
});

function openJar() {
    document.getElementById("worryModal").style.display = "flex";
    renderWorryList();
}

function closeWorryModal() {
    document.getElementById("worryModal").style.display = "none";
}

function renderWorryList() {
    const list = document.getElementById("worryListArea");
    if (worries.length === 0) {
        list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-moon"></i>
        <p>The jar is empty.<br>Your mind is clear. 🌙</p>
      </div>
    `;
        return;
    }

    list.innerHTML = worries.map((w, i) => `
    <div class="worry-item">
      <span class="worry-text">${w.text}</span>
      <div class="worry-actions">
        <i class="fas fa-book-open" onclick="journalWorry(${i})" title="Journal about this"></i>
        <i class="fas fa-trash" onclick="deleteWorry(${i})" title="Release / Delete"></i>
      </div>
    </div>
  `).join('');
}

window.deleteWorry = function (index) {
    if (confirm('Release this worry into the universe?')) {
        worries.splice(index, 1);
        saveData("mh_worries", worries);
        renderWorryList();
        renderFireflies();
        updateStats();
    }
};

window.journalWorry = function (index) {
    const w = worries[index];
    elements.journalText.value = `Reflection on worry: "${w.text}"\n\n`;
    elements.journalText.focus();
    closeWorryModal();
    worries.splice(index, 1);
    saveData("mh_worries", worries);
    renderFireflies();
    updateStats();
};

// ===== INITIALIZATION =====
initTheme();
newPrompt();
updateStats();
renderEntries();
renderFireflies();
