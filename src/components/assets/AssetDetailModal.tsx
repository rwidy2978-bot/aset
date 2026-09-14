import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  X, QrCode, DollarSign, Calendar, MapPin, Wrench, 
  ArrowLeftRight, FileText, CheckCircle2, AlertTriangle, Printer, Download, UserCheck
} from 'lucide-react';
import { Asset, Category, WorkOrder, AssetMovement } from '../../types/eams';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatDate, formatDateTime, getAssetStatusBadge, getConditionBadge, getWorkOrderPriorityBadge, getWorkOrderStatusBadge } from '../../utils/formatters';
import { AssetDepreciationService } from '../../services/depreciation';

interface AssetDetailModalProps {
  assetId: number;
  onClose: () => void;
  onOpenCreateWO: (assetId: number) => void;
  onOpenMovement: (assetId: number) => void;
  onSelectWorkOrder: (woId: number) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  assetId,
  onClose,
  onOpenCreateWO,
  onOpenMovement,
  onSelectWorkOrder,
}) => {
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'qr' | 'maintenance' | 'movements' | 'financial'>('overview');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const asset = db.getAssetById(assetId);
  const workOrders = db.getWorkOrders().filter(w => w.asset_id === assetId);
  const movements = db.getAssetMovements().filter(m => m.asset_id === assetId);

  useEffect(() => {
    if (asset) {
      const qrPayload = JSON.stringify({
        system: 'EAMS-ENTERPRISE',
        code: asset.asset_code,
        sn: asset.serial_number,
        name: asset.name,
        loc: asset.current_location,
        val: asset.current_book_value,
      });

      QRCode.toDataURL(qrPayload, {
        width: 280,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [asset]);

  if (!asset) return null;

  const statusBadge = getAssetStatusBadge(asset.status);
  const conditionBadge = getConditionBadge(asset.condition_status);
  const category = asset.category || db.getCategories()[0];

  const depreciationCalc = AssetDepreciationService.calculateMonthlyDepreciation(asset, category);
  const schedule = AssetDepreciationService.generateAmortizationSchedule(asset, category);

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Asset Tag - ${asset.asset_code}</title>
        <style>
          body { font-family: monospace; padding: 20px; text-align: center; }
          .tag-card { border: 2px solid #000; border-radius: 8px; padding: 16px; max-width: 320px; margin: 0 auto; }
          .title { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
          .code { font-size: 14px; font-weight: bold; color: #1e40af; margin-bottom: 8px; }
          .qr-img { width: 180px; height: 180px; margin: 10px auto; }
          .specs { font-size: 10px; text-align: left; border-top: 1px dashed #666; padding-top: 8px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="tag-card">
          <div class="title">EAMS ASSET TAG</div>
          <div class="code">${asset.asset_code}</div>
          <img src="${qrDataUrl}" class="qr-img" />
          <div style="font-size: 11px; font-weight: bold;">${asset.name}</div>
          <div style="font-size: 10px; color: #555;">SN: ${asset.serial_number}</div>
          <div class="specs">
            <div><strong>Lokasi:</strong> ${asset.current_location}</div>
            <div><strong>Kategori:</strong> ${category.name}</div>
            <div><strong>Tgl Beli:</strong> ${formatDate(asset.purchase_date)}</div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400 font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400">{asset.asset_code}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${conditionBadge.color}`}>
                  {conditionBadge.label}
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{asset.name}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Spesifikasi & Info
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'qr' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            QR & Barcode Badge
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'maintenance' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Riwayat Perawatan ({workOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'movements' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Mutasi Lokasi ({movements.length})
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'financial' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Depresiasi & Nilai Buku
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial & Location Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Nilai Buku Terkini</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {formatRupiah(asset.current_book_value)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Biaya Perolehan: {formatRupiah(asset.purchase_cost)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Lokasi & Penanggung Jawab</div>
                  <div className="text-sm font-semibold text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{asset.current_location}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    PIC: {asset.assigned_user?.name || 'Pool Operasional'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Jadwal Perawatan Terdekat</div>
                  <div className="text-sm font-semibold text-blue-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatDate(asset.next_preventive_date || '2026-10-15')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Terakhir: {formatDate(asset.last_maintenance_date || asset.purchase_date)}
                  </div>
                </div>
              </div>

              {/* Master Specs Table */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Spesifikasi Teknis & Identitas Manufaktur
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Nomor Seri (Serial Number):</span>
                    <span className="font-mono font-bold text-white">{asset.serial_number}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Kategori:</span>
                    <span className="text-slate-200">{category.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Tanggal Pembelian:</span>
                    <span>{formatDate(asset.purchase_date)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Masa Manfaat Finansial:</span>
                    <span>{category.useful_life_years} Tahun ({category.useful_life_years * 12} Bulan)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Metode Depresiasi:</span>
                    <span className="font-mono text-blue-400 uppercase font-semibold">
                      {category.depreciation_method.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Nilai Residu:</span>
                    <span className="font-mono">{formatRupiah(asset.residual_value)}</span>
                  </div>
                </div>

                {asset.specs && Object.keys(asset.specs).length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parameter Operasional:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {Object.entries(asset.specs).map(([key, val]) => (
                        <div key={key} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="text-[10px] text-slate-400">{key}</div>
                          <div className="text-xs font-semibold text-white font-mono mt-0.5">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QR BADGE TAB */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
              <div className="p-6 rounded-2xl bg-white text-slate-950 border-2 border-slate-200 shadow-2xl max-w-xs w-full text-center space-y-3">
                <div className="text-xs font-black tracking-widest text-slate-800 uppercase border-b-2 border-slate-800 pb-1">
                  EAMS ASSET IDENTIFIER
                </div>
                <div className="font-mono font-extrabold text-blue-700 text-sm">{asset.asset_code}</div>
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-lg" />
                ) : (
                  <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400">Generating QR...</div>
                )}
                <div className="text-xs font-bold text-slate-900 leading-tight">{asset.name}</div>
                <div className="text-[10px] text-slate-600 font-mono">SN: {asset.serial_number}</div>
                <div className="pt-2 border-t border-slate-300 text-[9px] text-slate-500 text-left space-y-0.5">
                  <div><strong>Lokasi:</strong> {asset.current_location}</div>
                  <div><strong>Kategori:</strong> {category.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintQR}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Label Tagging</span>
                </button>

                <a
                  href={qrDataUrl}
                  download={`EAMS-TAG-${asset.asset_code}.png`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh PNG</span>
                </a>
              </div>
            </div>
          )}

          {/* MAINTENANCE TAB */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Riwayat Work Order untuk Aset Ini</h4>
                {can.createWorkOrder && (
                  <button
                    onClick={() => onOpenCreateWO(asset.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Buat Tiket Baru</span>
                  </button>
                )}
              </div>

              {workOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400">
                  Belum ada riwayat perbaikan atau servis untuk aset ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {workOrders.map(wo => {
                    const pBadge = getWorkOrderPriorityBadge(wo.priority);
                    const sBadge = getWorkOrderStatusBadge(wo.status);
                    return (
                      <div
                        key={wo.id}
                        onClick={() => {
                          onClose();
                          onSelectWorkOrder(wo.id);
                        }}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-400">{wo.wo_number}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${pBadge.bg}`}>
                              {pBadge.label}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${sBadge.bg}`}>
                            {sBadge.label}
                          </span>
                        </div>
                        <p className="text-slate-200">{wo.issue_description}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                          <span>Mekanik: {wo.mechanic?.name || 'Mekanik'}</span>
                          <span>Tanggal: {formatDate(wo.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MOVEMENTS TAB */}
          {activeTab === 'movements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Riwayat Perpindahan & Mutasi Lokasi</h4>
                {can.requestMovement && (
                  <button
                    onClick={() => onOpenMovement(asset.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Ajukan Mutasi</span>
                  </button>
                )}
              </div>

              {movements.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400">
                  Belum ada catatan mutasi fisik untuk aset ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {movements.map(m => (
                    <div key={m.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium uppercase ${
                          m.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        }`}>
                          {m.status}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatDate(m.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-200">
                        <span className="text-rose-400">{m.from_location}</span>
                        <span>➔</span>
                        <span className="text-emerald-400 font-semibold">{m.to_location}</span>
                      </div>
                      {m.notes && <p className="text-[11px] text-slate-400">{m.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FINANCIAL TAB */}
          {activeTab === 'financial' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Metode Depresiasi:</span>
                  <span className="font-bold text-white font-mono uppercase">{category.depreciation_method.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Biaya Depresiasi Bulanan:</span>
                  <span className="font-bold text-amber-400 font-mono">{formatRupiah(depreciationCalc.monthlyRate)}/bulan</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Akumulasi Depresiasi:</span>
                  <span className="font-bold text-rose-400 font-mono">{formatRupiah(depreciationCalc.accumulatedDepreciation)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                  <span className="text-slate-300 font-semibold">Nilai Buku Terkini:</span>
                  <span className="font-bold text-emerald-400 font-mono text-base">{formatRupiah(asset.current_book_value)}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-200 text-xs mb-2">Proyeksi Jadwal Amortisasi 6 Periode Pertama</h5>
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="p-2">Bulan Ke</th>
                        <th className="p-2">Nilai Awal</th>
                        <th className="p-2">Beban Depresiasi</th>
                        <th className="p-2">Nilai Buku Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                      {schedule.slice(0, 6).map(item => (
                        <tr key={item.monthIndex} className="hover:bg-slate-800/40">
                          <td className="p-2 text-blue-400 font-bold">M+{item.monthIndex} ({item.date.slice(0, 7)})</td>
                          <td className="p-2">{formatRupiah(item.beginningValue)}</td>
                          <td className="p-2 text-rose-400">-{formatRupiah(item.depreciationExpense)}</td>
                          <td className="p-2 text-emerald-400 font-bold">{formatRupiah(item.endingBookValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Terdaftar sejak {formatDate(asset.created_at)}
          </div>
          <div className="flex items-center gap-2">
            {can.createWorkOrder && (
              <button
                onClick={() => onOpenCreateWO(asset.id)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30"
              >
                Buat Work Order
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
