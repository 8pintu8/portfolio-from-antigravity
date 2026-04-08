/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  PortfolioOverlay.jsx — Slide-in portfolio panel system       ║
 * ╚════════════════════════════════════════════════════════════════╝
 *
 * This is the main portfolio UI that slides in from the right.
 * It contains tabs for: About, Projects, Diary, Contact.
 *
 * HOW TO EDIT:
 *   - Content comes from src/data/portfolio.js and src/data/diary.js
 *   - Section components are in src/components/portfolio/
 *   - To add a new tab, add to the TABS array and create a section component
 */

import { useEffect } from 'react';
import useStore from '../../store/useStore';
import { ABOUT, PROJECTS, SKILLS, SOCIAL, CONTACT, SITE } from '../../data/portfolio';
import { DIARY_ENTRIES, DIARY_ENTRY_TYPES } from '../../data/diary';
import ProjectCard from './ProjectCard';
import AboutSection from './AboutSection';
import DiarySection from './DiarySection';
import ContactSection from './ContactSection';

// ── Tab definitions — add new tabs here ──
const TABS = [
  { id: 'about',    label: 'About',    icon: '◐' },
  { id: 'projects', label: 'Work',     icon: '◈' },
  { id: 'diary',    label: 'Diary',    icon: '◉' },
  { id: 'contact',  label: 'Contact',  icon: '◌' },
];

export default function PortfolioOverlay({ isOpen, onClose }) {
  const activeTab = useStore((s) => s.activePortfolioTab);
  const setActiveTab = useStore((s) => s.setActivePortfolioTab);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent scroll bleed to canvas when panel is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className={`portfolio-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className={`portfolio-panel ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Portfolio"
        aria-modal="true"
      >
        {/* Header */}
        <header className="pp-header">
          <div>
            <h1 className="pp-name">{ABOUT.name}</h1>
            <p className="pp-tagline">{ABOUT.tagline}</p>
          </div>
          <button className="pp-close" onClick={onClose} aria-label="Close portfolio">✕</button>
        </header>

        {/* Tab navigation */}
        <nav className="pp-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`pp-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="pp-tab-icon">{tab.icon}</span>
              <span className="pp-tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab content (scrollable) */}
        <div className="pp-content">
          {activeTab === 'about' && (
            <AboutSection about={ABOUT} skills={SKILLS} social={SOCIAL} />
          )}

          {activeTab === 'projects' && (
            <section className="pp-section">
              <h2 className="pp-section-title">Selected Work</h2>
              <div className="pp-projects-grid">
                {PROJECTS.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {activeTab === 'diary' && (
            <DiarySection entries={DIARY_ENTRIES} types={DIARY_ENTRY_TYPES} />
          )}

          {activeTab === 'contact' && (
            <ContactSection contact={CONTACT} social={SOCIAL} />
          )}
        </div>

        {/* Footer */}
        <footer className="pp-footer">
          <span>© {new Date().getFullYear()} {ABOUT.name}</span>
          <div className="pp-social-row">
            {SOCIAL.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pp-social-link"
                title={s.platform}
              >
                {s.svg ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d={s.svg} />
                  </svg>
                ) : (
                  s.icon
                )}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
