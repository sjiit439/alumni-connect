const getApiUrl = () => {
    const host = window.location.hostname;
    if (host.includes('app.github.dev')) {
        const codespaceBase = host.replace(/-\d+\.app\.github\.dev$/, '');
        return `https://${codespaceBase}-5000.app.data`;
    }
    return window.location.port === '5000' ? '/api/data' : 'http://localhost:5000/api/data';
};

const DATA_API_URL = getApiUrl();

document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userStr);

    if (document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').innerText = user.fullName;
    if (document.getElementById('studentName')) document.getElementById('studentName').innerText = user.fullName;
    if (document.getElementById('alumniName')) document.getElementById('alumniName').innerText = user.fullName;
    if (document.getElementById('alumniRole')) document.getElementById('alumniRole').innerText = user.designation || 'Alumnus';
    if (document.getElementById('alumniCompany')) document.getElementById('alumniCompany').innerText = user.company || 'Ravenshaw';

    // Handle Job Submission by Alumni
    const jobForm = document.getElementById('postJobForm');
    if (jobForm) {
        jobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgBox = document.getElementById('jobMsg');

            const payload = {
                title: document.getElementById('jobTitle').value,
                company: document.getElementById('jobCompany').value,
                type: document.getElementById('jobType').value,
                location: document.getElementById('jobLocation').value,
                applyLink: document.getElementById('jobApplyLink').value,
                description: document.getElementById('jobDescription').value,
                postedBy: user.fullName
            };

            try {
                const res = await fetch(`${DATA_API_URL}/jobs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (res.ok) {
                    msgBox.style.color = 'green';
                    msgBox.innerText = data.message;
                    jobForm.reset();
                } else {
                    msgBox.style.color = 'red';
                    msgBox.innerText = data.message;
                }
            } catch (err) {
                msgBox.style.color = 'red';
                msgBox.innerText = 'Failed to submit opportunity.';
            }
        });
    }
});

// Toggle Alumni Directory Section & Fetch Data
async function showAlumniSection() {
    const section = document.getElementById('alumniDirectorySection');
    const jobsSection = document.getElementById('jobsSection');
    if (jobsSection) jobsSection.classList.add('hidden');
    
    section.classList.remove('hidden');
    section.scrollIntoView({ behavior: 'smooth' });

    const container = document.getElementById('alumniListContainer');
    try {
        const res = await fetch(`${DATA_API_URL}/alumni`);
        const alumni = await res.json();

        if (alumni.length === 0) {
            container.innerHTML = '<p>No alumni profiles registered yet.</p>';
            return;
        }

        container.innerHTML = alumni.map(a => `
            <div class="info-card">
                <h3><i class="fa-solid fa-user-tie"></i> ${a.fullName}</h3>
                <p><strong>Role:</strong> ${a.designation || 'Alumnus'} at ${a.company || 'N/A'}</p>
                <p><strong>Dept:</strong> ${a.department} (${a.batchYear})</p>
                <p><strong>Email:</strong> <a href="mailto:${a.email}">${a.email}</a></p>
                ${a.linkedinUrl ? `<a href="${a.linkedinUrl}" target="_blank" class="link-btn"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>` : ''}
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p style="color:red;">Error fetching alumni directory.</p>';
    }
}

// Toggle Jobs Section & Fetch Data
async function showJobsSection() {
    const section = document.getElementById('jobsSection');
    const alumniSection = document.getElementById('alumniDirectorySection');
    if (alumniSection) alumniSection.classList.add('hidden');

    section.classList.remove('hidden');
    section.scrollIntoView({ behavior: 'smooth' });

    const container = document.getElementById('jobsListContainer');
    try {
        const res = await fetch(`${DATA_API_URL}/jobs`);
        const jobs = await res.json();

        if (jobs.length === 0) {
            container.innerHTML = '<p>No active opportunities posted yet.</p>';
            return;
        }

        container.innerHTML = jobs.map(j => `
            <div class="info-card job-card">
                <span class="tag">${j.type}</span>
                <h3>${j.title}</h3>
                <p><strong>Company:</strong> ${j.company} (${j.location})</p>
                <p class="desc">${j.description}</p>
                <p class="posted-by"><small>Posted by ${j.postedBy} on ${j.createdAt}</small></p>
                <a href="${j.applyLink}" target="_blank" class="btn btn-primary btn-sm">Apply / Contact</a>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p style="color:red;">Error loading opportunities.</p>';
    }
}

// Toggle Post Job Form for Alumni
function togglePostJobForm() {
    const section = document.getElementById('postJobSection');
    section.classList.toggle('hidden');
    if (!section.classList.contains('hidden')) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}