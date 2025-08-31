import React from 'react';

export function InlineTOC(props: { items: { id: string; label: string }[] }) {
  const [open, setOpen] = React.useState(true);
  const [pinned, setPinned] = React.useState(false);

  React.useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (!pinned) {
        if (y > 200 && y > lastY) setOpen(false);
        if (y < lastY - 10) setOpen(true);
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pinned]);

  const container: React.CSSProperties = {
    position: 'fixed',
    top: 64,
    right: 8,
    zIndex: 9998,
    maxWidth: 260,
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    borderRadius: 8,
    padding: 8,
    backdropFilter: 'saturate(180%) blur(6px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  };
  const pill: React.CSSProperties = {
    position: 'fixed',
    top: 64,
    right: 8,
    zIndex: 9998,
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    borderRadius: 999,
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: 12,
    backdropFilter: 'saturate(180%) blur(6px)',
  };
  const linkStyle: React.CSSProperties = { color: 'white', textDecoration: 'none' };
  const btnStyle: React.CSSProperties = { fontSize: 11, opacity: 0.8, cursor: 'pointer' };

  if (!open) {
    return (
      <div style={pill} onClick={() => setOpen(true)} title="Open table of contents">
        TOC
      </div>
    );
  }

  return (
    <div style={container}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <strong style={{ fontSize: 12 }}>On this page</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={btnStyle} onClick={() => setPinned(!pinned)}>
            {pinned ? 'Unpin' : 'Pin'}
          </span>
          <span style={btnStyle} onClick={() => setOpen(false)}>
            Close
          </span>
        </div>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {props.items.map((it) => (
          <li key={it.id} style={{ marginBottom: 4 }}>
            <a href={`#${it.id}`} style={linkStyle}>
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
