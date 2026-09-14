import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Calculator, DollarSign, RefreshCw, Calendar, 
  TrendingDown, FileSpreadsheet, CheckCircle2, ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { db } from '../../services/db';
import { AssetDepreciationService } from '../../services/depreciation';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { DepreciationMethod } from '../../types/eams';

export const DepreciationCalculator: React.FC = () => {
  const { currentUser, can } = useAuth();
  const assets = db.getAssets();
  const categories = db.getCategories();

  const [selectedAssetId, setSelectedAssetId] = useState<number | 'custom'>(assets[0]?.id || 'custom');
  
  // Custom simulator params
  const [customCost, setCustomCost] = useState<number>(1500000000);
  const [customResidual, setCustomResidual] = useState<number>(200000000);
  const [customYears, setCustomYears] = useState<number>(8);
  const [customMethod, setCustomMethod] = useState<DepreciationMethod>('straight_line');
  const [customPurchaseDate, setCustomPurchaseDate] = useState<string>('2023-01-01');

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Target calculation model
  let targetCost = customCost;
  let targetResidual = customResidual;
  let targetYears = customYears;
  let targetMethod: DepreciationMethod = customMethod;
  let targetPurchaseDate = customPurchaseDate;
  let assetName = 'Simulasi Aset Kustom';

  if (selectedAssetId !== 'custom') {
    const found = assets.find(a => a.id === selectedAssetId);
    if (found) {
      targetCost = found.purchase_cost;
      targetResidual = found.residual_value;
      targetYears = found.category?.useful_life_years || 5;
      targetMethod = found.category?.depreciation_method || 'straight_line';
      targetPurchaseDate = found.purchase_date;
      assetName = `[${found.asset_code}] ${found.name}`;
    }
  }

  const currentCalc = AssetDepreciationService.calculateMonthlyDepreciation(
    { purchase_cost: targetCost, residual_value: targetResidual, purchase_date: targetPurchaseDate },
    { useful_life_years: targetYears, depreciation_method: targetMethod },
    new Date()
  );

  const fullSchedule = AssetDepreciationService.generateAmortizationSchedule(
    { purchase_cost: targetCost, residual_value: targetResidual, purchase_date: targetPurchaseDate },
    { useful_life_years: targetYears, depreciation_method: targetMethod }
  );

  // Sample data for chart (every 6 months or all months if short)
  const chartData = fullSchedule.filter((_, idx) => idx % Math.max(1, Math.floor(fullSchedule.length / 24)) === 0 || idx === fullSchedule.length - 1).map(item => ({
    periode: `M+${item.monthIndex}`,
    date: item.date,
    nilaiBuku: Math.round(item.endingBookValue / 1000000), // in Millions
    akumulasi: Math.round(item.accumulatedDepreciation / 1000000),
    bebanBulan: Math.round(item.depreciationExpense / 1000), // in Thousands
  }));

  const handleRecalculateAll = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      db.recalculateAllDepreciations();
      setIsRecalculating(false);
      setSuccessNotice('Seluruh nilai buku master aset telah diperbarui secara serentak berdasarkan tanggal hari ini.');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }, 500);
  };

  const exportScheduleCSV = () => {
    const headers = ['Bulan Ke', 'Tanggal Periode', 'Nilai Buku Awal (IDR)', 'Beban Depresiasi (IDR)', 'Akumulasi Depresiasi (IDR)', 'Nilai Buku Akhir (IDR)'];
    const rows = fullSchedule.map(s => [
      s.monthIndex,
      s.date,
      s.beginningValue,
      s.depreciationExpense,
      s.accumulatedDepreciation,
      s.endingBookValue,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `depresiasi_amortisasi_${targetMethod}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            Mesin Kalkulasi & Depresiasi Finansial Aset
          </h2>
          <p className="text-xs text-slate-400">
            Kalkulasi otomatis nilai buku menggunakan rumus Garis Lurus (Straight Line) dan Saldo Menurun (Declining Balance).
          </p>
        </div>

        {can.calculateDepreciation && (
          <button
            onClick={handleRecalculateAll}
            disabled={isRecalculating}
            id="btn-recalculate-all-depr"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Menghitung...' : 'Sinkronisasi Nilai Buku Seluruh Aset'}</span>
          </button>
        )}
      </div>

      {successNotice && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Simulator Control & Metric Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector & Inputs */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Parameter Simulasi Aset</h3>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Pilih Target Aset</label>
            <select
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-medium"
            >
              <option value="custom">-- Simulasi Aset Kustom (Bebas) --</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  [{a.asset_code}] {a.name}
                </option>
              ))}
            </select>
          </div>

          {selectedAssetId === 'custom' && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-slate-400">Harga Perolehan (IDR)</label>
                <input
                  type="number"
                  min="1000000"
                  step="1000000"
                  value={customCost}
                  onChange={e => setCustomCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Nilai Residu (IDR)</label>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  value={customResidual}
                  onChange={e => setCustomResidual(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400">Masa Manfaat (Tahun)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={customYears}
                    onChange={e => setCustomYears(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Tanggal Perolehan</label>
                  <input
                    type="date"
                    value={customPurchaseDate}
                    onChange={e => setCustomPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Metode Depresiasi</label>
                <select
                  value={customMethod}
                  onChange={e => setCustomMethod(e.target.value as DepreciationMethod)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                >
                  <option value="straight_line">Garis Lurus (Straight Line)</option>
                  <option value="declining_balance">Saldo Menurun (Declining Balance)</option>
                </select>
              </div>
            </div>
          )}

          {/* Formula Reference */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">Rumus Sesuai PRD Section 5.2:</div>
            <div>• Straight Line: <code>(Cost - Residual) / (UsefulLifeYears * 12)</code></div>
            <div>• Declining Balance: <code>(2 / UsefulLifeYears) / 12</code></div>
          </div>
        </div>

        {/* Live Calculation Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Hasil Kalkulasi Finansial</span>
                <h4 className="text-base font-bold text-white mt-0.5">{assetName}</h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono uppercase font-semibold">
                Metode: {targetMethod.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-xs mb-1">Nilai Buku Saat Ini (As of Today)</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">{formatRupiah(currentCalc.currentBookValue)}</div>
                <div className="text-[10px] text-slate-500 mt-1">Telah berjalan {currentCalc.monthsElapsed} bulan</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-xs mb-1">Akumulasi Depresiasi</div>
                <div className="text-xl font-bold text-rose-400 font-mono">{formatRupiah(currentCalc.accumulatedDepreciation)}</div>
                <div className="text-[10px] text-slate-500 mt-1">{Math.round((currentCalc.accumulatedDepreciation / (targetCost || 1)) * 100)}% dari nilai perolehan</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-xs mb-1">Beban Depresiasi / Bulan</div>
                <div className="text-xl font-bold text-amber-400 font-mono">{formatRupiah(currentCalc.monthlyRate)}</div>
                <div className="text-[10px] text-slate-500 mt-1">Masa total: {targetYears * 12} bulan</div>
              </div>
            </div>
          </div>

          {/* Area Chart Projection */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">Grafik Kurva Penurunan Nilai Buku (Juta IDR)</h4>
                <p className="text-xs text-slate-400">Proyeksi nilai sisa hingga akhir masa manfaat ekonomis ({targetYears} tahun)</p>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNilaiBuku" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAkumulasi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="periode" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `Rp ${val}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any, name: string) => [
                      `Rp ${Number(val).toLocaleString('id-ID')} Juta`,
                      name === 'nilaiBuku' ? 'Nilai Buku Akhir' : 'Akumulasi Depresiasi'
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="nilaiBuku" name="Nilai Buku (Juta IDR)" stroke="#10b981" fillOpacity={1} fill="url(#colorNilaiBuku)" />
                  <Area type="monotone" dataKey="akumulasi" name="Akumulasi Depresiasi (Juta IDR)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAkumulasi)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Amortization Schedule Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white">Tabel Lengkap Jadwal Amortisasi Depresiasi Bulanan</h4>
            <p className="text-xs text-slate-400">Daftar {fullSchedule.length} periode pencatatan finansial</p>
          </div>

          <button
            onClick={exportScheduleCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Amortisasi CSV</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold sticky top-0">
              <tr>
                <th className="p-3">Periode</th>
                <th className="p-3">Tanggal Periode</th>
                <th className="p-3">Nilai Buku Awal</th>
                <th className="p-3">Beban Depresiasi</th>
                <th className="p-3">Akumulasi Depresiasi</th>
                <th className="p-3">Nilai Buku Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {fullSchedule.map(item => (
                <tr key={item.monthIndex} className="hover:bg-slate-800/40">
                  <td className="p-3 text-blue-400 font-bold">Bulan ke-{item.monthIndex}</td>
                  <td className="p-3 text-slate-400">{item.date}</td>
                  <td className="p-3">{formatRupiah(item.beginningValue)}</td>
                  <td className="p-3 text-rose-400">-{formatRupiah(item.depreciationExpense)}</td>
                  <td className="p-3 text-amber-400">{formatRupiah(item.accumulatedDepreciation)}</td>
                  <td className="p-3 text-emerald-400 font-bold">{formatRupiah(item.endingBookValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
