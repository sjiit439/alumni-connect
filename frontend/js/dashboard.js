document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    
    // Redirect if unauthenticated
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userStr);

    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) userNameDisplay.innerText = user.fullName;

    const studentName = document.getElementById('studentName');
    if (studentName) studentName.innerText = user.fullName;

    const alumniName = document.getElementById('alumniName');
    if (alumniName) alumniName.innerText = user.fullName;

    const alumniRole = document.getElementById('alumniRole');
    if (alumniRole) alumniRole.innerText = user.designation || 'Alumnus';

    const alumniCompany = document.getElementById('alumniCompany');
    if (alumniCompany) alumniCompany.innerText = user.company || 'Ravenshaw';
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}