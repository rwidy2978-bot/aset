import React, { useState } from 'react';
import { X, Package, DollarSign, Calendar, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Asset, Category, User, AssetStatus, ConditionStatus } from '../../types/eams';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/formatters';

interface AssetFormModalProps {
  assetToEdit?: Asset | null;
  onClose: () => void;
  onSuccess: (asset: Asset) => void;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  assetToEdit,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const categories = db.getCategories();
  const users = db.getUsers();

  const isEdit = !!assetToEdit;

  const [formData, setFormData] = useState({
    name: assetToEdit?.name || '',
    category_id: assetToEdit?.category_id || (categories[0]?.id || 1),
    asset_code: assetToEdit?.asset_code || `AST-${Date.now().toString().slice(-4)}`,
    serial_number: assetToEdit?.serial_number || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
    purchase_date: assetToEdit?.purchase_date || new Date().toISOString().split('T')[0],
    purchase_cost: assetToEdit?.purchase_cost || 500000000,
    residual_value: assetToEdit?.residual_value || 50000000,
    status: (assetToEdit?.status || 'deployed') as AssetStatus,
    condition_status: (assetToEdit?.condition_status || 'good') as ConditionStatus,
    current_location: assetToEdit?.current_location || 'Central Warehouse Balikpapan',
    assigned_user_id: assetToEdit?.assigned_user_id || 6,
    specs: assetToEdit?.specs || { 'Model/Tipe': 'Standard Grade', 'Kapasitas': 'Standard' },
  });

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddSpec = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [specKey.trim()]: specValue.trim() },
    }));
    setSpecKey('');
    setSpecValue('');
  };

  const handleRemoveSpec = (key: string) => {
    setFormData(prev => {
      const nextSpecs = { ...prev.specs };
      delete nextSpecs[key];
      return { ...prev, specs: nextSpecs };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Nama aset wajib diisi');
      return;
    }

    try {
      if (isEdit && assetToEdit) {
        const updated = db.updateAsset(assetToEdit.id, formData, currentUser);
        onSuccess(updated);
      } else {
        const created = db.createAsset({
          ...formData,
          category_id: Number(formData.category_id),
          purchase_cost: Number(formData.purchase_cost),
          residual_value: Number(formData.residual_value),
          assigned_user_id: formData.assigned_user_id ? Number(formData.assigned_user_id) : null,
        }, currentUser);
        onSuccess(created);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan aset');
    }
  };

  const selectedCategory = categories.find(c => c.id === Number(formData.category_id)) || categories[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEdit ? 'Edit Master Data Aset' : 'Registrasi Master Aset Baru'}
              </h3>
              <p className="text-xs text-slate-400">Pencatatan spesifikasi teknis dan parameter finansial</p>
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
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Asset Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-300 font-semibold">Nama Aset / Mesin *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Hydraulic Excavator Komatsu PC200-8M0"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Asset Code */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Kode Aset (Unique ID)</label>
              <input
                type="text"
                required
                value={formData.asset_code}
                onChange={e => setFormData({ ...formData, asset_code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Serial Number */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Nomor Seri Pabrik (Serial Number)</label>
              <input
                type="text"
                required
                value={formData.serial_number}
                onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Kategori Aset</label>
              <select
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.useful_life_years} Thn)</option>
                ))}
              </select>
            </div>

            {/* Current Location */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Lokasi Penempatan / Site</label>
              <input
                type="text"
                required
                value={formData.current_location}
                onChange={e => setFormData({ ...formData, current_location: e.target.value })}
                placeholder="Contoh: Site Tambang Morowali - Sektor A"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Operational Status */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Status Operasional</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="deployed">Deployed (Aktif Beroperasi)</option>
                <option value="warehouse">Warehouse (Stok di Gudang)</option>
                <option value="under_maintenance">Under Maintenance (Perbaikan)</option>
                <option value="disposed">Disposed (Afkir/Dilepas)</option>
              </select>
            </div>

            {/* Physical Condition */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Kondisi Fisik</label>
              <select
                value={formData.condition_status}
                onChange={e => setFormData({ ...formData, condition_status: e.target.value as ConditionStatus })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="good">Prima (Good)</option>
                <option value="degraded">Menurun (Degraded)</option>
                <option value="critical">Kritis (Critical)</option>
                <option value="damaged">Rusak Berat (Damaged)</option>
              </select>
            </div>

            {/* Purchase Date */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Tanggal Pembelian</label>
              <input
                type="date"
                required
                value={formData.purchase_date}
                onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Assigned PIC */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">PIC / Penanggung Jawab</label>
              <select
                value={formData.assigned_user_id || ''}
                onChange={e => setFormData({ ...formData, assigned_user_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Pool Umum / Tanpa PIC --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role_display_name})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Financial Section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Parameter Finansial & Depresiasi
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Harga Perolehan (Purchase Cost IDR) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.purchase_cost}
                  onChange={e => setFormData({ ...formData, purchase_cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Nilai Residu (Residual Value IDR)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.residual_value}
                  onChange={e => setFormData({ ...formData, residual_value: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Metode Kategori: <strong className="text-white font-mono uppercase">{selectedCategory.depreciation_method.replace('_', ' ')}</strong></span>
              <span>Masa Manfaat: <strong className="text-blue-400">{selectedCategory.useful_life_years} Tahun</strong></span>
            </div>
          </div>

          {/* Custom Specifications Key-Value */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold">Spesifikasi Operasional Tambahan</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Parameter (misal: Tenaga Mesin)"
                value={specKey}
                onChange={e => setSpecKey(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              />
              <input
                type="text"
                placeholder="Nilai (misal: 148 HP)"
                value={specValue}
                onChange={e => setSpecValue(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold"
              >
                Tambah
              </button>
            </div>

            {formData.specs && Object.keys(formData.specs).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(formData.specs).map(([key, val]) => (
                  <span key={key} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                    <strong>{key}:</strong> {val}
                    <button type="button" onClick={() => handleRemoveSpec(key)} className="text-rose-400 hover:text-rose-300 ml-1 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
              <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Master Aset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
