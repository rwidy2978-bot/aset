import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeftRight, Search, Plus, CheckCircle2, Clock, 
  MapPin, Truck, AlertCircle, UserCheck, Check, CornerDownRight
} from 'lucide-react';
import { AssetMovement, MovementStatus } from '../../types/eams';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime } from '../../utils/formatters';

interface AssetMovementListProps {
  onOpenCreateMovement: () => void;
}

export const AssetMovementList: React.FC<AssetMovementListProps> = ({
  onOpenCreateMovement,
}) => {
  const { currentUser, can } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const movements = db.getAssetMovements();

  const filteredMovements = movements.filter(m => {
    const matchesSearch = 
      (m.asset?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.asset?.asset_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.from_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.to_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: number) => {
    try {
      db.approveAssetMovement(id, currentUser);
      setMsg({ text: 'Mutasi telah disetujui! Status aset sekarang IN TRANSIT menuju lokasi baru.', type: 'success' });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e: any) {
      setMsg({ text: e.message, type: 'error' });
    }
  };

  const handleComplete = (id: number) => {
    try {
      db.completeAssetMovement(id, currentUser);
      setMsg({ text: 'Konfirmasi kedatangan berhasil! Lokasi aset telah terupdate secara otomatis.', type: 'success' });
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) {
      setMsg({ text: e.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            Mutasi & Transfer Lokasi Aset Fisik
          </h2>
          <p className="text-xs text-slate-400">
            Pencatatan perpindahan unit antar site/warehouse dengan approval berjenjang dan status in-transit.
          </p>
        </div>

        {can.requestMovement && (
          <button
            onClick={onOpenCreateMovement}
            id="btn-request-movement"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Mutasi Aset</span>
          </button>
        )}
      </div>

      {msg && (
        <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Aset, Asal Lokasi, Tujuan, Catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="all">Semua Status Mutasi</option>
          <option value="pending">Pending (Menunggu Approval Supervisor)</option>
          <option value="in_transit">In Transit (Dalam Pengiriman)</option>
          <option value="completed">Completed (Tiba di Lokasi Baru)</option>
        </select>
      </div>

      {/* Movements Table / Cards */}
      <div className="space-y-3">
        {filteredMovements.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            Tidak ada riwayat mutasi aset yang sesuai filter.
          </div>
        ) : (
          filteredMovements.map(m => {
            const isPending = m.status === 'pending';
            const isInTransit = m.status === 'in_transit';
            const isCompleted = m.status === 'completed';

            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm hover:border-slate-700 transition-all"
              >
                {/* Top: Status & Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded border font-semibold ${
                      isPending 
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : isInTransit
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {m.status.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-400">
                      [{m.asset?.asset_code}] {m.asset?.name}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Diajukan: {formatDateTime(m.created_at)}
                  </div>
                </div>

                {/* Locations Flow */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-rose-300">
                    <MapPin className="w-4 h-4 shrink-0 text-rose-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Lokasi Asal:</div>
                      <div className="font-medium">{m.from_location}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 px-4">
                    <Truck className={`w-5 h-5 ${isInTransit ? 'text-cyan-400 animate-bounce' : 'text-slate-600'}`} />
                    <span className="text-[11px] font-mono">➔</span>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-300">
                    <MapPin className="w-4 h-4 shrink-0 text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Lokasi Tujuan:</div>
                      <div className="font-bold text-emerald-400">{m.to_location}</div>
                    </div>
                  </div>
                </div>

                {/* Notes & People */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-400 pt-1">
                  <div>
                    {m.notes && <p className="text-slate-300 italic">"{m.notes}"</p>}
                    <div className="text-[11px] text-slate-500 mt-1">
                      Pemohon: <strong className="text-slate-400">{m.requester?.name || 'Staff'}</strong>
                      {m.approver && (
                        <span> • Disetujui oleh: <strong className="text-blue-400">{m.approver.name}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Actions based on Role and Status */}
                  <div className="flex items-center gap-2">
                    {isPending && can.approveMovement && (
                      <button
                        onClick={() => handleApprove(m.id)}
                        id={`btn-approve-move-${m.id}`}
                        className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui Pengiriman (In-Transit)</span>
                      </button>
                    )}

                    {isInTransit && (currentUser.role === 'warehouse_specialist' || currentUser.role === 'supervisor' || currentUser.role === 'admin') && (
                      <button
                        onClick={() => handleComplete(m.id)}
                        id={`btn-complete-move-${m.id}`}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Konfirmasi Tiba di Tujuan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
