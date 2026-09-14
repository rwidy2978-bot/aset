import { 
  EquipmentBrand, EquipmentPlatform, EquipmentModel, 
  EquipmentBranch, EquipmentUnit, MonthlyBreakdownMetric 
} from '../types/eams';

const FAILURE_RATE_DB_KEY = 'eams_failure_rate_relational_v1';

export interface RelationalDbState {
  brands: EquipmentBrand[];
  platforms: EquipmentPlatform[];
  models: EquipmentModel[];
  branches: EquipmentBranch[];
  equipment_units: EquipmentUnit[];
  monthly_metrics: MonthlyBreakdownMetric[];
}

// -------------------------------------------------------------
// SEED DATA DIRECTLY FROM GOOGLE SHEETS BREAKDOWN RATE
// -------------------------------------------------------------

export const INITIAL_BRANDS: EquipmentBrand[] = [
  { id: 1, code: 'BR-ATLAS', name: 'Atlas', country_origin: 'Sweden', description: 'Industrial Compressors & Portable Power', created_at: '2026-01-01T00:00:00Z' },
  { id: 2, code: 'BR-CUMMINS', name: 'Cummins', country_origin: 'USA', description: 'Heavy Diesel Engine Generators & Powertrains', created_at: '2026-01-01T00:00:00Z' },
  { id: 3, code: 'BR-DATACOLOR', name: 'Datacolor', country_origin: 'USA', description: 'Precision Diagnostic & Industrial Calibrators', created_at: '2026-01-01T00:00:00Z' },
  { id: 4, code: 'BR-DINGLI', name: 'DINGLI', country_origin: 'China', description: 'Intelligent Aerial Work Platforms (AWP)', created_at: '2026-01-01T00:00:00Z' },
  { id: 5, code: 'BR-GENIE', name: 'Genie', country_origin: 'USA', description: 'Terex Brand Aerial Work Platforms & Telescopic Lifts', created_at: '2026-01-01T00:00:00Z' },
  { id: 6, code: 'BR-JLG', name: 'JLG', country_origin: 'USA', description: 'Oshkosh Access Equipment & Articulating Booms', created_at: '2026-01-01T00:00:00Z' },
  { id: 7, code: 'BR-LIUGONG', name: 'LiuGong', country_origin: 'China', description: 'Heavy Earthmoving, Excavators & Wheel Loaders', created_at: '2026-01-01T00:00:00Z' },
  { id: 8, code: 'BR-POWERLINK', name: 'PowerLink', country_origin: 'UK', description: 'Silent Diesel Power Generators & Lighting Towers', created_at: '2026-01-01T00:00:00Z' },
  { id: 9, code: 'BR-ZOOMLION', name: 'Zoomlion', country_origin: 'China', description: 'Mobile Cranes & High Reach Aerial Equipment', created_at: '2026-01-01T00:00:00Z' },
];

export const INITIAL_PLATFORMS: EquipmentPlatform[] = [
  { id: 1, brand_id: 4, name: '24m diesel wheel telescopic boom lift', unit_type: 'AWP', description: 'Heavy duty high reach telescopic boom', created_at: '2026-01-01T00:00:00Z' },
  { id: 2, brand_id: 4, name: '16m electric rough terrain scissor lift', unit_type: 'AWP', description: 'High capacity battery scissor platform', created_at: '2026-01-01T00:00:00Z' },
  { id: 3, brand_id: 5, name: 'Articulated Boom Lift Z-Series', unit_type: 'AWP', description: 'Flexible up-and-over positioning boom', created_at: '2026-01-01T00:00:00Z' },
  { id: 4, brand_id: 5, name: 'Telescopic Boom Lift S-Series', unit_type: 'AWP', description: 'Horizontal outreach telescopic platform', created_at: '2026-01-01T00:00:00Z' },
  { id: 5, brand_id: 6, name: 'Diesel Engine Articulating Boom 45ft', unit_type: 'AWP', description: 'Rough terrain 4WD all-access boom', created_at: '2026-01-01T00:00:00Z' },
  { id: 6, brand_id: 6, name: 'Ultra High Reach Boom 80ft', unit_type: 'AWP', description: 'Super heavy duty extreme height lift', created_at: '2026-01-01T00:00:00Z' },
  { id: 7, brand_id: 7, name: 'Hydraulic Crawler Excavator 20T', unit_type: 'Heavy Equipment', description: 'Mining & earthmoving excavator', created_at: '2026-01-01T00:00:00Z' },
  { id: 8, brand_id: 9, name: 'All-Terrain Hydraulic Mobile Crane', unit_type: 'Heavy Equipment', description: 'Heavy lifting mobile construction crane', created_at: '2026-01-01T00:00:00Z' },
  { id: 9, brand_id: 1, name: 'Portable Screw Air Compressor', unit_type: 'Machinery', description: 'High pressure industrial pneumatic supply', created_at: '2026-01-01T00:00:00Z' },
  { id: 10, brand_id: 2, name: 'Prime Standby Diesel Genset 500kVA', unit_type: 'Genset', description: 'Continuous power generation container', created_at: '2026-01-01T00:00:00Z' },
  { id: 11, brand_id: 3, name: 'Precision Industrial Calibration Kit', unit_type: 'Machinery', description: 'Optical & colorimetric test rig', created_at: '2026-01-01T00:00:00Z' },
  { id: 12, brand_id: 8, name: 'Silent Soundproof Diesel Genset 200kVA', unit_type: 'Genset', description: 'Low noise site power generator', created_at: '2026-01-01T00:00:00Z' },
];

export const INITIAL_MODELS: EquipmentModel[] = [
  { id: 1, platform_id: 1, model_name: 'BT26RT', rated_capacity: '450 kg (26.6m height)', power_source: 'Deutz Stage V Diesel', created_at: '2026-01-01T00:00:00Z' },
  { id: 2, platform_id: 2, model_name: 'JCPT1614HD', rated_capacity: '500 kg (15.7m height)', power_source: 'Lithium Li-Ion 48V', created_at: '2026-01-01T00:00:00Z' },
  { id: 3, platform_id: 3, model_name: 'Z-45/25J RT', rated_capacity: '227 kg (16m height)', power_source: 'Perkins Diesel 4x4', created_at: '2026-01-01T00:00:00Z' },
  { id: 4, platform_id: 4, model_name: 'S-85 XC', rated_capacity: '454 kg (27.9m height)', power_source: 'Deutz TD 2.9 L4', created_at: '2026-01-01T00:00:00Z' },
  { id: 5, platform_id: 5, model_name: '450AJ', rated_capacity: '250 kg (15.7m height)', power_source: 'Deutz D2011L04', created_at: '2026-01-01T00:00:00Z' },
  { id: 6, platform_id: 6, model_name: '800AJ', rated_capacity: '230 kg (26.3m height)', power_source: 'Deutz TD2.9L4 Tier 4', created_at: '2026-01-01T00:00:00Z' },
  { id: 7, platform_id: 7, model_name: 'CLG920D', rated_capacity: '1.0 m3 bucket', power_source: 'Cummins 6BTAA5.9', created_at: '2026-01-01T00:00:00Z' },
  { id: 8, platform_id: 8, model_name: 'ZTC800V', rated_capacity: '80 Ton lifting', power_source: 'Weichai WP12.375E50', created_at: '2026-01-01T00:00:00Z' },
  { id: 9, platform_id: 9, model_name: 'QAS-150', rated_capacity: '150 kVA', power_source: 'Volvo Penta TAD731GE', created_at: '2026-01-01T00:00:00Z' },
  { id: 10, platform_id: 10, model_name: 'C500D5', rated_capacity: '500 kVA', power_source: 'Cummins QSX15-G8', created_at: '2026-01-01T00:00:00Z' },
  { id: 11, platform_id: 11, model_name: 'DC-SPECTRO-700', rated_capacity: 'Precision Sensor', power_source: '220V AC / DC Inverter', created_at: '2026-01-01T00:00:00Z' },
  { id: 12, platform_id: 12, model_name: 'PL-G200', rated_capacity: '200 kVA', power_source: 'Perkins 1106A-70TAG3', created_at: '2026-01-01T00:00:00Z' },
];

export const INITIAL_BRANCHES: EquipmentBranch[] = [
  { id: 1, store_code: 'BTM-AWP', store_name: 'Batam_AWP', region: 'Kepulauan Riau', is_warehouse: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, store_code: 'JKT-ELEC', store_name: 'Jakarta_Electricity', region: 'DKI Jakarta', is_warehouse: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 3, store_code: 'SMG-AWP', store_name: 'Semarang_AWP', region: 'Jawa Tengah', is_warehouse: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 4, store_code: 'SBY-AWP', store_name: 'Surabaya_AWP', region: 'Jawa Timur', is_warehouse: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 5, store_code: 'WJKT-AWP', store_name: 'West Jakarta_AWP', region: 'DKI Jakarta', is_warehouse: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 6, store_code: 'NJKT-AWP', store_name: 'North Jakarta_AWP', region: 'DKI Jakarta', is_warehouse: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 7, store_code: 'WH-MAIN', store_name: 'Central Warehouse & Hub', region: 'DKI Jakarta', is_warehouse: true, created_at: '2026-01-01T00:00:00Z' },
];

export const INITIAL_EQUIPMENT_UNITS: EquipmentUnit[] = [
  { id: 1, eq_number: 'EQ-DNG-BT26-01', serial_number: 'DL-2024-9981', model_id: 1, store_id: 5, status: 'operational', year_manufactured: 2024, total_operating_hours: 1420, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, eq_number: 'EQ-DNG-BT26-02', serial_number: 'DL-2024-9982', model_id: 1, store_id: 5, status: 'operational', year_manufactured: 2024, total_operating_hours: 1280, created_at: '2026-01-01T00:00:00Z' },
  { id: 3, eq_number: 'EQ-GEN-Z45-01', serial_number: 'GN-2023-4412', model_id: 3, store_id: 4, status: 'operational', year_manufactured: 2023, total_operating_hours: 2600, created_at: '2026-01-01T00:00:00Z' },
  { id: 4, eq_number: 'EQ-GEN-S85-01', serial_number: 'GN-2022-8119', model_id: 4, store_id: 3, status: 'in_maintenance', year_manufactured: 2022, total_operating_hours: 3950, created_at: '2026-01-01T00:00:00Z' },
  { id: 5, eq_number: 'EQ-JLG-450-01', serial_number: 'JL-2023-1102', model_id: 5, store_id: 1, status: 'operational', year_manufactured: 2023, total_operating_hours: 1890, created_at: '2026-01-01T00:00:00Z' },
  { id: 6, eq_number: 'EQ-JLG-800-01', serial_number: 'JL-2021-0844', model_id: 6, store_id: 6, status: 'operational', year_manufactured: 2021, total_operating_hours: 4500, created_at: '2026-01-01T00:00:00Z' },
  { id: 7, eq_number: 'EQ-LUG-920-01', serial_number: 'LG-2023-7741', model_id: 7, store_id: 3, status: 'breakdown', year_manufactured: 2023, total_operating_hours: 3100, created_at: '2026-01-01T00:00:00Z' },
  { id: 8, eq_number: 'EQ-ZML-800-01', serial_number: 'ZM-2024-3329', model_id: 8, store_id: 2, status: 'operational', year_manufactured: 2024, total_operating_hours: 850, created_at: '2026-01-01T00:00:00Z' },
  { id: 9, eq_number: 'EQ-ATL-QAS-01', serial_number: 'AT-2022-5561', model_id: 9, store_id: 2, status: 'operational', year_manufactured: 2022, total_operating_hours: 4200, created_at: '2026-01-01T00:00:00Z' },
  { id: 10, eq_number: 'EQ-CUM-500-01', serial_number: 'CU-2021-9904', model_id: 10, store_id: 2, status: 'operational', year_manufactured: 2021, total_operating_hours: 5800, created_at: '2026-01-01T00:00:00Z' },
  { id: 11, eq_number: 'EQ-DAT-CAL-01', serial_number: 'DC-2024-1010', model_id: 11, store_id: 7, status: 'operational', year_manufactured: 2024, total_operating_hours: 600, created_at: '2026-01-01T00:00:00Z' },
  { id: 12, eq_number: 'EQ-PWL-200-01', serial_number: 'PW-2023-6623', model_id: 12, store_id: 1, status: 'operational', year_manufactured: 2023, total_operating_hours: 2400, created_at: '2026-01-01T00:00:00Z' },
];

export const INITIAL_MONTHLY_METRICS: MonthlyBreakdownMetric[] = [
  // 1. ATLAS (Avg: 67.92%)
  { id: 1, equipment_id: 9, period_year: 2026, period_month: 'Jan', breakdown_hours: 44, total_scheduled_hours: 70, pm_count: 2, cm_count: 1, breakdown_rate: 0.63, created_at: '2026-01-31T00:00:00Z' },
  { id: 2, equipment_id: 9, period_year: 2026, period_month: 'Feb', breakdown_hours: 55, total_scheduled_hours: 70, pm_count: 2, cm_count: 2, breakdown_rate: 0.78, created_at: '2026-02-28T00:00:00Z' },
  { id: 3, equipment_id: 9, period_year: 2026, period_month: 'Mar', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 1, cm_count: 3, breakdown_rate: 1.00, created_at: '2026-03-31T00:00:00Z' },
  { id: 4, equipment_id: 9, period_year: 2026, period_month: 'Apr', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 4, breakdown_rate: 1.00, created_at: '2026-04-30T00:00:00Z' },
  { id: 5, equipment_id: 9, period_year: 2026, period_month: 'Mei', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 1, cm_count: 2, breakdown_rate: 1.00, created_at: '2026-05-31T00:00:00Z' },
  { id: 6, equipment_id: 9, period_year: 2026, period_month: 'Jun', breakdown_hours: 28, total_scheduled_hours: 70, pm_count: 3, cm_count: 1, breakdown_rate: 0.40, created_at: '2026-06-30T00:00:00Z' },
  { id: 7, equipment_id: 9, period_year: 2026, period_month: 'Jul', breakdown_hours: 23, total_scheduled_hours: 70, pm_count: 2, cm_count: 1, breakdown_rate: 0.3333, created_at: '2026-07-31T00:00:00Z' },
  { id: 8, equipment_id: 9, period_year: 2026, period_month: 'Agu', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 1, cm_count: 2, breakdown_rate: 1.00, created_at: '2026-08-31T00:00:00Z' },

  // 2. CUMMINS (Avg: 78.93%)
  { id: 9, equipment_id: 10, period_year: 2026, period_month: 'Jan', breakdown_hours: 45, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.64, created_at: '2026-01-31T00:00:00Z' },
  { id: 10, equipment_id: 10, period_year: 2026, period_month: 'Feb', breakdown_hours: 59, total_scheduled_hours: 70, pm_count: 1, cm_count: 4, breakdown_rate: 0.84, created_at: '2026-02-28T00:00:00Z' },
  { id: 11, equipment_id: 10, period_year: 2026, period_month: 'Mar', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 1, cm_count: 3, breakdown_rate: 1.00, created_at: '2026-03-31T00:00:00Z' },
  { id: 12, equipment_id: 10, period_year: 2026, period_month: 'Apr', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 4, breakdown_rate: 1.00, created_at: '2026-04-30T00:00:00Z' },
  { id: 13, equipment_id: 10, period_year: 2026, period_month: 'Mei', breakdown_hours: 54, total_scheduled_hours: 70, pm_count: 2, cm_count: 2, breakdown_rate: 0.7674, created_at: '2026-05-31T00:00:00Z' },
  { id: 14, equipment_id: 10, period_year: 2026, period_month: 'Jun', breakdown_hours: 50, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.7188, created_at: '2026-06-30T00:00:00Z' },
  { id: 15, equipment_id: 10, period_year: 2026, period_month: 'Jul', breakdown_hours: 47, total_scheduled_hours: 70, pm_count: 3, cm_count: 2, breakdown_rate: 0.6667, created_at: '2026-07-31T00:00:00Z' },
  { id: 16, equipment_id: 10, period_year: 2026, period_month: 'Agu', breakdown_hours: 39, total_scheduled_hours: 70, pm_count: 4, cm_count: 1, breakdown_rate: 0.56, created_at: '2026-08-31T00:00:00Z' },

  // 3. DATACOLOR (Avg: 80.28%)
  { id: 17, equipment_id: 11, period_year: 2026, period_month: 'Jan', breakdown_hours: 59, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.84, created_at: '2026-01-31T00:00:00Z' },
  { id: 18, equipment_id: 11, period_year: 2026, period_month: 'Feb', breakdown_hours: 54, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.77, created_at: '2026-02-28T00:00:00Z' },
  { id: 19, equipment_id: 11, period_year: 2026, period_month: 'Mar', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 1, cm_count: 2, breakdown_rate: 1.00, created_at: '2026-03-31T00:00:00Z' },
  { id: 20, equipment_id: 11, period_year: 2026, period_month: 'Apr', breakdown_hours: 64, total_scheduled_hours: 70, pm_count: 1, cm_count: 3, breakdown_rate: 0.92, created_at: '2026-04-30T00:00:00Z' },
  { id: 21, equipment_id: 11, period_year: 2026, period_month: 'Mei', breakdown_hours: 58, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.8261, created_at: '2026-05-31T00:00:00Z' },
  { id: 22, equipment_id: 11, period_year: 2026, period_month: 'Jun', breakdown_hours: 44, total_scheduled_hours: 70, pm_count: 3, cm_count: 2, breakdown_rate: 0.6250, created_at: '2026-06-30T00:00:00Z' },
  { id: 23, equipment_id: 11, period_year: 2026, period_month: 'Jul', breakdown_hours: 58, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.8305, created_at: '2026-07-31T00:00:00Z' },
  { id: 24, equipment_id: 11, period_year: 2026, period_month: 'Agu', breakdown_hours: 56, total_scheduled_hours: 70, pm_count: 2, cm_count: 2, breakdown_rate: 0.80, created_at: '2026-08-31T00:00:00Z' },

  // 4. DINGLI (BT26RT & JCPT - Avg: 100%)
  { id: 25, equipment_id: 1, period_year: 2026, period_month: 'Jan', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 5, breakdown_rate: 1.00, created_at: '2026-01-31T00:00:00Z' },
  { id: 26, equipment_id: 1, period_year: 2026, period_month: 'Feb', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 4, breakdown_rate: 1.00, created_at: '2026-02-28T00:00:00Z' },
  { id: 27, equipment_id: 1, period_year: 2026, period_month: 'Mar', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 6, breakdown_rate: 1.00, created_at: '2026-03-31T00:00:00Z' },
  { id: 28, equipment_id: 1, period_year: 2026, period_month: 'Mei', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 5, breakdown_rate: 1.00, created_at: '2026-05-31T00:00:00Z' },
  { id: 29, equipment_id: 1, period_year: 2026, period_month: 'Jun', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 4, breakdown_rate: 1.00, created_at: '2026-06-30T00:00:00Z' },
  { id: 30, equipment_id: 1, period_year: 2026, period_month: 'Agu', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 4, breakdown_rate: 1.00, created_at: '2026-08-31T00:00:00Z' },

  // 5. GENIE (Avg: 94.55%)
  { id: 31, equipment_id: 3, period_year: 2026, period_month: 'Jan', breakdown_hours: 66, total_scheduled_hours: 70, pm_count: 1, cm_count: 5, breakdown_rate: 0.94, created_at: '2026-01-31T00:00:00Z' },
  { id: 32, equipment_id: 3, period_year: 2026, period_month: 'Feb', breakdown_hours: 67, total_scheduled_hours: 70, pm_count: 1, cm_count: 6, breakdown_rate: 0.96, created_at: '2026-02-28T00:00:00Z' },
  { id: 33, equipment_id: 3, period_year: 2026, period_month: 'Mar', breakdown_hours: 68, total_scheduled_hours: 70, pm_count: 1, cm_count: 5, breakdown_rate: 0.9758, created_at: '2026-03-31T00:00:00Z' },
  { id: 34, equipment_id: 3, period_year: 2026, period_month: 'Apr', breakdown_hours: 62, total_scheduled_hours: 70, pm_count: 2, cm_count: 4, breakdown_rate: 0.89, created_at: '2026-04-30T00:00:00Z' },
  { id: 35, equipment_id: 3, period_year: 2026, period_month: 'Mei', breakdown_hours: 65, total_scheduled_hours: 70, pm_count: 1, cm_count: 5, breakdown_rate: 0.9247, created_at: '2026-05-31T00:00:00Z' },
  { id: 36, equipment_id: 3, period_year: 2026, period_month: 'Jun', breakdown_hours: 67, total_scheduled_hours: 70, pm_count: 1, cm_count: 6, breakdown_rate: 0.9520, created_at: '2026-06-30T00:00:00Z' },
  { id: 37, equipment_id: 3, period_year: 2026, period_month: 'Jul', breakdown_hours: 68, total_scheduled_hours: 70, pm_count: 0, cm_count: 7, breakdown_rate: 0.9774, created_at: '2026-07-31T00:00:00Z' },
  { id: 38, equipment_id: 3, period_year: 2026, period_month: 'Agu', breakdown_hours: 69, total_scheduled_hours: 70, pm_count: 0, cm_count: 8, breakdown_rate: 0.98, created_at: '2026-08-31T00:00:00Z' },

  // 6. JLG (Avg: 93.26%)
  { id: 39, equipment_id: 5, period_year: 2026, period_month: 'Jan', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 4, breakdown_rate: 1.00, created_at: '2026-01-31T00:00:00Z' },
  { id: 40, equipment_id: 5, period_year: 2026, period_month: 'Feb', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 5, breakdown_rate: 1.00, created_at: '2026-02-28T00:00:00Z' },
  { id: 41, equipment_id: 5, period_year: 2026, period_month: 'Mar', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 5, breakdown_rate: 1.00, created_at: '2026-03-31T00:00:00Z' },
  { id: 42, equipment_id: 5, period_year: 2026, period_month: 'Apr', breakdown_hours: 59, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.84, created_at: '2026-04-30T00:00:00Z' },
  { id: 43, equipment_id: 5, period_year: 2026, period_month: 'Mei', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 4, breakdown_rate: 1.00, created_at: '2026-05-31T00:00:00Z' },
  { id: 44, equipment_id: 5, period_year: 2026, period_month: 'Jun', breakdown_hours: 40, total_scheduled_hours: 70, pm_count: 3, cm_count: 2, breakdown_rate: 0.5714, created_at: '2026-06-30T00:00:00Z' },
  { id: 45, equipment_id: 5, period_year: 2026, period_month: 'Jul', breakdown_hours: 70, total_scheduled_hours: 70, pm_count: 0, cm_count: 5, breakdown_rate: 1.00, created_at: '2026-07-31T00:00:00Z' },
  { id: 46, equipment_id: 5, period_year: 2026, period_month: 'Agu', breakdown_hours: 56, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.80, created_at: '2026-08-31T00:00:00Z' },

  // 7. LIUGONG (Avg: 75.11%)
  { id: 47, equipment_id: 7, period_year: 2026, period_month: 'Jan', breakdown_hours: 51, total_scheduled_hours: 70, pm_count: 3, cm_count: 2, breakdown_rate: 0.73, created_at: '2026-01-31T00:00:00Z' },
  { id: 48, equipment_id: 7, period_year: 2026, period_month: 'Feb', breakdown_hours: 27, total_scheduled_hours: 70, pm_count: 4, cm_count: 1, breakdown_rate: 0.38, created_at: '2026-02-28T00:00:00Z' },
  { id: 49, equipment_id: 7, period_year: 2026, period_month: 'Mar', breakdown_hours: 61, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.8667, created_at: '2026-03-31T00:00:00Z' },
  { id: 50, equipment_id: 7, period_year: 2026, period_month: 'Apr', breakdown_hours: 59, total_scheduled_hours: 70, pm_count: 2, cm_count: 4, breakdown_rate: 0.84, created_at: '2026-04-30T00:00:00Z' },
  { id: 51, equipment_id: 7, period_year: 2026, period_month: 'Mei', breakdown_hours: 53, total_scheduled_hours: 70, pm_count: 3, cm_count: 3, breakdown_rate: 0.75, created_at: '2026-05-31T00:00:00Z' },
  { id: 52, equipment_id: 7, period_year: 2026, period_month: 'Jun', breakdown_hours: 57, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.8163, created_at: '2026-06-30T00:00:00Z' },
  { id: 53, equipment_id: 7, period_year: 2026, period_month: 'Jul', breakdown_hours: 51, total_scheduled_hours: 70, pm_count: 3, cm_count: 2, breakdown_rate: 0.7333, created_at: '2026-07-31T00:00:00Z' },
  { id: 54, equipment_id: 7, period_year: 2026, period_month: 'Agu', breakdown_hours: 62, total_scheduled_hours: 70, pm_count: 1, cm_count: 4, breakdown_rate: 0.88, created_at: '2026-08-31T00:00:00Z' },

  // 8. POWERLINK (Avg: 79.83%)
  { id: 55, equipment_id: 12, period_year: 2026, period_month: 'Jan', breakdown_hours: 49, total_scheduled_hours: 70, pm_count: 3, cm_count: 2, breakdown_rate: 0.70, created_at: '2026-01-31T00:00:00Z' },
  { id: 56, equipment_id: 12, period_year: 2026, period_month: 'Feb', breakdown_hours: 51, total_scheduled_hours: 70, pm_count: 2, cm_count: 2, breakdown_rate: 0.73, created_at: '2026-02-28T00:00:00Z' },
  { id: 57, equipment_id: 12, period_year: 2026, period_month: 'Mar', breakdown_hours: 63, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.90, created_at: '2026-03-31T00:00:00Z' },
  { id: 58, equipment_id: 12, period_year: 2026, period_month: 'Apr', breakdown_hours: 55, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.78, created_at: '2026-04-30T00:00:00Z' },
  { id: 59, equipment_id: 12, period_year: 2026, period_month: 'Mei', breakdown_hours: 63, total_scheduled_hours: 70, pm_count: 1, cm_count: 4, breakdown_rate: 0.9057, created_at: '2026-05-31T00:00:00Z' },
  { id: 60, equipment_id: 12, period_year: 2026, period_month: 'Jun', breakdown_hours: 57, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.8116, created_at: '2026-06-30T00:00:00Z' },
  { id: 61, equipment_id: 12, period_year: 2026, period_month: 'Jul', breakdown_hours: 57, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.8197, created_at: '2026-07-31T00:00:00Z' },
  { id: 62, equipment_id: 12, period_year: 2026, period_month: 'Agu', breakdown_hours: 60, total_scheduled_hours: 70, pm_count: 2, cm_count: 3, breakdown_rate: 0.85, created_at: '2026-08-31T00:00:00Z' },

  // 9. ZOOMLION (Avg: 92.68%)
  { id: 63, equipment_id: 8, period_year: 2026, period_month: 'Jan', breakdown_hours: 60, total_scheduled_hours: 70, pm_count: 2, cm_count: 4, breakdown_rate: 0.86, created_at: '2026-01-31T00:00:00Z' },
  { id: 64, equipment_id: 8, period_year: 2026, period_month: 'Feb', breakdown_hours: 69, total_scheduled_hours: 70, pm_count: 0, cm_count: 6, breakdown_rate: 0.99, created_at: '2026-02-28T00:00:00Z' },
  { id: 65, equipment_id: 8, period_year: 2026, period_month: 'Mar', breakdown_hours: 63, total_scheduled_hours: 70, pm_count: 1, cm_count: 4, breakdown_rate: 0.8983, created_at: '2026-03-31T00:00:00Z' },
  { id: 66, equipment_id: 8, period_year: 2026, period_month: 'Apr', breakdown_hours: 63, total_scheduled_hours: 70, pm_count: 1, cm_count: 4, breakdown_rate: 0.90, created_at: '2026-04-30T00:00:00Z' },
  { id: 67, equipment_id: 8, period_year: 2026, period_month: 'Mei', breakdown_hours: 64, total_scheduled_hours: 70, pm_count: 1, cm_count: 4, breakdown_rate: 0.9152, created_at: '2026-05-31T00:00:00Z' },
  { id: 68, equipment_id: 8, period_year: 2026, period_month: 'Jun', breakdown_hours: 66, total_scheduled_hours: 70, pm_count: 1, cm_count: 5, breakdown_rate: 0.9399, created_at: '2026-06-30T00:00:00Z' },
  { id: 69, equipment_id: 8, period_year: 2026, period_month: 'Jul', breakdown_hours: 65, total_scheduled_hours: 70, pm_count: 1, cm_count: 5, breakdown_rate: 0.9320, created_at: '2026-07-31T00:00:00Z' },
  { id: 70, equipment_id: 8, period_year: 2026, period_month: 'Agu', breakdown_hours: 69, total_scheduled_hours: 70, pm_count: 0, cm_count: 7, breakdown_rate: 0.99, created_at: '2026-08-31T00:00:00Z' },
];

export class FailureRateRelationalService {
  private state: RelationalDbState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): RelationalDbState {
    try {
      const data = localStorage.getItem(FAILURE_RATE_DB_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading failure rate relational database:', e);
    }

    const defaultState: RelationalDbState = {
      brands: INITIAL_BRANDS,
      platforms: INITIAL_PLATFORMS,
      models: INITIAL_MODELS,
      branches: INITIAL_BRANCHES,
      equipment_units: INITIAL_EQUIPMENT_UNITS,
      monthly_metrics: INITIAL_MONTHLY_METRICS,
    };

    this.saveState(defaultState);
    return defaultState;
  }

  private saveState(state: RelationalDbState): void {
    try {
      localStorage.setItem(FAILURE_RATE_DB_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving failure rate relational database:', e);
    }
  }

  public resetToDefault(): RelationalDbState {
    const defaultState: RelationalDbState = {
      brands: INITIAL_BRANDS,
      platforms: INITIAL_PLATFORMS,
      models: INITIAL_MODELS,
      branches: INITIAL_BRANCHES,
      equipment_units: INITIAL_EQUIPMENT_UNITS,
      monthly_metrics: INITIAL_MONTHLY_METRICS,
    };
    this.state = defaultState;
    this.saveState(defaultState);
    return defaultState;
  }

  // --- Entity Getters with Joined Relations ---
  public getBrands(): EquipmentBrand[] {
    return [...this.state.brands];
  }

  public getPlatforms(): EquipmentPlatform[] {
    return this.state.platforms.map(p => ({
      ...p,
      brand: this.state.brands.find(b => b.id === p.brand_id)
    }));
  }

  public getModels(): EquipmentModel[] {
    return this.state.models.map(m => {
      const platform = this.getPlatforms().find(p => p.id === m.platform_id);
      return {
        ...m,
        platform
      };
    });
  }

  public getBranches(): EquipmentBranch[] {
    return [...this.state.branches];
  }

  public getEquipmentUnits(): EquipmentUnit[] {
    return this.state.equipment_units.map(u => {
      const model = this.getModels().find(m => m.id === u.model_id);
      const store = this.state.branches.find(b => b.id === u.store_id);
      return {
        ...u,
        model,
        store
      };
    });
  }

  public getMonthlyMetrics(): MonthlyBreakdownMetric[] {
    const units = this.getEquipmentUnits();
    return this.state.monthly_metrics.map(met => ({
      ...met,
      equipment: units.find(u => u.id === met.equipment_id)
    }));
  }

  // --- Pivot Aggregate Calculator Matching GSheet Exactly ---
  public getPivotRows(selectedBrandId?: number, selectedPlatformId?: number, selectedBranchId?: number) {
    const metrics = this.getMonthlyMetrics();
    const brands = this.getBrands();
    const platforms = this.getPlatforms();
    const models = this.getModels();
    const units = this.getEquipmentUnits();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu'] as const;

    // Filter brands if selected
    const filteredBrands = selectedBrandId 
      ? brands.filter(b => b.id === selectedBrandId) 
      : brands;

    const brandRows = filteredBrands.map(brand => {
      // Find all units belonging to this brand
      const brandPlatforms = platforms.filter(p => p.brand_id === brand.id);
      const brandPlatformIds = brandPlatforms.map(p => p.id);
      const brandModels = models.filter(m => brandPlatformIds.includes(m.platform_id));
      const brandModelIds = brandModels.map(m => m.id);
      
      let brandUnits = units.filter(u => brandModelIds.includes(u.model_id));
      if (selectedBranchId) {
        brandUnits = brandUnits.filter(u => u.store_id === selectedBranchId);
      }
      const brandUnitIds = brandUnits.map(u => u.id);

      const brandMetrics = metrics.filter(m => brandUnitIds.includes(m.equipment_id));

      const monthlyValues: Record<string, number | null> = {};
      let totalSum = 0;
      let countValidMonths = 0;

      months.forEach(m => {
        const monthRecords = brandMetrics.filter(rec => rec.period_month === m);
        if (monthRecords.length > 0) {
          const avg = monthRecords.reduce((acc, curr) => acc + curr.breakdown_rate, 0) / monthRecords.length;
          monthlyValues[m] = avg;
          totalSum += avg;
          countValidMonths++;
        } else {
          monthlyValues[m] = null;
        }
      });

      const overallAvg = countValidMonths > 0 ? totalSum / countValidMonths : null;

      // Platform sub-rows
      const platformRows = brandPlatforms
        .filter(p => !selectedPlatformId || p.id === selectedPlatformId)
        .map(plat => {
          const platModels = models.filter(m => m.platform_id === plat.id);
          const platModelIds = platModels.map(m => m.id);
          let platUnits = units.filter(u => platModelIds.includes(u.model_id));
          if (selectedBranchId) platUnits = platUnits.filter(u => u.store_id === selectedBranchId);
          const platUnitIds = platUnits.map(u => u.id);
          const platMetrics = metrics.filter(m => platUnitIds.includes(m.equipment_id));

          const platMonthlyValues: Record<string, number | null> = {};
          let platSum = 0;
          let platCount = 0;

          months.forEach(m => {
            const mRecs = platMetrics.filter(r => r.period_month === m);
            if (mRecs.length > 0) {
              const avg = mRecs.reduce((a, c) => a + c.breakdown_rate, 0) / mRecs.length;
              platMonthlyValues[m] = avg;
              platSum += avg;
              platCount++;
            } else {
              platMonthlyValues[m] = null;
            }
          });

          const platOverallAvg = platCount > 0 ? platSum / platCount : null;

          // Model sub-rows
          const modelRows = platModels.map(mod => {
            let modUnits = units.filter(u => u.model_id === mod.id);
            if (selectedBranchId) modUnits = modUnits.filter(u => u.store_id === selectedBranchId);
            const modUnitIds = modUnits.map(u => u.id);
            const modMetrics = metrics.filter(m => modUnitIds.includes(m.equipment_id));

            const modMonthlyValues: Record<string, number | null> = {};
            let modSum = 0;
            let modCount = 0;

            months.forEach(m => {
              const mRecs = modMetrics.filter(r => r.period_month === m);
              if (mRecs.length > 0) {
                const avg = mRecs.reduce((a, c) => a + c.breakdown_rate, 0) / mRecs.length;
                modMonthlyValues[m] = avg;
                modSum += avg;
                modCount++;
              } else {
                modMonthlyValues[m] = null;
              }
            });

            const modOverallAvg = modCount > 0 ? modSum / modCount : null;

            return {
              model: mod,
              units: modUnits,
              monthlyValues: modMonthlyValues,
              overallAvg: modOverallAvg
            };
          });

          return {
            platform: plat,
            monthlyValues: platMonthlyValues,
            overallAvg: platOverallAvg,
            modelRows
          };
        });

      return {
        brand,
        monthlyValues,
        overallAvg,
        platformRows
      };
    });

    // Grand Total Keseluruhan
    const grandMonthlyValues: Record<string, number | null> = {};
    let grandSum = 0;
    let grandCount = 0;

    months.forEach(m => {
      const mRecs = metrics.filter(r => r.period_month === m);
      if (mRecs.length > 0) {
        const avg = mRecs.reduce((a, c) => a + c.breakdown_rate, 0) / mRecs.length;
        grandMonthlyValues[m] = avg;
        grandSum += avg;
        grandCount++;
      } else {
        grandMonthlyValues[m] = null;
      }
    });

    const grandOverallAvg = grandCount > 0 ? grandSum / grandCount : null;

    return {
      months,
      brandRows,
      grandTotal: {
        monthlyValues: grandMonthlyValues,
        overallAvg: grandOverallAvg
      }
    };
  }

  // --- CRUD Operations ---
  public createBrand(data: Omit<EquipmentBrand, 'id' | 'created_at'>): EquipmentBrand {
    const newId = this.state.brands.length > 0 ? Math.max(...this.state.brands.map(b => b.id)) + 1 : 1;
    const newBrand: EquipmentBrand = {
      ...data,
      id: newId,
      created_at: new Date().toISOString()
    };
    this.state.brands.push(newBrand);
    this.saveState(this.state);
    return newBrand;
  }

  public createModel(data: Omit<EquipmentModel, 'id' | 'created_at'>): EquipmentModel {
    const newId = this.state.models.length > 0 ? Math.max(...this.state.models.map(m => m.id)) + 1 : 1;
    const newModel: EquipmentModel = {
      ...data,
      id: newId,
      created_at: new Date().toISOString()
    };
    this.state.models.push(newModel);
    this.saveState(this.state);
    return newModel;
  }

  public createEquipmentUnit(data: Omit<EquipmentUnit, 'id' | 'created_at'>): EquipmentUnit {
    const newId = this.state.equipment_units.length > 0 ? Math.max(...this.state.equipment_units.map(u => u.id)) + 1 : 1;
    const newUnit: EquipmentUnit = {
      ...data,
      id: newId,
      created_at: new Date().toISOString()
    };
    this.state.equipment_units.push(newUnit);
    this.saveState(this.state);
    return newUnit;
  }

  public recordMonthlyBreakdown(data: Omit<MonthlyBreakdownMetric, 'id' | 'created_at'>): MonthlyBreakdownMetric {
    const newId = this.state.monthly_metrics.length > 0 ? Math.max(...this.state.monthly_metrics.map(m => m.id)) + 1 : 1;
    const newMetric: MonthlyBreakdownMetric = {
      ...data,
      id: newId,
      created_at: new Date().toISOString()
    };
    this.state.monthly_metrics.push(newMetric);
    this.saveState(this.state);
    return newMetric;
  }

  // --- SQL Schema & Migration DDL Exporter ---
  public generateSQLSchema(): string {
    return `-- =============================================================================
-- ENTERPRISE ASSET MANAGEMENT & FAILURE RATE RELATIONAL SCHEMA (3NF)
-- Compatible with PostgreSQL 14+, MySQL 8.0+, Supabase, Cloud SQL
-- =============================================================================

CREATE TABLE equipment_brands (
    id SERIAL PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    country_origin VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_platforms (
    id SERIAL PRIMARY KEY,
    brand_id INT NOT NULL REFERENCES equipment_brands(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    unit_type VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_models (
    id SERIAL PRIMARY KEY,
    platform_id INT NOT NULL REFERENCES equipment_platforms(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    rated_capacity VARCHAR(100),
    power_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_branches (
    id SERIAL PRIMARY KEY,
    store_code VARCHAR(32) UNIQUE NOT NULL,
    store_name VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    is_warehouse BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_units (
    id SERIAL PRIMARY KEY,
    eq_number VARCHAR(64) UNIQUE NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    model_id INT NOT NULL REFERENCES equipment_models(id) ON DELETE RESTRICT,
    store_id INT NOT NULL REFERENCES equipment_branches(id) ON DELETE RESTRICT,
    status VARCHAR(32) DEFAULT 'operational',
    year_manufactured INT NOT NULL,
    total_operating_hours NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE monthly_breakdown_metrics (
    id SERIAL PRIMARY KEY,
    equipment_id INT NOT NULL REFERENCES equipment_units(id) ON DELETE CASCADE,
    period_year INT NOT NULL,
    period_month VARCHAR(16) NOT NULL,
    breakdown_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    total_scheduled_hours NUMERIC(8,2) NOT NULL DEFAULT 70,
    pm_count INT NOT NULL DEFAULT 0,
    cm_count INT NOT NULL DEFAULT 0,
    breakdown_rate NUMERIC(6,4) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_equipment_month UNIQUE(equipment_id, period_year, period_month)
);

-- CREATE HIGH-PERFORMANCE INDEXES FOR FAST RESPONSE IN LARGE DATASETS
CREATE INDEX idx_eq_model ON equipment_units(model_id);
CREATE INDEX idx_eq_store ON equipment_units(store_id);
CREATE INDEX idx_metrics_eq_period ON monthly_breakdown_metrics(equipment_id, period_year, period_month);
CREATE INDEX idx_platform_brand ON equipment_platforms(brand_id);
CREATE INDEX idx_model_platform ON equipment_models(platform_id);
`;
  }
}

export const failureRateDb = new FailureRateRelationalService();
