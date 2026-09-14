import React, { useState, useRef, useEffect } from 'react';
import { X, QrCode, Camera, Search, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../../services/db';
import { Asset } from '../../types/eams';

interface QRScannerModalProps {
  onClose: () => void;
  onAssetFound: (asset: Asset) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  onClose,
  onAssetFound,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const assets = db.getAssets();

  // Try starting real camera if accessible in container/browser
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsCameraActive(true);
        }
      } else {
        setErrorMsg('Perangkat kamera tidak didukung di browser ini.');
      }
    } catch (err: any) {
      setErrorMsg('Izin kamera ditolak atau tidak tersedia di iframe. Silakan gunakan simulasi barcode di bawah.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleLookup = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    const found = assets.find(a => 
      a.asset_code.toUpperCase() === trimmed || 
      a.serial_number.toUpperCase() === trimmed ||
      a.name.toUpperCase().includes(trimmed)
    );

    if (found) {
      stopCamera();
      onAssetFound(found);
    } else {
      setErrorMsg(`Aset dengan kode atau serial "${trimmed}" tidak ditemukan.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Scan QR Code / Barcode Aset</h3>
              <p className="text-xs text-slate-400">Pindai tag fisik aset untuk akses instan di lapangan</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Camera Viewfinder Box */}
          <div className="relative aspect-video rounded-2xl bg-black border-2 border-slate-800 overflow-hidden flex items-center justify-center">
            {isCameraActive ? (
              <video ref={videoRef} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4 space-y-2">
                <Camera className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-xs">Kamera scanner belum aktif</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow"
                >
                  Aktifkan Kamera
                </button>
              </div>
            )}

            {/* Target Reticle Overlay */}
            {isCameraActive && (
              <div className="absolute inset-0 border-2 border-blue-500/60 m-8 rounded-xl pointer-events-none flex items-center justify-center animate-pulse">
                <div className="w-full h-0.5 bg-rose-500 shadow-lg shadow-rose-500/50" />
              </div>
            )}
          </div>

          {/* Direct Code / RFID Input */}
          <div className="space-y-2 pt-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Input Manual / Barcode Laser Reader:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleLookup(manualCode);
                }}
                placeholder="Misal: AST-001 atau SN-98231"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleLookup(manualCode)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Cari
              </button>
            </div>
          </div>

          {/* Quick Demo Tag Buttons for Test Drive */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="text-[10px] text-slate-500 font-medium uppercase">Simulasi Tag QR Cepat (Klik untuk Buka):</div>
            <div className="flex flex-wrap gap-1.5">
              {assets.slice(0, 6).map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleLookup(a.asset_code)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[10px] transition-colors"
                >
                  {a.asset_code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
