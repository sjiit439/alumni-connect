const API_URL = 'http://localhost:5000/api/auth';

function toggleAlumniFields() {
    const role = document.getElementById('role').value;
    const alumniFields = document.getElementById('alumniFields');
    if (role === 'alumni') {
        alumniFields.classList.remove('hidden');
    } else {
        alumniFields.classList.add('hidden');
    }
}

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
        msgBox.innerText = "Server error. Make sure backend server is running.";
    }
});