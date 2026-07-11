document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    
    // Auth Check: Redirect to login if user is not logged in
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userStr);

    // Set Navbar Name
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) userNameDisplay.innerText = user.fullName;

    // Fill Student Info
    const studentName = document.getElementById('studentName');
    if (studentName) studentName.innerText = user.fullName;

    // Fill Alumni Info
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