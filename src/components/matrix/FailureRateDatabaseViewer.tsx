import React, { useState, useMemo } from 'react';
import { 
  Database, Table, Network, Filter, Search, Download, 
  Plus, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, 
  Smartphone, Layers, RefreshCw, FileCode, ArrowRight, Eye, 
  Sparkles, SlidersHorizontal, Info, ShieldCheck, Cpu
} from 'lucide-react';
import { failureRateDb } from '../../services/failureRateDb';
import { 
  EquipmentBrand, EquipmentPlatform, EquipmentModel, 
  EquipmentBranch, EquipmentUnit, MonthlyBreakdownMetric 
} from '../../types/eams';

export const FailureRateDatabaseViewer: React.FC = () => {
  const [activeView, setActiveView] = useState<'pivot' | 'relational' | 'erd' | 'mobile_cards'>('pivot');
  const [relationalTab, setRelationalTab] = useState<'brands' | 'platforms' | 'models' | 'branches' | 'units' | 'metrics'>('brands');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>(undefined);
  const [selectedPlatformId, setSelectedPlatformId] = useState<number | undefined>(undefined);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);
  const [displayFormat, setDisplayFormat] = useState<'percent' | 'decimal'>('percent');
  
  // Expanded hierarchy in Pivot view
  const [expandedBrands, setExpandedBrands] = useState<Record<number, boolean>>({ 4: true, 5: true }); // DINGLI & Genie expanded by default
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<number, boolean>>({ 1: true });

  // Modals
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isAddMetricModalOpen, setIsAddMetricModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Forced refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(k => k + 1);

  // Fetch data
  const brands = useMemo(() => failureRateDb.getBrands(), [refreshKey]);
  const platforms = useMemo(() => failureRateDb.getPlatforms(), [refreshKey]);
  const models = useMemo(() => failureRateDb.getModels(), [refreshKey]);
  const branches = useMemo(() => failureRateDb.getBranches(), [refreshKey]);
  const units = useMemo(() => failureRateDb.getEquipmentUnits(), [refreshKey]);
  const metrics = useMemo(() => failureRateDb.getMonthlyMetrics(), [refreshKey]);

  // Pivot data calculation
  const pivotData = useMemo(() => {
    return failureRateDb.getPivotRows(selectedBrandId, selectedPlatformId, selectedBranchId);
  }, [selectedBrandId, selectedPlatformId, selectedBranchId, refreshKey]);

  // New Equipment Form State
  const [newUnitEqNumber, setNewUnitEqNumber] = useState('');
  const [newUnitSerial, setNewUnitSerial] = useState('');
  const [newUnitModelId, setNewUnitModelId] = useState<number>(1);
  const [newUnitStoreId, setNewUnitStoreId] = useState<number>(1);
  const [newUnitYear, setNewUnitYear] = useState<number>(2025);
  const [newUnitStatus, setNewUnitStatus] = useState<'operational' | 'breakdown' | 'in_maintenance'>('operational');

  // New Metric Form State
  const [newMetricUnitId, setNewMetricUnitId] = useState<number>(1);
  const [newMetricMonth, setNewMetricMonth] = useState<'Jan'|'Feb'|'Mar'|'Apr'|'Mei'|'Jun'|'Jul'|'Agu'>('Agu');
  const [newMetricBreakdownHours, setNewMetricBreakdownHours] = useState<number>(45);
  const [newMetricScheduledHours, setNewMetricScheduledHours] = useState<number>(70);
  const [newMetricPmCount, setNewMetricPmCount] = useState<number>(2);
  const [newMetricCmCount, setNewMetricCmCount] = useState<number>(3);

  // Handle Add Unit Submit
  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitEqNumber.trim() || !newUnitSerial.trim()) return;

    failureRateDb.createEquipmentUnit({
      eq_number: newUnitEqNumber.trim().toUpperCase(),
      serial_number: newUnitSerial.trim().toUpperCase(),
      model_id: Number(newUnitModelId),
      store_id: Number(newUnitStoreId),
      year_manufactured: Number(newUnitYear),
      status: newUnitStatus,
      total_operating_hours: 0,
    });

    setIsAddUnitModalOpen(false);
    setNewUnitEqNumber('');
    setNewUnitSerial('');
    triggerRefresh();
  };

  // Handle Add Metric Submit
  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    const bHours = Number(newMetricBreakdownHours);
    const sHours = Number(newMetricScheduledHours) || 70;
    const rate = sHours > 0 ? Number((bHours / sHours).toFixed(4)) : 0;

    failureRateDb.recordMonthlyBreakdown({
      equipment_id: Number(newMetricUnitId),
      period_year: 2026,
      period_month: newMetricMonth,
      breakdown_hours: bHours,
      total_scheduled_hours: sHours,
      pm_count: Number(newMetricPmCount),
      cm_count: Number(newMetricCmCount),
      breakdown_rate: rate,
      notes: `Input manual log operasional periode ${newMetricMonth} 2026`,
    });

    setIsAddMetricModalOpen(false);
    triggerRefresh();
  };

  // Toggle brand expand
  const toggleBrand = (brandId: number) => {
    setExpandedBrands(prev => ({ ...prev, [brandId]: !prev[brandId] }));
  };

  // Toggle platform expand
  const togglePlatform = (platformId: number) => {
    setExpandedPlatforms(prev => ({ ...prev, [platformId]: !prev[platformId] }));
  };

  // Format Helper
  const formatVal = (val: number | null) => {
    if (val === null || val === undefined) return '-';
    if (displayFormat === 'percent') {
      return `${Math.round(val * 100)}%`;
    }
    return val.toFixed(4);
  };

  // Cell Color Coding
  const getCellColor = (val: number | null) => {
    if (val === null || val === undefined) return 'text-slate-500';
    if (val >= 0.90) return 'text-rose-400 font-semibold bg-rose-950/30';
    if (val >= 0.70) return 'text-amber-400 font-medium bg-amber-950/20';
    if (val >= 0.40) return 'text-sky-300 bg-sky-950/20';
    return 'text-emerald-400 font-semibold bg-emerald-950/30';
  };

  // CSV Export for Pivot Matrix
  const exportPivotCSV = () => {
    const headers = ['Brand', 'Platform', 'Model', 'Store Own', 'Unit Type', 'Eq Number', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Total Keseluruhan'];
    const rows: string[][] = [];

    pivotData.brandRows.forEach(bRow => {
      rows.push([
        `${bRow.brand.name} Total`, '', '', '', '', '',
        bRow.monthlyValues['Jan'] ? String(bRow.monthlyValues['Jan']) : '',
        bRow.monthlyValues['Feb'] ? String(bRow.monthlyValues['Feb']) : '',
        bRow.monthlyValues['Mar'] ? String(bRow.monthlyValues['Mar']) : '',
        bRow.monthlyValues['Apr'] ? String(bRow.monthlyValues['Apr']) : '',
        bRow.monthlyValues['Mei'] ? String(bRow.monthlyValues['Mei']) : '',
        bRow.monthlyValues['Jun'] ? String(bRow.monthlyValues['Jun']) : '',
        bRow.monthlyValues['Jul'] ? String(bRow.monthlyValues['Jul']) : '',
        bRow.monthlyValues['Agu'] ? String(bRow.monthlyValues['Agu']) : '',
        bRow.overallAvg ? String(bRow.overallAvg) : ''
      ]);

      bRow.platformRows.forEach(pRow => {
        rows.push([
          bRow.brand.name, pRow.platform.name, '', '', pRow.platform.unit_type, '',
          pRow.monthlyValues['Jan'] ? String(pRow.monthlyValues['Jan']) : '',
          pRow.monthlyValues['Feb'] ? String(pRow.monthlyValues['Feb']) : '',
          pRow.monthlyValues['Mar'] ? String(pRow.monthlyValues['Mar']) : '',
          pRow.monthlyValues['Apr'] ? String(pRow.monthlyValues['Apr']) : '',
          pRow.monthlyValues['Mei'] ? String(pRow.monthlyValues['Mei']) : '',
          pRow.monthlyValues['Jun'] ? String(pRow.monthlyValues['Jun']) : '',
          pRow.monthlyValues['Jul'] ? String(pRow.monthlyValues['Jul']) : '',
          pRow.monthlyValues['Agu'] ? String(pRow.monthlyValues['Agu']) : '',
          pRow.overallAvg ? String(pRow.overallAvg) : ''
        ]);
      });
    });

    // Grand Total Row
    rows.push([
      'Total Keseluruhan', '', '', '', '', '',
      pivotData.grandTotal.monthlyValues['Jan'] ? String(pivotData.grandTotal.monthlyValues['Jan']) : '',
      pivotData.grandTotal.monthlyValues['Feb'] ? String(pivotData.grandTotal.monthlyValues['Feb']) : '',
      pivotData.grandTotal.monthlyValues['Mar'] ? String(pivotData.grandTotal.monthlyValues['Mar']) : '',
      pivotData.grandTotal.monthlyValues['Apr'] ? String(pivotData.grandTotal.monthlyValues['Apr']) : '',
      pivotData.grandTotal.monthlyValues['Mei'] ? String(pivotData.grandTotal.monthlyValues['Mei']) : '',
      pivotData.grandTotal.monthlyValues['Jun'] ? String(pivotData.grandTotal.monthlyValues['Jun']) : '',
      pivotData.grandTotal.monthlyValues['Jul'] ? String(pivotData.grandTotal.monthlyValues['Jul']) : '',
      pivotData.grandTotal.monthlyValues['Agu'] ? String(pivotData.grandTotal.monthlyValues['Agu']) : '',
      pivotData.grandTotal.overallAvg ? String(pivotData.grandTotal.overallAvg) : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Failure_Rate_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Top Header & Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Relational 3NF Database
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">Sum of Breakdown Rate vs Equipment Hierarchy</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Equipment Failure Rate & Breakdown Database
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Tabel basis data relasional berkecepatan tinggi tanpa redundansi data, menghubungkan <strong>Brand ➔ Platform ➔ Model ➔ Branch ➔ Unit Eq Number</strong> dengan log metrik breakdown bulanan.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddMetricModalOpen(true)}
            id="btn-add-breakdown-log"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Breakdown</span>
          </button>

          <button
            onClick={() => setIsAddUnitModalOpen(true)}
            id="btn-add-equipment-unit"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Unit Eq</span>
          </button>

          <button
            onClick={() => setIsSqlModalOpen(true)}
            id="btn-view-sql-schema"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            <FileCode className="w-4 h-4" />
            <span>SQL Schema</span>
          </button>

          <button
            onClick={exportPivotCSV}
            id="btn-export-csv"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 backdrop-blur">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveView('pivot')}
            id="tab-view-pivot"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeView === 'pivot' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>100% GSheet Pivot Matrix</span>
          </button>

          <button
            onClick={() => setActiveView('relational')}
            id="tab-view-relational"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeView === 'relational' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Tabel Relasional (3NF)</span>
          </button>

          <button
            onClick={() => setActiveView('erd')}
            id="tab-view-erd"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeView === 'erd' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>ERD & Relasi Schema</span>
          </button>

          <button
            onClick={() => setActiveView('mobile_cards')}
            id="tab-view-mobile-cards"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeView === 'mobile_cards' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Touch Cards</span>
          </button>
        </div>

        {/* Value Format Toggle & Reset */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setDisplayFormat('percent')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                displayFormat === 'percent' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Persen (%)
            </button>
            <button
              onClick={() => setDisplayFormat('decimal')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                displayFormat === 'decimal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Desimal (0.xx)
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedBrandId(undefined);
              setSelectedPlatformId(undefined);
              setSelectedBranchId(undefined);
              setSearchQuery('');
            }}
            title="Reset Filter"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS SLICER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        {/* Brand Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Filter Brand</label>
          <select
            value={selectedBrandId || ''}
            onChange={(e) => setSelectedBrandId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Semua Brand (9 Brand)</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.country_origin})</option>
            ))}
          </select>
        </div>

        {/* Platform Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Filter Platform / Kategori</label>
          <select
            value={selectedPlatformId || ''}
            onChange={(e) => setSelectedPlatformId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Semua Platform ({platforms.length})</option>
            {platforms.map(p => (
              <option key={p.id} value={p.id}>{p.name} [{p.unit_type}]</option>
            ))}
          </select>
        </div>

        {/* Store Own / Branch Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Filter Cabang (Store Own)</label>
          <select
            value={selectedBranchId || ''}
            onChange={(e) => setSelectedBranchId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Semua Cabang ({branches.length})</option>
            {branches.map(br => (
              <option key={br.id} value={br.id}>{br.store_name} ({br.region})</option>
            ))}
          </select>
        </div>

        {/* Keyword Search */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pencarian Cepat</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari Eq Number, Model, Serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: 100% GSHEET PIVOT MATRIX */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'pivot' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
          <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white">
                Pivot Matrix: Sum of Breakdown Rate per Period (Agu, Apr, Feb, Jan, Jul, Jun, Mar, Mei)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              *Klik tanda panah pada baris untuk drilldown hirarki model dan unit alat
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-950/90 text-slate-300 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 w-48 border-r border-slate-800/80 sticky left-0 bg-slate-950 z-20">Brand / Platform / Model</th>
                  <th className="py-3 px-2 w-32 border-r border-slate-800/80">Store Own</th>
                  <th className="py-3 px-2 w-28 border-r border-slate-800/80">Unit Type</th>
                  <th className="py-3 px-2 w-36 border-r border-slate-800/80">Eq Number</th>
                  <th className="py-3 px-2 text-center border-r border-slate-800/80">Jan</th>
                  <th className="py-3 px-2 text-center border-r border-slate-800/80">Feb</th>
                  <th className="py-3 px-2 text-center border-r border-slate-800/80">Mar</th>
                  <th className="py-3 px-2 text-center border-r border-slate-800/80">Apr</th>
                  <th className="py-3 px-2 text-center border-r border-slate-800/80">Mei</th>
                  <th className="py-3 px-2 text-center border-r border-slate-800/80">Jun</th>
                  <th className="py-3 px-2 text-center border-r border-slate-800/80">Jul</th>
                  <th className="py-3 px-2 text-center border-r border-slate-800/80">Agu</th>
                  <th className="py-3 px-3 text-right bg-slate-950 font-bold text-indigo-300">Total Keseluruhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {pivotData.brandRows.map((bRow) => {
                  const isExpanded = expandedBrands[bRow.brand.id];

                  return (
                    <React.Fragment key={`brand-${bRow.brand.id}`}>
                      {/* Brand Row (Summary) */}
                      <tr className="bg-slate-900/90 hover:bg-slate-800/70 transition-colors font-bold text-white border-b border-slate-800">
                        <td className="py-2.5 px-3 border-r border-slate-800 sticky left-0 bg-slate-900/95 z-10">
                          <button
                            onClick={() => toggleBrand(bRow.brand.id)}
                            className="flex items-center gap-2 text-left w-full text-indigo-300 hover:text-indigo-200"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                            <span>{bRow.brand.name} Total</span>
                          </button>
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-800 text-slate-500 text-[11px]">-</td>
                        <td className="py-2.5 px-2 border-r border-slate-800 text-slate-500 text-[11px]">-</td>
                        <td className="py-2.5 px-2 border-r border-slate-800 text-slate-500 text-[11px]">-</td>
                        <td className={`py-2.5 px-2 text-center border-r border-slate-800 ${getCellColor(bRow.monthlyValues['Jan'])}`}>{formatVal(bRow.monthlyValues['Jan'])}</td>
                        <td className={`py-2.5 px-2 text-center border-r border-slate-800 ${getCellColor(bRow.monthlyValues['Feb'])}`}>{formatVal(bRow.monthlyValues['Feb'])}</td>
                        <td className={`py-2.5 px-2 text-center border-r border-slate-800 ${getCellColor(bRow.monthlyValues['Mar'])}`}>{formatVal(bRow.monthlyValues['Mar'])}</td>
                        <td className={`py-2.5 px-2 text-center border-r border-slate-800 ${getCellColor(bRow.monthlyValues['Apr'])}`}>{formatVal(bRow.monthlyValues['Apr'])}</td>
                        <td className={`py-2.5 px-2 text-center border-r border-slate-800 ${getCellColor(bRow.monthlyValues['Mei'])}`}>{formatVal(bRow.monthlyValues['Mei'])}</td>
                        <td className={`py-2.5 px-2 text-center border-r border-slate-800 ${getCellColor(bRow.monthlyValues['Jun'])}`}>{formatVal(bRow.monthlyValues['Jun'])}</td>
                        <td className={`py-2.5 px-2 text-center border-r border-slate-800 ${getCellColor(bRow.monthlyValues['Jul'])}`}>{formatVal(bRow.monthlyValues['Jul'])}</td>
                        <td className={`py-2.5 px-2 text-center border-r border-slate-800 ${getCellColor(bRow.monthlyValues['Agu'])}`}>{formatVal(bRow.monthlyValues['Agu'])}</td>
                        <td className={`py-2.5 px-3 text-right font-black bg-indigo-950/40 text-indigo-300 ${getCellColor(bRow.overallAvg)}`}>
                          {formatVal(bRow.overallAvg)}
                        </td>
                      </tr>

                      {/* Expanded Platform Rows */}
                      {isExpanded && bRow.platformRows.map((pRow) => {
                        const isPlatExpanded = expandedPlatforms[pRow.platform.id];

                        return (
                          <React.Fragment key={`plat-${pRow.platform.id}`}>
                            {/* Platform Subtotal */}
                            <tr className="bg-slate-950/40 hover:bg-slate-800/50 transition-colors text-slate-200">
                              <td className="py-2 px-3 pl-7 border-r border-slate-800 sticky left-0 bg-slate-950 z-10 text-[11px]">
                                <button
                                  onClick={() => togglePlatform(pRow.platform.id)}
                                  className="flex items-center gap-1.5 text-left w-full text-slate-300 hover:text-white"
                                >
                                  {isPlatExpanded ? <ChevronDown className="w-3 h-3 text-cyan-400" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                                  <span>{pRow.platform.name} Total</span>
                                </button>
                              </td>
                              <td className="py-2 px-2 border-r border-slate-800 text-slate-500 text-[11px]">-</td>
                              <td className="py-2 px-2 border-r border-slate-800 text-cyan-300 text-[11px] font-sans font-semibold">{pRow.platform.unit_type}</td>
                              <td className="py-2 px-2 border-r border-slate-800 text-slate-500 text-[11px]">-</td>
                              <td className={`py-2 px-2 text-center border-r border-slate-800 ${getCellColor(pRow.monthlyValues['Jan'])}`}>{formatVal(pRow.monthlyValues['Jan'])}</td>
                              <td className={`py-2 px-2 text-center border-r border-slate-800 ${getCellColor(pRow.monthlyValues['Feb'])}`}>{formatVal(pRow.monthlyValues['Feb'])}</td>
                              <td className={`py-2 px-2 text-center border-r border-slate-800 ${getCellColor(pRow.monthlyValues['Mar'])}`}>{formatVal(pRow.monthlyValues['Mar'])}</td>
                              <td className={`py-2 px-2 text-center border-r border-slate-800 ${getCellColor(pRow.monthlyValues['Apr'])}`}>{formatVal(pRow.monthlyValues['Apr'])}</td>
                              <td className={`py-2 px-2 text-center border-r border-slate-800 ${getCellColor(pRow.monthlyValues['Mei'])}`}>{formatVal(pRow.monthlyValues['Mei'])}</td>
                              <td className={`py-2 px-2 text-center border-r border-slate-800 ${getCellColor(pRow.monthlyValues['Jun'])}`}>{formatVal(pRow.monthlyValues['Jun'])}</td>
                              <td className={`py-2 px-2 text-center border-r border-slate-800 ${getCellColor(pRow.monthlyValues['Jul'])}`}>{formatVal(pRow.monthlyValues['Jul'])}</td>
                              <td className={`py-2 px-2 text-center border-r border-slate-800 ${getCellColor(pRow.monthlyValues['Agu'])}`}>{formatVal(pRow.monthlyValues['Agu'])}</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-300 bg-slate-950/80">{formatVal(pRow.overallAvg)}</td>
                            </tr>

                            {/* Expanded Model & Equipment Rows */}
                            {isPlatExpanded && pRow.modelRows.map((mRow) => (
                              <React.Fragment key={`mod-${mRow.model.id}`}>
                                <tr className="bg-slate-950/80 hover:bg-slate-900 text-slate-400 text-[11px]">
                                  <td className="py-1.5 px-3 pl-11 border-r border-slate-800 sticky left-0 bg-slate-950 z-10 text-emerald-400 font-bold">
                                    • {mRow.model.model_name}
                                  </td>
                                  <td className="py-1.5 px-2 border-r border-slate-800 text-slate-400">
                                    {mRow.units[0]?.store?.store_name || 'Multi-site'}
                                  </td>
                                  <td className="py-1.5 px-2 border-r border-slate-800 text-slate-400 font-sans">{pRow.platform.unit_type}</td>
                                  <td className="py-1.5 px-2 border-r border-slate-800 text-amber-300 font-bold">
                                    {mRow.units.map(u => u.eq_number).join(', ') || 'EQ-ALL'}
                                  </td>
                                  <td className={`py-1.5 px-2 text-center border-r border-slate-800 ${getCellColor(mRow.monthlyValues['Jan'])}`}>{formatVal(mRow.monthlyValues['Jan'])}</td>
                                  <td className={`py-1.5 px-2 text-center border-r border-slate-800 ${getCellColor(mRow.monthlyValues['Feb'])}`}>{formatVal(mRow.monthlyValues['Feb'])}</td>
                                  <td className={`py-1.5 px-2 text-center border-r border-slate-800 ${getCellColor(mRow.monthlyValues['Mar'])}`}>{formatVal(mRow.monthlyValues['Mar'])}</td>
                                  <td className={`py-1.5 px-2 text-center border-r border-slate-800 ${getCellColor(mRow.monthlyValues['Apr'])}`}>{formatVal(mRow.monthlyValues['Apr'])}</td>
                                  <td className={`py-1.5 px-2 text-center border-r border-slate-800 ${getCellColor(mRow.monthlyValues['Mei'])}`}>{formatVal(mRow.monthlyValues['Mei'])}</td>
                                  <td className={`py-1.5 px-2 text-center border-r border-slate-800 ${getCellColor(mRow.monthlyValues['Jun'])}`}>{formatVal(mRow.monthlyValues['Jun'])}</td>
                                  <td className={`py-1.5 px-2 text-center border-r border-slate-800 ${getCellColor(mRow.monthlyValues['Jul'])}`}>{formatVal(mRow.monthlyValues['Jul'])}</td>
                                  <td className={`py-1.5 px-2 text-center border-r border-slate-800 ${getCellColor(mRow.monthlyValues['Agu'])}`}>{formatVal(mRow.monthlyValues['Agu'])}</td>
                                  <td className="py-1.5 px-3 text-right font-bold text-slate-300">{formatVal(mRow.overallAvg)}</td>
                                </tr>
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* Grand Total Row */}
                <tr className="bg-indigo-950 font-black text-white text-sm border-t-2 border-indigo-500">
                  <td className="py-3 px-3 border-r border-indigo-900 sticky left-0 bg-indigo-950 z-20">
                    Total Keseluruhan
                  </td>
                  <td className="py-3 px-2 border-r border-indigo-900">-</td>
                  <td className="py-3 px-2 border-r border-indigo-900">-</td>
                  <td className="py-3 px-2 border-r border-indigo-900">-</td>
                  <td className={`py-3 px-2 text-center border-r border-indigo-900 ${getCellColor(pivotData.grandTotal.monthlyValues['Jan'])}`}>{formatVal(pivotData.grandTotal.monthlyValues['Jan'])}</td>
                  <td className={`py-3 px-2 text-center border-r border-indigo-900 ${getCellColor(pivotData.grandTotal.monthlyValues['Feb'])}`}>{formatVal(pivotData.grandTotal.monthlyValues['Feb'])}</td>
                  <td className={`py-3 px-2 text-center border-r border-indigo-900 ${getCellColor(pivotData.grandTotal.monthlyValues['Mar'])}`}>{formatVal(pivotData.grandTotal.monthlyValues['Mar'])}</td>
                  <td className={`py-3 px-2 text-center border-r border-indigo-900 ${getCellColor(pivotData.grandTotal.monthlyValues['Apr'])}`}>{formatVal(pivotData.grandTotal.monthlyValues['Apr'])}</td>
                  <td className={`py-3 px-2 text-center border-r border-indigo-900 ${getCellColor(pivotData.grandTotal.monthlyValues['Mei'])}`}>{formatVal(pivotData.grandTotal.monthlyValues['Mei'])}</td>
                  <td className={`py-3 px-2 text-center border-r border-indigo-900 ${getCellColor(pivotData.grandTotal.monthlyValues['Jun'])}`}>{formatVal(pivotData.grandTotal.monthlyValues['Jun'])}</td>
                  <td className={`py-3 px-2 text-center border-r border-indigo-900 ${getCellColor(pivotData.grandTotal.monthlyValues['Jul'])}`}>{formatVal(pivotData.grandTotal.monthlyValues['Jul'])}</td>
                  <td className={`py-3 px-2 text-center border-r border-indigo-900 ${getCellColor(pivotData.grandTotal.monthlyValues['Agu'])}`}>{formatVal(pivotData.grandTotal.monthlyValues['Agu'])}</td>
                  <td className="py-3 px-3 text-right font-black text-amber-300 bg-indigo-900/90 text-sm">
                    {formatVal(pivotData.grandTotal.overallAvg)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: 3NF RELATIONAL TABLES EXPLORER */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'relational' && (
        <div className="space-y-4">
          {/* Relational Table Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setRelationalTab('brands')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                relationalTab === 'brands' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              1. equipment_brands ({brands.length})
            </button>
            <button
              onClick={() => setRelationalTab('platforms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                relationalTab === 'platforms' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              2. equipment_platforms ({platforms.length})
            </button>
            <button
              onClick={() => setRelationalTab('models')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                relationalTab === 'models' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              3. equipment_models ({models.length})
            </button>
            <button
              onClick={() => setRelationalTab('branches')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                relationalTab === 'branches' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              4. equipment_branches ({branches.length})
            </button>
            <button
              onClick={() => setRelationalTab('units')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                relationalTab === 'units' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              5. equipment_units ({units.length})
            </button>
            <button
              onClick={() => setRelationalTab('metrics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                relationalTab === 'metrics' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              6. monthly_breakdown_metrics ({metrics.length})
            </button>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            {relationalTab === 'brands' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PK (id)</th>
                    <th className="py-3 px-4">Brand Code</th>
                    <th className="py-3 px-4">Brand Name</th>
                    <th className="py-3 px-4">Country of Origin</th>
                    <th className="py-3 px-4">Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {brands.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-mono font-bold text-indigo-400">#{b.id}</td>
                      <td className="py-2.5 px-4 font-mono text-cyan-300">{b.code}</td>
                      <td className="py-2.5 px-4 font-bold text-white">{b.name}</td>
                      <td className="py-2.5 px-4 text-slate-300">{b.country_origin}</td>
                      <td className="py-2.5 px-4 text-slate-400">{b.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {relationalTab === 'platforms' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PK (id)</th>
                    <th className="py-3 px-4">FK (brand_id)</th>
                    <th className="py-3 px-4">Platform Name</th>
                    <th className="py-3 px-4">Unit Type</th>
                    <th className="py-3 px-4">Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {platforms.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-mono font-bold text-indigo-400">#{p.id}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                          {p.brand?.name} (ID: {p.brand_id})
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-white">{p.name}</td>
                      <td className="py-2.5 px-4 text-cyan-300 font-semibold">{p.unit_type}</td>
                      <td className="py-2.5 px-4 text-slate-400">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {relationalTab === 'models' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PK (id)</th>
                    <th className="py-3 px-4">FK (platform_id)</th>
                    <th className="py-3 px-4">Model Name</th>
                    <th className="py-3 px-4">Kapasitas / Jangkauan</th>
                    <th className="py-3 px-4">Power Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {models.map(m => (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-mono font-bold text-indigo-400">#{m.id}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                          {m.platform?.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-emerald-400">{m.model_name}</td>
                      <td className="py-2.5 px-4 text-slate-300">{m.rated_capacity}</td>
                      <td className="py-2.5 px-4 text-slate-400">{m.power_source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {relationalTab === 'branches' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PK (id)</th>
                    <th className="py-3 px-4">Store Code</th>
                    <th className="py-3 px-4">Store Name (Branch)</th>
                    <th className="py-3 px-4">Region</th>
                    <th className="py-3 px-4">Tipe Fasilitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {branches.map(br => (
                    <tr key={br.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-mono font-bold text-indigo-400">#{br.id}</td>
                      <td className="py-2.5 px-4 font-mono text-cyan-300">{br.store_code}</td>
                      <td className="py-2.5 px-4 font-bold text-white">{br.store_name}</td>
                      <td className="py-2.5 px-4 text-slate-300">{br.region}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          br.is_warehouse ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {br.is_warehouse ? 'Gudang Utama (Warehouse)' : 'Cabang Operasional'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {relationalTab === 'units' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PK (id)</th>
                    <th className="py-3 px-4">Eq Number (Unique)</th>
                    <th className="py-3 px-4">Serial Number</th>
                    <th className="py-3 px-4">FK Model</th>
                    <th className="py-3 px-4">FK Cabang (Store)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Jam Kerja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {units.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-mono font-bold text-indigo-400">#{u.id}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-amber-300">{u.eq_number}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-400">{u.serial_number}</td>
                      <td className="py-2.5 px-4 text-emerald-300 font-bold">{u.model?.model_name}</td>
                      <td className="py-2.5 px-4 text-slate-300">{u.store?.store_name}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          u.status === 'operational' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          u.status === 'breakdown' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-300">{u.total_operating_hours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {relationalTab === 'metrics' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PK (id)</th>
                    <th className="py-3 px-4">FK Unit (Eq Number)</th>
                    <th className="py-3 px-4">Periode</th>
                    <th className="py-3 px-4">Breakdown Hours</th>
                    <th className="py-3 px-4">PM vs CM</th>
                    <th className="py-3 px-4 text-right">Breakdown Rate (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {metrics.slice(0, 20).map(m => (
                    <tr key={m.id} className="hover:bg-slate-800/40 font-mono">
                      <td className="py-2 px-4 font-bold text-indigo-400">#{m.id}</td>
                      <td className="py-2 px-4 font-sans font-bold text-amber-300">
                        {m.equipment?.eq_number} ({m.equipment?.model?.model_name})
                      </td>
                      <td className="py-2 px-4 font-sans text-white">{m.period_month} {m.period_year}</td>
                      <td className="py-2 px-4 text-slate-300">{m.breakdown_hours} / {m.total_scheduled_hours} hrs</td>
                      <td className="py-2 px-4 text-slate-400 font-sans">PM: {m.pm_count} | CM: {m.cm_count}</td>
                      <td className={`py-2 px-4 text-right font-black ${getCellColor(m.breakdown_rate)}`}>
                        {formatVal(m.breakdown_rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 3: ERD SCHEMA & DATA DICTIONARY */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'erd' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/50 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">Struktur Relasi 3NF (Third Normal Form)</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Struktur data dinormalisasi penuh: Tidak ada duplikasi teks nama brand atau platform pada record harian. Seluruh metrik bulanan terikat secara integritas referensial (Foreign Key) ke Unit Identitas Alat (`equipment_id`).
              </p>
            </div>
          </div>

          {/* Visual ERD Graph Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Table 1: equipment_brands */}
            <div className="rounded-2xl border border-indigo-700/60 bg-slate-900 overflow-hidden shadow-lg">
              <div className="bg-indigo-900/60 px-4 py-2.5 border-b border-indigo-700/50 flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-indigo-200">equipment_brands</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold">Master (PK)</span>
              </div>
              <div className="p-3.5 space-y-1.5 font-mono text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800 text-amber-300 font-bold">
                  <span>🔑 id</span>
                  <span className="text-slate-500">SERIAL (PK)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>code</span>
                  <span className="text-slate-500">VARCHAR(32)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>name</span>
                  <span className="text-slate-500">VARCHAR(100)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>country_origin</span>
                  <span className="text-slate-500">VARCHAR(64)</span>
                </div>
              </div>
            </div>

            {/* Table 2: equipment_platforms */}
            <div className="rounded-2xl border border-cyan-700/60 bg-slate-900 overflow-hidden shadow-lg">
              <div className="bg-cyan-900/60 px-4 py-2.5 border-b border-cyan-700/50 flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-cyan-200">equipment_platforms</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold">1:N with Brands</span>
              </div>
              <div className="p-3.5 space-y-1.5 font-mono text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800 text-amber-300 font-bold">
                  <span>🔑 id</span>
                  <span className="text-slate-500">SERIAL (PK)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-indigo-400 font-bold">
                  <span>🔗 brand_id</span>
                  <span className="text-slate-500">FK ➔ brands.id</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>name</span>
                  <span className="text-slate-500">VARCHAR(150)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>unit_type</span>
                  <span className="text-slate-500">VARCHAR(64)</span>
                </div>
              </div>
            </div>

            {/* Table 3: equipment_models */}
            <div className="rounded-2xl border border-emerald-700/60 bg-slate-900 overflow-hidden shadow-lg">
              <div className="bg-emerald-900/60 px-4 py-2.5 border-b border-emerald-700/50 flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-emerald-200">equipment_models</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold">1:N with Platform</span>
              </div>
              <div className="p-3.5 space-y-1.5 font-mono text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800 text-amber-300 font-bold">
                  <span>🔑 id</span>
                  <span className="text-slate-500">SERIAL (PK)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-cyan-400 font-bold">
                  <span>🔗 platform_id</span>
                  <span className="text-slate-500">FK ➔ platforms.id</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>model_name</span>
                  <span className="text-slate-500">VARCHAR(100)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>rated_capacity</span>
                  <span className="text-slate-500">VARCHAR(100)</span>
                </div>
              </div>
            </div>

            {/* Table 4: equipment_branches */}
            <div className="rounded-2xl border border-purple-700/60 bg-slate-900 overflow-hidden shadow-lg">
              <div className="bg-purple-900/60 px-4 py-2.5 border-b border-purple-700/50 flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-purple-200">equipment_branches</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-semibold">Master Sites</span>
              </div>
              <div className="p-3.5 space-y-1.5 font-mono text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800 text-amber-300 font-bold">
                  <span>🔑 id</span>
                  <span className="text-slate-500">SERIAL (PK)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>store_code</span>
                  <span className="text-slate-500">VARCHAR(32)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>store_name</span>
                  <span className="text-slate-500">VARCHAR(100)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>is_warehouse</span>
                  <span className="text-slate-500">BOOLEAN</span>
                </div>
              </div>
            </div>

            {/* Table 5: equipment_units */}
            <div className="rounded-2xl border border-amber-700/60 bg-slate-900 overflow-hidden shadow-lg">
              <div className="bg-amber-900/60 px-4 py-2.5 border-b border-amber-700/50 flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-amber-200">equipment_units</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-semibold">Physical Eq Units</span>
              </div>
              <div className="p-3.5 space-y-1.5 font-mono text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800 text-amber-300 font-bold">
                  <span>🔑 id</span>
                  <span className="text-slate-500">SERIAL (PK)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-amber-300">
                  <span>eq_number</span>
                  <span className="text-slate-500">VARCHAR(64) UNIQUE</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-emerald-400 font-bold">
                  <span>🔗 model_id</span>
                  <span className="text-slate-500">FK ➔ models.id</span>
                </div>
                <div className="flex justify-between py-1 text-purple-400 font-bold">
                  <span>🔗 store_id</span>
                  <span className="text-slate-500">FK ➔ branches.id</span>
                </div>
              </div>
            </div>

            {/* Table 6: monthly_breakdown_metrics */}
            <div className="rounded-2xl border border-rose-700/60 bg-slate-900 overflow-hidden shadow-lg">
              <div className="bg-rose-900/60 px-4 py-2.5 border-b border-rose-700/50 flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-rose-200">monthly_breakdown_metrics</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-semibold">Time-Series Metric</span>
              </div>
              <div className="p-3.5 space-y-1.5 font-mono text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800 text-amber-300 font-bold">
                  <span>🔑 id</span>
                  <span className="text-slate-500">SERIAL (PK)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-amber-400 font-bold">
                  <span>🔗 equipment_id</span>
                  <span className="text-slate-500">FK ➔ units.id</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>period_month</span>
                  <span className="text-slate-500">VARCHAR(16)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>breakdown_rate</span>
                  <span className="text-slate-500">NUMERIC(6,4)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 4: SMARTPHONE TOUCH CARDS */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'mobile_cards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {units.map((unit) => {
              const unitMetrics = metrics.filter(m => m.equipment_id === unit.id);
              const avgRate = unitMetrics.length > 0 
                ? unitMetrics.reduce((a, c) => a + c.breakdown_rate, 0) / unitMetrics.length 
                : 0;

              return (
                <div key={unit.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                        {unit.model?.platform?.brand?.name}
                      </span>
                      <h4 className="text-base font-extrabold text-white mt-1">{unit.eq_number}</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${getCellColor(avgRate)}`}>
                      {formatVal(avgRate)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Model:</span>
                      <strong className="text-white">{unit.model?.model_name}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Platform:</span>
                      <span className="text-slate-400">{unit.model?.platform?.name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Lokasi Store:</span>
                      <strong className="text-cyan-300">{unit.store?.store_name}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Serial No:</span>
                      <span className="font-mono text-slate-400">{unit.serial_number}</span>
                    </p>
                  </div>

                  {/* Monthly Timeline Mini Pills */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu'].map((m) => {
                      const rec = unitMetrics.find(r => r.period_month === m);
                      const rate = rec ? rec.breakdown_rate : null;
                      return (
                        <div key={m} className="flex-1 min-w-[32px] text-center p-1 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">{m}</span>
                          <span className={`text-[10px] font-bold block ${getCellColor(rate)}`}>
                            {rate !== null ? `${Math.round(rate * 100)}%` : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD EQUIPMENT UNIT (FK RELATION) */}
      {/* ------------------------------------------------------------- */}
      {isAddUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Tambah Unit Alat Baru (Relasi FK)
              </h3>
              <button 
                onClick={() => setIsAddUnitModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Equipment Number (Unique PK/Identifier)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: EQ-DNG-BT26-03"
                  value={newUnitEqNumber}
                  onChange={(e) => setNewUnitEqNumber(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Serial Number</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DL-2025-0044"
                  value={newUnitSerial}
                  onChange={(e) => setNewUnitSerial(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">FK Model</label>
                  <select
                    value={newUnitModelId}
                    onChange={(e) => setNewUnitModelId(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.model_name} ({m.platform?.brand?.name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">FK Cabang (Store Own)</label>
                  <select
                    value={newUnitStoreId}
                    onChange={(e) => setNewUnitStoreId(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {branches.map(br => (
                      <option key={br.id} value={br.id}>{br.store_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tahun Pembuatan</label>
                  <input
                    type="number"
                    value={newUnitYear}
                    onChange={(e) => setNewUnitYear(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Awal</label>
                  <select
                    value={newUnitStatus}
                    onChange={(e) => setNewUnitStatus(e.target.value as any)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="operational">Operational</option>
                    <option value="in_maintenance">In Maintenance</option>
                    <option value="breakdown">Breakdown</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUnitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30"
                >
                  Simpan Unit Alat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD MONTHLY BREAKDOWN METRIC */}
      {/* ------------------------------------------------------------- */}
      {isAddMetricModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Catat Log Breakdown & Failure Rate
              </h3>
              <button 
                onClick={() => setIsAddMetricModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Unit Alat</label>
                <select
                  value={newMetricUnitId}
                  onChange={(e) => setNewMetricUnitId(Number(e.target.value))}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.eq_number} - {u.model?.model_name} ({u.store?.store_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bulan Periode</label>
                  <select
                    value={newMetricMonth}
                    onChange={(e) => setNewMetricMonth(e.target.value as any)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu'].map(m => (
                      <option key={m} value={m}>{m} 2026</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Breakdown Hours (Jam)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newMetricBreakdownHours}
                    onChange={(e) => setNewMetricBreakdownHours(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jadwal Operasi</label>
                  <input
                    type="number"
                    value={newMetricScheduledHours}
                    onChange={(e) => setNewMetricScheduledHours(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tiket PM</label>
                  <input
                    type="number"
                    value={newMetricPmCount}
                    onChange={(e) => setNewMetricPmCount(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tiket CM</label>
                  <input
                    type="number"
                    value={newMetricCmCount}
                    onChange={(e) => setNewMetricCmCount(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400">Estimasi Breakdown Rate Terhitung: </span>
                <strong className="text-indigo-300 font-mono">
                  {newMetricScheduledHours > 0 ? `${Math.round((newMetricBreakdownHours / newMetricScheduledHours) * 100)}% (${(newMetricBreakdownHours / newMetricScheduledHours).toFixed(4)})` : '0%'}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMetricModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
                >
                  Simpan & Update Matrix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SQL SCHEMA DDL VIEWER */}
      {/* ------------------------------------------------------------- */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                SQL DDL Relational Schema (PostgreSQL / MySQL / Supabase)
              </h3>
              <button 
                onClick={() => setIsSqlModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-y-auto max-h-96">
                {failureRateDb.generateSQLSchema()}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(failureRateDb.generateSQLSchema());
                  setSqlCopied(true);
                  setTimeout(() => setSqlCopied(false), 2000);
                }}
                className="absolute right-3 top-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
              >
                {sqlCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <FileCode className="w-3.5 h-3.5" />}
                <span>{sqlCopied ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
