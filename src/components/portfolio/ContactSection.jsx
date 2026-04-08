/**
 * ContactSection.jsx — Contact form with Formspree or mailto fallback.
 *
 * HOW IT WORKS:
 *   - If CONTACT.formspreeId is set → submits via Formspree (free, no backend)
 *   - If not → falls back to a mailto: link
 *
 * HOW TO SET UP FORMSPREE:
 *   1. Go to https://formspree.io and create a free account
 *   2. Create a new form and copy the form ID (e.g. 'xpznqkdl')
 *   3. Set CONTACT.formspreeId in src/data/portfolio.js
 */

import { useState } from 'react';

export default function ContactSection({ contact, social }) {
  const [formState, setFormState] = useState('idle'); // idle, sending, sent, error
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const hasFormspree = !!contact.formspreeId;
  const formAction = hasFormspree
    ? `https://formspree.io/f/${contact.formspreeId}`
    : null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasFormspree) {
      // Fallback: open mailto link
      const subject = encodeURIComponent(`Portfolio Contact: ${formData.name}`);
      const body = encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`);
      window.open(`mailto:${contact.email}?subject=${subject}&body=${body}`);
      return;
    }

    // Submit via Formspree
    setFormState('sending');
    try {
      const res = await fetch(formAction, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormState('sent');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  return (
    <section className="pp-section">
      <h2 className="pp-section-title">{contact.heading}</h2>
      <p className="pp-section-desc">{contact.subheading}</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="cf-field">
          <label htmlFor="cf-name">Name</label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            disabled={formState === 'sending'}
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={formState === 'sending'}
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-message">Message</label>
          <textarea
            id="cf-message"
            name="message"
            required
            rows="5"
            placeholder="What's on your mind?"
            value={formData.message}
            onChange={handleChange}
            disabled={formState === 'sending'}
          />
        </div>

        <button
          type="submit"
          className="cf-submit"
          disabled={formState === 'sending'}
        >
          {formState === 'sending' ? 'Sending...' :
           formState === 'sent' ? '✓ Sent!' :
           hasFormspree ? 'Send Message' : 'Open in Email Client'}
        </button>

        {formState === 'error' && (
          <p className="cf-error">Something went wrong. Please try again or email directly.</p>
        )}

        {!hasFormspree && (
          <p className="cf-note">
            Tip: Set up <a href="https://formspree.io" target="_blank" rel="noopener noreferrer">Formspree</a> for
            a built-in contact form. See <code>src/data/portfolio.js</code> → CONTACT.formspreeId
          </p>
        )}
      </form>

      {/* Social links */}
      <div className="contact-social">
        <h3 className="pp-subsection-title">Find me elsewhere</h3>
        <div className="cs-links">
          {social.map((s) => (
            <a
              key={s.platform}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cs-link"
            >
              <span className="cs-icon">
                {s.svg ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d={s.svg} />
                  </svg>
                ) : (
                  s.icon
                )}
              </span>
              <span>{s.platform}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
