import { useState, useMemo } from 'react';
import { ATELIER_COLORS as C, KANBAN_COLUMNS, INITIAL_OPERATORS, INITIAL_ORS } from './atelierConstants';
import { Icon, StatCard, OperatorAvatar } from './AtelierUI';
import { KanbanColumn } from './KanbanComponents';
import ORDetailDrawer from './ORDetailDrawer';

export default function Atelier() {
  const [orders, setOrders] = useState(INITIAL_ORS);
  const [operators] = useState(INITIAL_OPERATORS);
  const [search, setSearch] = useState('');
  const [filterOp, setFilterOp] = useState('all');
  const [draggingId, setDraggingId] = useState(null);
  const [selectedOR, setSelectedOR] = useState(null);

  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      o.client.toLowerCase().includes(search.toLowerCase());
    const matchOp = filterOp === 'all' || o.operators.includes(filterOp);
    return matchSearch && matchOp;
  }), [orders, search, filterOp]);

  const stats = useMemo(() => ({
    inProg:    orders.filter(o => o.status === 'in_progress').length,
    waiting:   orders.filter(o => o.status === 'waiting_parts').length,
    todayDone: orders.filter(o => o.status === 'done').length,
    pending:   orders.filter(o => !o.signed).length,
  }), [orders]);

  const handleDragStart = (e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (!draggingId) return;
    const order = orders.find(o => o.id === draggingId);
    if (!order || !order.signed || columnId === 'pending_signature') { setDraggingId(null); return; }
    setOrders(prev => prev.map(o => o.id === draggingId ? { ...o, status: columnId } : o));
    setDraggingId(null);
  };

  const handleAssign = (orderId, opId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, operators: [...o.operators, opId] } : o));
    setSelectedOR(prev => prev ? { ...prev, operators: [...prev.operators, opId] } : prev);
  };

  const handleSign = (orderId) => {
    const leastBusy = [...operators].sort((a, b) => a.active - b.active)[0];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, signed: true, status: 'signed', operators: [leastBusy.id] } : o));
    setSelectedOR(prev => prev ? { ...prev, signed: true, status: 'signed', operators: [leastBusy.id] } : prev);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'DM Sans, -apple-system, sans-serif', color: C.text, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
        @media (max-width: 768px) { .desktop-only { display: none !important; } }
        @media (min-width: 769px) { .mobile-only  { display: none !important; } }
      `}</style>

      {/* HEADER */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Icon name="car" size={18} />
          </div>
          <div className="desktop-only">
            <div style={{ fontSize: 15, fontWeight: 700 }}>Atelier</div>
            <div style={{ fontSize: 11, color: C.textSecondary }}>Gestion des ordres de réparation</div>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: 400, position: 'relative' }} className="desktop-only">
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Icon name="search" size={14} color={C.textSecondary} />
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher OR, véhicule, client..." style={{ width: '100%', padding: '9px 12px 9px 36px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: C.bg, outline: 'none' }} />
        </div>

        <div style={{ flex: 1 }} className="mobile-only" />

        <button style={{ background: C.text, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
          <Icon name="plus" size={14} />
          <span className="desktop-only">Nouvel OR</span>
        </button>

        <button style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSecondary, position: 'relative' }}>
          <Icon name="bell" size={16} />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: C.danger, border: '1.5px solid #fff' }} />
        </button>
      </header>

      {/* CONTENU */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: 16, overflow: 'hidden' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textSecondary }}>
          <Icon name="home" size={12} />
          <Icon name="chevron" size={12} />
          <span>Modules</span>
          <Icon name="chevron" size={12} />
          <span style={{ color: C.text, fontWeight: 600 }}>Atelier</span>
        </div>

        {/* STATS */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatCard label="En cours"      value={stats.inProg}    sub="Travaux actifs"    color={C.warning}       icon="clock" />
          <StatCard label="Attente pièces" value={stats.waiting}   sub="Bloqués"           color={C.danger}        icon="alert" />
          <StatCard label="Terminés"      value={stats.todayDone} sub="Cette semaine"     color={C.success}       icon="check" />
          <StatCard label="À signer"      value={stats.pending}   sub="Devis en attente"  color={C.textSecondary} icon="user"  />
        </div>

        {/* FILTRES OPÉRATEURS */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>Opérateurs</span>
          <button onClick={() => setFilterOp('all')} style={{ padding: '6px 12px', borderRadius: 16, border: `1px solid ${filterOp === 'all' ? C.text : C.border}`, background: filterOp === 'all' ? C.text : C.surface, color: filterOp === 'all' ? '#fff' : C.text, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            Tous
          </button>
          {operators.map(op => (
            <button key={op.id} onClick={() => setFilterOp(filterOp === op.id ? 'all' : op.id)} style={{ padding: '4px 12px 4px 4px', borderRadius: 16, border: `1px solid ${filterOp === op.id ? op.color : C.border}`, background: filterOp === op.id ? op.color + '15' : C.surface, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
              <OperatorAvatar op={op} size={22} />
              <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{op.name.split(' ')[0]}</span>
              <span style={{ fontSize: 10, color: C.textSecondary, background: C.bg, padding: '1px 6px', borderRadius: 8 }}>{op.active}</span>
            </button>
          ))}
        </div>

        {/* RECHERCHE MOBILE */}
        <div className="mobile-only" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <Icon name="search" size={14} color={C.textSecondary} />
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ width: '100%', padding: '10px 12px 10px 36px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: C.surface, outline: 'none' }} />
        </div>

        {/* KANBAN */}
        <div style={{ flex: 1, display: 'flex', gap: 12, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 8, minHeight: 400 }}>
          {KANBAN_COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              orders={filtered.filter(o => o.status === col.id)}
              operators={operators}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onCardClick={setSelectedOR}
              draggingId={draggingId}
            />
          ))}
        </div>
      </div>

      <ORDetailDrawer
        order={selectedOR}
        operators={operators}
        onClose={() => setSelectedOR(null)}
        onAssign={handleAssign}
        onSign={handleSign}
      />
    </div>
  );
}
