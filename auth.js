
(function () {
    // List of allowed public pages
    const publicPages = ['index.html', 'sign-in.html', ''];

    const path = window.location.pathname;
    const page = path.split("/").pop();

    // Expose signOut globally
    // Expose signOut globally
    window.signOut = function () {
        // Clear all user-specific data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('mh_') && key !== 'mh_theme') {
                localStorage.removeItem(key);
            }
        });
        sessionStorage.clear();
        window.location.href = 'sign-in.html';
    };

    // If current page is public, do nothing
    if (publicPages.includes(page)) {
        return;
    }

    // Check for user session in either Local (Persistent) or Session (Temporary) storage
    const user = localStorage.getItem('mh_user') || sessionStorage.getItem('mh_user');

    // If not logged in, redirect to sign-in
    if (!user) {
        sessionStorage.setItem('mh_redirect', window.location.href);
        window.location.href = 'sign-in.html';
    }
})();
