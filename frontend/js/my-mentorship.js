const getApiUrl = () => {
    const host = window.location.hostname;
    if (host.includes('app.github.dev')) {
        const codespaceBase = host.replace(/-\d+\.app\.github\.dev$/, '');
        return `https://${codespaceBase}-5000.app.github.dev/api/data`;
    }
    return window.location.port === '5000' ? '/api/data' : 'http://localhost:5000/api/data';
};

const DATA_API_URL = getApiUrl();

document.addEventListener('DOMContentLoaded', async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userStr);
    const container = document.getElementById('mentorshipListContainer');

    try {
        const res = await fetch(`${DATA_API_URL}/mentorship/${user.email}`);
        const requests = await res.json();

        if (requests.length === 0) {
            container.innerHTML = '<p>You have not submitted any mentorship requests yet. Browse the Alumni Directory to request guidance!</p>';
            return;
        }

        container.innerHTML = requests.map(r => `
            <div class="info-card">
                <span class="tag tag-dept">${r.status}</span>
                <h3>To: ${r.alumniName}</h3>
                <p><strong>Topic:</strong> ${r.topic}</p>
                <p class="desc">"${r.message}"</p>
                <p class="posted-by"><small>Sent on ${r.sentAt}</small></p>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p style="color:red;">Error loading mentorship requests.</p>';
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}