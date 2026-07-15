const getApiUrl = () => {
    const host = window.location.hostname;
    if (host.includes('app.github.dev')) {
        const codespaceBase = host.replace(/-\d+\.app\.github\.dev$/, '');
        return `https://${codespaceBase}-5000.app.github.dev/api/data`;
    }
    return window.location.port === '5000' ? '/api/data' : 'http://localhost:5000/api/data';
};

const DATA_API_URL = getApiUrl();
let rawEventsData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

async function loadEvents() {
    try {
        const res = await fetch(`${DATA_API_URL}/events`);
        rawEventsData = await res.json();
        filterEventsFeed();
    } catch (err) {
        document.getElementById('eventsContainer').innerHTML = '<p style="color:red;">Failed to load events feed.</p>';
    }
}

function filterEventsFeed() {
    const type = document.getElementById('filterType').value;
    const dept = document.getElementById('filterDept').value.toLowerCase();

    const filtered = rawEventsData.filter(item => {
        const matchType = !type || item.type === type;
        const matchDept = !dept || (item.department && item.department.toLowerCase() === dept);
        return matchType && matchDept;
    });

    const container = document.getElementById('eventsContainer');
    if (filtered.length === 0) {
        container.innerHTML = '<p>No matching events or news posts found.</p>';
        return;
    }

    container.innerHTML = filtered.map(item => {
        if (item.type === 'Webinar') {
            return `
                <div class="info-card">
                    <span class="tag tag-job"><i class="fa-solid fa-video"></i> Virtual Webinar</span>
                    <span class="tag tag-dept">${item.department}</span>
                    <h3>${item.title}</h3>
                    <p><strong>Speaker:</strong> ${item.speaker}</p>
                    <p><strong>Scheduled:</strong> ${new Date(item.eventDate).toLocaleString()}</p>
                    <p class="desc">${item.description}</p>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem; align-items: center;">
                        <a href="${item.meetingLink}" target="_blank" class="btn btn-primary btn-sm">Join Meeting</a>
                        <button class="btn btn-secondary btn-sm" onclick="submitRSVP('${item.id}')">
                            👍 RSVP (${item.rsvps || 0})
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="info-card">
                    <span class="tag tag-intern"><i class="fa-solid fa-newspaper"></i> Campus News</span>
                    <span class="tag tag-dept">${item.category}</span>
                    <h3>${item.title}</h3>
                    <p class="desc">${item.description}</p>
                    <p class="posted-by"><small>Published by ${item.speaker} on ${item.createdAt}</small></p>
                </div>
            `;
        }
    }).join('');
}

async function submitRSVP(eventId) {
    try {
        const res = await fetch(`${DATA_API_URL}/events/${eventId}/rsvp`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            alert('RSVP Confirmed! See you at the session.');
            loadEvents();
        }
    } catch (err) {
        alert('Failed to RSVP.');
    }
}

function goBackDashboard() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        window.location.href = user.role === 'alumni' ? 'alumni-dashboard.html' : 'student-dashboard.html';
    } else {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}