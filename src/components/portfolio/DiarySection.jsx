/**
 * DiarySection.jsx — Digital Diary / Scrapbook.
 * Content comes from src/data/diary.js.
 *
 * Features:
 *   - Filter by entry type (sketch, idea, render, thought, wip, note)
 *   - Newest-first display
 *   - Each entry shows date, type badge, title, content, and optional image
 */

import { useState } from 'react';

export default function DiarySection({ entries, types }) {
  const [filter, setFilter] = useState(null); // null = show all

  const filtered = filter
    ? entries.filter((e) => e.type === filter)
    : entries;

  return (
    <section className="pp-section">
      <h2 className="pp-section-title">Digital Diary</h2>
      <p className="pp-section-desc">
        Sketches, ideas, renders, thoughts, and works-in-progress.
      </p>

      {/* Filter tabs */}
      <div className="diary-filters">
        <button
          className={`diary-filter-btn ${filter === null ? 'active' : ''}`}
          onClick={() => setFilter(null)}
        >
          All
        </button>
        {Object.entries(types).map(([key, val]) => (
          <button
            key={key}
            className={`diary-filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {val.emoji} {val.label}
          </button>
        ))}
      </div>

      {/* Entries list */}
      <div className="diary-entries">
        {filtered.length === 0 && (
          <p className="diary-empty">No entries yet for this filter.</p>
        )}
        {filtered.map((entry) => (
          <article key={entry.id} className="diary-entry">
            <div className="de-header">
              <div className="de-meta">
                <span className="de-type-badge" data-type={entry.type}>
                  {types[entry.type]?.emoji} {types[entry.type]?.label}
                </span>
                <time className="de-date" dateTime={entry.date}>
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </time>
              </div>
              {entry.mood && <span className="de-mood">{entry.mood}</span>}
            </div>

            <h3 className="de-title">{entry.title}</h3>
            <p className="de-content">{entry.content}</p>

            {entry.image && (
              <img
                src={entry.image}
                alt={entry.title}
                className="de-image"
                loading="lazy"
              />
            )}

            {entry.tags && entry.tags.length > 0 && (
              <div className="de-tags">
                {entry.tags.map((tag) => (
                  <span key={tag} className="de-tag">#{tag}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
