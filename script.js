/* ==========================================================================
   BytePath Academy JS - Interactivity, Form Validation, & Sheets Integration
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const admissionForm = document.getElementById('admission-form');
    const submitBtn = document.getElementById('submit-btn');
    const successBanner = document.getElementById('form-success-banner');
    const errorBanner = document.getElementById('form-error-banner');
    
    // Roadmap Progress Elements
    const roadmapSection = document.getElementById('roadmap');
    const roadmapProgress = document.getElementById('roadmap-progress');
    const roadmapItems = document.querySelectorAll('.roadmap-item');

    /* --- 1. Sticky Navbar & Shrink on Scroll --- */
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once in case page starts scrolled

    /* --- 2. Mobile Menu Toggle --- */
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
        document.body.classList.toggle('menu-active');
    });

    // Close mobile menu when a nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            navMenu.classList.remove('open');
            document.body.classList.remove('menu-active');
        });
    });

    /* --- 2.5 Programmatic Smooth Scroll & Active Toggle --- */
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Get current navbar height dynamically (shrinks on scroll)
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

            }
        });
    });

    /* --- 3. Scroll Reveal Animations (Intersection Observer) --- */
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Handle delay for items (like grid cards)
                const delay = entry.target.getAttribute('data-delay');
                if (delay) {
                    entry.target.style.transitionDelay = delay + 's';
                }
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));



    /* --- 5. Interactive Roadmap Timeline --- */
    const updateRoadmapProgress = () => {
        if (!roadmapSection || !roadmapProgress) return;

        const sectionRect = roadmapSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate progress line completion percentage
        // Begins when section top reaches mid-screen, ends when section bottom reaches mid-screen
        const startPoint = viewportHeight / 2;
        const totalHeight = sectionRect.height;
        const currentRelativePos = startPoint - sectionRect.top;
        
        let percentage = (currentRelativePos / (totalHeight - startPoint)) * 100;
        percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0 and 100
        
        roadmapProgress.style.height = `${percentage}%`;

        // Auto highlight roadmap nodes based on position
        roadmapItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            // If item center passes 60% of viewport height, highlight its dot
            if (itemRect.top < viewportHeight * 0.65) {
                item.classList.add('active-dot');
            } else {
                item.classList.remove('active-dot');
            }
        });
    };

    window.addEventListener('scroll', updateRoadmapProgress);
    window.addEventListener('resize', updateRoadmapProgress);
    updateRoadmapProgress();

    // Toggle temporary hover class for timeline items
    const timelineCards = document.querySelectorAll('.roadmap-card');
    timelineCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.closest('.roadmap-item').classList.add('active-dot');
        });
        card.addEventListener('mouseleave', () => {
            updateRoadmapProgress(); // Restore normal state
        });
    });

    /* --- 6. Form Validation & Helper Logic --- */
    const validationRules = {
        name: {
            validate: value => value.trim().length >= 3,
            message: 'Name must be at least 3 characters long.'
        },
        mobile: {
            validate: value => /^[6-9]\d{9}$/.test(value.trim()), // Indian 10 digit standard
            message: 'Please enter a valid 10-digit mobile number starting with 6-9.'
        },
        email: {
            validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
            message: 'Please enter a valid email address.'
        },
        qualification: {
            validate: value => value.trim().length > 0,
            message: 'Qualification is required.'
        },
        course: {
            validate: value => value !== '',
            message: 'Please select a course.'
        },
        mode: {
            validate: value => value !== '',
            message: 'Please select a learning mode.'
        }
    };

    const validateField = (inputEl, ruleKey) => {
        const value = inputEl.value;
        const rule = validationRules[ruleKey];
        const groupEl = inputEl.closest('.form-group');
        const errorEl = document.getElementById(`${inputEl.id.replace('form-', '')}-error`);

        if (!rule.validate(value)) {
            groupEl.classList.remove('success-state');
            groupEl.classList.add('error-state');
            if (errorEl) errorEl.textContent = rule.message;
            return false;
        } else {
            groupEl.classList.remove('error-state');
            groupEl.classList.add('success-state');
            if (errorEl) errorEl.textContent = '';
            return true;
        }
    };

    // Attach real-time validation listeners
    const fieldsToValidate = [
        { id: 'form-name', key: 'name' },
        { id: 'form-mobile', key: 'mobile' },
        { id: 'form-email', key: 'email' },
        { id: 'form-qualification', key: 'qualification' },
        { id: 'form-course', key: 'course' },
        { id: 'form-mode', key: 'mode' }
    ];

    fieldsToValidate.forEach(field => {
        const el = document.getElementById(field.id);
        if (el) {
            // Validate on blur
            el.addEventListener('blur', () => validateField(el, field.key));
            
            // Validate on input/change after an error has been marked
            el.addEventListener('input', () => {
                const groupEl = el.closest('.form-group');
                if (groupEl.classList.contains('error-state')) {
                    validateField(el, field.key);
                }
            });
            
            if (el.tagName === 'SELECT') {
                el.addEventListener('change', () => validateField(el, field.key));
            }
        }
    });

    /* --- 7. Google Sheets Integration & Submit Handler --- */
    admissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Run full validation check
        let isFormValid = true;
        fieldsToValidate.forEach(field => {
            const el = document.getElementById(field.id);
            if (el) {
                const isValid = validateField(el, field.key);
                if (!isValid) isFormValid = false;
            }
        });

        if (!isFormValid) {
            // Scroll to the first error
            const firstError = document.querySelector('.form-group.error-state');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim().toLowerCase();
        const mobile = document.getElementById('form-mobile').value.trim();
        const qualification = document.getElementById('form-qualification').value.trim();
        const course = document.getElementById('form-course').value;
        const mode = document.getElementById('form-mode').value;
        const message = document.getElementById('form-message').value.trim();

        // Prevent Duplicate Submissions (Local check)
        const dupKeyEmail = `bytepath_sub_${email}`;
        const dupKeyPhone = `bytepath_sub_${mobile}`;
        if (localStorage.getItem(dupKeyEmail) || localStorage.getItem(dupKeyPhone)) {
            errorBanner.style.display = 'flex';
            errorBanner.querySelector('.error-msg-text').textContent = 'You have already submitted an application. Our team will contact you shortly.';
            errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Generate auto timestamp
        const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        document.getElementById('form-timestamp').value = timestamp;

        // Display Loading state
        submitBtn.classList.add('loading');
        errorBanner.style.display = 'none';
        successBanner.style.display = 'none';

        // Endpoint and payload construction
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbyU99ZotF3T2BUWe0lPJAOupESeTpZkmxLE4fjdOf92PY6lYO6wVErsOw5VL3jZbyBEjw/exec';
        
        // Construct query parameters or urlencoded form body
        const formData = new URLSearchParams();
        formData.append('Timestamp', timestamp);
        formData.append('Name', name);
        formData.append('Mobile', mobile);
        formData.append('Email', email);
        formData.append('Qualification', qualification);
        formData.append('Course', course);
        formData.append('Mode', mode);
        formData.append('Message', message);

        try {
            // Send Fetch POST request. We use 'cors' mode. If redirect occurs, fetch handles it.
            // Google Apps Script requires redirection handling.
            const response = await fetch(scriptUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });

            // Even if response returns redirect or silent success, check status
            if (response.ok || response.status === 200 || response.type === 'opaque') {
                // Success actions
                submitBtn.classList.remove('loading');
                successBanner.style.display = 'flex';
                
                // Set localStorage flags to prevent duplicate submission
                localStorage.setItem(dupKeyEmail, 'true');
                localStorage.setItem(dupKeyPhone, 'true');
                
                // Clean input success borders
                fieldsToValidate.forEach(field => {
                    const el = document.getElementById(field.id);
                    if (el) el.closest('.form-group').classList.remove('success-state');
                });

                // Reset Form
                admissionForm.reset();
                submitBtn.disabled = true; // Disable submit button since they applied
                
                // Scroll to success banner
                successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                throw new Error('Response status failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            submitBtn.classList.remove('loading');
            errorBanner.style.display = 'flex';
            errorBanner.querySelector('.error-msg-text').textContent = 'Failed to submit application. Please check your network connection and try again.';
            errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});

/* --- 8. Helper Functions triggered by Hero buttons --- */
window.selectDemoClass = () => {
    const courseSelect = document.getElementById('form-course');
    const modeSelect = document.getElementById('form-mode');
    const messageArea = document.getElementById('form-message');

    // Preset for demo class
    if (courseSelect) courseSelect.value = 'Level 2 Application Level'; // default prefill
    if (modeSelect) modeSelect.value = 'Hybrid';
    if (messageArea) messageArea.value = 'I would like to book a free demo class.';
    
    // Trigger validation update for visual completeness
    setTimeout(() => {
        const formSec = document.getElementById('admission');
        if (formSec) {
            formSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 50);
};
