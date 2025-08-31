import React from 'react';
import { addons, types, useChannel } from '@storybook/manager-api';
import { UPDATE_GLOBALS } from '@storybook/core-events';

const EVENT_MSW_STATUS = 'quizmentor/msw-status';

const menuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: 6,
  background: 'rgba(2,6,23,0.98)',
  border: '1px solid rgba(148,163,184,0.25)',
  borderRadius: 8,
  minWidth: 180,
  zIndex: 10000,
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  padding: 6,
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '8px 10px',
  color: '#e5e7eb',
  cursor: 'pointer',
  borderRadius: 6,
};

const Chip: React.FC<{ active?: boolean; profile?: string; noDefaults?: boolean; onClick?: () => void; onShiftClick?: () => void }> = ({
  active,
  profile,
  noDefaults,
  onClick,
  onShiftClick,
}) => {
  const isOn = !!active;
  const color = isOn ? '#16a34a' : '#6b7280';
  const border = isOn ? 'rgba(22,163,74,0.5)' : 'rgba(107,114,128,0.5)';
  const label = isOn ? 'MSW: ON' : 'MSW: OFF';
  const title = isOn
    ? `MSW Active • ${profile || 'default'}${noDefaults ? ' • no-defaults' : ''}`
    : 'MSW Inactive';
  return (
    <div title={title} style={{ padding: '0 8px' }}>
      <button
        onClick={(e) => {
          if (e.shiftKey && onShiftClick) onShiftClick();
          else if (onClick) onClick();
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.06)',
          color: '#e5e7eb',
          border: `1px solid ${border}`,
          cursor: 'pointer',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
        {label}
      </button>
    </div>
  );
};

const MswStatusTool: React.FC = () => {
  const [status, setStatus] = React.useState<{ active?: boolean; profile?: string; noDefaults?: boolean }>(
    {},
  );
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  useChannel({
    [EVENT_MSW_STATUS]: (payload: any) => setStatus(payload || {}),
  });
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as any)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const channel = addons.getChannel();
  const setProfile = (value: string) => {
    channel.emit(UPDATE_GLOBALS, { globals: { mswProfile: value } });
    setOpen(false);
  };
  const toggleNoDefaults = () => {
    channel.emit(UPDATE_GLOBALS, { globals: { mswNoDefaults: !status.noDefaults } });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Chip
        active={status.active}
        profile={status.profile}
        noDefaults={status.noDefaults}
        onClick={() => setOpen((v) => !v)}
        onShiftClick={toggleNoDefaults}
      />
      {open && (
        <div style={menuStyle}>
          <div
            style={{ ...menuItemStyle, border: '1px solid rgba(59,130,246,0.15)' }}
            onClick={() => {
              const channel = addons.getChannel();
              channel.emit(UPDATE_GLOBALS, { globals: { mswInfo: 'open' } });
              setOpen(false);
            }}
          >
            <span>Open MSW Info</span>
          </div>
          {['default', 'slower', 'flaky', 'chaos', 'reset'].map((opt) => (
            <div
              key={opt}
              style={{
                ...menuItemStyle,
                background: status.profile === opt ? 'rgba(30,41,59,0.85)' : 'transparent',
                border: '1px solid rgba(59,130,246,0.15)',
              }}
              onClick={() => setProfile(opt)}
            >
              <span style={{ textTransform: 'capitalize' }}>{opt}</span>
              {status.profile === opt ? <span style={{ opacity: 0.85 }}>✓</span> : null}
            </div>
          ))}
          <div
            style={{ ...menuItemStyle, border: '1px solid rgba(59,130,246,0.15)' }}
            onClick={toggleNoDefaults}
          >
            <span>Toggle no-defaults</span>
            {status.noDefaults ? <span style={{ opacity: 0.85 }}>✓</span> : null}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', padding: '4px 8px 2px 8px' }}>
            Tip: Shift+Click chip toggles no-defaults
          </div>
        </div>
      )}
    </div>
  );
};

addons.register('quizmentor/msw-status', () => {
  addons.add('quizmentor/msw-status/tool', {
    title: 'MSW Status',
    type: types.TOOL,
    match: ({ viewMode }) => true,
    render: () => <MswStatusTool />,
  });
});

