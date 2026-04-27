import { ATELIER_COLORS as C } from './atelierConstants';
import { Icon, OperatorAvatar } from './AtelierUI';

// ── OR CARD ──
export const ORCard = ({ or: order, operators, onDragStart, onClick, isDragging }) => {
  const orOps = order.operators.map(id => operators.find(o => o.id === id)).filter(Boolean);
  const priorityColor = order.priority === 'high' ? C.danger : C.textMuted;

  return (
    <div
      draggable={order.signed}
      onDragStart={(e) => onDragStart(e, order.id)}
      onClick={() => onClick(order)}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${priorityColor}`,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        cursor: order.signed ? 'grab' : 'pointer',
        opacity: isDragging ? 0.4 : 1,
        transition: 'box-shadow 0.15s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: C.textSecondary, fontWeight: 600 }}>{order.id}</span>
        {order.priority === 'high' && (
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: C.dangerSoft, color: C.danger, fontWeight: 600, textTransform: 'uppercase' }}>Urgent</span>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>{order.vehicle}</div>
      <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 8 }}>{order.client}</div>
      <div style={{ fontSize: 12, color: C.text, marginBottom: 10, lineHeight: 1.4 }}>{order.operation}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.textSecondary }}>
          <Icon name="clock" size={12} /><span>{order.estimatedHours}h</span>
        </div>
        <div style={{ display: 'flex' }}>
          {orOps.length > 0 ? orOps.map((op, i) => (
            <div key={op.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
              <OperatorAvatar op={op} size={24} />
            </div>
          )) : (
            <span style={{ fontSize: 10, color: C.textMuted, fontStyle: 'italic' }}>
              {order.signed ? 'Non assigné' : 'En attente'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── KANBAN COLUMN ──
export const KanbanColumn = ({ column, orders, operators, onDragStart, onDrop, onDragOver, onCardClick, draggingId }) => (
  <div
    onDragOver={onDragOver}
    onDrop={e => onDrop(e, column.id)}
    style={{ flex: '0 0 280px', background: C.bg, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', maxHeight: '100%' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: column.color }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{column.label}</span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: column.color, background: column.bg, padding: '2px 8px', borderRadius: 10 }}>{orders.length}</span>
    </div>
    <div style={{ overflowY: 'auto', flex: 1, minHeight: 100 }}>
      {orders.map(o => (
        <ORCard key={o.id} or={o} operators={operators} onDragStart={onDragStart} onClick={onCardClick} isDragging={draggingId === o.id} />
      ))}
      {orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20, fontSize: 12, color: C.textMuted, fontStyle: 'italic' }}>Aucun OR</div>
      )}
    </div>
  </div>
);
