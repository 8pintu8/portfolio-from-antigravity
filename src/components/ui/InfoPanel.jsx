import useStore from '../../store/useStore';

export default function InfoPanel() {
  const activeObject = useStore((s) => s.activeObject);
  const clearActiveObject = useStore((s) => s.clearActiveObject);

  return (
    <div className={`game-panel ${activeObject ? 'visible' : ''}`} id="info-panel">
      {activeObject && (
        <>
          <div className="gp-header">
            <div className="gp-category">{activeObject.category}</div>
            <button className="gp-close" onClick={clearActiveObject} aria-label="Close">✕</button>
          </div>
          <h2 className="gp-title">{activeObject.title}</h2>
          <div className="gp-divider" />
          <p className="gp-desc">{activeObject.description}</p>
        </>
      )}
    </div>
  );
}
