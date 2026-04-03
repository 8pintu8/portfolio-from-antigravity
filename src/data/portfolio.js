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
 *   SOCIAL     → Your social media links
 *   CONTACT    → Contact form settings
 *   SITE       → Site-wide metadata (title, description)
 */

// ═══════════════════════════════════════
// SITE METADATA
// ═══════════════════════════════════════
// Used in <title>, meta tags, loading screen, etc.
export const SITE = {
  title: 'The Balcony — A Spatial Portfolio',
  shortTitle: 'The Balcony',
  description: 'An immersive 3D portfolio experience showcasing creative technology, product design, and research.',
  author: 'Your Name',           // ← EDIT: Put your name here
  url: 'https://yoursite.com',   // ← EDIT: Your live URL (for OpenGraph)
};

// ═══════════════════════════════════════
// ABOUT / BIO
// ═══════════════════════════════════════
export const ABOUT = {
  name: 'Your Name',             // ← EDIT: Your full name
  tagline: 'Creative Technologist & Designer',  // ← EDIT: One-liner that describes you
  bio: [
    // Each string becomes a paragraph. Add or remove lines freely.
    'I\'m a creative technologist who works at the intersection of design, engineering, and art. I believe the best work happens when you stop separating disciplines and start connecting them.',
    'My practice spans product design, kinetic sculpture, computational research, and interactive experiences. I\'m drawn to things that move, things that respond, and things that make you pause.',
    'Currently exploring spatial computing, procedural design, and the poetics of everyday objects.',
  ],
  // Path to your profile image. Place the image in /public/ folder.
  // Example: put "profile.jpg" in /public/ and set this to "/profile.jpg"
  profileImage: null,  // ← EDIT: Set to '/your-image.jpg' when ready
  resumeUrl: null,     // ← EDIT: Set to '/resume.pdf' or an external link
};

// ═══════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════
// These are shown BOTH as 3D objects on the balcony AND in the portfolio overlay.
// The `id` must match the 3D object mapping in SceneController.jsx.
//
// HOW TO ADD A NEW PROJECT:
// 1. Add an entry to this array
// 2. The portfolio overlay will automatically show it
// 3. To also add a 3D representation, see SceneController.jsx
export const PROJECTS = [
  {
    id: 'product-design',
    title: 'Product Design Collection',
    category: 'Product Design',
    description: 'A curated series of industrial and consumer product designs — exploring the intersection of form, function, and material innovation.',
    // Tags shown as badges on the project card
    tags: ['Industrial Design', 'CAD', 'Prototyping'],
    // Optional links. Set to null if not available.
    liveUrl: null,            // ← EDIT: 'https://...'
    githubUrl: null,          // ← EDIT: 'https://github.com/...'
    caseStudyUrl: null,       // ← EDIT: Link to a detailed write-up
    // Image path for the overlay card. Place in /public/projects/
    image: null,              // ← EDIT: '/projects/product-design.jpg'
    // Color used for the 3D pedestal glow + card accent
    color: '#FF9F6B',
    // Position on the balcony floor [x, y, z]
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
  // Copy an entry above, change the id, and fill in your details.
  // If you don't need a 3D object for it, just leave it — it'll still
  // appear in the portfolio overlay panel.
];

// ═══════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════
// Grouped by category. Add/remove categories and skills freely.
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
// SOCIAL LINKS
// ═══════════════════════════════════════
// Set any link to null to hide it. Add new ones by copying a line.
export const SOCIAL = [
  { platform: 'GitHub',   url: 'https://github.com/yourusername',   icon: '⌨' },
  { platform: 'LinkedIn', url: 'https://linkedin.com/in/yourusername', icon: '💼' },
  { platform: 'Twitter',  url: 'https://twitter.com/yourusername',   icon: '🐦' },
  { platform: 'Email',    url: 'mailto:you@example.com',             icon: '✉️' },
  // { platform: 'Dribbble', url: 'https://dribbble.com/...', icon: '🎨' },
  // { platform: 'Instagram', url: 'https://instagram.com/...', icon: '📸' },
].filter(s => s.url);  // Removes any with null URLs

// ═══════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════
export const CONTACT = {
  // Formspree endpoint. Create a free form at https://formspree.io
  // and paste the form ID here (just the ID, not the full URL).
  // Example: 'xpznqkdl'
  formspreeId: null,  // ← EDIT: Your Formspree form ID

  // Fallback email if Formspree is not set up
  email: 'you@example.com',  // ← EDIT: Your email address

  // Heading shown above the contact form
  heading: 'Get in Touch',
  subheading: 'Have a project in mind, a question, or just want to say hello? Drop me a message.',
};
