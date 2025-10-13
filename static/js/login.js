// static/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const statusMessage = document.getElementById('login-status');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            if (typeof showSpinner === 'function') showSpinner();

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            try {
                const response = await fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // This is the only security token needed here
                        'X-CSRFToken': csrfToken
                        // ✨ The incorrect line has been removed from here ✨
                    },
                    body: JSON.stringify({
                        username: usernameInput.value,
                        password: passwordInput.value
                    })
                });

                if (response.ok) {
                    // On success, redirect to the homepage
                    window.location.href = '/';
                } else {
                    const data = await response.json();
                    if (statusMessage) statusMessage.textContent = data.error || 'Login failed.';
                }

            } catch (error) {
                if (statusMessage) statusMessage.textContent = 'Failed to connect to the server.';
            } finally {
                if (typeof hideSpinner === 'function') hideSpinner();
            }
        });
    }
});