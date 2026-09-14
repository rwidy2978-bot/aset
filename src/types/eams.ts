export type RoleName = 
  | 'admin'
  | 'supervisor'
  | 'service_coordinator'
  | 'asset_specialist'
  | 'warehouse_specialist'
  | 'mechanic';

export interface Role {
  id: number;
  name: RoleName;
  display_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  role_id: number;
  role: RoleName;
  role_display_name: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export type DepreciationMethod = 'straight_line' | 'declining_balance';

export interface Category {
  id: number;
  code: string;
  name: string;
  useful_life_years: number;
  depreciation_method: DepreciationMethod;
  created_at?: string;
  updated_at?: string;
}

export type AssetStatus = 'warehouse' | 'deployed' | 'under_maintenance' | 'disposed';
export type ConditionStatus = 'good' | 'degraded' | 'critical' | 'damaged';

export interface Asset {
  id: number;
  category_id: number;
  category?: Category;
  asset_code: string;
  name: string;
  serial_number: string;
  purchase_date: string;
  purchase_cost: number;
  residual_value: number;
  current_book_value: number;
  status: AssetStatus;
  condition_status: ConditionStatus;
  current_location: string;
  assigned_user_id?: number | null;
  assigned_user?: User | null;
  image_url?: string;
  specs?: Record<string, string>;
  last_maintenance_date?: string;
  next_preventive_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SparePart {
  id: number;
  sku: string;
  name: string;
  unit: string;
  stock_qty: number;
  minimum_threshold: number;
  unit_cost: number;
  rack_location?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export type WorkOrderType = 'preventive' | 'corrective' | 'emergency';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';
export type WorkOrderStatus = 
  | 'draft'
  | 'assigned'
  | 'in_progress'
  | 'pending_parts'
  | 'completed'
  | 'approved'
  | 'rejected';

export interface WorkOrderItem {
  id: number;
  work_order_id: number;
  spare_part_id: number;
  spare_part_name?: string;
  spare_part_sku?: string;
  quantity_used: number;
  unit_cost: number;
  created_at?: string;
}

export interface MaintenanceChecklistTask {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface WorkOrder {
  id: number;
  wo_number: string;
  asset_id: number;
  asset?: Asset;
  coordinator_id: number;
  coordinator?: User;
  mechanic_id: number;
  mechanic?: User;
  supervisor_id?: number | null;
  supervisor?: User | null;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  issue_description: string;
  resolution_notes?: string;
  checklist?: MaintenanceChecklistTask[];
  items?: WorkOrderItem[];
  sla_hours?: number;
  due_date?: string;
  started_at?: string | null;
  completed_at?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export type MovementStatus = 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';

export interface AssetMovement {
  id: number;
  asset_id: number;
  asset?: Asset;
  from_location: string;
  to_location: string;
  requested_by: number;
  requester?: User;
  approved_by?: number | null;
  approver?: User | null;
  status: MovementStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  role: RoleName;
  action: string;
  entity_type: 'asset' | 'work_order' | 'spare_part' | 'asset_movement' | 'category' | 'user' | 'system' | 'inventory';
  entity_id: number | string;
  details: string;
  timestamp: string;
  created_at?: string;
  user_role?: string;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  ip_address?: string;
}

export interface DepreciationScheduleItem {
  monthIndex: number;
  date: string;
  beginningValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingBookValue: number;
}

// -------------------------------------------------------------
// RELATIONAL DATABASE SCHEMA: Failure Rate & Breakdown Architecture
// -------------------------------------------------------------

export interface EquipmentBrand {
  id: number;
  code: string;
  name: string;
  country_origin: string;
  description?: string;
  created_at: string;
}

export interface EquipmentPlatform {
  id: number;
  brand_id: number;
  brand?: EquipmentBrand;
  name: string;
  unit_type: 'AWP' | 'Forklift' | 'Genset' | 'Machinery' | 'Heavy Equipment';
  description?: string;
  created_at: string;
}

export interface EquipmentModel {
  id: number;
  platform_id: number;
  platform?: EquipmentPlatform;
  model_name: string;
  rated_capacity?: string;
  power_source?: string;
  created_at: string;
}

export interface EquipmentBranch {
  id: number;
  store_code: string;
  store_name: string;
  region: string;
  is_warehouse: boolean;
  created_at: string;
}

export interface EquipmentUnit {
  id: number;
  eq_number: string; // Unique Primary Identifer (e.g. EQ-AWP-BT26-01)
  serial_number: string;
  model_id: number;
  model?: EquipmentModel;
  store_id: number;
  store?: EquipmentBranch;
  status: 'operational' | 'breakdown' | 'in_maintenance' | 'standby';
  year_manufactured: number;
  total_operating_hours: number;
  created_at: string;
}

export interface MonthlyBreakdownMetric {
  id: number;
  equipment_id: number;
  equipment?: EquipmentUnit;
  period_year: number;
  period_month: 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'Mei' | 'Jun' | 'Jul' | 'Agu' | 'Sep' | 'Okt' | 'Nov' | 'Des';
  breakdown_hours: number;
  total_scheduled_hours: number;
  pm_count: number;
  cm_count: number;
  breakdown_rate: number; // e.g. 0.85 (85%)
  notes?: string;
  created_at: string;
}

