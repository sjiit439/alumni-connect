const getApiUrl = () => {
    const host = window.location.hostname;
    if (host.includes('app.github.dev')) {
        const codespaceBase = host.replace(/-\d+\.app\.github\.dev$/, '');
        return `https://${codespaceBase}-5000.app.github.dev/api/auth`;
    }
    return window.location.port === '5000' ? '/api/auth' : 'http://localhost:5000/api/auth';
};

const API_URL = getApiUrl();

function toggleAlumniFields() {
    const roleSelect = document.getElementById('role');
    const alumniFields = document.getElementById('alumniFields');
    if (roleSelect && roleSelect.value === 'alumni') {
        if (alumniFields) alumniFields.classList.remove('hidden');
    } else if (alumniFields) {
        alumniFields.classList.add('hidden');
    }
}

function showSuccessPopup(message) {
    const modal = document.getElementById('successModal');
    const modalMsg = document.getElementById('modalMsg');
    if (modalMsg) modalMsg.innerText = message || "Account registered successfully!";
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function hideModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    hideModal();

    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam) {
        const roleSelect = document.getElementById('role');
        if (roleSelect) {
            roleSelect.value = roleParam;
            toggleAlumniFields();
        }
    }

    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgBox = document.getElementById('responseMsg');
            if (msgBox) msgBox.innerText = '';

            const getValue = (id) => {
                const el = document.getElementById(id);
                return el ? el.value : '';
            };

            const payload = {
                fullName: getValue('fullName'),
                email: getValue('email'),
                password: getValue('password'),
                role: getValue('role'),
                course: getValue('course'),
                department: getValue('department'),
                batchYear: getValue('batchYear'),
                company: getValue('company'),
                designation: getValue('designation'),
                linkedinUrl: getValue('linkedinUrl')
            };

            try {
                const res = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (res.ok) {
                    showSuccessPopup(data.message);
                } else {
                    hideModal();
                    if (msgBox) {
                        msgBox.style.color = 'red';
                        msgBox.innerText = data.message || "Registration failed.";
                    }
                }
            } catch (err) {
                console.error('Registration Fetch Error:', err);
                hideModal();
                if (msgBox) {
                    msgBox.style.color = 'red';
                    msgBox.innerText = "Server error. Ensure backend server is running on Port 5000.";
                }
            }
        });
    }
});