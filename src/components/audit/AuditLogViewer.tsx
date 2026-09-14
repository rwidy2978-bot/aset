import React, { useState } from 'react';
import { 
  ShieldCheck, Search, Filter, History, 
  FileSpreadsheet, UserCheck, Clock, Eye, X, Terminal
} from 'lucide-react';
import { AuditLog } from '../../types/eams';
import { db } from '../../services/db';
import { formatDateTime } from '../../utils/formatters';

export const AuditLogViewer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);

  const logs = db.getAuditLogs();

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entity_id ? log.entity_id.toString().includes(searchQuery) : false);

    const matchesEntity = selectedEntity === 'all' || log.entity_type === selectedEntity;
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;

    return matchesSearch && matchesEntity && matchesAction;
  });

  const exportAuditCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Aksi', 'Tipe Entitas', 'ID Entitas', 'Keterangan', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.timestamp || l.created_at || ''}"`,
      `"${l.user_name}"`,
      `"${l.role || l.user_role || ''}"`,
      `"${l.action}"`,
      `"${l.entity_type}"`,
      l.entity_id || '',
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ip_address || '127.0.0.1'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eams_audit_trail_immutable_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'create_wo':
      case 'create_asset':
      case 'create_part':
      case 'request_movement':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'approve':
      case 'approve_wo':
      case 'approve_movement':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'complete':
      case 'complete_wo':
      case 'complete_movement':
      case 'restock':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'reject':
      case 'reject_wo':
      case 'delete':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Audit Trail & Log Riwayat Sistem (Immutable)
          </h2>
          <p className="text-xs text-slate-400">
            Pencatatan kepatuhan hukum dan riwayat mutasi per data per user secara transparan dan akuntabel.
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Audit Log CSV</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari User, Entitas, Aksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Tipe Entitas</option>
            <option value="asset">Aset Fisik (asset)</option>
            <option value="work_order">Work Order (work_order)</option>
            <option value="inventory">Inventaris Suku Cadang (inventory)</option>
            <option value="asset_movement">Mutasi Aset (asset_movement)</option>
            <option value="system">Sistem (system)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Jenis Aksi</option>
            <option value="create_asset">Buat Aset</option>
            <option value="update_asset">Update Aset</option>
            <option value="create_wo">Buat Work Order</option>
            <option value="complete_wo">Selesaikan WO</option>
            <option value="approve_wo">Approve WO</option>
            <option value="restock">Restock Suku Cadang</option>
            <option value="request_movement">Ajukan Mutasi</option>
            <option value="approve_movement">Approve Mutasi</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3.5">Waktu (Timestamp)</th>
                <th className="px-4 py-3.5">Pengguna & Role</th>
                <th className="px-4 py-3.5">Aksi Sistem</th>
                <th className="px-4 py-3.5">Target Entitas</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-4 py-3.5 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada catatan log audit yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const badgeColor = getActionBadgeColor(log.action);

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {formatDateTime(log.timestamp || log.created_at || new Date().toISOString())}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{log.user_name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{log.role || log.user_role}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badgeColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-slate-200 uppercase font-semibold text-[11px]">
                          {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(log.old_values || log.new_values || log.details) && (
                          <button
                            onClick={() => setInspectLog(log)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3 h-3 text-blue-400" />
                            <span>Detail Log</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Audit Log Inspector #{inspectLog.id} ({inspectLog.action})
                </h3>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 space-y-1">
                <div>Pengguna: <strong className="text-white">{inspectLog.user_name} ({inspectLog.role || inspectLog.user_role})</strong></div>
                <div>Waktu: <strong className="text-white">{formatDateTime(inspectLog.timestamp || inspectLog.created_at || '')}</strong></div>
                <div>Entitas: <strong className="text-blue-400">{inspectLog.entity_type} #{inspectLog.entity_id}</strong></div>
                <div>Keterangan: <span className="text-slate-200">{inspectLog.details}</span></div>
              </div>

              {inspectLog.old_values && (
                <div>
                  <div className="text-rose-400 font-bold mb-1">State Sebelumnya (Old Values):</div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-rose-950 text-slate-300 overflow-x-auto text-[11px]">
                    {JSON.stringify(inspectLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {inspectLog.new_values && (
                <div>
                  <div className="text-emerald-400 font-bold mb-1">State Baru (New Values):</div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-emerald-950 text-slate-300 overflow-x-auto text-[11px]">
                    {JSON.stringify(inspectLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
