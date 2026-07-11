const API_URL = 'http://localhost:5000/api/auth';

function toggleAlumniFields() {
    const roleSelect = document.getElementById('role');
    const alumniFields = document.getElementById('alumniFields');
    if (roleSelect && roleSelect.value === 'alumni') {
        alumniFields.classList.remove('hidden');
    } else if (alumniFields) {
        alumniFields.classList.add('hidden');
    }
}

// Check URL query parameters (e.g., register.html?role=alumni)
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam) {
        const roleSelect = document.getElementById('role');
        if (roleSelect) {
            roleSelect.value = roleParam;
            toggleAlumniFields();
        }
    }
});

// Handle Form Submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgBox = document.getElementById('responseMsg');
    
    const payload = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        department: document.getElementById('department').value,
        batchYear: document.getElementById('batchYear').value,
        company: document.getElementById('company').value,
        designation: document.getElementById('designation').value,
        linkedinUrl: document.getElementById('linkedinUrl').value
    };

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            msgBox.style.color = 'green';
            msgBox.innerText = data.message;
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            msgBox.style.color = 'red';
            msgBox.innerText = data.message;
        }
    } catch (err) {
        msgBox.style.color = 'red';
        msgBox.innerText = "Server error. Ensure backend server is running.";
    }
});