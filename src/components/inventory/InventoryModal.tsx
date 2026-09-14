import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Boxes, PackagePlus, DollarSign, MapPin, CheckCircle2 } from 'lucide-react';
import { SparePart } from '../../types/eams';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/formatters';

interface InventoryModalProps {
  mode: 'restock' | 'create';
  selectedPart?: SparePart | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  mode,
  selectedPart,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();

  // Restock state
  const [restockQty, setRestockQty] = useState<number>(5);
  const [restockNotes, setRestockNotes] = useState<string>('Penerimaan pengadaan PO Vendor batch baru.');

  // Create state
  const [formData, setFormData] = useState({
    sku: `SP-${Date.now().toString().slice(-6)}`,
    name: '',
    unit: 'Pcs',
    stock_qty: 10,
    minimum_threshold: 5,
    unit_cost: 500000,
    rack_location: 'Rack GEN-01',
    category: 'General Parts',
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;

    try {
      db.restockSparePart(selectedPart.id, Number(restockQty), restockNotes, currentUser);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal restock suku cadang');
    }
  };

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Nama suku cadang wajib diisi');
      return;
    }

    try {
      db.createSparePart({
        sku: formData.sku.toUpperCase(),
        name: formData.name,
        unit: formData.unit,
        stock_qty: Number(formData.stock_qty),
        minimum_threshold: Number(formData.minimum_threshold),
        unit_cost: Number(formData.unit_cost),
        rack_location: formData.rack_location,
        category: formData.category,
      }, currentUser);

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat suku cadang');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {mode === 'restock' ? 'Penerimaan Stok Suku Cadang' : 'Pendaftaran Master Suku Cadang'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'restock' ? `Restock masuk untuk ${selectedPart?.name}` : 'Katalog inventaris gudang baru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {mode === 'restock' && selectedPart ? (
          <form onSubmit={handleRestock} className="p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">SKU Master:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedPart.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Barang:</span>
                <span className="font-bold text-white">{selectedPart.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stok Saat Ini:</span>
                <span className="font-mono text-slate-200">{selectedPart.stock_qty} {selectedPart.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Harga Satuan:</span>
                <span className="font-mono text-slate-200">{formatRupiah(selectedPart.unit_cost)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Jumlah Stok Masuk ({selectedPart.unit}) *</label>
              <input
                type="number"
                min="1"
                required
                value={restockQty}
                onChange={e => setRestockQty(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-base font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Catatan Penerimaan / No. Dokumen PO</label>
              <textarea
                rows={2}
                value={restockNotes}
                onChange={e => setRestockNotes(e.target.value)}
                placeholder="Misal: PO-2026-0812 dari PT Distributor Resmi..."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              />
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
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <PackagePlus className="w-4 h-4" />
                <span>Simpan Penerimaan Stok</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreatePart} className="p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">SKU Suku Cadang (Unique) *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Nama Suku Cadang *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Hydraulic Pump Seal Kit"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Satuan (Unit)</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Pcs / Set / Drum / Kit"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Lokasi Rak Gudang</label>
                <input
                  type="text"
                  value={formData.rack_location}
                  onChange={e => setFormData({ ...formData, rack_location: e.target.value })}
                  placeholder="Rack A-01"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Stok Awal</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_qty}
                  onChange={e => setFormData({ ...formData, stock_qty: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Batas Minimum (Alert)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.minimum_threshold}
                  onChange={e => setFormData({ ...formData, minimum_threshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Harga Satuan (Unit Cost IDR)</label>
              <input
                type="number"
                min="0"
                value={formData.unit_cost}
                onChange={e => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold"
              />
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
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Master Part</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
