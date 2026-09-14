import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  Boxes, 
  ArrowLeftRight, 
  Calculator, 
  History, 
  Users, 
  QrCode,
  AlertCircle,
  FileCheck,
  Activity,
  Database,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { currentUser } = useAuth();

  // Dynamic counter badges
  const workOrders = db.getWorkOrders();
  const spareParts = db.getSpareParts();
  const movements = db.getAssetMovements();

  // Active WO count for this mechanic or total
  const pendingWOCount = workOrders.filter(w => w.status === 'assigned' || w.status === 'in_progress').length;
  const needApprovalWOCount = workOrders.filter(w => w.status === 'completed').length;
  const lowStockCount = spareParts.filter(p => p.stock_qty <= p.minimum_threshold).length;
  const pendingMovementCount = movements.filter(m => m.status === 'pending').length;

  const navItems = [
    {
      id: 'analytics',
      label: 'Cockpit KPI Perawatan',
      icon: Activity,
      badge: { text: 'MTTR / MTBF', color: 'bg-sky-600 text-white' },
    },
    {
      id: 'failure_rate_matrix',
      label: 'Database Failure Rate (3NF)',
      icon: Database,
      badge: { text: 'GSheet 100%', color: 'bg-emerald-600 text-white' },
    },
    {
      id: 'dashboard',
      label: 'Ringkasan Eksekutif',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'assets',
      label: 'Master Data Aset',
      icon: Package,
      badge: null,
    },
    {
      id: 'work_orders',
      label: 'Work Orders (WO)',
      icon: Wrench,
      badge: currentUser.role === 'supervisor' && needApprovalWOCount > 0 
        ? { text: `${needApprovalWOCount} Review`, color: 'bg-indigo-600 text-white' }
        : pendingWOCount > 0 
        ? { text: `${pendingWOCount} Aktif`, color: 'bg-amber-600 text-white' }
        : null,
    },
    {
      id: 'inventory',
      label: 'Suku Cadang & Gudang',
      icon: Boxes,
      badge: lowStockCount > 0 
        ? { text: `${lowStockCount} Kritis`, color: 'bg-rose-600 text-white animate-pulse' }
        : null,
    },
    {
      id: 'movements',
      label: 'Mutasi & Transfer Lokasi',
      icon: ArrowLeftRight,
      badge: pendingMovementCount > 0 
        ? { text: `${pendingMovementCount}`, color: 'bg-cyan-600 text-white' }
        : null,
    },
    {
      id: 'depreciation',
      label: 'Depresiasi Finansial',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'audit',
      label: 'Audit Trail & Log',
      icon: History,
      badge: null,
    },
    {
      id: 'handbook',
      label: 'Buku Panduan (PDF)',
      icon: BookOpen,
      badge: { text: 'PDF Ready', color: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' },
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-[calc(100vh-61px)] sticky top-[61px] select-none overflow-y-auto">
      {/* User Role Card */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Akses Login Teraktif</div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-blue-400 font-medium truncate">{currentUser.role_display_name}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 space-y-1 flex-1">
        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Modul Operasional
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight ${item.badge.color}`}>
                  {item.badge.text}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status / Quick SLA Overview */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 m-3 rounded-2xl border">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold mb-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Integritas Database</span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Engine:</span>
            <span className="text-slate-200 font-mono">InnoDB / utf8mb4</span>
          </div>
          <div className="flex justify-between">
            <span>SLA Standard:</span>
            <span className="text-emerald-400 font-semibold">98.4% Compliant</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
