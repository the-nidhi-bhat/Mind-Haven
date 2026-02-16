// Dark mode functionality
function initTheme() {
    const savedTheme = localStorage.getItem('mh_theme') || 'light';
    const html = document.documentElement;
    html.setAttribute('data-theme', savedTheme);

    const toggle = document.getElementById('themeToggle');
    const icon = toggle.querySelector('i');
    const text = toggle.querySelector('span');

    if (savedTheme === 'dark') {
        toggle.classList.add('active');
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark';
    } else {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light';
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

// Initialize theme on load
initTheme();

function safeRead(key) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function safeReadArray(k) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : []; } catch { return []; } }
function saveData(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function getLevel() { const p = new URLSearchParams(window.location.search); const u = p.get("level"); if (u) return u; const s = safeRead("mh_stress_assessment"); return s && s.level ? s.level : "low"; }

const level = getLevel();
const profile = safeRead("mh_user_profile") || {};
const stress = safeRead("mh_stress_assessment") || {};

// Redirect first-time users to assessment
if (!stress || typeof stress.totalScore !== "number") {
    window.location.href = "assessment.html";
}
// Load new classification
const userType = localStorage.getItem("mh_user_type") || "stable";
const isTrauma = localStorage.getItem("mh_modifier_trauma") === "true";
const isLonely = localStorage.getItem("mh_modifier_loneliness") === "true";

// --- Dynamic Tool Recommendations (Ported & Enhanced) ---
function getRecommendedTools(uType, trauma, lonely) {
    let tools = [];

    // Base recommendations by profile
    if (uType === "high_risk") {
        tools.push({ name: "Crisis Support", url: "crisis.html", icon: "fa-life-ring", desc: "Immediate help resources", color: "#ef4444" });
        tools.push({ name: "Counselor Directory", url: "counselors.html", icon: "fa-user-md", desc: "Connect with a professional", color: "#8b5cf6" });
        tools.push({ name: "Calming Music", url: "music.html", icon: "fa-music", desc: "Soothing soundscapes", color: "#3b82f6" });
        tools.push({ name: "Safe Space", url: "bubble-pop.html", icon: "fa-soap", desc: "Gentle sensory relief", color: "#ec4899" });
    } else if (uType === "moderate_clinical") {
        tools.push({ name: "Find a Therapist", url: "counselors.html", icon: "fa-user-md", desc: "Professional guidance", color: "#8b5cf6" });
        tools.push({ name: "Mood Journal", url: "journal.html", icon: "fa-book-medical", desc: "Track your feelings", color: "#f59e0b" });
        tools.push({ name: "Tap to Breathe", url: "tap-breathe.html", icon: "fa-lungs", desc: "Regulate anxiety", color: "#10b981" });
        tools.push({ name: "Chat Companion", url: "chatbot2.html", icon: "fa-robot", desc: "Vent freely", color: "#6366f1" });
    } else if (uType === "mild_distress") {
        tools.push({ name: "Tap to Breathe", url: "tap-breathe.html", icon: "fa-lungs", desc: "Quick stress relief", color: "#10b981" });
        tools.push({ name: "Sand Healing", url: "sand-draw.html", icon: "fa-hourglass", desc: "Creative distraction", color: "#d97706" });
        tools.push({ name: "Yoga Flow", url: "yoga.html", icon: "fa-pray", desc: "Gentle movement", color: "#ec4899" });
        tools.push({ name: "Focus Dot", url: "focus-dot.html", icon: "fa-dot-circle", desc: "Center your mind", color: "#8b5cf6" });
    } else { // Stable
        tools.push({ name: "Daily Journal", url: "journal.html", icon: "fa-pen-fancy", desc: "Practice gratitude", color: "#f59e0b" });
        tools.push({ name: "Math Harmony", url: "math-harmony.html", icon: "fa-border-all", desc: "Mindful focus", color: "#3b82f6" });
        tools.push({ name: "Positivity Board", url: "positivity.html", icon: "fa-sun", desc: "Daily inspiration", color: "#eab308" });
        tools.push({ name: "Brain Training", url: "games.html", icon: "fa-brain", desc: "Sharpen your mind", color: "#6366f1" });
    }

    // Modifiers - Swap specific items to prioritize needs
    if (lonely && uType !== "high_risk") {
        // Ensure chatbot is present and prominent
        if (!tools.find(t => t.url === "chatbot2.html")) {
            tools[1] = { name: "AI Companion", url: "chatbot2.html", icon: "fa-robot", desc: "Always here to listen", color: "#6366f1" };
        }
    }

    if (trauma) {
        tools[tools.length - 1] = { name: "Safe Space", url: "bubble-pop.html", icon: "fa-soap", desc: "Visual calming", color: "#ec4899" };
    }

    return tools;
}

const recTools = getRecommendedTools(userType, isTrauma, isLonely);
const toolsContainer = document.querySelector('.quick-links');

// Render Enhanced Tools
if (toolsContainer) {
    // Logic for reducing choices in safety-focused mode
    let displayTools = recTools;
    if (userType === "high_risk") {
        // Keep the most important 3 and a "Show more" concept or just limit to keep it clean
        displayTools = recTools.slice(0, 3);
    }

    toolsContainer.innerHTML = displayTools.map(t => `
        <a href="${t.url}" class="quick-link">
          <div class="quick-link-icon" style="background:${t.color}20; color:${t.color}"><i class="fas ${t.icon}"></i></div>
          <div class="quick-link-text">
            <div class="quick-link-title">${t.name}</div>
            <div class="quick-link-desc">${t.desc}</div>
          </div>
        </a>
    `).join('') + (userType === "high_risk" ? `<a href="games.html" class="link-btn" style="grid-column: 1 / -1; justify-content: center; margin-top: 5px;">View all tools <i class="fas fa-arrow-right"></i></a>` : "");
}


document.getElementById("heroSubtitle").textContent = typeof stress.totalScore === "number" ? "Your path is uniquely designed for your current well-being needs." : "Complete the assessment to unlock your personalized journey.";

const levelBadge = document.getElementById("levelBadge"); const dot = levelBadge.querySelector(".badge-dot"); const label = levelBadge.querySelector("span:last-child");
dot.classList.remove("low", "moderate", "high");

// Map User Types to Colors & Soften High Risk
if (userType === "high_risk") { dot.classList.add("high"); label.textContent = "Safety-Focused Path"; }
else if (userType === "moderate_clinical") { dot.classList.add("high"); label.textContent = "Moderate – Structured Support"; }
else if (userType === "mild_distress") { dot.classList.add("moderate"); label.textContent = "Mild – Early Prevention"; }
else { dot.classList.add("low"); label.textContent = "Stable – Growth & Maintenance"; }

const baseJourneys = {
    low: [
        { icon: "fa-leaf", title: "5-min gratitude reflection", time: "5 min", tag: "Reflection" },
        { icon: "fa-walking", title: "Short walk or stretch", time: "10 min", tag: "Movement" },
        { icon: "fa-moon", title: "Calm sleep wind-down", time: "5 min", tag: "Sleep" },
        { icon: "fa-book-open", title: "Read 5 pages", time: "10 min", tag: "Learning" }
    ],
    moderate: [
        { icon: "fa-wind", title: "Deep breathing practice", time: "5 min", tag: "Breathing" },
        { icon: "fa-pen", title: "Thought processing journal", time: "10 min", tag: "Journaling" },
        { icon: "fa-person-walking", title: "15-min movement", time: "15 min", tag: "Movement" },
        { icon: "fa-bed", title: "Sleep routine & boundaries", time: "5 min", tag: "Sleep" }
    ],
    high: [
        { icon: "fa-heart-pulse", title: "Grounding technique", time: "3 min", tag: "Grounding" },
        { icon: "fa-lungs", title: "Slow breathing exercise", time: "4 min", tag: "Breath" },
        { icon: "fa-user-friends", title: "Connect with safe person", time: "5-10 min", tag: "Connection" },
        { icon: "fa-moon", title: "Gentle bedtime ritual", time: "5 min", tag: "Sleep" }
    ]
};

function personalise(base, profession) {
    const tasks = base.map(t => ({ ...t }));
    const extra = {
        student: { icon: "fa-book", title: "Study planning session", time: "5 min", tag: "Study" },
        working_professional: { icon: "fa-briefcase", title: "Work boundary setting", time: "5-7 min", tag: "Boundary" },
        homemaker: { icon: "fa-mug-hot", title: "Personal time block", time: "5-10 min", tag: "Self-care" },
        entrepreneur: { icon: "fa-list-check", title: "Idea organization", time: "7 min", tag: "Clarity" },
        healthcare: { icon: "fa-notes-medical", title: "Post-shift processing", time: "5-8 min", tag: "Processing" },
        teacher: { icon: "fa-chalkboard-teacher", title: "Post-class decompression", time: "5 min", tag: "Reset" }
    };
    if (extra[profession]) tasks.unshift(extra[profession]);
    return tasks;
}

const tasks = personalise(baseJourneys[level] || baseJourneys.low, profile.profession || "other");

const todayFocus = document.getElementById("todayFocus");
const profFocus = {
    student: "Structured routines for academic energy management.",
    working_professional: "Work-life separation and stress containment.",
    homemaker: "Intentional recovery spaces within daily routine.",
    entrepreneur: "Cognitive clarity practices for decision-making.",
    healthcare: "Post-shift grounding and processing techniques.",
    teacher: "Emotional regulation after classroom demands.",
    other: "Adaptive practices for your daily rhythm."
};
const lvlTail = {
    low: "Maintain current functioning and build resilience.",
    moderate: "Establish structure and stress management routines.",
    high: "Prioritize safety, grounding, and professional support."
};
todayFocus.textContent = (profFocus[profile.profession] || profFocus.other) + " " + (lvlTail[level] || "");

const taskList = document.getElementById("taskList");
let taskProgress = safeRead("mh_task_progress") || {};
const today = new Date().toISOString().split("T")[0];
if (!taskProgress[today]) taskProgress[today] = { completed: [] };

function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach((t, i) => {
        const isCompleted = taskProgress[today].completed.includes(i);
        const row = document.createElement("div");
        row.className = "task-item" + (isCompleted ? " completed" : "");
        row.innerHTML = `
      <div class="task-main">
        <div class="circle-icon"><i class="fas ${t.icon}"></i></div>
        <div>
          <div style="font-weight:600;font-size:0.85rem;">${t.title}</div>
          <div class="tag-chip">${t.tag}</div>
        </div>
      </div>
      <div class="task-meta">
        <div>${t.time}</div>
        <div><input type="checkbox" data-index="${i}" ${isCompleted ? "checked" : ""}> Done</div>
      </div>`;
        taskList.appendChild(row);
    });
}

function updateProgress() {
    const completed = taskProgress[today].completed.length;
    const total = tasks.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    document.getElementById("todayPercent").textContent = percent + "%";
    document.getElementById("todayBar").style.width = percent + "%";
    document.getElementById("journeyPercent").textContent = percent + "%";
    document.getElementById("journeyBar").style.width = percent + "%";
}

taskList.addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
        const idx = parseInt(e.target.dataset.index, 10);
        if (e.target.checked) {
            if (!taskProgress[today].completed.includes(idx)) taskProgress[today].completed.push(idx);
        } else {
            taskProgress[today].completed = taskProgress[today].completed.filter(i => i !== idx);
        }
        saveData("mh_task_progress", taskProgress);
        renderTasks();
        updateProgress();
        updateStats();
    }
});

renderTasks(); updateProgress();

const weekPlanEl = document.getElementById("weekPlan"); const regenBtn = document.getElementById("regenPlan"); const weekStats = document.getElementById("weekStats");
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function makeWeeklyPlan(baseTasks) {
    const plan = [];
    for (let i = 0; i < 7; i++) {
        const todayTasks = [];
        const count = level === "low" ? 2 : level === "moderate" ? 3 : 2;
        for (let j = 0; j < count; j++) {
            const picked = baseTasks[Math.floor(Math.random() * baseTasks.length)];
            todayTasks.push({ title: picked.title, tag: picked.tag, time: picked.time, completed: false });
        }
        plan.push({ day: dayNames[i], tasks: todayTasks });
    }
    return plan;
}

function saveWeeklyPlan(plan) {
    localStorage.setItem("mh_week_plan", JSON.stringify({ level, profession: profile.profession || "other", createdAt: new Date().toISOString(), plan }));
}

function loadWeeklyPlan() {
    try {
        const raw = localStorage.getItem("mh_week_plan");
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (data.level !== level || data.profession !== (profile.profession || "other")) return null;
        return data.plan || null;
    } catch (e) { return null; }
}

function calcWeekStats(plan) {
    let daysWithAny = 0;
    plan.forEach(day => { if (day.tasks.some(t => t.completed)) daysWithAny++; });
    return daysWithAny;
}

function renderWeeklyPlan(plan) {
    weekPlanEl.innerHTML = "";
    plan.forEach((day, dayIndex) => {
        const card = document.createElement("div");
        card.className = "day-card";
        const header = document.createElement("div");
        header.className = "day-header";
        header.textContent = day.day;
        card.appendChild(header);

        day.tasks.forEach((t, taskIndex) => {
            const row = document.createElement("div");
            row.className = "day-task";
            row.innerHTML = `<span>• ${t.title}</span><input type="checkbox" data-day="${dayIndex}" data-task="${taskIndex}" ${t.completed ? "checked" : ""}>`;
            card.appendChild(row);
        });

        const meta = document.createElement("div");
        meta.className = "day-meta";
        const completedCount = day.tasks.filter(t => t.completed).length;
        meta.textContent = `${completedCount}/${day.tasks.length} completed`;
        card.appendChild(meta);
        weekPlanEl.appendChild(card);
    });

    const doneDays = calcWeekStats(plan);
    weekStats.textContent = `Weekly engagement: ${doneDays}/7 days`;
}

let weeklyPlan = loadWeeklyPlan();
const now = new Date(); const todayDay = now.getDay();
if (todayDay === 1) { localStorage.removeItem("mh_week_plan"); weeklyPlan = null; }

if (!weeklyPlan) { weeklyPlan = makeWeeklyPlan(tasks); saveWeeklyPlan(weeklyPlan); }
renderWeeklyPlan(weeklyPlan);

regenBtn.addEventListener("click", (e) => { e.preventDefault(); weeklyPlan = makeWeeklyPlan(tasks); saveWeeklyPlan(weeklyPlan); renderWeeklyPlan(weeklyPlan); });

weekPlanEl.addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
        const day = parseInt(e.target.dataset.day, 10);
        const task = parseInt(e.target.dataset.task, 10);
        weeklyPlan[day].tasks[task].completed = e.target.checked;
        saveWeeklyPlan(weeklyPlan);
        renderWeeklyPlan(weeklyPlan);
    }
});

const profilePills = document.getElementById("profilePills");
const profMap = { student: "Student", working_professional: "Working professional", homemaker: "Homemaker", entrepreneur: "Entrepreneur", healthcare: "Healthcare worker", teacher: "Teacher" };
function addPill(text) { const p = document.createElement("div"); p.className = "pill-small"; p.textContent = text; profilePills.appendChild(p); }
addPill("Age: " + (profile.age ? profile.age + " yrs" : "Not set"));
addPill("Age band: " + (profile.ageBand || "Not set"));
addPill("Role: " + (profMap[profile.profession] || "Not set"));

// Softer status for profile
let stressLabel = "Not assessed";
if (typeof stress.totalScore === "number") {
    if (userType === "high_risk") stressLabel = "Needs Support";
    else if (userType === "moderate_clinical") stressLabel = "Elevated";
    else if (userType === "mild_distress") stressLabel = "Moderate";
    else stressLabel = "Stable";
}
addPill("Stress: " + stressLabel);

const safetyBlock = document.getElementById("safetyBlock");
if (level === "high" || userType === "high_risk") {
    safetyBlock.innerHTML = "<div class='alert-high'><i class='fas fa-exclamation-triangle'></i> <div><strong>Safety-focused mode active.</strong> Consider reaching out to a mental health professional. Crisis resources are available 24/7.</div></div>";
} else {
    safetyBlock.innerHTML = "<p style='font-size:0.8rem;color:var(--text-muted);'>Professional support and crisis resources are available if stress becomes overwhelming.</p>";
}

// Weekly toggle logic
document.getElementById('weekToggle').addEventListener('click', function () {
    this.classList.toggle('active');
    document.getElementById('weekContent').classList.toggle('show');
});

// Mood Emoji Logic
const emojiBtns = document.querySelectorAll('.emoji-btn');
const moodFeedback = document.getElementById('moodFeedback');

emojiBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        emojiBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        let moods = safeReadArray("mh_moods");
        moods.push({ mood: this.dataset.mood, time: new Date().toISOString() });
        saveData("mh_moods", moods);

        // Show fleeting feedback
        moodFeedback.classList.add("visible");
        setTimeout(() => { moodFeedback.classList.remove("visible"); }, 2000);

        updateStats();
    });
});

// Reflection Logic
const reflectionInput = document.getElementById('reflectionInput');
reflectionInput.value = localStorage.getItem('mh_reflection_today') || "";
reflectionInput.addEventListener('input', (e) => {
    localStorage.setItem('mh_reflection_today', e.target.value);
});

function updateStats() {
    const allTaskDays = Object.keys(taskProgress);
    let totalCompleted = 0;
    allTaskDays.forEach(d => { totalCompleted += taskProgress[d].completed.length; });
    document.getElementById("totalTasks").textContent = totalCompleted;

    const moods = safeReadArray("mh_moods");
    document.getElementById("moodCheckins").textContent = moods.length;

    // Calculate Trend
    if (moods.length > 2) {
        const lastMood = parseInt(moods[moods.length - 1].mood);
        const prevMood = parseInt(moods[moods.length - 2].mood);
        const trendEl = document.getElementById('moodTrend');
        if (lastMood > prevMood) {
            trendEl.innerHTML = '<i class="fas fa-caret-up"></i>';
            trendEl.className = 'stat-trend up';
        } else if (lastMood < prevMood) {
            trendEl.innerHTML = '<i class="fas fa-caret-down"></i>';
            trendEl.className = 'stat-trend down';
        } else {
            trendEl.innerHTML = '<i class="fas fa-minus"></i>';
            trendEl.className = 'stat-trend stable';
        }
    }

    const journals = safeReadArray("mh_journal");
    document.getElementById("journalEntries").textContent = journals.length;

    document.getElementById("weeklyEngagement").textContent = calcWeekStats(weeklyPlan);

    // Stress Trend placeholder logic
    const sTrend = document.getElementById('statsTrend');
    if (userType === "stable") {
        sTrend.textContent = "Stable (no increase)";
        sTrend.className = "stat-trend stable";
    } else {
        sTrend.textContent = "Assess weekly";
        sTrend.className = "stat-trend stable";
    }
}
updateStats();
