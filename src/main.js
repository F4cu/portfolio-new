import './styles.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('json', json);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);

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

// Shrinks nav header when scrolling down
const isHomepage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');

if (!isHomepage) {
  ScrollTrigger.create({
    trigger: '#main-content',
    start: 'top top',
    onEnter: () => header.classList.add('border-b', 'border-neutral-300', 'dark:border-neutral-700'),
    onLeaveBack: () => header.classList.remove('border-b', 'border-neutral-400', 'dark:border-neutral-800'),
  });
}

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

// --- Lightbox ---
const lightboxHTML = `
  <div id="lightbox" class="fixed inset-0 z-50 hidden items-center justify-center bg-neutral-800/80 backdrop-blur-sm p-4" >
    <div class="relative max-w-6xl w-full bg-neutral-300 dark:bg-neutral-800" id="lightbox-inner">
      <button id="lightbox-close" class="absolute -top-10 right-0 text-white text-base hover:text-neutral-300 transition-colors">✕ Close</button>
      <img id="lightbox-img" src="" alt="" class="w-full h-auto max-h-[85vh] object-contain rounded" />
      <p id="lightbox-caption" class="text-white/60 text-base text-center mt-3"></p>
    </div>
  </div>`;
document.body.insertAdjacentHTML('beforeend', lightboxHTML);

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxCaption.textContent = alt;
  lightbox.classList.remove('hidden');
  lightbox.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  lightbox.classList.remove('flex');
  document.body.style.overflow = '';
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// Make selected images clickable
document.querySelectorAll('.lightbox-trigger').forEach(img => {
  img.addEventListener('click', () => {
    if (window.innerWidth < 768) return;
    openLightbox(img.src, img.alt);
  });
});

// --- Code lightbox (tabbed code snippets) ---
const codeLightboxHTML = `
  <div id="code-lightbox" class="fixed inset-0 z-50 hidden items-center justify-center bg-neutral-800/80 backdrop-blur-sm p-4">
    <div class="relative max-w-4xl w-full bg-neutral-300 dark:bg-neutral-800 p-6" id="code-lightbox-inner">
      <button id="code-lightbox-close" class="absolute -top-10 right-0 text-white text-base hover:text-neutral-300 transition-colors">✕ Close</button>
      <pre class="code-lightbox-pre w-full min-h-[280px] max-h-[70vh] overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words text-sm font-mono leading-relaxed text-neutral-800 dark:text-neutral-200"><code id="code-lightbox-code" class="hljs"></code></pre>
      <div id="code-lightbox-tabs" class="text-center mt-4"></div>
      <p id="code-lightbox-explanation" class="text-base text-center text-neutral-600 dark:text-neutral-500 mt-3"></p>
    </div>
  </div>`;
document.body.insertAdjacentHTML('beforeend', codeLightboxHTML);

const codeLightbox = document.getElementById('code-lightbox');
const codeLightboxExplanation = document.getElementById('code-lightbox-explanation');
const codeLightboxCode = document.getElementById('code-lightbox-code');
const codeLightboxTabs = document.getElementById('code-lightbox-tabs');

// Strips the common leading whitespace so code copied from indented HTML markup renders flush left.
function dedent(text) {
  const lines = text.replace(/\t/g, '    ').split('\n');
  while (lines.length && lines[0].trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

  const indents = lines.filter(l => l.trim() !== '').map(l => l.match(/^ */)[0].length);
  const minIndent = indents.length ? Math.min(...indents) : 0;

  return lines.map(l => l.slice(minIndent)).join('\n');
}

// Renders one block per source line, indented with its own leading whitespace as
// padding rather than text, so a wrapped line's continuation lands under its own
// indent level instead of snapping back to the container's left edge.
function highlightWithHangingIndent(rawCode) {
  const language = hljs.highlightAuto(rawCode, ['json', 'javascript', 'typescript', 'bash']).language || 'plaintext';

  return rawCode.split('\n').map(line => {
    const indent = line.match(/^ */)[0].length;
    const content = line.slice(indent);
    const highlighted = content
      ? hljs.highlight(content, { language, ignoreIllegals: true }).value
      : '&nbsp;';
    return `<div class="code-line" style="padding-left:${indent}ch">${highlighted}</div>`;
  }).join('');
}

// Syntax-highlight the closed-state code previews, using the same dedent +
// hanging-indent pipeline as the opened lightbox so both stay flush left.
document.querySelectorAll('.code-preview code').forEach(el => {
  el.innerHTML = highlightWithHangingIndent(dedent(el.textContent));
  el.classList.add('hljs');
});

function showCodeLightboxTab(figure, tabId) {
  const template = figure.querySelector(`template[data-code-snippet="${tabId}"]`);
  if (!template) return;

  const explanationEl = template.content.querySelector('p');
  const codeEl = template.content.querySelector('code');
  const rawCode = dedent((codeEl || template.content).textContent);

  codeLightboxExplanation.textContent = explanationEl ? explanationEl.textContent.trim() : '';
  codeLightboxExplanation.classList.toggle('hidden', !explanationEl);

  codeLightboxCode.innerHTML = highlightWithHangingIndent(rawCode);

  codeLightboxTabs.querySelectorAll('.code-tab-link').forEach(tab => {
    tab.classList.toggle('active-tab', tab.dataset.tab === tabId);
  });
}

function openCodeLightbox(figure, initialTab) {
  const sourceTabLinks = figure.querySelectorAll('.code-tab-link');
  if (!sourceTabLinks.length) return;

  codeLightboxTabs.innerHTML = '';
  sourceTabLinks.forEach(link => {
    const tab = document.createElement('a');
    tab.href = '#';
    tab.className = 'code-tab-link link mx-2';
    tab.dataset.tab = link.dataset.tab;
    tab.textContent = link.textContent.trim();
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      showCodeLightboxTab(figure, tab.dataset.tab);
    });
    codeLightboxTabs.appendChild(tab);
  });

  showCodeLightboxTab(figure, initialTab || sourceTabLinks[0].dataset.tab);

  codeLightbox.classList.remove('hidden');
  codeLightbox.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeCodeLightbox() {
  codeLightbox.classList.add('hidden');
  codeLightbox.classList.remove('flex');
  document.body.style.overflow = '';
}

document.getElementById('code-lightbox-close').addEventListener('click', closeCodeLightbox);
codeLightbox.addEventListener('click', (e) => { if (e.target === codeLightbox) closeCodeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCodeLightbox(); });

document.querySelectorAll('[data-code-lightbox]').forEach(figure => {
  figure.addEventListener('click', (e) => {
    if (window.innerWidth < 768) return;
    const tabLink = e.target.closest('.code-tab-link');
    e.preventDefault();
    openCodeLightbox(figure, tabLink ? tabLink.dataset.tab : null);
  });
  figure.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    figure.click();
  });
});

// Generic expand/collapse toggle
document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-toggle]');
    if (!trigger) return;
    e.preventDefault();
    const target = document.getElementById(trigger.dataset.toggle);
    if (!target) return;
    const isOpen = target.classList.toggle('open');
    const label = trigger.childNodes[0];
    label.textContent = isOpen ? trigger.dataset.hideText : trigger.dataset.showText;
    trigger.classList.toggle('open', isOpen);
});

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