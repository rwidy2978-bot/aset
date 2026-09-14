import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Download, 
  Printer, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Activity, 
  Database, 
  Wrench, 
  Boxes, 
  ArrowLeftRight, 
  Calculator, 
  QrCode, 
  Search,
  Sparkles,
  FileText,
  FileCheck2,
  Cpu,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import jsPDF from 'jspdf';

export const HandbookViewer: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<string>('intro');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Generate Professional Multi-page PDF using jsPDF
  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          // Add Header to subsequent pages
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text('EAMS & Industrial Reliability Analytics - Buku Panduan Pengoperasian', margin, 10);
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, 12, pageWidth - margin, 12);
          yPos = 18;
        }
      };

      // --- COVER PAGE / HEADER ---
      // Primary Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(margin, yPos, contentWidth, 36, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('BUKU PANDUAN PENGOPERASIAN RESMI', margin + 6, yPos + 12);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(56, 189, 248); // sky-400
      doc.text('Enterprise Asset Management System (EAMS) & Failure Rate Analytics', margin + 6, yPos + 20);

      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225); // slate-300
      doc.text('Versi: 1.0.4 Enterprise | Target: Web & Mobile Touch | Role: Multi-Tier RBAC', margin + 6, yPos + 28);

      yPos += 44;

      // Section: Ringkasan Eksekutif
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('1. PENDAHULUAN & TUJUAN SISTEM', margin, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const introText = 
        'Enterprise Asset Management System (EAMS) adalah sistem manajemen aset dan keandalan alat berat berskala enterprise. ' +
        'Sistem ini dirancang untuk memantau performa armada alat berat (AWP, Genset, Forklift, Excavator), mencatat riwayat pemeliharaan ' +
        'Preventive Maintenance (PM) dan Corrective Maintenance (CM), mengontrol inventaris suku cadang, serta menganalisis indikator keandalan ' +
        'seperti MTTR, MTBF, Breakdown Rate in Warehouse, Availability Factor, dan Reliability Factor secara presisi.';
      const splitIntro = doc.splitTextToSize(introText, contentWidth);
      doc.text(splitIntro, margin, yPos);
      yPos += splitIntro.length * 4.5 + 4;

      // Section: Peran & Otoritas (RBAC)
      checkPageBreak(35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('2. STRUKTUR PERAN PENGGUNA (ROLE-BASED ACCESS CONTROL)', margin, yPos);
      yPos += 6;

      const roles = [
        { role: 'Administrator', desc: 'Akses penuh ke seluruh konfigurasi master data, skema database, dan audit trail sistem.' },
        { role: 'Operational Supervisor', desc: 'Ihwan Suryadi,ST. - Berwenang melakukan validasi, approval Work Order selesai, dan mutasi aset.' },
        { role: 'Maintenance Coordinator', desc: 'Menerbitkan SPK/Work Order, menjadwalkan PM/CM, serta memantau SLA countdown.' },
        { role: 'Field Mechanic / Teknisi', desc: 'Mengisi checklist pekerjaan di lapangan, mencatat jam perbaikan, dan menginput suku cadang.' },
        { role: 'Warehouse Specialist', desc: 'Mengelola persediaan suku cadang gudang, restock, serta monitoring batas minimum stok.' },
        { role: 'Asset Specialist', desc: 'Registrasi unit fisik alat berat baru, cetak stiker QR code, dan kalkulasi depresiasi nilai buku.' },
      ];

      roles.forEach(r => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(2, 132, 199); // sky-600
        doc.text(`* ${r.role}:`, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const rDesc = doc.splitTextToSize(r.desc, contentWidth - 45);
        doc.text(rDesc, margin + 45, yPos);
        yPos += rDesc.length * 4 + 2;
      });

      yPos += 4;

      // Section: Modul Cockpit KPI
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('3. COCKPIT KPI PERAWATAN (INDUSTRIAL RELIABILITY)', margin, yPos);
      yPos += 6;

      const kpis = [
        { name: 'MTTR (Mean Time to Repair)', standard: 'Target <= 48 Jam', desc: 'Mengukur rata-rata kecepatan penyelesaian perbaikan darurat.' },
        { name: 'Unplanned Failure Rate', standard: 'Target <= 40%', desc: 'Persentase kegagalan mendadak dibandingkan seluruh kejadian pemeliharaan.' },
        { name: 'Proporsi PM vs CM', standard: 'Ideal 70% PM : 30% CM', desc: 'Keseimbangan antara perawatan preventif berkala dan perbaikan kerusakan.' },
        { name: 'Breakdown Rate in Warehouse', standard: 'Target <= 10%', desc: 'Rasio unit rusak yang tertahan di gudang cabang (monitoring kesiapan sewa).' },
        { name: 'MTBF (Mean Time Between Failure)', standard: 'AWP Target 228.6 jam', desc: 'Rata-rata jam operasional alat berat bebas dari gangguan kerusakan.' },
      ];

      kpis.forEach(k => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(k.name, margin, yPos);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // emerald-600
        doc.text(`[${k.standard}]`, margin + 65, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const kDesc = doc.splitTextToSize(k.desc, contentWidth - 110);
        doc.text(kDesc, margin + 110, yPos);
        yPos += kDesc.length * 4 + 2;
      });

      yPos += 4;

      // Section: Database Failure Rate 3NF & GSheet
      checkPageBreak(45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('4. PANDUAN DATABASE FAILURE RATE (3NF) & GSHEET MATRIX', margin, yPos);
      yPos += 6;

      const dbGuide = 
        'Modul ini mengimplementasikan normalisasi Third Normal Form (3NF) yang memisahkan data menjadi 6 tabel relasional: ' +
        'equipment_brands, equipment_platforms, equipment_models, equipment_branches, equipment_units, dan monthly_breakdown_metrics.\n\n' +
        'Fitur-Fitur Utama:\n' +
        '1. GSheet Pivot Drilldown: Navigasi bertingkat Brand -> Platform -> Model -> Eq Number dengan kolom bulan Jan s/d Agu.\n' +
        '2. Toggle Nilai Persen / Desimal: Pilihan tampilan fleksibel antara 1.25% atau 0.0125.\n' +
        '3. Form Transaksional: Tombol "+ Log Breakdown" untuk entri jam kerusakan dan "+ Unit Eq" untuk pendaftaran armada.\n' +
        '4. Mobile Touch Cards: Tampilan kartu interaktif yang dioptimalkan untuk inspektur lapangan via ponsel.';
      const splitDb = doc.splitTextToSize(dbGuide, contentWidth);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(splitDb, margin, yPos);
      yPos += splitDb.length * 4.2 + 6;

      // Section: Siklus Work Order & QR Code
      checkPageBreak(45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('5. SIKLUS WORK ORDER (WO) & STIKER BARCODE / QR CODE', margin, yPos);
      yPos += 6;

      const woSteps = [
        { step: 'Langkah 1: Penerbitan SPK', text: 'Koordinator membuat WO baru, memilih unit aset, tipe PM/CM, prioritas, dan target SLA.' },
        { step: 'Langkah 2: Eksekusi Teknisi', text: 'Teknisi memindai QR Code alat, mencentang checklist inspeksi, dan menginput suku cadang.' },
        { step: 'Langkah 3: Pemotongan Stok', text: 'Sistem memotong kuantitas suku cadang secara otomatis dari gudang terkait.' },
        { step: 'Langkah 4: Approval Supervisor', text: 'Supervisor (Ihwan Suryadi,ST.) memeriksa hasil kerja dan melakukan persetujuan resmi (Approve).' },
      ];

      woSteps.forEach(w => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(79, 70, 229); // indigo-600
        doc.text(w.step, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const wText = doc.splitTextToSize(w.text, contentWidth - 45);
        doc.text(wText, margin + 45, yPos);
        yPos += wText.length * 4 + 2;
      });

      yPos += 6;

      // Section: Panduan Integrasi Netlify Cloud DB
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('6. INTEGRASI BASIS DATA CLOUD NETLIFY & NEON POSTGRES', margin, yPos);
      yPos += 6;

      const netlifyInfo = 
        'Aplikasi ini mendukung koneksi langsung ke PostgreSQL Serverless di Netlify via variabel DATABASE_URL. ' +
        'File konfigurasi "netlify.toml" telah disiapkan untuk merutekan API Serverless di "/.netlify/functions/failure-rate" ' +
        'sehingga data transaksi tersimpan permanen dan aman di cloud berlatensi rendah (Region Singapore).';
      const splitNetlify = doc.splitTextToSize(netlifyInfo, contentWidth);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(splitNetlify, margin, yPos);
      yPos += splitNetlify.length * 4.2 + 8;

      // Footer Box
      checkPageBreak(25);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('Dokumentasi Resmi Sistem EAMS Enterprise | https://aset1.netlify.app/', margin + 5, yPos + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Diterbitkan untuk Operasional Lapangan, Tim Pemeliharaan, dan Manajemen Keandalan Industri.', margin + 5, yPos + 14);

      // Save PDF
      doc.save('EAMS_Buku_Panduan_Pengoperasian_v1.0.pdf');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const chapters = [
    {
      id: 'intro',
      title: '1. Pendahuluan & Filosofi EAMS',
      icon: BookOpen,
      badge: 'Overview',
      content: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-base">Tujuan Utama Sistem</h4>
              <p className="text-xs text-blue-200 mt-1">
                Enterprise Asset Management System (EAMS) & Cockpit Keandalan Industri diciptakan untuk mentransformasi tata kelola armada alat berat menjadi presisi, terpantau secara real-time, bebas dari kegagalan dadakan, dan terintegrasi 100% dari level teknisi lapangan hingga pengambil keputusan eksekutif.
              </p>
            </div>
          </div>

          <h3 className="text-base font-bold text-white pt-2">Pilar Utama Sistem EAMS:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-sky-400 text-xs flex items-center gap-1.5 mb-1">
                <Activity className="w-4 h-4" />
                Reliability & SLA Compliance
              </h4>
              <p className="text-xs text-slate-400">
                Pemantauan MTTR, MTBF, Breakdown Rate, dan Availability Factor dengan countdown batas waktu SLA yang mencegah keterlambatan perbaikan.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 mb-1">
                <Database className="w-4 h-4" />
                3NF Relational Data Architecture
              </h4>
              <p className="text-xs text-slate-400">
                Struktur data 6 tabel terpisah (Brand, Platform, Model, Branch, Unit, Metrics) yang menjamin integritas referensial tanpa duplikasi.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5 mb-1">
                <QrCode className="w-4 h-4" />
                Digital QR Code & Mobile Touch
              </h4>
              <p className="text-xs text-slate-400">
                Pencetakan stiker QR Code fisik untuk unit dan pemindaian cepat via kamera HP teknisi di lapangan.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-indigo-400 text-xs flex items-center gap-1.5 mb-1">
                <Calculator className="w-4 h-4" />
                Financial Asset Valuation
              </h4>
              <p className="text-xs text-slate-400">
                Simulasi otomatis depresiasi Garis Lurus & Saldo Menurun dengan tabel amortisasi bulanan dan ekspor CSV.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rbac',
      title: '2. Manajemen Peran & Otoritas (RBAC)',
      icon: ShieldCheck,
      badge: 'Otorisasi',
      content: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            EAMS menerapkan <strong>Role-Based Access Control (RBAC)</strong> multi-tingkat untuk memastikan setiap tindakan terekam pada audit trail dan hanya dapat dieksekusi oleh staf yang berwenang.
          </p>

          <div className="space-y-3">
            {[
              {
                role: 'Administrator',
                user: 'Master Admin',
                color: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
                tasks: 'Konfigurasi penuh sistem, manajemen skema tabel basis data, pengelolaan pengguna, dan pemantauan audit log menyeluruh.'
              },
              {
                role: 'Operational Supervisor',
                user: 'Ihwan Suryadi,ST.',
                color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
                tasks: 'Verifikasi kualitas pekerjaan pemeliharaan, otorisasi/approval Work Order selesai, dan persetujuan pengajuan mutasi aset antar cabang.'
              },
              {
                role: 'Maintenance Coordinator',
                user: 'Budi Santoso',
                color: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
                tasks: 'Penerbitan Surat Perintah Kerja (SPK/WO), alokasi mekanik lapangan, penentuan prioritas PM/CM, dan monitoring SLA.'
              },
              {
                role: 'Field Mechanic / Teknisi',
                user: 'Agus Pratama & Tim Lapangan',
                color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
                tasks: 'Penerimaan tugas lapangan, pengisian checklist inspeksi, pencatatan jam kerusakan, serta input suku cadang yang digunakan.'
              },
              {
                role: 'Warehouse Specialist',
                user: 'Siti Rahmawati',
                color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
                tasks: 'Penerimaan stok suku cadang baru (Restock), pemantauan ambang batas minimum part kritis, dan opname stok gudang.'
              },
              {
                role: 'Asset Specialist',
                user: 'Dewi Lestari',
                color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
                tasks: 'Registrasi unit armada baru, generate stiker QR Code, dan kalkulasi jadwal depresiasi aset keuangan.'
              }
            ].map(r => (
              <div key={r.role} className={`p-4 rounded-xl border ${r.color} flex flex-col sm:flex-row sm:items-start justify-between gap-3`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{r.role}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {r.user}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{r.tasks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'cockpit',
      title: '3. Cockpit KPI Perawatan & Filter Slicer',
      icon: Activity,
      badge: 'Monitoring',
      content: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Menu <strong>"Cockpit KPI Perawatan"</strong> menyajikan pusat komando analitik keandalan secara visual dengan indikator standar industri:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sky-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                MTTR (Mean Time to Repair) &lt;= 48 Jam
              </h4>
              <p className="text-xs text-slate-400">
                Rata-rata durasi yang dibutuhkan dari saat unit dilaporkan rusak hingga kembali beroperasi. Status: <strong>16.4 Jam (Excellent)</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                Unplanned Failure Rate &lt;= 40%
              </h4>
              <p className="text-xs text-slate-400">
                Persentase kerusakan tak terjadwal. Klik kartu untuk melihat analisis Pareto akar penyebab kerusakan (Electrical, Hydraulic, Engine).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Breakdown Rate in Warehouse &lt;= 10%
              </h4>
              <p className="text-xs text-slate-400">
                Pemantauan kesehatan unit cadangan di gudang (West JKT: 1%, Semarang: 5%, Surabaya: 0%, Batam: 4%). Total: 2.4% (Excellent).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-indigo-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Availability & Reliability Factors
              </h4>
              <p className="text-xs text-slate-400">
                Ketersediaan operasional unit per cabang (Rata-rata 99.1% Ketersediaan, 91.7% Keandalan).
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'matrix',
      title: '4. Database Failure Rate (3NF) & Matriks GSheet',
      icon: Database,
      badge: 'Core Matrix',
      content: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Menu <strong>"Database Failure Rate (3NF)"</strong> mereplikasi 100% tampilan Google Sheet dengan drilldown dinamis dan database relasional berkinerja tinggi:
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Hirarki Drilldown Matriks Pivot
            </h4>
            <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800">
              [+] BRAND (DINGLI / GENIE / TOYOTA)<br />
              &nbsp;&nbsp;└── [+] PLATFORM (26m RT Boom / 14m Electric)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── [+] MODEL (BT26RT / Z-45/25)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── [+] STORE OWN (JKT_AWP / SMG_AWP)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── UNIT NUMBER (AWP26-101 / AWP26-102)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">Toggle Persen vs Desimal</span>
              <p className="text-slate-400">Ganti tampilan nilai matriks dari format Persen (1.43%) menjadi Desimal (0.0143) secara instan.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">+ Log Breakdown</span>
              <p className="text-slate-400">Input jam kerusakan per unit bulanan. Sistem otomatis menghitung Failure Rate = (Jam Rusak / 70 Jam Kerja).</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'workorders',
      title: '5. Siklus Work Order, Checklist & Pemakaian Suku Cadang',
      icon: Wrench,
      badge: 'Alur SPK',
      content: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Alur penerbitan dan penyelesaian Surat Perintah Kerja (SPK) terintegrasi dengan proteksi batas waktu SLA:
          </p>

          <div className="space-y-2">
            {[
              { num: '01', title: 'Koordinator Menerbitkan Tiket', desc: 'Memilih unit aset, jenis pemeliharaan (PM / CM), prioritas, dan menentukan teknisi pelaksana.' },
              { num: '02', title: 'Eksekusi Teknisi & Checklist', desc: 'Teknisi membuka tiket, memeriksa indikator kerusakan, dan mencentang item checklist yang sudah selesai dikerjakan.' },
              { num: '03', title: 'Pengambilan Suku Cadang', desc: 'Teknisi mencatat part yang dipasang. Stok di gudang otomatis terpotong sesuai kuantitas pemakaian.' },
              { num: '04', title: 'Penyelesaian & Approval', desc: 'Teknisi klik "Selesaikan Pekerjaan". Supervisor (Ihwan Suryadi,ST.) mereview dan memberikan approval final.' }
            ].map(s => (
              <div key={s.num} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 font-mono font-bold text-xs border border-blue-500/30 shrink-0">
                  {s.num}
                </span>
                <div>
                  <h4 className="font-bold text-white text-xs">{s.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'inventory',
      title: '6. Inventaris Suku Cadang & Mutasi Aset',
      icon: Boxes,
      badge: 'Logistik',
      content: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
              <Boxes className="w-4 h-4" />
              Kontrol Stok Kritis & Restock
            </h4>
            <p className="text-xs text-slate-400">
              Sistem secara otomatis menandai suku cadang yang berada di bawah batas minimum (*Minimum Threshold*) dengan badge merah berkedip. Staf gudang dapat melakukan penerimaan stok baru melalui tombol <strong>"+ Penerimaan Stok"</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
              <ArrowLeftRight className="w-4 h-4" />
              Mutasi Antar Lokasi Cabang
            </h4>
            <p className="text-xs text-slate-400">
              Pengiriman unit antar site (misalnya Jakarta ke Batam) menggunakan formulir mutasi bersiklus: Draft &rarr; In-Transit (Disetujui Supervisor) &rarr; Received (Dikonfirmasi site tujuan).
            </p>
          </div>
        </div>
      )
    }
  ];

  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChapterData = chapters.find(c => c.id === activeChapter) || chapters[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Official Documentation & User Manual
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              v1.0.4 Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Buku Panduan Pengoperasian Sistem (EAMS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Panduan komprehensif tata kelola aset industri, metrik keandalan mesin, alur Work Order, dan basis data relasional.
          </p>
        </div>

        {/* Action Buttons: PDF Download & Print */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-download-handbook-pdf"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xl transition-all ${
              downloadSuccess 
                ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
            }`}
          >
            {isGeneratingPdf ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Menyusun Dokumen PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>PDF Berhasil Diunduh!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Handbook (PDF)</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Cetak / Print</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Chapter Sidebar + Chapter Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation: Chapters */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari topik panduan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Daftar Bab Panduan
            </div>

            {filteredChapters.map(chapter => {
              const Icon = chapter.icon;
              const isActive = activeChapter === chapter.id;

              return (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold truncate">{chapter.title}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight shrink-0 ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {chapter.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Info Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Sertifikasi Kepatuhan Sistem</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Dokumen ini mengacu pada standar pemeliharaan industri ISO 55000 untuk manajemen aset fisik dan metrik keandalan operasional.
            </p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8" ref={printAreaRef}>
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            {/* Chapter Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <selectedChapterData.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    BAB AKTIF
                  </span>
                  <h2 className="text-lg font-black text-white">
                    {selectedChapterData.title}
                  </h2>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {selectedChapterData.badge}
              </span>
            </div>

            {/* Chapter Body */}
            <div>
              {selectedChapterData.content}
            </div>

            {/* Chapter Navigation Footer */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Sistem EAMS v1.0.4 Enterprise
              </div>

              <button
                onClick={handleDownloadPDF}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Unduh Seluruh Panduan (PDF)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
