// Function to check login status and update navbar
function getApiBaseUrl() {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (window.location.protocol === 'file:') {
        return 'http://localhost:3000';
    }

    if (isLocalhost && window.location.port && window.location.port !== '3000') {
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    }

    return '';
}

async function parseApiResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return { message: text || 'Request failed' };
}

const API_BASE_URL = getApiBaseUrl();

function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('username');
    const loggedInLinks = document.getElementById('logged-in-links');
    const loggedOutLinks = document.getElementById('logged-out-links');
    const welcomeMessage = document.getElementById('welcome-message');

    if (loggedInUser && loggedInLinks && loggedOutLinks && welcomeMessage) {
        loggedInLinks.style.display = 'flex';
        loggedOutLinks.style.display = 'none';
        welcomeMessage.textContent = `Welcome, ${loggedInUser}`;
    } else if (loggedInLinks && loggedOutLinks) {
        loggedInLinks.style.display = 'none';
        loggedOutLinks.style.display = 'flex';
    }
}

// Get a reference to the sign-up form and add a submit event listener
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await parseApiResponse(response);

            if (!response.ok) {
                alert(data.message || 'Signup failed. Please try again.');
                return;
            }

            alert(data.message || 'User created successfully!');
            if (response.ok) {
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not connect to server. Start backend with: node src/app.js');
        }
    });
}

// Get a reference to the log-in form and add a submit event listener
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await parseApiResponse(response);

            if (!response.ok) {
                alert(data.message || 'Login failed. Please try again.');
                return;
            }

            alert(data.message || 'Login successful!');
            localStorage.setItem('username', data.username); // Save username to localStorage
            if (data.userId) {
                localStorage.setItem('userId', data.userId);
            }
            window.location.href = 'index.html'; // Redirect to the home page on successful login
        } catch (error) {
            console.error('Error:', error);
            alert('Could not connect to server. Start backend with: node src/app.js');
        }
    });
}

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
}

// Check login status on page load
checkLoginStatus();