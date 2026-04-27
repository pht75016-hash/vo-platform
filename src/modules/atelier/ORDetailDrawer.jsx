import { ATELIER_COLORS as C } from './atelierConstants';
import { Icon, OperatorAvatar, Section, Field } from './AtelierUI';

export default function ORDetailDrawer({ order, operators, onClose, onAssign, onSign }) {
  if (!order) return null;
  const orOps = order.operators.map(id => operators.find(o => o.id === id)).filter(Boolean);
  const availableOps = operators.filter(o => !order.operators.includes(o.id));

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 480,
        background: C.surface, zIndex: 101,
        boxShadow: '-8px 0 24px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.25s ease-out',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: C.textSecondary, fontWeight: 600 }}>{order.id}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginTop: 2 }}>Détail de l'ordre</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSecondary }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Bandeau sync */}
          <div style={{ background: C.autoSoft, border: `1px solid ${C.auto}40`, borderRadius: 8, padding: '10px 12px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="sync" size={14} color={C.auto} />
            <span style={{ fontSize: 12, color: C.auto, fontWeight: 500 }}>Données véhicule & client synchronisées depuis CRM / Stock</span>
          </div>

          <Section title="Véhicule">
            <Field label="Véhicule" value={order.vehicle} auto />
            <Field label="Kilométrage" value={`${order.km.toLocaleString('fr-FR')} km`} auto />
          </Section>

          <Section title="Client">
            <Field label="Nom" value={order.client} auto />
          </Section>

          <Section title="Intervention">
            <Field label="Description" value={order.operation} />
            <Field label="Temps estimé" value={`${order.estimatedHours} h`} />
            <Field label="Priorité" value={order.priority === 'high' ? 'Urgente' : 'Normale'} />
          </Section>

          <Section title="Opérateurs assignés">
            {orOps.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {orOps.map(op => (
                  <div key={op.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                    <OperatorAvatar op={op} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{op.name}</div>
                      <div style={{ fontSize: 11, color: C.textSecondary }}>{op.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic', padding: 10 }}>
                {order.signed ? 'Aucun opérateur assigné' : 'OR non signé — assignation après signature'}
              </div>
            )}

            {order.signed && availableOps.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6, fontWeight: 500 }}>Ajouter un opérateur</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {availableOps.map(op => (
                    <button key={op.id} onClick={() => onAssign(order.id, op.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 10px', border: `1px solid ${C.border}`,
                      borderRadius: 16, background: C.surface, cursor: 'pointer',
                      fontSize: 12, color: C.text, fontFamily: 'inherit',
                    }}>
                      <OperatorAvatar op={op} size={18} />
                      {op.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Footer — bouton signature */}
        {!order.signed && (
          <div style={{ padding: 20, borderTop: `1px solid ${C.border}`, background: C.bg }}>
            <button onClick={() => onSign(order.id)} style={{
              width: '100%', padding: '12px 16px', borderRadius: 8,
              background: C.text, color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Icon name="check" size={16} />
              Marquer comme signé par le client
            </button>
            <div style={{ fontSize: 11, color: C.textSecondary, textAlign: 'center', marginTop: 8 }}>
              L'OR passera en colonne « À démarrer » et pourra être assigné
            </div>
          </div>
        )}
      </div>
    </>
  );
}
