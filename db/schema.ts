import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  date,
  timestamp,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

// -------------------------------------------------------------
// ENUMS
// -------------------------------------------------------------

export const woKindEnum = pgEnum("wo_kind", ["PM", "CM"]);

// -------------------------------------------------------------
// LOOKUP / REFERENCE TABLES
// -------------------------------------------------------------

export const periods = pgTable(
  "periods",
  {
    id: serial().primaryKey(),
    year: integer("year").notNull(),
    monthNumber: integer("month_number").notNull(), // 1-12
    monthCode: text("month_code").notNull(), // e.g. "Jan", "Agu", "Mei"
    endOfMonth: date("end_of_month"),
  },
  (t) => [unique("periods_year_month_unique").on(t.year, t.monthNumber)],
);

export const stores = pgTable(
  "stores",
  {
    id: serial().primaryKey(),
    code: text("code").notNull(), // short store code, e.g. "West Jakarta_AWP"
    fullName: text("full_name").notNull(), // e.g. "Overseas Business Dept.-Equipment Business Store(West Jakarta)"
    businessDepartment: text("business_department"),
    businessLine: text("business_line"),
    region: text("region"),
    isWarehouse: boolean("is_warehouse").notNull().default(false),
  },
  (t) => [unique("stores_code_unique").on(t.code)],
);

export const brands = pgTable(
  "brands",
  {
    id: serial().primaryKey(),
    name: text("name").notNull(),
  },
  (t) => [unique("brands_name_unique").on(t.name)],
);

export const categories = pgTable(
  "categories",
  {
    id: serial().primaryKey(),
    name: text("name").notNull(),
  },
  (t) => [unique("categories_name_unique").on(t.name)],
);

export const models = pgTable(
  "models",
  {
    id: serial().primaryKey(),
    brandId: integer("brand_id")
      .notNull()
      .references(() => brands.id),
    categoryId: integer("category_id").references(() => categories.id),
    code: text("code").notNull(), // model code, e.g. "CPD50L"
    platformHeight: text("platform_height"),
  },
  (t) => [unique("models_brand_code_unique").on(t.brandId, t.code)],
);

export const customers = pgTable(
  "customers",
  {
    id: serial().primaryKey(),
    name: text("name").notNull(),
  },
  (t) => [unique("customers_name_unique").on(t.name)],
);

export const projects = pgTable(
  "projects",
  {
    id: serial().primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    customerId: integer("customer_id").references(() => customers.id),
  },
  (t) => [unique("projects_name_unique").on(t.name)],
);

export const technicians = pgTable(
  "technicians",
  {
    id: serial().primaryKey(),
    username: text("username").notNull(),
    fullName: text("full_name").notNull(),
    position: text("position"),
  },
  (t) => [unique("technicians_username_unique").on(t.username)],
);

// -------------------------------------------------------------
// CORE ENTITY TABLES
// -------------------------------------------------------------

// Mirrors the "Eq Card" sheet — equipment master data.
export const equipment = pgTable("equipment", {
  equipmentNumber: text("equipment_number").primaryKey(), // e.g. "IDNSHX-0902931CPD50L"
  commodityName: text("commodity_name"),
  categoryId: integer("category_id").references(() => categories.id),
  brandId: integer("brand_id").references(() => brands.id),
  modelId: integer("model_id").references(() => models.id),
  storeId: integer("store_id").references(() => stores.id), // Asset attribution store
  projectId: integer("project_id").references(() => projects.id),
  exFactoryTime: date("ex_factory_time"),
  enabledStatus: text("enabled_status"),
  rentalStatus: text("rental_status"),
  locationStatus: text("location_status"),
  repairStatus: text("repair_status"),
  supplierName: text("supplier_name"),
  acceptanceStatus: text("acceptance_status"),
  mainEngineNumber: text("main_engine_number"),
  engineNumber: text("engine_number"),
  gpsNumber: text("gps_number"),
  lastConnectionTime: timestamp("last_connection_time"),
  workingHours: numeric("working_hours"),
  region: text("region"),
  equipmentPropertyRights: text("equipment_property_rights"),
  arrivalDate: date("arrival_date"),
  nameplateNumber: text("nameplate_number"),
  videoTerminalNumber: text("video_terminal_number"),
  gpsBinding: boolean("gps_binding"),
  siteName: text("site_name"),
  isInefficient: boolean("is_inefficient"),
  schedulingAttributionName: text("scheduling_attribution_name"),
  serviceAttributionName: text("service_attribution_name"),
  businessDepartment: text("business_department"),
  businessLine: text("business_line"),
  licenseNumber: text("license_number"),
  assetClassification: text("asset_classification"),
  bdBinary: boolean("bd_binary"),
});

// Mirrors the "Clean Table" sheet — the consolidated PM/CM work order fact table
// that Breakdown Rate, PM/CM Compliance, MTTR, Availability/Reliability Factor and
// re-BD are all computed FROM (those pivot reports are derived at query time, not stored).
export const workOrders = pgTable("work_orders", {
  noWo: text("no_wo").primaryKey(), // e.g. "QX2026081800977"
  equipmentNumber: text("equipment_number")
    .notNull()
    .references(() => equipment.equipmentNumber),
  storeId: integer("store_id").references(() => stores.id),
  customerId: integer("customer_id").references(() => customers.id),
  periodId: integer("period_id").references(() => periods.id),
  dispatcherId: integer("dispatcher_id").references(() => technicians.id),
  headId: integer("head_id").references(() => technicians.id),
  woTypeDetail: text("wo_type_detail"), // e.g. "Emergency repair dispatch"
  pmCm: woKindEnum("pm_cm").notNull(),
  cmLocation: text("cm_location"), // e.g. "Customer", "Data Center"
  woDate: date("wo_date"),
  woStatus: text("wo_status"),
  startBreakdown: timestamp("start_breakdown"),
  finishBreakdown: timestamp("finish_breakdown"),
  breakdownDurationHours: numeric("breakdown_duration_hours"),
  pmCompleted: boolean("pm_completed"),
  cmCompleted: boolean("cm_completed"),
  pmVoided: boolean("pm_voided"),
  cmVoided: boolean("cm_voided"),
  breakdownUnit: boolean("breakdown_unit"),
  breakdownOver7Days: boolean("breakdown_over_7days"),
  pmDurationHours: numeric("pm_duration_hours"),
  failurePhenomenon: text("failure_phenomenon"),
  remarks: text("remarks"),
  contractNumber: text("contract_number"),
  customerConfirmationStatus: text("customer_confirmation_status"),
});

// Extends work_orders 1:1 with fields unique to the "Data Center_PM" sheet.
export const workOrderPmDetails = pgTable("work_order_pm_details", {
  noWo: text("no_wo")
    .primaryKey()
    .references(() => workOrders.noWo),
  dispatchedById: integer("dispatched_by_id").references(() => technicians.id),
  reviewedById: integer("reviewed_by_id").references(() => technicians.id),
  reviewerPosition: text("reviewer_position"),
  approvedOnTime: boolean("approved_on_time"),
  actualHours: numeric("actual_hours"),
  standardHours: numeric("standard_hours"),
  approvedHours: numeric("approved_hours"),
  handoverMode: text("handover_mode"),
  fieldType: text("field_type"), // internal/external
  executorCount: integer("executor_count"),
});

// Extends work_orders 1:1 with fields unique to the "Data Center_CM" sheet.
export const workOrderCmDetails = pgTable("work_order_cm_details", {
  noWo: text("no_wo")
    .primaryKey()
    .references(() => workOrders.noWo),
  firstResponsibleId: integer("first_responsible_id").references(() => technicians.id),
  auxiliary1Id: integer("auxiliary_1_id").references(() => technicians.id),
  auxiliary2Id: integer("auxiliary_2_id").references(() => technicians.id),
  responseDurationHours: numeric("response_duration_hours"),
  transitDurationHours: numeric("transit_duration_hours"),
  repairDurationHours: numeric("repair_duration_hours"),
  mttrHours: numeric("mttr_hours"),
  mtbfHours: numeric("mtbf_hours"),
  evaluationOverall: text("evaluation_overall"),
  evaluationServiceAttitude: text("evaluation_service_attitude"),
  evaluationRepairQuality: text("evaluation_repair_quality"),
  evaluationTimeliness: text("evaluation_timeliness"),
  evaluationRemarks: text("evaluation_remarks"),
});

// Parts/components consumed on a CM work order (from "Data Center_CM").
export const workOrderParts = pgTable("work_order_parts", {
  id: serial().primaryKey(),
  noWo: text("no_wo")
    .notNull()
    .references(() => workOrders.noWo),
  partNumber: text("part_number"),
  partName: text("part_name"),
  quantity: numeric("quantity"),
  treatmentMethod: text("treatment_method"),
});

// Mirrors the "Total HM" sheet — monthly hour-meter reading per equipment.
export const hourMeterReadings = pgTable(
  "hour_meter_readings",
  {
    id: serial().primaryKey(),
    equipmentNumber: text("equipment_number")
      .notNull()
      .references(() => equipment.equipmentNumber),
    periodId: integer("period_id")
      .notNull()
      .references(() => periods.id),
    hoursReading: numeric("hours_reading"),
  },
  (t) => [unique("hour_meter_equipment_period_unique").on(t.equipmentNumber, t.periodId)],
);

// Mirrors the "tire forklift" sheet — tire specification per brand/category/model.
export const tireSpecifications = pgTable("tire_specifications", {
  id: serial().primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  brandId: integer("brand_id").references(() => brands.id),
  modelLabel: text("model_label"), // free-text model grouping, e.g. "S-60J, S65 & 660SJ"
  tireType: text("tire_type"), // e.g. "355/55D625"
  qtyFront: integer("qty_front"),
  qtyRear: integer("qty_rear"),
});

// Stock count of a tire spec at a given store.
export const tireStock = pgTable(
  "tire_stock",
  {
    id: serial().primaryKey(),
    tireSpecId: integer("tire_spec_id")
      .notNull()
      .references(() => tireSpecifications.id),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id),
    quantity: integer("quantity").notNull().default(0),
  },
  (t) => [unique("tire_stock_spec_store_unique").on(t.tireSpecId, t.storeId)],
);
