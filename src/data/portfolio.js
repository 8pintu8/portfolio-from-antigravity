/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  portfolio.js — ALL your portfolio content lives here           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * HOW TO EDIT:
 *   This is the ONLY file you need to change to update your portfolio content.
 *   Each section is clearly labeled. Just edit the strings, add/remove items.
 *   No component or CSS knowledge needed.
 *
 * STRUCTURE:
 *   ABOUT      → Your bio, tagline, skills
 *   PROJECTS   → Your portfolio projects (shown both in 3D and in the overlay)
 *   SKILLS     → Technical skills grouped by category
 *   SOCIAL     → Your social media links (with proper SVG icons)
 *   CONTACT    → Contact form settings
 *   SITE       → Site-wide metadata (title, description)
 */

// ═══════════════════════════════════════
// SITE METADATA
// ═══════════════════════════════════════
export const SITE = {
  title: 'The Balcony — Maanith\'s Spatial Portfolio',
  shortTitle: 'The Balcony',
  description: 'An immersive 3D portfolio experience by Maanith — showcasing creative technology, product design, and research.',
  author: 'Maanith',
  url: 'https://yoursite.com',   // ← EDIT: Your live URL (for OpenGraph)
};

// ═══════════════════════════════════════
// ABOUT / BIO
// ═══════════════════════════════════════
export const ABOUT = {
  name: 'Maanith',
  tagline: 'Creative Technologist & Designer',  // ← EDIT: One-liner that describes you
  bio: [
    'I\'m a creative technologist who works at the intersection of design, engineering, and art. I believe the best work happens when you stop separating disciplines and start connecting them.',
    'My practice spans product design, kinetic sculpture, computational research, and interactive experiences. I\'m drawn to things that move, things that respond, and things that make you pause.',
    'Currently exploring spatial computing, procedural design, and the poetics of everyday objects.',
  ],
  profileImage: null,  // ← EDIT: Set to '/profile.jpg' when ready
  resumeUrl: null,     // ← EDIT: Set to '/resume.pdf' or an external link
};

// ═══════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════
// These are shown BOTH as 3D objects on the balcony AND in the portfolio overlay.
//
// PORTFOLIO SECTION ITEMS (About, Work, Diary, Contact):
//   These have `isPortfolioSection: true` and `sectionId` to link to overlay tabs.
//   Clicking them on the balcony opens the corresponding portfolio tab.
//
// HOW TO ADD A NEW PROJECT:
// 1. Add an entry to this array
// 2. The portfolio overlay will automatically show it
// 3. To also add a 3D representation, give it a `position` field
export const PROJECTS = [
  // ─── PORTFOLIO SECTION TRIGGERS (interactive 3D → opens overlay tabs) ───
  {
    id: 'about-trigger',
    title: 'About Maanith',
    category: 'Portfolio',
    description: 'Click to learn more about me, my skills, and my background.',
    tags: [],
    color: '#D4A574',
    position: [-3.5, 0, 2.0],
    isPortfolioSection: true,
    sectionId: 'about',
  },
  {
    id: 'diary-trigger',
    title: 'Digital Diary',
    category: 'Portfolio',
    description: 'My scrapbook of sketches, ideas, renders, and works-in-progress.',
    tags: [],
    color: '#C084FC',
    position: [-1.5, 0, 3.2],
    isPortfolioSection: true,
    sectionId: 'diary',
  },
  {
    id: 'contact-trigger',
    title: 'Get in Touch',
    category: 'Portfolio',
    description: 'Send me a message or find my contact details.',
    tags: [],
    color: '#6EE7B7',
    position: [2.5, 0, 3.2],
    isPortfolioSection: true,
    sectionId: 'contact',
  },

  // ─── WORK PROJECTS (your actual portfolio pieces) ───
  {
    id: 'product-design',
    title: 'Product Design Collection',
    category: 'Product Design',
    description: 'A curated series of industrial and consumer product designs — exploring the intersection of form, function, and material innovation.',
    tags: ['Industrial Design', 'CAD', 'Prototyping'],
    liveUrl: null,
    githubUrl: null,
    caseStudyUrl: null,
    image: null,
    color: '#FF9F6B',
    position: [-2.5, 0, -1.5],
  },
  {
    id: 'kinetic-sculpture',
    title: 'Kinetic Sculptures',
    category: 'Kinetic Art',
    description: 'Mechanical art pieces that transform motion into visual poetry. Each sculpture explores the rhythmic language of gears, pendulums, and balanced forces.',
    tags: ['Mechanical Design', 'Art', 'Motion'],
    liveUrl: null,
    githubUrl: null,
    caseStudyUrl: null,
    image: null,
    color: '#6BC5FF',
    position: [1.8, 0, -2],
  },
  {
    id: 'research-papers',
    title: 'Research & Publications',
    category: 'Research',
    description: 'Academic research spanning computational design, human-computer interaction, and the philosophy of creative technology.',
    tags: ['HCI', 'Computational Design', 'Publications'],
    liveUrl: null,
    githubUrl: null,
    caseStudyUrl: null,
    image: null,
    color: '#A8FFD4',
    position: [3.5, 0, 1.5],
  },
  // ─── ADD MORE PROJECTS HERE ───
];

// ═══════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════
export const SKILLS = [
  {
    category: 'Design',
    items: ['Product Design', 'UI/UX', 'CAD (Fusion 360, SolidWorks)', '3D Modeling', 'Sketching'],
  },
  {
    category: 'Development',
    items: ['JavaScript / TypeScript', 'React', 'Three.js / WebGL', 'Python', 'Node.js'],
  },
  {
    category: 'Research',
    items: ['HCI', 'Computational Design', 'User Studies', 'Academic Writing'],
  },
  {
    category: 'Tools',
    items: ['Figma', 'Blender', 'Arduino', 'Git', 'Adobe Suite'],
  },
];

// ═══════════════════════════════════════
// SOCIAL LINKS — with proper SVG icons
// ═══════════════════════════════════════
// Each entry has an `svg` field with the official logo path data.
// HOW TO ADD: Copy an entry, change platform/url/svg.
// Find SVG paths at https://simpleicons.org
export const SOCIAL = [
  {
    platform: 'GitHub',
    url: 'https://github.com/yourusername',                       // ← EDIT
    // Official GitHub Invertocat logo (simpleicons.org)
    svg: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/yourusername',                  // ← EDIT
    // Official LinkedIn logo
    svg: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    platform: 'X',
    url: 'https://x.com/yourusername',                            // ← EDIT
    // Official X (formerly Twitter) logo
    svg: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  },
  {
    platform: 'Email',
    url: 'mailto:you@example.com',                                // ← EDIT
    // Envelope icon
    svg: 'M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z',
  },
  // ─── ADD MORE — examples: ───
  // {
  //   platform: 'Instagram',
  //   url: 'https://instagram.com/...',
  //   svg: 'M12 0C8.74 0 8.333.015 7.053.072...',   // Get from simpleicons.org
  // },
  // {
  //   platform: 'Dribbble',
  //   url: 'https://dribbble.com/...',
  //   svg: 'M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12z...',
  // },
].filter(s => s.url);

// ═══════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════
export const CONTACT = {
  formspreeId: null,  // ← EDIT: Your Formspree form ID (e.g. 'xpznqkdl')
  email: 'you@example.com',  // ← EDIT: Your email address
  heading: 'Get in Touch',
  subheading: 'Have a project in mind, a question, or just want to say hello? Drop me a message.',
};
