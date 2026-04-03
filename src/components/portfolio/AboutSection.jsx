/**
 * AboutSection.jsx — Bio, skills, resume link, social links.
 * Content comes from src/data/portfolio.js (ABOUT, SKILLS, SOCIAL).
 */

export default function AboutSection({ about, skills, social }) {
  return (
    <section className="pp-section">
      {/* Bio */}
      <div className="pp-about-bio">
        {about.profileImage && (
          <img
            src={about.profileImage}
            alt={about.name}
            className="pp-profile-img"
            loading="lazy"
          />
        )}
        <div className="pp-bio-text">
          {about.bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Resume link */}
      {about.resumeUrl && (
        <a
          href={about.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pp-resume-link"
        >
          Download CV / Resume ↗
        </a>
      )}

      {/* Skills grid */}
      <h3 className="pp-subsection-title">Skills & Tools</h3>
      <div className="pp-skills-grid">
        {skills.map((group) => (
          <div key={group.category} className="pp-skill-group">
            <h4 className="pp-skill-category">{group.category}</h4>
            <ul className="pp-skill-list">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
