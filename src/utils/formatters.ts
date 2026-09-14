export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const getAssetStatusBadge = (status: string) => {
  switch (status) {
    case 'warehouse':
      return { label: 'Di Gudang', bg: 'bg-amber-950/60 text-amber-300 border-amber-800/60' };
    case 'deployed':
      return { label: 'Aktif Beroperasi', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' };
    case 'under_maintenance':
      return { label: 'Dalam Perbaikan', bg: 'bg-rose-950/60 text-rose-300 border-rose-800/60' };
    case 'disposed':
      return { label: 'Pelepasan / Afkir', bg: 'bg-slate-900 text-slate-400 border-slate-700' };
    default:
      return { label: status, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
  }
};

export const getConditionBadge = (condition: string) => {
  switch (condition) {
    case 'good':
      return { label: 'Prima (Good)', color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50' };
    case 'degraded':
      return { label: 'Menurun (Degraded)', color: 'text-amber-400 bg-amber-950/50 border-amber-800/50' };
    case 'critical':
      return { label: 'Kritis (Critical)', color: 'text-orange-400 bg-orange-950/50 border-orange-800/50' };
    case 'damaged':
      return { label: 'Rusak Berat (Damaged)', color: 'text-red-400 bg-red-950/50 border-red-800/50' };
    default:
      return { label: condition, color: 'text-slate-400 bg-slate-800 border-slate-700' };
  }
};

export const getWorkOrderPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'critical':
      return { label: 'CRITICAL (SLA 4H)', bg: 'bg-red-950/80 text-red-300 border-red-700' };
    case 'high':
      return { label: 'HIGH (SLA 24H)', bg: 'bg-orange-950/70 text-orange-300 border-orange-700' };
    case 'medium':
      return { label: 'MEDIUM (SLA 48H)', bg: 'bg-blue-950/70 text-blue-300 border-blue-700' };
    case 'low':
      return { label: 'LOW (SLA 72H)', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    default:
      return { label: priority, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
  }
};

export const getWorkOrderStatusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return { label: 'Draft', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    case 'assigned':
      return { label: 'Ditugaskan (Assigned)', bg: 'bg-cyan-950/70 text-cyan-300 border-cyan-700' };
    case 'in_progress':
      return { label: 'Dikerjakan (In Progress)', bg: 'bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse' };
    case 'pending_parts':
      return { label: 'Menunggu Spare Part', bg: 'bg-purple-950/80 text-purple-300 border-purple-700' };
    case 'completed':
      return { label: 'Selesai (Menunggu Approval)', bg: 'bg-blue-950/80 text-blue-300 border-blue-600' };
    case 'approved':
      return { label: 'Disetujui & Closed', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-600' };
    case 'rejected':
      return { label: 'Ditolak / Revisi', bg: 'bg-rose-950/80 text-rose-300 border-rose-700' };
    default:
      return { label: status, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
  }
};
