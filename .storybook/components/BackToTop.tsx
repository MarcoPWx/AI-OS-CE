import React from 'react';

export function BackToTop() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  const style: React.CSSProperties = {
    position: 'fixed',
    right: 12,
    bottom: 12,
    zIndex: 9998,
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: 999,
    cursor: 'pointer',
    fontSize: 12,
    backdropFilter: 'saturate(180%) blur(6px)',
  };
  const goTop = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.location.hash = '#top';
    }
  };
  return (
    <a href="#top" onClick={goTop} style={style} title="Back to top">
      ↑ Back to top
    </a>
  );
}
