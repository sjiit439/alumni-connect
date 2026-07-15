const getApiUrl = () => {
    const host = window.location.hostname;
    if (host.includes('app.github.dev')) {
        const codespaceBase = host.replace(/-\d+\.app\.github\.dev$/, '');
        return `https://${codespaceBase}-5000.app.github.dev/api/data`;
    }
    return window.location.port === '5000' ? '/api/data' : 'http://localhost:5000/api/data';
};

const DATA_API_URL = getApiUrl();
let rawAlumniData = [];
let rawJobsData = [];
let activeAlumniForMentorship = null;

// GLOBAL LOGOUT FUNCTION
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

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

    // Form: Post Job / Internship
    const jobForm = document.getElementById('postJobForm');
    if (jobForm) {
        jobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgBox = document.getElementById('jobMsg');

            const payload = {
                type: document.getElementById('oppType').value,
                department: document.getElementById('oppDepartment').value,
                company: document.getElementById('companyName').value,
                description: document.getElementById('oppDescription').value,
                postedBy: user.fullName,
                post: document.getElementById('jobPost').value,
                salary: document.getElementById('jobSalary').value,
                jobProfile: document.getElementById('jobProfile').value,
                experienceNeeded: document.getElementById('jobExperience').value,
                placeOfRecruitment: document.getElementById('jobPlace').value,
                stipend: document.getElementById('internStipend').value,
                internExperience: document.getElementById('internExperience').value,
                duration: document.getElementById('internDuration').value,
                certificatesProvided: document.getElementById('internCertificates').value,
                furtherJobOpportunities: document.getElementById('internJobOpportunity').value
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

    // Form: Post Webinar / Event
    const eventForm = document.getElementById('postEventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgBox = document.getElementById('eventMsg');

            const payload = {
                type: document.getElementById('eventType').value,
                title: document.getElementById('eventTitle').value,
                category: document.getElementById('eventCategory').value,
                department: document.getElementById('eventDepartment').value,
                eventDate: document.getElementById('eventDate').value,
                speaker: user.fullName,
                meetingLink: document.getElementById('eventLink').value,
                description: document.getElementById('eventDesc').value
            };

            try {
                const res = await fetch(`${DATA_API_URL}/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (res.ok) {
                    msgBox.style.color = 'green';
                    msgBox.innerText = data.message;
                    eventForm.reset();
                } else {
                    msgBox.style.color = 'red';
                    msgBox.innerText = data.message;
                }
            } catch (err) {
                msgBox.style.color = 'red';
                msgBox.innerText = 'Failed to publish event.';
            }
        });
    }
});

// --- ALUMNI DASHBOARD: SHOW RECEIVED MENTORSHIP REQUESTS ---
async function showMentorshipRequests() {
    const postJobSection = document.getElementById('postJobSection');
    const postEventSection = document.getElementById('postEventSection');
    if (postJobSection) postJobSection.classList.add('hidden');
    if (postEventSection) postEventSection.classList.add('hidden');

    const section = document.getElementById('receivedMentorshipSection');
    section.classList.remove('hidden');
    section.scrollIntoView({ behavior: 'smooth' });

    const user = JSON.parse(localStorage.getItem('user'));
    const container = document.getElementById('mentorshipRequestsContainer');

    try {
        const identifier = encodeURIComponent(user.id || user.fullName);
        const res = await fetch(`${DATA_API_URL}/mentorship/alumni/${identifier}`);
        const requests = await res.json();

        if (!requests || requests.length === 0) {
            container.innerHTML = '<p>No mentorship requests received yet.</p>';
            return;
        }

        container.innerHTML = requests.map(r => `
            <div class="info-card">
                <span class="tag tag-job"><i class="fa-solid fa-user-graduate"></i> Student Request</span>
                <h3>${r.studentName}</h3>
                <p><strong>Department:</strong> ${r.studentDept} (${r.studentCourse})</p>
                <p><strong>Email:</strong> <a href="mailto:${r.studentEmail}">${r.studentEmail}</a></p>
                <p><strong>Topic / Guidance Area:</strong> ${r.topic}</p>
                <p class="desc">"${r.message}"</p>
                <p class="posted-by"><small>Received on ${r.sentAt}</small></p>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p style="color:red;">Failed to load received mentorship requests.</p>';
    }
}

// --- STUDENT DASHBOARD: DIRECTORY & MENTORSHIP ---
async function showAlumniSection() {
    if (document.getElementById('jobsSection')) document.getElementById('jobsSection').classList.add('hidden');
    const section = document.getElementById('alumniDirectorySection');
    section.classList.remove('hidden');
    section.scrollIntoView({ behavior: 'smooth' });

    try {
        const res = await fetch(`${DATA_API_URL}/alumni`);
        rawAlumniData = await res.json();
        filterAlumniDirectory();
    } catch (err) {
        document.getElementById('alumniListContainer').innerHTML = '<p style="color:red;">Error loading alumni directory.</p>';
    }
}

function filterAlumniDirectory() {
    const dept = document.getElementById('filterAlumniDept').value.toLowerCase();
    const course = document.getElementById('filterAlumniCourse').value.toLowerCase();
    const batch = document.getElementById('filterAlumniBatch').value.trim();

    const filtered = rawAlumniData.filter(a => {
        const matchDept = !dept || (a.department && a.department.toLowerCase() === dept);
        const matchCourse = !course || (a.course && a.course.toLowerCase() === course);
        const matchBatch = !batch || (a.batchYear && a.batchYear.toString().trim().includes(batch));
        return matchDept && matchCourse && matchBatch;
    });

    const container = document.getElementById('alumniListContainer');
    if (filtered.length === 0) {
        container.innerHTML = '<p>No matching alumni records found.</p>';
        return;
    }

    container.innerHTML = filtered.map(a => `
        <div class="info-card">
            <h3><i class="fa-solid fa-user-tie"></i> ${a.fullName}</h3>
            <p><strong>Role:</strong> ${a.designation} at ${a.company}</p>
            <p><strong>Degree:</strong> ${a.course} in ${a.department} (${a.batchYear})</p>
            <p><strong>Email:</strong> <a href="mailto:${a.email}">${a.email}</a></p>
            <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${a.linkedinUrl ? `<a href="${a.linkedinUrl}" target="_blank" class="btn btn-secondary btn-sm"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>` : ''}
                <button class="btn btn-primary btn-sm" onclick="openMentorshipModal('${a.id}', '${a.fullName}')">🤝 Request Mentorship</button>
            </div>
        </div>
    `).join('');
}

function openMentorshipModal(alumniId, alumniName) {
    activeAlumniForMentorship = { id: alumniId, name: alumniName };
    document.getElementById('mentorModalTitle').innerText = `Request Mentorship from ${alumniName}`;
    const modal = document.getElementById('mentorshipModal');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    document.getElementById('mentorModalMsg').innerText = '';
}

function closeMentorshipModal() {
    const modal = document.getElementById('mentorshipModal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
    document.getElementById('mentorTopic').value = '';
    document.getElementById('mentorMessage').value = '';
    activeAlumniForMentorship = null;
}

async function submitMentorshipRequest() {
    const user = JSON.parse(localStorage.getItem('user'));
    const topic = document.getElementById('mentorTopic').value.trim();
    const message = document.getElementById('mentorMessage').value.trim();
    const msgBox = document.getElementById('mentorModalMsg');

    if (!topic || !message) {
        msgBox.style.color = 'red';
        msgBox.innerText = 'Please fill in both topic and message.';
        return;
    }

    try {
        const res = await fetch(`${DATA_API_URL}/mentorship`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentEmail: user.email,
                studentName: user.fullName,
                studentDept: user.department,
                studentCourse: user.course,
                alumniId: activeAlumniForMentorship.id,
                alumniName: activeAlumniForMentorship.name,
                topic,
                message
            })
        });

        const data = await res.json();
        if (res.ok) {
            msgBox.style.color = 'green';
            msgBox.innerText = data.message;
            setTimeout(() => {
                closeMentorshipModal();
                window.location.href = 'my-mentorship.html';
            }, 1000);
        } else {
            msgBox.style.color = 'red';
            msgBox.innerText = data.message;
        }
    } catch (err) {
        msgBox.style.color = 'red';
        msgBox.innerText = 'Failed to submit request.';
    }
}

async function showJobsSection() {
    if (document.getElementById('alumniDirectorySection')) document.getElementById('alumniDirectorySection').classList.add('hidden');
    const section = document.getElementById('jobsSection');
    section.classList.remove('hidden');
    section.scrollIntoView({ behavior: 'smooth' });

    try {
        const res = await fetch(`${DATA_API_URL}/jobs`);
        rawJobsData = await res.json();
        filterJobsBoard();
    } catch (err) {
        document.getElementById('jobsListContainer').innerHTML = '<p style="color:red;">Error loading opportunities.</p>';
    }
}

function filterJobsBoard() {
    const dept = document.getElementById('filterJobDept').value.toLowerCase();
    const filtered = rawJobsData.filter(j => !dept || (j.department && j.department.toLowerCase() === dept));
    const container = document.getElementById('jobsListContainer');

    if (filtered.length === 0) {
        container.innerHTML = '<p>No opportunities posted for this department yet.</p>';
        return;
    }

    container.innerHTML = filtered.map(j => {
        if (j.type === 'Job') {
            return `
                <div class="info-card job-card">
                    <span class="tag tag-job">Full-Time Job</span>
                    <span class="tag tag-dept">${j.department}</span>
                    <h3>${j.post || j.title}</h3>
                    <p><strong>Company:</strong> ${j.company}</p>
                    <p><strong>Salary:</strong> ${j.salary || 'N/A'}</p>
                    <p><strong>Location:</strong> ${j.placeOfRecruitment || 'N/A'}</p>
                    <p class="desc">${j.description}</p>
                    <p class="posted-by"><small>Posted by ${j.postedBy} on ${j.createdAt}</small></p>
                </div>
            `;
        } else {
            return `
                <div class="info-card job-card">
                    <span class="tag tag-intern">Internship</span>
                    <span class="tag tag-dept">${j.department}</span>
                    <h3>${j.company} Internship</h3>
                    <p><strong>Stipend:</strong> ${j.stipend || 'Unpaid'}</p>
                    <p><strong>Duration:</strong> ${j.duration || 'N/A'}</p>
                    <p class="desc">${j.description}</p>
                    <p class="posted-by"><small>Posted by ${j.postedBy} on ${j.createdAt}</small></p>
                </div>
            `;
        }
    }).join('');
}

function toggleJobInternFields() {
    const oppType = document.getElementById('oppType').value;
    const jobFields = document.getElementById('jobSpecificFields');
    const internFields = document.getElementById('internshipSpecificFields');

    if (oppType === 'Job') {
        jobFields.classList.remove('hidden');
        internFields.classList.add('hidden');
    } else {
        jobFields.classList.add('hidden');
        internFields.classList.remove('hidden');
    }
}

function togglePostJobForm() {
    const receivedMentorshipSection = document.getElementById('receivedMentorshipSection');
    const postEventSection = document.getElementById('postEventSection');
    if (receivedMentorshipSection) receivedMentorshipSection.classList.add('hidden');
    if (postEventSection) postEventSection.classList.add('hidden');

    const section = document.getElementById('postJobSection');
    section.classList.toggle('hidden');
    if (!section.classList.contains('hidden')) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function togglePostEventForm() {
    const receivedMentorshipSection = document.getElementById('receivedMentorshipSection');
    const postJobSection = document.getElementById('postJobSection');
    if (receivedMentorshipSection) receivedMentorshipSection.classList.add('hidden');
    if (postJobSection) postJobSection.classList.add('hidden');

    const section = document.getElementById('postEventSection');
    section.classList.toggle('hidden');
    if (!section.classList.contains('hidden')) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}