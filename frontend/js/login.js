const API_URL = 'http://localhost:5000/api/auth';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgBox = document.getElementById('loginMsg');

    const payload = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            // Store token & user info locally in browser storage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            msgBox.style.color = 'green';
            msgBox.innerText = "Login successful! Redirecting...";

            // Redirect based on user role
            setTimeout(() => {
                if (data.user.role === 'alumni') {
                    window.location.href = 'alumni-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            }, 1000);
        } else {
            msgBox.style.color = 'red';
            msgBox.innerText = data.message;
        }
    } catch (err) {
        msgBox.style.color = 'red';
        msgBox.innerText = "Failed to connect to backend server.";
    }
});