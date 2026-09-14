import React, { useState } from 'react';
import { 
  Boxes, Search, Plus, AlertCircle, CheckCircle2, 
  ArrowDownToLine, MapPin, DollarSign, PackagePlus, FileSpreadsheet
} from 'lucide-react';
import { SparePart } from '../../types/eams';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatDate } from '../../utils/formatters';

interface InventoryListProps {
  onOpenRestock: (part: SparePart) => void;
  onOpenCreatePart: () => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  onOpenRestock,
  onOpenCreatePart,
}) => {
  const { currentUser, can } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterThreshold, setFilterThreshold] = useState<boolean>(false);

  const spareParts = db.getSpareParts();

  const filteredParts = spareParts.filter(part => {
    const matchesSearch = 
      part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (part.rack_location || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesThreshold = !filterThreshold || part.stock_qty <= part.minimum_threshold;
    return matchesSearch && matchesThreshold;
  });

  const totalInventoryValuation = spareParts.reduce((sum, p) => sum + (p.stock_qty * p.unit_cost), 0);
  const lowStockCount = spareParts.filter(p => p.stock_qty <= p.minimum_threshold).length;

  const exportToCSV = () => {
    const headers = ['SKU', 'Nama Suku Cadang', 'Satuan', 'Stok Saat Ini', 'Batas Minimum', 'Harga Satuan (IDR)', 'Total Nilai Stok (IDR)', 'Lokasi Rak'];
    const rows = filteredParts.map(p => [
      p.sku,
      `"${p.name}"`,
      p.unit,
      p.stock_qty,
      p.minimum_threshold,
      p.unit_cost,
      p.stock_qty * p.unit_cost,
      `"${p.rack_location || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eams_spare_parts_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            Manajemen Suku Cadang & Inventaris Gudang
          </h2>
          <p className="text-xs text-slate-400">
            Pencegahan kebocoran stok suku cadang via otorisasi Work Order dan threshold monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {can.manageInventory && (
            <button
              onClick={onOpenCreatePart}
              id="btn-add-spare-part"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Master Part</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Total Nilai Suku Cadang Tersedia</div>
          <div className="text-lg font-bold text-emerald-400 font-mono">{formatRupiah(totalInventoryValuation)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Valuasi stok gudang real-time</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Total Master SKU</div>
          <div className="text-lg font-bold text-white font-mono">{spareParts.length} <span className="text-xs text-slate-400 font-normal">Komponen</span></div>
          <div className="text-[10px] text-slate-500 mt-1">Tercatat dalam katalog gudang</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Status Ambang Batas Stok</div>
          <div className="text-lg font-bold font-mono">
            {lowStockCount > 0 ? (
              <span className="text-rose-400 animate-pulse">{lowStockCount} SKU Kritis</span>
            ) : (
              <span className="text-emerald-400">100% Aman</span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Perlu restock segera</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari SKU, Nama Suku Cadang, Lokasi Rak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setFilterThreshold(!filterThreshold)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            filterThreshold 
              ? 'bg-rose-950 text-rose-300 border-rose-700' 
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Hanya Stok Kritis ({lowStockCount})</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3.5">SKU & Suku Cadang</th>
                <th className="px-4 py-3.5">Lokasi Rak</th>
                <th className="px-4 py-3.5 text-center">Stok / Batas Min</th>
                <th className="px-4 py-3.5">Harga Satuan</th>
                <th className="px-4 py-3.5">Total Valuasi</th>
                <th className="px-4 py-3.5 text-right">Aksi Gudang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada suku cadang yang cocok dengan kriteria.
                  </td>
                </tr>
              ) : (
                filteredParts.map(part => {
                  const isLow = part.stock_qty <= part.minimum_threshold;
                  const totalVal = part.stock_qty * part.unit_cost;

                  return (
                    <tr key={part.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-emerald-400">{part.sku}</div>
                        <div className="font-semibold text-slate-100">{part.name}</div>
                        {part.category && <div className="text-[10px] text-slate-500">{part.category}</div>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {part.rack_location || 'Gudang Utama'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className={`font-mono text-sm font-black ${isLow ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                          {part.stock_qty} <span className="text-xs font-normal text-slate-400">{part.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Min: {part.minimum_threshold} {part.unit}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {formatRupiah(part.unit_cost)}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                        {formatRupiah(totalVal)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {can.restockInventory && (
                          <button
                            onClick={() => onOpenRestock(part)}
                            id={`btn-restock-${part.id}`}
                            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            <span>Restock In</span>
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
    </div>
  );
};
