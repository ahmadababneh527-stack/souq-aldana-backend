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
                        'X-CSRFToken': csrfToken
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
                    // This alert will show the exact error message from the server
                    alert('Server Response: ' + JSON.stringify(data));
                    if (statusMessage) statusMessage.textContent = data.error || 'Login failed.';
                }

            } catch (error) {
                // This alert will show if there's a network connection problem
                alert('Network or connection error: ' + error.message);
                if (statusMessage) statusMessage.textContent = 'Failed to connect to the server.';
            } finally {
                if (typeof hideSpinner === 'function') hideSpinner();
            }
        });
    }
});