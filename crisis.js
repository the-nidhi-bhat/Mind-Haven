// Auto-scroll to top
window.scrollTo(0, 0);

// Track helpline clicks
document.querySelectorAll('.call-btn, .crisis-number a, .regional-number a, .crisis-call-btn').forEach(link => {
    link.addEventListener('click', function () {
        console.log('Crisis helpline accessed:', this.textContent.trim());
    });
});
