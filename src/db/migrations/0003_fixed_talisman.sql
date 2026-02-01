ALTER TABLE "rides" ADD COLUMN "date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "departure_time";