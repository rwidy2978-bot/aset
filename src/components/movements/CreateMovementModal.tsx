import React, { useState } from 'react';
import { X, ArrowLeftRight, MapPin, CheckCircle2 } from 'lucide-react';
import { AssetMovement } from '../../types/eams';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface CreateMovementModalProps {
  initialAssetId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateMovementModal: React.FC<CreateMovementModalProps> = ({
  initialAssetId,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const assets = db.getAssets();

  const [assetId, setAssetId] = useState<number>(initialAssetId || (assets[0]?.id || 1));
  const selectedAsset = assets.find(a => a.id === Number(assetId));

  const [fromLocation, setFromLocation] = useState<string>(selectedAsset?.current_location || 'Central Warehouse Balikpapan');
  const [toLocation, setToLocation] = useState<string>('Project Smelter Weda Bay - Halmahera');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleAssetSelect = (newAssetId: number) => {
    setAssetId(newAssetId);
    const target = assets.find(a => a.id === newAssetId);
    if (target) {
      setFromLocation(target.current_location);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toLocation.trim()) {
      setErrorMsg('Lokasi tujuan mutasi wajib diisi!');
      return;
    }
    if (fromLocation.trim().toLowerCase() === toLocation.trim().toLowerCase()) {
      setErrorMsg('Lokasi tujuan tidak boleh sama dengan lokasi asal!');
      return;
    }

    try {
      db.requestAssetMovement({
        asset_id: Number(assetId),
        from_location: fromLocation,
        to_location: toLocation,
        notes,
      }, currentUser);

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengajukan mutasi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Pengajuan Mutasi Aset Fisik</h3>
              <p className="text-xs text-slate-400">Permintaan transfer lokasi antar site / pool unit</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Pilih Unit Aset yang Dimutasi *</label>
            <select
              value={assetId}
              onChange={e => handleAssetSelect(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-medium focus:outline-none focus:border-blue-500"
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  [{a.asset_code}] {a.name} ({a.current_location})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Lokasi Asal (Current Location)</label>
            <input
              type="text"
              readOnly
              value={fromLocation}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-medium cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Lokasi Tujuan Transfer / Site Baru *</label>
            <input
              type="text"
              required
              value={toLocation}
              onChange={e => setToLocation(e.target.value)}
              placeholder="Contoh: Site Tambang Morowali - Sektor C"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Alasan Perpindahan & Catatan Logistik</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Jelaskan kebutuhan proyek, jadwal ekspedisi kapal, atau estimasi tanggal pengiriman..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-[11px] text-cyan-200/90 leading-relaxed">
            Permintaan mutasi akan masuk ke antrian <strong>Operational Supervisor</strong> untuk disetujui sebelum status berubah menjadi <em>In-Transit</em>.
          </div>

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
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ajukan Mutasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
