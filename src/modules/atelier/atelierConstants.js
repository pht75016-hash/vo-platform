export const ATELIER_COLORS = {
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  text: '#111318',
  textSecondary: '#5F6578',
  textMuted: '#9CA3AF',
  primary: '#111318',
  accent: '#2563EB',
  accentSoft: '#EFF4FF',
  success: '#10B981',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  auto: '#10B981',
  autoSoft: '#ECFDF5',
};

export const KANBAN_COLUMNS = [
  { id: 'pending_signature', label: 'En attente signature', color: '#9CA3AF', bg: '#F3F4F6' },
  { id: 'signed',            label: 'À démarrer',          color: '#2563EB', bg: '#EFF4FF' },
  { id: 'in_progress',       label: 'En cours',            color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'waiting_parts',     label: 'Attente pièces',      color: '#DB2777', bg: '#FCE7F3' },
  { id: 'quality_check',     label: 'Contrôle qualité',    color: '#8B5CF6', bg: '#EDE9FE' },
  { id: 'done',              label: 'Terminé',             color: '#10B981', bg: '#ECFDF5' },
];

export const INITIAL_OPERATORS = [
  { id: 'op1', name: 'Marc Dubois',    role: 'Mécanicien',       color: '#2563EB', initials: 'MD', active: 4 },
  { id: 'op2', name: 'Sophie Laurent', role: 'Carrossière',      color: '#DB2777', initials: 'SL', active: 2 },
  { id: 'op3', name: 'Karim Benali',   role: 'Électricien auto', color: '#F59E0B', initials: 'KB', active: 3 },
  { id: 'op4', name: 'Julie Moreau',   role: 'Mécanicienne',     color: '#10B981', initials: 'JM', active: 1 },
];

export const INITIAL_ORS = [
  { id: 'OR-2026-0142', status: 'signed',            signed: true,  client: 'M. Bernard Petit',       vehicle: 'Peugeot 308 — AB-123-CD',    km: 87420,  operation: 'Révision 80 000 km + plaquettes AV',                  operators: ['op1'],        estimatedHours: 3.5, priority: 'normal', createdAt: '08/04' },
  { id: 'OR-2026-0143', status: 'in_progress',       signed: true,  client: 'Mme Dubois',             vehicle: 'Renault Clio V — EF-456-GH', km: 42100,  operation: 'Diagnostic électronique + remplacement capteur ABS',   operators: ['op3'],        estimatedHours: 2,   priority: 'high',   createdAt: '07/04' },
  { id: 'OR-2026-0144', status: 'in_progress',       signed: true,  client: 'SARL Transport Loiret',  vehicle: 'Citroën Jumpy — IJ-789-KL',  km: 156300, operation: 'Embrayage complet + volant moteur',                   operators: ['op1', 'op4'], estimatedHours: 8,   priority: 'normal', createdAt: '06/04' },
  { id: 'OR-2026-0145', status: 'waiting_parts',     signed: true,  client: 'M. Lefèvre',             vehicle: 'BMW Série 3 — MN-012-OP',    km: 68900,  operation: 'Remplacement turbo',                                  operators: ['op1'],        estimatedHours: 5,   priority: 'high',   createdAt: '05/04' },
  { id: 'OR-2026-0146', status: 'quality_check',     signed: true,  client: 'Mme Garcia',             vehicle: 'Volkswagen Polo — QR-345-ST',km: 31200,  operation: 'Vidange + filtres',                                   operators: ['op4'],        estimatedHours: 1,   priority: 'normal', createdAt: '08/04' },
  { id: 'OR-2026-0141', status: 'done',              signed: true,  client: 'M. Rossi',               vehicle: 'Fiat 500 — UV-678-WX',       km: 54000,  operation: 'Pneus + géométrie',                                   operators: ['op2'],        estimatedHours: 2,   priority: 'normal', createdAt: '04/04' },
  { id: 'OR-2026-0147', status: 'pending_signature', signed: false, client: 'M. Chen',                vehicle: 'Tesla Model 3 — YZ-901-AB',  km: 28500,  operation: 'Devis carrosserie aile avant droite',                 operators: [],             estimatedHours: 6,   priority: 'normal', createdAt: '09/04' },
];
