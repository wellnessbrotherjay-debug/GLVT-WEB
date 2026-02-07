-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "sch_mp_hrms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"band_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"device_model" text
);
--> statement-breakpoint
CREATE TABLE "sch_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"birthday" timestamp,
	"photo_url" text,
	"gender" text,
	"weight_kg" text,
	"join_date" timestamp DEFAULT now(),
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"user_id" integer,
	"height_cm" text,
	"waiver_signed" boolean DEFAULT false NOT NULL,
	"waiver_signed_date" timestamp,
	"venue_id" integer,
	CONSTRAINT "sch_members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sch_class_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"service_type" text NOT NULL,
	"category" text,
	"image_url" text,
	"mobile_image_url" text,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"capacity" integer DEFAULT 10 NOT NULL,
	"venue_id" integer
);
--> statement-breakpoint
CREATE TABLE "sch_class_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" integer NOT NULL,
	"staff_id" integer,
	"venue_id" integer,
	"start_time" timestamp NOT NULL,
	"room" text NOT NULL,
	"capacity" integer NOT NULL,
	"enforce_cancellation_policy" boolean DEFAULT false NOT NULL,
	"late_cancel_minutes" integer DEFAULT 720 NOT NULL,
	"late_booking_minutes" integer DEFAULT 0 NOT NULL,
	"current_block" text,
	"cancelled" boolean DEFAULT false NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "sch_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_whatsapp" text,
	"member_id" integer,
	"service_type" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"duration_minutes" integer NOT NULL,
	"staff_id" integer,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"is_manual_mode" boolean DEFAULT false NOT NULL,
	"manual_shift_start" text,
	"manual_shift_hours" integer,
	"room_number" text,
	"venue_id" integer,
	"class_id" integer,
	"schedule_id" integer,
	"membership_id" integer,
	"hrm_id" integer,
	"payment_status" text DEFAULT 'none' NOT NULL,
	"price_cents" integer,
	"coupon" text,
	"cancelled_at" timestamp,
	"attended_at" timestamp,
	"payment_raw" text,
	"payment_type" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sch_member_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"height" integer,
	"weight" integer,
	"weight_kg" text,
	"body_fat_percentage" text,
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sch_mp_heart_rate_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"hrm_id" integer,
	"data_raw" text,
	"data_summary" text,
	"graph_data" text,
	"zone_graph_data" text,
	"combined_graph_data" text,
	"captured_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sch_mp_banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"image_url" text,
	"link_url" text,
	"current" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sch_mp_coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"discount_type" text DEFAULT 'fixed' NOT NULL,
	"discount_value" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "sch_mp_coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sch_mp_hrm_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"booking_id" integer,
	"member_id" integer,
	"hrm_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"released_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sch_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"voucher_signed_date" timestamp,
	"payment_status" text DEFAULT 'none' NOT NULL,
	"price_cents" integer,
	"coupon" text,
	"vouchers_remaining" integer,
	"membership_type_id" integer,
	"access_facilities" boolean DEFAULT false NOT NULL,
	"drinks_discount_pct" integer DEFAULT 0 NOT NULL,
	"qr_code" text,
	"payment_raw" text,
	"notes" text,
	"venue_id" integer
);
--> statement-breakpoint
CREATE TABLE "sch_mp_membership_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cn_name" text,
	"duration_days" integer DEFAULT 30 NOT NULL,
	"vouchers" integer DEFAULT 0 NOT NULL,
	"bookings_per_day" integer DEFAULT 1 NOT NULL,
	"is_trial" boolean DEFAULT false NOT NULL,
	"is_limited" boolean DEFAULT false NOT NULL,
	"is_class_pack" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"access_facilities" boolean DEFAULT false NOT NULL,
	"drinks_discount_pct" integer DEFAULT 0 NOT NULL,
	"perks" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sch_mp_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sch_mp_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "sch_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user',
	"name" text,
	CONSTRAINT "sch_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "sch_mp_session_queues" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sch_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"color" text DEFAULT '#3b82f6' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"venue_id" integer
);
--> statement-breakpoint
CREATE TABLE "sch_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_id" integer NOT NULL,
	"date" text NOT NULL,
	"shift" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sch_venues" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" text
);
--> statement-breakpoint
CREATE TABLE "sch_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"venue_id" integer,
	"room_type" text,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"allocated_service_type" text,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "sch_members" ADD CONSTRAINT "sch_members_user_id_sch_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sch_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_members" ADD CONSTRAINT "sch_members_venue_id_sch_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."sch_venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_class_definitions" ADD CONSTRAINT "sch_class_definitions_venue_id_sch_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."sch_venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_class_schedules" ADD CONSTRAINT "sch_class_schedules_class_id_sch_class_definitions_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."sch_class_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_class_schedules" ADD CONSTRAINT "sch_class_schedules_staff_id_sch_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."sch_staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_class_schedules" ADD CONSTRAINT "sch_class_schedules_venue_id_sch_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."sch_venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_bookings" ADD CONSTRAINT "sch_bookings_member_id_sch_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."sch_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_bookings" ADD CONSTRAINT "sch_bookings_staff_id_sch_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."sch_staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_bookings" ADD CONSTRAINT "sch_bookings_venue_id_sch_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."sch_venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_bookings" ADD CONSTRAINT "sch_bookings_class_id_sch_class_definitions_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."sch_class_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_bookings" ADD CONSTRAINT "sch_bookings_schedule_id_sch_class_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."sch_class_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_bookings" ADD CONSTRAINT "sch_bookings_membership_id_sch_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."sch_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_bookings" ADD CONSTRAINT "sch_bookings_hrm_id_sch_mp_hrms_id_fk" FOREIGN KEY ("hrm_id") REFERENCES "public"."sch_mp_hrms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_member_stats" ADD CONSTRAINT "sch_member_stats_member_id_sch_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."sch_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_mp_heart_rate_data" ADD CONSTRAINT "sch_mp_heart_rate_data_booking_id_sch_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."sch_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_mp_heart_rate_data" ADD CONSTRAINT "sch_mp_heart_rate_data_hrm_id_sch_mp_hrms_id_fk" FOREIGN KEY ("hrm_id") REFERENCES "public"."sch_mp_hrms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_mp_hrm_assignments" ADD CONSTRAINT "sch_mp_hrm_assignments_schedule_id_sch_class_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."sch_class_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_mp_hrm_assignments" ADD CONSTRAINT "sch_mp_hrm_assignments_booking_id_sch_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."sch_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_mp_hrm_assignments" ADD CONSTRAINT "sch_mp_hrm_assignments_member_id_sch_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."sch_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_mp_hrm_assignments" ADD CONSTRAINT "sch_mp_hrm_assignments_hrm_id_sch_mp_hrms_id_fk" FOREIGN KEY ("hrm_id") REFERENCES "public"."sch_mp_hrms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_memberships" ADD CONSTRAINT "sch_memberships_member_id_sch_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."sch_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_memberships" ADD CONSTRAINT "sch_memberships_venue_id_sch_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."sch_venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_mp_session_queues" ADD CONSTRAINT "sch_mp_session_queues_schedule_id_sch_class_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."sch_class_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_mp_session_queues" ADD CONSTRAINT "sch_mp_session_queues_member_id_sch_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."sch_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_staff" ADD CONSTRAINT "sch_staff_venue_id_sch_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."sch_venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_schedules" ADD CONSTRAINT "sch_schedules_staff_id_sch_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."sch_staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sch_rooms" ADD CONSTRAINT "sch_rooms_venue_id_sch_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."sch_venues"("id") ON DELETE no action ON UPDATE no action;
*/