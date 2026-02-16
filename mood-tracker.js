// ===== THEME MANAGEMENT =====
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

// ===== UTILITY FUNCTIONS =====
function getUserKey(k) {
    // Check both storages for the current user
    const user = localStorage.getItem('mh_user') || sessionStorage.getItem('mh_user');
    return user ? `${user}_${k}` : k;
}

function safeRead(k) {
    try {
        const key = getUserKey(k);
        const r = localStorage.getItem(key);
        return r ? JSON.parse(r) : [];
    } catch {
        return [];
    }
}
function saveData(k, v) {
    const key = getUserKey(k);
    localStorage.setItem(key, JSON.stringify(v));
}

// ===== MOOD TRACKER =====
let selectedMood = null;
let currentPeriod = 7;
const moodScale = document.getElementById("moodScale");
const energyLevel = document.getElementById("energyLevel");
const moodNote = document.getElementById("moodNote");
const saveMoodBtn = document.getElementById("saveMood");
const moodHistory = document.getElementById("moodHistory");

// Mood selection
moodScale.addEventListener("click", (e) => {
    if (e.target.classList.contains("mood-btn") || e.target.closest('.mood-btn')) {
        const btn = e.target.classList.contains("mood-btn") ? e.target : e.target.closest('.mood-btn');
        document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedMood = parseInt(btn.dataset.mood, 10);
    }
});

// Save mood
saveMoodBtn.addEventListener("click", () => {
    if (!selectedMood) {
        alert("Please select a mood emoji first!");
        return;
    }

    const moods = safeRead("mh_moods");
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Get selected factors
    const factors = [];
    document.querySelectorAll('.factor-checkbox input:checked').forEach(cb => {
        factors.push(cb.value);
    });

    const entry = {
        date: today,
        timestamp: now.toISOString(),
        mood: selectedMood,
        energy: energyLevel.value,
        factors: factors,
        note: moodNote.value.trim()
    };

    // Check if entry exists for today
    const existing = moods.findIndex(m => m.date === today);
    if (existing >= 0) {
        moods[existing] = entry;
    } else {
        moods.push(entry);
    }

    saveData("mh_moods", moods);
    alert("✓ Mood check-in saved!");

    // Reset form
    selectedMood = null;
    energyLevel.value = "";
    moodNote.value = "";
    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
    document.querySelectorAll('.factor-checkbox input').forEach(cb => cb.checked = false);

    updateStats();
    renderHistory();
    renderChart();
    generateInsights();
});

// ===== STATS CALCULATION =====
function updateStats() {
    const moods = safeRead("mh_moods");
    const total = moods.length;
    document.getElementById("totalEntries").textContent = total || 0;

    // Get last 7 days
    const last7Days = moods.slice(-7);

    // Average mood (last 7 days)
    if (last7Days.length > 0) {
        const avgMood = (last7Days.reduce((sum, e) => sum + e.mood, 0) / last7Days.length).toFixed(1);
        document.getElementById("avgMood").textContent = avgMood;
    } else {
        document.getElementById("avgMood").textContent = "--";
    }

    // Best day
    if (moods.length > 0) {
        const sortedByMood = [...moods].sort((a, b) => b.mood - a.mood);
        const bestEntry = sortedByMood[0];
        const bestDate = new Date(bestEntry.date);
        // Format as "Mon, Jan 17" for better clarity
        const formatted = bestDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        document.getElementById("bestDay").textContent = formatted;
    } else {
        document.getElementById("bestDay").textContent = "--";
    }

    // Unique check-in days
    const uniqueDays = new Set(moods.map(m => m.date)).size;
    document.getElementById("checkInStreak").textContent = uniqueDays;
}

// ===== MOOD CHART =====
function renderChart() {
    const moods = safeRead("mh_moods");
    const svg = document.getElementById("moodChart");

    if (moods.length === 0) {
        svg.innerHTML = '<text x="400" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="14">No data yet. Start tracking your mood!</text>';
        return;
    }

    // Get data for selected period
    const periodData = moods.slice(-currentPeriod);

    // Chart dimensions
    const width = 800;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear SVG
    svg.innerHTML = '';

    // Draw gridlines
    for (let i = 1; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * (6 - i);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'var(--border-light)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);

        // Y-axis labels
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding - 10);
        text.setAttribute('y', y + 5);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('fill', 'var(--text-muted)');
        text.setAttribute('font-size', '12');
        text.textContent = i;
        svg.appendChild(text);
    }

    // Plot points and line
    const points = periodData.map((entry, i) => {
        const x = padding + (chartWidth / (periodData.length - 1 || 1)) * i;
        const y = padding + chartHeight - (entry.mood / 5 * chartHeight);
        return { x, y, entry };
    });

    // Draw line
    if (points.length > 1) {
        const pathD = points.map((p, i) =>
            i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
        ).join(' ');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('stroke', 'var(--accent)');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
    }

    // Draw points
    const moodColors = ['', 'var(--mood-very-bad)', 'var(--mood-bad)', 'var(--mood-okay)', 'var(--mood-good)', 'var(--mood-great)'];
    points.forEach(p => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x);
        circle.setAttribute('cy', p.y);
        circle.setAttribute('r', '6');
        circle.setAttribute('fill', moodColors[p.entry.mood]);
        circle.setAttribute('stroke', 'var(--bg-secondary)');
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);
    });
}

// Change period
window.changePeriod = function (days) {
    currentPeriod = days;
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.period) === days);
    });
    renderChart();
};

// ===== INSIGHTS GENERATION =====
function generateInsights() {
    const moods = safeRead("mh_moods");

    if (moods.length < 3) {
        document.getElementById("insightsCard").style.display = 'none';
        return;
    }

    document.getElementById("insightsCard").style.display = 'block';
    const insightsContent = document.getElementById("insightsContent");
    insightsContent.innerHTML = '';

    // Analyze factors
    const factorCounts = {};
    const factorMoodSum = {};

    moods.forEach(entry => {
        if (entry.factors && entry.factors.length > 0) {
            entry.factors.forEach(factor => {
                if (!factorCounts[factor]) {
                    factorCounts[factor] = 0;
                    factorMoodSum[factor] = 0;
                }
                factorCounts[factor]++;
                factorMoodSum[factor] += entry.mood;
            });
        }
    });

    // Find best factor
    let bestFactor = null;
    let bestAvg = 0;
    for (const factor in factorMoodSum) {
        const avg = factorMoodSum[factor] / factorCounts[factor];
        if (avg > bestAvg && factorCounts[factor] >= 2) {
            bestAvg = avg;
            bestFactor = factor;
        }
    }

    if (bestFactor) {
        const factorNames = {
            'sleep': 'good sleep',
            'exercise': 'exercise',
            'social': 'social interaction',
            'work': 'work-related activities',
            'weather': 'favorable weather',
            'food': 'regular meals'
        };

        const insight = document.createElement('div');
        insight.className = 'insight-box';
        insight.innerHTML = `<i class="fas fa-lightbulb"></i> You tend to feel better on days with ${factorNames[bestFactor] || bestFactor}. Try to incorporate this more often.`;
        insightsContent.appendChild(insight);
    }

    // Check mood trend
    const last7 = moods.slice(-7);
    if (last7.length >= 5) {
        const avgFirst = last7.slice(0, 3).reduce((sum, e) => sum + e.mood, 0) / 3;
        const avgLast = last7.slice(-3).reduce((sum, e) => sum + e.mood, 0) / 3;

        if (avgLast > avgFirst + 0.5) {
            const insight = document.createElement('div');
            insight.className = 'insight-box';
            insight.innerHTML = `<i class="fas fa-arrow-trend-up"></i> Your mood has been improving over the past week. Keep up the positive momentum!`;
            insightsContent.appendChild(insight);
        } else if (avgLast < avgFirst - 0.5) {
            const insight = document.createElement('div');
            insight.className = 'insight-box';
            insight.innerHTML = `<i class="fas fa-heart"></i> Your mood has been lower recently. Consider reaching out to someone you trust or exploring our <a href="counselors.html" style="color:inherit;font-weight:600;">support resources</a>.`;
            insightsContent.appendChild(insight);
        }
    }
}

// ===== HISTORY RENDERING =====
function renderHistory() {
    const moods = safeRead("mh_moods");
    const recent = moods.slice(-10).reverse();

    if (recent.length === 0) {
        moodHistory.innerHTML = "<div class='empty-state'><i class='fas fa-calendar-check'></i><p>No mood entries yet.<br>Start tracking above to see your history!</p></div>";
        return;
    }

    moodHistory.innerHTML = "";
    const moodEmojis = ["", "😢", "😟", "😐", "🙂", "😊"];
    const energyLabels = ["", "Very Low", "Low", "Moderate", "High", "Very High"];
    const factorNames = {
        'sleep': 'Sleep',
        'exercise': 'Exercise',
        'social': 'Social',
        'work': 'Work',
        'weather': 'Weather',
        'food': 'Food'
    };

    recent.forEach(m => {
        const div = document.createElement("div");
        div.className = "mood-entry";

        let factorsHTML = '';
        if (m.factors && m.factors.length > 0) {
            factorsHTML = '<div class="mood-entry-factors">' +
                m.factors.map(f => `<span class="factor-tag">${factorNames[f] || f}</span>`).join('') +
                '</div>';
        }

        let energyHTML = '';
        if (m.energy) {
            energyHTML = `<div class="mood-entry-energy">Energy: ${energyLabels[m.energy]}</div>`;
        }

        div.innerHTML = `
      <div class="mood-entry-header">
        <span class="mood-entry-date">${new Date(m.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        <span class="mood-entry-mood">${moodEmojis[m.mood]}</span>
      </div>
      ${factorsHTML}
      ${energyHTML}
      ${m.note ? '<div class="mood-entry-note">' + m.note + '</div>' : ""}
    `;
        moodHistory.appendChild(div);
    });
}

// ===== INITIALIZATION =====
initTheme();
updateStats();
renderHistory();
renderChart();
generateInsights();
