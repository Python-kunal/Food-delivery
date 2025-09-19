// Function to check login status and update navbar
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('username');
    const loggedInLinks = document.getElementById('logged-in-links');
    const loggedOutLinks = document.getElementById('logged-out-links');
    const welcomeMessage = document.getElementById('welcome-message');

    if (loggedInUser && loggedInLinks && loggedOutLinks && welcomeMessage) {
        loggedInLinks.style.display = 'flex';
        loggedOutLinks.style.display = 'none';
        welcomeMessage.textContent = `Welcome, ${loggedInUser}`;
    } else if (loggedOutLinks) {
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
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            alert(data.message);
            if (response.ok) {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
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
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            alert(data.message);
            if (response.ok) {
                localStorage.setItem('username', data.username); // Save username to localStorage
                window.location.href = '/'; // Redirect to the home page on successful login
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        }
    });
}

function logout() {
    localStorage.removeItem('username');
    window.location.href = '/';
}

// Check login status on page load
checkLoginStatus();