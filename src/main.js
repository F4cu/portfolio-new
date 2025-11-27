import './styles.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const mainContent = document.getElementById('main-content');

// Initialize ScrollSmoother
const smoother = ScrollSmoother.create({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1.5,
  effects: true
});

const header = document.querySelector('header');

gsap.to(header, {
  height: '4rem',
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '#main-content',
    start: 'top top',
    end: '+=150',
    scrub: true,
  }
});

function fadeInPage(fromProjectPage = false) {
  if (!mainContent) return;

  const hash = window.location.hash ? window.location.hash.substring(1) : null;
  const targetEl = hash ? document.getElementById(hash) : null;

  // Determine if we should skip scroll animation
  const skipScroll = fromProjectPage && hash;

  // Jump instantly if coming from project page with a hash
  if (targetEl && smoother && skipScroll) {
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    smoother.scrollTo(targetEl, false, `top ${headerHeight}px`);
  }

  // Fade in content
  gsap.to(mainContent, {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
  });
}

window.addEventListener('load', () => {
  const fromProjectPage = document.referrer.includes('/projects/');

  requestAnimationFrame(() => {
    fadeInPage(fromProjectPage);
  });
});

// Theme toggle handler 
document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('#theme-toggle');
  if (!btn) return;

  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Update theme attribute + persist
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  // Rotate the icon 180°
  const icon = btn.querySelector('svg');
  icon.classList.toggle('rotated');

  // Update title
  btn.setAttribute('title', newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  
  // Notify other parts of the app (like theme-aware images)
  document.dispatchEvent(new Event('themechange'));

  // Optional: force redraw of your p5.js canvas
  if (window.p5instance) {
    window.p5instance.redraw();
  }
});

// Update project images based on theme
function updateThemeImages() {
  const theme = document.documentElement.getAttribute('data-theme');
  const images = document.querySelectorAll('.theme-image');
  if (!images.length) return;

  images.forEach(img => {
    const lightSrc = img.dataset.srcLight;
    const darkSrc = img.dataset.srcDark;

    const newSrc = theme === 'dark'
      ? (darkSrc || lightSrc)
      : (lightSrc || darkSrc);

    if (img.src !== newSrc) {
      img.style.opacity = '0';
      requestAnimationFrame(() => {
        img.src = newSrc;
        img.onload = () => (img.style.opacity = '1');
      });
    }
  });
}

// Run on load
document.addEventListener('DOMContentLoaded', updateThemeImages);

// Listen for theme toggle events
document.addEventListener('themechange', updateThemeImages);


// Smooth scroll for anchor links
document.body.addEventListener('click', (e) => {
  const link = e.target.closest('a[href*="#"]');
  if (!link) return;
  
  const href = link.getAttribute('href');
  
  // Check if it's a same-page anchor (starts with # or contains current page)
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) return;
  
  const path = href.substring(0, hashIndex);
  const hash = href.substring(hashIndex + 1);
  
  // Only handle if it's current page or no path specified
  if (path && !window.location.pathname.endsWith(path)) return;
  
  e.preventDefault();
  const targetEl = document.getElementById(hash);
  
  if (targetEl && smoother) {
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    smoother.scrollTo(targetEl, true, `top ${headerHeight}px`);
  }
});

// --- Scroll-triggered fade-ins for sections  ---
document.querySelectorAll('.fade-in').forEach((element, i) => {
 // if (i === 0) return; // skip first section, already handled by fadeInPage

  gsap.from(element, {
    y: 80,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 90%',
      toggleActions: 'play none none none',
    },
  });
});

// --- Hero section fade-in with delay ---
const hero = document.querySelector('.hero-content');
if (hero) {
  gsap.from(hero, {
    opacity: 0,
    y: 80,
    duration: 1,
    ease: 'power2.out',
    delay: 0.8, // 500ms delay
  });
}

// --- Illustration on index page

// import { startSketch } from './sketch.js';

// window.addEventListener('DOMContentLoaded', () => {
//   startSketch();
// });

window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path === '/' || path.endsWith('/') || path.includes('index')) {
    import('./sketch2-shader.js').then(({ startSketch }) => {
      startSketch();
    });
  }
});

// Mobile Menu Animation with GSAP
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-item a');
    
    // Debug: Check if elements are found
    console.log('Mobile menu button:', mobileMenuBtn);
    console.log('Mobile menu:', mobileMenu);
    console.log('Mobile nav items:', mobileNavItems.length);
    
    if (!mobileMenuBtn || !mobileMenu) {
        console.error('Mobile menu elements not found!');
        console.log('Available elements with mobile in id/class:', 
            document.querySelectorAll('[id*="mobile"], [class*="mobile"]'));
        return;
    }
    
    let isMenuOpen = false;
    
    // Create GSAP timeline for menu animation
    const menuTimeline = gsap.timeline({ paused: true });
    
    // Setup animation
    menuTimeline
        .set(mobileMenu, {
            display: 'block'
        })
        .to(mobileMenu, {
            duration: 0.3,
            opacity: 1,
            ease: 'power2.inOut'
        })
        .to(mobileNavItems, {
            duration: 0.5,
            opacity: 1,
            y: 0,
            stagger: 0.1,
            ease: 'power3.out'
        }, '-=0.1');
    
    // Set initial state for nav items
    gsap.set(mobileNavItems, { opacity: 0, y: -30 });
    gsap.set(mobileMenu, { opacity: 0, display: 'none' });
    
    // Toggle menu function
    const toggleMenu = () => {
        console.log('Toggle menu called, isMenuOpen:', isMenuOpen);
        
        if (!isMenuOpen) {
            // Open menu
            menuTimeline.play();
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
            mobileMenuBtn.setAttribute('aria-label', 'Menü schließen');
            document.body.style.overflow = 'hidden';
        } else {
            // Close menu
            menuTimeline.reverse();
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.setAttribute('aria-label', 'Menü öffnen');
            document.body.style.overflow = '';
        }
        isMenuOpen = !isMenuOpen;
        mobileMenuBtn.classList.toggle('open', isMenuOpen);
    };
    
    // Event listeners
    mobileMenuBtn.addEventListener('click', (e) => {
        console.log('Button clicked!');
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) {
                toggleMenu();
            }
        });
    });
    
    // Close menu when clicking on the background
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            toggleMenu();
        }
    });
}

// Call the function when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}