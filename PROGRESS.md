# Enterprise Asset Management System (EAMS) - Progress & Architecture Documentation

## Ringkasan Proyek
Aplikasi Web Enterprise Asset Management System (EAMS) komprehensif untuk mengelola siklus hidup aset fisik perusahaan (alat berat pertambangan, mesin industri, genset, kendaraan operasional), manajemen work order pemeliharaan dengan target SLA, inventaris suku cadang gudang dengan ambang batas minimum, mutasi lokasi antar site proyek, kalkulator depresiasi finansial (Garis Lurus & Saldo Menurun), serta audit trail log transparan.

---

## Modul yang Telah Selesai Diimplementasikan:

### 1. Sistem Multi-Role RBAC (Role-Based Access Control)
- 6 Role spesifik industri dengan matriks hak akses ketat:
  - **Administrator** (`admin`): Hak akses tak terbatas ke seluruh modul dan konfigurasi.
  - **Operational Supervisor** (`supervisor`): Menyetujui Work Order yang telah diselesaikan teknisi dan menyetujui mutasi aset antar lokasi.
  - **Maintenance / Service Coordinator** (`service_coordinator`): Menerbitkan tiket Work Order, triage tingkat keparahan (SLA), dan penugasan teknisi.
  - **Asset Management Specialist** (`asset_specialist`): Input dan pembaruan master data aset, kalkulasi depresiasi nilai buku, dan audit fisik.
  - **Warehouse & Inventory Specialist** (`warehouse_specialist`): Manajemen stok suku cadang, batas minimum restock, dan konfirmasi mutasi masuk gudang.
  - **Field Mechanic / Technician** (`mechanic`): Eksekusi perbaikan lapangan, checklist inspeksi, pemakaian suku cadang, dan pelaporan resolusi teknis.

### 2. Dashboard Eksekutif & Visualisasi Data
- Kartu metrik kunci: Total Aset, Nilai Buku Terkini, Work Order Aktif, dan Suku Cadang Kritis.
- Grafik Interaktif Recharts:
  - Distribusi Status Operasional Aset (Pie Chart).
  - Valuasi Aset vs Akumulasi Depresiasi per Kategori (Bar Chart).
- Peringatan Cepat (Quick Alert Banners) untuk pelanggaran SLA dan stok kritis.
- Daftar tiket pemeliharaan prioritas tinggi dan mutasi terbaru.

### 3. Master Data Aset & Siklus Hidup (Asset Lifecycle)
- Tabel aset lengkap dengan filter status, kategori, kondisi fisik, dan lokasi site.
- Modal Detail Aset:
  - Ringkasan teknis & parameter finansial.
  - **QR Code Badge Generator**: Pembuatan QR Code otomatis dengan tombol Cetak Stiker Aset & Download PNG.
  - Riwayat Work Order dan Riwayat Mutasi lokasi khusus unit terkait.
- Modal Registrasi & Edit Master Aset baru.

### 4. Work Order Management & Pelacakan SLA
- Filter cerdas tiket berdasarkan status (`assigned`, `in_progress`, `completed`, `approved`, `rejected`) dan prioritas (`critical`, `high`, `medium`, `low`).
- Indikator SLA Countdown (visual color warning untuk tiket mendekati batas waktu SLA 4 jam/24 jam).
- **Checklist Inspeksi Interaktif**: Mekanik dapat mencentang item pekerjaan yang telah diselesaikan.
- **Atomic Spare Part Deduction**: Pemakaian suku cadang langsung menghitung biaya dan memotong stok gudang.
- **Approval Workflow Supervisor**: Panel verifikasi hasil kerja teknisi dan persetujuan penutupan tiket.

### 5. Manajemen Inventaris Gudang & Suku Cadang (Spare Parts)
- Monitoring batas minimum stok (Reorder Threshold Alerts).
- Modal Penerimaan Stok (Restock In) dan Pendaftaran Master Part baru.
- Valuasi total nilai inventaris suku cadang.
- Ekspor data katalog suku cadang ke format CSV.

### 6. Mutasi & Transfer Lokasi Aset Fisik
- Alur perpindahan unit: `Pending` ➔ `In-Transit` (disetujui Supervisor) ➔ `Completed` (konfirmasi kedatangan).
- Visual tracking asal lokasi, armada ekspedisi, dan lokasi tujuan transfer.

### 7. Mesin Kalkulasi Depresiasi Finansial (Straight Line & Declining Balance)
- Simulasi aset kustom atau kalkulasi master aset riil.
- Perhitungan Nilai Buku Saat Ini, Akumulasi Depresiasi, dan Beban Depresiasi Bulanan.
- Grafik kurva amortisasi nilai buku (Area Chart).
- Tabel jadwal lengkap amortisasi bulanan dengan fitur Ekspor CSV.
- Fitur sinkronisasi nilai buku serentak ke seluruh database.

### 8. Audit Trail & Log Kepatuhan (Immutable Logs)
- Pencatatan otomatis setiap aksi: pembuatan aset, penerbitan WO, approval supervisor, mutasi, dan restock.
- Modal Diff Data Inspector (melihat old values vs new values dalam format JSON).
- Fitur Ekspor Audit Trail ke CSV.

### 9. Pemindai Barcode / QR Code Scanner
- Dukungan kamera scanner video langsung serta pencarian manual barcode cepat.
- Navigasi instan ke kartu identitas aset yang dipindai.

### 10. Industrial Maintenance & Reliability Analytics Cockpit (Sesuai Referensi Gambar ihwan1.jpg)
- **Interactive Slicers Panel**:
  - Filter Periode Bulan (`Jan` s/d `Dec` multi-select toggle).
  - Filter Branch / Divisi (`Batam_AWP`, `Jakarta_Electricity`, `Semarang_AWP`, `Surabaya_AWP`, `West Jakarta_AWP`, `North Jakarta_AWP`, dll).
  - Filter Lokasi (`Customer` vs `In Warehouse`).
  - Filter Status WO (`Completed`, `Completion reported`, `To be dispatched`, `Voided`).
  - Filter Pekan Operasi / Week (`Week 19` s/d `Week 33`).
- **MTTR (Mean Time to Repair) Engine**:
  - Target `<= 48 jam` (Aktual `16.4 jam` - Status: `EXCELLENT`).
  - Total Breakdown Hours (`6,546 jam`) dan Volume Tiket CM (`399 WO`).
  - Grafik tren harian interaktif dan modal drilldown mendalam per nomor tiket & unit.
- **Unplanned Failure Rate Analytics**:
  - Target `<= 40%` (Aktual `91%` - Status: `BAD`).
  - Perbandingan Tiket CM (`926`) vs Total Tiket Dibuat (`1,016`).
  - Grafik tren kenaikan Jul-Aug dan modal analisis Pareto akar permasalahan teknis.
- **Repair Maintenance Percentage (PM vs CM)**:
  - Benchmark target PM 60% : CM 40% (Aktual: PM 8.9% - 90 tiket vs CM 91% - 926 tiket).
  - Progress bar visualisasi proporsi pemeliharaan preventif vs korektif.
- **PM & CM Compliance Tracking**:
  - PM Compliance: 78.9% dari 90 tiket dibuat (71 selesai, 19 outstanding/voided).
  - CM Compliance: 90% dari 926 tiket dibuat (838 selesai, 88 outstanding/voided).
  - Modal tabel detail kepatuhan dan status penyelesaian.
- **Breakdown Rate in Warehouse**:
  - Target `<= 10%` (`Excellent`).
  - Pemantauan per cabang: West JKT (3 unit - 1%), Semarang (7 unit - 5%), Surabaya (0 unit - 0%), Batam (3 unit - 4%).
  - Total gudang: 13 unit breakdown dari 544 unit di gudang (2.4%).
- **MTBF (Mean Time Between Failure)**:
  - AWP MTBF: `228.6 jam/minggu` (`Excellent`).
  - Forklift MTBF: Monitoring jam operasional bebas gangguan.
- **Availability & Reliability Factors**:
  - Availability Factor: Rata-rata 99.1% `EXCELLENT` dengan rincian 6 cabang.
  - Reliability Factor: Rata-rata 91.7% `GOOD` dengan deteksi cabang di bawah standar (Semarang 78.6% `BAD`).

### 11. Pembaruan Profil & Otorisasi Pengguna Terintegrasi
- Pergantian nama user role **Operational Supervisor** dari *Ir. Hendra Gunawan* menjadi **Ihwan Suryadi,ST.**.
- Mekanisme auto-migration data penyimpanan lokal (`localStorage`) untuk sinkronisasi nama supervisor secara transparan ke seluruh riwayat sesi pengguna.

### 12. Basis Data Relasional 3NF & GSheet Failure Rate Matrix (Netlify / Mobile-Ready)
- **Arsitektur Relasional Tanpa Redundansi (Third Normal Form - 3NF)**:
  - `equipment_brands` (PK `id`, `code`, `name`, `country_origin`)
  - `equipment_platforms` (PK `id`, FK `brand_id`, `name`, `unit_type`)
  - `equipment_models` (PK `id`, FK `platform_id`, `model_name`, `rated_capacity`, `power_source`)
  - `equipment_branches` (PK `id`, `store_code`, `store_name`, `region`, `is_warehouse`)
  - `equipment_units` (PK `id`, `eq_number` [Unique], FK `model_id`, FK `store_id`, `serial_number`, `status`)
  - `monthly_breakdown_metrics` (PK `id`, FK `equipment_id`, `period_year`, `period_month`, `breakdown_hours`, `breakdown_rate`, `pm_count`, `cm_count`)
- **4 Mode Tampilan Interaktif & Responsif Seluler**:
  1. **100% GSheet Pivot Matrix**: Tabel drilldown bertingkat (Brand ➔ Platform ➔ Model ➔ Eq Number) dengan kolom bulan `Jan`, `Feb`, `Mar`, `Apr`, `Mei`, `Jun`, `Jul`, `Agu`, dan `Total Keseluruhan`, disertai pengkodean warna indikator performa dan toggle format Persen (%) vs Desimal (0.xx).
  2. **Tabel Relasional Explorer (3NF)**: Penjelajah 6 tabel terpisah dengan primary key, foreign key badge, pencarian cepat, dan penyaringan multi-site.
  3. **Visual Entity-Relationship Diagram (ERD & Data Dictionary)**: Kartu skema visual relasi `1:N` antar tabel serta generator skrip SQL DDL (PostgreSQL / MySQL / Supabase) dengan fitur Salin SQL.
  4. **Mobile Touch Cards**: Tampilan kartu swipeable ramah layar sentuh smartphone untuk pemantauan breakdown rate alat berat di lapangan secara cepat.
- **Panduan Terintegrasi Netlify DB**: Tab panduan 5 langkah dengan tombol salin `.env`, skrip DDL SQL, dan dual-layer cache.

### 13. Dokumentasi Logical Record Structure (LRS) Basis Data EAMS
- **Katalog Entitas LRS Teks Lengkap**:
  - Transformasi ERD ke LRS dengan notasi relasional standard (`PK`, `*FK`).
  - Diagram relasi teks kardinalitas antar tabel (1:1, 1:N, M:N).
  - Kamus Data & Atribut tipe data PostgreSQL/MySQL standar industri.

### 14. Modul Buku Panduan Interaktif & Generator Dokumen PDF (Handbook)
- **Menu Buku Panduan (PDF)**:
  - Viewer panduan multi-bab (Filosofi, RBAC, Cockpit KPI, Matrix Failure Rate 3NF, Siklus SPK, Gudang & Mutasi).
  - Generator PDF instan berbasis `jsPDF` untuk menghasilkan file `EAMS_Buku_Panduan_Pengoperasian_v1.0.pdf` resolusi cetak dengan satu klik.
  - Fitur pencarian bab panduan dan integrasi tombol cetak (Print).





