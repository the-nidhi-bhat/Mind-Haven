// Theme Toggle
function syncTheme() {
    const saved = localStorage.getItem('mh_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeToggle');
    const icon = btn.querySelector('i');
    const text = btn.querySelector('span');
    if (saved === 'dark') {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark';
    } else {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light';
    }
}

document.getElementById('themeToggle').addEventListener('click', function () {
    const html = document.documentElement;
    const curr = html.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('mh_theme', next);
    syncTheme();
});

syncTheme();

// Book Session
function bookSession(counselorName) {
    alert(`📅 Booking session with ${counselorName}!\n\nYou will be redirected to the booking page.`);
    // In a real app, this would navigate to a booking page or open a modal
}
