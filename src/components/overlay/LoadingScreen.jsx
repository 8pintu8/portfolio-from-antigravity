import useStore from '../../store/useStore';

export default function LoadingScreen() {
  const isLoaded = useStore((s) => s.isLoaded);

  return (
    <div className={`loading-screen ${isLoaded ? 'loaded' : ''}`} id="loading-screen">
      <div className="ls-content">
        <div className="ls-logo">⬡</div>
        <div className="ls-title">THE BALCONY</div>
        <div className="ls-bar">
          <div className="ls-bar-fill" style={{ width: isLoaded ? '100%' : '60%' }} />
        </div>
        <div className="ls-hint">Preparing your space…</div>
      </div>
    </div>
  );
}
