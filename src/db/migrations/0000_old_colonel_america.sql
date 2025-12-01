-- Create enum types first
CREATE TYPE "booking_payment_method" AS ENUM('wallet', 'cash');
--> statement-breakpoint
CREATE TYPE "booking_payment_status" AS ENUM('pending', 'paid', 'refunded');
--> statement-breakpoint
CREATE TYPE "booking_status" AS ENUM('confirmed', 'cancelled', 'completed');
--> statement-breakpoint
CREATE TYPE "booking_cancelled_by" AS ENUM('passenger', 'driver', 'system');
--> statement-breakpoint
CREATE TYPE "complaint_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');
--> statement-breakpoint
CREATE TYPE "fare_category" AS ENUM('Economy', 'Comfort', 'Premium');
--> statement-breakpoint
CREATE TYPE "message_status" AS ENUM('sent', 'delivered', 'read');
--> statement-breakpoint
CREATE TYPE "ride_request_status" AS ENUM('open', 'matched', 'cancelled', 'declined');
--> statement-breakpoint
CREATE TYPE "ride_request_response" AS ENUM('pending', 'accepted', 'declined');
--> statement-breakpoint
CREATE TYPE "ride_request_declined_by" AS ENUM('passenger', 'driver', 'system');
--> statement-breakpoint
CREATE TYPE "ride_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');
--> statement-breakpoint
CREATE TYPE "role" AS ENUM('admin', 'passenger', 'driver');
--> statement-breakpoint
CREATE TYPE "status" AS ENUM('active', 'blocked');
--> statement-breakpoint
CREATE TYPE "vehicle_status" AS ENUM('active', 'inactive');
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"ride_id" integer NOT NULL,
	"ride_request_id" integer,
	"passenger_id" integer NOT NULL,
	"driver_id" integer NOT NULL,
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
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer NOT NULL,
	"against_user_id" integer NOT NULL,
	"ride_id" integer NOT NULL,
	"description" text,
	"status" "complaint_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"ride_id" integer NOT NULL,
	"passenger_id" integer NOT NULL,
	"driver_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fares" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"message" text NOT NULL,
	"status" "message_status" DEFAULT 'sent' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" varchar(50),
	"user_id" integer,
	"email" varchar(255),
	"code" varchar(10) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ride_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"passenger_id" integer NOT NULL,
	"from_location" varchar(255) NOT NULL,
	"to_location" varchar(255) NOT NULL,
	"date_time" timestamp NOT NULL,
	"required_seats" integer NOT NULL,
	"approx_fare_per_seat" integer,
	"status" "ride_request_status" DEFAULT 'open' NOT NULL,
	"matched_driver_id" integer,
	"matched_ride_id" integer,
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
	"id" serial PRIMARY KEY NOT NULL,
	"driver_id" integer NOT NULL,
	"vehicle_id" integer NOT NULL,
	"from" varchar(255) NOT NULL,
	"to" varchar(255) NOT NULL,
	"departure_time" timestamp NOT NULL,
	"available_seats" integer NOT NULL,
	"booked_seats" integer DEFAULT 0,
	"passengers" integer[],
	"distance_km" integer,
	"status" "ride_status" DEFAULT 'scheduled' NOT NULL,
	"cancellation_reason" text,
	"cancelled_at" timestamp,
	"cancelled_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"cnic" varchar(13) NOT NULL,
	"city" varchar(255) NOT NULL,
	"district" varchar(255) NOT NULL,
	"country" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'passenger' NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"suspension_reason" text NOT NULL,
	"suspension_at" timestamp NOT NULL,
	"is_verified" boolean DEFAULT false,
	"profile_image" text,
	"is_driver_approved" boolean,
	"average_rating" integer DEFAULT 0,
	"total_ratings" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_cnic_unique" UNIQUE("cnic")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"driver_id" integer NOT NULL,
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
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_matched_driver_id_users_id_fk" FOREIGN KEY ("matched_driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_matched_ride_id_rides_id_fk" FOREIGN KEY ("matched_ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;