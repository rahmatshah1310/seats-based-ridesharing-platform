CREATE TYPE "public"."booking_cancelled_by" AS ENUM('passenger', 'driver', 'system');--> statement-breakpoint
CREATE TYPE "public"."booking_payment_method" AS ENUM('wallet', 'cash');--> statement-breakpoint
CREATE TYPE "public"."booking_payment_status" AS ENUM('pending', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."complaint_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."driver_verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."fare_category" AS ENUM('Economy', 'Comfort', 'Premium');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('sent', 'delivered', 'read');--> statement-breakpoint
CREATE TYPE "public"."rating_score" AS ENUM('1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5');--> statement-breakpoint
CREATE TYPE "public"."ride_request_declined_by" AS ENUM('passenger', 'driver', 'system');--> statement-breakpoint
CREATE TYPE "public"."ride_request_response" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."ride_request_status" AS ENUM('open', 'matched', 'cancelled', 'declined');--> statement-breakpoint
CREATE TYPE "public"."ride_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'passenger', 'driver');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_id" uuid NOT NULL,
	"ride_request_id" uuid,
	"passenger_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"from_location" varchar(255) NOT NULL,
	"to_location" varchar(255) NOT NULL,
	"departure_time" timestamp NOT NULL,
	"seats" integer NOT NULL,
	"payment_method" "booking_payment_method" DEFAULT 'cash' NOT NULL,
	"payment_status" "booking_payment_status" DEFAULT 'pending' NOT NULL,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"cancellation_reason" text,
	"cancelled_at" timestamp,
	"cancelled_by" "booking_cancelled_by",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"against_user_id" uuid NOT NULL,
	"ride_id" uuid NOT NULL,
	"description" text,
	"status" "complaint_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_id" uuid NOT NULL,
	"passenger_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "driver_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"cnic" varchar(13) NOT NULL,
	"license_number" varchar(30) NOT NULL,
	"license_expiry" timestamp,
	"rating_average" numeric(2, 1) DEFAULT '0',
	"rating_count" integer DEFAULT 0,
	"verification_status" "driver_verification_status" DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp,
	"rejected_reason" varchar(500),
	"vehicle_model" varchar(255),
	"vehicle_color" varchar(255),
	"vehicle_name" varchar(255),
	"vehicle_number_plate" varchar(20),
	"is_complete" boolean DEFAULT false,
	"is_verified" boolean DEFAULT false,
	"applied_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "driver_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "driver_profiles_cnic_unique" UNIQUE("cnic"),
	CONSTRAINT "driver_profiles_license_number_unique" UNIQUE("license_number"),
	CONSTRAINT "driver_profiles_vehicle_number_plate_unique" UNIQUE("vehicle_number_plate")
);
--> statement-breakpoint
CREATE TABLE "fares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_location" varchar(255) NOT NULL,
	"to_location" varchar(255) NOT NULL,
	"category" "fare_category" NOT NULL,
	"distance_km" integer,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" "message_status" DEFAULT 'sent' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(50),
	"user_id" uuid,
	"email" varchar(255),
	"code" varchar(10) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "passenger_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"cnic" varchar(13),
	"city" varchar(255),
	"district" varchar(255),
	"country" varchar(255),
	"is_complete" boolean DEFAULT false,
	CONSTRAINT "passenger_profiles_cnic_unique" UNIQUE("cnic")
);
--> statement-breakpoint
CREATE TABLE "ride_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"passenger_id" uuid NOT NULL,
	"from_location" varchar(255) NOT NULL,
	"to_location" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"required_seats" integer NOT NULL,
	"approx_fare_per_seat" integer,
	"status" "ride_request_status" DEFAULT 'open' NOT NULL,
	"matched_driver_id" uuid,
	"matched_ride_id" uuid,
	"passenger_response" "ride_request_response" DEFAULT 'pending' NOT NULL,
	"driver_response" "ride_request_response" DEFAULT 'pending' NOT NULL,
	"declined_by" "ride_request_declined_by",
	"cancellation_reason" text,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"from" varchar(255) NOT NULL,
	"to" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"available_seats" integer NOT NULL,
	"booked_seats" integer DEFAULT 0,
	"passengers" uuid[],
	"distance_km" integer,
	"status" "ride_status" DEFAULT 'scheduled' NOT NULL,
	"cancellation_reason" text,
	"cancelled_at" timestamp,
	"cancelled_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"cnic" varchar(13),
	"city" varchar(255),
	"district" varchar(255),
	"country" varchar(255),
	"role" "role" DEFAULT 'passenger' NOT NULL,
	"vehicle_images" text[],
	"status" "status" DEFAULT 'active' NOT NULL,
	"suspension_reason" text,
	"suspension_at" timestamp,
	"is_verified" boolean DEFAULT false,
	"profile_image" text,
	"is_driver_approved" boolean DEFAULT false,
	"average_rating" integer DEFAULT 0,
	"total_ratings" integer DEFAULT 0,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_cnic_unique" UNIQUE("cnic")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" uuid NOT NULL,
	"car_type" varchar(255) NOT NULL,
	"car_name" varchar(255) NOT NULL,
	"car_model" varchar(255) NOT NULL,
	"year" integer,
	"color" varchar(255),
	"number_plate" varchar(255) NOT NULL,
	"seats" integer NOT NULL,
	"status" "vehicle_status" DEFAULT 'active' NOT NULL,
	"car_images" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ride_request_id_ride_requests_id_fk" FOREIGN KEY ("ride_request_id") REFERENCES "public"."ride_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_against_user_id_users_id_fk" FOREIGN KEY ("against_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passenger_profiles" ADD CONSTRAINT "passenger_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_matched_driver_id_users_id_fk" FOREIGN KEY ("matched_driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_matched_ride_id_rides_id_fk" FOREIGN KEY ("matched_ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;