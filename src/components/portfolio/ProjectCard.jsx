/**
 * ProjectCard.jsx — A single project in the portfolio grid.
 * Content comes from the PROJECTS array in src/data/portfolio.js.
 */

export default function ProjectCard({ project }) {
  return (
    <article className="project-card" style={{ '--card-accent': project.color }}>
      {/* Image area (or color fallback) */}
      <div className="pc-image-area">
        {project.image ? (
          <img src={project.image} alt={project.title} loading="lazy" />
        ) : (
          <div className="pc-image-placeholder">
            <span className="pc-placeholder-icon">◈</span>
          </div>
        )}
        <span className="pc-category-badge">{project.category}</span>
      </div>

      {/* Text content */}
      <div className="pc-body">
        <h3 className="pc-title">{project.title}</h3>
        <p className="pc-description">{project.description}</p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="pc-tags">
            {project.tags.map((tag) => (
              <span key={tag} className="pc-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="pc-links">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="pc-link">
              Live ↗
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="pc-link">
              Code ↗
            </a>
          )}
          {project.caseStudyUrl && (
            <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="pc-link">
              Case Study ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
