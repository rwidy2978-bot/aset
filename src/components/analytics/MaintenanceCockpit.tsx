import React, { useState, useMemo } from 'react';
import { 
  Filter, RotateCcw, FileSpreadsheet, ExternalLink, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info,
  ChevronDown, ArrowRight, Download, BarChart2, Calendar, MapPin,
  Clock, ShieldAlert, Cpu, Award, Zap, Layers, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, 
  CartesianGrid, ReferenceLine, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { db } from '../../services/db';

interface MaintenanceCockpitProps {
  onSelectWorkOrder?: (id: number) => void;
  onSelectAsset?: (id: number) => void;
  onNavigate?: (tab: string) => void;
}

export const MaintenanceCockpit: React.FC<MaintenanceCockpitProps> = ({
  onSelectWorkOrder,
  onSelectAsset,
  onNavigate,
}) => {
  // Slicers / Filters State
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['Jul', 'Aug']);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [locationCategory, setLocationCategory] = useState<'all' | 'customer' | 'warehouse'>('all');
  const [selectedWOStatus, setSelectedWOStatus] = useState<string | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([25, 26, 27, 28, 29, 30, 31]);

  // Dropdown periods inside cards
  const [availabilityMonth, setAvailabilityMonth] = useState<string>('Jan');
  const [reliabilityMonth, setReliabilityMonth] = useState<string>('Jan');

  // Modals state
  const [activeModal, setActiveModal] = useState<'mttr' | 'failure_rate' | 'pm_compliance' | 'cm_compliance' | null>(null);

  // Month list
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Store / Branches list
  const branches = [
    { id: 'Batam_AWP', label: 'Batam_AWP' },
    { id: 'Jakarta_Electricity', label: 'Jakarta_Electricity' },
    { id: 'Semarang_AWP', label: 'Semarang_AWP' },
    { id: 'Surabaya_AWP', label: 'Surabaya_AWP' },
    { id: 'West Jakarta_AWP', label: 'West Jakarta_AWP' },
    { id: 'North Jakarta_AWP', label: 'North Jakarta_AWP' },
    { id: 'NA', label: '#N/A' },
  ];

  // Weeks list (e.g. Weeks 19 - 33)
  const weeks = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];

  // WO Statuses
  const woStatuses = [
    { id: 'completed', label: 'Completed' },
    { id: 'completion_reported', label: 'Completion reported' },
    { id: 'to_be_dispatched', label: 'To be dispatched' },
    { id: 'voided', label: 'Voided' },
  ];

  // Handlers for Slicers
  const toggleMonth = (m: string) => {
    if (selectedMonths.includes(m)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter(x => x !== m));
      }
    } else {
      setSelectedMonths([...selectedMonths, m]);
    }
  };

  const toggleWeek = (w: number) => {
    if (selectedWeeks.includes(w)) {
      if (selectedWeeks.length > 1) {
        setSelectedWeeks(selectedWeeks.filter(x => x !== w));
      }
    } else {
      setSelectedWeeks([...selectedWeeks, w]);
    }
  };

  const resetAllFilters = () => {
    setSelectedMonths(['Jul', 'Aug']);
    setSelectedBranch(null);
    setLocationCategory('all');
    setSelectedWOStatus(null);
    setSelectedWeeks([25, 26, 27, 28, 29, 30, 31]);
  };

  // Base Data Calculations based on active slicers
  const branchMultiplier = selectedBranch ? 0.35 : 1.0;
  const statusMultiplier = selectedWOStatus ? 0.6 : 1.0;
  const filterFactor = branchMultiplier * statusMultiplier;

  // 1. MTTR Daily Trend Data
  const mttrData = useMemo(() => [
    { day: '25', month: 'Jul', hours: 8 },
    { day: '26', month: 'Jul', hours: 34 },
    { day: '27', month: 'Jul', hours: 19 },
    { day: '28', month: 'Jul', hours: 20 },
    { day: '29', month: 'Jul', hours: 28 },
    { day: '30', month: 'Aug', hours: 3 },
    { day: '31', month: 'Aug', hours: 2 },
  ], []);

  // 2. Failure Rate Trend Data
  const failureTrendData = useMemo(() => [
    { month: 'Jul', rate: 89 },
    { month: 'Aug', rate: 94 },
  ], []);

  // MTTR Aggregates
  const breakdownHours = Math.round(6546 * filterFactor);
  const cmWoAmount = Math.round(399 * filterFactor);
  const mttrValue = (16.4 * (selectedBranch ? 0.9 : 1)).toFixed(1);

  // Failure Rate Aggregates
  const totalWoCM = Math.round(926 * filterFactor);
  const totalWoCreated = Math.round(1016 * filterFactor);
  const failureRatePercent = totalWoCreated > 0 ? Math.round((totalWoCM / totalWoCreated) * 100) : 91;

  // Repair Maintenance Percentage (PM vs CM)
  const pmTickets = Math.round(90 * filterFactor);
  const pmPortion = totalWoCreated > 0 ? ((pmTickets / totalWoCreated) * 100).toFixed(1) : '8.9';
  const cmPortion = (100 - parseFloat(pmPortion)).toFixed(0);

  // PM Compliance
  const pmWoCreated = Math.round(90 * filterFactor);
  const pmCompleted = Math.round(71 * filterFactor);
  const pmCompliance = pmWoCreated > 0 ? ((pmCompleted / pmWoCreated) * 100).toFixed(1) : '78.9';
  const pmOutstanding = pmWoCreated - pmCompleted;

  // CM Compliance
  const cmWoCreated = Math.round(926 * filterFactor);
  const cmCompleted = Math.round(838 * filterFactor);
  const cmCompliance = cmWoCreated > 0 ? Math.round((cmCompleted / cmWoCreated) * 100) : 90;
  const cmOutstanding = cmWoCreated - cmCompleted;

  // Warehouse Breakdown Metrics
  const warehouseStats = {
    westJkt: { units: 3, percent: '1%', status: 'Excellent', color: '#0ea5e9' },
    semarang: { units: 7, percent: '5%', status: 'Excellent', color: '#0ea5e9' },
    surabaya: { units: 0, percent: '0%', status: 'Excellent', color: '#0ea5e9' },
    batam: { units: 3, percent: '4%', status: 'Excellent', color: '#0ea5e9' },
    totalBD: Math.round(13 * (selectedBranch ? 0.4 : 1)),
    inWarehouse: Math.round(544 * (selectedBranch ? 0.3 : 1)),
    totalPercent: '2.4%',
  };

  // MTBF
  const awpMTBF = '228.6';
  const forkliftMTBF = '#REF!';

  // Availability Factor per Branch
  const availabilityBranchData = [
    { name: 'West Jkt', value: '99.7%', status: 'EXCELLENT' },
    { name: 'North Jkt', value: '99.7%', status: 'EXCELLENT' },
    { name: 'Semarang', value: '99.7%', status: 'EXCELLENT' },
    { name: 'Surabaya', value: '98.1%', status: 'EXCELLENT' },
    { name: 'Batam', value: '100.0%', status: 'EXCELLENT' },
    { name: 'Electricity', value: '98.2%', status: 'EXCELLENT' },
  ];

  // Reliability Factor per Branch
  const reliabilityBranchData = [
    { name: 'West Jkt', value: '100.0%', status: 'EXCELLENT', isBad: false },
    { name: 'North Jkt', value: '98.6%', status: 'EXCELLENT', isBad: false },
    { name: 'Semarang', value: '78.6%', status: 'BAD', isBad: true },
    { name: 'Surabaya', value: '80.1%', status: 'GOOD', isBad: false },
    { name: 'Batam', value: '100.0%', status: 'EXCELLENT', isBad: false },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-4 max-w-full font-sans text-slate-800 antialiased selection:bg-sky-500 selection:text-white pb-12">
      {/* ========================================================================= */}
      {/* LEFT SLICERS / FILTERS SIDEBAR (Exact Replica of PowerBI Style Filter Deck) */}
      {/* ========================================================================= */}
      <aside className="w-full xl:w-[230px] shrink-0 space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Reset / Global Filter Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            <span>Slicers Filter</span>
          </div>
          <button 
            onClick={resetAllFilters}
            title="Reset All Slicers"
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-sky-600 hover:bg-sky-50 px-2 py-0.5 rounded transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* 1. Period (Month) Slicer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Period</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Filter className="w-3 h-3" />
              <button onClick={() => setSelectedMonths(['Jul', 'Aug'])} className="hover:text-red-500">×</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {months.map(m => {
              const isActive = selectedMonths.includes(m);
              return (
                <button
                  key={m}
                  onClick={() => toggleMonth(m)}
                  className={`py-1 text-center text-xs font-semibold rounded border transition-all ${
                    isActive 
                      ? 'bg-slate-700 text-white border-slate-700 shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Customer / In Warehouse Slicer */}
        <div className="space-y-1 pt-1">
          <button
            onClick={() => setLocationCategory(locationCategory === 'customer' ? 'all' : 'customer')}
            className={`w-full py-1 px-3 text-left text-xs font-semibold rounded border transition-all ${
              locationCategory === 'customer'
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setLocationCategory(locationCategory === 'warehouse' ? 'all' : 'warehouse')}
            className={`w-full py-1 px-3 text-left text-xs font-semibold rounded border transition-all ${
              locationCategory === 'warehouse'
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            in warehouse
          </button>
        </div>

        {/* 3. Work Order Status Slicer */}
        <div className="space-y-1 pt-1">
          {woStatuses.map(status => {
            const isActive = selectedWOStatus === status.id;
            return (
              <button
                key={status.id}
                onClick={() => setSelectedWOStatus(isActive ? null : status.id)}
                className={`w-full py-1 px-2.5 text-left text-[11px] font-semibold rounded border truncate transition-all ${
                  isActive
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {status.label}
              </button>
            );
          })}
        </div>

        {/* 4. Store Own (Branch / Division Slicer) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Store Own</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Filter className="w-3 h-3" />
              <button onClick={() => setSelectedBranch(null)} className="hover:text-red-500">×</button>
            </div>
          </div>
          <div className="space-y-1 max-h-[160px] overflow-y-auto pr-0.5">
            {branches.map(b => {
              const isActive = selectedBranch === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(isActive ? null : b.id)}
                  className={`w-full py-1 px-2 text-left text-[11px] font-semibold rounded border truncate transition-all ${
                    isActive
                      ? 'bg-slate-700 text-white border-slate-700 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Week Slicer */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Week</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Filter className="w-3 h-3" />
              <button onClick={() => setSelectedWeeks([25, 26, 27, 28, 29, 30, 31])} className="hover:text-red-500">×</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {weeks.map(w => {
              const isActive = selectedWeeks.includes(w);
              return (
                <button
                  key={w}
                  onClick={() => toggleWeek(w)}
                  className={`py-1 text-center text-xs font-semibold rounded border transition-all ${
                    isActive
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Summary Note */}
        <div className="p-2 bg-sky-50 rounded-lg border border-sky-100 text-[10px] text-sky-800 space-y-0.5">
          <div className="font-bold flex items-center gap-1">
            <Info className="w-3 h-3 text-sky-600" />
            <span>Filter Aktif:</span>
          </div>
          <div>Bulan: <strong className="text-slate-900">{selectedMonths.join(', ')}</strong></div>
          {selectedBranch && <div>Site: <strong className="text-slate-900">{selectedBranch}</strong></div>}
          {selectedWOStatus && <div>Status WO: <strong className="text-slate-900">{selectedWOStatus}</strong></div>}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN ANALYTICS CARDS GRID (Exact 3-Row Layout From Image) */}
      {/* ========================================================================= */}
      <div className="flex-1 space-y-3.5 max-w-full">

        {/* ------------------------------------------------------------- */}
        {/* ROW 1: MTTR (Mean Time to Repair) & Failure Rate (Unplanned)  */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          
          {/* Card 1: MTTR (Mean Time to Repair) - Hrs */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative">
            {/* Header & Target */}
            <div className="flex items-start justify-between">
              <h2 className="text-sm md:text-base font-extrabold text-sky-700 tracking-tight">
                MTTR (Mean Time to Repair) - Hrs
              </h2>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Target: &lt;= 48hrs
              </span>
            </div>

            {/* Content: Chart + Right Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 items-center">
              {/* Line Chart */}
              <div className="sm:col-span-2 h-36 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mttrData} margin={{ top: 18, right: 15, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false}
                      dy={5}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      domain={[0, 40]}
                      ticks={[0, 10, 20, 30, 40]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`${value} jam`, 'MTTR']}
                      labelFormatter={(label) => `Tgl ${label} (${label > 29 ? 'Aug' : 'Jul'})`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#38bdf8" 
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#0284c7', strokeWidth: 1.5, stroke: '#ffffff' }}
                      activeDot={{ r: 5, fill: '#0369a1' }}
                      label={{ position: 'top', fill: '#1e293b', fontSize: 10, fontWeight: 700, dy: -4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex justify-between px-6 text-[10px] font-bold text-slate-400 -mt-2">
                  <span>Jul</span>
                  <span>Aug</span>
                </div>
              </div>

              {/* Right KPI Summary */}
              <div className="flex flex-col justify-center items-center sm:items-end text-right space-y-1 sm:border-l sm:border-slate-100 sm:pl-3">
                <div className="text-xl font-black text-sky-700 font-mono leading-none">{breakdownHours.toLocaleString('id-ID')}</div>
                <div className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">Breakdown Hours</div>

                <div className="text-lg font-black text-sky-700 font-mono leading-none pt-1">{cmWoAmount}</div>
                <div className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">CM WO Amount</div>

                <div className="pt-2 text-center sm:text-right">
                  <div className="text-2xl font-black text-sky-500 font-mono tracking-tight leading-none">
                    {mttrValue} <span className="text-xs font-semibold text-slate-500">hrs</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-700 uppercase tracking-tight mt-0.5">MTTR</div>
                  <div className="text-xs font-black text-amber-600 italic tracking-wider uppercase mt-0.5">
                    EXCELLENT
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Detail Link */}
            <div className="pt-1 border-t border-slate-100">
              <button 
                onClick={() => setActiveModal('mttr')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>More Detail for MTTR ---&gt;</span>
                <span className="underline font-bold">Detail</span>
              </button>
            </div>
          </div>

          {/* Card 2: Failure Rate (Unplanned) - % */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative">
            {/* Header & Target */}
            <div className="flex items-start justify-between">
              <h2 className="text-sm md:text-base font-extrabold text-sky-700 tracking-tight">
                Failure Rate (Unplanned) - %
              </h2>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Target: &lt;= 40%
              </span>
            </div>

            {/* Content: Chart + Right Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 items-center">
              {/* Upward Line Chart */}
              <div className="sm:col-span-2 h-36 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={failureTrendData} margin={{ top: 20, right: 30, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false}
                      dy={5}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      domain={[70, 100]}
                      ticks={[70, 80, 90, 100]}
                      unit="%"
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(value: any) => [`${value}%`, 'Failure Rate']}
                    />
                    <Line 
                      type="linear" 
                      dataKey="rate" 
                      stroke="#93c5fd" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                      label={{ position: 'top', fill: '#0f172a', fontSize: 11, fontWeight: 700, formatter: (v: any) => `${v}%`, dy: -5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Right KPI Summary */}
              <div className="flex flex-col justify-center items-center sm:items-end text-right space-y-1 sm:border-l sm:border-slate-100 sm:pl-3">
                <div className="text-xl font-black text-sky-700 font-mono leading-none">{totalWoCM.toLocaleString('id-ID')}</div>
                <div className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">Total WO CM</div>

                <div className="text-lg font-black text-sky-700 font-mono leading-none pt-1">{totalWoCreated.toLocaleString('id-ID')}</div>
                <div className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">Total WO Created</div>

                <div className="pt-2 text-center sm:text-right">
                  <div className="text-3xl font-black text-sky-500 font-mono tracking-tight leading-none">
                    {failureRatePercent}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-700 uppercase tracking-tight mt-0.5">Failure Rate</div>
                  <div className="text-xs font-black text-red-600 underline tracking-wider uppercase mt-0.5">
                    BAD
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Detail Link */}
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <button 
                onClick={() => setActiveModal('failure_rate')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>More Detail for Failure rate ---&gt;</span>
                <span className="underline font-bold">Detail</span>
              </button>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('failure_rate_matrix')}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                >
                  Buka Database (3NF) ➔
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* ROW 2: Repair Maintenance %, PM Compliance %, CM Compliance %           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Card 3: Repair Maintenance Percentage - % */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-extrabold text-sky-700 tracking-tight">
                Repair Maintenance Percentage - %
              </h3>
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="font-semibold text-emerald-600">Target: PM - 60%; CM - 40%</span>
                <span className="font-bold text-amber-600 italic">BAD</span>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between gap-2">
              {/* Total WO Big Number */}
              <div>
                <div className="text-3xl font-black text-sky-500 font-mono tracking-tight leading-none">
                  {totalWoCreated.toLocaleString('id-ID')}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">Total WO</div>
              </div>

              {/* PM Portion */}
              <div className="text-center">
                <div className="text-[10px] font-semibold text-slate-500">{pmTickets} <span className="text-[9px]">Tickets</span></div>
                <div className="text-xl font-extrabold text-sky-600 font-mono leading-none mt-0.5">{pmPortion}%</div>
                <div className="text-[10px] font-bold text-slate-800 mt-1">PM Portion</div>
              </div>

              {/* CM Portion */}
              <div className="text-center">
                <div className="text-[10px] font-semibold text-slate-500">{totalWoCM} <span className="text-[9px]">Tickets</span></div>
                <div className="text-xl font-extrabold text-sky-600 font-mono leading-none mt-0.5">{cmPortion}%</div>
                <div className="text-[10px] font-bold text-slate-800 mt-1">CM Portion</div>
              </div>
            </div>

            {/* Split Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div style={{ width: `${pmPortion}%` }} className="bg-emerald-500 h-full" title={`PM: ${pmPortion}%`} />
              <div style={{ width: `${cmPortion}%` }} className="bg-sky-500 h-full" title={`CM: ${cmPortion}%`} />
            </div>
          </div>

          {/* Card 4: PM Compliance (Preventive Maintenance) - % */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-extrabold text-sky-700 tracking-tight">
                  PM Compliance (Preventive Maintenance) - %
                </h3>
                <button 
                  onClick={() => setActiveModal('pm_compliance')}
                  className="text-sky-500 hover:text-sky-700"
                  title="Lihat Data PM"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="font-semibold text-emerald-600">Target: 100%</span>
                <span className="font-bold text-amber-600 italic">BAD</span>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between gap-2">
              {/* PM WO Created */}
              <div className="text-left">
                <div className="text-2xl font-black text-sky-600 font-mono leading-none">{pmWoCreated}</div>
                <div className="text-[11px] font-bold text-slate-800 mt-1">PM WO Created</div>
              </div>

              {/* PM Completed */}
              <div className="text-center">
                <div className="text-2xl font-black text-sky-600 font-mono leading-none">{pmCompleted}</div>
                <div className="text-[11px] font-bold text-slate-800 mt-1">PM Completed</div>
              </div>

              {/* PM Compliance % */}
              <div className="text-right">
                <div className="text-3xl font-black text-sky-500 font-mono leading-none">{pmCompliance}%</div>
                <div className="text-[10px] font-bold text-red-600 italic mt-1 leading-tight">
                  {pmOutstanding} outstanding<br />- voided
                </div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">PM Compliance</div>
              </div>
            </div>

            {/* Mini Progress */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div style={{ width: `${pmCompliance}%` }} className="bg-sky-500 h-full" />
            </div>
          </div>

          {/* Card 5: CM Compliance (Corrective Maintenance) - % */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-extrabold text-sky-700 tracking-tight">
                  CM Compliance (Corrective Maintenance) - %
                </h3>
                <button 
                  onClick={() => setActiveModal('cm_compliance')}
                  className="text-sky-500 hover:text-sky-700"
                  title="Lihat Data CM"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="font-semibold text-emerald-600">Target: 90%</span>
                <span className="font-bold text-amber-600 italic">EXCELLENT</span>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between gap-2">
              {/* CM WO Created */}
              <div className="text-left">
                <div className="text-2xl font-black text-sky-600 font-mono leading-none">{cmWoCreated}</div>
                <div className="text-[11px] font-bold text-slate-800 mt-1">CM WO Created</div>
              </div>

              {/* CM Completed */}
              <div className="text-center">
                <div className="text-2xl font-black text-sky-600 font-mono leading-none">{cmCompleted}</div>
                <div className="text-[11px] font-bold text-slate-800 mt-1">CM Completed</div>
              </div>

              {/* CM Compliance % */}
              <div className="text-right">
                <div className="text-3xl font-black text-sky-500 font-mono leading-none">{cmCompliance}%</div>
                <div className="text-[10px] font-bold text-red-600 italic mt-1 leading-tight">
                  {cmOutstanding} outstanding<br />- voided
                </div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">CM Compliance</div>
              </div>
            </div>

            {/* Mini Progress */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div style={{ width: `${cmCompliance}%` }} className="bg-sky-500 h-full" />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------------------------- */}
        {/* ROW 3: Breakdown Rate in Warehouse, MTBF, Availability Factor, Reliability Factor       */}
        {/* ------------------------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          
          {/* Card 6: Breakdown Rate in Warehouse (%) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-extrabold text-sky-700 tracking-tight">
                Breakdown Rate in Warehouse (%)
              </h3>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Target: &lt;=10% <span className="italic text-amber-600">Excellent</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-2 items-center">
              {/* Regional Grid (4 Branches) */}
              <div className="sm:col-span-2 grid grid-cols-4 gap-1 text-center border-r border-slate-100 pr-2">
                <div>
                  <div className="text-[9px] font-bold text-red-600 leading-none">{warehouseStats.westJkt.units} units</div>
                  <div className="text-sm font-black text-sky-500 font-mono my-0.5">{warehouseStats.westJkt.percent}</div>
                  <div className="text-[8px] font-bold text-amber-600 italic">Excellent</div>
                  <div className="text-[9px] font-bold text-slate-800 mt-0.5 truncate">West JKT</div>
                </div>

                <div>
                  <div className="text-[9px] font-bold text-red-600 leading-none">{warehouseStats.semarang.units} units</div>
                  <div className="text-sm font-black text-sky-500 font-mono my-0.5">{warehouseStats.semarang.percent}</div>
                  <div className="text-[8px] font-bold text-amber-600 italic">Excellent</div>
                  <div className="text-[9px] font-bold text-slate-800 mt-0.5 truncate">Semarang</div>
                </div>

                <div>
                  <div className="text-[9px] font-bold text-red-600 leading-none">{warehouseStats.surabaya.units} units</div>
                  <div className="text-sm font-black text-sky-500 font-mono my-0.5">{warehouseStats.surabaya.percent}</div>
                  <div className="text-[8px] font-bold text-amber-600 italic">Excellent</div>
                  <div className="text-[9px] font-bold text-slate-800 mt-0.5 truncate">Surabaya</div>
                </div>

                <div>
                  <div className="text-[9px] font-bold text-red-600 leading-none">{warehouseStats.batam.units} units</div>
                  <div className="text-sm font-black text-sky-500 font-mono my-0.5">{warehouseStats.batam.percent}</div>
                  <div className="text-[8px] font-bold text-amber-600 italic">Excellent</div>
                  <div className="text-[9px] font-bold text-slate-800 mt-0.5 truncate">Batam</div>
                </div>
              </div>

              {/* Warehouse Total Summary */}
              <div className="text-center sm:text-right space-y-0.5">
                <div className="text-lg font-black text-sky-500 font-mono leading-none">{warehouseStats.totalBD}</div>
                <div className="text-[9px] font-bold text-slate-700 uppercase leading-tight">BD unit</div>

                <div className="text-lg font-black text-sky-500 font-mono leading-none pt-1">{warehouseStats.inWarehouse}</div>
                <div className="text-[9px] font-bold text-slate-700 uppercase leading-tight">in Warehouse</div>

                <div className="text-xl font-black text-sky-500 font-mono leading-none pt-1">{warehouseStats.totalPercent}</div>
                <div className="text-[9px] font-bold text-slate-700 uppercase">%</div>
              </div>
            </div>
          </div>

          {/* Card 7: MTBF (Mean Time Between Failure) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-extrabold text-sky-700 tracking-tight">
                MTBF (Mean Time Between Failure)
              </h3>
              <div className="flex items-center justify-between text-[10px] text-emerald-600 font-semibold mt-0.5">
                <span>Target: =&gt;60 hrs/week</span>
                <span>Target: =&gt;200 hrs/week</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-auto py-2 text-center">
              {/* AWP MTBF */}
              <div className="border-r border-slate-100 pr-2">
                <div className="text-2xl font-black text-sky-500 font-mono leading-none">{awpMTBF}</div>
                <div className="text-[10px] font-bold text-amber-600 italic mt-1">Excellent</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">AWP MTBF</div>
              </div>

              {/* Forklift MTBF */}
              <div>
                <div className="text-2xl font-black text-sky-500 font-mono leading-none">{forkliftMTBF}</div>
                <div className="text-[10px] font-bold text-red-500 italic mt-1">#REF!</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">Forklift MTBF</div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-1">
              *Metrik keandalan jam operasi per siklus kegagalan
            </div>
          </div>

          {/* Card 8: Availability Factor - % */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-extrabold text-sky-700 tracking-tight">
                Availability Factor - %
              </h3>
              
              {/* Dropdown Selector + Score */}
              <div className="flex items-center justify-between mt-1">
                <select 
                  value={availabilityMonth}
                  onChange={(e) => setAvailabilityMonth(e.target.value)}
                  className="text-[11px] font-bold border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50 text-slate-700"
                >
                  {months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <div className="text-right">
                  <div className="text-xl font-black text-sky-500 font-mono leading-none">99.1%</div>
                  <div className="text-[9px] font-bold text-amber-600 italic">EXCELLENT</div>
                </div>
              </div>
            </div>

            {/* 6 Branch Availability Grid */}
            <div className="grid grid-cols-3 gap-1.5 my-2 text-center text-[10px] border-t border-slate-100 pt-2">
              {availabilityBranchData.map(b => (
                <div key={b.name} className="p-1 rounded bg-slate-50/70 border border-slate-100">
                  <div className="font-extrabold text-sky-600 font-mono">{b.value}</div>
                  <div className="text-[8px] font-bold text-amber-600 italic">{b.status}</div>
                  <div className="font-semibold text-slate-800 truncate text-[9px]">{b.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 9: Reliability Factor - % */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-extrabold text-sky-700 tracking-tight">
                Reliability Factor - %
              </h3>

              {/* Dropdown Selector + Score */}
              <div className="flex items-center justify-between mt-1">
                <select 
                  value={reliabilityMonth}
                  onChange={(e) => setReliabilityMonth(e.target.value)}
                  className="text-[11px] font-bold border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50 text-slate-700"
                >
                  {months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <div className="text-right">
                  <div className="text-xl font-black text-sky-500 font-mono leading-none">91.7%</div>
                  <div className="text-[9px] font-bold text-emerald-600 italic">GOOD</div>
                </div>
              </div>
            </div>

            {/* 5 Branch Reliability Grid */}
            <div className="grid grid-cols-3 gap-1.5 my-2 text-center text-[10px] border-t border-slate-100 pt-2">
              {reliabilityBranchData.map(b => (
                <div key={b.name} className={`p-1 rounded border ${b.isBad ? 'bg-red-50/50 border-red-200' : 'bg-slate-50/70 border-slate-100'}`}>
                  <div className={`font-extrabold font-mono ${b.isBad ? 'text-red-600' : 'text-sky-600'}`}>{b.value}</div>
                  <div className={`text-[8px] font-bold italic ${b.isBad ? 'text-red-600' : 'text-amber-600'}`}>{b.status}</div>
                  <div className="font-semibold text-slate-800 truncate text-[9px]">{b.name}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE DRILL-DOWN MODALS                                             */}
      {/* ========================================================================= */}

      {/* 1. MTTR Detail Breakdown Modal */}
      {activeModal === 'mttr' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">MTTR (Mean Time to Repair) Deep-Dive Log</h3>
                <p className="text-xs text-slate-500">Rincian jam kerusakan per unit dan perbaikan mekanik</p>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                <div>
                  <span className="text-slate-500 font-semibold">Total Breakdown:</span>
                  <div className="text-lg font-mono font-black text-sky-700">{breakdownHours} Jam</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Tiket CM Tereksekusi:</span>
                  <div className="text-lg font-mono font-black text-sky-700">{cmWoAmount} Tiket</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Rata-rata MTTR:</span>
                  <div className="text-lg font-mono font-black text-emerald-600">{mttrValue} Jam / Unit</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Tanggal</th>
                      <th className="p-2.5">No WO</th>
                      <th className="p-2.5">Unit Aset</th>
                      <th className="p-2.5">Site / Branch</th>
                      <th className="p-2.5 text-right">Durasi Perbaikan (Jam)</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="p-2.5 font-mono">31-Aug-2026</td>
                      <td className="p-2.5 font-mono text-sky-600 font-bold">WO-2026-0831</td>
                      <td className="p-2.5">GenSet Caterpillar 500kVA</td>
                      <td className="p-2.5">Jakarta_Electricity</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-600">2.0 hrs</td>
                      <td className="p-2.5 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">EXCELLENT</span></td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono">30-Aug-2026</td>
                      <td className="p-2.5 font-mono text-sky-600 font-bold">WO-2026-0829</td>
                      <td className="p-2.5">Forklift Toyota 3.5T</td>
                      <td className="p-2.5">Surabaya_AWP</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-600">3.0 hrs</td>
                      <td className="p-2.5 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">EXCELLENT</span></td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono">29-Jul-2026</td>
                      <td className="p-2.5 font-mono text-sky-600 font-bold">WO-2026-0788</td>
                      <td className="p-2.5">Excavator Komatsu PC200-8</td>
                      <td className="p-2.5">Semarang_AWP</td>
                      <td className="p-2.5 text-right font-mono font-bold text-amber-600">28.0 hrs</td>
                      <td className="p-2.5 text-center"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">PASSED</span></td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono">26-Jul-2026</td>
                      <td className="p-2.5 font-mono text-sky-600 font-bold">WO-2026-0742</td>
                      <td className="p-2.5">Wheel Loader WA380</td>
                      <td className="p-2.5">West Jakarta_AWP</td>
                      <td className="p-2.5 text-right font-mono font-bold text-red-600">34.0 hrs</td>
                      <td className="p-2.5 text-center"><span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">CRITICAL</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Failure Rate Modal */}
      {activeModal === 'failure_rate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Failure Rate Root-Cause Breakdown</h3>
                <p className="text-xs text-slate-500">Analisis penyebab kegagalan tak terencana (Unplanned CM)</p>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 flex items-center justify-between">
                <div>
                  <div className="font-bold">Status Failure Rate: {failureRatePercent}% (Batas Aman &lt;= 40%)</div>
                  <div className="text-[11px] text-red-700 mt-0.5">Tingginya rasio CM menandakan perawatan preventif (PM) perlu diperketat.</div>
                </div>
                <span className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg uppercase">BAD</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-800 mb-2">Top Root Causes (Pareto):</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex justify-between"><span>1. Kebocoran Sistem Hidraulik:</span> <strong className="font-mono text-slate-800">42%</strong></li>
                    <li className="flex justify-between"><span>2. Masalah Kelistrikan & Sensor:</span> <strong className="font-mono text-slate-800">28%</strong></li>
                    <li className="flex justify-between"><span>3. Keausan Komponen Transmisi:</span> <strong className="font-mono text-slate-800">18%</strong></li>
                    <li className="flex justify-between"><span>4. Operator Error / Fatigue:</span> <strong className="font-mono text-slate-800">12%</strong></li>
                  </ul>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-800 mb-2">Rekomendasi Tindakan:</h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                    <li>Otomatisasi jadwal PM 250 Jam & 500 Jam.</li>
                    <li>Stok suku cadang seal kit & hose di gudang site.</li>
                    <li>SOP checklist pra-operasi wajib bagi operator.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Tutup Analisis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PM / CM Spreadsheet Data Modal */}
      {(activeModal === 'pm_compliance' || activeModal === 'cm_compliance') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {activeModal === 'pm_compliance' ? 'Tabel Kepatuhan PM (Preventive)' : 'Tabel Kepatuhan CM (Corrective)'}
                </h3>
                <p className="text-xs text-slate-500">Monitoring penyelesaian jadwal tiket pemeliharaan</p>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex justify-between">
                <span>Total Tiket: <strong>{activeModal === 'pm_compliance' ? pmWoCreated : cmWoCreated}</strong></span>
                <span>Terselesaikan: <strong>{activeModal === 'pm_compliance' ? pmCompleted : cmCompleted}</strong></span>
                <span>Kepatuhan: <strong className="text-sky-700">{activeModal === 'pm_compliance' ? `${pmCompliance}%` : `${cmCompliance}%`}</strong></span>
              </div>

              <p className="text-slate-600">
                Sistem menghitung rasio kepatuhan secara otomatis berdasarkan penutupan tiket sebelum melewati batas waktu SLA. Tiket yang dibatalkan (voided) atau tertunda suku cadang otomatis dihitung dalam pengecualian.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Tutup Tabel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
