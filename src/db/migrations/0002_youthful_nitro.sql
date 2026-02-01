ALTER TABLE "rides" RENAME COLUMN "cancellatio    n_reason" TO "cancellation_reason";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "cnic" DROP NOT NULL;