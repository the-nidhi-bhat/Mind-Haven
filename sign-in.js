// Check if already logged in
if (localStorage.getItem('mh_user') || sessionStorage.getItem('mh_user')) {
    window.location.href = 'journey.html';
}

// Dark mode sync via mh_theme
function initTheme() {
    const savedTheme = localStorage.getItem('mh_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggle = document.getElementById('themeToggle');
    const icon = toggle.querySelector('i');
    const text = toggle.querySelector('span');
    if (savedTheme === 'dark') {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark';
        toggle.classList.add('active');
    }
}

document.getElementById('themeToggle').addEventListener('click', function () {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('mh_theme', next);
    const icon = this.querySelector('i');
    const text = this.querySelector('span');
    if (next === 'dark') {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark';
        this.classList.add('active');
    } else {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light';
        this.classList.remove('active');
    }
});

initTheme();

// Toast helper
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- Auth Logic ---

const tabSignIn = document.getElementById('tabSignIn');
const tabSignUp = document.getElementById('tabSignUp');
const authForm = document.getElementById('authForm');
const nameField = document.getElementById('nameField');
const signInOptions = document.getElementById('signInOptions');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const submitBtn = document.getElementById('submitBtn');

let isSignUp = false;

// Switch Tabs
function setMode(signUp) {
    isSignUp = signUp;
    if (isSignUp) {
        tabSignIn.classList.remove('active');
        tabSignUp.classList.add('active');
        nameField.style.display = 'flex';
        signInOptions.style.display = 'none';
        pageTitle.textContent = 'Create Account';
        pageSubtitle.textContent = 'Join Mindful Haven to start your wellness journey.';
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
    } else {
        tabSignIn.classList.add('active');
        tabSignUp.classList.remove('active');
        nameField.style.display = 'none';
        signInOptions.style.display = 'flex';
        pageTitle.textContent = 'Welcome Back';
        pageSubtitle.textContent = 'Enter your details to continue your journey.';
        submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Sign In';
    }
}

tabSignIn.addEventListener('click', () => setMode(false));
tabSignUp.addEventListener('click', () => setMode(true));

// Handle Auth Submission
authForm.addEventListener('submit', function (e) {
    e.preventDefault();

    try {
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const name = document.getElementById('fullName').value.trim();

        if (!email || !password) {
            showToast('Please fill in all fields.');
            return;
        }

        // Simulate specific DB logic
        let userDB = [];
        try {
            userDB = JSON.parse(localStorage.getItem('mh_users_db')) || [];
            if (!Array.isArray(userDB)) userDB = [];
        } catch (err) {
            userDB = [];
        }

        if (isSignUp) {
            // --- SIGN UP ---
            if (password.length < 6) {
                showToast('Password must be at least 6 characters.');
                return;
            }

            // Check if user exists
            const existing = userDB.find(u => u.email === email);
            if (existing) {
                showToast('Account already exists. Please sign in.');
                setMode(false); // Switch to sign in
                return;
            }

            // Create new user
            const newUser = {
                email: email,
                password: password, // In a real app, hash this!
                name: name || 'Friend',
                joined: new Date().toISOString()
            };

            userDB.push(newUser);
            localStorage.removeItem('mh_stress_assessment'); // New user must take assessment
            localStorage.setItem('mh_users_db', JSON.stringify(userDB)); // Save DB

            // Auto Login
            completeLogin(newUser.email);
            showToast('Account created successfully! Welcome.');

        } else {
            // --- SIGN IN ---
            const user = userDB.find(u => u.email === email && u.password === password);

            if (user) {
                completeLogin(user.email);
                showToast('Welcome back, ' + (user.name || 'Friend') + '!');
            } else {
                showToast('Invalid email or password.');
            }
        }
    } catch (err) {
        console.error(err);
        showToast('An error occurred. Please try again.');
    }
});

function completeLogin(email) {
    const remember = document.getElementById('remember').checked;
    if (remember) {
        localStorage.setItem('mh_user', email);
        sessionStorage.removeItem('mh_user'); // Clean session if switching to persistent
    } else {
        sessionStorage.setItem('mh_user', email);
        localStorage.removeItem('mh_user'); // Clean persistent if switching to session
    }

    setTimeout(() => {
        window.location.href = 'journey.html';
    }, 1500);
}

// Google/Github (Demo)
// Google Sign-In (Firebase)
document.getElementById('googleBtn').addEventListener('click', function () {
    if (!auth) {
        showToast('Firebase not initialized. Check config.');
        return;
    }

    auth.signInWithPopup(googleProvider)
        .then((result) => {
            const user = result.user;
            console.log('User signed in:', user);

            // Integrate with local Mock DB to ensure user existence consistency
            let userDB = [];
            try {
                userDB = JSON.parse(localStorage.getItem('mh_users_db')) || [];
                if (!Array.isArray(userDB)) userDB = [];
            } catch (e) { userDB = []; }

            const existing = userDB.find(u => u.email === user.email);
            if (!existing) {
                userDB.push({
                    email: user.email,
                    name: user.displayName || 'Google User',
                    password: 'google-oauth-user', // Placemarker
                    joined: new Date().toISOString()
                });
                localStorage.removeItem('mh_stress_assessment'); // New user must take assessment
                localStorage.setItem('mh_users_db', JSON.stringify(userDB));
            }

            showToast('Welcome, ' + (user.displayName || 'Traveler'));

            // Proceed to main app logic
            completeLogin(user.email);
        })
        .catch((error) => {
            console.error('Sign-in error:', error);
            showToast('Error: ' + error.message);
        });
});

document.getElementById('githubBtn').addEventListener('click', function () {
    showToast('GitHub sign-in (Demo Success)');
    setTimeout(() => {
        completeLogin('github-user@demo.com');
    }, 1500);
});

// Forgot Password
document.getElementById('forgotLink').addEventListener('click', function (e) {
    e.preventDefault();
    showToast('Reset link sent (Demo)');
});

// Toggle Password Visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function () {
    // Toggle the type attribute
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle the eye / eye slash icon
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// Guest Mode
document.getElementById('guestBtn').addEventListener('click', function () {
    showToast('Entering Guest Mode...');
    setTimeout(() => {
        sessionStorage.setItem('mh_user', 'guest_user');
        // Ensure we don't overwrite persistent login if it exists, though unlikely if on sign-in page
        if (localStorage.getItem('mh_user')) localStorage.removeItem('mh_user');

        window.location.href = 'journey.html';
    }, 1000);
});
