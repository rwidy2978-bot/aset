import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Wrench, CheckCircle2, Clock, AlertTriangle, ShieldCheck, 
  Boxes, Plus, Trash2, ArrowRight, FileText, UserCheck, MessageSquare
} from 'lucide-react';
import { WorkOrder, SparePart } from '../../types/eams';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, formatDate, formatRupiah, getWorkOrderPriorityBadge, getWorkOrderStatusBadge } from '../../utils/formatters';

interface WorkOrderDetailModalProps {
  workOrderId: number;
  onClose: () => void;
  onRefresh: () => void;
}

export const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({
  workOrderId,
  onClose,
  onRefresh,
}) => {
  const { currentUser, can } = useAuth();
  const wo = db.getWorkOrders().find(w => w.id === workOrderId);
  const spareParts = db.getSpareParts();

  // Mechanic execution state
  const [resolutionNotes, setResolutionNotes] = useState(wo?.resolution_notes || '');
  const [selectedParts, setSelectedParts] = useState<Array<{ spare_part_id: number; quantity: number }>>([]);
  const [partToAddId, setPartToAddId] = useState<number>(spareParts[0]?.id || 1);
  const [partQty, setPartQty] = useState<number>(1);

  // Supervisor review state
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!wo) return null;

  const priorityBadge = getWorkOrderPriorityBadge(wo.priority);
  const statusBadge = getWorkOrderStatusBadge(wo.status);

  // Checkbox toggle for checklist
  const handleToggleChecklist = (taskId: string, currentVal: boolean) => {
    try {
      db.updateWorkOrderChecklist(wo.id, taskId, !currentVal);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Start working on WO (Mechanic)
  const handleStartWork = () => {
    try {
      db.startWorkOrder(wo.id, currentUser);
      setSuccessMessage('Work Order status diubah ke In Progress. Selamat bekerja!');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Add spare part to pending list
  const handleAddPartToUsage = () => {
    const part = spareParts.find(p => p.id === Number(partToAddId));
    if (!part) return;

    if (part.stock_qty < partQty) {
      setErrorMessage(`Stok tidak mencukupi! Tersedia hanya ${part.stock_qty} ${part.unit}.`);
      return;
    }

    const existingIdx = selectedParts.findIndex(p => p.spare_part_id === part.id);
    if (existingIdx !== -1) {
      const updated = [...selectedParts];
      updated[existingIdx].quantity += partQty;
      setSelectedParts(updated);
    } else {
      setSelectedParts([...selectedParts, { spare_part_id: part.id, quantity: partQty }]);
    }
    setPartQty(1);
    setErrorMessage('');
  };

  const handleRemovePartFromUsage = (partId: number) => {
    setSelectedParts(selectedParts.filter(p => p.spare_part_id !== partId));
  };

  // Complete WO (Mechanic)
  const handleCompleteWorkOrder = () => {
    if (!resolutionNotes.trim()) {
      setErrorMessage('Harap isi Catatan Resolusi Teknis / Pekerjaan yang telah dilakukan sebelum menyelesaikan.');
      return;
    }

    try {
      db.completeWorkOrder(wo.id, resolutionNotes, selectedParts, currentUser);
      setSuccessMessage('Work Order berhasil diselesaikan dan diteruskan ke Supervisor untuk verifikasi approval.');
      onRefresh();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyelesaikan Work Order');
    }
  };

  // Approve WO (Supervisor)
  const handleApproveWorkOrder = () => {
    try {
      db.approveWorkOrder(wo.id, currentUser, supervisorNotes);
      setSuccessMessage('Work Order telah DISETUJUI. Kondisi aset telah dipulihkan ke normal (Good/Deployed).');
      onRefresh();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyetujui Work Order');
    }
  };

  // Reject WO (Supervisor)
  const handleRejectWorkOrder = () => {
    if (!rejectionReason.trim()) {
      setErrorMessage('Harap isi alasan penolakan / instruksi revisi untuk mekanik.');
      return;
    }

    try {
      db.rejectWorkOrder(wo.id, rejectionReason, currentUser);
      setSuccessMessage('Work Order dikembalikan dengan catatan revisi.');
      setIsRejectOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menolak Work Order');
    }
  };

  // Calculate total parts cost
  const existingItemsCost = (wo.items || []).reduce((sum, item) => sum + (Number(item.quantity_used) * Number(item.unit_cost)), 0);
  const pendingItemsCost = selectedParts.reduce((sum, item) => {
    const part = spareParts.find(p => p.id === item.spare_part_id);
    return sum + (item.quantity * (part?.unit_cost || 0));
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400">{wo.wo_number}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${priorityBadge.bg}`}>
                  {priorityBadge.label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {wo.asset?.name} <span className="font-mono text-xs text-slate-400">({wo.asset?.asset_code})</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Issue & Asset Details */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>Lokasi Aset: <strong className="text-slate-200">{wo.asset?.current_location}</strong></span>
              <span>Koordinator: <strong className="text-slate-200">{wo.coordinator?.name}</strong></span>
              <span>Mekanik: <strong className="text-blue-400">{wo.mechanic?.name}</strong></span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi Kerusakan / Instruksi Kerja:</div>
              <p className="text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-medium">
                {wo.issue_description}
              </p>
            </div>
          </div>

          {/* Maintenance Checklist */}
          {wo.checklist && wo.checklist.length > 0 && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Checklist Inspeksi & Perbaikan Standar
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {wo.checklist.filter(c => c.completed).length} / {wo.checklist.length} Selesai
                </span>
              </div>

              <div className="space-y-2">
                {wo.checklist.map((item) => (
                  <label
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      item.completed 
                        ? 'bg-blue-950/30 border-blue-800/60 text-slate-200' 
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled={wo.status === 'approved' || (currentUser.role !== 'mechanic' && currentUser.role !== 'admin')}
                      onChange={() => handleToggleChecklist(item.id, item.completed)}
                      className="mt-0.5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {item.title}
                      </div>
                      {item.notes && (
                        <div className="text-[11px] text-blue-400 mt-0.5">Catatan: {item.notes}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Spare Parts Usage Section (PRD Atomic Inventory Deduction) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-emerald-400" />
                Penggunaan Suku Cadang & Biaya Komponen
              </h4>
              <span className="font-mono text-emerald-400 font-bold">
                Total Biaya Part: {formatRupiah(existingItemsCost + pendingItemsCost)}
              </span>
            </div>

            {/* Already recorded items */}
            {wo.items && wo.items.length > 0 && (
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-2">SKU & Suku Cadang</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Harga Satuan</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    {wo.items.map(item => (
                      <tr key={item.id} className="bg-slate-950">
                        <td className="p-2">
                          <span className="font-bold text-white">{item.spare_part_name}</span>
                          <span className="text-[10px] text-slate-500 block">SKU: {item.spare_part_sku}</span>
                        </td>
                        <td className="p-2">{item.quantity_used}</td>
                        <td className="p-2">{formatRupiah(item.unit_cost)}</td>
                        <td className="p-2 text-right text-emerald-400 font-bold">
                          {formatRupiah(item.quantity_used * item.unit_cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add parts during mechanic work */}
            {(wo.status === 'assigned' || wo.status === 'in_progress') && (currentUser.role === 'mechanic' || currentUser.role === 'admin') && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400">Tambahkan Suku Cadang dari Gudang:</div>
                <div className="flex gap-2">
                  <select
                    value={partToAddId}
                    onChange={e => setPartToAddId(Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                  >
                    {spareParts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stok: {p.stock_qty} {p.unit} - {formatRupiah(p.unit_cost)})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={partQty}
                    onChange={e => setPartQty(Math.max(1, Number(e.target.value)))}
                    className="w-20 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddPartToUsage}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                  >
                    + Pasang
                  </button>
                </div>

                {selectedParts.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Suku Cadang Baru yang Akan Dipotong Otomatis Saat Selesai:</div>
                    {selectedParts.map(sp => {
                      const partObj = spareParts.find(p => p.id === sp.spare_part_id);
                      return (
                        <div key={sp.spare_part_id} className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-slate-200">
                          <div>
                            <strong>{partObj?.name}</strong> ({sp.quantity} {partObj?.unit})
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-emerald-400 font-semibold">{formatRupiah((partObj?.unit_cost || 0) * sp.quantity)}</span>
                            <button type="button" onClick={() => handleRemovePartFromUsage(sp.spare_part_id)} className="text-rose-400 hover:text-rose-300 font-bold">×</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resolution Notes Log */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Laporan Hasil Perbaikan & Analisa Teknis (Resolution Notes)
            </label>
            {wo.status === 'approved' || (wo.status === 'completed' && currentUser.role !== 'mechanic' && currentUser.role !== 'admin') ? (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                {wo.resolution_notes || 'Tidak ada catatan khusus.'}
              </div>
            ) : (
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                placeholder="Deskripsikan tindakan perbaikan yang telah dilakukan, hasil pengujian, dan rekomendasi perawatan..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            )}
          </div>

          {/* Supervisor Approval Decision Area */}
          {wo.status === 'completed' && can.approveWorkOrder && (
            <div className="p-5 rounded-2xl bg-indigo-950/60 border border-indigo-700/80 space-y-4">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Panel Verifikasi & Approval Supervisor</span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Silakan evaluasi checklist, pemakaian suku cadang, dan catatan resolusi mekanik sebelum menutup tiket WO dan mengembalikan status aset ke beroperasi (Good/Deployed).
              </p>

              <div className="space-y-1">
                <label className="text-slate-300">Catatan Tambahan Supervisor (Opsional):</label>
                <input
                  type="text"
                  value={supervisorNotes}
                  onChange={e => setSupervisorNotes(e.target.value)}
                  placeholder="Misal: Telah lolos uji fungsi 30 menit."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              {isRejectOpen ? (
                <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl space-y-2">
                  <label className="text-rose-300 font-bold">Alasan Penolakan / Revisi untuk Mekanik:</label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Jelaskan apa yang masih kurang atau perlu diperbaiki ulang..."
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRejectOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectWorkOrder}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                      Kirim Revisi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRejectOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/70 text-rose-300 font-medium"
                  >
                    Minta Revisi
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveWorkOrder}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui & Selesaikan (Approve WO)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Dibuat: {formatDateTime(wo.created_at)}
          </div>

          <div className="flex items-center gap-2">
            {wo.status === 'assigned' && (currentUser.role === 'mechanic' || currentUser.role === 'admin') && (
              <button
                type="button"
                onClick={handleStartWork}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30"
              >
                Mulai Pengerjaan (Start WO)
              </button>
            )}

            {(wo.status === 'assigned' || wo.status === 'in_progress') && (currentUser.role === 'mechanic' || currentUser.role === 'admin') && (
              <button
                type="button"
                onClick={handleCompleteWorkOrder}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesaikan & Ajukan Approval</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
