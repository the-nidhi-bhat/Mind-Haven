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

const quotes = [
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Dream bigger. Do bigger.", author: "Unknown" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "Do something today that your future self will thank you for.", author: "Unknown" }
];

function loadDailyQuote() {
    const today = new Date().getDate();
    const quote = quotes[today % quotes.length];
    document.getElementById('dailyQuote').textContent = `"${quote.text}"`;
    document.getElementById('quoteAuthor').textContent = `— ${quote.author}`;
}

function showQuote(index) {
    const quote = quotes[index];
    document.getElementById('dailyQuote').textContent = `"${quote.text}"`;
    document.getElementById('quoteAuthor').textContent = `— ${quote.author}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function speakAffirmation(text) {
    alert(`✨ ${text} ✨`);
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    }
}

loadDailyQuote();
