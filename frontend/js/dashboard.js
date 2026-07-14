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

    const jobForm = document.getElementById('postJobForm');
    if (jobForm) {
        jobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgBox = document.getElementById('jobMsg');

            const oppType = document.getElementById('oppType').value;

            const payload = {
                type: oppType,
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
});

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
            ${a.linkedinUrl ? `<a href="${a.linkedinUrl}" target="_blank" class="link-btn"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>` : ''}
        </div>
    `).join('');
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
                    <p><strong>Job Profile:</strong> ${j.jobProfile || 'N/A'}</p>
                    <p><strong>Experience Required:</strong> ${j.experienceNeeded || 'N/A'}</p>
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
                    <p><strong>Experience Req:</strong> ${j.internExperience || 'Freshers'}</p>
                    <p><strong>Certificates Provided:</strong> ${j.certificatesProvided || 'Yes'}</p>
                    <p><strong>Job Opportunity (PPO):</strong> ${j.furtherJobOpportunities || 'N/A'}</p>
                    <p class="desc">${j.description}</p>
                    <p class="posted-by"><small>Posted by ${j.postedBy} on ${j.createdAt}</small></p>
                </div>
            `;
        }
    }).join('');
}

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