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
        const encodedEmail = encodeURIComponent(user.email);
        const res = await fetch(`${DATA_API_URL}/mentorship/${encodedEmail}`);
        
        if (!res.ok) {
            throw new Error(`HTTP Error Status: ${res.status}`);
        }

        const requests = await res.json();

        if (!requests || requests.length === 0) {
            container.innerHTML = `
                <div class="info-card" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-envelope-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <p style="color: #64748b; font-size: 1.1rem;">You haven't requested mentorship from any seniors yet.</p>
                    <a href="student-dashboard.html" class="btn btn-primary" style="display: inline-block; margin-top: 1rem;">Browse Alumni Directory</a>
                </div>
            `;
            return;
        }

        container.innerHTML = requests.map(r => `
            <div class="info-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <span class="tag tag-intern" style="background: #e0f2fe; color: #0369a1; font-weight: 700;">
                        <i class="fa-solid fa-clock"></i> ${r.status || 'Pending'}
                    </span>
                    <span style="font-size: 0.8rem; color: #94a3b8;">${r.sentAt || ''}</span>
                </div>
                <h3 style="margin: 0.5rem 0;"><i class="fa-solid fa-user-tie"></i> Sent to: ${r.alumniName}</h3>
                <p><strong>Topic:</strong> ${r.topic}</p>
                <div class="desc" style="background: #f8fafc; border-left: 3px solid #cbd5e1; padding: 0.75rem; margin-top: 0.5rem; border-radius: 4px;">
                    <strong style="font-size: 0.8rem; color: #64748b; display: block; margin-bottom: 0.25rem;">Your Message:</strong>
                    <span style="font-style: italic; color: #334155;">"${r.message}"</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Mentorship Fetch Error:', err);
        container.innerHTML = '<p style="color:red; text-align: center;">Error loading mentorship records. Ensure backend server is running.</p>';
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}