import { 
  Role, User, Category, Asset, SparePart, WorkOrder, 
  WorkOrderItem, AssetMovement, AuditLog, RoleName 
} from '../types/eams';
import { AssetDepreciationService } from './depreciation';

const DB_KEY = 'eams_database_v1.0';

export interface DatabaseState {
  roles: Role[];
  users: User[];
  categories: Category[];
  assets: Asset[];
  spare_parts: SparePart[];
  work_orders: WorkOrder[];
  work_order_items: WorkOrderItem[];
  asset_movements: AssetMovement[];
  audit_logs: AuditLog[];
}

const INITIAL_ROLES: Role[] = [
  { id: 1, name: 'admin', display_name: 'System Administrator', description: 'Tata kelola user, konfigurasi sistem, audit log global, master permission, backup & restore.' },
  { id: 2, name: 'supervisor', display_name: 'Operational Supervisor', description: 'Validasi & approval Work Order, approval mutasi antar cabang/site, persetujuan disposal, analytics dashboard.' },
  { id: 3, name: 'service_coordinator', display_name: 'Service Coordinator', description: 'Triage kerusakan, pembuatan Work Order, penugasan teknisi/mekanik, monitoring SLA perbaikan.' },
  { id: 4, name: 'asset_specialist', display_name: 'Asset Specialist', description: 'Registrasi master aset, tagging QR/Barcode, kalkulasi depresiasi bulanan/tahunan, audit fisik (stock opname aset).' },
  { id: 5, name: 'warehouse_specialist', display_name: 'Warehouse Specialist', description: 'Mutasi fisik masuk/keluar, penerimaan spare part, reservasi suku cadang untuk Work Order, stock control.' },
  { id: 6, name: 'mechanic', display_name: 'Field Mechanic / Technician', description: 'Eksekusi Work Order, checklist inspeksi, request suku cadang ke gudang, pelaporan log teknis & breakdown.' },
];

const INITIAL_USERS: User[] = [
  { id: 1, role_id: 1, role: 'admin', role_display_name: 'System Administrator', name: 'Bambang Pratama', email: 'admin@eams-enterprise.com', phone: '+62 811-2345-6701', status: 'active' },
  { id: 2, role_id: 2, role: 'supervisor', role_display_name: 'Operational Supervisor', name: 'Ihwan Suryadi,ST.', email: 'supervisor@eams-enterprise.com', phone: '+62 812-3456-7802', status: 'active' },
  { id: 3, role_id: 3, role: 'service_coordinator', role_display_name: 'Service Coordinator', name: 'Siti Rahmawati, S.T.', email: 'coordinator@eams-enterprise.com', phone: '+62 813-9876-5403', status: 'active' },
  { id: 4, role_id: 4, role: 'asset_specialist', role_display_name: 'Asset Specialist', name: 'Dewi Lestari, S.E.', email: 'asset.specialist@eams-enterprise.com', phone: '+62 815-4567-8904', status: 'active' },
  { id: 5, role_id: 5, role: 'warehouse_specialist', role_display_name: 'Warehouse Specialist', name: 'Rudi Hartono', email: 'warehouse@eams-enterprise.com', phone: '+62 817-6543-2105', status: 'active' },
  { id: 6, role_id: 6, role: 'mechanic', role_display_name: 'Field Mechanic', name: 'Agus Setiawan (Senior)', email: 'agus.mechanic@eams-enterprise.com', phone: '+62 818-1122-3306', status: 'active' },
  { id: 7, role_id: 6, role: 'mechanic', role_display_name: 'Field Mechanic', name: 'Dedi Kurniawan (Electrical)', email: 'dedi.mechanic@eams-enterprise.com', phone: '+62 819-3344-5507', status: 'active' },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, code: 'CAT-HE', name: 'Heavy Equipment (Alat Berat)', useful_life_years: 8, depreciation_method: 'straight_line' },
  { id: 2, code: 'CAT-MACH', name: 'Production Machinery (Mesin Pabrik)', useful_life_years: 10, depreciation_method: 'straight_line' },
  { id: 3, code: 'CAT-LOG', name: 'Logistics Fleet (Armada Transportasi)', useful_life_years: 5, depreciation_method: 'declining_balance' },
  { id: 4, code: 'CAT-IT', name: 'IT & Data Center Infrastructure', useful_life_years: 4, depreciation_method: 'straight_line' },
  { id: 5, code: 'CAT-FAC', name: 'Facilities & Utilities', useful_life_years: 12, depreciation_method: 'straight_line' },
];

const INITIAL_ASSETS: Asset[] = [
  {
    id: 1,
    category_id: 1,
    asset_code: 'AST-HE-001',
    name: 'Hydraulic Excavator Komatsu PC200-8M0',
    serial_number: 'KM-PC200-98421',
    purchase_date: '2023-01-15',
    purchase_cost: 1850000000,
    residual_value: 250000000,
    current_book_value: 1250000000,
    status: 'deployed',
    condition_status: 'good',
    current_location: 'Site Tambang Morowali - Sektor A',
    assigned_user_id: 6,
    specs: { 'Engine': 'SAA6D107E-1 (148 HP)', 'Bucket Capacity': '0.93 m3', 'Operating Weight': '19,800 kg' },
    last_maintenance_date: '2026-08-10',
    next_preventive_date: '2026-10-10'
  },
  {
    id: 2,
    category_id: 2,
    asset_code: 'AST-MC-002',
    name: 'CNC 5-Axis Milling Machine DMG MORI DMU 50',
    serial_number: 'DMG-50-2022-771',
    purchase_date: '2022-06-20',
    purchase_cost: 3200000000,
    residual_value: 400000000,
    current_book_value: 2020000000,
    status: 'under_maintenance',
    condition_status: 'degraded',
    current_location: 'Pabrik Manufaktur Cikarang - Bay 3',
    assigned_user_id: 7,
    specs: { 'Spindle Speed': '20,000 rpm', 'Control': 'CELOS with SIEMENS', 'Table Size': '630 x 500 mm' },
    last_maintenance_date: '2026-07-28',
    next_preventive_date: '2026-09-25'
  },
  {
    id: 3,
    category_id: 3,
    asset_code: 'AST-FL-003',
    name: 'Heavy Duty Prime Mover Hino Profia 700 Series',
    serial_number: 'HN-PRF-66381',
    purchase_date: '2024-03-10',
    purchase_cost: 1450000000,
    residual_value: 200000000,
    current_book_value: 841000000,
    status: 'deployed',
    condition_status: 'good',
    current_location: 'Logistics Hub Tanjung Priok - Jakarta',
    assigned_user_id: 6,
    specs: { 'GVW': '45,000 kg', 'Engine': 'E13C-TI (450 PS)', 'Transmission': '16 Speed Manual' },
    last_maintenance_date: '2026-08-20',
    next_preventive_date: '2026-11-20'
  },
  {
    id: 4,
    category_id: 4,
    asset_code: 'AST-IT-004',
    name: 'Enterprise Server Rack Dell PowerEdge R750 + Storage Array',
    serial_number: 'DELL-PE-R750-4490',
    purchase_date: '2023-11-05',
    purchase_cost: 680000000,
    residual_value: 50000000,
    current_book_value: 300000000,
    status: 'deployed',
    condition_status: 'good',
    current_location: 'Main Data Center Cyber 2 - LT 4',
    assigned_user_id: 7,
    specs: { 'CPU': '2x Intel Xeon Gold 6348', 'RAM': '512 GB DDR4 ECC', 'Storage': '24TB NVMe SSD' },
    last_maintenance_date: '2026-05-14',
    next_preventive_date: '2026-11-14'
  },
  {
    id: 5,
    category_id: 1,
    asset_code: 'AST-HE-005',
    name: 'Wheel Loader Caterpillar 966GC',
    serial_number: 'CAT-966GC-5531',
    purchase_date: '2021-08-15',
    purchase_cost: 2100000000,
    residual_value: 300000000,
    current_book_value: 956250000,
    status: 'warehouse',
    condition_status: 'good',
    current_location: 'Central Warehouse Balikpapan - Yard 2',
    specs: { 'Net Power': '168 kW (225 hp)', 'Operating Weight': '18,700 kg', 'Bucket': '4.0 m3' },
    last_maintenance_date: '2026-06-30',
    next_preventive_date: '2026-12-30'
  },
  {
    id: 6,
    category_id: 5,
    asset_code: 'AST-FC-006',
    name: 'Industrial Diesel Genset Cummins QSK60-G4 2250 kVA',
    serial_number: 'CUM-2250-88210',
    purchase_date: '2020-02-10',
    purchase_cost: 2800000000,
    residual_value: 350000000,
    current_book_value: 1452000000,
    status: 'deployed',
    condition_status: 'good',
    current_location: 'Plant Smelter Gresik - Power House 1',
    specs: { 'Prime Rating': '2000 kVA', 'Standby Rating': '2250 kVA', 'Voltage': '400/230V 50Hz' },
    last_maintenance_date: '2026-08-01',
    next_preventive_date: '2026-10-01'
  }
];

const INITIAL_SPARE_PARTS: SparePart[] = [
  { id: 1, sku: 'SP-HYD-68-200L', name: 'Hydraulic Oil ISO VG 68 (Drum 200L)', unit: 'Drum', stock_qty: 18, minimum_threshold: 8, unit_cost: 6500000, rack_location: 'Rack OIL-A1', category: 'Fluids & Lubricants' },
  { id: 2, sku: 'SP-FLT-KM200-AIR', name: 'Primary & Secondary Air Filter Kit PC200', unit: 'Set', stock_qty: 4, minimum_threshold: 6, unit_cost: 1450000, rack_location: 'Rack FLT-B03', category: 'Filters' },
  { id: 3, sku: 'SP-BRK-HN700-PAD', name: 'Heavy Duty Brake Pad Lining Kit Hino 700', unit: 'Set', stock_qty: 12, minimum_threshold: 5, unit_cost: 2350000, rack_location: 'Rack BRK-C12', category: 'Braking System' },
  { id: 4, sku: 'SP-CNC-SPNDL-BRG', name: 'High Precision Spindle Bearings Set (DMG MORI)', unit: 'Set', stock_qty: 2, minimum_threshold: 3, unit_cost: 18500000, rack_location: 'Rack CNC-SEC-01', category: 'Precision Parts' },
  { id: 5, sku: 'SP-ELE-RELAY-24V', name: 'Industrial Relay 24V DC 16-Pin Omron', unit: 'Pcs', stock_qty: 35, minimum_threshold: 15, unit_cost: 125000, rack_location: 'Bin ELE-04', category: 'Electrical' },
  { id: 6, sku: 'SP-GEN-INJ-NOZZ', name: 'Fuel Injector Nozzle Assembly QSK60', unit: 'Pcs', stock_qty: 6, minimum_threshold: 4, unit_cost: 7200000, rack_location: 'Rack ENG-D05', category: 'Engine Components' },
  { id: 7, sku: 'SP-HYD-SEAL-BOOM', name: 'Main Boom Cylinder Seal Kit Komatsu PC200', unit: 'Kit', stock_qty: 3, minimum_threshold: 5, unit_cost: 3800000, rack_location: 'Rack HYD-S02', category: 'Hydraulics' },
  { id: 8, sku: 'SP-IT-SFP-10G', name: '10GBASE-SR SFP+ Optical Transceiver Module', unit: 'Pcs', stock_qty: 14, minimum_threshold: 6, unit_cost: 850000, rack_location: 'Bin IT-OPT-02', category: 'Networking' },
];

const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 1,
    wo_number: 'WO-2026-0891',
    asset_id: 2,
    coordinator_id: 3,
    mechanic_id: 7,
    supervisor_id: 2,
    type: 'corrective',
    priority: 'high',
    status: 'in_progress',
    issue_description: 'Vibrasi abnormal pada spindel utama mesin CNC DMU 50 saat kecepatan di atas 12,000 RPM. Indikasi keausan bearing atau misalignment sumbu Z.',
    sla_hours: 24,
    due_date: '2026-09-13T12:00:00.000Z',
    started_at: '2026-09-12T01:30:00.000Z',
    checklist: [
      { id: 'chk-1', title: 'Pemeriksaan runout spindel dengan dial gauge (< 0.003 mm)', completed: true, notes: 'Ditemukan runout 0.012 mm melebihi toleransi' },
      { id: 'chk-2', title: 'Pembongkaran rumah bearing spindel dan inspeksi visual', completed: true, notes: 'Bearing bola keramik mengalami pitting' },
      { id: 'chk-3', title: 'Penggantian set High Precision Spindle Bearings', completed: false, notes: 'Menunggu pemasangan press hidrolik' },
      { id: 'chk-4', title: 'Balancing dinamis & uji temperatur thermal', completed: false },
      { id: 'chk-5', title: 'Kalibrasi sumbu X/Y/Z dan uji potong sampel', completed: false },
    ],
    items: [
      { id: 1, work_order_id: 1, spare_part_id: 4, spare_part_name: 'High Precision Spindle Bearings Set (DMG MORI)', spare_part_sku: 'SP-CNC-SPNDL-BRG', quantity_used: 1, unit_cost: 18500000 },
      { id: 2, work_order_id: 1, spare_part_id: 5, spare_part_name: 'Industrial Relay 24V DC 16-Pin Omron', spare_part_sku: 'SP-ELE-RELAY-24V', quantity_used: 2, unit_cost: 125000 },
    ],
    created_at: '2026-09-11T14:00:00.000Z',
  },
  {
    id: 2,
    wo_number: 'WO-2026-0885',
    asset_id: 1,
    coordinator_id: 3,
    mechanic_id: 6,
    supervisor_id: 2,
    type: 'preventive',
    priority: 'medium',
    status: 'completed',
    issue_description: 'Servis Berkala Rutin 500 Jam Operasional Excavator Komatsu PC200: Ganti oli hidrolik, filter udara, filter solar, dan greasing articulated joints.',
    resolution_notes: 'Seluruh oli hidrolik telah dikuras dan diisi kembali 200L ISO VG 68. Filter udara dan oli diganti. Tekanan hidrolik diuji stabil pada 34.3 MPa. Siap verifikasi supervisor.',
    sla_hours: 48,
    due_date: '2026-09-12T17:00:00.000Z',
    started_at: '2026-09-10T08:00:00.000Z',
    completed_at: '2026-09-11T16:45:00.000Z',
    checklist: [
      { id: 'chk-1', title: 'Drain dan ganti fluida oli hidrolik 200L', completed: true },
      { id: 'chk-2', title: 'Ganti kit filter udara primer & sekunder', completed: true },
      { id: 'chk-3', title: 'Inspeksi kebocoran boom cylinder & hos hidrolik', completed: true },
      { id: 'chk-4', title: 'Pengecekan track tension dan roller bushing', completed: true },
    ],
    items: [
      { id: 3, work_order_id: 2, spare_part_id: 1, spare_part_name: 'Hydraulic Oil ISO VG 68 (Drum 200L)', spare_part_sku: 'SP-HYD-68-200L', quantity_used: 1, unit_cost: 6500000 },
      { id: 4, work_order_id: 2, spare_part_id: 2, spare_part_name: 'Primary & Secondary Air Filter Kit PC200', spare_part_sku: 'SP-FLT-KM200-AIR', quantity_used: 1, unit_cost: 1450000 },
    ],
    created_at: '2026-09-09T08:30:00.000Z',
  },
  {
    id: 3,
    wo_number: 'WO-2026-0894',
    asset_id: 3,
    coordinator_id: 3,
    mechanic_id: 6,
    supervisor_id: null,
    type: 'emergency',
    priority: 'critical',
    status: 'assigned',
    issue_description: 'Insiden rem blong ringan / tekanan pneumatic menurun pada Hino 700 saat keluar dermaga Tanjung Priok. Segera periksa brake chamber dan lining kampas.',
    sla_hours: 4,
    due_date: '2026-09-12T15:00:00.000Z',
    checklist: [
      { id: 'chk-1', title: 'Pemeriksaan kebocoran kompresor dan tangki udara', completed: false },
      { id: 'chk-2', title: 'Bongkar drum rem poros 2 dan 3 untuk cek kampas', completed: false },
      { id: 'chk-3', title: 'Ganti brake lining kit jika aus (< 4 mm)', completed: false },
      { id: 'chk-4', title: 'Uji deselerasi di jalur aman dan brake dyno test', completed: false },
    ],
    items: [],
    created_at: '2026-09-12T04:10:00.000Z',
  }
];

const INITIAL_MOVEMENTS: AssetMovement[] = [
  {
    id: 1,
    asset_id: 5,
    from_location: 'Site Tambang Sangatta - Kutai Timur',
    to_location: 'Central Warehouse Balikpapan - Yard 2',
    requested_by: 4,
    approved_by: 2,
    status: 'completed',
    notes: 'Relokasi Wheel Loader pasca selesai kontrak proyek Sangatta untuk perawatan berkala dan inspeksi tahunan.',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-09-02T16:00:00.000Z'
  },
  {
    id: 2,
    asset_id: 1,
    from_location: 'Central Warehouse Balikpapan',
    to_location: 'Site Tambang Morowali - Sektor A',
    requested_by: 4,
    approved_by: 2,
    status: 'completed',
    notes: 'Deployment Excavator PC200 untuk pembukaan jalur conveyor baru Morowali.',
    created_at: '2026-07-15T09:30:00.000Z',
    updated_at: '2026-07-20T14:15:00.000Z'
  },
  {
    id: 3,
    asset_id: 5,
    from_location: 'Central Warehouse Balikpapan - Yard 2',
    to_location: 'Project Smelter Weda Bay - Halmahera',
    requested_by: 3,
    approved_by: null,
    status: 'pending',
    notes: 'Permintaan mutasi unit Wheel Loader CAT 966GC untuk percepatan material handling stockpile.',
    created_at: '2026-09-11T16:20:00.000Z',
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Bambang Pratama',
    role: 'admin',
    action: 'SYSTEM_INITIALIZATION',
    entity_type: 'system',
    entity_id: 'SYS-01',
    details: 'Sistem EAMS v1.0 berhasil diinisialisasi dengan konfigurasi skema MySQL InnoDB dan 6 peran RBAC.',
    timestamp: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 2,
    user_id: 4,
    user_name: 'Dewi Lestari, S.E.',
    role: 'asset_specialist',
    action: 'ASSET_REGISTRATION',
    entity_type: 'asset',
    entity_id: 'AST-HE-001',
    details: 'Pendaftaran Master Aset Hydraulic Excavator Komatsu PC200-8M0 dengan nilai perolehan Rp 1.850.000.000.',
    timestamp: '2026-09-02T08:15:00.000Z',
  },
  {
    id: 3,
    user_id: 3,
    user_name: 'Siti Rahmawati, S.T.',
    role: 'service_coordinator',
    action: 'WORK_ORDER_CREATE',
    entity_type: 'work_order',
    entity_id: 'WO-2026-0891',
    details: 'Pembuatan Work Order Corrective WO-2026-0891 dan penugasan ke Mekanik Agus Setiawan (Prioritas: High).',
    timestamp: '2026-09-11T14:00:00.000Z',
  },
  {
    id: 4,
    user_id: 6,
    user_name: 'Agus Setiawan',
    role: 'mechanic',
    action: 'SPARE_PART_RESERVATION',
    entity_type: 'spare_part',
    entity_id: 'SP-HYD-68-200L',
    details: 'Pengambilan 1 Drum Oli Hidrolik ISO VG 68 untuk pengerjaan WO-2026-0885. Stok berkurang menjadi 18 Drum.',
    timestamp: '2026-09-10T09:10:00.000Z',
  },
];

export class EamsDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadFromStorage();
    this.recalculateAllDepreciations();
  }

  private loadFromStorage(): DatabaseState {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (data) {
        const parsed: DatabaseState = JSON.parse(data);
        // Ensure supervisor name is up-to-date
        let modified = false;
        if (parsed.users) {
          parsed.users = parsed.users.map(u => {
            if (u.id === 2 || u.role === 'supervisor' || u.name.includes('Hendra')) {
              if (u.name !== 'Ihwan Suryadi,ST.') {
                modified = true;
                return { ...u, name: 'Ihwan Suryadi,ST.' };
              }
            }
            return u;
          });
        }
        if (modified) {
          this.saveToStorage(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored EAMS database, falling back to defaults:', e);
    }

    const defaultState: DatabaseState = {
      roles: INITIAL_ROLES,
      users: INITIAL_USERS,
      categories: INITIAL_CATEGORIES,
      assets: INITIAL_ASSETS,
      spare_parts: INITIAL_SPARE_PARTS,
      work_orders: INITIAL_WORK_ORDERS,
      work_order_items: [
        { id: 1, work_order_id: 1, spare_part_id: 4, spare_part_name: 'High Precision Spindle Bearings Set (DMG MORI)', spare_part_sku: 'SP-CNC-SPNDL-BRG', quantity_used: 1, unit_cost: 18500000 },
        { id: 2, work_order_id: 1, spare_part_id: 5, spare_part_name: 'Industrial Relay 24V DC 16-Pin Omron', spare_part_sku: 'SP-ELE-RELAY-24V', quantity_used: 2, unit_cost: 125000 },
        { id: 3, work_order_id: 2, spare_part_id: 1, spare_part_name: 'Hydraulic Oil ISO VG 68 (Drum 200L)', spare_part_sku: 'SP-HYD-68-200L', quantity_used: 1, unit_cost: 6500000 },
        { id: 4, work_order_id: 2, spare_part_id: 2, spare_part_name: 'Primary & Secondary Air Filter Kit PC200', spare_part_sku: 'SP-FLT-KM200-AIR', quantity_used: 1, unit_cost: 1450000 },
      ],
      asset_movements: INITIAL_MOVEMENTS,
      audit_logs: INITIAL_AUDIT_LOGS,
    };

    this.saveToStorage(defaultState);
    return defaultState;
  }

  private saveToStorage(state: DatabaseState): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save EAMS database to storage:', e);
    }
  }

  public resetToDefault(): DatabaseState {
    localStorage.removeItem(DB_KEY);
    this.state = this.loadFromStorage();
    this.recalculateAllDepreciations();
    return this.state;
  }

  public exportBackupJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importBackupJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as DatabaseState;
      if (parsed.assets && parsed.work_orders && parsed.spare_parts && parsed.users) {
        this.state = parsed;
        this.saveToStorage(this.state);
        return true;
      }
    } catch (e) {
      console.error('Invalid backup JSON:', e);
    }
    return false;
  }

  // --- GETTERS ---
  public getState(): DatabaseState {
    return this.state;
  }

  public getRoles(): Role[] {
    return this.state.roles;
  }

  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: number): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getCategories(): Category[] {
    return this.state.categories;
  }

  public getCategoryById(id: number): Category | undefined {
    return this.state.categories.find(c => c.id === id);
  }

  public getAssets(): Asset[] {
    return this.state.assets.map(asset => {
      const cat = this.getCategoryById(asset.category_id);
      const user = asset.assigned_user_id ? this.getUserById(asset.assigned_user_id) : null;
      return { ...asset, category: cat, assigned_user: user };
    });
  }

  public getAssetById(id: number): Asset | undefined {
    const asset = this.state.assets.find(a => a.id === id);
    if (!asset) return undefined;
    return {
      ...asset,
      category: this.getCategoryById(asset.category_id),
      assigned_user: asset.assigned_user_id ? this.getUserById(asset.assigned_user_id) : null,
    };
  }

  public getAssetByCode(code: string): Asset | undefined {
    const asset = this.state.assets.find(a => a.asset_code.toLowerCase() === code.trim().toLowerCase() || a.serial_number.toLowerCase() === code.trim().toLowerCase());
    if (!asset) return undefined;
    return {
      ...asset,
      category: this.getCategoryById(asset.category_id),
      assigned_user: asset.assigned_user_id ? this.getUserById(asset.assigned_user_id) : null,
    };
  }

  public getSpareParts(): SparePart[] {
    return this.state.spare_parts;
  }

  public getWorkOrders(): WorkOrder[] {
    return this.state.work_orders.map(wo => {
      const asset = this.getAssetById(wo.asset_id);
      const coordinator = this.getUserById(wo.coordinator_id);
      const mechanic = this.getUserById(wo.mechanic_id);
      const supervisor = wo.supervisor_id ? this.getUserById(wo.supervisor_id) : null;
      const items = (wo.items || []).map(item => {
        const part = this.state.spare_parts.find(p => p.id === item.spare_part_id);
        return {
          ...item,
          spare_part_name: part?.name || item.spare_part_name,
          spare_part_sku: part?.sku || item.spare_part_sku,
        };
      });
      return {
        ...wo,
        asset,
        coordinator,
        mechanic,
        supervisor,
        items,
      };
    });
  }

  public getAssetMovements(): AssetMovement[] {
    return this.state.asset_movements.map(m => {
      const asset = this.getAssetById(m.asset_id);
      const requester = this.getUserById(m.requested_by);
      const approver = m.approved_by ? this.getUserById(m.approved_by) : null;
      return {
        ...m,
        asset,
        requester,
        approver,
      };
    });
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.state.audit_logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // --- MUTATIONS & ATOMIC WORKFLOWS ---

  public logAudit(
    user: User, 
    action: string, 
    entity_type: AuditLog['entity_type'], 
    entity_id: string | number, 
    details: string
  ): void {
    const newLog: AuditLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      user_id: user.id,
      user_name: user.name,
      role: user.role,
      action,
      entity_type,
      entity_id,
      details,
      timestamp: new Date().toISOString(),
    };
    this.state.audit_logs.unshift(newLog);
    this.saveToStorage(this.state);
  }

  public recalculateAllDepreciations(): void {
    const now = new Date();
    this.state.assets = this.state.assets.map(asset => {
      const category = this.getCategoryById(asset.category_id);
      if (!category) return asset;
      const calc = AssetDepreciationService.calculateMonthlyDepreciation(asset, category, now);
      return {
        ...asset,
        current_book_value: calc.currentBookValue,
      };
    });
    this.saveToStorage(this.state);
  }

  // Asset CRUD
  public createAsset(data: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'current_book_value'>, user: User): Asset {
    const category = this.getCategoryById(data.category_id) || this.state.categories[0];
    const calc = AssetDepreciationService.calculateMonthlyDepreciation(
      { purchase_cost: data.purchase_cost, residual_value: data.residual_value, purchase_date: data.purchase_date },
      category
    );

    const newAsset: Asset = {
      ...data,
      id: Date.now(),
      current_book_value: calc.currentBookValue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.assets.unshift(newAsset);
    this.logAudit(user, 'ASSET_CREATED', 'asset', newAsset.asset_code, `Aset ${newAsset.name} berhasil didaftarkan di lokasi ${newAsset.current_location}.`);
    this.saveToStorage(this.state);
    return newAsset;
  }

  public updateAsset(id: number, data: Partial<Asset>, user: User): Asset {
    const idx = this.state.assets.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Aset tidak ditemukan');

    const prev = this.state.assets[idx];
    const updated: Asset = {
      ...prev,
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (data.purchase_cost !== undefined || data.residual_value !== undefined || data.purchase_date !== undefined || data.category_id !== undefined) {
      const cat = this.getCategoryById(updated.category_id) || this.state.categories[0];
      const calc = AssetDepreciationService.calculateMonthlyDepreciation(updated, cat);
      updated.current_book_value = calc.currentBookValue;
    }

    this.state.assets[idx] = updated;
    this.logAudit(user, 'ASSET_UPDATED', 'asset', updated.asset_code, `Data aset ${updated.name} diperbarui.`);
    this.saveToStorage(this.state);
    return updated;
  }

  public deleteAsset(id: number, user: User): boolean {
    const asset = this.state.assets.find(a => a.id === id);
    if (!asset) return false;
    this.state.assets = this.state.assets.filter(a => a.id !== id);
    this.logAudit(user, 'ASSET_DELETED', 'asset', asset.asset_code, `Aset ${asset.name} dihapus dari inventaris master.`);
    this.saveToStorage(this.state);
    return true;
  }

  // Work Order Workflow
  public createWorkOrder(
    data: {
      asset_id: number;
      mechanic_id: number;
      type: WorkOrder['type'];
      priority: WorkOrder['priority'];
      issue_description: string;
      checklist?: string[];
      sla_hours?: number;
    },
    user: User
  ): WorkOrder {
    const asset = this.getAssetById(data.asset_id);
    if (!asset) throw new Error('Aset tujuan Work Order tidak ditemukan');

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const woNumber = `WO-${new Date().getFullYear()}-${randomSuffix}`;
    const slaHours = data.sla_hours || (data.type === 'emergency' ? 4 : data.type === 'corrective' ? 24 : 48);

    const dueDate = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    const initialChecklist = (data.checklist && data.checklist.length > 0)
      ? data.checklist.map((c, i) => ({ id: `chk-${Date.now()}-${i}`, title: c, completed: false }))
      : [
          { id: `chk-1`, title: 'Inspeksi fisik awal dan isolasi sistem daya', completed: false },
          { id: `chk-2`, title: 'Diagnosa kode error dan pembongkaran modul', completed: false },
          { id: `chk-3`, title: 'Penggantian suku cadang atau re-kalibrasi', completed: false },
          { id: `chk-4`, title: 'Uji fungsi operasional beban kerja & parameter', completed: false },
        ];

    const newWO: WorkOrder = {
      id: Date.now(),
      wo_number: woNumber,
      asset_id: data.asset_id,
      coordinator_id: user.id,
      mechanic_id: data.mechanic_id,
      supervisor_id: null,
      type: data.type,
      priority: data.priority,
      status: 'assigned',
      issue_description: data.issue_description,
      checklist: initialChecklist,
      items: [],
      sla_hours: slaHours,
      due_date: dueDate,
      created_at: new Date().toISOString(),
    };

    this.state.work_orders.unshift(newWO);

    // Update asset condition/status if corrective or emergency
    if (data.type === 'emergency') {
      this.updateAsset(data.asset_id, { status: 'under_maintenance', condition_status: 'critical' }, user);
    } else if (data.type === 'corrective') {
      this.updateAsset(data.asset_id, { status: 'under_maintenance', condition_status: 'degraded' }, user);
    }

    const assignedMechanic = this.getUserById(data.mechanic_id);
    this.logAudit(
      user, 
      'WORK_ORDER_CREATE', 
      'work_order', 
      woNumber, 
      `Work Order ${woNumber} dibuat untuk ${asset.name} (${data.type.toUpperCase()}, Prioritas: ${data.priority.toUpperCase()}) dan ditugaskan ke ${assignedMechanic?.name || 'Mekanik'}.`
    );

    this.saveToStorage(this.state);
    return newWO;
  }

  public startWorkOrder(woId: number, user: User): WorkOrder {
    const idx = this.state.work_orders.findIndex(w => w.id === woId);
    if (idx === -1) throw new Error('Work Order tidak ditemukan');

    const wo = this.state.work_orders[idx];
    wo.status = 'in_progress';
    wo.started_at = new Date().toISOString();
    wo.updated_at = new Date().toISOString();

    this.logAudit(user, 'WORK_ORDER_START', 'work_order', wo.wo_number, `Mekanik ${user.name} memulai pengerjaan Work Order ${wo.wo_number}.`);
    this.saveToStorage(this.state);
    return wo;
  }

  public updateWorkOrderChecklist(woId: number, taskId: string, completed: boolean, notes?: string): WorkOrder {
    const idx = this.state.work_orders.findIndex(w => w.id === woId);
    if (idx === -1) throw new Error('Work Order tidak ditemukan');

    const wo = this.state.work_orders[idx];
    if (wo.checklist) {
      wo.checklist = wo.checklist.map(t => t.id === taskId ? { ...t, completed, notes: notes !== undefined ? notes : t.notes } : t);
    }
    wo.updated_at = new Date().toISOString();
    this.saveToStorage(this.state);
    return wo;
  }

  /**
   * Complete Work Order with atomic inventory deduction (guaranteed race-condition safe)
   */
  public completeWorkOrder(
    woId: number, 
    resolutionNotes: string, 
    partsUsed: Array<{ spare_part_id: number; quantity: number }>, 
    user: User
  ): WorkOrder {
    const idx = this.state.work_orders.findIndex(w => w.id === woId);
    if (idx === -1) throw new Error('Work Order tidak ditemukan');

    const wo = this.state.work_orders[idx];

    // Check inventory stock sufficiency FIRST
    for (const item of partsUsed) {
      const part = this.state.spare_parts.find(p => p.id === item.spare_part_id);
      if (!part) {
        throw new Error(`Suku cadang dengan ID ${item.spare_part_id} tidak ditemukan.`);
      }
      if (part.stock_qty < item.quantity) {
        throw new Error(`Stok suku cadang "${part.name}" tidak mencukupi! Tersedia: ${part.stock_qty} ${part.unit}, Dibutuhkan: ${item.quantity} ${part.unit}.`);
      }
    }

    // Atomic Deduct stock and record items
    const newItems: WorkOrderItem[] = [];
    for (const item of partsUsed) {
      const part = this.state.spare_parts.find(p => p.id === item.spare_part_id)!;
      part.stock_qty -= item.quantity;
      part.updated_at = new Date().toISOString();

      const orderItem: WorkOrderItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        work_order_id: wo.id,
        spare_part_id: part.id,
        spare_part_name: part.name,
        spare_part_sku: part.sku,
        quantity_used: item.quantity,
        unit_cost: part.unit_cost,
        created_at: new Date().toISOString(),
      };
      newItems.push(orderItem);

      this.logAudit(
        user, 
        'SPARE_PART_DEDUCTION', 
        'spare_part', 
        part.sku, 
        `Penggunaan ${item.quantity} ${part.unit} "${part.name}" untuk ${wo.wo_number}. Sisa stok: ${part.stock_qty}.`
      );
    }

    wo.items = [...(wo.items || []), ...newItems];
    wo.resolution_notes = resolutionNotes;
    wo.status = 'completed';
    wo.completed_at = new Date().toISOString();
    wo.updated_at = new Date().toISOString();

    this.logAudit(
      user, 
      'WORK_ORDER_COMPLETE', 
      'work_order', 
      wo.wo_number, 
      `Work Order ${wo.wo_number} telah diselesaikan oleh ${user.name} dan menunggu approval Supervisor.`
    );

    this.saveToStorage(this.state);
    return wo;
  }

  public approveWorkOrder(woId: number, user: User, notes?: string): WorkOrder {
    const idx = this.state.work_orders.findIndex(w => w.id === woId);
    if (idx === -1) throw new Error('Work Order tidak ditemukan');

    const wo = this.state.work_orders[idx];
    wo.status = 'approved';
    wo.supervisor_id = user.id;
    wo.approved_at = new Date().toISOString();
    wo.updated_at = new Date().toISOString();

    // Restore asset condition to good and deployed
    this.updateAsset(
      wo.asset_id, 
      { 
        status: 'deployed', 
        condition_status: 'good', 
        last_maintenance_date: new Date().toISOString().split('T')[0] 
      }, 
      user
    );

    this.logAudit(
      user, 
      'WORK_ORDER_APPROVED', 
      'work_order', 
      wo.wo_number, 
      `Supervisor ${user.name} menyetujui hasil perbaikan Work Order ${wo.wo_number}. Kondisi aset kembali NORMAL (Good). ${notes ? 'Catatan: ' + notes : ''}`
    );

    this.saveToStorage(this.state);
    return wo;
  }

  public rejectWorkOrder(woId: number, rejectionReason: string, user: User): WorkOrder {
    const idx = this.state.work_orders.findIndex(w => w.id === woId);
    if (idx === -1) throw new Error('Work Order tidak ditemukan');

    const wo = this.state.work_orders[idx];
    wo.status = 'rejected';
    wo.supervisor_id = user.id;
    wo.resolution_notes = (wo.resolution_notes || '') + `\n[REVISI SUPERVISOR]: ${rejectionReason}`;
    wo.updated_at = new Date().toISOString();

    this.logAudit(
      user, 
      'WORK_ORDER_REJECTED', 
      'work_order', 
      wo.wo_number, 
      `Supervisor ${user.name} menolak Work Order ${wo.wo_number}. Alasan: ${rejectionReason}. Status dikembalikan untuk investigasi.`
    );

    this.saveToStorage(this.state);
    return wo;
  }

  // Inventory / Spare Part CRUD
  public createSparePart(data: Omit<SparePart, 'id' | 'created_at' | 'updated_at'>, user: User): SparePart {
    const newPart: SparePart = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.spare_parts.unshift(newPart);
    this.logAudit(user, 'SPARE_PART_CREATED', 'spare_part', newPart.sku, `Suku cadang baru "${newPart.name}" (${newPart.sku}) ditambahkan ke master stok.`);
    this.saveToStorage(this.state);
    return newPart;
  }

  public updateSparePart(id: number, data: Partial<SparePart>, user: User): SparePart {
    const idx = this.state.spare_parts.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Suku cadang tidak ditemukan');

    const updated = {
      ...this.state.spare_parts[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.state.spare_parts[idx] = updated;
    this.logAudit(user, 'SPARE_PART_UPDATED', 'spare_part', updated.sku, `Data suku cadang "${updated.name}" diperbarui.`);
    this.saveToStorage(this.state);
    return updated;
  }

  public restockSparePart(id: number, quantityToAdd: number, notes: string, user: User): SparePart {
    const idx = this.state.spare_parts.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Suku cadang tidak ditemukan');

    const part = this.state.spare_parts[idx];
    const prevQty = part.stock_qty;
    part.stock_qty += quantityToAdd;
    part.updated_at = new Date().toISOString();

    this.logAudit(
      user, 
      'SPARE_PART_RESTOCK', 
      'spare_part', 
      part.sku, 
      `Penerimaan stok masuk: +${quantityToAdd} ${part.unit} "${part.name}". Stok (${prevQty} -> ${part.stock_qty}). Catatan: ${notes}`
    );
    this.saveToStorage(this.state);
    return part;
  }

  // Asset Movements
  public requestAssetMovement(
    data: { asset_id: number; from_location: string; to_location: string; notes?: string }, 
    user: User
  ): AssetMovement {
    const asset = this.getAssetById(data.asset_id);
    if (!asset) throw new Error('Aset tidak ditemukan');

    const movement: AssetMovement = {
      id: Date.now(),
      asset_id: data.asset_id,
      from_location: data.from_location,
      to_location: data.to_location,
      requested_by: user.id,
      approved_by: null,
      status: 'pending',
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    this.state.asset_movements.unshift(movement);
    this.logAudit(
      user, 
      'ASSET_MOVEMENT_REQUEST', 
      'asset_movement', 
      movement.id, 
      `Pengajuan mutasi fisik aset ${asset.name} dari "${data.from_location}" ke "${data.to_location}". Menunggu approval Supervisor.`
    );
    this.saveToStorage(this.state);
    return movement;
  }

  public approveAssetMovement(movementId: number, user: User): AssetMovement {
    const idx = this.state.asset_movements.findIndex(m => m.id === movementId);
    if (idx === -1) throw new Error('Mutasi aset tidak ditemukan');

    const m = this.state.asset_movements[idx];
    m.status = 'in_transit';
    m.approved_by = user.id;
    m.updated_at = new Date().toISOString();

    const asset = this.getAssetById(m.asset_id);
    this.logAudit(
      user, 
      'ASSET_MOVEMENT_APPROVED', 
      'asset_movement', 
      m.id, 
      `Supervisor ${user.name} menyetujui mutasi aset ${asset?.name || ''}. Status: IN TRANSIT menuju ${m.to_location}.`
    );
    this.saveToStorage(this.state);
    return m;
  }

  public completeAssetMovement(movementId: number, user: User): AssetMovement {
    const idx = this.state.asset_movements.findIndex(m => m.id === movementId);
    if (idx === -1) throw new Error('Mutasi aset tidak ditemukan');

    const m = this.state.asset_movements[idx];
    m.status = 'completed';
    m.updated_at = new Date().toISOString();

    // Update asset current location
    this.updateAsset(m.asset_id, { current_location: m.to_location }, user);

    const asset = this.getAssetById(m.asset_id);
    this.logAudit(
      user, 
      'ASSET_MOVEMENT_COMPLETED', 
      'asset_movement', 
      m.id, 
      `Mutasi aset ${asset?.name || ''} telah tiba dan terkonfirmasi di lokasi baru: ${m.to_location}.`
    );
    this.saveToStorage(this.state);
    return m;
  }

  // Users Management
  public createUser(data: Omit<User, 'id' | 'role_display_name'>, adminUser: User): User {
    const role = this.state.roles.find(r => r.name === data.role) || this.state.roles[0];
    const newUser: User = {
      ...data,
      id: Date.now(),
      role_id: role.id,
      role_display_name: role.display_name,
      created_at: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    this.logAudit(adminUser, 'USER_CREATED', 'user', newUser.email, `Pengguna baru ${newUser.name} (${newUser.role_display_name}) didaftarkan.`);
    this.saveToStorage(this.state);
    return newUser;
  }

  public updateUser(id: number, data: Partial<User>, adminUser: User): User {
    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Pengguna tidak ditemukan');

    const current = this.state.users[idx];
    let roleDisplayName = current.role_display_name;
    let roleId = current.role_id;

    if (data.role && data.role !== current.role) {
      const roleObj = this.state.roles.find(r => r.name === data.role);
      if (roleObj) {
        roleDisplayName = roleObj.display_name;
        roleId = roleObj.id;
      }
    }

    const updated: User = {
      ...current,
      ...data,
      role_id: roleId,
      role_display_name: roleDisplayName,
      updated_at: new Date().toISOString(),
    };

    this.state.users[idx] = updated;
    this.logAudit(adminUser, 'USER_UPDATED', 'user', updated.email, `Profil pengguna ${updated.name} diperbarui.`);
    this.saveToStorage(this.state);
    return updated;
  }
}

// Global Singleton Instance
export const db = new EamsDatabase();
