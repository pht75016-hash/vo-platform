import { ATELIER_COLORS as C } from './atelierConstants';

// ── ICÔNES ──
export const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 2 }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    menu:    <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    bell:    <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    car:     <><path d="M5 17h14M5 17a2 2 0 0 1-2-2v-3l2-5h14l2 5v3a2 2 0 0 1-2 2M5 17v2M19 17v2M7 13h.01M17 13h.01"/></>,
    user:    <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    clock:   <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    check:   <polyline points="20 6 9 17 4 12"/>,
    alert:   <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    sync:    <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
    chevron: <polyline points="9 18 15 12 9 6"/>,
    home:    <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  };
  return <svg {...props}>{paths[name]}</svg>;
};

// ── STAT CARD ──
export const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', flex: 1, minWidth: 0 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
      <span style={{ fontSize: 12, color: C.textSecondary, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</span>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '15', color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} />
      </div>
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 6 }}>{sub}</div>}
  </div>
);

// ── OPERATOR AVATAR ──
export const OperatorAvatar = ({ op, size = 28 }) => (
  <div title={`${op.name} — ${op.role}`} style={{
    width: size, height: size, borderRadius: '50%', background: op.color,
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.38, fontWeight: 600, border: '2px solid #fff', flexShrink: 0,
  }}>{op.initials}</div>
);

// ── SECTION + FIELD (drawer) ──
export const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>{title}</div>
    {children}
  </div>
);

export const Field = ({ label, value, auto }) => (
  <div style={{
    padding: '10px 12px',
    border: `1px solid ${auto ? C.auto + '60' : C.border}`,
    borderRadius: 8, marginBottom: 8,
    background: auto ? C.autoSoft : C.surface,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
      <span style={{ fontSize: 10, color: C.textSecondary, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</span>
      {auto && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: C.auto, color: '#fff', fontWeight: 600 }}>AUTO</span>}
    </div>
    <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{value}</div>
  </div>
);
