document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Navigation Toggle Controls
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');
    const navLinks = document.querySelectorAll('.nav-links a');

    const toggleMenu = () => {
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');

        // Change icon between Bars and Close
        const icon = menuToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
        navOverlay.addEventListener('click', toggleMenu);

        // Close menu when clicking any nav link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    // 2. Animated Stats Counter
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateStats = () => {
        statNumbers.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            const count = +stat.innerText;
            const increment = target / 100;

            if (count < target) {
                stat.innerText = Math.ceil(count + increment);
                setTimeout(animateStats, 20);
            } else {
                stat.innerText = target + "+";
            }
        });
    };

    // Trigger stats animation when scrolling into view
    let animated = false;
    window.addEventListener('scroll', () => {
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            const sectionPos = statsSection.getBoundingClientRect().top;
            const screenPos = window.innerHeight;

            if (sectionPos < screenPos && !animated) {
                animateStats();
                animated = true;
            }
        }
    });
});

// 3. Authentication Handlers
function openLoginModal() {
    alert("Login modal will open here.");
}

function openRegisterModal(role = 'default') {
    if (role !== 'default') {
        alert(`Opening registration form for: ${role.toUpperCase()}`);
    } else {
        alert("Opening registration modal.");
    }
}