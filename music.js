// Theme Logic
const rootEl = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');

function applyTheme(theme) {
    rootEl.setAttribute('data-theme', theme);
    localStorage.setItem('mh_theme', theme);
    if (theme === 'dark') {
        toggleBtn.innerHTML = '<i class="fas fa-sun"></i> <span id="themeLabel">Light</span>';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-moon"></i> <span id="themeLabel">Dark</span>';
    }
}

// Initialize
const savedTheme = localStorage.getItem('mh_theme') || 'light';
applyTheme(savedTheme);

toggleBtn.addEventListener('click', () => {
    const current = rootEl.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
});

// --- UTILITY FUNCTIONS FOR DATA PRIVACY ---
function getUserKey(k) {
    // Check auth.js session or manual check
    const user = localStorage.getItem('mh_user') || sessionStorage.getItem('mh_user');
    return user ? `${user}_${k}` : k;
}

function safeReadPlaylist() {
    try {
        const key = getUserKey('mh_playlist');
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function savePlaylist(data) {
    const key = getUserKey('mh_playlist');
    localStorage.setItem(key, JSON.stringify(data));
}

// --- PLAYLIST LOGIC ---
let currentTrack = {
    id: 'ggfebQ-5-UE',
    title: 'Yaman Drut',
    artist: 'Purbayan Chatterjee & Rakesh Chaurasia'
};

let playlist = safeReadPlaylist();

// Explicitly bind the Add to Playlist button to ensure it works
document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.querySelector('.action-btn');
    if (addBtn) {
        // Remove inline onclick if it exists (optional, but cleaner)
        addBtn.removeAttribute('onclick');
        addBtn.addEventListener('click', addToPlaylist);
    }
});

// --- STORAGE MANAGEMENT ---
function clearAppData() {
    if (confirm("This will clear all your saved playlists and settings to fix the storage error. Continue?")) {
        localStorage.clear();
        sessionStorage.clear();
        alert("Storage cleared! The page will now reload.");
        window.location.reload();
    }
}

window.addToPlaylist = function () {
    try {
        playlist = safeReadPlaylist();
        // Check if already exists
        const exists = playlist.some(t => t.id === currentTrack.id);
        if (!exists) {
            playlist.push({ ...currentTrack });
            savePlaylist(playlist);
            renderPlaylist();

            // Visual feedback
            const btn = document.querySelector('.action-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Added!';
            setTimeout(() => btn.innerHTML = originalText, 2000);

            // Scroll to playlist so user sees it
            document.getElementById('playlist-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            const btn = document.querySelector('.action-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-info-circle"></i> Already Added';
            setTimeout(() => btn.innerHTML = originalText, 2000);
        }
    } catch (e) {
        console.error(e);
        if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
            if (confirm("Your browser storage is full! Would you like to clear old data to fix this?")) {
                clearAppData();
            }
        } else {
            alert("Error adding to playlist: " + e.message);
        }
    }
}

window.removeFromPlaylist = function (index) {
    try {
        playlist = safeReadPlaylist();
        playlist.splice(index, 1);
        savePlaylist(playlist);
        renderPlaylist();
    } catch (e) {
        console.error(e);
    }
}

// Escape helper
function escapeStr(str) {
    return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    const grid = document.getElementById('playlist-grid');

    // Refresh playlist from storage to ensure sync
    playlist = safeReadPlaylist();

    if (playlist.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    grid.innerHTML = '';

    playlist.forEach((track, index) => {
        // Determine if this is the currently playing track
        const isPlaying = track.id === currentTrack.id;
        const borderStyle = isPlaying ? 'border-color: var(--accent); background: var(--accent-soft);' : '';
        const safeTitle = escapeStr(track.title);
        const safeArtist = escapeStr(track.artist);

        const item = document.createElement('div');
        item.className = 'music-item';
        item.style = borderStyle;
        item.innerHTML = `
            <div class="icon-box" onclick="playMusic('${track.id}', \`${safeTitle}\`, \`${safeArtist}\`)"><i class="fas fa-play"></i></div>
            <div class="txt" onclick="playMusic('${track.id}', \`${safeTitle}\`, \`${safeArtist}\`)" style="flex:1;">
                <h4>${track.title}</h4>
                <p>${track.artist}</p>
            </div>
            <button onclick="removeFromPlaylist(${index})" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:5px;"><i class="fas fa-trash"></i></button>
        `;
        grid.appendChild(item);
    });
}

// --- CORE PLAY FUNCTION ---
window.play = function (id, title, artist) {
    currentTrack = { id, title, artist };
    const player = document.getElementById('main-player');
    const titleEl = document.getElementById('track-title');
    const artistEl = document.getElementById('track-artist');

    // Force reload iframe to ensure playback starts
    if (player) {
        const src = "https://www.youtube.com/embed/" + id + "?autoplay=1";
        player.src = src;
    }
    if (titleEl) titleEl.innerText = title;
    if (artistEl) artistEl.innerText = artist;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderPlaylist();
};

window.playMusic = function (id, title, artist) {
    window.play(id, title, artist);
};

// Initial Render
renderPlaylist();
