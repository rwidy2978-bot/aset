import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, Clock, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { WorkOrder, WorkOrderType, WorkOrderPriority } from '../../types/eams';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface CreateWorkOrderModalProps {
  initialAssetId?: number;
  onClose: () => void;
  onSuccess: (wo: WorkOrder) => void;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  initialAssetId,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const assets = db.getAssets();
  const mechanics = db.getUsers().filter(u => u.role === 'mechanic' || u.role === 'admin');

  const [assetId, setAssetId] = useState<number>(initialAssetId || (assets[0]?.id || 1));
  const [mechanicId, setMechanicId] = useState<number>(mechanics[0]?.id || 6);
  const [type, setType] = useState<WorkOrderType>('corrective');
  const [priority, setPriority] = useState<WorkOrderPriority>('medium');
  const [issueDescription, setIssueDescription] = useState('');
  const [slaHours, setSlaHours] = useState<number>(24);
  const [customChecklist, setCustomChecklist] = useState<string[]>([
    'Inspeksi fisik awal dan pembersihan area kerja',
    'Diagnosa kode error dan pembongkaran modul',
    'Penggantian komponen atau penyetelan torsi baut',
    'Uji fungsi operasional dan parameter temperatur',
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleTypeChange = (newType: WorkOrderType) => {
    setType(newType);
    if (newType === 'emergency') {
      setPriority('critical');
      setSlaHours(4);
    } else if (newType === 'corrective') {
      setPriority('high');
      setSlaHours(24);
    } else {
      setPriority('medium');
      setSlaHours(48);
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setCustomChecklist([...customChecklist, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (index: number) => {
    setCustomChecklist(customChecklist.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      setErrorMsg('Deskripsi masalah wajib diisi!');
      return;
    }

    try {
      const created = db.createWorkOrder({
        asset_id: Number(assetId),
        mechanic_id: Number(mechanicId),
        type,
        priority,
        issue_description: issueDescription,
        checklist: customChecklist,
        sla_hours: Number(slaHours),
      }, currentUser);

      onSuccess(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat Work Order');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Penerbitan Work Order Baru</h3>
              <p className="text-xs text-slate-400">Triage penanganan kerusakan & penugasan mekanik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Asset */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-300 font-semibold">Pilih Unit Aset *</label>
              <select
                value={assetId}
                onChange={e => setAssetId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.asset_code}] {a.name} ({a.current_location})
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Tipe Perawatan</label>
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value as WorkOrderType)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="preventive">Preventive (Pemeliharaan Berkala)</option>
                <option value="corrective">Corrective (Perbaikan Kerusakan Normal)</option>
                <option value="emergency">Emergency (Darurat / Operasional Terhenti)</option>
              </select>
            </div>

            {/* Priority & SLA */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Tingkat Prioritas (SLA Target)</label>
              <select
                value={priority}
                onChange={e => {
                  const p = e.target.value as WorkOrderPriority;
                  setPriority(p);
                  setSlaHours(p === 'critical' ? 4 : p === 'high' ? 24 : p === 'medium' ? 48 : 72);
                }}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="critical">Critical (Target SLA: 4 Jam)</option>
                <option value="high">High (Target SLA: 24 Jam)</option>
                <option value="medium">Medium (Target SLA: 48 Jam)</option>
                <option value="low">Low (Target SLA: 72 Jam)</option>
              </select>
            </div>

            {/* Mechanic Assignment */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-300 font-semibold">Mekanik / Teknisi Ditugaskan *</label>
              <select
                value={mechanicId}
                onChange={e => setMechanicId(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {mechanics.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                ))}
              </select>
            </div>

            {/* Issue Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-300 font-semibold">Deskripsi Kerusakan & Gejala Lapangan *</label>
              <textarea
                rows={3}
                required
                value={issueDescription}
                onChange={e => setIssueDescription(e.target.value)}
                placeholder="Deskripsikan secara rinci indikasi kerusakan, suara bising, penurunan performa, atau instruksi servis berkala..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Checklist Generator */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="text-slate-300 font-semibold">Checklist Tugas Inspeksi Teknisi</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambahkan item checklist..."
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold"
              >
                + Item
              </button>
            </div>

            <div className="space-y-1.5 pt-2">
              {customChecklist.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-slate-300">
                  <span>{idx + 1}. {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(idx)}
                    className="text-rose-400 hover:text-rose-300 font-bold ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Terbitkan Work Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
