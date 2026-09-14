CREATE TYPE "wo_kind" AS ENUM('PM', 'CM');--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL CONSTRAINT "brands_name_unique" UNIQUE
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL CONSTRAINT "categories_name_unique" UNIQUE
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL CONSTRAINT "customers_name_unique" UNIQUE
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"equipment_number" text PRIMARY KEY,
	"commodity_name" text,
	"category_id" integer,
	"brand_id" integer,
	"model_id" integer,
	"store_id" integer,
	"project_id" integer,
	"ex_factory_time" date,
	"enabled_status" text,
	"rental_status" text,
	"location_status" text,
	"repair_status" text,
	"supplier_name" text,
	"acceptance_status" text,
	"main_engine_number" text,
	"engine_number" text,
	"gps_number" text,
	"last_connection_time" timestamp,
	"working_hours" numeric,
	"region" text,
	"equipment_property_rights" text,
	"arrival_date" date,
	"nameplate_number" text,
	"video_terminal_number" text,
	"gps_binding" boolean,
	"site_name" text,
	"is_inefficient" boolean,
	"scheduling_attribution_name" text,
	"service_attribution_name" text,
	"business_department" text,
	"business_line" text,
	"license_number" text,
	"asset_classification" text,
	"bd_binary" boolean
);
--> statement-breakpoint
CREATE TABLE "hour_meter_readings" (
	"id" serial PRIMARY KEY,
	"equipment_number" text NOT NULL,
	"period_id" integer NOT NULL,
	"hours_reading" numeric,
	CONSTRAINT "hour_meter_equipment_period_unique" UNIQUE("equipment_number","period_id")
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" serial PRIMARY KEY,
	"brand_id" integer NOT NULL,
	"category_id" integer,
	"code" text NOT NULL,
	"platform_height" text,
	CONSTRAINT "models_brand_code_unique" UNIQUE("brand_id","code")
);
--> statement-breakpoint
CREATE TABLE "periods" (
	"id" serial PRIMARY KEY,
	"year" integer NOT NULL,
	"month_number" integer NOT NULL,
	"month_code" text NOT NULL,
	"end_of_month" date,
	CONSTRAINT "periods_year_month_unique" UNIQUE("year","month_number")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL CONSTRAINT "projects_name_unique" UNIQUE,
	"address" text,
	"customer_id" integer
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL CONSTRAINT "stores_code_unique" UNIQUE,
	"full_name" text NOT NULL,
	"business_department" text,
	"business_line" text,
	"region" text,
	"is_warehouse" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL CONSTRAINT "technicians_username_unique" UNIQUE,
	"full_name" text NOT NULL,
	"position" text
);
--> statement-breakpoint
CREATE TABLE "tire_specifications" (
	"id" serial PRIMARY KEY,
	"category_id" integer,
	"brand_id" integer,
	"model_label" text,
	"tire_type" text,
	"qty_front" integer,
	"qty_rear" integer
);
--> statement-breakpoint
CREATE TABLE "tire_stock" (
	"id" serial PRIMARY KEY,
	"tire_spec_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "tire_stock_spec_store_unique" UNIQUE("tire_spec_id","store_id")
);
--> statement-breakpoint
CREATE TABLE "work_order_cm_details" (
	"no_wo" text PRIMARY KEY,
	"first_responsible_id" integer,
	"auxiliary_1_id" integer,
	"auxiliary_2_id" integer,
	"response_duration_hours" numeric,
	"transit_duration_hours" numeric,
	"repair_duration_hours" numeric,
	"mttr_hours" numeric,
	"mtbf_hours" numeric,
	"evaluation_overall" text,
	"evaluation_service_attitude" text,
	"evaluation_repair_quality" text,
	"evaluation_timeliness" text,
	"evaluation_remarks" text
);
--> statement-breakpoint
CREATE TABLE "work_order_parts" (
	"id" serial PRIMARY KEY,
	"no_wo" text NOT NULL,
	"part_number" text,
	"part_name" text,
	"quantity" numeric,
	"treatment_method" text
);
--> statement-breakpoint
CREATE TABLE "work_order_pm_details" (
	"no_wo" text PRIMARY KEY,
	"dispatched_by_id" integer,
	"reviewed_by_id" integer,
	"reviewer_position" text,
	"approved_on_time" boolean,
	"actual_hours" numeric,
	"standard_hours" numeric,
	"approved_hours" numeric,
	"handover_mode" text,
	"field_type" text,
	"executor_count" integer
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"no_wo" text PRIMARY KEY,
	"equipment_number" text NOT NULL,
	"store_id" integer,
	"customer_id" integer,
	"period_id" integer,
	"dispatcher_id" integer,
	"head_id" integer,
	"wo_type_detail" text,
	"pm_cm" "wo_kind" NOT NULL,
	"cm_location" text,
	"wo_date" date,
	"wo_status" text,
	"start_breakdown" timestamp,
	"finish_breakdown" timestamp,
	"breakdown_duration_hours" numeric,
	"pm_completed" boolean,
	"cm_completed" boolean,
	"pm_voided" boolean,
	"cm_voided" boolean,
	"breakdown_unit" boolean,
	"breakdown_over_7days" boolean,
	"pm_duration_hours" numeric,
	"failure_phenomenon" text,
	"remarks" text,
	"contract_number" text,
	"customer_confirmation_status" text
);
--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id");--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_brand_id_brands_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id");--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_model_id_models_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id");--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id");--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "hour_meter_readings" ADD CONSTRAINT "hour_meter_readings_d9ZzqjZDrVcZ_fkey" FOREIGN KEY ("equipment_number") REFERENCES "equipment"("equipment_number");--> statement-breakpoint
ALTER TABLE "hour_meter_readings" ADD CONSTRAINT "hour_meter_readings_period_id_periods_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("id");--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_brand_id_brands_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id");--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "tire_specifications" ADD CONSTRAINT "tire_specifications_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id");--> statement-breakpoint
ALTER TABLE "tire_specifications" ADD CONSTRAINT "tire_specifications_brand_id_brands_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id");--> statement-breakpoint
ALTER TABLE "tire_stock" ADD CONSTRAINT "tire_stock_tire_spec_id_tire_specifications_id_fkey" FOREIGN KEY ("tire_spec_id") REFERENCES "tire_specifications"("id");--> statement-breakpoint
ALTER TABLE "tire_stock" ADD CONSTRAINT "tire_stock_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id");--> statement-breakpoint
ALTER TABLE "work_order_cm_details" ADD CONSTRAINT "work_order_cm_details_no_wo_work_orders_no_wo_fkey" FOREIGN KEY ("no_wo") REFERENCES "work_orders"("no_wo");--> statement-breakpoint
ALTER TABLE "work_order_cm_details" ADD CONSTRAINT "work_order_cm_details_first_responsible_id_technicians_id_fkey" FOREIGN KEY ("first_responsible_id") REFERENCES "technicians"("id");--> statement-breakpoint
ALTER TABLE "work_order_cm_details" ADD CONSTRAINT "work_order_cm_details_auxiliary_1_id_technicians_id_fkey" FOREIGN KEY ("auxiliary_1_id") REFERENCES "technicians"("id");--> statement-breakpoint
ALTER TABLE "work_order_cm_details" ADD CONSTRAINT "work_order_cm_details_auxiliary_2_id_technicians_id_fkey" FOREIGN KEY ("auxiliary_2_id") REFERENCES "technicians"("id");--> statement-breakpoint
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_no_wo_work_orders_no_wo_fkey" FOREIGN KEY ("no_wo") REFERENCES "work_orders"("no_wo");--> statement-breakpoint
ALTER TABLE "work_order_pm_details" ADD CONSTRAINT "work_order_pm_details_no_wo_work_orders_no_wo_fkey" FOREIGN KEY ("no_wo") REFERENCES "work_orders"("no_wo");--> statement-breakpoint
ALTER TABLE "work_order_pm_details" ADD CONSTRAINT "work_order_pm_details_dispatched_by_id_technicians_id_fkey" FOREIGN KEY ("dispatched_by_id") REFERENCES "technicians"("id");--> statement-breakpoint
ALTER TABLE "work_order_pm_details" ADD CONSTRAINT "work_order_pm_details_reviewed_by_id_technicians_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "technicians"("id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_equipment_number_equipment_equipment_number_fkey" FOREIGN KEY ("equipment_number") REFERENCES "equipment"("equipment_number");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_period_id_periods_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_dispatcher_id_technicians_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES "technicians"("id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_head_id_technicians_id_fkey" FOREIGN KEY ("head_id") REFERENCES "technicians"("id");