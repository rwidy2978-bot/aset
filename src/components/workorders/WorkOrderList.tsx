import React, { useState } from 'react';
import { 
  Wrench, Search, Filter, Plus, Clock, CheckCircle2, 
  AlertTriangle, ShieldAlert, ArrowRight, UserCheck, Eye, Sparkles, CheckSquare
} from 'lucide-react';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../../types/eams';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, formatDate, getWorkOrderPriorityBadge, getWorkOrderStatusBadge, formatRupiah } from '../../utils/formatters';

interface WorkOrderListProps {
  onSelectWorkOrder: (id: number) => void;
  onOpenCreateWO: () => void;
}

export const WorkOrderList: React.FC<WorkOrderListProps> = ({
  onSelectWorkOrder,
  onOpenCreateWO,
}) => {
  const { currentUser, can } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [onlyMyTasks, setOnlyMyTasks] = useState<boolean>(currentUser.role === 'mechanic');

  const workOrders = db.getWorkOrders();

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = 
      wo.wo_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.issue_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wo.asset?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wo.asset?.asset_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wo.mechanic?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || wo.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || wo.priority === selectedPriority;
    const matchesMyTasks = !onlyMyTasks || wo.mechanic_id === currentUser.id;

    return matchesSearch && matchesStatus && matchesPriority && matchesMyTasks;
  });

  const getSlaTimeRemaining = (wo: WorkOrder) => {
    if (wo.status === 'completed' || wo.status === 'approved') {
      return { text: 'SLA Terpenuhi', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
    }
    if (!wo.due_date) return { text: `${wo.sla_hours || 24} Jam`, color: 'text-slate-400 bg-slate-900 border-slate-800' };

    const diffMs = new Date(wo.due_date).getTime() - Date.now();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) {
      return { text: `SLA Lewat (${Math.abs(diffHours)}j)`, color: 'text-rose-400 bg-rose-950/80 border-rose-700 animate-pulse font-bold' };
    }
    if (diffHours <= 4) {
      return { text: `Sisa ${diffHours} Jam!`, color: 'text-amber-400 bg-amber-950/80 border-amber-700 font-bold' };
    }
    return { text: `Sisa ${diffHours} Jam`, color: 'text-blue-400 bg-blue-950/60 border-blue-800' };
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Manajemen Work Order & Pemeliharaan (SLA)
          </h2>
          <p className="text-xs text-slate-400">
            Alur otomatisasi tiket perbaikan, triage kerusakan, pemakaian suku cadang, dan approval supervisor.
          </p>
        </div>

        {can.createWorkOrder && (
          <button
            onClick={onOpenCreateWO}
            id="btn-create-wo"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Work Order Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Quick Toggle */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari WO, Aset, Deskripsi, Mekanik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Status Tiket</option>
              <option value="assigned">Assigned (Ditugaskan)</option>
              <option value="in_progress">In Progress (Sedang Dikerjakan)</option>
              <option value="pending_parts">Pending Parts (Menunggu Suku Cadang)</option>
              <option value="completed">Completed (Menunggu Approval Supervisor)</option>
              <option value="approved">Approved & Closed</option>
              <option value="rejected">Rejected (Revisi)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Tingkat Prioritas</option>
              <option value="critical">Critical (SLA 4 Jam)</option>
              <option value="high">High (SLA 24 Jam)</option>
              <option value="medium">Medium (SLA 48 Jam)</option>
              <option value="low">Low (SLA 72 Jam)</option>
            </select>
          </div>

          {currentUser.role === 'mechanic' && (
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer p-2 rounded-xl bg-slate-950 border border-slate-800 w-full">
                <input
                  type="checkbox"
                  checked={onlyMyTasks}
                  onChange={(e) => setOnlyMyTasks(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Hanya Tiket Saya ({currentUser.name})</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Work Orders Board / Table */}
      <div className="space-y-3">
        {filteredWorkOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            Tidak ada Work Order yang sesuai dengan pencarian.
          </div>
        ) : (
          filteredWorkOrders.map(wo => {
            const priorityBadge = getWorkOrderPriorityBadge(wo.priority);
            const statusBadge = getWorkOrderStatusBadge(wo.status);
            const slaStatus = getSlaTimeRemaining(wo);
            const completedChecklistCount = (wo.checklist || []).filter(c => c.completed).length;
            const totalChecklist = (wo.checklist || []).length;

            return (
              <div
                key={wo.id}
                onClick={() => onSelectWorkOrder(wo.id)}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-3 group shadow-sm"
              >
                {/* Top Row: WO Number, Priority, SLA, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-blue-400">{wo.wo_number}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded border font-semibold ${priorityBadge.bg}`}>
                      {priorityBadge.label}
                    </span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      Tipe: {wo.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded border flex items-center gap-1 ${slaStatus.color}`}>
                      <Clock className="w-3 h-3" />
                      {slaStatus.text}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded border font-medium ${statusBadge.bg}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>

                {/* Middle: Asset Info & Issue */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="md:col-span-2 space-y-1">
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="text-blue-400 font-mono">[{wo.asset?.asset_code}]</span>
                      <span>{wo.asset?.name}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {wo.issue_description}
                    </p>
                  </div>

                  {/* Right Column: Mechanic & Progress Checklist */}
                  <div className="space-y-1.5 text-xs text-slate-400 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-2 md:pt-0">
                    <div className="flex justify-between">
                      <span>Mekanik Penanggung Jawab:</span>
                      <strong className="text-slate-200">{wo.mechanic?.name || '-'}</strong>
                    </div>
                    {totalChecklist > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>Checklist Inspeksi:</span>
                          <span className="font-mono text-blue-400 font-bold">{completedChecklistCount}/{totalChecklist}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full transition-all" 
                            style={{ width: `${(completedChecklistCount / totalChecklist) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {wo.items && wo.items.length > 0 && (
                      <div className="text-[11px] text-emerald-400 flex justify-between pt-1">
                        <span>Suku Cadang Terpakai:</span>
                        <span className="font-mono font-bold">{wo.items.length} Komponen</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                  <span>Dibuat: {formatDate(wo.created_at)} oleh {wo.coordinator?.name || 'Coordinator'}</span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                    Buka Detail & Tindakan <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
