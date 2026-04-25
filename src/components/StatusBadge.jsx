const STATUS_STYLES = {
  stock:  { bg: '#DCFCE7', text: '#16A34A' },
  projet: { bg: '#F1F0E8', text: '#5F5E5A' },
  vendu:  { bg: '#DBEAFE', text: '#1D4ED8' },
}

const STATUS_LABELS = {
  stock:  'En stock',
  projet: 'Projet',
  vendu:  'Vendu',
}

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status]
  if (!s) return null
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: 5,
      fontSize: 11,
      fontWeight: 600,
      background: s.bg,
      color: s.text,
    }}>
      {STATUS_LABELS[status]}
    </span>
  )
}
