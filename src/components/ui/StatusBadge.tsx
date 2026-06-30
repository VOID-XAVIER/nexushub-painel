interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'online' | 'offline' | 'paid' | 'pending' | 'overdue';
  size?: 'sm' | 'md';
}

const statusStyles = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  online: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  offline: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusLabels = {
  active: 'Ativo',
  inactive: 'Inativo',
  online: 'Online',
  offline: 'Offline',
  paid: 'Pago',
  pending: 'Pendente',
  overdue: 'Vencido',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${statusStyles[status]} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'active' || status === 'online' || status === 'paid' ? 'bg-emerald-400' :
        status === 'pending' ? 'bg-amber-400' :
        status === 'overdue' ? 'bg-red-400' : 'bg-gray-400'
      }`} />
      {statusLabels[status]}
    </span>
  );
}
