import React from 'react';
import { 
  DollarSign, PackageCheck, AlertCircle, Wrench, ArrowUpRight, 
  Clock, ShieldAlert, Boxes, TrendingDown, CheckCircle2, ChevronRight,
  PlusCircle, QrCode, ArrowLeftRight, Activity
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { db } from '../../services/db';
import { formatRupiah, formatDate, getWorkOrderPriorityBadge, getWorkOrderStatusBadge, getAssetStatusBadge } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface OverviewDashboardProps {
  onNavigate: (tab: string) => void;
  onSelectAsset: (id: number) => void;
  onSelectWorkOrder: (id: number) => void;
  onOpenCreateWO: () => void;
  onOpenCreateAsset: () => void;
  onOpenQRScanner: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onSelectAsset,
  onSelectWorkOrder,
  onOpenCreateWO,
  onOpenCreateAsset,
  onOpenQRScanner,
}) => {
  const { currentUser, can } = useAuth();

  const assets = db.getAssets();
  const workOrders = db.getWorkOrders();
  const spareParts = db.getSpareParts();
  const categories = db.getCategories();
  const movements = db.getAssetMovements();

  // Financial calculations
  const totalPurchaseCost = assets.reduce((sum, a) => sum + Number(a.purchase_cost), 0);
  const totalCurrentBookValue = assets.reduce((sum, a) => sum + Number(a.current_book_value), 0);
  const totalDepreciationExpense = totalPurchaseCost - totalCurrentBookValue;

  // Counts
  const deployedAssets = assets.filter(a => a.status === 'deployed').length;
  const maintenanceAssets = assets.filter(a => a.status === 'under_maintenance').length;
  const warehouseAssets = assets.filter(a => a.status === 'warehouse').length;

  const activeWorkOrders = workOrders.filter(w => w.status === 'in_progress' || w.status === 'assigned');
  const criticalWorkOrders = workOrders.filter(w => w.priority === 'critical' || w.priority === 'high');
  const pendingApprovals = workOrders.filter(w => w.status === 'completed');
  const lowStockParts = spareParts.filter(p => p.stock_qty <= p.minimum_threshold);

  // Chart data: Category breakdown
  const categoryChartData = categories.map(cat => {
    const count = assets.filter(a => a.category_id === cat.id).length;
    const value = assets.filter(a => a.category_id === cat.id).reduce((s, a) => s + Number(a.current_book_value), 0);
    return {
      name: cat.name.split('(')[0].trim(),
      count,
      value: Math.round(value / 1000000), // in Millions IDR
    };
  });

  // Chart data: Status distribution
  const statusChartData = [
    { name: 'Aktif Beroperasi', value: deployedAssets, color: '#10b981' },
    { name: 'Dalam Perawatan', value: maintenanceAssets, color: '#f43f5e' },
    { name: 'Stok Gudang', value: warehouseAssets, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Dashboard Kontrol Aset</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">Selamat datang, <strong className="text-white">{currentUser.name}</strong></span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Total Lifecycle & Maintenance Visibility
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Pemantauan terpusat depresiasi nilai buku, SLA Work Order, stok suku cadang, dan audit mutasi aset.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('analytics')}
            id="btn-dash-cockpit"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all animate-pulse"
          >
            <Activity className="w-4 h-4" />
            <span>Cockpit KPI Perawatan (ihwan1)</span>
          </button>

          {can.createWorkOrder && (
            <button
              onClick={onOpenCreateWO}
              id="btn-dash-create-wo"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Work Order</span>
            </button>
          )}

          {can.createAsset && (
            <button
              onClick={onOpenCreateAsset}
              id="btn-dash-create-asset"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>Tambah Aset</span>
            </button>
          )}

          <button
            onClick={onOpenQRScanner}
            id="btn-dash-scan-qr"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>Scan Tag</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Book Value */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Nilai Buku Aset (Total)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono">{formatRupiah(totalCurrentBookValue)}</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className="text-slate-400">Dari Perolehan:</span>
            <span className="font-mono text-slate-300 font-semibold">{formatRupiah(totalPurchaseCost)}</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400/90 flex items-center gap-1 font-medium">
            <TrendingDown className="w-3 h-3" />
            Terdepresiasi {Math.round((totalDepreciationExpense / (totalPurchaseCost || 1)) * 100)}%
          </div>
        </div>

        {/* Total Assets & Health */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Total Unit Aset</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{assets.length} <span className="text-xs text-slate-400 font-normal">Unit</span></div>
          <div className="flex items-center gap-3 mt-3 text-[11px]">
            <span className="text-emerald-400 font-medium">● {deployedAssets} Deployed</span>
            <span className="text-rose-400 font-medium">● {maintenanceAssets} Maintenance</span>
          </div>
        </div>

        {/* Active Work Orders & SLA */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Work Orders Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {activeWorkOrders.length} <span className="text-xs text-slate-400 font-normal">Tiket Berjalan</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px]">
            <span className="text-rose-400 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {criticalWorkOrders.length} Prioritas Tinggi
            </span>
            {pendingApprovals.length > 0 && (
              <span className="text-indigo-400 font-medium">
                {pendingApprovals.length} Approval
              </span>
            )}
          </div>
        </div>

        {/* Spare Parts Health */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Stok Suku Cadang</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/70 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {spareParts.length} <span className="text-xs text-slate-400 font-normal">SKU Master</span>
          </div>
          <div className="mt-3">
            {lowStockParts.length > 0 ? (
              <span className="text-rose-400 text-[11px] font-bold flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                {lowStockParts.length} SKU Dibawah Ambang Batas!
              </span>
            ) : (
              <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Semua stok aman
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Role-Specific Action Banner (Supervisor / Mechanic Notification) */}
      {currentUser.role === 'supervisor' && pendingApprovals.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-700/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-900 border border-indigo-700 flex items-center justify-center text-indigo-300 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Menunggu Persetujuan Supervisor ({pendingApprovals.length} Tiket)</h4>
              <p className="text-xs text-indigo-200/80">Mekanik telah menyelesaikan pekerjaan perbaikan dan membutuhkan verifikasi hasil inspeksi.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('workorders')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 shadow-lg"
          >
            Review Sekarang →
          </button>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Value Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Valuasi Nilai Buku Per Kategori Aset</h3>
              <p className="text-xs text-slate-400">Total nilai buku saat ini (dalam Juta Rupiah)</p>
            </div>
            <button 
              onClick={() => onNavigate('depreciation')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              Simulasi Depresiasi <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(val) => `Rp ${val}M`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }}
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')} Juta`, 'Nilai Buku']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Distribusi Status Aset</h3>
            <p className="text-xs text-slate-400 mb-4">Proporsi operasional vs perbaikan</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2 pt-3 border-t border-slate-800 text-xs">
            {statusChartData.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.name}</span>
                </div>
                <span className="font-mono font-bold">{s.value} Unit</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grids: Critical Work Orders & Low Stock Parts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical / High Work Order Queue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Work Order Mendesak (SLA Aktif)</h3>
            </div>
            <button 
              onClick={() => onNavigate('workorders')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              Lihat Semua ({workOrders.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {workOrders.slice(0, 3).map(wo => {
              const priorityBadge = getWorkOrderPriorityBadge(wo.priority);
              const statusBadge = getWorkOrderStatusBadge(wo.status);
              return (
                <div
                  key={wo.id}
                  onClick={() => onSelectWorkOrder(wo.id)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">{wo.wo_number}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${priorityBadge.bg}`}>
                        {priorityBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium truncate">{wo.issue_description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Mekanik: <strong className="text-slate-300">{wo.mechanic?.name || 'Belum ditugaskan'}</strong></span>
                      <span>•</span>
                      <span>SLA: {wo.sla_hours} Jam</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-1 rounded border shrink-0 font-medium ${statusBadge.bg}`}>
                    {statusBadge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Warehouse Alerts */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Peringatan Suku Cadang Gudang</h3>
            </div>
            <button 
              onClick={() => onNavigate('inventory')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              Kelola Gudang <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {spareParts.slice(0, 3).map(part => {
              const isLow = part.stock_qty <= part.minimum_threshold;
              return (
                <div
                  key={part.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{part.sku}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {part.rack_location || 'Rak Umum'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">{part.name}</p>
                    <div className="text-[11px] text-slate-400">
                      Harga Satuan: <strong className="text-slate-300 font-mono">{formatRupiah(part.unit_cost)}</strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-sm font-black font-mono ${isLow ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                      {part.stock_qty} <span className="text-xs font-normal text-slate-400">{part.unit}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Min: {part.minimum_threshold} {part.unit}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
