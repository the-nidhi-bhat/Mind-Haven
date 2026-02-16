const rootEl = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');

function applyTheme(theme) {
    rootEl.setAttribute('data-theme', theme);
    localStorage.setItem('mh_theme', theme);
    if (theme === 'dark') {
        toggleBtn.innerHTML = '<i class="fas fa-sun"></i><span id="themeLabel">Light</span>';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-moon"></i><span id="themeLabel">Dark</span>';
    }
}

applyTheme(localStorage.getItem('mh_theme') || 'light');

toggleBtn.addEventListener('click', () => {
    const next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
});

function renderMiniCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    document.getElementById('miniMonthLabel').textContent =
        now.toLocaleString('en-US', { month: 'long' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    let html = weekdays.map(d => `<div class="mini-cal-cell day">${d}</div>`).join('');
    for (let i = 0; i < firstDay; i++) html += '<div class="mini-cal-cell"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === now.getDate();
        html += `<div class="mini-cal-cell date ${isToday ? 'today' : ''}">${d}</div>`;
    }
    document.getElementById('miniCalendar').innerHTML = html;
}
renderMiniCalendar();

// Check Access Function
function checkHealingAccess(e) {
    e.preventDefault();
    const raw = localStorage.getItem("mh_stress_assessment");
    const currentUser = localStorage.getItem('mh_user') || sessionStorage.getItem('mh_user');

    if (!raw) {
        window.location.href = "assessment.html";
        return;
    }

    try {
        const data = JSON.parse(raw);
        // FORCE RETAKE if email missing or mismatch
        if (!data.userEmail || data.userEmail !== currentUser) {
            localStorage.removeItem("mh_stress_assessment"); // Clean up
            window.location.href = "assessment.html";
            return;
        }
        if (typeof data.totalScore !== "number") {
            window.location.href = "assessment.html";
            return;
        }

        // Success
        window.location.href = "healing-journey.html";

    } catch (err) {
        window.location.href = "assessment.html";
    }
}
