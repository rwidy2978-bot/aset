import React, { useState } from 'react';
import { 
  Package, Search, Filter, Plus, QrCode, Wrench, 
  ArrowLeftRight, Eye, Edit3, Trash2, Download, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { Asset, AssetStatus, ConditionStatus } from '../../types/eams';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatDate, getAssetStatusBadge, getConditionBadge } from '../../utils/formatters';

interface AssetListProps {
  onSelectAsset: (id: number) => void;
  onOpenCreateAsset: () => void;
  onEditAsset: (asset: Asset) => void;
  onOpenQRScanner: () => void;
  onOpenCreateWOForAsset: (assetId: number) => void;
  onOpenMovementForAsset: (assetId: number) => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  onSelectAsset,
  onOpenCreateAsset,
  onEditAsset,
  onOpenCreateWOForAsset,
  onOpenMovementForAsset,
}) => {
  const { currentUser, can } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const assets = db.getAssets();
  const categories = db.getCategories();

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.asset_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.current_location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || String(asset.category_id) === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
    const matchesCondition = selectedCondition === 'all' || asset.condition_status === selectedCondition;

    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  });

  const handleDelete = (id: number) => {
    db.deleteAsset(id, currentUser);
    setDeleteConfirmId(null);
  };

  const exportToCSV = () => {
    const headers = ['Kode Aset', 'Nama Aset', 'Serial Number', 'Kategori', 'Lokasi', 'Status', 'Kondisi', 'Nilai Perolehan (IDR)', 'Nilai Buku Terkini (IDR)'];
    const rows = filteredAssets.map(a => [
      a.asset_code,
      `"${a.name}"`,
      a.serial_number,
      `"${a.category?.name || ''}"`,
      `"${a.current_location}"`,
      a.status,
      a.condition_status,
      a.purchase_cost,
      a.current_book_value,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eams_master_assets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Master Data & Siklus Hidup Aset
          </h2>
          <p className="text-xs text-slate-400">
            Total {filteredAssets.length} dari {assets.length} aset terdaftar dengan kalkulasi nilai buku real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {can.createAsset && (
            <button
              onClick={onOpenCreateAsset}
              id="btn-add-new-asset"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrasi Aset Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Kode, Nama, No Seri, Lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Kategori ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Status Operasional</option>
              <option value="deployed">Deployed (Beroperasi)</option>
              <option value="under_maintenance">Under Maintenance (Perbaikan)</option>
              <option value="warehouse">Warehouse (Gudang)</option>
              <option value="disposed">Disposed (Pelepasan)</option>
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Kondisi Fisik</option>
              <option value="good">Prima (Good)</option>
              <option value="degraded">Menurun (Degraded)</option>
              <option value="critical">Kritis (Critical)</option>
              <option value="damaged">Rusak (Damaged)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3.5">Kode / Serial</th>
                <th className="px-4 py-3.5">Nama & Kategori Aset</th>
                <th className="px-4 py-3.5">Lokasi Saat Ini</th>
                <th className="px-4 py-3.5">Status & Kondisi</th>
                <th className="px-4 py-3.5">Nilai Buku Terkini</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada aset yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  const statusBadge = getAssetStatusBadge(asset.status);
                  const conditionBadge = getConditionBadge(asset.condition_status);

                  return (
                    <tr 
                      key={asset.id} 
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-blue-400">{asset.asset_code}</div>
                        <div className="text-[11px] text-slate-500 font-mono">SN: {asset.serial_number}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-100">{asset.name}</div>
                        <div className="text-[11px] text-slate-400">{asset.category?.name}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-300 font-medium">{asset.current_location}</div>
                        <div className="text-[11px] text-slate-500">PJ: {asset.assigned_user?.name || 'Pool Inventaris'}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${conditionBadge.color}`}>
                            {conditionBadge.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <div className="font-bold text-emerald-400">{formatRupiah(asset.current_book_value)}</div>
                        <div className="text-[10px] text-slate-500">Beli: {formatRupiah(asset.purchase_cost)}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectAsset(asset.id)}
                            id={`btn-view-asset-${asset.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Detail Lengkap & QR"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {can.createWorkOrder && (
                            <button
                              onClick={() => onOpenCreateWOForAsset(asset.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                              title="Buat Work Order"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                          )}

                          {can.requestMovement && (
                            <button
                              onClick={() => onOpenMovementForAsset(asset.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors"
                              title="Pengajuan Mutasi Lokasi"
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                            </button>
                          )}

                          {can.editAsset && (
                            <button
                              onClick={() => onEditAsset(asset)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Edit Data"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {can.deleteAsset && (
                            <button
                              onClick={() => setDeleteConfirmId(asset.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Hapus Aset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Hapus Aset dari Master Database?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Aset akan dihapus secara permanen beserta data kalkulasi nilai bukunya. Riwayat audit log penghapusan akan tetap dicatat.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg"
              >
                Ya, Hapus Aset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
