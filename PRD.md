# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Enterprise Asset Management System (EAMS) & Industrial Reliability Analytics Cockpit

---

### Dokumen Kontrol
| Parameter | Keterangan |
| :--- | :--- |
| **Nama Produk** | Enterprise Asset Management System (EAMS) |
| **Versi Dokumen** | 1.0.0 (Full-Stack Architecture Edition) |
| **Status** | Approved for Development & Production Deployment |
| **Target Rilis** | Web Responsive, PWA Mobile & Serverless Netlify Cloud |
| **Database Engine** | PostgreSQL 16 / Neon Serverless (3NF Normalization) |
| **Otoritas Sistem** | Operational Supervisor: **Ihwan Suryadi, ST.** |

---

## 1. Executive Summary & Visi Produk

### 1.1 Latar Belakang & Problem Statement
Operasional persewaan dan pemeliharaan alat berat (seperti *Aerial Work Platform* / AWP, Genset, Forklift, dan Excavator) melintasi berbagai cabang (*multi-branch sites*) sering kali menghadapi kendala:
1. **Tingginya Jam Kerusakan Tak Terjadwal (*Unplanned Breakdown*)**: Tidak adanya visibilitas real-time terhadap rasio kerusakan bulanan (*Monthly Breakdown Rate*).
2. **Keterlambatan Penanganan Tiket (SLA Breach)**: Kurangnya sistem *countdown* waktu perbaikan dan eskalasi terstruktur.
3. **Ketidaksinkronan Stok Suku Cadang**: Penggunaan spare part di lapangan sering kali tidak memotong stok gudang secara otomatis (*inventory leakage*).
4. **Data Redundan & Tersebar**: Riwayat perawatan dan metrik keandalan masih mengandalkan spreadsheet manual yang rentan terhadap inkonsistensi data.

### 1.2 Visi & Solusi Sistem
Membangun sistem **Full-Stack Enterprise Asset Management System (EAMS)** yang menggabungkan:
* **Cockpit Keandalan Industri**: Pemantauan visual MTTR ($\le 48\text{ jam}$), MTBF ($\ge 220\text{ jam}$), Breakdown Rate ($\le 10\%$), dan Availability Factor ($> 95\%$).
* **Basis Data Relasional 3NF & GSheet Pivot Matrix**: Penyajian data drilldown (*Brand $\rightarrow$ Platform $\rightarrow$ Model $\rightarrow$ Store Own $\rightarrow$ Eq Number*) dengan performa kueri berkecepatan tinggi.
* **Integrasi Lapangan Mobile Touch & Stiker QR Code**: Kemudahan teknisi memindai unit di lapangan, mengisi checklist inspeksi, dan mencatat pergantian suku cadang secara *real-time*.

---

## 2. Struktur Pengguna & Role-Based Access Control (RBAC)

Sistem menerapkan arsitektur otorisasi 6-tingkat berbasis token/peran yang terenkripsi:

```
                  ┌─────────────────────────────────┐
                  │          ADMINISTRATOR          │
                  │ (Full System & Data Governance) │
                  └────────────────┬────────────────┘
                                   │
                  ┌────────────────▼────────────────┐
                  │     OPERATIONAL SUPERVISOR      │
                  │       (Ihwan Suryadi, ST.)      │
                  │   (WO Approval & Mutasi Aset)   │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
┌────────▼────────┐       ┌────────▼────────┐       ┌────────▼────────┐
│   MAINTENANCE   │       │ FIELD MECHANIC  │       │    WAREHOUSE    │
│   COORDINATOR   │       │   / TECHNICIAN  │       │   SPECIALIST    │
│ (SPK & SLA Mgmt)│       │(Checklist & Rep)│       │ (Spare Parts &  │
└─────────────────┘       └─────────────────┘       │    Restock)     │
                                                    └─────────────────┘
```

| Peran (Role) | Pejabat Default | Izin & Tanggung Jawab Operasional |
| :--- | :--- | :--- |
| **Administrator** | Master Admin | Konfigurasi sistem, manajemen skema DDL database, manajemen user, dan inspeksi audit trail penuh. |
| **Operational Supervisor** | **Ihwan Suryadi, ST.** | Validasi kepatuhan SLA, **Approval Final Work Order** (status `Completed` $\rightarrow$ `Approved`), serta otorisasi mutasi armada. |
| **Maintenance Coordinator** | Koordinator Servis | Penerbitan SPK/Work Order baru (PM & CM), alokasi teknisi lapangan, dan monitoring SLA countdown. |
| **Field Mechanic / Teknisi** | Teknisi Lapangan | Pemindaian QR Code unit, pengisian checklist inspeksi, pencatatan durasi jam kerusakan, dan pemakaian spare part. |
| **Warehouse Specialist** | Staf Gudang | Penerimaan suku cadang (*Restock*), penyesuaian stok minimum (*Min Threshold*), dan monitoring stok kritis. |
| **Asset Specialist** | Tim Manajemen Aset | Pendaftaran unit armada baru, generate stiker QR Code fisik, dan kalkulasi jadwal depresiasi nilai buku. |

---

## 3. Arsitektur Full-Stack & Aliran Data (Data Flow Architecture)

### 3.1 Arsitektur Tiga Lapis (Three-Tier Full-Stack Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT PRESENTATION LAYER                       │
│  - React 18 + TypeScript + Vite + Tailwind CSS                              │
│  - State Engine: Context API + Reactive IndexedDB / LocalStorage Dual-Cache │
│  - Data Visualizer: Recharts + Lucide Icons + jsPDF Engine                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / REST API / Serverless Calls
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVER & API PROXY LAYER                         │
│  - Node.js Runtime (ESM/CommonJS Bundle)                                    │
│  - Express REST Backend / Netlify Serverless Functions (/api/failure-rate)   │
│  - Middlewares: CORS, Rate Limiting, JSON Body Parser, Error Boundary       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ SQL Connection Pooling (SSL Encrypted)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE PERSISTENCE LAYER                        │
│  - PostgreSQL 16 (Neon Serverless / Cloud SQL / Supabase)                   │
│  - Third Normal Form (3NF) Relational Model                                 │
│  - ACID Transactional Integrity + Foreign Key Cascades                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Spesifikasi Fungsional Per Modul

### Modul 1: Cockpit KPI Keandalan Mesin (*Industrial Reliability*)
* **Filter Slicer Multi-Dimensi**:
  * Filter Periode Bulan (Januari s/d Desember).
  * Filter Lokasi Operasional (*Customer Site* vs *In Warehouse*).
  * Filter Status Work Order (*Completed*, *Reported*, *Dispatched*, *Voided*).
  * Filter Cabang (*Store Own*: Batam, Jakarta, Semarang, Surabaya, West JKT).
  * Filter Minggu (*Week Slicer*: W19 s/d W32).
* **Kartu Indikator KPI Utama**:
  * **MTTR (Mean Time to Repair)**: Ambang batas $\le 48.0\text{ jam}$ (*Aktual: 16.4 jam - Excellent*).
  * **Unplanned Failure Rate**: Ambang batas $\le 40.0\%$ (*Aktual: 91.0% - High Alert*) dengan diagram Pareto penyebab kerusakan (*Electrical, Hydraulic, Engine*).
  * **Proporsi PM vs CM**: Target ideal 70% Preventive : 30% Corrective.
  * **Breakdown Rate in Warehouse**: Ambang batas $\le 10.0\%$ (*Aktual: 2.4% - Excellent*).
  * **MTBF & Availability Factor**: Pemantauan keandalan unit beroperasi bebas gangguan.

### Modul 2: Database Failure Rate (3NF) & Matriks Pivot GSheet
* **Tampilan Matriks Pivot Dinamis**:
  * Replikasi 100% tata letak Google Sheet dengan navigasi hierarkis:
    $$\text{Brand} \longrightarrow \text{Platform} \longrightarrow \text{Model} \longrightarrow \text{Store Own} \longrightarrow \text{Eq Number}$$
  * Kolom agregasi bulanan (*Januari s/d Agustus*) dan Total Rata-rata Tahunan.
  * Pewarnaan indikator kondisi: **Hijau ($\le 1.0\%$)**, **Kuning ($1.1\% - 2.5\%$)**, **Merah ($> 2.5\%$)**.
* **Toggle Format Nilai**: Peralihan instan antara **Persen (1.25%)** dan **Desimal (0.0125)**.
* **Form Transaksional Terpadu**:
  * `+ Log Breakdown`: Pencatatan jam kerusakan bulanan dengan perhitungan otomatis:
    $$\text{Breakdown Rate} = \frac{\text{Jam Kerusakan Bulanan}}{70\text{ Jam Terjadwal}}$$
  * `+ Unit Eq`: Pendaftaran nomor lambung aset baru dengan validasi integritas referensial FK.
* **Mobile Touch Cards View**: Tampilan kartu responsif ramah sentuhan untuk inspeksi cepat di lapangan.

### Modul 3: Manajemen Master Data Aset & Stiker QR Code
* **Katalog Aset Komprehensif**: Pencarian cepat, penyaringan per kategori, status, dan cabang.
* **Generator Stiker QR Code Fisik**:
  * Pembuatan otomatis payload QR Code unik per nomor aset (`AST-XXXX` / `AWP26-101`).
  * Fitur cetak label tahan cuaca (*Print Asset Label*) dan tombol unduh stiker dalam format PNG.

### Modul 4: Work Order (SPK), Checklist & Two-Step Approval
* **Siklus Hidup Tiket**:
  $$\text{Draft} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Completed} \longrightarrow \text{Approved}$$
* **SLA Real-time Countdown Timer**: Peringatan visual saat batas waktu perbaikan mendekati kadaluarsa.
* **Checklist Inspeksi Interaktif**: Daftar item pemeriksaan teknis yang harus diverifikasi teknisi sebelum menyelesaikan tiket.
* **Pemotongan Stok Suku Cadang Otomatis**: Setiap suku cadang yang dimasukkan teknisi pada tiket langsung mengurangi stok fisik di gudang.
* **Approval Resmi Supervisor**: Tiket yang berstatus `Completed` harus ditinjau dan disetujui (*Approved*) oleh **Ihwan Suryadi, ST.** sebelum resmi ditutup.

### Modul 5: Inventaris Suku Cadang & Peringatan Stok Kritis
* **Manajemen Multi-Kategori**: Mesin, Hidrolik, Elektrikal, Filter, Roda/Track, dan Pelumas.
* **Indikator Stok Kritis (*Min Threshold Alert*)**: Tanda visual merah berkedip untuk part yang stoknya $\le \text{Batas Minimum}$.
* **Transaksi Restock Masuk**: Formulir pencatatan kedatangan suku cadang baru dari vendor dengan update harga beli terkini.

### Modul 6: Mutasi Aset Antar Cabang
* **Alur Pengiriman Terverifikasi**:
  $$\text{Pengajuan Mutasi (Draft)} \longrightarrow \text{Otorisasi Supervisor (In-Transit)} \longrightarrow \text{Konfirmasi Penerimaan (Completed)}$$
* **Riwayat Mutasi**: Rekam jejak asal cabang, cabang tujuan, tanggal kirim, estimasi tiba, dan personil penanggung jawab.

### Modul 7: Valuasi Finansial & Kalkulator Depresiasi
* **Metode Garis Lurus (*Straight Line*)**:
  $$\text{Beban Depresiasi Tahunan} = \frac{\text{Harga Perolehan} - \text{Nilai Residu}}{\text{Masa Manfaat (Tahun)}}$$
* **Metode Saldo Menurun (*Double Declining Balance*)**:
  $$\text{Tarif Depresiasi} = \frac{100\%}{\text{Masa Manfaat}} \times 2$$
* **Fitur Tambahan**: Grafik kurva amortisasi nilai buku, tabel jadwal depresiasi bulanan, dan ekspor CSV.

### Modul 8: Pemindai Barcode / QR Mobile
* Integrasi kamera perangkat untuk pemindaian instan stiker QR Code fisik di lapangan.
* Pembacaan otomatis nomor aset yang langsung membuka lembar riwayat servis unit terkait.

### Modul 9: Audit Trail & Telemetri Sistem
* *Immutable Ledger* yang mencatat setiap aksi sistem: Pembuatan tiket, approval, perubahan stok, mutasi aset, penambahan unit, dan riwayat login pengguna lengkap dengan stempel waktu (*timestamp*) presisi.

### Modul 10: Buku Panduan Resmi & Generator Dokumen PDF
* Viewer panduan pengoperasian terstruktur multi-bab.
* Generator dokumen PDF instan (*Client-Side Rendering via jsPDF*) untuk mengunduh `EAMS_Buku_Panduan_Pengoperasian_v1.0.pdf` resolusi cetak dengan satu klik.

---

## 5. Skema Relasional Basis Data (3NF & LRS)

```sql
-- 1. Master Brand
CREATE TABLE equipment_brands (
    id SERIAL PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    country_origin VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Platform Kategori
CREATE TABLE equipment_platforms (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES equipment_brands(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    unit_type VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Model Spesifikasi
CREATE TABLE equipment_models (
    id SERIAL PRIMARY KEY,
    platform_id INTEGER NOT NULL REFERENCES equipment_platforms(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    rated_capacity VARCHAR(100),
    power_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cabang / Lokasi Operasional
CREATE TABLE equipment_branches (
    id SERIAL PRIMARY KEY,
    store_code VARCHAR(32) NOT NULL UNIQUE,
    store_name VARCHAR(100) NOT NULL,
    region VARCHAR(64),
    is_warehouse BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Unit Fisik Armada
CREATE TABLE equipment_units (
    id SERIAL PRIMARY KEY,
    eq_number VARCHAR(64) NOT NULL UNIQUE,
    serial_number VARCHAR(100) NOT NULL,
    model_id INTEGER NOT NULL REFERENCES equipment_models(id),
    store_id INTEGER NOT NULL REFERENCES equipment_branches(id),
    year_manufactured INTEGER,
    status VARCHAR(32) DEFAULT 'operational',
    total_operating_hours NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Metrik Kerusakan Bulanan (Time-Series)
CREATE TABLE monthly_breakdown_metrics (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment_units(id) ON DELETE CASCADE,
    period_year INTEGER NOT NULL,
    period_month VARCHAR(16) NOT NULL,
    breakdown_hours NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_scheduled_hours NUMERIC(10, 2) NOT NULL DEFAULT 70.0,
    pm_count INTEGER DEFAULT 0,
    cm_count INTEGER DEFAULT 0,
    breakdown_rate NUMERIC(6, 4) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_equipment_period UNIQUE(equipment_id, period_year, period_month)
);

-- Indeks Performa Kueri
CREATE INDEX idx_units_model ON equipment_units(model_id);
CREATE INDEX idx_units_store ON equipment_units(store_id);
CREATE INDEX idx_metrics_period ON monthly_breakdown_metrics(period_year, period_month);
```

---

## 6. Spesifikasi Kontrak REST API

### 6.1 Endpoint Failure Rate & Database Relasional
* **`GET /api/failure-rate`**: Mengambil data gabungan (*Multi-Table JOIN*) matriks breakdown rate.
* **`POST /api/failure-rate/log`**: Mencatat jam breakdown baru untuk unit tertentu.
* **`POST /api/equipment/unit`**: Mendaftarkan unit armada baru ke dalam sistem.

### 6.2 Endpoint Work Order & Inventory
* **`GET /api/work-orders`**: Mengambil daftar tiket pemeliharaan lengkap dengan status SLA.
* **`POST /api/work-orders`**: Membuat tiket SPK baru.
* **`PUT /api/work-orders/:id/approve`**: Otorisasi approval tiket oleh Supervisor (**Ihwan Suryadi, ST.**).
* **`POST /api/inventory/deduct`**: Pemotongan kuantitas suku cadang berbasis transaksi atomic.

---

## 7. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Performa & Kecepatan**:
   * P95 Response Time API: $< 200\text{ ms}$.
   * Ketersediaan Sistem (*Uptime SLA*): $99.9\%$.
   * Dukungan *Dual-Layer Local/Cloud Cache* untuk respons instan $< 10\text{ ms}$ pada antarmuka pengguna.
2. **Keamanan & Otorisasi**:
   * Enkripsi data in-transit menggunakan TLS/HTTPS 1.3.
   * Isolasi kredensial basis data di lingkungan serverless via variabel environment (`DATABASE_URL`).
   * Pencegahan SQL Injection melalui *Parameterized Queries*.
3. **Kompatibilitas & Desain Responsif (UI/UX)**:
   * Desain *Mobile-First Touch Target* dengan area ketuk minimum $44\text{ px}$.
   * Dukungan resolusi layar: Smartphone (360px–480px), Tablet (768px–1024px), dan Desktop Ultra-Wide (>1280px).
   * Tema visual bernuansa *Dark Industrial Cockpit* dengan kontras tinggi sesuai standar aksesibilitas WCAG AA.

---

## 8. Panduan Deployment & Konfigurasi Lingkungan

### 8.1 File Konfigurasi Netlify (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 8.2 Deklarasi Environment Variables (`.env.example`)
```env
# Database Connection URI (Neon Serverless PostgreSQL / Cloud SQL)
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-123.ap-southeast-1.aws.neon.tech/eams_db?sslmode=require

# Application Mode
NODE_ENV=production
```

---

## 9. Rencana Pemeliharaan & Skalabilitas Masa Depan
1. **Integrasi Sensor IoT Telemetri**: Pembacaan jam kerja (*Hour Meter*) otomatis langsung dari unit genset dan AWP melalui modul GPS/CAN-Bus.
2. **AI Predictive Maintenance**: Analisis pola kerusakan masa lalu menggunakan machine learning untuk memprediksi kegagalan komponen sebelum terjadi.
3. **PWA Offline Sync**: Penyimpanan tiket offline saat teknisi bertugas di area tambang tanpa sinyal seluler, dengan sinkronisasi otomatis saat kembali online.
