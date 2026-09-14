import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, UserCheck, QrCode, Search, 
  RotateCcw, Sparkles, ChevronDown, CheckCircle2, AlertTriangle, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { RoleName } from '../../types/eams';

interface HeaderProps {
  onOpenQRScanner: () => void;
  onGlobalSearchSelect: (type: 'asset' | 'wo' | 'part', id: number) => void;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenQRScanner, 
  onGlobalSearchSelect, 
  onNavigate 
}) => {
  const { currentUser, switchUser, users } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Global search matching
  const assets = db.getAssets();
  const workOrders = db.getWorkOrders();
  const parts = db.getSpareParts();

  const searchResults = searchQuery.trim().length >= 2 ? {
    assets: assets.filter(a => 
      a.asset_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serial_number.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 4),
    workOrders: workOrders.filter(w => 
      w.wo_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.issue_description.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    parts: parts.filter(p => 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
  } : null;

  const handleResetData = () => {
    db.resetToDefault();
    setIsResetConfirmOpen(false);
    window.location.reload();
  };

  const roleColors: Record<RoleName, string> = {
    admin: 'bg-purple-950/80 text-purple-300 border-purple-700',
    supervisor: 'bg-indigo-950/80 text-indigo-300 border-indigo-700',
    service_coordinator: 'bg-cyan-950/80 text-cyan-300 border-cyan-700',
    asset_specialist: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
    warehouse_specialist: 'bg-amber-950/80 text-amber-300 border-amber-700',
    mechanic: 'bg-rose-950/80 text-rose-300 border-rose-700',
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Logo & System Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">EAMS</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                Enterprise v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Asset Lifecycle & Maintenance Control</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Aset (AST-..), Work Order (WO-..), atau Suku Cadang (SP-..)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Search Dropdown Results */}
          {searchResults && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto text-xs">
              {searchResults.assets.length > 0 && (
                <div className="mb-2">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Aset ({searchResults.assets.length})</div>
                  {searchResults.assets.map(a => (
                    <button
                      key={a.id}
                      onClick={() => {
                        onGlobalSearchSelect('asset', a.id);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center justify-between text-slate-200"
                    >
                      <span className="font-mono text-blue-400">{a.asset_code}</span>
                      <span className="truncate max-w-[200px] text-slate-300">{a.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.workOrders.length > 0 && (
                <div className="mb-2">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Work Order ({searchResults.workOrders.length})</div>
                  {searchResults.workOrders.map(w => (
                    <button
                      key={w.id}
                      onClick={() => {
                        onGlobalSearchSelect('wo', w.id);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center justify-between text-slate-200"
                    >
                      <span className="font-mono text-amber-400">{w.wo_number}</span>
                      <span className="truncate max-w-[200px] text-slate-400">{w.issue_description}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.parts.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Suku Cadang ({searchResults.parts.length})</div>
                  {searchResults.parts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onGlobalSearchSelect('part', p.id);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center justify-between text-slate-200"
                    >
                      <span className="font-mono text-emerald-400">{p.sku}</span>
                      <span className="truncate max-w-[200px] text-slate-300">{p.name} (Stok: {p.stock_qty})</span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.assets.length === 0 && searchResults.workOrders.length === 0 && searchResults.parts.length === 0 && (
                <div className="text-center py-4 text-slate-400">Tidak ada data ditemukan untuk "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Quick QR Scanner Button */}
          <button
            onClick={onOpenQRScanner}
            id="btn-quick-qr-scanner"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shadow-sm"
            title="Buka Pemindai QR/Barcode Aset"
          >
            <QrCode className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          {/* Interactive Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              id="btn-role-switcher"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 text-xs font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${roleColors[currentUser.role]}`}>
                    {currentUser.role_display_name}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Dropdown User Switcher */}
            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsUserMenuOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Simulasi Akun RBAC</span>
                    <span className="text-[10px] text-blue-400 font-medium">Klik untuk beralih peran</span>
                  </div>

                  <div className="space-y-1.5 max-h-80 overflow-y-auto">
                    {users.map(u => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-blue-950/80 border border-blue-700/80 text-white' : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                                {u.name}
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                              </div>
                              <div className="text-[10px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${roleColors[u.role]}`}>
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('admin');
                      }}
                      className="text-blue-400 hover:underline"
                    >
                      Kelola Pengguna
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsResetConfirmOpen(true);
                      }}
                      className="text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Data Demo
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Reset Database Demo?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Tindakan ini akan mengembalikan seluruh master aset, suku cadang, work order, mutasi, dan audit log ke kondisi awal (seed data default PRD).
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
              >
                Ya, Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
